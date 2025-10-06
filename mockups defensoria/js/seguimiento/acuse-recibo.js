class AcuseRecibo {
    constructor() {
        this.denuncia = null;
        this.folio = null;
        this.init();
    }

    init() {
        this.verificarAutenticacion();
        this.obtenerDatosDenuncia();
        this.mostrarAcuse();
        this.inicializarEventos();
        this.generarCodigoQR();
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
            // Intentar obtener de localStorage como última denuncia
            const denuncias = JSON.parse(localStorage.getItem('denuncias_cosecovi') || '[]');
            if (denuncias.length > 0) {
                this.denuncia = denuncias[denuncias.length - 1];
                this.folio = this.denuncia.id;
            } else {
                this.mostrarError('No se encontró información de la denuncia');
                return;
            }
        } else {
            // Buscar denuncia por folio
            const denuncias = JSON.parse(localStorage.getItem('denuncias_cosecovi') || '[]');
            this.denuncia = denuncias.find(d => d.id === this.folio);
        }

        if (!this.denuncia) {
            this.mostrarError('No se pudo encontrar la información de la denuncia');
        }
    }

    mostrarAcuse() {
        if (!this.denuncia) return;

        // Información general
        document.getElementById('folio-denuncia').textContent = this.denuncia.id;
        document.getElementById('fecha-recepcion').textContent = this.formatearFechaHora(this.denuncia.fechaEnvio);
        
        // Clasificación
        document.getElementById('clasificacion-sugerida').textContent = 
            this.denuncia.clasificacionSugerida || 'En análisis';
        
        document.getElementById('tipo-denuncia').textContent = 
            this.denuncia.tipoDenuncia === 'personal' ? 'Denuncia Personal' : 'Infraestructura';

        // Resumen del incidente
        if (this.denuncia.fechaIncidente) {
            document.getElementById('fecha-incidente').textContent = 
                this.formatearFecha(this.denuncia.fechaIncidente);
        }
        
        if (this.denuncia.lugarIncidente) {
            document.getElementById('lugar-incidente').textContent = 
                this.formatearLugar(this.denuncia.lugarIncidente);
        }

        // Determinar prioridad
        this.mostrarPrioridad();
    }

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

    mostrarPrioridad() {
        const elemento = document.getElementById('prioridad-denuncia');
        let prioridad = 'Media';
        let clase = 'bg-yellow-100 text-yellow-800';

        // Lógica simple para determinar prioridad
        if (this.denuncia.respuestasFiltro) {
            const respuestasSi = Object.values(this.denuncia.respuestasFiltro).filter(r => r === 'si').length;
            
            if (respuestasSi >= 5) {
                prioridad = 'Alta';
                clase = 'bg-red-100 text-red-800';
            } else if (respuestasSi <= 2) {
                prioridad = 'Baja';
                clase = 'bg-green-100 text-green-800';
            }
        }

        elemento.textContent = prioridad;
        elemento.className = `inline-block ${clase} px-2 py-1 rounded-full text-sm font-medium`;
    }

    generarCodigoQR() {
        const qrContainer = document.getElementById('codigo-qr');
        const urlSeguimiento = `${window.location.origin}${window.location.pathname}?folio=${this.folio}`;
        
        // Limpiar contenido previo
        qrContainer.innerHTML = '';
        
        // Generar QR
        const qr = qrcode(0, 'M');
        qr.addData(urlSeguimiento);
        qr.make();
        
        // Crear imagen del QR
        const qrImage = qr.createImgTag(4);
        qrContainer.innerHTML = qrImage;
    }

    inicializarEventos() {
        // Descargar PDF
        document.getElementById('btn-descargar-pdf').addEventListener('click', () => {
            this.descargarPDF();
        });

        // Ver historial
        document.getElementById('btn-ver-historial').addEventListener('click', () => {
            window.location.href = 'historial.html';
        });

        // Nueva denuncia
        document.getElementById('btn-nueva-denuncia').addEventListener('click', () => {
            this.nuevaDenuncia();
        });
    }

    async descargarPDF() {
        this.mostrarModalDescarga();

        try {
            // Simular generación de PDF
            await this.simularGeneracionPDF();
            
            // Crear y descargar PDF simulado
            this.generarPDFSimulado();
            
            this.ocultarModalDescarga();
            this.mostrarExito('Acuse descargado exitosamente');
        } catch (error) {
            this.ocultarModalDescarga();
            this.mostrarError('Error al generar el PDF. Intenta nuevamente.');
        }
    }

    simularGeneracionPDF() {
        return new Promise((resolve) => {
            let progreso = 0;
            const intervalo = setInterval(() => {
                progreso += 10;
                document.getElementById('barra-progreso-descarga').style.width = `${progreso}%`;
                
                if (progreso >= 100) {
                    clearInterval(intervalo);
                    setTimeout(resolve, 500);
                }
            }, 100);
        });
    }

    generarPDFSimulado() {
        // En una implementación real, aquí se usaría una librería como jsPDF
        // Por ahora simulamos la descarga con un blob
        
        const contenido = this.generarContenidoPDF();
        const blob = new Blob([contenido], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `acuse-${this.folio}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    generarContenidoPDF() {
        // Contenido simulado del PDF
        return `
ACUSE DE RECIBO - COSECOVI
===========================

Folio: ${this.denuncia.id}
Fecha de Recepción: ${this.formatearFechaHora(this.denuncia.fechaEnvio)}
Estado: Recibida

INFORMACIÓN DE LA DENUNCIA
---------------------------
Tipo: ${this.denuncia.tipoDenuncia === 'personal' ? 'Denuncia Personal' : 'Infraestructura'}
Clasificación Sugerida: ${this.denuncia.clasificacionSugerida || 'En análisis'}
Prioridad: ${document.getElementById('prioridad-denuncia').textContent}

INCIDENTE REPORTADO
-------------------
Fecha del Incidente: ${this.denuncia.fechaIncidente ? this.formatearFecha(this.denuncia.fechaIncidente) : 'No especificada'}
Lugar: ${this.formatearLugar(this.denuncia.lugarIncidente)}

PRÓXIMOS PASOS
--------------
• Notificación cuando sea asignada para revisión
• Tiempo estimado de respuesta: 3-5 días hábiles
• Seguimiento disponible en el sistema

CONTACTOS DE EMERGENCIA
-----------------------
Emergencias: 555-123-4567
Atención Psicológica: 555-123-4568
Asesoría Legal: 555-123-4569

Este documento es un acuse de recibo oficial del Comité de Seguridad y Convivencia del IPN.
        `;
    }

    nuevaDenuncia() {
        // Limpiar datos temporales
        localStorage.removeItem('denuncia_temporal');
        
        // Redirigir al inicio del proceso
        window.location.href = '../denuncia/tipo-denuncia.html';
    }

    mostrarModalDescarga() {
        document.getElementById('modal-descarga').classList.remove('hidden');
    }

    ocultarModalDescarga() {
        document.getElementById('modal-descarga').classList.add('hidden');
        // Resetear barra de progreso
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
    new AcuseRecibo();
});