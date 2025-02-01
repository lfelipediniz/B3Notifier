import yfinance as yf
import statistics

# constantes pro calculo de limites
LIQUIDITY_THRESHOLD = 1000000      # volume ≥ 1.000.000 → alta liquidez
VOLATILITY_THRESHOLD = 2.0         # limite de volatilidade em %
UPDATE_PERCENTAGE = 1.0            # é para atualizar se variação do PBT for ≥ 1%

# os calculos foram baseados principalmente neste documento da B3:
# https://www.b3.com.br/data/files/B7/04/ED/E1/87A7061099BE5706790D8AA8/Metodologia-de-Calculo-de-Tuneis-de-Negociacao.pdf
# e no conteudo encaminhado no desafio

def get_yahoo_data(stock):
    # captura os dados da api do Yahoo Finance pro ativo especificado
    ticker = yf.Ticker(stock)
    
    try:
        info = ticker.info  
    except Exception as e:
        print(f"Erro ao tentar acessar o ticker.info: {e}") 
        info = {}

    if not info:
        try:
            info = ticker.fast_info # tenta acessar o fast_info caso o info falhe
        except Exception as e:
            print(f"Erro ao tentar acessar o ticker.fast_info: {e}")  
            info = {}

    # get nos precos e volumes do ativo
    last_traded_price = info.get('regularMarketPrice') or info.get('lastPrice')
    volume = info.get('volume') or info.get('regularMarketVolume')
    best_bid = info.get('bid')
    best_offer = info.get('ask')
    
    # se nao tivermos essa informacao, tentamos pegar do historico
    if last_traded_price is None:
        hist_intraday = ticker.history(period="1d", interval="1m")
        if not hist_intraday.empty:
            last_traded_price = hist_intraday['Close'].iloc[-1]
    
    if last_traded_price is None:
        return None  # nao foi possivel obter o preço atual
    
    if best_bid is None:
        best_bid = last_traded_price
    if best_offer is None:
        best_offer = last_traded_price

    # pega o historico de precos do ativo usa o ultimo preco conhecido se nao tiver historico
    hist = ticker.history(period="1mo", interval="1d")
    historical_prices = hist['Close'].tolist() if not hist.empty else [last_traded_price]
    
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

def calculate_limits(old_PBT, yahoo_data):
    # calcula o PBT (preço base de referencia) e os limites de compra e venda com base nos dados do yahoo 
    
    # para escolher o melhor metodo de calculo vamos nos basear na liquidez e volatilidade
    liquidity = "high" if yahoo_data.get('Volume') and yahoo_data['Volume'] >= LIQUIDITY_THRESHOLD else "low"
    volatility = calculate_volatility(yahoo_data['HistoricalPrices'])
    
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
    LTP = yahoo_data['LTP']
    best_bid = yahoo_data['BestBid']
    best_offer = yahoo_data['BestOffer']

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
