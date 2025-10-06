class DetallesIncidente {
    constructor() {
        this.maxCaracteres = 5000;
        this.init();
    }

    init() {
        this.verificarAutenticacion();
        this.configurarFechaMaxima();
        this.cargarDatosPrevios();
        this.inicializarEventos();
        this.inicializarContadorCaracteres();
    }

    verificarAutenticacion() {
        const usuario = JSON.parse(localStorage.getItem('usuario_cosecovi'));
        if (!usuario) {
            window.location.href = '../../pages/auth/login.html';
            return;
        }
        
        document.getElementById('nombre-usuario').textContent = usuario.nombre;
    }

    configurarFechaMaxima() {
        // Establecer fecha máxima como hoy
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha-incidente').max = hoy;
    }

    cargarDatosPrevios() {
        const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
        
        if (denunciaTemp.fechaIncidente) {
            document.getElementById('fecha-incidente').value = denunciaTemp.fechaIncidente;
        }
        
        if (denunciaTemp.horaIncidente) {
            document.getElementById('hora-incidente').value = denunciaTemp.horaIncidente;
        }
        
        if (denunciaTemp.lugarIncidente) {
            document.getElementById('lugar-incidente').value = denunciaTemp.lugarIncidente;
            this.mostrarLugarEspecifico(denunciaTemp.lugarIncidente);
        }
        
        if (denunciaTemp.lugarEspecifico) {
            document.getElementById('lugar-especifico').value = denunciaTemp.lugarEspecifico;
        }
        
        if (denunciaTemp.descripcionHechos) {
            document.getElementById('descripcion-hechos').value = denunciaTemp.descripcionHechos;
            this.actualizarContadorCaracteres();
        }
    }

    inicializarEventos() {
        // Validación en tiempo real
        document.getElementById('fecha-incidente').addEventListener('change', (e) => {
            this.validarFecha(e.target);
        });

        document.getElementById('hora-incidente').addEventListener('change', (e) => {
            this.validarHora(e.target);
        });

        document.getElementById('lugar-incidente').addEventListener('change', (e) => {
            this.mostrarLugarEspecifico(e.target.value);
            window.sistemaDenuncias.validarCampo(e.target);
        });

        document.getElementById('descripcion-hechos').addEventListener('input', (e) => {
            this.actualizarContadorCaracteres();
            window.sistemaDenuncias.validarCampo(e.target);
        });

        // Botón siguiente
        document.querySelector('[data-next]').addEventListener('click', () => {
            this.siguientePaso();
        });

        // Botón anterior
        document.querySelector('[data-prev]').addEventListener('click', () => {
            window.location.href = 'tipo-denuncia.html';
        });
    }

    inicializarContadorCaracteres() {
        this.actualizarContadorCaracteres();
    }

    actualizarContadorCaracteres() {
        const textarea = document.getElementById('descripcion-hechos');
        const contador = document.getElementById('contador-caracteres');
        const caracteres = textarea.value.length;
        
        contador.textContent = `${caracteres}/${this.maxCaracteres} caracteres`;
        
        if (caracteres > this.maxCaracteres * 0.9) {
            contador.classList.add('text-orange-500');
            contador.classList.remove('text-gray-500');
        } else if (caracteres > this.maxCaracteres) {
            contador.classList.add('text-red-500');
            contador.classList.remove('text-orange-500');
        } else {
            contador.classList.add('text-gray-500');
            contador.classList.remove('text-orange-500', 'text-red-500');
        }
    }

    validarFecha(campo) {
        const fechaSeleccionada = new Date(campo.value);
        const hoy = new Date();
        hoy.setHours(23, 59, 59, 999); // Fin del día actual

        const errorDiv = campo.parentNode.querySelector('.error-message');
        
        if (fechaSeleccionada > hoy) {
            errorDiv.textContent = 'La fecha no puede ser futura';
            errorDiv.style.display = 'block';
            campo.classList.add('border-red-500');
            campo.classList.remove('border-green-500');
            return false;
        } else {
            errorDiv.style.display = 'none';
            campo.classList.remove('border-red-500');
            if (campo.value) {
                campo.classList.add('border-green-500');
            }
            return true;
        }
    }

    validarHora(campo) {
        const errorDiv = campo.parentNode.querySelector('.error-message');
        
        if (!campo.value) {
            errorDiv.textContent = 'La hora es requerida';
            errorDiv.style.display = 'block';
            campo.classList.add('border-red-500');
            campo.classList.remove('border-green-500');
            return false;
        } else {
            errorDiv.style.display = 'none';
            campo.classList.remove('border-red-500');
            campo.classList.add('border-green-500');
            return true;
        }
    }

    mostrarLugarEspecifico(lugarSeleccionado) {
        const container = document.getElementById('lugar-especifico-container');
        const input = document.getElementById('lugar-especifico');
        
        if (lugarSeleccionado === 'otro') {
            container.classList.remove('hidden');
            input.setAttribute('data-validate', 'required');
            input.required = true;
        } else {
            container.classList.add('hidden');
            input.removeAttribute('data-validate');
            input.required = false;
            input.value = '';
        }
    }

    validarFormulario() {
        let valido = true;

        // Validar fecha
        const fecha = document.getElementById('fecha-incidente');
        if (!this.validarFecha(fecha)) {
            valido = false;
        }

        // Validar hora
        const hora = document.getElementById('hora-incidente');
        if (!this.validarHora(hora)) {
            valido = false;
        }

        // Validar lugar
        const lugar = document.getElementById('lugar-incidente');
        if (!window.sistemaDenuncias.validarCampo(lugar)) {
            valido = false;
        }

        // Validar lugar específico si es necesario
        const lugarEspecificoContainer = document.getElementById('lugar-especifico-container');
        if (!lugarEspecificoContainer.classList.contains('hidden')) {
            const lugarEspecifico = document.getElementById('lugar-especifico');
            if (!window.sistemaDenuncias.validarCampo(lugarEspecifico)) {
                valido = false;
            }
        }

        // Validar descripción
        const descripcion = document.getElementById('descripcion-hechos');
        if (!this.validarDescripcion(descripcion)) {
            valido = false;
        }

        return valido;
    }

    validarDescripcion(campo) {
        const valor = campo.value.trim();
        const errorDiv = campo.parentNode.querySelector('.error-message');
        
        if (!valor) {
            errorDiv.textContent = 'La descripción de los hechos es obligatoria';
            errorDiv.style.display = 'block';
            campo.classList.add('border-red-500');
            campo.classList.remove('border-green-500');
            return false;
        }

        if (valor.length < 50) {
            errorDiv.textContent = 'La descripción debe tener al menos 50 caracteres';
            errorDiv.style.display = 'block';
            campo.classList.add('border-red-500');
            campo.classList.remove('border-green-500');
            return false;
        }

        if (valor.length > this.maxCaracteres) {
            errorDiv.textContent = `La descripción no puede exceder ${this.maxCaracteres} caracteres`;
            errorDiv.style.display = 'block';
            campo.classList.add('border-red-500');
            campo.classList.remove('border-green-500');
            return false;
        }

        errorDiv.style.display = 'none';
        campo.classList.remove('border-red-500');
        campo.classList.add('border-green-500');
        return true;
    }

    obtenerDatosFormulario() {
        const formData = new FormData(document.querySelector('form'));
        const datos = Object.fromEntries(formData.entries());
        
        // Si no se seleccionó "otro", limpiar lugarEspecifico
        if (datos.lugarIncidente !== 'otro') {
            datos.lugarEspecifico = '';
        }

        return datos;
    }

    siguientePaso() {
        if (!this.validarFormulario()) {
            this.mostrarError('Por favor completa todos los campos requeridos correctamente');
            return;
        }

        const datos = this.obtenerDatosFormulario();

        // Guardar en denuncia temporal
        const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
        Object.assign(denunciaTemp, datos);
        localStorage.setItem('denuncia_temporal', JSON.stringify(denunciaTemp));

        // Redirigir al siguiente paso
        window.location.href = 'identificacion-agresor.html';
    }

    mostrarError(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = 'fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50';
        notificacion.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">⚠</span>
                <span>${mensaje}</span>
            </div>
        `;
        document.body.appendChild(notificacion);
        setTimeout(() => notificacion.remove(), 5000);
    }

    mostrarExito(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = 'fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50';
        notificacion.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">✓</span>
                <span>${mensaje}</span>
            </div>
        `;
        document.body.appendChild(notificacion);
        setTimeout(() => notificacion.remove(), 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new DetallesIncidente();
});