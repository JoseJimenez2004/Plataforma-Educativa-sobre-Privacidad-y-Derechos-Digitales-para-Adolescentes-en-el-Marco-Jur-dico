class RegistroUsuario {
    constructor() {
        this.formulario = document.getElementById('formulario-registro');
        this.init();
    }

    init() {
        this.inicializarEventos();
        this.inicializarValidaciones();
        
        // Solo en entorno de desarrollo
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || true) { // true para probar siempre
            this.crearAccesosMultiples();
            this.crearAccesosConsola();
        }
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

    // MÉTODOS PARA ACCESOS DE SIMULACIÓN

    crearAccesosMultiples() {
        const usuariosPrueba = [
            {
                nombre: 'José Bryan',
                email: 'josebryanomar2004@gmail.com',
                password: '12345678',
                identificacion: '123456789',
                tipo: 'natural'
            },
            {
                nombre: 'Ana María López',
                email: 'ana.lopez@test.com',
                password: 'test1234',
                identificacion: '987654321',
                tipo: 'natural'
            },
            {
                nombre: 'Empresa XYZ',
                email: 'contacto@empresa.com',
                password: 'empresa123',
                identificacion: '900123456',
                tipo: 'juridica'
            }
        ];

        const accesoContainer = document.createElement('div');
        accesoContainer.className = 'fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border z-40 max-w-xs';
        accesoContainer.innerHTML = `
            <h3 class="font-bold text-sm mb-2">Usuarios de Prueba</h3>
            <div class="space-y-2 max-h-40 overflow-y-auto">
                ${usuariosPrueba.map((usuario, index) => `
                    <button class="acceso-usuario block w-full bg-blue-500 text-white px-3 py-2 rounded text-xs hover:bg-blue-600 text-left" data-index="${index}">
                        <div class="font-medium">${usuario.nombre}</div>
                        <div class="text-xs opacity-80">${usuario.email}</div>
                    </button>
                `).join('')}
            </div>
            <button id="limpiar-todo" class="w-full bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 mt-2">
                Limpiar Todo
            </button>
        `;
        
        document.body.appendChild(accesoContainer);
        
        // Eventos
        document.querySelectorAll('.acceso-usuario').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                this.llenarConUsuario(usuariosPrueba[index]);
            });
        });
        
        document.getElementById('limpiar-todo').addEventListener('click', () => {
            this.limpiarFormulario();
        });
    }

    llenarConUsuario(usuario) {
        // Tipo de persona
        const radioTipo = document.querySelector(`input[name="tipoPersona"][value="${usuario.tipo}"]`);
        if (radioTipo) {
            radioTipo.checked = true;
        }
        
        // Resto de campos
        document.getElementById('numeroIdentificacion').value = usuario.identificacion;
        
        // Separar nombre y apellidos si es necesario
        const partesNombre = usuario.nombre.split(' ');
        document.getElementById('nombre').value = partesNombre[0];
        document.getElementById('apellidos').value = partesNombre.slice(1).join(' ');
        
        document.getElementById('email').value = usuario.email;
        document.getElementById('password').value = usuario.password;
        document.getElementById('confirmarPassword').value = usuario.password;
        document.getElementById('terminos').checked = true;
        
        // Validaciones
        this.validarTipoPersona();
        this.validarConfirmacionPassword();
        
        this.mostrarNotificacion(`Datos de ${usuario.nombre} cargados`, 'exito');
    }

    limpiarFormulario() {
        this.formulario.reset();
        // Ocultar mensajes de error
        const errores = this.formulario.querySelectorAll('.error-message');
        errores.forEach(error => error.style.display = 'none');
        
        this.mostrarNotificacion('Formulario limpiado', 'exito');
    }

    crearAccesosConsola() {
        // Hacer los métodos accesibles globalmente para testing
        window.simulacionRegistro = {
            llenarJose: () => this.llenarConUsuario({
                nombre: 'José Bryan',
                email: 'josebryanomar2004@gmail.com',
                password: '12345678',
                identificacion: '123456789',
                tipo: 'natural'
            }),
            llenarAna: () => this.llenarConUsuario({
                nombre: 'Ana María López',
                email: 'ana.lopez@test.com',
                password: 'test1234',
                identificacion: '987654321',
                tipo: 'natural'
            }),
            llenarEmpresa: () => this.llenarConUsuario({
                nombre: 'Empresa XYZ',
                email: 'contacto@empresa.com',
                password: 'empresa123',
                identificacion: '900123456',
                tipo: 'juridica'
            }),
            limpiar: () => this.limpiarFormulario(),
            registrar: () => this.registrarUsuario(),
            validar: () => this.validarFormularioCompleto()
        };
        
        console.log('🔧 Accesos de simulación disponibles:');
        console.log('- simulacionRegistro.llenarJose() - Datos de José Bryan');
        console.log('- simulacionRegistro.llenarAna() - Datos de Ana María');
        console.log('- simulacionRegistro.llenarEmpresa() - Datos de Empresa');
        console.log('- simulacionRegistro.limpiar() - Limpiar formulario');
        console.log('- simulacionRegistro.registrar() - Enviar registro');
        console.log('- simulacionRegistro.validar() - Validar formulario');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new RegistroUsuario();
});