class RegistroUsuario {
    constructor() {
        this.formulario = document.getElementById('formulario-registro');
        this.init();
    }

    init() {
        this.inicializarEventos();
        this.inicializarValidaciones();
    }

    inicializarEventos() {
        this.formulario.addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarUsuario();
        });

        // Validación en tiempo real de confirmación de contraseña
        document.getElementById('confirmarPassword').addEventListener('input', (e) => {
            this.validarConfirmacionPassword();
        });
    }

    inicializarValidaciones() {
        // Validación personalizada para tipo de persona
        const radiosTipo = document.querySelectorAll('input[name="tipoPersona"]');
        radiosTipo.forEach(radio => {
            radio.addEventListener('change', () => {
                this.validarTipoPersona();
            });
        });
    }

    validarTipoPersona() {
        const radios = document.querySelectorAll('input[name="tipoPersona"]');
        const seleccionado = Array.from(radios).some(radio => radio.checked);
        const errorDiv = document.querySelector('input[name="tipoPersona"]').closest('div').querySelector('.error-message');
        
        if (!seleccionado) {
            errorDiv.textContent = 'Selecciona tu tipo de persona';
            errorDiv.style.display = 'block';
            return false;
        } else {
            errorDiv.style.display = 'none';
            return true;
        }
    }

    validarConfirmacionPassword() {
        const password = document.getElementById('password').value;
        const confirmacion = document.getElementById('confirmarPassword').value;
        const errorDiv = document.getElementById('confirmarPassword').parentNode.querySelector('.error-message');

        if (confirmacion && password !== confirmacion) {
            errorDiv.textContent = 'Las contraseñas no coinciden';
            errorDiv.style.display = 'block';
            return false;
        } else {
            errorDiv.style.display = 'none';
            return true;
        }
    }

    async registrarUsuario() {
        if (!this.validarFormularioCompleto()) {
            this.mostrarError('Por favor completa todos los campos correctamente');
            return;
        }

        const datos = this.obtenerDatosFormulario();

        try {
            this.mostrarCargando(true);
            
            // Simular registro en base de datos
            const resultado = await this.simularRegistro(datos);
            
            if (resultado.exito) {
                this.mostrarExito('Cuenta creada exitosamente. Redirigiendo...');
                this.guardarUsuario(resultado.usuario);
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                this.mostrarError(resultado.error);
            }
        } catch (error) {
            this.mostrarError('Error al crear la cuenta. Intenta nuevamente.');
        } finally {
            this.mostrarCargando(false);
        }
    }

    validarFormularioCompleto() {
        let valido = true;

        // Validar tipo de persona
        if (!this.validarTipoPersona()) valido = false;

        // Validar campos requeridos
        const camposRequeridos = this.formulario.querySelectorAll('[data-validate]');
        camposRequeridos.forEach(campo => {
            if (!window.sistemaDenuncias.validarCampo(campo)) {
                valido = false;
            }
        });

        // Validar confirmación de contraseña
        if (!this.validarConfirmacionPassword()) valido = false;

        // Validar términos y condiciones
        const terminos = document.getElementById('terminos');
        if (!terminos.checked) {
            this.mostrarError('Debes aceptar los términos y condiciones');
            valido = false;
        }

        return valido;
    }

    obtenerDatosFormulario() {
        const formData = new FormData(this.formulario);
        const datos = Object.fromEntries(formData.entries());
        
        return {
            tipoPersona: datos.tipoPersona,
            numeroIdentificacion: datos.numeroIdentificacion,
            nombre: datos.nombre,
            apellidos: datos.apellidos,
            email: datos.email,
            password: datos.password,
            fechaRegistro: new Date().toISOString()
        };
    }

    simularRegistro(datos) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Verificar si el usuario ya existe
                const usuariosExistentes = JSON.parse(localStorage.getItem('usuarios_cosecovi') || '[]');
                const usuarioExistente = usuariosExistentes.find(u => 
                    u.numeroIdentificacion === datos.numeroIdentificacion || u.email === datos.email
                );

                if (usuarioExistente) {
                    resolve({
                        exito: false,
                        error: 'Ya existe un usuario con este número de identificación o correo electrónico'
                    });
                    return;
                }

                // Crear nuevo usuario
                const nuevoUsuario = {
                    id: 'USR-' + Date.now(),
                    ...datos,
                    fechaRegistro: new Date().toISOString(),
                    activo: true
                };

                // Guardar en localStorage
                usuariosExistentes.push(nuevoUsuario);
                localStorage.setItem('usuarios_cosecovi', JSON.stringify(usuariosExistentes));

                resolve({
                    exito: true,
                    usuario: nuevoUsuario
                });
            }, 1500);
        });
    }

    guardarUsuario(usuario) {
        // No guardar la contraseña en el objeto de sesión
        const { password, ...usuarioSeguro } = usuario;
        localStorage.setItem('usuario_cosecovi', JSON.stringify(usuarioSeguro));
    }

    mostrarCargando(mostrar) {
        const boton = this.formulario.querySelector('button[type="submit"]');
        if (mostrar) {
            boton.innerHTML = `
                <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Creando cuenta...
                </div>
            `;
            boton.disabled = true;
        } else {
            boton.innerHTML = 'Crear Cuenta';
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
        // Remover notificación anterior si existe
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

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notificacion.remove();
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new RegistroUsuario();
});