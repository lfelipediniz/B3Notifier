from django.contrib.auth.models import User
from rest_framework.generics import ListAPIView
from .serializers import UserSerializer, EmailSerializer, OTPVerificationSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
import resend
from django.core.cache import cache
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from dotenv import load_dotenv
import random
import os

load_dotenv()
# configurando o resend para usar a API 
resend.api_key = os.getenv("RESEND_API_KEY")

# USANDO APENAS PARA TESTE - REMOVER DEPOIS!!!!!!
class UserListView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp_code = str(random.randint(100000, 999999))

            # ve se o usuario ja existe para decidir se envia o email de cadastro ou de atualizacao
            user_exists = User.objects.filter(email=email).exists()

            # salva o codigo OTP na cache (expira em 5 min)
            cache.set(f"otp_{email}", otp_code, timeout=300)

            # usando o resend pra enviar o email
            message = (
                f"Seu código de verificação é: <strong>{otp_code}</strong><br><br>"
            )

            if user_exists:
                message += "Já existe uma conta com este e-mail. Após verificar o código, você poderá atualizar seu nome de usuário e senha."
            else:
                message += "Use este código para continuar o cadastro da sua conta."

            resend.Emails.send({
                "from": "no-reply@b3notifier.me",
                "to": email,
                "subject": "Código de Verificação",
                "html": f"<p>{message}</p>"
            })

            return Response({
                "message": "Código enviado com sucesso!",
                "user_exists": user_exists
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny] 
    def post(self, request):
        serializer = OTPVerificationSerializer(data=request.data)
        if serializer.is_valid():
            cache.delete(f"otp_{serializer.validated_data['email']}")
            return Response({"message": "Código verificado com sucesso!"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserCreate(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        username = request.data.get("username")
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        # garantindo que o usuario nao digite a senha incorretamente
        if password != confirm_password:
            return Response(
                {"error": "As senhas não coincidem."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # buscar usuário pelo e-mail para ver se ele sera atualizado ou criado
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
            # criar novo usuario, verificando se o username pretendido já está em uso
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