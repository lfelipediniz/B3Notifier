from django.contrib.auth.models import User
from rest_framework import serializers
import random
from django.core.cache import cache

class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        # gerando o código OTP
        otp_code = str(random.randint(100000, 999999))
        cache.set(f"otp_{value}", otp_code, timeout=300)  # setando pra expirar em 5 min
        return value

class OTPVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)

    def validate(self, data):
        stored_otp = cache.get(f"otp_{data['email']}")
        if stored_otp is None or stored_otp != data["otp"]:
            raise serializers.ValidationError("Código inválido ou expirado.")
        return data

class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'confirm_password']
        extra_kwargs = {'password': {'write_only': True, 'required': True}}

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")  # tirando o campo extra na hora de criar o usuário
        user = User.objects.create_user(**validated_data)
        return user
