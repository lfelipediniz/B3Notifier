import os
from celery import Celery
from celery.schedules import crontab

# variavel de ambiente com as configs do Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
app = Celery('backend')
app.config_from_object('django.conf:settings', namespace='CELERY')

# descobre as tasks automaticamente em todos os apps registrados
app.autodiscover_tasks()

# cofigs de agendamento (Celery Beat)
app.conf.beat_schedule = {
    'check-stocks-every-minute': {
        'task': 'api.tasks.check_and_update_stocks_global', 
        'schedule': crontab(),  
    },
}
