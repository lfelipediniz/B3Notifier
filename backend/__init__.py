from .backend.celery import app as celery_app
# garante que o Django reconheça o app do Celery

__all__ = ("celery_app",)
