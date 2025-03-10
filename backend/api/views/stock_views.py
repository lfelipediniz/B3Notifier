from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import ListAPIView
from api.models import Stock
from api.serializers.stock_serializers import StockSerializer
from utils.finance import get_stock_data, calculate_limits
from datetime import timedelta
from django.utils import timezone

class StockCreateView(APIView):
    # cria um novo ativo na conta do usuario com base nos dados fornecidos e funcoes do utils.finance
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        asset_name = data.get('name')
        if not asset_name:
            return Response({"error": "O campo 'name' é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)
        
        # se o usuario ja monitora o ativo, retorna erro
        if Stock.objects.filter(user=request.user, name=asset_name).exists():
            return Response({"error": "Este ativo já está sendo monitorado."}, status=status.HTTP_400_BAD_REQUEST)
        
        stock_data = get_stock_data(asset_name)
        if not stock_data:
            return Response({"error": "Não foi possível obter dados do ativo."}, status=status.HTTP_400_BAD_REQUEST)
        
        # calcula os valores iniciais (PBT e limites)
        limits = calculate_limits(None, stock_data)
        if limits is None:
            return Response({"error": "Variação insuficiente para atualização."}, status=status.HTTP_400_BAD_REQUEST)
        
        data['current_price'] = limits['PBT']
        data['lower_limit'] = limits['buy_limit']
        data['upper_limit'] = limits['sell_limit']
        
        serializer = StockSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StockUpdateView(APIView):
    # atualiza os dados do ativo caso necessario
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            stock = Stock.objects.get(pk=pk, user=request.user)
        except Stock.DoesNotExist:
            return Response({"error": "Ativo não encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
        # da upadte ma periodicidade antes de calcular os novos valores
        new_periodicity = request.data.get("periodicity")
        if new_periodicity is not None:
            try:
                stock.periodicity = int(new_periodicity)
            except ValueError:
                return Response({"error": "A periodicidade tem que ser um número inteiro válido."}, status=status.HTTP_400_BAD_REQUEST)
        
        stock_data = get_stock_data(stock.name)
        if not stock_data:
            return Response({"error": "Não foi possível obter dados do ativo."}, status=status.HTTP_400_BAD_REQUEST)
        
        limits = calculate_limits(float(stock.current_price), stock_data)
        if limits is None:
            # mesmo a variaçao seja insuficiente, salvamos a nova periodicidade
            stock.save()
            serializer = StockSerializer(stock)
            return Response({"message": "Variação insuficiente para atualização.", "data": serializer.data}, status=status.HTTP_200_OK)
        
        # da update no ativo com os novos valores
        stock.current_price = limits['PBT']
        stock.lower_limit = limits['buy_limit']
        stock.upper_limit = limits['sell_limit']
        stock.save()
        serializer = StockSerializer(stock)
        return Response(serializer.data, status=status.HTTP_200_OK)

class StockListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StockSerializer

    def get_queryset(self):
        return Stock.objects.filter(user=self.request.user)

class StockDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            stock = Stock.objects.get(pk=pk, user=request.user)
        except Stock.DoesNotExist:
            return Response({"error": "Ativo não encontrado!"}, status=status.HTTP_404_NOT_FOUND)
        
        stock.delete()
        return Response({"message": "Ativo removido com sucesso!"}, status=status.HTTP_200_OK)

class StockProfileView(APIView):
    # busca um ativo pelo nome e retorna suas informações
    permission_classes = [IsAuthenticated]

    def get(self, request, name):
        try:
            stock = Stock.objects.get(user=request.user, name=name)
        except Stock.DoesNotExist:
            return Response({"error": "Ativo não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        serializer = StockSerializer(stock)
        return Response(serializer.data, status=status.HTTP_200_OK)

class StockQuoteView(APIView):
    # retorna informações do ativo com base nos dados do Yahoo Finance e calcula os limites de compra/venda
    permission_classes = [AllowAny]

    def get(self, request):
        asset_name = request.query_params.get("name")
        periodicity = request.query_params.get("periodicity")

        if not asset_name or not periodicity:
            return Response({"error": "Os parâmetros 'name' e 'periodicity' são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            periodicity = int(periodicity)
        except ValueError:
            return Response({"error": "A periodicidade deve ser um número inteiro válido."}, status=status.HTTP_400_BAD_REQUEST)
        
        # add .SA se não estiver presente
        if not asset_name.endswith(".SA"):
            asset_name += ".SA"

        stock_data = get_stock_data(asset_name)
        if not stock_data:
            return Response({"error": "Não foi possível obter dados do ativo."}, status=status.HTTP_400_BAD_REQUEST)

        # calcula os limites de compra e venda
        limits = calculate_limits(None, stock_data)
        if limits is None:
            return Response({"error": "Variação insuficiente para calcular os limites."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "name": asset_name,
            "current_price": stock_data['LTP'],
            "buy_limit": limits['buy_limit'],
            "sell_limit": limits['sell_limit'],
            "periodicity": periodicity
        }, status=status.HTTP_200_OK)

class StockUpdatesInfoView(APIView):
    # retorna a data da última atualização geral e a previsão da próxima atualizaçao
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stocks = Stock.objects.filter(user=request.user)

        if not stocks.exists():
            return Response({
                "message": "Nenhum ativo monitorado encontrado."
            }, status=status.HTTP_404_NOT_FOUND)

        # captura todas as ultimas atualizações dos ativos
        last_updates = [stock.last_updated for stock in stocks if stock.last_updated]

        if not last_updates:
            return Response({
                "message": "Nenhuma atualização registrada ainda."
            }, status=status.HTTP_404_NOT_FOUND)

        # útima atualizacao geral
        last_update_overall = max(last_updates)

        return Response({
            "last_update": last_update_overall.isoformat()
        }, status=status.HTTP_200_OK)
        
class StockTurnOnFakeView(APIView):
    # ativa o modo fake para um ativo
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):  
        try:
            stock = Stock.objects.get(pk=pk, user=request.user)
        except Stock.DoesNotExist:
            return Response({"error": "Ativo não encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
        stock.fake = True
        stock.save()
        serializer = StockSerializer(stock)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
# atualizar via input o limite inferior e superior do stock
class StockUpdateLimitsView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            stock = Stock.objects.get(pk=pk, user=request.user)
        except Stock.DoesNotExist:
            return Response({"error": "Ativo não encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
        new_lower_limit = request.data.get("lower_limit")
        new_upper_limit = request.data.get("upper_limit")
        
        if new_lower_limit is None and new_upper_limit is None:
            return Response({"error": "Pelo menos um dos limites deve ser fornecido."}, status=status.HTTP_400_BAD_REQUEST)
        
        if new_lower_limit is not None:
            stock.lower_limit = new_lower_limit
        if new_upper_limit is not None:
            stock.upper_limit = new_upper_limit
        
        stock.save()
        serializer = StockSerializer(stock)
        return Response(serializer.data, status=status.HTTP_200_OK)