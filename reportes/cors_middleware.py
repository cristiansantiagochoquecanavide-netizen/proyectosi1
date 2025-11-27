"""
Middleware personalizado para manejar CORS en endpoints de descarga
"""

class CORSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Manejar preflight requests (OPTIONS)
        if request.method == 'OPTIONS':
            response = self.get_response(request)
        else:
            response = self.get_response(request)

        # Añadir headers CORS a todas las respuestas
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-CSRFToken'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Max-Age'] = '86400'

        return response
