from django.apps import AppConfig


class SeguridadYPersonalConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'seguridad_y_personal'

    def ready(self):
        import seguridad_y_personal.signals
