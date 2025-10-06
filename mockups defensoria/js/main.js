// Configuración global y utilidades
class SistemaDenuncias {
    constructor() {
        this.usuario = null;
        this.denunciaActual = null;
        this.init();
    }

    init() {
        this.cargarUsuario();
        this.inicializarNavegacion();
        this.inicializarEventosGlobales();
    }

    cargarUsuario() {
        const usuarioGuardado = localStorage.getItem('usuario_cosecovi');
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

    validarCampo(campo) {
        const tipo = campo.dataset.validate;
        const valor = campo.value.trim();
        const mensajeError = campo.parentNode.querySelector('.error-message');
        
        let valido = true;
        let mensaje = '';

        switch (tipo) {
            case 'email':
                const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                valido = regexEmail.test(valor);
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
        }

        if (mensajeError) {
            mensajeError.textContent = mensaje;
            mensajeError.style.display = mensaje ? 'block' : 'none';
        }

        campo.classList.toggle('border-red-500', !valido);
        campo.classList.toggle('border-green-500', valido && valor.length > 0);

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
        if (!this.denunciaActual) {
            this.denunciaActual = {};
        }

        const datosFormulario = new FormData(formulario);
        const datos = Object.fromEntries(datosFormulario.entries());
        
        Object.assign(this.denunciaActual, datos);
        localStorage.setItem('denuncia_temporal', JSON.stringify(this.denunciaActual));
    }

    async enviarDenuncia() {
        if (!this.denunciaActual) return false;

        try {
            // Simular envío al servidor
            const respuesta = await this.simularEnvioServidor(this.denunciaActual);
            
            if (respuesta.exito) {
                localStorage.removeItem('denuncia_temporal');
                this.denunciaActual = null;
                return respuesta;
            }
        } catch (error) {
            console.error('Error al enviar denuncia:', error);
            return false;
        }
    }

    simularEnvioServidor(datos) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generar folio único
                const folio = 'DEN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
                
                resolve({
                    exito: true,
                    folio: folio,
                    fecha: new Date().toISOString(),
                    clasificacion: this.clasificarDenuncia(datos)
                });
            }, 2000);
        });
    }

    clasificarDenuncia(datos) {
        // Simulación del algoritmo de clasificación K-NN
        const clasificaciones = [
            'Acoso Sexual',
            'Violencia Física',
            'Discriminación',
            'Acoso Laboral',
            'Otro'
        ];
        
        return clasificaciones[Math.floor(Math.random() * clasificaciones.length)];
    }

    cerrarSesion() {
        localStorage.removeItem('usuario_cosecovi');
        this.usuario = null;
        this.actualizarUIUsuario();
        window.location.href = 'index.html';
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.sistemaDenuncias = new SistemaDenuncias();
});

// Utilidades adicionales
const Utils = {
    formatFecha: (fechaISO) => {
        return new Date(fechaISO).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    generarFolio: () => {
        return 'DEN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    },

    validarArchivo: (archivo, tipo, maxSizeMB) => {
        const tiposPermitidos = {
            'image': ['image/jpeg', 'image/jpg'],
            'video': ['video/mp4'],
            'audio': ['audio/mp3', 'audio/mpeg'],
            'document': ['application/pdf']
        };

        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (!tiposPermitidos[tipo].includes(archivo.type)) {
            return { valido: false, error: `Tipo de archivo no permitido. Debe ser: ${tipo}` };
        }

        if (archivo.size > maxSizeBytes) {
            return { valido: false, error: `El archivo excede el tamaño máximo de ${maxSizeMB}MB` };
        }

        return { valido: true, error: null };
    }
};