class CargaPruebas {
    constructor() {
        this.archivos = [];
        this.maxTamanoTotal = 20 * 1024 * 1024; // 20MB
        this.tiposPermitidos = {
            'image/jpeg': { tamanoMax: 1 * 1024 * 1024, icono: '🖼️', tipo: 'Imagen' },
            'image/jpg': { tamanoMax: 1 * 1024 * 1024, icono: '🖼️', tipo: 'Imagen' },
            'image/png': { tamanoMax: 1 * 1024 * 1024, icono: '🖼️', tipo: 'Imagen' },
            'video/mp4': { tamanoMax: 10 * 1024 * 1024, icono: '🎬', tipo: 'Video' },
            'video/quicktime': { tamanoMax: 10 * 1024 * 1024, icono: '🎬', tipo: 'Video' },
            'audio/mpeg': { tamanoMax: 5 * 1024 * 1024, icono: '🎵', tipo: 'Audio' },
            'audio/wav': { tamanoMax: 5 * 1024 * 1024, icono: '🎵', tipo: 'Audio' },
            'application/pdf': { tamanoMax: 1 * 1024 * 1024, icono: '📄', tipo: 'Documento' },
            'application/msword': { tamanoMax: 1 * 1024 * 1024, icono: '📄', tipo: 'Documento' },
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { tamanoMax: 1 * 1024 * 1024, icono: '📄', tipo: 'Documento' }
        };
        this.init();
    }

    init() {
        this.verificarAutenticacion();
        this.cargarArchivosPrevios();
        this.inicializarEventos();
        this.inicializarDropzone();
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

    cargarArchivosPrevios() {
        const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
        
        if (denunciaTemp.archivos && Array.isArray(denunciaTemp.archivos)) {
            this.archivos = denunciaTemp.archivos;
            this.mostrarListaArchivos();
        }
    }

    inicializarEventos() {
        // Botón seleccionar archivos
        document.getElementById('btn-seleccionar-archivos').addEventListener('click', () => {
            document.getElementById('input-archivos').click();
        });

        // Input file change
        document.getElementById('input-archivos').addEventListener('change', (e) => {
            this.manejarSeleccionArchivos(e.target.files);
        });

        // Botón siguiente
        document.querySelector('[data-next]').addEventListener('click', () => {
            this.siguientePaso();
        });

        // Botón anterior
        document.querySelector('[data-prev]').addEventListener('click', () => {
            window.location.href = 'cuestionario-ponderacion.html';
        });

        // Botón continuar sin pruebas
        document.getElementById('btn-sin-pruebas').addEventListener('click', () => {
            this.mostrarModalAdvertencia();
        });

        // Modal de advertencia
        document.getElementById('btn-cancelar-advertencia').addEventListener('click', () => {
            this.ocultarModalAdvertencia();
        });

        document.getElementById('btn-confirmar-sin-pruebas').addEventListener('click', () => {
            this.continuarSinPruebas();
        });

        // Delegación de eventos para botones eliminar
        document.getElementById('lista-archivos').addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-eliminar-archivo')) {
                this.eliminarArchivo(e.target);
            }
        });
    }

    inicializarDropzone() {
        const dropZone = document.getElementById('drop-zone');
        
        // Prevenir comportamientos por defecto
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.prevenirDefault, false);
        });

        // Resaltar área durante drag
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => this.resaltarArea(), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => this.quitarResaltado(), false);
        });

        // Manejar drop
        dropZone.addEventListener('drop', (e) => {
            this.manejarDrop(e);
        }, false);
    }

    prevenirDefault(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    resaltarArea() {
        const dropZone = document.getElementById('drop-zone');
        dropZone.classList.add('dragover', 'bg-blue-50', 'border-blue-400');
    }

    quitarResaltado() {
        const dropZone = document.getElementById('drop-zone');
        dropZone.classList.remove('dragover', 'bg-blue-50', 'border-blue-400');
    }

    manejarDrop(e) {
        const archivos = e.dataTransfer.files;
        this.manejarSeleccionArchivos(archivos);
    }

    manejarSeleccionArchivos(archivosLista) {
        const archivosArray = Array.from(archivosLista);
        let archivosValidos = 0;

        archivosArray.forEach(archivo => {
            const validacion = this.validarArchivo(archivo);
            
            if (validacion.valido) {
                this.agregarArchivo(archivo);
                archivosValidos++;
            } else {
                this.mostrarError(`"${archivo.name}" - ${validacion.error}`);
            }
        });

        if (archivosValidos > 0) {
            this.mostrarExito(`${archivosValidos} archivo(s) agregado(s) correctamente`);
        }

        this.actualizarContador();
        this.mostrarListaArchivos();
        
        // Limpiar input
        document.getElementById('input-archivos').value = '';
    }

    validarArchivo(archivo) {
        // Verificar tipo
        if (!this.tiposPermitidos[archivo.type]) {
            return { 
                valido: false, 
                error: 'Tipo de archivo no permitido. Formatos aceptados: JPG, PNG, MP4, MP3, PDF, DOC' 
            };
        }

        // Verificar tamaño individual
        const tamanoMaxIndividual = this.tiposPermitidos[archivo.type].tamanoMax;
        if (archivo.size > tamanoMaxIndividual) {
            const tamanoMB = tamanoMaxIndividual / (1024 * 1024);
            return { 
                valido: false, 
                error: `El archivo excede el tamaño máximo de ${tamanoMB}MB` 
            };
        }

        // Verificar tamaño total
        const tamanoTotalActual = this.archivos.reduce((total, arch) => total + arch.size, 0);
        if (tamanoTotalActual + archivo.size > this.maxTamanoTotal) {
            return { 
                valido: false, 
                error: 'Se excedió el límite total de 20MB. Elimina algunos archivos o usa archivos más pequeños.' 
            };
        }

        // Verificar duplicados
        if (this.archivos.some(arch => arch.name === archivo.name && arch.size === archivo.size)) {
            return { 
                valido: false, 
                error: 'Este archivo ya fue agregado' 
            };
        }

        return { valido: true };
    }

    agregarArchivo(archivo) {
        this.archivos.push(archivo);
    }

    eliminarArchivo(boton) {
        const nombreArchivo = boton.dataset.nombre;
        this.archivos = this.archivos.filter(archivo => archivo.name !== nombreArchivo);
        this.actualizarContador();
        this.mostrarListaArchivos();
        this.mostrarExito('Archivo eliminado');
    }

    mostrarListaArchivos() {
        const lista = document.getElementById('lista-archivos');
        const sinArchivos = document.getElementById('sin-archivos');

        if (this.archivos.length === 0) {
            lista.innerHTML = '';
            lista.appendChild(sinArchivos);
            sinArchivos.classList.remove('hidden');
            return;
        }

        sinArchivos.classList.add('hidden');
        lista.innerHTML = '';

        this.archivos.forEach(archivo => {
            const info = this.tiposPermitidos[archivo.type] || { icono: '📎', tipo: 'Archivo' };
            const elemento = document.createElement('div');
            elemento.className = 'flex items-center justify-between p-4 bg-gray-50 rounded-lg border';
            elemento.innerHTML = `
                <div class="flex items-center space-x-4">
                    <span class="text-2xl">${info.icono}</span>
                    <div>
                        <p class="font-medium text-gray-900">${archivo.name}</p>
                        <p class="text-sm text-gray-500">
                            ${info.tipo} • ${this.formatearTamano(archivo.size)}
                        </p>
                    </div>
                </div>
                <button type="button" class="btn-eliminar-archivo text-red-500 hover:text-red-700" 
                        data-nombre="${archivo.name}">
                    ×
                </button>
            `;
            lista.appendChild(elemento);
        });
    }

    formatearTamano(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    actualizarContador() {
        const contador = document.getElementById('contador-archivos');
        const tamanoTotal = this.archivos.reduce((total, arch) => total + arch.size, 0);
        
        contador.textContent = `${this.archivos.length} archivos • ${this.formatearTamano(tamanoTotal)} / 20MB`;
        
        // Cambiar color si se acerca al límite
        if (tamanoTotal > this.maxTamanoTotal * 0.8) {
            contador.classList.add('text-orange-500');
            contador.classList.remove('text-gray-500');
        } else {
            contador.classList.remove('text-orange-500');
            contador.classList.add('text-gray-500');
        }
    }

    mostrarModalAdvertencia() {
        document.getElementById('modal-advertencia').classList.remove('hidden');
    }

    ocultarModalAdvertencia() {
        document.getElementById('modal-advertencia').classList.add('hidden');
    }

    continuarSinPruebas() {
        this.ocultarModalAdvertencia();
        this.archivos = [];
        this.guardarArchivos();
        window.location.href = 'revision-envio.html';
    }

    siguientePaso() {
        this.guardarArchivos();
        window.location.href = 'revision-envio.html';
    }

    guardarArchivos() {
        const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
        denunciaTemp.archivos = this.archivos;
        localStorage.setItem('denuncia_temporal', JSON.stringify(denunciaTemp));
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
    new CargaPruebas();
});