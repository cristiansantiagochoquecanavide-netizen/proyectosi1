from django import forms  # Importa el módulo de formularios de Django
from .models import Usuario, Rol  # Importa los modelos locales para ModelForm

class LoginForm(forms.Form):  # Formulario NO ligado a modelo, útil para autenticación
    correo = forms.EmailField(label='Correo Electrónico')  # Campo de email con validación automática
    contrasena = forms.CharField(label='Contraseña', widget=forms.PasswordInput())  # Campo de contraseña con input tipo password

class UsuarioForm(forms.ModelForm):  # Formulario ligado al modelo Usuario
    class Meta:  # Configuración del ModelForm
        model = Usuario  # Indica el modelo al que se liga
        fields = ['nombre', 'correo', 'contrasena', 'estado']  # Campos del modelo que se van a exponer en el form

class RolForm(forms.ModelForm):  # Formulario ligado al modelo Rol
    class Meta:  # Configuración del ModelForm
        model = Rol  # Modelo asociado
        fields = ['nombre_rol', 'descripcion']  # Campos a exponer/editar
from django import forms  # Importa el módulo de formularios de Django
from .models import Usuario, Rol  # Importa los modelos locales para ModelForm

class LoginForm(forms.Form):  # Formulario NO ligado a modelo, útil para autenticación
    correo = forms.EmailField(label='Correo Electrónico')  # Campo de email con validación automática
    contrasena = forms.CharField(label='Contraseña', widget=forms.PasswordInput())  # Campo de contraseña con input tipo password

class UsuarioForm(forms.ModelForm):  # Formulario ligado al modelo Usuario
    class Meta:  # Configuración del ModelForm
        model = Usuario  # Indica el modelo al que se liga
        fields = ['nombre', 'correo', 'contrasena', 'estado']  # Campos del modelo que se van a exponer en el form

class RolForm(forms.ModelForm):  # Formulario ligado al modelo Rol
    class Meta:  # Configuración del ModelForm
        model = Rol  # Modelo asociado
        fields = ['nombre_rol', 'descripcion']  # Campos a exponer/editar
