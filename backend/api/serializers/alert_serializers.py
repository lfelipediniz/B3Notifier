import datetime
from django.utils import timezone
from rest_framework import serializers
from api.models import Alert, Stock  

class AlertCreateSerializer(serializers.Serializer):
    asset_name = serializers.CharField(max_length=20)
    alert_type = serializers.ChoiceField(choices=Alert.ALERT_CHOICES)
    alert_date = serializers.DateField()
    alert_time = serializers.TimeField()

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user

        asset_name = validated_data.pop('asset_name')
        alert_date = validated_data.pop('alert_date')
        alert_time = validated_data.pop('alert_time')

        timestamp = datetime.datetime.combine(alert_date, alert_time)
        timestamp = timezone.make_aware(timestamp, timezone.get_current_timezone())

        # tenta getar o ativo pelo seu nome
        stock = Stock.objects.filter(user=user, name=asset_name).first()

        # salvamos tambem o nome do ativo, assim no caso de remoçao 
        # ainda temos o nome do ativo
        alert = Alert.objects.create(
            user=user,
            stock=stock,
            asset_name=asset_name,
            alert_type=validated_data['alert_type'],
            timestamp=timestamp
        )
        return alert

class AlertListSerializer(serializers.ModelSerializer):
    asset_name = serializers.SerializerMethodField()
    alert_date = serializers.SerializerMethodField()
    alert_time = serializers.SerializerMethodField()

    class Meta:
        model = Alert
        fields = ['id', 'asset_name', 'alert_type', 'alert_date', 'alert_time']

    def get_asset_name(self, obj):
        return obj.stock.name if obj.stock else obj.asset_name

    def get_alert_date(self, obj):
        local_ts = timezone.localtime(obj.timestamp)
        return local_ts.date()

    def get_alert_time(self, obj):
        local_ts = timezone.localtime(obj.timestamp)
        return local_ts.strftime("%H:%M")