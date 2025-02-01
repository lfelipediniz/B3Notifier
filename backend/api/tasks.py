from celery import shared_task
from django.utils import timezone
from api.models import Stock
from utils.finance import get_yahoo_data, calculate_limits

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
            stock.save()
            return f"{stock.name} atualizado com sucesso."
        else:
            return f"Variação insuficiente para atualizar {stock.name}."
    else:
        return f"Não foi possível obter dados para {stock.name}."

@shared_task
def check_and_update_stocks():
    # essa task é executada periodicamente (a cada minuto) e verifica quais ativos precisam ser atualizados, de acordo com a sua periodicidade
    now = timezone.now()
    stocks = Stock.objects.all()
    for stock in stocks:
        # calcula o tempo decorrido desde de a ultima atualizacao
        minutes_since_update = (now - stock.last_updated).total_seconds() / 60.0
        if minutes_since_update >= stock.periodicity:
            # dispara a task de atualização individual de forma assíncrona
            update_stock.delay(stock.id)
    return "Verificação concluída."
