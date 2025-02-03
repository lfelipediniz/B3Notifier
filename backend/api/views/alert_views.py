from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from ..models import Alert
from ..serializers.alert_serializers import AlertCreateSerializer, AlertListSerializer

class AlertCreateView(APIView):
    # criando um alerta recebendo as infoemacoes e seu tipo
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AlertCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            alert = serializer.save()
            return Response(AlertListSerializer(alert).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserAlertListView(ListAPIView):
    # lista todos os alertas do usuario 
    permission_classes = [IsAuthenticated]
    serializer_class = AlertListSerializer

    def get_queryset(self):
        user = self.request.user
        return Alert.objects.filter(user=user).order_by('-timestamp')
