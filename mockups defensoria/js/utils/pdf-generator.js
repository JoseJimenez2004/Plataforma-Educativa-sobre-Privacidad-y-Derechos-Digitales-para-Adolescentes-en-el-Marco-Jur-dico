class PDFGenerator {
    constructor() {
        this.doc = null;
        this.init();
    }

    init() {
        // Cargar jsPDF dinámicamente
        this.cargarLibreria();
    }

    cargarLibreria() {
        // Verificar si jsPDF ya está cargado
        if (typeof jsPDF !== 'undefined') {
            return;
        }

        // Cargar jsPDF desde CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            console.log('jsPDF cargado correctamente');
        };
        document.head.appendChild(script);
    }

    // Generar acuse de recibo
    async generarAcuseRecibo(denuncia, usuario) {
        return new Promise((resolve, reject) => {
            try {
                // Usar jsPDF desde window si está disponible
                const { jsPDF } = window.jspdf;
                this.doc = new jsPDF();

                this.agregarEncabezadoAcuse();
                this.agregarInformacionGeneral(denuncia, usuario);
                this.agregarDetallesIncidente(denuncia);
                this.agregarInvolucrados(denuncia);
                this.agregarClasificacion(denuncia);
                this.agregarArchivos(denuncia);
                this.agregarPiePagina();

                const pdfBlob = this.doc.output('blob');
                resolve(pdfBlob);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Generar reporte detallado
    async generarReporteDetallado(denuncia, usuario) {
        return new Promise((resolve, reject) => {
            try {
                const { jsPDF } = window.jspdf;
                this.doc = new jsPDF();

                this.agregarEncabezadoReporte();
                this.agregarInformacionGeneral(denuncia, usuario);
                this.agregarDetallesIncidenteCompletos(denuncia);
                this.agregarInvolucradosDetallados(denuncia);
                this.agregarClasificacionCompleta(denuncia);
                this.agregarArchivosDetallados(denuncia);
                this.agregarHistorial(denuncia);
                this.agregarPiePaginaReporte();

                const pdfBlob = this.doc.output('blob');
                resolve(pdfBlob);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Generar reporte del historial
    async generarReporteHistorial(denuncias, usuario) {
        return new Promise((resolve, reject) => {
            try {
                const { jsPDF } = window.jspdf;
                this.doc = new jsPDF();

                this.agregarEncabezadoHistorial();
                this.agregarResumenHistorial(denuncias, usuario);
                this.agregarListaDenuncias(denuncias);
                this.agregarEstadisticas(denuncias);
                this.agregarPiePagina();

                const pdfBlob = this.doc.output('blob');
                resolve(pdfBlob);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Métodos para Acuse de Recibo
    agregarEncabezadoAcuse() {
        const pageWidth = this.doc.internal.pageSize.getWidth();
        
        // Logo y título
        this.doc.setFontSize(20);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 51, 102); // Azul IPN
        this.doc.text('COSECOVI', pageWidth / 2, 20, { align: 'center' });
        
        this.doc.setFontSize(16);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text('ACUSE DE RECIBO OFICIAL', pageWidth / 2, 30, { align: 'center' });
        
        this.doc.setFontSize(10);
        this.doc.setTextColor(100, 100, 100);
        this.doc.text('Comité de Seguridad y Convivencia - Instituto Politécnico Nacional', pageWidth / 2, 37, { align: 'center' });
        
        // Línea separadora
        this.doc.setDrawColor(200, 200, 200);
        this.doc.line(20, 45, pageWidth - 20, 45);
        
        this.doc.setFontSize(8);
        this.doc.setTextColor(150, 150, 150);
        this.doc.text('Documento generado automáticamente por el Sistema COSECOVI', pageWidth / 2, 290, { align: 'center' });
    }

    agregarInformacionGeneral(denuncia, usuario) {
        let yPosition = 55;
        
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 0, 0);
        this.doc.text('INFORMACIÓN GENERAL', 20, yPosition);
        
        yPosition += 10;
        
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        
        // Folio
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Folio de Denuncia:', 20, yPosition);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(denuncia.id, 60, yPosition);
        
        yPosition += 6;
        
        // Fecha de recepción
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Fecha de Recepción:', 20, yPosition);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(this.formatearFechaHora(denuncia.fechaEnvio), 60, yPosition);
        
        yPosition += 6;
        
        // Estado
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Estado:', 20, yPosition);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(this.obtenerTextoEstado(denuncia.estatus), 60, yPosition);
        
        yPosition += 6;
        
        // Tipo
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Tipo de Denuncia:', 20, yPosition);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(denuncia.tipoDenuncia === 'personal' ? 'Denuncia Personal' : 'Infraestructura', 60, yPosition);
        
        yPosition += 6;
        
        // Usuario
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Usuario:', 20, yPosition);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`${usuario.nombre} ${usuario.apellidos}`, 60, yPosition);
        
        yPosition += 15;
        
        return yPosition;
    }

    agregarDetallesIncidente(denuncia) {
        let yPosition = 100;
        
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('DETALLES DEL INCIDENTE', 20, yPosition);
        
        yPosition += 10;
        
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        
        // Fecha y hora
        if (denuncia.fechaIncidente) {
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('Fecha del Incidente:', 20, yPosition);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(this.formatearFecha(denuncia.fechaIncidente), 60, yPosition);
            yPosition += 6;
        }
        
        if (denuncia.horaIncidente) {
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('Hora del Incidente:', 20, yPosition);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(denuncia.horaIncidente, 60, yPosition);
            yPosition += 6;
        }
        
        // Lugar
        if (denuncia.lugarIncidente) {
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('Lugar:', 20, yPosition);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(this.formatearLugar(denuncia.lugarIncidente), 60, yPosition);
            yPosition += 6;
        }
        
        yPosition += 4;
        
        // Descripción
        if (denuncia.descripcionHechos) {
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('Descripción:', 20, yPosition);
            yPosition += 6;
            
            this.doc.setFont('helvetica', 'normal');
            const descripcionLines = this.doc.splitTextToSize(denuncia.descripcionHechos, 170);
            this.doc.text(descripcionLines, 20, yPosition);
            yPosition += descripcionLines.length * 5;
        }
        
        yPosition += 10;
        
        return yPosition;
    }

    agregarInvolucrados(denuncia) {
        let yPosition = 150;
        
        if (!denuncia.agresores || denuncia.agresores.length === 0) {
            return yPosition;
        }
        
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('INVOLUCRADOS REPORTADOS', 20, yPosition);
        
        yPosition += 10;
        
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        
        denuncia.agresores.forEach((involucrado, index) => {
            if (yPosition > 250) {
                this.doc.addPage();
                yPosition = 20;
            }
            
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(`Involucrado ${index + 1}:`, 20, yPosition);
            yPosition += 6;
            
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(`Nombre/Descripción: ${involucrado.nombre || 'No especificado'}`, 25, yPosition);
            yPosition += 5;
            
            if (involucrado.rol) {
                this.doc.text(`Rol: ${this.formatearRol(involucrado.rol)}`, 25, yPosition);
                yPosition += 5;
            }
            
            if (involucrado.descripcion) {
                const descLines = this.doc.splitTextToSize(`Descripción adicional: ${involucrado.descripcion}`, 160);
                this.doc.text(descLines, 25, yPosition);
                yPosition += descLines.length * 4;
            }
            
            yPosition += 5;
        });
        
        return yPosition;
    }

    agregarClasificacion(denuncia) {
        let yPosition = 200;
        
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('CLASIFICACIÓN', 20, yPosition);
        
        yPosition += 10;
        
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Clasificación Sugerida:', 20, yPosition);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(denuncia.clasificacionSugerida || 'Por determinar', 65, yPosition);
        
        yPosition += 8;
        
        // Prioridad
        const prioridad = this.calcularPrioridad(denuncia);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Prioridad:', 20, yPosition);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(prioridad, 65, yPosition);
        
        yPosition += 15;
        
        return yPosition;
    }

    agregarArchivos(denuncia) {
        let yPosition = 230;
        
        if (!denuncia.archivos || denuncia.archivos.length === 0) {
            return yPosition;
        }
        
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('ARCHIVOS ADJUNTOS', 20, yPosition);
        
        yPosition += 10;
        
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        
        denuncia.archivos.forEach((archivo, index) => {
            if (yPosition > 270) {
                this.doc.addPage();
                yPosition = 20;
            }
            
            const tipoInfo = this.obtenerInfoTipoArchivo(archivo.type);
            this.doc.text(`${index + 1}. ${archivo.name} (${tipoInfo.tipo}, ${this.formatearTamano(archivo.size)})`, 20, yPosition);
            yPosition += 5;
        });
        
        return yPosition;
    }

    agregarPiePagina() {
        const pageWidth = this.doc.internal.pageSize.getWidth();
        const pageHeight = this.doc.internal.pageSize.getHeight();
        
        this.doc.setFontSize(8);
        this.doc.setTextColor(150, 150, 150);
        
        // Línea separadora
        this.doc.setDrawColor(200, 200, 200);
        this.doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);
        
        // Información de contacto
        this.doc.text('Para consultas sobre este caso, contacte a COSECOVI:', 20, pageHeight - 25);
        this.doc.text('Teléfono: 555-123-4570 | Email: cosecovi@ipn.mx', 20, pageHeight - 20);
        this.doc.text('Horario de atención: Lunes a Viernes 9:00 - 18:00 hrs', 20, pageHeight - 15);
        
        // Fecha de generación
        this.doc.text(`Generado el: ${new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
    }

    // Métodos para Reporte Detallado (más completo)
    agregarEncabezadoReporte() {
        const pageWidth = this.doc.internal.pageSize.getWidth();
        
        this.doc.setFontSize(18);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 51, 102);
        this.doc.text('REPORTE DETALLADO DE DENUNCIA', pageWidth / 2, 25, { align: 'center' });
        
        this.doc.setFontSize(12);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text('Sistema COSECOVI - Instituto Politécnico Nacional', pageWidth / 2, 35, { align: 'center' });
        
        this.doc.setDrawColor(200, 200, 200);
        this.doc.line(20, 45, pageWidth - 20, 45);
    }

    agregarDetallesIncidenteCompletos(denuncia) {
        // Implementación más detallada para el reporte completo
        let yPosition = 60;
        
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('DETALLES COMPLETOS DEL INCIDENTE', 20, yPosition);
        
        yPosition += 15;
        
        // Aquí se agregaría información más detallada
        this.agregarSeccionConTabla('Información Temporal', [
            ['Fecha del Incidente', denuncia.fechaIncidente ? this.formatearFecha(denuncia.fechaIncidente) : 'No especificada'],
            ['Hora del Incidente', denuncia.horaIncidente || 'No especificada'],
            ['Fecha de Reporte', this.formatearFechaHora(denuncia.fechaEnvio)]
        ], yPosition);
        
        yPosition += 40;
        
        this.agregarSeccionConTabla('Información Espacial', [
            ['Lugar del Incidente', this.formatearLugar(denuncia.lugarIncidente)],
            ['Lugar Específico', denuncia.lugarEspecifico || 'No especificado']
        ], yPosition);
        
        yPosition += 30;
        
        return yPosition;
    }

    agregarInvolucradosDetallados(denuncia) {
        // Implementación más detallada para involucrados
        if (!denuncia.agresores || denuncia.agresores.length === 0) {
            return;
        }
        
        this.doc.addPage();
        let yPosition = 20;
        
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('INFORMACIÓN DETALLADA DE INVOLUCRADOS', 20, yPosition);
        
        yPosition += 15;
        
        denuncia.agresores.forEach((involucrado, index) => {
            if (yPosition > 250) {
                this.doc.addPage();
                yPosition = 20;
            }
            
            this.doc.setFontSize(12);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(`Involucrado ${index + 1}`, 20, yPosition);
            yPosition += 8;
            
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            
            const datosInvolucrado = [
                ['Nombre/Descripción', involucrado.nombre || 'No especificado'],
                ['Rol/Cargo', this.formatearRol(involucrado.rol)],
                ['Descripción Adicional', involucrado.descripcion || 'No especificada']
            ];
            
            this.agregarTablaSimple(datosInvolucrado, 25, yPosition);
            yPosition += 35;
        });
    }

    agregarClasificacionCompleta(denuncia) {
        this.doc.addPage();
        let yPosition = 20;
        
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('ANÁLISIS Y CLASIFICACIÓN', 20, yPosition);
        
        yPosition += 15;
        
        // Clasificación sugerida por el sistema
        this.agregarSeccionConTabla('Clasificación del Sistema', [
            ['Clasificación Sugerida', denuncia.clasificacionSugerida || 'Por determinar'],
            ['Nivel de Confianza', this.calcularNivelConfianza(denuncia)],
            ['Prioridad Asignada', this.calcularPrioridad(denuncia)]
        ], yPosition);
        
        yPosition += 40;
        
        // Resultados de cuestionarios (si existen)
        if (denuncia.respuestasFiltro) {
            this.doc.setFontSize(12);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('RESULTADOS DE CUESTIONARIO DE FILTRO', 20, yPosition);
            yPosition += 10;
            
            this.doc.setFontSize(9);
            this.doc.setFont('helvetica', 'normal');
            
            Object.entries(denuncia.respuestasFiltro).forEach(([preguntaId, respuesta]) => {
                if (yPosition > 270) {
                    this.doc.addPage();
                    yPosition = 20;
                }
                
                this.doc.text(`Pregunta ${preguntaId}: ${respuesta}`, 25, yPosition);
                yPosition += 5;
            });
        }
    }

    agregarArchivosDetallados(denuncia) {
        if (!denuncia.archivos || denuncia.archivos.length === 0) {
            return;
        }
        
        this.doc.addPage();
        let yPosition = 20;
        
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('INVENTARIO DE ARCHIVOS ADJUNTOS', 20, yPosition);
        
        yPosition += 15;
        
        const datosArchivos = denuncia.archivos.map((archivo, index) => [
            (index + 1).toString(),
            archivo.name,
            this.obtenerInfoTipoArchivo(archivo.type).tipo,
            this.formatearTamano(archivo.size),
            archivo.type
        ]);
        
        this.agregarTablaConEncabezados(
            ['#', 'Nombre', 'Tipo', 'Tamaño', 'Formato'],
            datosArchivos,
            20,
            yPosition
        );
    }

    agregarHistorial(denuncia) {
        this.doc.addPage();
        let yPosition = 20;
        
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('HISTORIAL DE ACTUALIZACIONES', 20, yPosition);
        
        yPosition += 15;
        
        // Historial simulado - en implementación real vendría de la base de datos
        const historial = [
            {
                fecha: denuncia.fechaEnvio,
                accion: 'Denuncia registrada en el sistema',
                usuario: 'Sistema Automático'
            },
            {
                fecha: new Date(Date.now() - 86400000).toISOString(),
                accion: 'Clasificación preliminar asignada por el sistema',
                usuario: 'Algoritmo de IA'
            },
            {
                fecha: new Date(Date.now() - 43200000).toISOString(),
                accion: 'Denuncia asignada para revisión inicial',
                usuario: 'Coordinador COSECOVI'
            }
        ];
        
        historial.forEach((item, index) => {
            if (yPosition > 270) {
                this.doc.addPage();
                yPosition = 20;
            }
            
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(`Actualización ${index + 1}`, 20, yPosition);
            yPosition += 6;
            
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(`Fecha: ${this.formatearFechaHora(item.fecha)}`, 25, yPosition);
            yPosition += 5;
            
            this.doc.text(`Acción: ${item.accion}`, 25, yPosition);
            yPosition += 5;
            
            this.doc.text(`Responsable: ${item.usuario}`, 25, yPosition);
            yPosition += 10;
        });
    }

    agregarPiePaginaReporte() {
        const pageWidth = this.doc.internal.pageSize.getWidth();
        const pageHeight = this.doc.internal.pageSize.getHeight();
        
        this.doc.setFontSize(8);
        this.doc.setTextColor(100, 100, 100);
        
        this.doc.text('Este documento contiene información confidencial del Comité de Seguridad y Convivencia del IPN.', 20, pageHeight - 25);
        this.doc.text('Su distribución está restringida a personal autorizado.', 20, pageHeight - 20);
        
        this.doc.text(`Página ${this.doc.internal.getNumberOfPages()} de ${this.doc.internal.getNumberOfPages()}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
    }

    // Métodos para Reporte de Historial
    agregarEncabezadoHistorial() {
        const pageWidth = this.doc.internal.pageSize.getWidth();
        
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 51, 102);
        this.doc.text('HISTORIAL DE DENUNCIAS - COSECOVI', pageWidth / 2, 25, { align: 'center' });
        
        this.doc.setFontSize(12);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text('Reporte Consolidado de Actividades', pageWidth / 2, 35, { align: 'center' });
    }

    agregarResumenHistorial(denuncias, usuario) {
        let yPosition = 50;
        
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('RESUMEN EJECUTIVO', 20, yPosition);
        
        yPosition += 10;
        
        const total = denuncias.length;
        const enProceso = denuncias.filter(d => 
            ['recibido', 'en_revision', 'asignado', 'investigacion'].includes(d.estatus)
        ).length;
        const resueltas = denuncias.filter(d => 
            ['resuelto', 'cerrado'].includes(d.estatus)
        ).length;
        
        this.agregarSeccionConTabla('Estadísticas Generales', [
            ['Total de Denuncias', total.toString()],
            ['En Proceso', enProceso.toString()],
            ['Resueltas/Cerradas', resueltas.toString()],
            ['Usuario', `${usuario.nombre} ${usuario.apellidos}`],
            ['Fecha de Generación', new Date().toLocaleDateString('es-MX')]
        ], yPosition);
    }

    agregarListaDenuncias(denuncias) {
        this.doc.addPage();
        let yPosition = 20;
        
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('LISTA DE DENUNCIAS', 20, yPosition);
        
        yPosition += 15;
        
        const datosDenuncias = denuncias.map(denuncia => [
            denuncia.id,
            this.formatearFecha(denuncia.fechaEnvio),
            denuncia.tipoDenuncia === 'personal' ? 'Personal' : 'Infraestructura',
            this.obtenerTextoEstado(denuncia.estatus),
            this.calcularPrioridad(denuncia)
        ]);
        
        this.agregarTablaConEncabezados(
            ['Folio', 'Fecha', 'Tipo', 'Estado', 'Prioridad'],
            datosDenuncias,
            20,
            yPosition
        );
    }

    agregarEstadisticas(denuncias) {
        this.doc.addPage();
        let yPosition = 20;
        
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('ANÁLISIS ESTADÍSTICO', 20, yPosition);
        
        yPosition += 15;
        
        // Estadísticas por tipo
        const porTipo = denuncias.reduce((acc, denuncia) => {
            const tipo = denuncia.tipoDenuncia;
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
        }, {});
        
        const datosTipo = Object.entries(porTipo).map(([tipo, cantidad]) => [
            tipo === 'personal' ? 'Denuncia Personal' : 'Infraestructura',
            cantidad.toString(),
            `${((cantidad / denuncias.length) * 100).toFixed(1)}%`
        ]);
        
        this.agregarTablaConEncabezados(
            ['Tipo de Denuncia', 'Cantidad', 'Porcentaje'],
            datosTipo,
            20,
            yPosition
        );
        
        yPosition += 50;
        
        // Estadísticas por estado
        const porEstado = denuncias.reduce((acc, denuncia) => {
            const estado = denuncia.estatus;
            acc[estado] = (acc[estado] || 0) + 1;
            return acc;
        }, {});
        
        const datosEstado = Object.entries(porEstado).map(([estado, cantidad]) => [
            this.obtenerTextoEstado(estado),
            cantidad.toString(),
            `${((cantidad / denuncias.length) * 100).toFixed(1)}%`
        ]);
        
        this.agregarTablaConEncabezados(
            ['Estado', 'Cantidad', 'Porcentaje'],
            datosEstado,
            20,
            yPosition
        );
    }

    // Métodos de utilidad para tablas
    agregarSeccionConTabla(titulo, datos, yInicio) {
        let yPosition = yInicio;
        
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(titulo, 20, yPosition);
        yPosition += 7;
        
        datos.forEach(([etiqueta, valor]) => {
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(`${etiqueta}:`, 25, yPosition);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(valor, 80, yPosition);
            yPosition += 6;
        });
        
        return yPosition;
    }

    agregarTablaSimple(datos, x, y) {
        let yPosition = y;
        
        datos.forEach(([etiqueta, valor]) => {
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(etiqueta, x, yPosition);
            this.doc.setFont('helvetica', 'normal');
            
            const valorLines = this.doc.splitTextToSize(valor, 120);
            this.doc.text(valorLines, x + 60, yPosition);
            yPosition += Math.max(5, valorLines.length * 5);
        });
        
        return yPosition;
    }

    agregarTablaConEncabezados(encabezados, datos, x, y) {
        const colWidths = [30, 50, 40, 30, 30]; // Ajustar según necesidad
        let yPosition = y;
        
        // Encabezados
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'bold');
        let xPosition = x;
        
        encabezados.forEach((encabezado, index) => {
            this.doc.text(encabezado, xPosition, yPosition);
            xPosition += colWidths[index];
        });
        
        yPosition += 6;
        
        // Línea separadora
        this.doc.setDrawColor(200, 200, 200);
        this.doc.line(x, yPosition - 2, x + colWidths.reduce((a, b) => a + b, 0), yPosition - 2);
        
        // Datos
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(8);
        
        datos.forEach(fila => {
            if (yPosition > 270) {
                this.doc.addPage();
                yPosition = 20;
                // Volver a dibujar encabezados
                xPosition = x;
                encabezados.forEach((encabezado, index) => {
                    this.doc.setFont('helvetica', 'bold');
                    this.doc.text(encabezado, xPosition, yPosition);
                    xPosition += colWidths[index];
                });
                yPosition += 6;
                this.doc.line(x, yPosition - 2, x + colWidths.reduce((a, b) => a + b, 0), yPosition - 2);
                yPosition += 2;
            }
            
            xPosition = x;
            fila.forEach((celda, index) => {
                const cellLines = this.doc.splitTextToSize(celda, colWidths[index] - 2);
                this.doc.text(cellLines, xPosition, yPosition);
                xPosition += colWidths[index];
            });
            
            yPosition += Math.max(10, ...fila.map((_, idx) => 
                this.doc.splitTextToSize(fila[idx], colWidths[idx] - 2).length * 4
            ));
        });
        
        return yPosition;
    }

    // Métodos de utilidad general
    formatearFechaHora(fechaISO) {
        return new Date(fechaISO).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatearFecha(fechaISO) {
        return new Date(fechaISO).toLocaleDateString('es-MX');
    }

    formatearLugar(lugarCodigo) {
        const lugares = {
            'escom': 'ESCOM',
            'esime': 'ESIME',
            'esca': 'ESCA',
            'upiita': 'UPIITA',
            'cic': 'CIC',
            'cecyt': 'CECyT',
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
            'exterior': 'Exterior',
            'online': 'Plataformas Digitales',
            'otro': 'Otro Lugar'
        };
        return lugares[lugarCodigo] || lugarCodigo;
    }

    formatearRol(rol) {
        const roles = {
            'estudiante': 'Estudiante',
            'docente': 'Docente',
            'administrativo': 'Administrativo',
            'directivo': 'Directivo',
            'seguridad': 'Seguridad',
            'mantenimiento': 'Mantenimiento',
            'externo': 'Externo',
            'otro': 'Otro'
        };
        return roles[rol] || rol;
    }

    obtenerInfoTipoArchivo(tipoMIME) {
        const tipos = {
            'image/jpeg': { tipo: 'Imagen' },
            'image/jpg': { tipo: 'Imagen' },
            'image/png': { tipo: 'Imagen' },
            'video/mp4': { tipo: 'Video' },
            'video/quicktime': { tipo: 'Video' },
            'audio/mpeg': { tipo: 'Audio' },
            'audio/wav': { tipo: 'Audio' },
            'application/pdf': { tipo: 'Documento' },
            'application/msword': { tipo: 'Documento' },
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { tipo: 'Documento' }
        };
        return tipos[tipoMIME] || { tipo: 'Archivo' };
    }

    formatearTamano(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    obtenerTextoEstado(estado) {
        const estados = {
            'recibido': 'Recibido',
            'en_revision': 'En Revisión',
            'asignado': 'Asignado',
            'investigacion': 'En Investigación',
            'resuelto': 'Resuelto',
            'cerrado': 'Cerrado'
        };
        return estados[estado] || estado;
    }

    calcularPrioridad(denuncia) {
        if (denuncia.respuestasFiltro) {
            const respuestasSi = Object.values(denuncia.respuestasFiltro).filter(r => r === 'si').length;
            if (respuestasSi >= 6) return 'Alta';
            if (respuestasSi <= 2) return 'Baja';
        }
        return 'Media';
    }

    calcularNivelConfianza(denuncia) {
        // Simular cálculo de nivel de confianza basado en la información proporcionada
        let puntuacion = 50; // Puntuación base
        
        if (denuncia.descripcionHechos && denuncia.descripcionHechos.length > 100) {
            puntuacion += 20;
        }
        
        if (denuncia.agresores && denuncia.agresores.length > 0) {
            puntuacion += 15;
        }
        
        if (denuncia.archivos && denuncia.archivos.length > 0) {
            puntuacion += 15;
        }
        
        if (puntuacion > 80) return 'Alto';
        if (puntuacion > 60) return 'Medio-Alto';
        if (puntuacion > 40) return 'Medio';
        return 'Bajo';
    }

    // Método para descargar el PDF
    descargarPDF(nombreArchivo = 'documento.pdf') {
        this.doc.save(nombreArchivo);
    }

    // Método para obtener el PDF como blob
    obtenerPDFComoBlob() {
        return this.doc.output('blob');
    }

    // Método para obtener el PDF como data URL
    obtenerPDFComoDataURL() {
        return this.doc.output('dataurlstring');
    }
}

// Instancia global
window.pdfGenerator = new PDFGenerator();