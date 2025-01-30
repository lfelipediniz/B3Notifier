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
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

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
        serializer = UserSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            username = serializer.validated_data["username"]
            password = serializer.validated_data["password"]

            try:
                user = User.objects.get(email=email)
                # se o usuario ja existe, atualizamos o nome de usuario e senha
                user.username = username
                user.set_password(password)
                user.save()
                return Response({"message": "Usuário atualizado com sucesso!"}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                # se nao, criamos um novo usuario
                serializer.save()
                return Response({"message": "Conta criada com sucesso!"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)