// Sistema de Login para Defensoría Politécnica
class LoginSistema {
    constructor() {
        this.form = document.getElementById('login-form');
        this.usuarioInput = document.getElementById('usuario');
        this.passwordInput = document.getElementById('password');
        this.rememberCheckbox = document.getElementById('remember');
        this.loginBtn = document.getElementById('loginBtn');
        this.togglePasswordBtn = document.getElementById('togglePassword');
        
        this.init();
    }

    init() {
        this.inicializarEventos();
        this.verificarRecordarme();
        this.verificarSesionActiva();
        this.crearAccesosRapidos();
        this.crearComandosConsola();
        
        console.log('🚀 Sistema de Login - Defensoría Politécnica IPN');
        console.log('🔑 Usuarios de prueba disponibles:');
        console.log('   - Boleta: 2023630100');
        console.log('   - Email: josebryanomar2004@gmail.com');
        console.log('   - Usuario: JoseJimenez');
        console.log('   - Contraseña para todos: 123456789');
    }

    inicializarEventos() {
        // Evento del formulario
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.iniciarSesion();
        });

        // Mostrar/ocultar contraseña
        this.togglePasswordBtn.addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // Validación en tiempo real
        this.usuarioInput.addEventListener('input', () => {
            this.limpiarError(this.usuarioInput);
        });

        this.passwordInput.addEventListener('input', () => {
            this.limpiarError(this.passwordInput);
        });

        // Efectos visuales en focus
        this.usuarioInput.addEventListener('focus', () => {
            this.agregarEfectoFocus(this.usuarioInput);
        });

        this.passwordInput.addEventListener('focus', () => {
            this.agregarEfectoFocus(this.passwordInput);
        });

        this.usuarioInput.addEventListener('blur', () => {
            this.removerEfectoFocus(this.usuarioInput);
        });

        this.passwordInput.addEventListener('blur', () => {
            this.removerEfectoFocus(this.passwordInput);
        });
    }

    agregarEfectoFocus(input) {
        input.parentElement.classList.add('focused');
    }

    removerEfectoFocus(input) {
        input.parentElement.classList.remove('focused');
    }

    togglePasswordVisibility() {
        const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        this.passwordInput.setAttribute('type', type);
        
        const icon = this.togglePasswordBtn.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }

    verificarRecordarme() {
        const credenciales = localStorage.getItem('defensoria_credenciales');
        if (credenciales) {
            const { usuario, password } = JSON.parse(credenciales);
            this.usuarioInput.value = usuario;
            this.passwordInput.value = password;
            this.rememberCheckbox.checked = true;
        }
    }

    verificarSesionActiva() {
        const sesion = localStorage.getItem('defensoria_sesion');
        if (sesion) {
            const usuario = JSON.parse(sesion);
            console.log('Sesión activa encontrada:', usuario);
            // Podrías redirigir automáticamente si quieres
            // this.redirigirDashboard();
        }
    }

    async iniciarSesion() {
        if (!this.validarFormulario()) {
            return;
        }

        const datos = this.obtenerDatosFormulario();
        
        try {
            this.mostrarCargando(true);
            
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const resultado = await this.autenticarUsuario(datos);
            
            if (resultado.exito) {
                this.mostrarExito('¡Inicio de sesión exitoso!');
                this.guardarSesion(resultado.usuario, datos.remember);
                
                setTimeout(() => {
                    this.redirigirDashboard();
                }, 2000);
            } else {
                this.mostrarError(resultado.mensaje);
            }
        } catch (error) {
            console.error('Error en login:', error);
            this.mostrarError('Error al conectar con el servidor');
        } finally {
            this.mostrarCargando(false);
        }
    }

    validarFormulario() {
        let valido = true;

        // Validar usuario
        if (!this.usuarioInput.value.trim()) {
            this.mostrarErrorCampo(this.usuarioInput, 'El usuario es requerido');
            valido = false;
        }

        // Validar contraseña
        if (!this.passwordInput.value.trim()) {
            this.mostrarErrorCampo(this.passwordInput, 'La contraseña es requerida');
            valido = false;
        } else if (this.passwordInput.value.length < 6) {
            this.mostrarErrorCampo(this.passwordInput, 'La contraseña debe tener al menos 6 caracteres');
            valido = false;
        }

        return valido;
    }

    mostrarErrorCampo(input, mensaje) {
        const errorDiv = input.parentElement.querySelector('.error-message');
        errorDiv.textContent = mensaje;
        errorDiv.classList.add('show');
        input.classList.add('error');
        
        // Efecto de shake
        input.style.animation = 'none';
        setTimeout(() => {
            input.style.animation = 'shake 0.5s ease-in-out';
        }, 10);
    }

    limpiarError(input) {
        const errorDiv = input.parentElement.querySelector('.error-message');
        errorDiv.classList.remove('show');
        input.classList.remove('error');
    }

    obtenerDatosFormulario() {
        return {
            usuario: this.usuarioInput.value.trim(),
            password: this.passwordInput.value,
            remember: this.rememberCheckbox.checked
        };
    }

    async autenticarUsuario(datos) {
        // Simulación de autenticación
        return new Promise((resolve) => {
            setTimeout(() => {
                // Usuarios de prueba predefinidos
                const usuariosPrueba = [
                    {
                        id: 'USR-2023630100',
                        tipo: 'estudiante',
                        identificacion: '2023630100',
                        email: 'josebryanomar2004@gmail.com',
                        usuario: 'JoseJimenez',
                        nombre: 'José Bryan',
                        apellidos: 'Omar Jiménez',
                        boleta: '2023630100',
                        unidadAcademica: 'ESCOM',
                        carrera: 'Ingeniería en Sistemas Computacionales',
                        password: '123456789',
                        activo: true,
                        fechaRegistro: new Date().toISOString()
                    }
                ];

                // Buscar usuario por diferentes campos
                const usuarioEncontrado = usuariosPrueba.find(u => 
                    u.identificacion === datos.usuario ||
                    u.email === datos.usuario ||
                    u.usuario === datos.usuario
                );

                if (usuarioEncontrado && usuarioEncontrado.password === datos.password) {
                    if (usuarioEncontrado.activo) {
                        resolve({
                            exito: true,
                            usuario: usuarioEncontrado,
                            mensaje: 'Autenticación exitosa'
                        });
                    } else {
                        resolve({
                            exito: false,
                            mensaje: 'Usuario desactivado. Contacta a la administración.'
                        });
                    }
                } else {
                    resolve({
                        exito: false,
                        mensaje: 'Usuario o contraseña incorrectos'
                    });
                }
            }, 1000);
        });
    }

    guardarSesion(usuario, recordar) {
        // No guardar la contraseña en la sesión
        const { password, ...usuarioSeguro } = usuario;
        
        localStorage.setItem('defensoria_sesion', JSON.stringify(usuarioSeguro));
        
        if (recordar) {
            localStorage.setItem('defensoria_credenciales', JSON.stringify({
                usuario: usuario.identificacion,
                password: usuario.password
            }));
        } else {
            localStorage.removeItem('defensoria_credenciales');
        }

        console.log('Sesión guardada:', usuarioSeguro);
    }

    redirigirDashboard() {
        // Simular redirección al dashboard
        this.mostrarNotificacion('Redirigiendo al dashboard...', 'info');
        
        setTimeout(() => {
            // En un entorno real, esto redirigiría al dashboard
            // window.location.href = 'dashboard.html';
            
            // Por ahora, mostramos un mensaje
            this.mostrarExito('¡Redirección exitosa! (Simulación)');
            console.log('Redirigiendo al dashboard...');
        }, 1000);
    }

    mostrarCargando(mostrar) {
        const btnText = this.loginBtn.querySelector('.btn-text');
        const btnLoader = this.loginBtn.querySelector('.btn-loader');
        
        if (mostrar) {
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');
            this.loginBtn.disabled = true;
        } else {
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
            this.loginBtn.disabled = false;
        }
    }

    // =========================================================================
    // SISTEMA DE NOTIFICACIONES
    // =========================================================================

    mostrarExito(mensaje) {
        this.mostrarNotificacion(mensaje, 'success', '¡Éxito!');
    }

    mostrarError(mensaje) {
        this.mostrarNotificacion(mensaje, 'error', 'Error');
    }

    mostrarInfo(mensaje) {
        this.mostrarNotificacion(mensaje, 'info', 'Información');
    }

    mostrarNotificacion(mensaje, tipo = 'info', titulo = '') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        
        const iconos = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <div class="notification-icon">
                <i class="${iconos[tipo]}"></i>
            </div>
            <div class="notification-content">
                ${titulo ? `<div class="notification-title">${titulo}</div>` : ''}
                <div class="notification-message">${mensaje}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);

        // Cerrar manualmente
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        });
    }

    // =========================================================================
    // ACCESOS RÁPIDOS PARA PRUEBAS
    // =========================================================================

    crearAccesosRapidos() {
        // Eventos para botones de acceso rápido
        document.querySelectorAll('.access-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const usuario = btn.getAttribute('data-user');
                const password = btn.getAttribute('data-password');
                
                this.usuarioInput.value = usuario;
                this.passwordInput.value = password;
                this.rememberCheckbox.checked = true;
                
                this.mostrarInfo(`Credenciales de ${usuario} cargadas`);
                
                // Efecto visual
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 150);
            });
        });

        // Limpiar formulario
        document.getElementById('clearForm').addEventListener('click', () => {
            this.form.reset();
            this.limpiarErrores();
            this.mostrarInfo('Formulario limpiado');
        });

        // Crear usuarios de prueba
        document.getElementById('createUsers').addEventListener('click', () => {
            this.crearUsuariosPrueba();
        });
    }

    limpiarErrores() {
        document.querySelectorAll('.error-message').forEach(error => {
            error.classList.remove('show');
        });
        
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        });
    }

    crearUsuariosPrueba() {
        const usuarios = [
            {
                id: 'USR-2023630100',
                tipo: 'estudiante',
                identificacion: '2023630100',
                email: 'josebryanomar2004@gmail.com',
                usuario: 'JoseJimenez',
                nombre: 'José Bryan',
                apellidos: 'Omar Jiménez',
                boleta: '2023630100',
                unidadAcademica: 'ESCOM',
                carrera: 'Ingeniería en Sistemas Computacionales',
                password: '123456789',
                activo: true,
                fechaRegistro: new Date().toISOString()
            }
        ];

        localStorage.setItem('defensoria_usuarios', JSON.stringify(usuarios));
        this.mostrarExito('Usuarios de prueba creados exitosamente');
    }

    // =========================================================================
    // COMANDOS DE CONSOLA PARA DESARROLLO
    // =========================================================================

    crearComandosConsola() {
        window.loginCommands = {
            // Comandos de autenticación
            loginJose: () => {
                this.usuarioInput.value = '2023630100';
                this.passwordInput.value = '123456789';
                this.rememberCheckbox.checked = true;
                this.mostrarInfo('Credenciales de José cargadas');
            },
            
            loginEmail: () => {
                this.usuarioInput.value = 'josebryanomar2004@gmail.com';
                this.passwordInput.value = '123456789';
                this.rememberCheckbox.checked = true;
                this.mostrarInfo('Credenciales por email cargadas');
            },
            
            loginUsuario: () => {
                this.usuarioInput.value = 'JoseJimenez';
                this.passwordInput.value = '123456789';
                this.rememberCheckbox.checked = true;
                this.mostrarInfo('Credenciales por usuario cargadas');
            },
            
            // Comandos de utilidad
            clearForm: () => {
                this.form.reset();
                this.limpiarErrores();
                this.mostrarInfo('Formulario limpiado');
            },
            
            doLogin: () => {
                this.iniciarSesion();
            },
            
            // Comandos de debug
            debug: () => {
                console.log('=== DEBUG INFO ===');
                console.log('Usuario en sesión:', localStorage.getItem('defensoria_sesion'));
                console.log('Credenciales guardadas:', localStorage.getItem('defensoria_credenciales'));
                console.log('Usuarios en sistema:', localStorage.getItem('defensoria_usuarios'));
            },
            
            // Comandos de notificación
            testSuccess: () => this.mostrarExito('Esta es una notificación de éxito'),
            testError: () => this.mostrarError('Esta es una notificación de error'),
            testInfo: () => this.mostrarInfo('Esta es una notificación de información')
        };

        console.log('🎮 Comandos de consola disponibles:');
        console.log('   loginCommands.loginJose() - Cargar credenciales por boleta');
        console.log('   loginCommands.loginEmail() - Cargar credenciales por email');
        console.log('   loginCommands.loginUsuario() - Cargar credenciales por usuario');
        console.log('   loginCommands.clearForm() - Limpiar formulario');
        console.log('   loginCommands.doLogin() - Ejecutar login');
        console.log('   loginCommands.debug() - Información de debug');
        console.log('   loginCommands.testSuccess() - Probar notificación éxito');
        console.log('   loginCommands.testError() - Probar notificación error');
        console.log('   loginCommands.testInfo() - Probar notificación info');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new LoginSistema();
});

// Agregar animación de shake
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .form-group.focused .form-label {
        color: var(--color-primary);
        transform: translateY(-2px);
    }
    
    .password-container.focused .toggle-password {
        color: var(--color-primary);
    }
`;
document.head.appendChild(style);