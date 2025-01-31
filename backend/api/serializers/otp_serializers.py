from rest_framework import serializers
from django.core.cache import cache

class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()


class OTPVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)

    def validate(self, data):
        stored_otp = cache.get(f"otp_{data['email']}")
        if stored_otp is None or stored_otp != data["otp"]:
            raise serializers.ValidationError("Código inválido ou expirado.")
        return data
