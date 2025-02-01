from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from api.models import Stock
from api.serializers.stock_serializers import StockSerializer
from utils.finance import get_yahoo_data, calculate_limits

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
        
        yahoo_data = get_yahoo_data(asset_name)
        if not yahoo_data:
            return Response({"error": "Não foi possível obter dados do ativo."}, status=status.HTTP_400_BAD_REQUEST)
        
        # calcula os valores iniciais (PBT e limites)
        limits = calculate_limits(None, yahoo_data)
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
        
        yahoo_data = get_yahoo_data(stock.name)
        if not yahoo_data:
            return Response({"error": "Não foi possível obter dados do ativo."}, status=status.HTTP_400_BAD_REQUEST)
        
        limits = calculate_limits(float(stock.current_price), yahoo_data)
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
