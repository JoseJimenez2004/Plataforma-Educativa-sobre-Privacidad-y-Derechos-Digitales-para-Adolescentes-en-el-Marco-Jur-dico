class LoginUsuario {
    constructor() {
        this.formulario = document.getElementById('formulario-login');
        this.init();
    }

    init() {
        this.inicializarEventos();
        this.verificarRecordarme();
    }

    inicializarEventos() {
        this.formulario.addEventListener('submit', (e) => {
            e.preventDefault();
            this.iniciarSesion();
        });
    }

    verificarRecordarme() {
        const credencialesGuardadas = localStorage.getItem('credenciales_recordadas');
        if (credencialesGuardadas) {
            const credenciales = JSON.parse(credencialesGuardadas);
            document.getElementById('usuario').value = credenciales.usuario;
            document.getElementById('password').value = credenciales.password;
            document.getElementById('remember').checked = true;
        }
    }

    async iniciarSesion() {
        if (!this.validarFormulario()) {
            this.mostrarError('Por favor completa todos los campos');
            return;
        }

        const datos = this.obtenerDatosFormulario();

        try {
            this.mostrarCargando(true);
            
            const resultado = await this.verificarCredenciales(datos);
            
            if (resultado.exito) {
                this.guardarSesion(resultado.usuario, datos.remember);
                this.mostrarExito('Inicio de sesión exitoso. Redirigiendo...');
                
                setTimeout(() => {
                    window.location.href = '../../index.html';
                }, 1500);
            } else {
                this.mostrarError(resultado.error);
            }
        } catch (error) {
            this.mostrarError('Error al iniciar sesión. Intenta nuevamente.');
        } finally {
            this.mostrarCargando(false);
        }
    }

    validarFormulario() {
        let valido = true;
        const campos = this.formulario.querySelectorAll('[data-validate]');

        campos.forEach(campo => {
            if (!window.sistemaDenuncias.validarCampo(campo)) {
                valido = false;
            }
        });

        return valido;
    }

    obtenerDatosFormulario() {
        const formData = new FormData(this.formulario);
        return {
            usuario: formData.get('usuario'),
            password: formData.get('password'),
            remember: document.getElementById('remember').checked
        };
    }

    async verificarCredenciales(datos) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const usuarios = JSON.parse(localStorage.getItem('usuarios_cosecovi') || '[]');
                
                const usuario = usuarios.find(u => 
                    (u.numeroIdentificacion === datos.usuario || u.email === datos.usuario) &&
                    u.password === datos.password &&
                    u.activo === true
                );

                if (usuario) {
                    resolve({
                        exito: true,
                        usuario: usuario
                    });
                } else {
                    resolve({
                        exito: false,
                        error: 'Usuario o contraseña incorrectos'
                    });
                }
            }, 1000);
        });
    }

    guardarSesion(usuario, recordar) {
        // No guardar la contraseña en el objeto de sesión
        const { password, ...usuarioSeguro } = usuario;
        localStorage.setItem('usuario_cosecovi', JSON.stringify(usuarioSeguro));

        if (recordar) {
            localStorage.setItem('credenciales_recordadas', JSON.stringify({
                usuario: usuario.numeroIdentificacion,
                password: usuario.password
            }));
        } else {
            localStorage.removeItem('credenciales_recordadas');
        }
    }

    mostrarCargando(mostrar) {
        const boton = this.formulario.querySelector('button[type="submit"]');
        if (mostrar) {
            boton.innerHTML = `
                <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Iniciando sesión...
                </div>
            `;
            boton.disabled = true;
        } else {
            boton.innerHTML = 'Iniciar Sesión';
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
    new LoginUsuario();
});