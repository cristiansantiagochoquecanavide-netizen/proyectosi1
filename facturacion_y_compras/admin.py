from django.contrib import admin
from .models import *

for model in models.__dict__.values():
    if isinstance(model, type) and issubclass(model, admin.ModelAdmin):
        continue
    if isinstance(model, type) and hasattr(model, '_meta'):
        admin.site.register(model)
