class TipoDenuncia {
    constructor() {
        this.formulario = document.querySelector('.form-step');
        this.init();
    }

    init() {
        this.verificarAutenticacion();
        this.inicializarEventos();
        this.inicializarSeleccion();
    }

    verificarAutenticacion() {
        const usuario = JSON.parse(localStorage.getItem('usuario_cosecovi'));
        if (!usuario) {
            window.location.href = '../../pages/auth/login.html';
            return;
        }
        
        document.getElementById('nombre-usuario').textContent = usuario.nombre;
    }

    inicializarEventos() {
        // Selección de tipo de denuncia
        document.querySelectorAll('input[name="tipoDenuncia"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.actualizarSeleccion(e.target.value);
            });
        });

        // Botón siguiente
        document.querySelector('[data-next]').addEventListener('click', () => {
            this.siguientePaso();
        });
    }

    inicializarSeleccion() {
        // Cargar selección previa si existe
        const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
        if (denunciaTemp.tipoDenuncia) {
            document.querySelector(`input[value="${denunciaTemp.tipoDenuncia}"]`).checked = true;
            this.actualizarSeleccion(denunciaTemp.tipoDenuncia);
        }
    }

    actualizarSeleccion(tipo) {
        // Remover selección previa
        document.querySelectorAll('label').forEach(label => {
            label.querySelector('.card').classList.remove('border-blue-500', 'bg-blue-50');
        });

        // Aplicar selección actual
        const labelSeleccionado = document.querySelector(`input[value="${tipo}"]`).closest('label');
        labelSeleccionado.querySelector('.card').classList.add('border-blue-500', 'bg-blue-50');
    }

    siguientePaso() {
        const tipoSeleccionado = document.querySelector('input[name="tipoDenuncia"]:checked');
        
        if (!tipoSeleccionado) {
            this.mostrarError('Por favor selecciona un tipo de denuncia');
            return;
        }

        // Guardar en denuncia temporal
        const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
        denunciaTemp.tipoDenuncia = tipoSeleccionado.value;
        localStorage.setItem('denuncia_temporal', JSON.stringify(denunciaTemp));

        // Redirigir según el tipo
        if (tipoSeleccionado.value === 'infraestructura') {
            window.location.href = 'infraestructura-simple.html'; // Pantalla simplificada
        } else {
            window.location.href = 'detalles-incidente.html';
        }
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

        setTimeout(() => {
            notificacion.remove();
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TipoDenuncia();
});