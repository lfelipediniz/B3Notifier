from .celery import app as celery_app
# para o celery iniciar junto com o Django
__all__ = ('celery_app',)
