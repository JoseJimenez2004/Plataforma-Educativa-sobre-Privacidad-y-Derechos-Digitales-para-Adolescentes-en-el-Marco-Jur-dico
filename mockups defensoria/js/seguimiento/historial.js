class HistorialDenuncias {
    constructor() {
        this.denuncias = [];
        this.denunciasFiltradas = [];
        this.filtros = {
            estado: 'todos',
            tipo: 'todos',
            fecha: 'todos',
            busqueda: ''
        };
        this.paginacion = {
            paginaActual: 1,
            porPagina: 10,
            totalPaginas: 0
        };
        this.init();
    }

    init() {
        this.verificarAutenticacion();
        this.cargarDenuncias();
        this.inicializarEventos();
        this.aplicarFiltros();
    }

    verificarAutenticacion() {
        const usuario = JSON.parse(localStorage.getItem('usuario_cosecovi'));
        if (!usuario) {
            window.location.href = '../../pages/auth/login.html';
            return;
        }
        
        this.usuario = usuario;
        document.getElementById('nombre-usuario').textContent = usuario.nombre;
    }

    cargarDenuncias() {
        // Cargar todas las denuncias del sistema
        const todasDenuncias = JSON.parse(localStorage.getItem('denuncias_cosecovi') || '[]');
        
        // Filtrar solo las del usuario actual
        this.denuncias = todasDenuncias.filter(denuncia => 
            denuncia.usuarioId === this.usuario.id
        );

        // Ordenar por fecha más reciente primero
        this.denuncias.sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio));
    }

    inicializarEventos() {
        // Filtros
        document.getElementById('filtro-estado').addEventListener('change', (e) => {
            this.filtros.estado = e.target.value;
            this.aplicarFiltros();
        });

        document.getElementById('filtro-tipo').addEventListener('change', (e) => {
            this.filtros.tipo = e.target.value;
            this.aplicarFiltros();
        });

        document.getElementById('filtro-fecha').addEventListener('change', (e) => {
            this.filtros.fecha = e.target.value;
            this.aplicarFiltros();
        });

        // Búsqueda
        document.getElementById('busqueda').addEventListener('input', (e) => {
            this.filtros.busqueda = e.target.value.toLowerCase();
            this.aplicarFiltros();
        });

        // Botones
        document.getElementById('btn-limpiar-filtros').addEventListener('click', () => {
            this.limpiarFiltros();
        });

        document.getElementById('btn-limpiar-busqueda').addEventListener('click', () => {
            this.limpiarBusqueda();
        });

        document.getElementById('btn-exportar').addEventListener('click', () => {
            this.exportarDatos();
        });

        // Paginación
        document.getElementById('btn-pagina-anterior').addEventListener('click', () => {
            this.paginaAnterior();
        });

        document.getElementById('btn-pagina-siguiente').addEventListener('click', () => {
            this.paginaSiguiente();
        });
    }

    aplicarFiltros() {
        this.denunciasFiltradas = this.denuncias.filter(denuncia => {
            // Filtro por estado
            if (this.filtros.estado !== 'todos' && denuncia.estatus !== this.filtros.estado) {
                return false;
            }

            // Filtro por tipo
            if (this.filtros.tipo !== 'todos' && denuncia.tipoDenuncia !== this.filtros.tipo) {
                return false;
            }

            // Filtro por fecha
            if (this.filtros.fecha !== 'todos') {
                const fechaDenuncia = new Date(denuncia.fechaEnvio);
                const fechaLimite = this.obtenerFechaLimite(this.filtros.fecha);
                
                if (fechaDenuncia < fechaLimite) {
                    return false;
                }
            }

            // Filtro por búsqueda
            if (this.filtros.busqueda) {
                const termino = this.filtros.busqueda;
                const coincideFolio = denuncia.id.toLowerCase().includes(termino);
                const coincideDescripcion = denuncia.descripcionHechos && 
                    denuncia.descripcionHechos.toLowerCase().includes(termino);
                
                if (!coincideFolio && !coincideDescripcion) {
                    return false;
                }
            }

            return true;
        });

        this.mostrarEstadisticas();
        this.mostrarTabla();
        this.mostrarPaginacion();
    }

    obtenerFechaLimite(periodo) {
        const ahora = new Date();
        switch (periodo) {
            case '7d':
                return new Date(ahora.setDate(ahora.getDate() - 7));
            case '30d':
                return new Date(ahora.setDate(ahora.getDate() - 30));
            case '90d':
                return new Date(ahora.setDate(ahora.getDate() - 90));
            case '1y':
                return new Date(ahora.setFullYear(ahora.getFullYear() - 1));
            default:
                return new Date(0); // Fecha mínima
        }
    }

    mostrarEstadisticas() {
        const total = this.denuncias.length;
        const enRevision = this.denuncias.filter(d => 
            ['recibido', 'en_revision', 'asignado', 'investigacion'].includes(d.estatus)
        ).length;
        const resueltas = this.denuncias.filter(d => 
            ['resuelto', 'cerrado'].includes(d.estatus)
        ).length;
        
        // Denuncias de los últimos 7 días
        const unaSemanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recientes = this.denuncias.filter(d => 
            new Date(d.fechaEnvio) >= unaSemanaAtras
        ).length;

        document.getElementById('total-denuncias').textContent = total;
        document.getElementById('en-revision').textContent = enRevision;
        document.getElementById('resueltas').textContent = resueltas;
        document.getElementById('recientes').textContent = recientes;
    }

    mostrarTabla() {
        const cuerpoTabla = document.getElementById('cuerpo-tabla');
        const estadoVacio = document.getElementById('estado-vacio');
        const sinResultados = document.getElementById('sin-resultados');

        // Mostrar estados apropiados
        if (this.denuncias.length === 0) {
            cuerpoTabla.innerHTML = '';
            estadoVacio.classList.remove('hidden');
            sinResultados.classList.add('hidden');
            return;
        }

        if (this.denunciasFiltradas.length === 0) {
            cuerpoTabla.innerHTML = '';
            estadoVacio.classList.add('hidden');
            sinResultados.classList.remove('hidden');
            return;
        }

        estadoVacio.classList.add('hidden');
        sinResultados.classList.add('hidden');

        // Calcular índices para paginación
        const inicio = (this.paginacion.paginaActual - 1) * this.paginacion.porPagina;
        const fin = inicio + this.paginacion.porPagina;
        const denunciasPagina = this.denunciasFiltradas.slice(inicio, fin);

        // Generar filas de la tabla
        cuerpoTabla.innerHTML = denunciasPagina.map(denuncia => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-mono font-bold text-blue-700">${denuncia.id}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${this.formatearFecha(denuncia.fechaEnvio)}</div>
                    <div class="text-xs text-gray-500">${this.formatearHora(denuncia.fechaEnvio)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        denuncia.tipoDenuncia === 'personal' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                    }">
                        ${denuncia.tipoDenuncia === 'personal' ? '👤 Personal' : '🏢 Infraestructura'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900 max-w-xs truncate">
                        ${denuncia.descripcionHechos || 'Sin descripción'}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${this.generarBadgeEstado(denuncia.estatus)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${this.generarBadgePrioridad(denuncia)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="historial.verDetalle('${denuncia.id}')" 
                            class="text-blue-600 hover:text-blue-900 mr-3">
                        Ver Detalle
                    </button>
                    <button onclick="historial.descargarReporte('${denuncia.id}')" 
                            class="text-gray-600 hover:text-gray-900">
                        📄
                    </button>
                </td>
            </tr>
        `).join('');
    }

    generarBadgeEstado(estado) {
        const estados = {
            'recibido': { texto: 'Recibido', clase: 'bg-blue-100 text-blue-800', icono: '📥' },
            'en_revision': { texto: 'En Revisión', clase: 'bg-yellow-100 text-yellow-800', icono: '🔍' },
            'asignado': { texto: 'Asignado', clase: 'bg-purple-100 text-purple-800', icono: '👤' },
            'investigacion': { texto: 'Investigación', clase: 'bg-orange-100 text-orange-800', icono: '🕵️' },
            'resuelto': { texto: 'Resuelto', clase: 'bg-green-100 text-green-800', icono: '✅' },
            'cerrado': { texto: 'Cerrado', clase: 'bg-gray-100 text-gray-800', icono: '🔒' }
        };

        const info = estados[estado] || estados['recibido'];
        return `
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.clase}">
                <span class="mr-1">${info.icono}</span>
                ${info.texto}
            </span>
        `;
    }

    generarBadgePrioridad(denuncia) {
        let prioridad = 'media';
        let clase = 'bg-yellow-100 text-yellow-800';
        let texto = 'Media';

        if (denuncia.respuestasFiltro) {
            const respuestasSi = Object.values(denuncia.respuestasFiltro).filter(r => r === 'si').length;
            
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

        return `
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${clase}">
                ${texto}
            </span>
        `;
    }

    mostrarPaginacion() {
        const paginacion = document.getElementById('paginacion');
        const totalResultados = this.denunciasFiltradas.length;
        
        if (totalResultados <= this.paginacion.porPagina) {
            paginacion.classList.add('hidden');
            return;
        }

        paginacion.classList.remove('hidden');

        // Calcular información de paginación
        this.paginacion.totalPaginas = Math.ceil(totalResultados / this.paginacion.porPagina);
        const inicio = (this.paginacion.paginaActual - 1) * this.paginacion.porPagina + 1;
        const fin = Math.min(inicio + this.paginacion.porPagina - 1, totalResultados);

        // Actualizar textos
        document.getElementById('inicio-resultados').textContent = inicio;
        document.getElementById('fin-resultados').textContent = fin;
        document.getElementById('total-resultados').textContent = totalResultados;

        // Actualizar contador
        document.getElementById('contador-resultados').textContent = 
            `${totalResultados} denuncia${totalResultados !== 1 ? 's' : ''}`;

        // Generar números de página
        this.generarNumerosPagina();

        // Actualizar estado de botones
        document.getElementById('btn-pagina-anterior').disabled = this.paginacion.paginaActual === 1;
        document.getElementById('btn-pagina-siguiente').disabled = 
            this.paginacion.paginaActual === this.paginacion.totalPaginas;
    }

    generarNumerosPagina() {
        const contenedor = document.getElementById('numeros-pagina');
        const paginas = [];
        const paginaActual = this.paginacion.paginaActual;
        const totalPaginas = this.paginacion.totalPaginas;

        // Siempre mostrar primera página
        paginas.push(1);

        // Mostrar páginas alrededor de la actual
        const inicio = Math.max(2, paginaActual - 1);
        const fin = Math.min(totalPaginas - 1, paginaActual + 1);

        if (inicio > 2) paginas.push('...');
        for (let i = inicio; i <= fin; i++) paginas.push(i);
        if (fin < totalPaginas - 1) paginas.push('...');
        if (totalPaginas > 1) paginas.push(totalPaginas);

        contenedor.innerHTML = paginas.map(pagina => 
            typeof pagina === 'number' 
                ? `<button onclick="historial.irAPagina(${pagina})" 
                    class="px-3 py-1 text-sm rounded ${
                        pagina === paginaActual 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-700 border hover:bg-gray-50'
                    }">${pagina}</button>`
                : `<span class="px-2 py-1 text-gray-500">${pagina}</span>`
        ).join('');
    }

    irAPagina(pagina) {
        this.paginacion.paginaActual = pagina;
        this.mostrarTabla();
        this.mostrarPaginacion();
    }

    paginaAnterior() {
        if (this.paginacion.paginaActual > 1) {
            this.paginacion.paginaActual--;
            this.mostrarTabla();
            this.mostrarPaginacion();
        }
    }

    paginaSiguiente() {
        if (this.paginacion.paginaActual < this.paginacion.totalPaginas) {
            this.paginacion.paginaActual++;
            this.mostrarTabla();
            this.mostrarPaginacion();
        }
    }

    limpiarFiltros() {
        document.getElementById('filtro-estado').value = 'todos';
        document.getElementById('filtro-tipo').value = 'todos';
        document.getElementById('filtro-fecha').value = 'todos';
        
        this.filtros = {
            estado: 'todos',
            tipo: 'todos',
            fecha: 'todos',
            busqueda: this.filtros.busqueda
        };
        
        this.aplicarFiltros();
    }

    limpiarBusqueda() {
        document.getElementById('busqueda').value = '';
        this.filtros.busqueda = '';
        this.aplicarFiltros();
    }

    verDetalle(folio) {
        window.location.href = `detalle-denuncia.html?folio=${folio}`;
    }

    async descargarReporte(folio) {
        // Simular descarga de reporte individual
        const denuncia = this.denuncias.find(d => d.id === folio);
        if (denuncia) {
            const contenido = this.generarContenidoReporte(denuncia);
            const blob = new Blob([contenido], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `reporte-${folio}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.mostrarExito(`Reporte de ${folio} descargado`);
        }
    }

    exportarDatos() {
        const datosExportar = this.denunciasFiltradas.map(denuncia => ({
            Folio: denuncia.id,
            Fecha: this.formatearFechaHora(denuncia.fechaEnvio),
            Tipo: denuncia.tipoDenuncia === 'personal' ? 'Personal' : 'Infraestructura',
            Estado: this.obtenerTextoEstado(denuncia.estatus),
            Descripción: denuncia.descripcionHechos || '',
            Prioridad: this.obtenerTextoPrioridad(denuncia)
        }));

        const csv = this.convertirACSV(datosExportar);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `historial-denuncias-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.mostrarExito('Datos exportados exitosamente');
    }

    convertirACSV(datos) {
        const encabezados = Object.keys(datos[0]);
        const filas = datos.map(fila => 
            encabezados.map(encabezado => 
                `"${(fila[encabezado] || '').toString().replace(/"/g, '""')}"`
            ).join(',')
        );
        return [encabezados.join(','), ...filas].join('\n');
    }

    generarContenidoReporte(denuncia) {
        return `
REPORTE DE DENUNCIA - COSECOVI
==============================

FOLIO: ${denuncia.id}
FECHA: ${this.formatearFechaHora(denuncia.fechaEnvio)}
TIPO: ${denuncia.tipoDenuncia === 'personal' ? 'Denuncia Personal' : 'Infraestructura'}
ESTADO: ${this.obtenerTextoEstado(denuncia.estatus)}
PRIORIDAD: ${this.obtenerTextoPrioridad(denuncia)}

DESCRIPCIÓN:
${denuncia.descripcionHechos || 'No se proporcionó descripción'}

---
Generado el: ${new Date().toLocaleDateString('es-MX')}
        `;
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

    obtenerTextoPrioridad(denuncia) {
        if (denuncia.respuestasFiltro) {
            const respuestasSi = Object.values(denuncia.respuestasFiltro).filter(r => r === 'si').length;
            if (respuestasSi >= 6) return 'Alta';
            if (respuestasSi <= 2) return 'Baja';
        }
        return 'Media';
    }

    formatearFecha(fechaISO) {
        return new Date(fechaISO).toLocaleDateString('es-MX');
    }

    formatearHora(fechaISO) {
        return new Date(fechaISO).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatearFechaHora(fechaISO) {
        return new Date(fechaISO).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

// Instancia global
window.historial = new HistorialDenuncias();