from django import forms  # Formularios
from django.contrib.auth.models import User
from .models import Cita, Odontologo  # Modelos Cita y Odontologo

class CitaForm(forms.ModelForm):  # Form ligado a Cita
    class Meta:  # Configuración
        model = Cita  # Modelo objetivo
        fields = ['fecha', 'id_paciente', 'id_odontologo', 'estado']  # Campos editables en el form

class OdontologoForm(forms.ModelForm):
    username = forms.CharField(
        max_length=150,
        required=True,
        widget=forms.TextInput(attrs={"autocomplete": "off"})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password"}),
        required=True,
    )

    class Meta:
        model = Odontologo
        fields = ['username', 'password', 'nombre', 'especialidad', 'telefono', 'email']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Si es creación, todos los campos están vacíos
        if not self.instance.pk:
            for field in self.fields:
                self.fields[field].initial = ''
        # Si es edición, solo username se muestra y password vacío
        elif self.instance.user:
            self.fields['username'].initial = self.instance.user.username
            self.fields['password'].initial = ''

    def clean_username(self):
        username = self.cleaned_data.get('username')
        # En edición, permitir el mismo username del usuario asociado
        if self.instance.pk and getattr(self.instance, 'user', None):
            current_user = self.instance.user
            if current_user and current_user.username == username:
                return username
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError('Este nombre de usuario ya está en uso.')
        return username

    def save(self, commit=True):
        odontologo = super().save(commit=False)
        username = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')

        # Guardar username y password como texto plano (según solicitud)
        if not self.instance.pk:
            from django.contrib.auth.models import User
            user = User.objects.create(username=username, email=odontologo.email)
            # Guardar también el nombre del odontólogo en el User
            user.first_name = odontologo.nombre
            user.password = password
            user.save()
            odontologo.user = user
        else:
            if odontologo.user:
                user = odontologo.user
                if username:
                    user.username = username
                if password:
                    user.password = password  # Guardar como texto plano
                user.email = odontologo.email
                # Sincronizar el nombre del odontólogo con el User asociado
                user.first_name = odontologo.nombre
                user.save()
            elif username and password:
                from django.contrib.auth.models import User
                user = User.objects.create(username=username, email=odontologo.email)
                user.first_name = odontologo.nombre
                user.password = password
                user.save()
                odontologo.user = user

        if commit:
            odontologo.save()
        return odontologo
