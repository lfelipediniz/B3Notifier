from django.db import models
from django.contrib.auth.models import User

class Stock(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stocks')
    name = models.CharField(max_length=20, help_text="Código do ativo, ex.: ITUB4.SA")
    periodicity = models.PositiveIntegerField(help_text="Frequência (em minutos) para verificação")
    current_price = models.DecimalField(max_digits=100, decimal_places=40, help_text="Cotação atual")
    lower_limit = models.DecimalField(max_digits=100, decimal_places=40, help_text="Limite inferior do túnel de preço")
    upper_limit = models.DecimalField(max_digits=100, decimal_places=40, help_text="Limite superior do túnel de preço")
    last_updated = models.DateTimeField(auto_now=True)
    fake = models.BooleanField(default=False)
    alert_upper_sent = models.BooleanField(default=False)
    alert_lower_sent = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.user.username}"


class Alert(models.Model): 
    ALERT_CHOICES = [
        ('buy_suggestion', 'Buy Suggestion'),
        ('sell_suggestion', 'Sell Suggestion'),
        ('addition', 'Addition'),
        ('removal', 'Removal'),
        ('edition', 'Edition'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alerts')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, null=True, blank=True, related_name='alerts')
    asset_name = models.CharField(max_length=20, blank=True, null=True)
    alert_type = models.CharField(max_length=20, choices=ALERT_CHOICES)
    timestamp = models.DateTimeField()

    def __str__(self):
        stock_info = self.stock.name if self.stock else (self.asset_name or "Ativo não especificado")
        return f"{self.get_alert_type_display()} para {stock_info} em {self.timestamp:%d/%m/%Y %H:%M:%S}"