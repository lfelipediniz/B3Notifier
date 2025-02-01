import os
from celery import Celery

# variavel de ambiente com as configs do Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

app = Celery("backend")
app.config_from_object("django.conf:settings", namespace="CELERY")
# descobre as tasks automaticamente em todos os apps registrados
app.autodiscover_tasks()
