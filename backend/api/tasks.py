import os
import logging
from celery import shared_task
from django.utils import timezone
from django.contrib.auth import get_user_model
from api.models import Stock
from utils.finance import get_yahoo_data, calculate_limits
from dotenv import load_dotenv
import resend
from api.models import Alert

load_dotenv()
resend.api_key = os.getenv("RESEND_API_KEY")

User = get_user_model() # pega o model de usuario do Django para as taks serem por usuario
# essas tarefas sao executadas periodicamente pelo Celery, assim a gente garante que os ativos vao estar sempre atualizados
# importante destacar que ate agora estou usando o Redis como broker

def send_stock_notification(stock, alert_type):
    # envia um email para usuario de alerta de compra ou venda
    user_email = stock.user.email
    user_name = stock.user.username

    if alert_type == 'upper':
        subject = f"Recomendação: Vender {stock.name}"
        html_message = (
            f"<p>Olá, {user_name}!</p>"
            f"<p>O ativo <strong>{stock.name}</strong> atingiu o limite superior de "
            f"<strong>{stock.upper_limit:.2f}</strong>.<br>"
            f"Sua cotação atual é <strong>{stock.current_price:.2f}</strong>.<br>"
            f"Recomendamos que você avalie a venda deste ativo.</p>"
            f"<p>Atenciosamente,<br>B3Notifier</p>"
        )
        
        # substituindo o ponto por vírgula e formatando as casas decimais
        html_message = html_message.replace(f"{stock.upper_limit:.2f}", f"{stock.upper_limit:.2f}".replace('.', ','))
        html_message = html_message.replace(f"{stock.current_price:.2f}", f"{stock.current_price:.2f}".replace('.', ','))

    elif alert_type == 'lower':
        subject = f"Recomendação: Comprar {stock.name}"
        html_message = (
            f"<p>Olá, {user_name}!</p>"
            f"<p>O ativo <strong>{stock.name}</strong> atingiu o limite inferior de "
            f"<strong>{stock.lower_limit:.2f}</strong>.<br>"
            f"Sua cotação atual é <strong>{stock.current_price:.2f}</strong>.<br>"
            f"Recomendamos que você avalie a compra deste ativo.</p>"
            f"<p>Atenciosamente,<br>B3Notifier</p>"
        )

        html_message = html_message.replace(f"{stock.lower_limit:.2f}", f"{stock.lower_limit:.2f}".replace('.', ','))
        html_message = html_message.replace(f"{stock.current_price:.2f}", f"{stock.current_price:.2f}".replace('.', ','))
    else:
        print("Alerta Inválido.")
        return

    try:
        print(f"Enviando email para {user_email} ({alert_type}) sobre {stock.name}...")
        resend.Emails.send({
            "from": "no-reply@b3notifier.me",
            "to": user_email,
            "subject": subject,
            "html": html_message,
        })
        print(f"Email enviado com sucesso para {user_email} ({alert_type}) sobre {stock.name}.")
    except Exception as e:
        print(f"Erro ao enviar email para {user_email}: {e}")



@shared_task
def update_stock(stock_id):
    # essa task atualiza um ativo especifico
    # multiplos works competem pra enviar o email de alerta, 
    # entao a gente usa uma atualizacao atomica no banco de dados pra garantir que só um faça isso
    print(f"Iniciando atualização pro ativo ID {stock_id}...")
    try:
        stock = Stock.objects.get(id=stock_id)
    except Stock.DoesNotExist:
        print(f"Stock {stock_id} não encontrado.")
        return f"Stock {stock_id} não existe."

    # ativos fakes foram usados pra testar o sistema de envio de email, 
    # entao eles nao podem ser atualizados com dados da api do yahoo
    if not stock.fake:
        yahoo_data = get_yahoo_data(stock.name)
        if yahoo_data:
            limits = calculate_limits(float(stock.current_price), yahoo_data)
            if limits:
                stock.current_price = limits['PBT']
                stock.lower_limit = limits['buy_limit']
                stock.upper_limit = limits['sell_limit']
                print(f"Ativo {stock.name} atualizado com novos limites.")
            else:
                print(f"Variação insuficiente para atualizar {stock.name}.")
        else:
            print(f"Não foi possível obter dados para {stock.name}.")
            return f"Não foi possível obter dados para {stock.name}."
    else:
        print(f"Ativo {stock.name} é fake. Usando dados já existentes.")

    # atualiza a data da última verificao do ativo
    stock.last_updated = timezone.now()
    stock.save()

    print(f"Verificando limites pro ativo {stock.name}...")
    
    if stock.current_price >= stock.upper_limit:
        # usando um Operação atomica no BD
        # se alert_upper_sent ainda for False, marcamos como True
        # assim garantimos que só um worker vai enviar o email
        rows_updated = Stock.objects.filter(id=stock.id, alert_upper_sent=False).update(alert_upper_sent=True)
        if rows_updated == 1:
            print(f"Ativo {stock.name} atingiu o limite superior. Enviando alerta...")
            send_stock_notification(stock, alert_type='upper')
            
            # convertendo o timestamp para o timezone do usuario
            timestamp = timezone.localtime(timezone.now())
            try:
                # criando um alerta de venda no bd
                Alert.objects.create(
                    user=stock.user,
                    stock=stock,
                    asset_name=stock.name,
                    alert_type='sell_suggestion',  
                    timestamp=timestamp
                )
                print(f"Alerta de venda criado para {stock.name} com timestamp {timestamp}.")
            except Exception as e:
                print(f"Erro ao criar alerta de venda para {stock.name}: {e}")
        else:
            print(f"Alerta de venda para {stock.name} já foi enviado anteriormente.")
    
    elif stock.current_price <= stock.lower_limit:
        rows_updated = Stock.objects.filter(id=stock.id, alert_lower_sent=False).update(alert_lower_sent=True)
        if rows_updated == 1:
            print(f"Ativo {stock.name} atingiu o limite inferior. Enviando alerta...")
            send_stock_notification(stock, alert_type='lower')
            timestamp = timezone.localtime(timezone.now())
            try:
                Alert.objects.create(
                    user=stock.user,
                    stock=stock,
                    asset_name=stock.name,
                    alert_type='buy_suggestion',  
                    timestamp=timestamp
                )
                print(f"Alerta de compra criado para {stock.name} com timestamp {timestamp}.")
            except Exception as e:
                print(f"Erro ao criar alerta de compra para {stock.name}: {e}")
        else:
            print(f"Alerta de compra para {stock.name} já foi enviado anteriormente.")
    
    else:
        # se estiver dentro dos limites, resetamos os alertas
        if stock.alert_upper_sent or stock.alert_lower_sent:
            Stock.objects.filter(id=stock.id).update(alert_upper_sent=False, alert_lower_sent=False)
            print(f"{stock.name} voltou a ficar dentro dos limites. Resetando alertas.")

    print(f"Atualização concluída para {stock.name}.")
    return f"Atualização concluída para {stock.name}."


@shared_task
def check_and_update_stocks_for_user(user_id):
    # essa task verifica se os ativos de um usuario precisam ser atualizados
    print(f"Iniciando verificação dos ativos do usuário {user_id}...")
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        print(f"Usuário {user_id} não encontrado.")
        return f"Usuário {user_id} não existe."

    now = timezone.now()
    stocks = Stock.objects.filter(user=user)
    for stock in stocks:
        if not stock.last_updated:
            print(f"Agendando atualização para {stock.name} (sem histórico de atualização).")
            update_stock.delay(stock.id)
        else:
            minutes_since_update = (now - stock.last_updated).total_seconds() / 60.0
            if minutes_since_update >= stock.periodicity:
                print(f"Agendando atualização para {stock.name} (última atualização há {minutes_since_update:.2f} min).")
                update_stock.delay(stock.id)

    print(f"Verificação concluída pro usuário {user.username}.")
    return f"Verificação concluída para o usuário {user.username}."


@shared_task
def check_and_update_stocks_global():
    # essa task é executada periodicamente (a cada minuto) e verifica quais ativos precisam ser atualizados
    # disparando uma verificaçao individual para cada um
    
    # captura os ids de todos os usuários que tem pelo menos um stock
    print("Iniciando verificação global de ativos...") 
    user_ids = Stock.objects.values_list('user', flat=True).distinct()
    for user_id in user_ids:
        check_and_update_stocks_for_user.delay(user_id)

    print("Verificação global concluída.")
    return "Verificação global iniciada."
