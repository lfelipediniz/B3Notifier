from rest_framework import serializers
from api.models import Stock

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ['id', 'name', 'periodicity', 'current_price', 'lower_limit', 'upper_limit']
