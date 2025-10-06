class RevisionEnvio {
    constructor() {
        this.denuncia = null;
        this.usuario = null;
        this.init();
    }

    init() {
        this.verificarAutenticacion();
        this.cargarDatosDenuncia();
        this.inicializarEventos();
        this.mostrarResumen();
    }

    verificarAutenticacion() {
        this.usuario = JSON.parse(localStorage.getItem('usuario_cosecovi'));
        if (!this.usuario) {
            window.location.href = '../../pages/auth/login.html';
            return;
        }
        
        document.getElementById('nombre-usuario').textContent = this.usuario.nombre;
    }

    cargarDatosDenuncia() {
        const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
        this.denuncia = denunciaTemp;
        
        if (!this.denuncia || Object.keys(this.denuncia).length === 0) {
            this.mostrarError('No se encontraron datos de denuncia. Por favor, comienza nuevamente.');
            setTimeout(() => {
                window.location.href = 'tipo-denuncia.html';
            }, 3000);
            return;
        }
    }

    inicializarEventos() {
        // Botón anterior
        document.querySelector('[data-prev]').addEventListener('click', () => {
            window.location.href = 'carga-pruebas.html';
        });

        // Botón guardar borrador
        document.getElementById('btn-guardar-borrador').addEventListener('click', () => {
            this.guardarBorrador();
        });

        // Botón enviar denuncia
        document.getElementById('btn-enviar-denuncia').addEventListener('click', () => {
            this.mostrarModalConfirmacion();
        });

        // Modal de confirmación
        document.getElementById('btn-cancelar-envio').addEventListener('click', () => {
            this.ocultarModalConfirmacion();
        });

        document.getElementById('btn-confirmar-envio').addEventListener('click', () => {
            this.enviarDenuncia();
        });

        // Validación de declaración de veracidad
        document.getElementById('declaracion-veracidad').addEventListener('change', (e) => {
            this.validarDeclaracionVeracidad();
        });
    }

    mostrarResumen() {
        this.mostrarTipoDenuncia();
        this.mostrarDetallesIncidente();
        this.mostrarAgresores();
        this.mostrarClasificacion();
        this.mostrarArchivos();
    }

    mostrarTipoDenuncia() {
        const tipo = this.denuncia.tipoDenuncia;
        const elemento = document.getElementById('resumen-tipo');
        
        if (tipo === 'personal') {
            elemento.textContent = 'Denuncia Personal - Situaciones que afectan directamente a personas';
        } else if (tipo === 'infraestructura') {
            elemento.textContent = 'Infraestructura - Reportes sobre instalaciones y equipamiento';
        } else {
            elemento.textContent = 'No especificado';
        }
    }

    mostrarDetallesIncidente() {
        // Fecha y hora
        if (this.denuncia.fechaIncidente) {
            const fecha = new Date(this.denuncia.fechaIncidente);
            document.getElementById('resumen-fecha').textContent = fecha.toLocaleDateString('es-MX');
        }
        
        if (this.denuncia.horaIncidente) {
            document.getElementById('resumen-hora').textContent = this.denuncia.horaIncidente;
        }

        // Lugar
        if (this.denuncia.lugarIncidente) {
            document.getElementById('resumen-lugar').textContent = this.denuncia.lugarIncidente;
        }

        // Descripción
        if (this.denuncia.descripcionHechos) {
            document.getElementById('resumen-descripcion').textContent = this.denuncia.descripcionHechos;
        }
    }

    mostrarAgresores() {
        const contenedor = document.getElementById('resumen-agresores');
        contenedor.innerHTML = '';

        if (this.denuncia.agresores && this.denuncia.agresores.length > 0) {
            this.denuncia.agresores.forEach((agresor, index) => {
                const div = document.createElement('div');
                div.className = 'bg-gray-50 rounded-lg p-3';
                div.innerHTML = `
                    <p class="font-medium">${agresor.nombre || 'No especificado'}</p>
                    ${agresor.rol ? `<p class="text-sm text-gray-600">Rol: ${agresor.rol}</p>` : ''}
                    ${agresor.descripcion ? `<p class="text-sm text-gray-600 mt-1">${agresor.descripcion}</p>` : ''}
                `;
                contenedor.appendChild(div);
            });
        } else {
            contenedor.innerHTML = '<p class="text-gray-500">No se especificaron involucrados</p>';
        }
    }

    mostrarClasificacion() {
        const elemento = document.getElementById('resumen-clasificacion');
        
        // Simular clasificación basada en los cuestionarios
        if (this.denuncia.respuestasFiltro || this.denuncia.respuestasPonderacion) {
            const clasificacion = this.clasificarIncidente();
            elemento.textContent = clasificacion;
            elemento.className = 'inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium';
        } else {
            elemento.textContent = 'Por determinar (se asignará después del análisis)';
            elemento.className = 'inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm';
        }
    }

    clasificarIncidente() {
        // Simulación del algoritmo de clasificación K-NN
        const clasificaciones = [
            'Acoso Sexual',
            'Violencia Física',
            'Discriminación',
            'Acoso Laboral',
            'Hostigamiento',
            'Violencia Psicológica',
            'Otro Tipo de Violencia'
        ];
        
        // Basado en las respuestas de los cuestionarios (simulado)
        let indice = 0;
        if (this.denuncia.respuestasPonderacion) {
            const suma = Object.values(this.denuncia.respuestasPonderacion).reduce((a, b) => a + b, 0);
            indice = Math.min(Math.floor(suma / 20), clasificaciones.length - 1);
        }
        
        return clasificaciones[indice];
    }

    mostrarArchivos() {
        const contenedor = document.getElementById('resumen-archivos');
        const sinArchivos = document.getElementById('sin-archivos');
        
        if (this.denuncia.archivos && this.denuncia.archivos.length > 0) {
            contenedor.innerHTML = '';
            sinArchivos.classList.add('hidden');
            
            this.denuncia.archivos.forEach((archivo, index) => {
                const div = document.createElement('div');
                div.className = 'flex items-center justify-between p-2 bg-gray-50 rounded';
                div.innerHTML = `
                    <div class="flex items-center">
                        <span class="text-lg mr-2">${this.obtenerIconoArchivo(archivo.type)}</span>
                        <div>
                            <p class="text-sm font-medium">${archivo.name}</p>
                            <p class="text-xs text-gray-500">${this.formatearTamano(archivo.size)}</p>
                        </div>
                    </div>
                `;
                contenedor.appendChild(div);
            });
        } else {
            contenedor.innerHTML = '';
            sinArchivos.classList.remove('hidden');
        }
    }

    obtenerIconoArchivo(tipoMIME) {
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

    validarDeclaracionVeracidad() {
        const declaracion = document.getElementById('declaracion-veracidad');
        const errorDiv = document.getElementById('error-declaracion');
        
        if (!declaracion.checked) {
            errorDiv.classList.remove('hidden');
            return false;
        } else {
            errorDiv.classList.add('hidden');
            return true;
        }
    }

    guardarBorrador() {
        // Guardar denuncia como borrador en localStorage
        this.denuncia.estatus = 'borrador';
        this.denuncia.fechaGuardado = new Date().toISOString();
        
        // Guardar en el historial de borradores del usuario
        const borradores = JSON.parse(localStorage.getItem(`borradores_${this.usuario.id}`) || '[]');
        borradores.push(this.denuncia);
        localStorage.setItem(`borradores_${this.usuario.id}`, JSON.stringify(borradores));
        
        this.mostrarExito('Borrador guardado correctamente. Puedes continuar más tarde.');
    }

    mostrarModalConfirmacion() {
        if (!this.validarDeclaracionVeracidad()) {
            this.mostrarError('Debes aceptar la declaración de veracidad');
            return;
        }

        const modal = document.getElementById('modal-confirmacion');
        modal.classList.remove('hidden');
    }

    ocultarModalConfirmacion() {
        const modal = document.getElementById('modal-confirmacion');
        modal.classList.add('hidden');
    }

    async enviarDenuncia() {
        this.ocultarModalConfirmacion();
        this.mostrarCargando(true);

        try {
            // Preparar datos finales de la denuncia
            const denunciaFinal = {
                ...this.denuncia,
                id: 'DEN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                usuarioId: this.usuario.id,
                fechaEnvio: new Date().toISOString(),
                estatus: 'recibido',
                clasificacionSugerida: this.clasificarIncidente()
            };

            // Simular envío al servidor
            const resultado = await this.simularEnvioServidor(denunciaFinal);
            
            if (resultado.exito) {
                this.limpiarDatosTemporales();
                this.mostrarExito('Denuncia enviada exitosamente. Redirigiendo...');
                
                setTimeout(() => {
                    window.location.href = `../seguimiento/acuse-recibo.html?folio=${resultado.folio}`;
                }, 2000);
            } else {
                this.mostrarError('Error al enviar la denuncia. Intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError('Error al enviar la denuncia. Intenta nuevamente.');
        } finally {
            this.mostrarCargando(false);
        }
    }

    simularEnvioServidor(denuncia) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Guardar en el historial de denuncias
                const denuncias = JSON.parse(localStorage.getItem('denuncias_cosecovi') || '[]');
                denuncias.push(denuncia);
                localStorage.setItem('denuncias_cosecovi', JSON.stringify(denuncias));

                // Guardar en el historial del usuario
                const usuarioDenuncias = JSON.parse(localStorage.getItem(`denuncias_${denuncia.usuarioId}`) || '[]');
                usuarioDenuncias.push(denuncia.id);
                localStorage.setItem(`denuncias_${denuncia.usuarioId}`, JSON.stringify(usuarioDenuncias));

                resolve({
                    exito: true,
                    folio: denuncia.id,
                    fecha: denuncia.fechaEnvio
                });
            }, 3000);
        });
    }

    limpiarDatosTemporales() {
        localStorage.removeItem('denuncia_temporal');
    }

    mostrarCargando(mostrar) {
        const boton = document.getElementById('btn-enviar-denuncia');
        if (mostrar) {
            boton.innerHTML = `
                <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Enviando...
                </div>
            `;
            boton.disabled = true;
        } else {
            boton.innerHTML = '✅ Enviar Denuncia';
            boton.disabled = false;
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
    new RevisionEnvio();
});