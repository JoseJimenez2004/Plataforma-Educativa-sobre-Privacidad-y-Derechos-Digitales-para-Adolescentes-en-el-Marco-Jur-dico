class PerfilUsuario {
    constructor() {
        this.usuario = null;
        this.formulario = document.getElementById('formulario-password');
        this.init();
    }

    init() {
        this.verificarAutenticacion();
        this.cargarInformacionUsuario();
        this.inicializarEventos();
    }

    verificarAutenticacion() {
        this.usuario = JSON.parse(localStorage.getItem('usuario_cosecovi'));
        
        if (!this.usuario) {
            window.location.href = 'login.html';
            return;
        }
    }

    cargarInformacionUsuario() {
        document.getElementById('tipo-persona').textContent = 
            this.usuario.tipoPersona === 'estudiante' ? 'Estudiante' : 'Trabajador';
        document.getElementById('numero-identificacion').textContent = this.usuario.numeroIdentificacion;
        document.getElementById('nombre-usuario').textContent = this.usuario.nombre;
        document.getElementById('apellidos-usuario').textContent = this.usuario.apellidos;
        document.getElementById('email-usuario').textContent = this.usuario.email;
    }

    inicializarEventos() {
        this.formulario.addEventListener('submit', (e) => {
            e.preventDefault();
            this.cambiarPassword();
        });

        // Validación de confirmación de nueva contraseña
        document.getElementById('confirmar-password').addEventListener('input', (e) => {
            this.validarConfirmacionPassword();
        });
    }

    validarConfirmacionPassword() {
        const nuevaPassword = document.getElementById('nueva-password').value;
        const confirmacion = document.getElementById('confirmar-password').value;
        const errorDiv = document.getElementById('confirmar-password').parentNode.querySelector('.error-message');

        if (confirmacion && nuevaPassword !== confirmacion) {
            errorDiv.textContent = 'Las contraseñas no coinciden';
            errorDiv.style.display = 'block';
            return false;
        } else {
            errorDiv.style.display = 'none';
            return true;
        }
    }

    async cambiarPassword() {
        if (!this.validarFormularioPassword()) {
            this.mostrarError('Por favor completa todos los campos correctamente');
            return;
        }

        const datos = this.obtenerDatosPassword();

        try {
            this.mostrarCargando(true);
            
            const resultado = await this.verificarYActualizarPassword(datos);
            
            if (resultado.exito) {
                this.mostrarExito('Contraseña actualizada exitosamente');
                this.formulario.reset();
            } else {
                this.mostrarError(resultado.error);
            }
        } catch (error) {
            this.mostrarError('Error al actualizar la contraseña. Intenta nuevamente.');
        } finally {
            this.mostrarCargando(false);
        }
    }

    validarFormularioPassword() {
        let valido = true;

        // Validar campos requeridos
        const campos = this.formulario.querySelectorAll('[data-validate]');
        campos.forEach(campo => {
            if (!window.sistemaDenuncias.validarCampo(campo)) {
                valido = false;
            }
        });

        // Validar confirmación de contraseña
        if (!this.validarConfirmacionPassword()) {
            valido = false;
        }

        return valido;
    }

    obtenerDatosPassword() {
        const formData = new FormData(this.formulario);
        return {
            passwordActual: formData.get('passwordActual'),
            nuevaPassword: formData.get('nuevaPassword')
        };
    }

    async verificarYActualizarPassword(datos) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const usuarios = JSON.parse(localStorage.getItem('usuarios_cosecovi') || '[]');
                const usuarioIndex = usuarios.findIndex(u => u.id === this.usuario.id);

                if (usuarioIndex === -1) {
                    resolve({ exito: false, error: 'Usuario no encontrado' });
                    return;
                }

                // Verificar contraseña actual
                if (usuarios[usuarioIndex].password !== datos.passwordActual) {
                    resolve({ exito: false, error: 'La contraseña actual es incorrecta' });
                    return;
                }

                // Actualizar contraseña
                usuarios[usuarioIndex].password = datos.nuevaPassword;
                localStorage.setItem('usuarios_cosecovi', JSON.stringify(usuarios));

                resolve({ exito: true });
            }, 1500);
        });
    }

    mostrarCargando(mostrar) {
        const boton = this.formulario.querySelector('button[type="submit"]');
        if (mostrar) {
            boton.innerHTML = `
                <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Actualizando...
                </div>
            `;
            boton.disabled = true;
        } else {
            boton.innerHTML = 'Actualizar Contraseña';
            boton.disabled = false;
        }
    }

    mostrarError(mensaje) {
        this.mostrarNotificacion(mensaje, 'error');
    }

    mostrarExito(mensaje) {
        this.mostrarNotificacion(mensaje, 'exito');
    }

    mostrarNotificacion(mensaje, tipo) {
        const notificacionAnterior = document.querySelector('.notificacion-flotante');
        if (notificacionAnterior) {
            notificacionAnterior.remove();
        }

        const estilos = {
            exito: 'bg-green-50 border-green-200 text-green-800',
            error: 'bg-red-50 border-red-200 text-red-800'
        };

        const notificacion = document.createElement('div');
        notificacion.className = `notificacion-flotante fixed top-4 right-4 p-4 rounded-lg border ${estilos[tipo]} z-50 shadow-lg`;
        notificacion.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${tipo === 'exito' ? '✓' : '⚠'}</span>
                <span>${mensaje}</span>
            </div>
        `;

        document.body.appendChild(notificacion);

        setTimeout(() => {
            notificacion.remove();
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PerfilUsuario();
});