import statistics
import requests
import os

# constantes pro calculo de limites
LIQUIDITY_THRESHOLD = 1000000      # volume ≥ 1.000.000 → alta liquidez
VOLATILITY_THRESHOLD = 2.0         # limite de volatilidade em %
UPDATE_PERCENTAGE = 1.0            # é para atualizar se variação do PBT for ≥ 1%

# os calculos foram baseados principalmente neste documento da B3:
# https://www.b3.com.br/data/files/B7/04/ED/E1/87A7061099BE5706790D8AA8/Metodologia-de-Calculo-de-Tuneis-de-Negociacao.pdf
# e no conteudo encaminhado no desafio

def get_stock_data(stock):
    # captura os dados da api do ALPHA VANTAGE pro ativo especificado
    API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={stock}&apikey={API_KEY}'
    
    try:
        response = requests.get(url)
        data = response.json()
    except Exception as e:
        print(f"Erro ao tentar acessar o ticker.info: {e}") 
        return None

    # ve se houve erro ou se foi atingido o limite de requests
    if "Error Message" in data or "Note" in data:
        print("Erro ou limite de requisições atingido, aguarde alguns minutos:", data)
        return None

    time_series = data.get("Time Series (Daily)")
    if not time_series:
        return None

    # pega os dados mais recentes do ativo
    sorted_dates = sorted(time_series.keys())
    last_date = sorted_dates[-1]
    last_data = time_series[last_date]

    try:
        last_traded_price = float(last_data.get("4. close"))
        volume = int(last_data.get("5. volume"))
    except (TypeError, ValueError) as e:
        print(f"Erro ao converter os dados do ativo: {e}")
        return None

    # como essa nova API nao fornece best bid e best offer, vamos pegar o último preço negociado
    best_bid = last_traded_price
    best_offer = last_traded_price

    historical_prices = []
    for date in sorted_dates:
        try:
            price = float(time_series[date].get("4. close"))
            historical_prices.append(price)
        except Exception as e:
            print(f"Erro ao processar o preço do dia {date}: {e}")
            continue

    if not historical_prices:
        historical_prices = [last_traded_price]
    return {
        'LTP': last_traded_price,
        'BestBid': best_bid,
        'BestOffer': best_offer,
        'Volume': volume,
        'HistoricalPrices': historical_prices
    }

def calculate_volatility(historical_prices):
    # calcula a volatilidade em % a partir de uma lista de precos historicos, com o desvio padrao da media
    if len(historical_prices) < 2:
        return 0 # nao ha volatilidade com um numero tao pequeno de precos
    
    mean_price = statistics.mean(historical_prices)
    std_dev = statistics.stdev(historical_prices)
    return (std_dev / mean_price) * 100

def calculate_limits(old_PBT, stock_data):
    # calcula o PBT (preço base de referencia) e os limites de compra e venda com base nos dados do yahoo 
    
    # para escolher o melhor metodo de calculo vamos nos basear na liquidez e volatilidade
    liquidity = "high" if stock_data.get('Volume') and stock_data['Volume'] >= LIQUIDITY_THRESHOLD else "low"
    volatility = calculate_volatility(stock_data['HistoricalPrices'])
    
    # determinando as bandas
    if liquidity == "high" and volatility <= VOLATILITY_THRESHOLD:
        calculation_method = "multiplicative"
        buy_band = -0.015  # -1,5%
        sell_band = 0.015  # +1,5%
    elif liquidity == "low" and volatility > VOLATILITY_THRESHOLD:
        calculation_method = "additive"
        buy_band = -0.15
        sell_band = 0.15
    else:
        calculation_method = "additive_points"
        buy_band = -1.5
        sell_band = 1.5
    
    # ultimo preco negociado do ativo
    LTP = stock_data['LTP']
    best_bid = stock_data['BestBid']
    best_offer = stock_data['BestOffer']

    # calculo do PBT 
    if best_bid <= LTP <= best_offer:
        PBT = LTP
    elif LTP < best_bid:
        PBT = best_bid
    else:
        PBT = best_offer

    if old_PBT:
        percentage_variation = abs(PBT - old_PBT) / old_PBT * 100
    else:
        percentage_variation = 100  # assume 100% de variacao pra forcar o update
    
    # nao atualiza se a variacao for insignificante
    if percentage_variation < UPDATE_PERCENTAGE:
        return None

    # calculo dos limites de compra e venda com base no metodo escolhido
    if calculation_method == "multiplicative":
        buy_limit = PBT * (1 + buy_band)
        sell_limit = PBT * (1 + sell_band)
    elif calculation_method == "additive":
        buy_limit = PBT + buy_band
        sell_limit = PBT + sell_band
    else:
        # additive_points (aditivo em pontos-base)
        buy_limit = PBT + (buy_band / 100)
        sell_limit = PBT + (sell_band / 100)
    
    return {
        'PBT': PBT,
        'buy_limit': round(buy_limit, 4),
        'sell_limit': round(sell_limit, 4),
        'volatility': volatility,
        'liquidity': liquidity
    }
