from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token

# Vista utilitaria para exponer un token/cookie CSRF al frontend.
# - El decorador ensure_csrf_cookie fuerza a que Django envíe la cookie 'csrftoken'.
# - El frontend la leerá para enviar la cabecera X-CSRFToken en POST/PUT/PATCH/DELETE.


@ensure_csrf_cookie
def csrf_token(request):
    token = get_token(request)
    return JsonResponse({"csrfToken": token})
