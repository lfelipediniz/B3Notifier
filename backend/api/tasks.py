from celery import shared_task
from django.utils import timezone
from django.contrib.auth import get_user_model
from api.models import Stock
from utils.finance import get_yahoo_data, calculate_limits

User = get_user_model() # pega o model de usuario do Django para as taks serem por usuario
# essas tarefas sao executadas periodicamente pelo Celery, assim a gente garante que os ativos vao estar sempre atualizados
# importante destacar que ate agora estou usando o Redis como broker

@shared_task
def update_stock(stock_id):
    # essa task atualiza um ativo especifico
    try:
        stock = Stock.objects.get(id=stock_id)
    except Stock.DoesNotExist:
        return f"Stock {stock_id} não existe."

    yahoo_data = get_yahoo_data(stock.name)
    if yahoo_data:
        limits = calculate_limits(float(stock.current_price), yahoo_data)
        if limits:
            stock.current_price = limits['PBT']
            stock.lower_limit = limits['buy_limit']
            stock.upper_limit = limits['sell_limit']
            result = f"{stock.name} atualizado com sucesso."
        else:
            result = f"Variação insuficiente para atualizar {stock.name}."
    else:
        result = f"Não foi possível obter dados para {stock.name}."
    
    # atualiza a data da última verificao do ativo
    stock.last_updated = timezone.now()
    stock.save()
    return result

@shared_task
def check_and_update_stocks_for_user(user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return f"Usuário {user_id} não existe."

    now = timezone.now()
    stocks = Stock.objects.filter(user=user)
    for stock in stocks:
        # se  last_updated nao foi setado
        if not stock.last_updated:
            update_stock.delay(stock.id)
        else:
            minutes_since_update = (now - stock.last_updated).total_seconds() / 60.0
            if minutes_since_update >= stock.periodicity:
                # dispara a task de atualização individual de forma assíncrona
                update_stock.delay(stock.id)
    return f"Verificação concluída para o usuário {user.username}."


@shared_task
def check_and_update_stocks_global():
    # essa task é executada periodicamente (a cada minuto) e verifica quais ativos precisam ser atualizados

    # captura os ids de todos os usuários que tem pelo menos um stock
    user_ids = Stock.objects.values_list('user', flat=True).distinct()
    for user_id in user_ids:
        check_and_update_stocks_for_user.delay(user_id)
    return "Verificação global iniciada."
