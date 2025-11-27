"""
Middleware personalizado para manejar CORS en todas las respuestas.
Este middleware se ejecuta después de las vistas y añade headers CORS.
"""

class CustomCORSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Procesar el request
        response = self.get_response(request)
        
        # Debug
        print(f"[CORS Middleware] Method: {request.method}, Path: {request.path}")
        
        # Añadir headers CORS a TODAS las respuestas
        origin = request.META.get('HTTP_ORIGIN', '')
        print(f"[CORS Middleware] Origin: {origin}")
        
        # Verificar si el origen es permitido
        allowed_origins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ]
        
        if origin in allowed_origins or origin.startswith('http://localhost:') or origin.startswith('http://127.0.0.1:'):
            print(f"[CORS Middleware] Adding CORS headers for origin: {origin}")
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD'
            response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with, cache-control'
            response['Access-Control-Expose-Headers'] = 'Content-Type, X-CSRFToken, Content-Disposition'
            response['Access-Control-Max-Age'] = '86400'  # 24 horas
        
        return response
