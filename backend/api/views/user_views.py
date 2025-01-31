from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.generics import ListAPIView

from ..serializers.user_serializers import UserSerializer
from ..serializers.user_serializers import (
    RegistrationSerializer
)

# usando apenas para testes - remover depois
class UserListView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class UserCreate(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            # se o e-mail já existe, atualizamos o usuário,
            # senão criamos um novo
            email = serializer.validated_data["email"]
            username = serializer.validated_data["username"]
            password = serializer.validated_data["password"]
            user = User.objects.filter(email=email).first()

            if user:
                # ver se o username pretendido já existe e pertence a outro usuário
                existing_user = User.objects.filter(username=username).first()
                if existing_user and existing_user.pk != user.pk:
                    return Response(
                        {"error": "Este nome de usuário já está em uso."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                user.username = username
                user.set_password(password)
                user.save()
                return Response(
                    {"message": "Usuário atualizado com sucesso!"},
                    status=status.HTTP_200_OK
                )
            else:
                # criar novo usuário, verificando se o username pretendido já está em uso
                if User.objects.filter(username=username).exists():
                    return Response(
                        {"error": "Este nome de usuário já está em uso."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                User.objects.create_user(
                    username=username,
                    email=email,
                    password=password
                )
                return Response(
                    {"message": "Conta criada com sucesso!"},
                    status=status.HTTP_201_CREATED
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
