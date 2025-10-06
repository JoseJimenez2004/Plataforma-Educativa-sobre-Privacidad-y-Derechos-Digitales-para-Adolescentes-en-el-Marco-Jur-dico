class PerfilUsuario {
    constructor() {
        this.usuario = null;
        this.formulario = document.getElementById('formulario-password');
        this.modalFoto = document.getElementById('modal-foto');
        this.inputFoto = document.getElementById('input-foto');
        this.areaSubida = document.getElementById('area-subida');
        this.init();
    }

    init() {
        this.verificarAutenticacion();
        this.cargarInformacionUsuario();
        this.inicializarEventos();
        this.cargarEstadisticas();
    }

    verificarAutenticacion() {
        this.usuario = JSON.parse(localStorage.getItem('usuario_cosecovi'));
        
        if (!this.usuario) {
            window.location.href = 'login.html';
            return;
        }
    }

    cargarInformacionUsuario() {
        // Información básica
        document.getElementById('tipo-persona').textContent = 
            this.usuario.tipoPersona === 'estudiante' ? 'Estudiante' : 'Trabajador';
        document.getElementById('numero-identificacion').textContent = this.usuario.numeroIdentificacion;
        document.getElementById('nombre-usuario').textContent = this.usuario.nombre;
        document.getElementById('apellidos-usuario').textContent = this.usuario.apellidos;
        document.getElementById('email-usuario').textContent = this.usuario.email;
        
        // Información del perfil
        document.getElementById('nombre-completo').textContent = `${this.usuario.nombre} ${this.usuario.apellidos}`;
        document.getElementById('tipo-usuario').textContent = 
            this.usuario.tipoPersona === 'estudiante' ? 'Estudiante' : 'Personal';
        document.getElementById('matricula').textContent = this.usuario.numeroIdentificacion;
        
        // Cargar foto de perfil si existe
        if (this.usuario.fotoPerfil) {
            document.getElementById('foto-perfil').src = this.usuario.fotoPerfil;
        }
    }

    cargarEstadisticas() {
        // Simular datos de estadísticas
        document.getElementById('total-denuncias').textContent = '5';
        document.getElementById('denuncias-pendientes').textContent = '2';
        document.getElementById('denuncias-resueltas').textContent = '3';
    }

    inicializarEventos() {
        // Eventos del formulario de contraseña
        this.formulario.addEventListener('submit', (e) => {
            e.preventDefault();
            this.cambiarPassword();
        });

        // Validación de confirmación de nueva contraseña
        document.getElementById('confirmar-password').addEventListener('input', (e) => {
            this.validarConfirmacionPassword();
        });

        // Mostrar/ocultar contraseña
        document.querySelectorAll('.toggle-password').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const input = e.target.closest('.relative').querySelector('input');
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                e.target.classList.toggle('fa-eye-slash');
                e.target.classList.toggle('fa-eye');
            });
        });

        // Navegación entre secciones
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.getAttribute('data-section');
                this.mostrarSeccion(section);
                
                // Actualizar navegación activa
                document.querySelectorAll('.nav-item').forEach(navItem => {
                    navItem.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
            });
        });

        // Eventos para cambiar foto de perfil
        document.getElementById('cambiar-foto').addEventListener('click', () => {
            this.mostrarModalFoto();
        });
        
        document.getElementById('cancelar-foto').addEventListener('click', () => {
            this.ocultarModalFoto();
        });
        
        document.getElementById('guardar-foto').addEventListener('click', () => {
            this.guardarFotoPerfil();
        });
        
        this.areaSubida.addEventListener('click', () => {
            this.inputFoto.click();
        });
        
        this.inputFoto.addEventListener('change', (e) => {
            this.previsualizarFoto(e);
        });

        // Cerrar sesión
        document.getElementById('cerrar-sesion').addEventListener('click', () => {
            this.cerrarSesion();
        });

        // Validar fortaleza de contraseña
        document.getElementById('nueva-password').addEventListener('input', (e) => {
            this.validarFortalezaPassword(e.target.value);
        });
    }

    mostrarSeccion(sectionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('.section-content').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });
        
        // Mostrar la sección seleccionada
        const seccion = document.getElementById(sectionId);
        seccion.classList.remove('hidden');
        seccion.classList.add('active');
    }

    mostrarModalFoto() {
        this.modalFoto.classList.remove('hidden');
    }

    ocultarModalFoto() {
        this.modalFoto.classList.add('hidden');
        this.inputFoto.value = '';
    }

    previsualizarFoto(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.areaSubida.innerHTML = `
                    <img src="${e.target.result}" class="max-h-40 mx-auto rounded-lg" alt="Vista previa">
                    <p class="text-sm text-gray-500 mt-2">${file.name}</p>
                `;
            };
            reader.readAsDataURL(file);
        }
    }

    guardarFotoPerfil() {
        const file = this.inputFoto.files[0];
        if (!file) {
            this.mostrarError('Por favor selecciona una imagen');
            return;
        }

        // Validar tipo de archivo
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!tiposPermitidos.includes(file.type)) {
            this.mostrarError('Formato de imagen no válido. Usa JPG o PNG.');
            return;
        }

        // Validar tamaño (máximo 2MB)
        if (file.size > 2 * 1024 * 1024) {
            this.mostrarError('La imagen es demasiado grande. Máximo 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // Actualizar foto en el perfil
            document.getElementById('foto-perfil').src = e.target.result;
            
            // Guardar en localStorage (en un caso real, se enviaría al servidor)
            this.usuario.fotoPerfil = e.target.result;
            localStorage.setItem('usuario_cosecovi', JSON.stringify(this.usuario));
            
            // Actualizar en la lista de usuarios
            const usuarios = JSON.parse(localStorage.getItem('usuarios_cosecovi') || '[]');
            const usuarioIndex = usuarios.findIndex(u => u.id === this.usuario.id);
            if (usuarioIndex !== -1) {
                usuarios[usuarioIndex].fotoPerfil = e.target.result;
                localStorage.setItem('usuarios_cosecovi', JSON.stringify(usuarios));
            }
            
            this.mostrarExito('Foto de perfil actualizada correctamente');
            this.ocultarModalFoto();
        };
        reader.readAsDataURL(file);
    }

    validarFortalezaPassword(password) {
        const bar = document.getElementById('password-strength-bar');
        
        // Evaluar fortaleza
        let fortaleza = 0;
        if (password.length >= 8) fortaleza += 1;
        if (/[A-Z]/.test(password)) fortaleza += 1;
        if (/[a-z]/.test(password)) fortaleza += 1;
        if (/[0-9]/.test(password)) fortaleza += 1;
        if (/[^A-Za-z0-9]/.test(password)) fortaleza += 1;
        
        // Actualizar barra visual
        bar.className = 'password-strength';
        if (fortaleza <= 2) {
            bar.classList.add('password-weak');
        } else if (fortaleza <= 4) {
            bar.classList.add('password-medium');
        } else {
            bar.classList.add('password-strong');
        }
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
                
                // Reiniciar barra de fortaleza
                document.getElementById('password-strength-bar').className = 'password-strength password-weak';
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

                // Actualizar usuario actual
                this.usuario.password = datos.nuevaPassword;
                localStorage.setItem('usuario_cosecovi', JSON.stringify(this.usuario));

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
            boton.innerHTML = `
                <i class="fas fa-key mr-2"></i>
                Actualizar Contraseña
            `;
            boton.disabled = false;
        }
    }

    cerrarSesion() {
        localStorage.removeItem('usuario_cosecovi');
        window.location.href = '../../index.html';
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

        const iconos = {
            exito: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle'
        };

        const notificacion = document.createElement('div');
        notificacion.className = `notificacion-flotante fixed top-4 right-4 p-4 rounded-lg border ${estilos[tipo]} z-50 shadow-lg`;
        notificacion.innerHTML = `
            <div class="flex items-center">
                <i class="${iconos[tipo]} mr-2"></i>
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