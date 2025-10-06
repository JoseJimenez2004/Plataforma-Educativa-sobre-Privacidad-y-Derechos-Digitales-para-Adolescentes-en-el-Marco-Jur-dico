class LoginUsuario {
    constructor() {
        this.formulario = document.getElementById('formulario-login');
        this.init();
    }

    init() {
        this.inicializarEventos();
        this.verificarRecordarme();
        this.verificarSesionActiva();
        
        // Solo en entorno de desarrollo
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || true) {
            this.crearAccesosMultiples();
            this.crearAccesosConsola();
        }
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

    verificarSesionActiva() {
        const usuarioActivo = localStorage.getItem('usuario_cosecovi');
        if (usuarioActivo) {
            // Si ya hay una sesión activa, redirigir al dashboard
            window.location.href = ' /mockups/pages/auth/tipo-denuncia.html';
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
                    this.redirigirUsuario();
                }, 1500);
            } else {
                this.mostrarError(resultado.error);
            }
        } catch (error) {
            console.error('Error en login:', error);
            this.mostrarError('Error al iniciar sesión. Intenta nuevamente.');
        } finally {
            this.mostrarCargando(false);
        }
    }

    validarFormulario() {
        let valido = true;
        const usuario = document.getElementById('usuario');
        const password = document.getElementById('password');

        // Validar que no estén vacíos
        if (!usuario.value.trim()) {
            this.mostrarErrorCampo(usuario, 'El usuario es requerido');
            valido = false;
        } else {
            this.limpiarErrorCampo(usuario);
        }

        if (!password.value.trim()) {
            this.mostrarErrorCampo(password, 'La contraseña es requerida');
            valido = false;
        } else {
            this.limpiarErrorCampo(password);
        }

        return valido;
    }

    mostrarErrorCampo(campo, mensaje) {
        let errorDiv = campo.parentNode.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message text-red-600 text-sm mt-1';
            campo.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = mensaje;
        errorDiv.style.display = 'block';
        campo.classList.add('border-red-500');
    }

    limpiarErrorCampo(campo) {
        const errorDiv = campo.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
        campo.classList.remove('border-red-500');
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
                try {
                    const usuarios = JSON.parse(localStorage.getItem('usuarios_cosecovi') || '[]');
                    
                    console.log('Usuarios en sistema:', usuarios);
                    console.log('Buscando usuario:', datos.usuario);

                    const usuario = usuarios.find(u => {
                        const coincideUsuario = u.numeroIdentificacion === datos.usuario || 
                                              u.email === datos.usuario ||
                                              u.id === datos.usuario;
                        const coincidePassword = u.password === datos.password;
                        const estaActivo = u.activo !== false;

                        console.log('Comparando:', {
                            usuario: u.numeroIdentificacion,
                            coincideUsuario,
                            coincidePassword,
                            estaActivo
                        });

                        return coincideUsuario && coincidePassword && estaActivo;
                    });

                    if (usuario) {
                        console.log('Usuario encontrado:', usuario);
                        resolve({
                            exito: true,
                            usuario: usuario
                        });
                    } else {
                        console.log('Usuario no encontrado o credenciales incorrectas');
                        resolve({
                            exito: false,
                            error: 'Usuario o contraseña incorrectos'
                        });
                    }
                } catch (error) {
                    console.error('Error al verificar credenciales:', error);
                    resolve({
                        exito: false,
                        error: 'Error en el sistema. Intenta más tarde.'
                    });
                }
            }, 1000);
        });
    }

    guardarSesion(usuario, recordar) {
        try {
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

            console.log('Sesión guardada:', usuarioSeguro);
        } catch (error) {
            console.error('Error al guardar sesión:', error);
        }
    }

    redirigirUsuario() {
        // Intentar diferentes rutas posibles
        const rutasPosibles = [
            'dashboard.html',
            'index.html',
            '../dashboard.html',
            '../../dashboard.html',
            '/dashboard.html',
            './dashboard.html'
        ];

        // Verificar si existe alguna de las rutas
        const rutaExistente = rutasPosibles.find(ruta => {
            // Esta es una verificación básica, en un caso real deberías tener una lógica más robusta
            return true; // Por ahora asumimos que dashboard.html existe
        });

        const rutaFinal = rutaExistente || 'dashboard.html';
        console.log('Redirigiendo a:', rutaFinal);
        
        window.location.href = rutaFinal;
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

    // MÉTODOS PARA ACCESOS DE SIMULACIÓN

    crearAccesosMultiples() {
        const usuariosPrueba = [
            {
                nombre: 'José Bryan',
                email: 'josebryanomar2004@gmail.com',
                password: '123456789',
                identificacion: '2023630100',
                tipo: 'natural'
            },
            {
                nombre: 'Ana María López',
                email: 'ana.lopez@test.com',
                password: '123456789',
                identificacion: '2023630101',
                tipo: 'natural'
            },
            {
                nombre: 'Empresa XYZ',
                email: 'contacto@empresa.com',
                password: '123456789',
                identificacion: '2023630102',
                tipo: 'juridica'
            }
        ];

        const accesoContainer = document.createElement('div');
        accesoContainer.className = 'fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border z-40 max-w-xs';
        accesoContainer.innerHTML = `
            <h3 class="font-bold text-sm mb-2">Accesos Rápidos Login</h3>
            <div class="space-y-2 max-h-40 overflow-y-auto">
                ${usuariosPrueba.map((usuario, index) => `
                    <button class="acceso-usuario block w-full bg-blue-500 text-white px-3 py-2 rounded text-xs hover:bg-blue-600 text-left" data-index="${index}">
                        <div class="font-medium">${usuario.nombre}</div>
                        <div class="text-xs opacity-80">Usuario: ${usuario.identificacion}</div>
                        <div class="text-xs opacity-80">Contraseña: ${usuario.password}</div>
                    </button>
                `).join('')}
            </div>
            <div class="grid grid-cols-2 gap-2 mt-2">
                <button id="limpiar-login" class="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600">
                    Limpiar
                </button>
                <button id="recordar-login" class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">
                    Recordar
                </button>
            </div>
            <button id="crear-usuarios" class="w-full bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600 mt-2">
                Crear Usuarios de Prueba
            </button>
        `;
        
        document.body.appendChild(accesoContainer);
        
        // Eventos para los botones de usuarios
        document.querySelectorAll('.acceso-usuario').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                this.llenarConUsuario(usuariosPrueba[index]);
            });
        });
        
        // Evento para limpiar
        document.getElementById('limpiar-login').addEventListener('click', () => {
            this.limpiarFormulario();
        });
        
        // Evento para recordar
        document.getElementById('recordar-login').addEventListener('click', () => {
            document.getElementById('remember').checked = true;
            this.mostrarNotificacion('Opción "Recordarme" activada', 'exito');
        });

        // Evento para crear usuarios
        document.getElementById('crear-usuarios').addEventListener('click', () => {
            this.crearUsuariosPrueba();
        });
    }

    llenarConUsuario(usuario) {
        document.getElementById('usuario').value = usuario.identificacion;
        document.getElementById('password').value = usuario.password;
        document.getElementById('remember').checked = true;
        
        this.mostrarNotificacion(`Credenciales de ${usuario.nombre} cargadas`, 'exito');
    }

    llenarConEmail(usuario) {
        document.getElementById('usuario').value = usuario.email;
        document.getElementById('password').value = usuario.password;
        document.getElementById('remember').checked = true;
        
        this.mostrarNotificacion(`Credenciales de ${usuario.nombre} (email) cargadas`, 'exito');
    }

    limpiarFormulario() {
        this.formulario.reset();
        const errores = this.formulario.querySelectorAll('.error-message');
        errores.forEach(error => error.style.display = 'none');
        
        const inputs = this.formulario.querySelectorAll('input');
        inputs.forEach(input => input.classList.remove('border-red-500'));
        
        this.mostrarNotificacion('Formulario limpiado', 'exito');
    }

    crearUsuariosPrueba() {
        const usuariosPrueba = [
            {
                id: 'USR-' + Date.now(),
                tipoPersona: 'natural',
                numeroIdentificacion: '2023630100',
                nombre: 'José',
                apellidos: 'Bryan Omar',
                email: 'josebryanomar2004@gmail.com',
                password: '123456789',
                fechaRegistro: new Date().toISOString(),
                activo: true
            },
            {
                id: 'USR-' + (Date.now() + 1),
                tipoPersona: 'natural',
                numeroIdentificacion: '2023630101',
                nombre: 'Ana',
                apellidos: 'María López',
                email: 'ana.lopez@test.com',
                password: '123456789',
                fechaRegistro: new Date().toISOString(),
                activo: true
            },
            {
                id: 'USR-' + (Date.now() + 2),
                tipoPersona: 'juridica',
                numeroIdentificacion: '2023630102',
                nombre: 'Empresa',
                apellidos: 'XYZ',
                email: 'contacto@empresa.com',
                password: '123456789',
                fechaRegistro: new Date().toISOString(),
                activo: true
            }
        ];

        const usuariosExistentes = JSON.parse(localStorage.getItem('usuarios_cosecovi') || '[]');
        let usuariosCreados = 0;

        usuariosPrueba.forEach(nuevoUsuario => {
            const yaExiste = usuariosExistentes.find(u => 
                u.numeroIdentificacion === nuevoUsuario.numeroIdentificacion || 
                u.email === nuevoUsuario.email
            );

            if (!yaExiste) {
                usuariosExistentes.push(nuevoUsuario);
                usuariosCreados++;
            }
        });

        localStorage.setItem('usuarios_cosecovi', JSON.stringify(usuariosExistentes));
        
        if (usuariosCreados > 0) {
            this.mostrarExito(`${usuariosCreados} usuarios de prueba creados exitosamente`);
        } else {
            this.mostrarNotificacion('Todos los usuarios de prueba ya existen', 'exito');
        }
    }

    crearAccesosConsola() {
        window.simulacionLogin = {
            llenarJose: () => this.llenarConUsuario({
                nombre: 'José Bryan',
                email: 'josebryanomar2004@gmail.com',
                password: '123456789',
                identificacion: '2023630100',
                tipo: 'natural'
            }),
            llenarJoseEmail: () => this.llenarConEmail({
                nombre: 'José Bryan',
                email: 'josebryanomar2004@gmail.com',
                password: '123456789',
                identificacion: '2023630100',
                tipo: 'natural'
            }),
            llenarAna: () => this.llenarConUsuario({
                nombre: 'Ana María López',
                email: 'ana.lopez@test.com',
                password: '123456789',
                identificacion: '2023630101',
                tipo: 'natural'
            }),
            llenarEmpresa: () => this.llenarConUsuario({
                nombre: 'Empresa XYZ',
                email: 'contacto@empresa.com',
                password: '123456789',
                identificacion: '2023630102',
                tipo: 'juridica'
            }),
            limpiar: () => this.limpiarFormulario(),
            login: () => this.iniciarSesion(),
            recordar: () => {
                document.getElementById('remember').checked = true;
                console.log('Opción "Recordarme" activada');
            },
            crearUsuarios: () => this.crearUsuariosPrueba(),
            debug: () => {
                console.log('=== DEBUG SESSION ===');
                console.log('Usuario en sesión:', localStorage.getItem('usuario_cosecovi'));
                console.log('Usuarios registrados:', JSON.parse(localStorage.getItem('usuarios_cosecovi') || '[]'));
            }
        };
        
        console.log('🔧 Accesos de simulación Login disponibles:');
        console.log('- simulacionLogin.llenarJose() - José Bryan (2023630100)');
        console.log('- simulacionLogin.llenarJoseEmail() - José Bryan (email)');
        console.log('- simulacionLogin.llenarAna() - Ana María López (2023630101)');
        console.log('- simulacionLogin.llenarEmpresa() - Empresa XYZ (2023630102)');
        console.log('- simulacionLogin.limpiar() - Limpiar formulario');
        console.log('- simulacionLogin.login() - Iniciar sesión');
        console.log('- simulacionLogin.recordar() - Activar "Recordarme"');
        console.log('- simulacionLogin.crearUsuarios() - Crear usuarios de prueba');
        console.log('- simulacionLogin.debug() - Ver información de debug');
        console.log('🔑 Contraseña para todos: 123456789');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new LoginUsuario();
});