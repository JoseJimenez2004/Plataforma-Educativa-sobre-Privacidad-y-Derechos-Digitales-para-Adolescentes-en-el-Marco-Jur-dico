class DetalleDenuncia {
    constructor() {
        this.denuncia = null;
        this.folio = null;
        this.init();
    }

    init() {
        this.verificarAutenticacion();
        this.obtenerDatosDenuncia();
        this.mostrarDetalleCompleto();
        this.inicializarEventos();
    }

    verificarAutenticacion() {
        const usuario = JSON.parse(localStorage.getItem('usuario_cosecovi'));
        if (!usuario) {
            window.location.href = '../../pages/auth/login.html';
            return;
        }
        
        document.getElementById('nombre-usuario').textContent = usuario.nombre;
    }

    obtenerDatosDenuncia() {
        // Obtener folio de URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.folio = urlParams.get('folio');

        if (!this.folio) {
            this.mostrarError('No se especificó el folio de la denuncia');
            window.location.href = 'historial.html';
            return;
        }

        // Buscar denuncia en localStorage
        const denuncias = JSON.parse(localStorage.getItem('denuncias_cosecovi') || '[]');
        this.denuncia = denuncias.find(d => d.id === this.folio);

        if (!this.denuncia) {
            this.mostrarError('No se encontró la denuncia solicitada');
            setTimeout(() => {
                window.location.href = 'historial.html';
            }, 3000);
        }
    }

    mostrarDetalleCompleto() {
        if (!this.denuncia) return;

        this.mostrarInformacionGeneral();
        this.mostrarDetallesIncidente();
        this.mostrarInvolucrados();
        this.mostrarClasificacion();
        this.mostrarArchivos();
        this.mostrarEstadoProgreso();
        this.mostrarHistorialActualizaciones();
    }

    mostrarInformacionGeneral() {
        document.getElementById('folio-denuncia').textContent = this.denuncia.id;
        document.getElementById('fecha-registro').textContent = this.formatearFechaHora(this.denuncia.fechaEnvio);
        document.getElementById('tipo-denuncia').textContent = 
            this.denuncia.tipoDenuncia === 'personal' ? 'Denuncia Personal' : 'Infraestructura';
        document.getElementById('ultima-actualizacion').textContent = this.formatearFechaHora(this.denuncia.fechaEnvio);

        // Estado
        this.mostrarEstado();
        
        // Prioridad
        this.mostrarPrioridad();
    }

    mostrarEstado() {
        const elemento = document.getElementById('estado-actual');
        const estados = {
            'recibido': { texto: 'Recibido', clase: 'bg-blue-100 text-blue-800', icono: '📥' },
            'en_revision': { texto: 'En Revisión', clase: 'bg-yellow-100 text-yellow-800', icono: '🔍' },
            'asignado': { texto: 'Asignado', clase: 'bg-purple-100 text-purple-800', icono: '👤' },
            'investigacion': { texto: 'En Investigación', clase: 'bg-orange-100 text-orange-800', icono: '🕵️' },
            'resuelto': { texto: 'Resuelto', clase: 'bg-green-100 text-green-800', icono: '✅' },
            'cerrado': { texto: 'Cerrado', clase: 'bg-gray-100 text-gray-800', icono: '🔒' }
        };

        const estado = this.denuncia.estatus || 'recibido';
        const infoEstado = estados[estado] || estados['recibido'];

        elemento.innerHTML = `
            <span class="${infoEstado.clase} px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                <span class="mr-2">${infoEstado.icono}</span>
                ${infoEstado.texto}
            </span>
        `;
    }

    mostrarPrioridad() {
        const elemento = document.getElementById('prioridad-denuncia');
        let prioridad = 'media';
        let clase = 'bg-yellow-100 text-yellow-800';
        let texto = 'Media';

        // Determinar prioridad basada en respuestas del filtro
        if (this.denuncia.respuestasFiltro) {
            const respuestasSi = Object.values(this.denuncia.respuestasFiltro).filter(r => r === 'si').length;
            
            if (respuestasSi >= 6) {
                prioridad = 'alta';
                clase = 'bg-red-100 text-red-800';
                texto = 'Alta';
            } else if (respuestasSi <= 2) {
                prioridad = 'baja';
                clase = 'bg-green-100 text-green-800';
                texto = 'Baja';
            }
        }

        elemento.innerHTML = `
            <span class="${clase} px-3 py-1 rounded-full text-sm font-medium">
                ${texto}
            </span>
        `;
    }

    mostrarDetallesIncidente() {
        if (this.denuncia.fechaIncidente) {
            document.getElementById('fecha-incidente').textContent = 
                this.formatearFecha(this.denuncia.fechaIncidente);
        } else {
            document.getElementById('fecha-incidente').textContent = 'No especificada';
        }

        if (this.denuncia.horaIncidente) {
            document.getElementById('hora-incidente').textContent = this.denuncia.horaIncidente;
        } else {
            document.getElementById('hora-incidente').textContent = 'No especificada';
        }

        if (this.denuncia.lugarIncidente) {
            document.getElementById('lugar-incidente').textContent = 
                this.formatearLugar(this.denuncia.lugarIncidente);
        } else {
            document.getElementById('lugar-incidente').textContent = 'No especificado';
        }

        if (this.denuncia.descripcionHechos) {
            document.getElementById('descripcion-hechos').textContent = this.denuncia.descripcionHechos;
        } else {
            document.getElementById('descripcion-hechos').textContent = 'No se proporcionó descripción';
        }
    }

    mostrarInvolucrados() {
        const contenedor = document.getElementById('contenedor-involucrados');
        const sinInvolucrados = document.getElementById('sin-involucrados');

        if (!this.denuncia.agresores || this.denuncia.agresores.length === 0) {
            contenedor.innerHTML = '';
            sinInvolucrados.classList.remove('hidden');
            return;
        }

        sinInvolucrados.classList.add('hidden');
        contenedor.innerHTML = '';

        this.denuncia.agresores.forEach((involucrado, index) => {
            const elemento = document.createElement('div');
            elemento.className = 'bg-gray-50 rounded-lg p-4 border';
            elemento.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold text-gray-900">Involucrado ${index + 1}</h4>
                </div>
                <div class="space-y-2 text-sm">
                    <div>
                        <span class="text-gray-500">Nombre/Descripción:</span>
                        <p class="font-medium">${involucrado.nombre || 'No especificado'}</p>
                    </div>
                    ${involucrado.rol ? `
                        <div>
                            <span class="text-gray-500">Rol:</span>
                            <p class="font-medium">${this.formatearRol(involucrado.rol)}</p>
                        </div>
                    ` : ''}
                    ${involucrado.descripcion ? `
                        <div>
                            <span class="text-gray-500">Descripción adicional:</span>
                            <p class="text-gray-700">${involucrado.descripcion}</p>
                        </div>
                    ` : ''}
                </div>
            `;
            contenedor.appendChild(elemento);
        });
    }

    mostrarClasificacion() {
        document.getElementById('clasificacion-sugerida').textContent = 
            this.denuncia.clasificacionSugerida || 'Por determinar';

        // En una implementación real, esto vendría del backend después de la revisión
        document.getElementById('clasificacion-final').textContent = 
            this.denuncia.clasificacionFinal || 'En proceso de asignación';

        if (this.denuncia.observacionesAnalista) {
            document.getElementById('observaciones-analista').innerHTML = `
                <p>${this.denuncia.observacionesAnalista}</p>
            `;
        }
    }

    mostrarArchivos() {
        const contenedor = document.getElementById('contenedor-archivos');
        const sinArchivos = document.getElementById('sin-archivos');

        if (!this.denuncia.archivos || this.denuncia.archivos.length === 0) {
            contenedor.innerHTML = '';
            sinArchivos.classList.remove('hidden');
            return;
        }

        sinArchivos.classList.add('hidden');
        contenedor.innerHTML = '';

        this.denuncia.archivos.forEach((archivo, index) => {
            const tipoInfo = this.obtenerInfoTipoArchivo(archivo.type);
            const elemento = document.createElement('div');
            elemento.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg border';
            elemento.innerHTML = `
                <div class="flex items-center space-x-3">
                    <span class="text-2xl">${tipoInfo.icono}</span>
                    <div>
                        <p class="font-medium text-sm">${archivo.name}</p>
                        <p class="text-xs text-gray-500">
                            ${tipoInfo.tipo} • ${this.formatearTamano(archivo.size)}
                        </p>
                    </div>
                </div>
                <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Ver
                </button>
            `;
            contenedor.appendChild(elemento);
        });
    }

    mostrarEstadoProgreso() {
        // Calcular progreso basado en el estado
        const progreso = this.calcularProgreso();
        document.getElementById('barra-progreso-caso').style.width = `${progreso}%`;
        document.getElementById('progreso-caso').textContent = `${progreso}%`;

        // Calcular tiempos
        this.mostrarTiempos();
    }

    calcularProgreso() {
        const estados = ['recibido', 'en_revision', 'asignado', 'investigacion', 'resuelto', 'cerrado'];
        const estadoActual = this.denuncia.estatus || 'recibido';
        const indiceActual = estados.indexOf(estadoActual);
        
        return Math.round((indiceActual / (estados.length - 1)) * 100);
    }

    mostrarTiempos() {
        const fechaRegistro = new Date(this.denuncia.fechaEnvio);
        const ahora = new Date();
        const diffTiempo = ahora.getTime() - fechaRegistro.getTime();
        const diffDias = Math.floor(diffTiempo / (1000 * 3600 * 24));

        document.getElementById('tiempo-transcurrido').textContent = 
            diffDias === 0 ? 'Menos de 1 día' : `${diffDias} día${diffDias !== 1 ? 's' : ''}`;

        // Tiempo estimado basado en prioridad
        const tiempoEstimado = this.denuncia.prioridad === 'alta' ? 7 : 10;
        document.getElementById('tiempo-estimado').textContent = `${tiempoEstimado} días`;
    }

    mostrarHistorialActualizaciones() {
        const contenedor = document.getElementById('historial-actualizaciones');
        
        // Historial simulado - en implementación real vendría del backend
        const historial = [
            {
                fecha: this.denuncia.fechaEnvio,
                accion: 'Denuncia registrada en el sistema',
                usuario: 'Sistema Automático'
            },
            {
                fecha: new Date(Date.now() - 86400000).toISOString(), // Hace 1 día
                accion: 'Clasificación preliminar asignada',
                usuario: 'Sistema de IA'
            }
        ];

        if (historial.length === 0) {
            return;
        }

        contenedor.innerHTML = '';

        historial.forEach(item => {
            const elemento = document.createElement('div');
            elemento.className = 'border-l-4 border-blue-500 pl-4 py-2';
            elemento.innerHTML = `
                <p class="text-sm font-medium text-gray-900">${item.accion}</p>
                <p class="text-xs text-gray-500 mt-1">
                    ${this.formatearFechaHora(item.fecha)} • Por ${item.usuario}
                </p>
            `;
            contenedor.appendChild(elemento);
        });
    }

    inicializarEventos() {
        // Descargar PDF
        document.getElementById('btn-descargar-pdf').addEventListener('click', () => {
            this.descargarPDF();
        });
    }

    async descargarPDF() {
        this.mostrarModalDescarga();

        try {
            await this.simularGeneracionPDF();
            this.generarPDFSimulado();
            this.ocultarModalDescarga();
            this.mostrarExito('Reporte descargado exitosamente');
        } catch (error) {
            this.ocultarModalDescarga();
            this.mostrarError('Error al generar el reporte. Intenta nuevamente.');
        }
    }

    simularGeneracionPDF() {
        return new Promise((resolve) => {
            let progreso = 0;
            const intervalo = setInterval(() => {
                progreso += 20;
                document.getElementById('barra-progreso-descarga').style.width = `${progreso}%`;
                
                if (progreso >= 100) {
                    clearInterval(intervalo);
                    setTimeout(resolve, 500);
                }
            }, 100);
        });
    }

    generarPDFSimulado() {
        const contenido = this.generarContenidoPDF();
        const blob = new Blob([contenido], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `detalle-denuncia-${this.folio}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    generarContenidoPDF() {
        return `
DETALLE DE DENUNCIA - COSECOVI
===============================

FOLIO: ${this.denuncia.id}
FECHA DE REGISTRO: ${this.formatearFechaHora(this.denuncia.fechaEnvio)}
ESTADO: ${document.querySelector('#estado-actual').textContent.trim()}
PRIORIDAD: ${document.querySelector('#prioridad-denuncia').textContent.trim()}

INFORMACIÓN DEL INCIDENTE
-------------------------
Tipo: ${this.denuncia.tipoDenuncia === 'personal' ? 'Denuncia Personal' : 'Infraestructura'}
Fecha: ${document.getElementById('fecha-incidente').textContent}
Hora: ${document.getElementById('hora-incidente').textContent}
Lugar: ${document.getElementById('lugar-incidente').textContent}

DESCRIPCIÓN:
${this.denuncia.descripcionHechos || 'No se proporcionó descripción'}

INVOLUCRADOS
------------
${this.denuncia.agresores && this.denuncia.agresores.length > 0 ? 
    this.denuncia.agresores.map((inv, i) => 
        `Involucrado ${i + 1}:
        Nombre: ${inv.nombre || 'No especificado'}
        Rol: ${inv.rol ? this.formatearRol(inv.rol) : 'No especificado'}
        Descripción: ${inv.descripcion || 'No especificada'}`
    ).join('\n\n') 
    : 'No se especificaron involucrados'}

CLASIFICACIÓN
-------------
Sugerida por sistema: ${this.denuncia.clasificacionSugerida || 'Por determinar'}
Clasificación final: ${this.denuncia.clasificacionFinal || 'En proceso'}

ARCHIVOS ADJUNTOS
-----------------
${this.denuncia.archivos && this.denuncia.archivos.length > 0 ? 
    this.denuncia.archivos.map(arch => 
        `• ${arch.name} (${this.formatearTamano(arch.size)})`
    ).join('\n') 
    : 'No se adjuntaron archivos'}

HISTORIAL
---------
${document.querySelector('#historial-actualizaciones').textContent}

---
Generado el: ${new Date().toLocaleDateString('es-MX')}
Sistema COSECOVI - Instituto Politécnico Nacional
        `;
    }

    // Métodos de utilidad
    formatearFechaHora(fechaISO) {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatearLugar(lugarCodigo) {
        const lugares = {
            'escom': 'ESCOM - Escuela Superior de Cómputo',
            'esime': 'ESIME - Escuela Superior de Ingeniería Mecánica y Eléctrica',
            'esca': 'ESCA - Escuela Superior de Comercio y Administración',
            'upiita': 'UPIITA - Unidad Profesional Interdisciplinaria en Ingeniería',
            'cic': 'CIC - Centro de Investigación en Computación',
            'cecyt': 'CECyT - Centro de Estudios Científicos y Tecnológicos',
            'biblioteca': 'Biblioteca',
            'cafeteria': 'Cafetería',
            'estacionamiento': 'Estacionamiento',
            'canchas': 'Canchas Deportivas',
            'jardin': 'Jardines',
            'baños': 'Baños',
            'direccion': 'Dirección',
            'servicios_escolares': 'Servicios Escolares',
            'recursos_humanos': 'Recursos Humanos',
            'finanzas': 'Finanzas',
            'transporte': 'Transporte Escolar',
            'entrada_principal': 'Entrada Principal',
            'exterior': 'Exterior de las Instalaciones',
            'online': 'En Línea / Plataformas Digitales',
            'otro': this.denuncia.lugarEspecifico || 'Otro Lugar'
        };
        
        return lugares[lugarCodigo] || lugarCodigo;
    }

    formatearRol(rol) {
        const roles = {
            'estudiante': 'Estudiante',
            'docente': 'Docente',
            'administrativo': 'Personal Administrativo',
            'directivo': 'Personal Directivo',
            'seguridad': 'Personal de Seguridad',
            'mantenimiento': 'Personal de Mantenimiento',
            'externo': 'Persona Externa',
            'otro': 'Otro'
        };
        return roles[rol] || rol;
    }

    obtenerInfoTipoArchivo(tipoMIME) {
        const tipos = {
            'image/jpeg': { icono: '🖼️', tipo: 'Imagen' },
            'image/jpg': { icono: '🖼️', tipo: 'Imagen' },
            'image/png': { icono: '🖼️', tipo: 'Imagen' },
            'video/mp4': { icono: '🎬', tipo: 'Video' },
            'video/quicktime': { icono: '🎬', tipo: 'Video' },
            'audio/mpeg': { icono: '🎵', tipo: 'Audio' },
            'audio/wav': { icono: '🎵', tipo: 'Audio' },
            'application/pdf': { icono: '📄', tipo: 'Documento' },
            'application/msword': { icono: '📄', tipo: 'Documento' },
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icono: '📄', tipo: 'Documento' }
        };
        return tipos[tipoMIME] || { icono: '📎', tipo: 'Archivo' };
    }

    formatearTamano(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    mostrarModalDescarga() {
        document.getElementById('modal-descarga').classList.remove('hidden');
    }

    ocultarModalDescarga() {
        document.getElementById('modal-descarga').classList.add('hidden');
        document.getElementById('barra-progreso-descarga').style.width = '0%';
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
    new DetalleDenuncia();
});