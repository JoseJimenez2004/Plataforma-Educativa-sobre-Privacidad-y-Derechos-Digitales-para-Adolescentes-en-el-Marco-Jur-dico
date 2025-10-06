class IdentificacionAgresor {
    constructor() {
        this.contadorAgresores = 1;
        this.maxAgresores = 10;
        this.agresores = [];
        this.init();
    }

    init() {
        this.verificarAutenticacion();
        this.cargarDatosPrevios();
        this.inicializarEventos();
        this.actualizarContador();
    }

    verificarAutenticacion() {
        const usuario = JSON.parse(localStorage.getItem('usuario_cosecovi'));
        if (!usuario) {
            window.location.href = '../../pages/auth/login.html';
            return;
        }
        
        document.getElementById('nombre-usuario').textContent = usuario.nombre;
    }

    cargarDatosPrevios() {
        const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
        
        if (denunciaTemp.agresores && denunciaTemp.agresores.length > 0) {
            this.agresores = denunciaTemp.agresores;
            this.contadorAgresores = this.agresores.length;
            this.reconstruirFormulario();
        }
    }

    reconstruirFormulario() {
        const lista = document.getElementById('lista-agresores');
        lista.innerHTML = '';

        this.agresores.forEach((agresor, index) => {
            this.agregarAgresorALista(agresor, index);
        });
    }

    inicializarEventos() {
        // Botón agregar agresor
        document.getElementById('btn-agregar-agresor').addEventListener('click', () => {
            this.agregarAgresor();
        });

        // Botón continuar sin agresores
        document.getElementById('btn-sin-agresores').addEventListener('click', () => {
            this.continuarSinAgresores();
        });

        // Botón siguiente
        document.querySelector('[data-next]').addEventListener('click', () => {
            this.siguientePaso();
        });

        // Botón anterior
        document.querySelector('[data-prev]').addEventListener('click', () => {
            window.location.href = 'detalles-incidente.html';
        });

        // Delegación de eventos para botones eliminar
        document.getElementById('lista-agresores').addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-eliminar-agresor')) {
                this.eliminarAgresor(e.target);
            }
        });
    }

    agregarAgresor(datos = null) {
        if (this.contadorAgresores >= this.maxAgresores) {
            this.mostrarError(`Solo puedes agregar hasta ${this.maxAgresores} involucrados`);
            return;
        }

        this.contadorAgresores++;
        this.agregarAgresorALista(datos, this.contadorAgresores - 1);
        this.actualizarContador();
    }

    agregarAgresorALista(datos = null, index) {
        const lista = document.getElementById('lista-agresores');
        const agresorId = index + 1;

        const agresorHTML = `
            <div class="agresor-item border rounded-lg p-4 bg-white" data-index="${index}">
                <div class="flex justify-between items-start mb-4">
                    <h4 class="font-semibold text-gray-900">Involucrado #${agresorId}</h4>
                    ${agresorId > 1 ? `
                        <button type="button" class="btn-eliminar-agresor text-red-600 hover:text-red-800 text-sm">
                            Eliminar
                        </button>
                    ` : ''}
                </div>
                
                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <label for="agresor-nombre-${agresorId}" class="form-label">Nombre o Descripción</label>
                        <input type="text" id="agresor-nombre-${agresorId}" 
                               name="agresores[${index}][nombre]" 
                               class="form-input agresor-nombre" 
                               placeholder="Nombre completo o descripción física"
                               data-validate="required"
                               value="${datos?.nombre || ''}">
                        <div class="error-message text-red-500 text-sm mt-1 hidden"></div>
                    </div>
                    
                    <div>
                        <label for="agresor-rol-${agresorId}" class="form-label">Rol o Cargo</label>
                        <select id="agresor-rol-${agresorId}" 
                                name="agresores[${index}][rol]" 
                                class="form-input agresor-rol">
                            <option value="">Selecciona un rol</option>
                            <option value="estudiante" ${datos?.rol === 'estudiante' ? 'selected' : ''}>Estudiante</option>
                            <option value="docente" ${datos?.rol === 'docente' ? 'selected' : ''}>Docente</option>
                            <option value="administrativo" ${datos?.rol === 'administrativo' ? 'selected' : ''}>Personal Administrativo</option>
                            <option value="directivo" ${datos?.rol === 'directivo' ? 'selected' : ''}>Personal Directivo</option>
                            <option value="seguridad" ${datos?.rol === 'seguridad' ? 'selected' : ''}>Personal de Seguridad</option>
                            <option value="mantenimiento" ${datos?.rol === 'mantenimiento' ? 'selected' : ''}>Personal de Mantenimiento</option>
                            <option value="externo" ${datos?.rol === 'externo' ? 'selected' : ''}>Persona Externa</option>
                            <option value="otro" ${datos?.rol === 'otro' ? 'selected' : ''}>Otro</option>
                        </select>
                    </div>
                </div>
                
                <div class="mt-4">
                    <label for="agresor-descripcion-${agresorId}" class="form-label">Descripción Adicional</label>
                    <textarea id="agresor-descripcion-${agresorId}" 
                              name="agresores[${index}][descripcion]" 
                              class="form-input agresor-descripcion" 
                              rows="3" 
                              placeholder="Características físicas, comportamiento, ubicación, etc.">${datos?.descripcion || ''}</textarea>
                </div>
            </div>
        `;

        lista.insertAdjacentHTML('beforeend', agresorHTML);

        // Re-inicializar validación para el nuevo campo
        const nuevoInput = document.getElementById(`agresor-nombre-${agresorId}`);
        if (nuevoInput) {
            nuevoInput.addEventListener('input', (e) => {
                window.sistemaDenuncias.validarCampo(e.target);
            });
        }
    }

    eliminarAgresor(boton) {
        const item = boton.closest('.agresor-item');
        const index = parseInt(item.dataset.index);

        // Remover del array
        this.agresores.splice(index, 1);
        
        // Remover del DOM
        item.remove();
        
        // Reindexar los agresores restantes
        this.reindexarAgresores();
        this.actualizarContador();
    }

    reindexarAgresores() {
        const items = document.querySelectorAll('.agresor-item');
        this.contadorAgresores = items.length;

        items.forEach((item, index) => {
            const agresorId = index + 1;
            item.dataset.index = index;
            
            // Actualizar título
            const titulo = item.querySelector('h4');
            titulo.textContent = `Involucrado #${agresorId}`;

            // Actualizar IDs y names de los inputs
            this.actualizarIdsInputs(item, index, agresorId);
        });
    }

    actualizarIdsInputs(item, index, agresorId) {
        // Actualizar input nombre
        const inputNombre = item.querySelector('.agresor-nombre');
        inputNombre.id = `agresor-nombre-${agresorId}`;
        inputNombre.name = `agresores[${index}][nombre]`;

        // Actualizar select rol
        const selectRol = item.querySelector('.agresor-rol');
        selectRol.id = `agresor-rol-${agresorId}`;
        selectRol.name = `agresores[${index}][rol]`;

        // Actualizar textarea descripción
        const textareaDesc = item.querySelector('.agresor-descripcion');
        textareaDesc.id = `agresor-descripcion-${agresorId}`;
        textareaDesc.name = `agresores[${index}][descripcion]`;
    }

    actualizarContador() {
        const botonAgregar = document.getElementById('btn-agregar-agresor');
        const contadorTexto = `(${this.contadorAgresores}/${this.maxAgresores})`;

        // Actualizar texto del botón
        botonAgregar.innerHTML = `<span class="mr-2">➕</span> Agregar otro involucrado ${contadorTexto}`;

        // Deshabilitar botón si se alcanzó el máximo
        if (this.contadorAgresores >= this.maxAgresores) {
            botonAgregar.disabled = true;
            botonAgregar.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            botonAgregar.disabled = false;
            botonAgregar.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    validarFormulario() {
        let valido = true;
        const inputsNombre = document.querySelectorAll('.agresor-nombre');

        // Validar que al menos un agresor tenga nombre si hay agresores agregados
        if (inputsNombre.length > 0) {
            inputsNombre.forEach(input => {
                if (!window.sistemaDenuncias.validarCampo(input)) {
                    valido = false;
                }
            });
        }

        return valido;
    }

    obtenerDatosAgresores() {
        const agresores = [];
        const items = document.querySelectorAll('.agresor-item');

        items.forEach(item => {
            const nombre = item.querySelector('.agresor-nombre').value.trim();
            const rol = item.querySelector('.agresor-rol').value;
            const descripcion = item.querySelector('.agresor-descripcion').value.trim();

            if (nombre) {
                agresores.push({
                    nombre: nombre,
                    rol: rol,
                    descripcion: descripcion
                });
            }
        });

        return agresores;
    }

    siguientePaso() {
        const agresores = this.obtenerDatosAgresores();

        // Si hay agresores agregados, validar que tengan nombre
        if (agresores.length > 0 && !this.validarFormulario()) {
            this.mostrarError('Por favor completa el nombre de todos los involucrados agregados');
            return;
        }

        // Guardar datos en denuncia temporal
        const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
        denunciaTemp.agresores = agresores;
        localStorage.setItem('denuncia_temporal', JSON.stringify(denunciaTemp));

        // Redirigir al siguiente paso
        window.location.href = 'cuestionario-filtro.html';
    }

    continuarSinAgresores() {
        // Guardar array vacío de agresores
        const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
        denunciaTemp.agresores = [];
        localStorage.setItem('denuncia_temporal', JSON.stringify(denunciaTemp));

        // Redirigir al siguiente paso
        window.location.href = 'cuestionario-filtro.html';
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
    new IdentificacionAgresor();
});