// Configuración global para Defensoría de los Derechos Politécnicos
class SistemaDefensoria {
    constructor() {
        this.usuario = null;
        this.solicitudActual = null;
        this.init();
    }

    init() {
        this.cargarUsuario();
        this.inicializarNavegacion();
        this.inicializarEventosGlobales();
        this.inicializarAnimaciones();
        this.inicializarFormularioContacto();
    }

    cargarUsuario() {
        const usuarioGuardado = localStorage.getItem('usuario_defensoria');
        if (usuarioGuardado) {
            this.usuario = JSON.parse(usuarioGuardado);
            this.actualizarUIUsuario();
        }
    }

    actualizarUIUsuario() {
        const elementosNoAuth = document.querySelectorAll('.no-auth');
        const elementosAuth = document.querySelectorAll('.auth-only');
        
        if (this.usuario) {
            elementosNoAuth.forEach(el => el.style.display = 'none');
            elementosAuth.forEach(el => el.style.display = 'block');
            
            // Actualizar nombre de usuario en la UI si existe
            const nombreUsuario = document.getElementById('nombre-usuario');
            if (nombreUsuario) {
                nombreUsuario.textContent = this.usuario.nombre;
            }
        } else {
            elementosNoAuth.forEach(el => el.style.display = 'block');
            elementosAuth.forEach(el => el.style.display = 'none');
        }
    }

    inicializarNavegacion() {
        // Smooth scroll para enlaces internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Navegación entre pasos del formulario
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-next]')) {
                this.siguientePaso(e.target);
            }
            if (e.target.matches('[data-prev]')) {
                this.pasoAnterior(e.target);
            }
        });
    }

    inicializarEventosGlobales() {
        // Cerrar sesión
        document.addEventListener('click', (e) => {
            if (e.target.matches('#cerrar-sesion')) {
                e.preventDefault();
                this.cerrarSesion();
            }
        });

        // Validación de formularios en tiempo real
        document.addEventListener('input', (e) => {
            if (e.target.matches('[data-validate]')) {
                this.validarCampo(e.target);
            }
        });
    }

    inicializarAnimaciones() {
        // Animación de aparición de elementos al hacer scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-visible');
                }
            });
        }, observerOptions);

        // Observar elementos para animación
        document.querySelectorAll('.mission-card, .servicio-card, .funcion-item').forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });
    }

    inicializarFormularioContacto() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.enviarFormularioContacto(contactForm);
            });
        }
    }

    enviarFormularioContacto(form) {
        const formData = new FormData(form);
        const datos = Object.fromEntries(formData.entries());
        
        // Validar formulario
        if (this.validarFormularioContacto(datos)) {
            // Simular envío
            this.mostrarNotificacion('success', 'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.');
            form.reset();
        } else {
            this.mostrarNotificacion('error', 'Por favor completa todos los campos correctamente.');
        }
    }

    validarFormularioContacto(datos) {
        return datos.nombre && datos.email && datos.mensaje && 
               this.validarEmail(datos.email);
    }

    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    validarCampo(campo) {
        const tipo = campo.dataset.validate;
        const valor = campo.value.trim();
        const mensajeError = campo.parentNode.querySelector('.error-message');
        
        let valido = true;
        let mensaje = '';

        switch (tipo) {
            case 'email':
                valido = this.validarEmail(valor);
                mensaje = valido ? '' : 'Ingresa un correo electrónico válido';
                break;
            
            case 'required':
                valido = valor.length > 0;
                mensaje = valido ? '' : 'Este campo es obligatorio';
                break;
            
            case 'password':
                valido = valor.length >= 8 && 
                         /[A-Z]/.test(valor) && 
                         /[a-z]/.test(valor) && 
                         /[0-9]/.test(valor) && 
                         /[^A-Za-z0-9]/.test(valor);
                mensaje = valido ? '' : 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales';
                break;
            
            case 'boleta':
                const regexBoleta = /^[0-9]{10}$/;
                valido = regexBoleta.test(valor);
                mensaje = valido ? '' : 'La boleta debe tener 10 dígitos';
                break;
        }

        if (mensajeError) {
            mensajeError.textContent = mensaje;
            mensajeError.style.display = mensaje ? 'block' : 'none';
        }

        campo.classList.toggle('error', !valido);
        campo.classList.toggle('success', valido && valor.length > 0);

        return valido;
    }

    siguientePaso(boton) {
        const formularioActual = boton.closest('.form-step');
        const pasoActual = parseInt(formularioActual.dataset.step);
        const siguientePaso = pasoActual + 1;

        // Validar formulario actual antes de avanzar
        if (this.validarFormulario(formularioActual)) {
            this.guardarPasoActual(formularioActual);
            this.mostrarPaso(siguientePaso);
            this.actualizarProgreso(siguientePaso);
        }
    }

    pasoAnterior(boton) {
        const formularioActual = boton.closest('.form-step');
        const pasoActual = parseInt(formularioActual.dataset.step);
        const pasoAnterior = pasoActual - 1;

        this.mostrarPaso(pasoAnterior);
        this.actualizarProgreso(pasoAnterior);
    }

    mostrarPaso(numeroPaso) {
        // Ocultar todos los pasos
        document.querySelectorAll('.form-step').forEach(paso => {
            paso.classList.add('hidden');
        });

        // Mostrar paso específico
        const paso = document.querySelector(`[data-step="${numeroPaso}"]`);
        if (paso) {
            paso.classList.remove('hidden');
            paso.classList.add('fade-in');
        }
    }

    actualizarProgreso(pasoActual) {
        const barraProgreso = document.querySelector('.progress-fill');
        const totalPasos = document.querySelectorAll('.form-step').length;
        const porcentaje = ((pasoActual - 1) / (totalPasos - 1)) * 100;
        
        if (barraProgreso) {
            barraProgreso.style.width = `${porcentaje}%`;
        }

        // Actualizar indicadores numéricos
        document.querySelectorAll('.step-indicator').forEach((indicador, index) => {
            const numeroPaso = index + 1;
            if (numeroPaso < pasoActual) {
                indicador.innerHTML = '✓';
                indicador.classList.remove('step-indicator-inactive');
                indicador.classList.add('step-indicator');
            } else if (numeroPaso === pasoActual) {
                indicador.innerHTML = numeroPaso;
                indicador.classList.remove('step-indicator-inactive');
                indicador.classList.add('step-indicator');
            } else {
                indicador.innerHTML = numeroPaso;
                indicador.classList.remove('step-indicator');
                indicador.classList.add('step-indicator-inactive');
            }
        });
    }

    validarFormulario(formulario) {
        let valido = true;
        const campos = formulario.querySelectorAll('[data-validate]');

        campos.forEach(campo => {
            if (!this.validarCampo(campo)) {
                valido = false;
            }
        });

        return valido;
    }

    guardarPasoActual(formulario) {
        if (!this.solicitudActual) {
            this.solicitudActual = {};
        }

        const datosFormulario = new FormData(formulario);
        const datos = Object.fromEntries(datosFormulario.entries());
        
        Object.assign(this.solicitudActual, datos);
        localStorage.setItem('solicitud_temporal', JSON.stringify(this.solicitudActual));
    }

    async enviarSolicitud() {
        if (!this.solicitudActual) return false;

        try {
            // Simular envío al servidor
            const respuesta = await this.simularEnvioServidor(this.solicitudActual);
            
            if (respuesta.exito) {
                localStorage.removeItem('solicitud_temporal');
                this.solicitudActual = null;
                this.mostrarNotificacion('success', `Solicitud enviada correctamente. Folio: ${respuesta.folio}`);
                return respuesta;
            }
        } catch (error) {
            console.error('Error al enviar solicitud:', error);
            this.mostrarNotificacion('error', 'Error al enviar la solicitud. Intenta nuevamente.');
            return false;
        }
    }

    simularEnvioServidor(datos) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generar folio único
                const folio = 'SOL-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
                
                resolve({
                    exito: true,
                    folio: folio,
                    fecha: new Date().toISOString(),
                    tipoAsesoria: this.clasificarSolicitud(datos),
                    mensaje: 'Su solicitud ha sido recibida. Un defensor se pondrá en contacto con usted en un plazo máximo de 48 horas.'
                });
            }, 2000);
        });
    }

    clasificarSolicitud(datos) {
        // Simulación del algoritmo de clasificación
        const tiposAsesoria = [
            'Asesoría Jurídica',
            'Mediación de Conflictos',
            'Protección de Derechos Académicos',
            'Orientación en Procedimientos Administrativos',
            'Quejas y Sugerencias'
        ];
        
        return tiposAsesoria[Math.floor(Math.random() * tiposAsesoria.length)];
    }

    mostrarNotificacion(tipo, mensaje) {
        // Crear elemento de notificación
        const notificacion = document.createElement('div');
        notificacion.className = `notification ${tipo}`;
        notificacion.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${mensaje}</span>
            </div>
        `;

        // Agregar estilos si no existen
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 16px 20px;
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    z-index: 1000;
                    animation: slideInRight 0.3s ease-out;
                    max-width: 400px;
                }
                .notification.success {
                    background: #10b981;
                    color: white;
                    border-left: 4px solid #059669;
                }
                .notification.error {
                    background: #ef4444;
                    color: white;
                    border-left: 4px solid #dc2626;
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notificacion);

        // Remover después de 5 segundos
        setTimeout(() => {
            notificacion.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.parentNode.removeChild(notificacion);
                }
            }, 300);
        }, 5000);
    }

    cerrarSesion() {
        localStorage.removeItem('usuario_defensoria');
        this.usuario = null;
        this.actualizarUIUsuario();
        window.location.href = 'index.html';
    }
}

// Utilidades para Defensoría
const UtilsDefensoria = {
    formatFecha: (fechaISO) => {
        return new Date(fechaISO).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    generarFolio: () => {
        return 'SOL-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    },

    validarArchivo: (archivo, tipo, maxSizeMB) => {
        const tiposPermitidos = {
            'image': ['image/jpeg', 'image/jpg', 'image/png'],
            'video': ['video/mp4'],
            'audio': ['audio/mp3', 'audio/mpeg'],
            'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        };

        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (!tiposPermitidos[tipo].includes(archivo.type)) {
            return { valido: false, error: `Tipo de archivo no permitido. Debe ser: ${tipo}` };
        }

        if (archivo.size > maxSizeBytes) {
            return { valido: false, error: `El archivo excede el tamaño máximo de ${maxSizeMB}MB` };
        }

        return { valido: true, error: null };
    },
    
    obtenerUnidadesAcademicas: () => {
        return [
            'ESCOM - Escuela Superior de Cómputo',
            'ESIME - Escuela Superior de Ingeniería Mecánica y Eléctrica',
            'ESIQIE - Escuela Superior de Ingeniería Química e Industrias Extractivas',
            'ESIT - Escuela Superior de Ingeniería Textil',
            'ESIA - Escuela Superior de Ingeniería y Arquitectura',
            'ENCB - Escuela Nacional de Ciencias Biológicas',
            'ESFM - Escuela Superior de Física y Matemáticas',
            'CECyT - Centro de Estudios Científicos y Tecnológicos',
            'Otro'
        ];
    }
};

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.sistemaDefensoria = new SistemaDefensoria();
    
    // Agregar estilos para animaciones
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
        .fade-in {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .fade-in-visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .form-input.error {
            border-color: #ef4444;
        }
        
        .form-input.success {
            border-color: #10b981;
        }
        
        .error-message {
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: none;
        }
        
        .error-message.show {
            display: block;
        }
    `;
    document.head.appendChild(animationStyles);
});