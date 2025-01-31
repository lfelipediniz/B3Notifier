from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.core.cache import cache
import os
import random
import resend
from dotenv import load_dotenv
from ..serializers.otp_serializers import EmailSerializer, OTPVerificationSerializer

load_dotenv()
resend.api_key = os.getenv("RESEND_API_KEY")

class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp_code = str(random.randint(100000, 999999))

            user_exists = User.objects.filter(email=email).exists()
            # salva o código OTP na cache (expira em 5 min)
            cache.set(f"otp_{email}", otp_code, timeout=300)

            # monta a mensagem de e-mail
            message = (
                f"Seu código de verificação é: <strong>{otp_code}</strong><br><br>"
            )
            if user_exists:
                message += (
                    "Já existe uma conta com este e-mail. Após verificar o código, "
                    "você poderá atualizar seu nome de usuário e senha."
                )
            else:
                message += "Use este código para continuar o cadastro da sua conta."

            # envia o e-mail usando Resend
            resend.Emails.send({
                "from": "no-reply@b3notifier.me",
                "to": email,
                "subject": "Código de Verificação",
                "html": f"<p>{message}</p>"
            })

            return Response(
                {"message": "Código enviado com sucesso!", "user_exists": user_exists},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            # ao chegar aqui, já passou pela validação de OTP
            # então podemos deletar da cache
            cache.delete(f"otp_{email}")
            return Response({"message": "Código verificado com sucesso!"},
                            status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)