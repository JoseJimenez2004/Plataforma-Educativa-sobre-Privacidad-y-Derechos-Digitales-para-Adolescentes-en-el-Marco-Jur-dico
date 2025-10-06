class GestorArchivos {
    constructor() {
        this.archivos = [];
        this.tiposPermitidos = {
            imagen: ['image/jpeg', 'image/jpg'],
            video: ['video/mp4'],
            audio: ['audio/mp3', 'audio/mpeg'],
            documento: ['application/pdf']
        };
        this.limitesTamano = {
            imagen: 1 * 1024 * 1024, // 1MB
            video: 10 * 1024 * 1024, // 10MB
            audio: 5 * 1024 * 1024, // 5MB
            documento: 1 * 1024 * 1024 // 1MB
        };
    }

    inicializarDropzone(contenedorId) {
        const contenedor = document.getElementById(contenedorId);
        const inputArchivo = contenedor.querySelector('input[type="file"]');
        const areaDrop = contenedor.querySelector('.file-upload-area');

        // Eventos de drag and drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            areaDrop.addEventListener(eventName, this.prevenirDefault, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            areaDrop.addEventListener(eventName, () => this.resaltarArea(areaDrop), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            areaDrop.addEventListener(eventName, () => this.quitarResaltado(areaDrop), false);
        });

        areaDrop.addEventListener('drop', (e) => this.manejarDrop(e, inputArchivo), false);
        inputArchivo.addEventListener('change', (e) => this.manejarSeleccion(e), false);
    }

    prevenirDefault(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    resaltarArea(area) {
        area.classList.add('dragover');
    }

    quitarResaltado(area) {
        area.classList.remove('dragover');
    }

    manejarDrop(e, inputArchivo) {
        const archivos = e.dataTransfer.files;
        inputArchivo.files = archivos;
        this.manejarSeleccion({ target: inputArchivo });
    }

    async manejarSeleccion(e) {
        const archivos = Array.from(e.target.files);
        
        for (const archivo of archivos) {
            const resultado = await this.validarArchivo(archivo);
            
            if (resultado.valido) {
                this.archivos.push(archivo);
                this.mostrarArchivoEnLista(archivo);
            } else {
                this.mostrarError(`Error en ${archivo.name}: ${resultado.error}`);
            }
        }

        this.actualizarContador();
    }

    validarArchivo(archivo) {
        // Determinar tipo de archivo
        let tipo = null;
        for (const [key, tipos] of Object.entries(this.tiposPermitidos)) {
            if (tipos.includes(archivo.type)) {
                tipo = key;
                break;
            }
        }

        if (!tipo) {
            return { valido: false, error: 'Tipo de archivo no permitido' };
        }

        // Validar tamaño
        if (archivo.size > this.limitesTamano[tipo]) {
            return { valido: false, error: `Tamaño excede el límite de ${this.limitesTamano[tipo] / 1024 / 1024}MB` };
        }

        return { valido: true, tipo: tipo };
    }

    mostrarArchivoEnLista(archivo) {
        const lista = document.getElementById('lista-archivos');
        const elemento = document.createElement('div');
        elemento.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
        elemento.innerHTML = `
            <div class="flex items-center">
                <span class="text-2xl mr-3">${this.obtenerIcono(archivo.type)}</span>
                <div>
                    <p class="font-medium">${archivo.name}</p>
                    <p class="text-sm text-gray-500">${this.formatearTamano(archivo.size)}</p>
                </div>
            </div>
            <button type="button" class="text-red-500 hover:text-red-700" onclick="gestorArchivos.eliminarArchivo('${archivo.name}')">
                ×
            </button>
        `;
        lista.appendChild(elemento);
    }

    obtenerIcono(tipoMIME) {
        const iconos = {
            'image/jpeg': '🖼️',
            'image/jpg': '🖼️',
            'video/mp4': '🎬',
            'audio/mp3': '🎵',
            'audio/mpeg': '🎵',
            'application/pdf': '📄'
        };
        return iconos[tipoMIME] || '📎';
    }

    formatearTamano(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    eliminarArchivo(nombreArchivo) {
        this.archivos = this.archivos.filter(archivo => archivo.name !== nombreArchivo);
        this.actualizarLista();
        this.actualizarContador();
    }

    actualizarLista() {
        const lista = document.getElementById('lista-archivos');
        lista.innerHTML = '';
        this.archivos.forEach(archivo => this.mostrarArchivoEnLista(archivo));
    }

    actualizarContador() {
        const contador = document.getElementById('contador-archivos');
        if (contador) {
            contador.textContent = `${this.archivos.length} archivo(s) seleccionado(s)`;
        }
    }

    obtenerArchivos() {
        return this.archivos;
    }

    limpiarArchivos() {
        this.archivos = [];
        this.actualizarLista();
        this.actualizarContador();
    }

    mostrarError(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = 'fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50';
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);
        setTimeout(() => notificacion.remove(), 5000);
    }
}

// Instancia global
window.gestorArchivos = new GestorArchivos();