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

    def __str__(self):
        return f"{self.name} - {self.user.username}"
