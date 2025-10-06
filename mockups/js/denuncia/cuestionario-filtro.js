class CuestionarioFiltro {
    constructor() {
        this.preguntas = [];
        this.preguntaActual = 0;
        this.respuestas = {};
        this.totalPreguntas = 8;
        this.init();
    }

    init() {
        this.verificarAutenticacion();
        this.cargarPreguntas();
        this.cargarProgresoAnterior();
        this.inicializarEventos();
        this.mostrarPregunta(0);
        this.actualizarProgreso();
    }

    verificarAutenticacion() {
        const usuario = JSON.parse(localStorage.getItem('usuario_cosecovi'));
        if (!usuario) {
            window.location.href = '../../pages/auth/login.html';
            return;
        }
        
        document.getElementById('nombre-usuario').textContent = usuario.nombre;
    }

    cargarPreguntas() {
        // Las 8 preguntas del primer filtro según requisitos
        this.preguntas = [
            {
                id: 1,
                texto: "¿El incidente involucró contacto físico no deseado?",
                descripcion: "Incluye empujones, golpes, tocamientos, o cualquier contacto físico sin consentimiento",
                categoria: "violencia_fisica"
            },
            {
                id: 2,
                texto: "¿Hubo amenazas o intimidación verbal?",
                descripcion: "Amenazas de daño, coerción, o lenguaje intimidatorio",
                categoria: "violencia_psicologica"
            },
            {
                id: 3,
                texto: "¿El incidente tuvo connotaciones sexuales no deseadas?",
                descripcion: "Comentarios, insinuaciones, propuestas o conductas de naturaleza sexual no deseadas",
                categoria: "acoso_sexual"
            },
            {
                id: 4,
                texto: "¿Se sintió discriminado(a) por alguna característica personal?",
                descripcion: "Género, orientación sexual, origen étnico, discapacidad, edad, apariencia física, etc.",
                categoria: "discriminacion"
            },
            {
                id: 5,
                texto: "¿El incidente afectó su desempeño académico o laboral?",
                descripcion: "Bajas calificaciones, dificultad para concentrarse, ausentismo, etc.",
                categoria: "impacto_academico"
            },
            {
                id: 6,
                texto: "¿El incidente ocurrió en un contexto de relación de poder?",
                descripcion: "Jefe-subordinado, docente-estudiante, etc.",
                categoria: "relacion_poder"
            },
            {
                id: 7,
                texto: "¿El incidente ha sido recurrente o forma parte de un patrón?",
                descripcion: "Múltiples ocasiones, conducta sostenida en el tiempo",
                categoria: "recurrencia"
            },
            {
                id: 8,
                texto: "¿El incidente le generó miedo por su seguridad personal?",
                descripcion: "Temor a sufrir daño físico, psicológico, o a represalias",
                categoria: "seguridad_personal"
            }
        ];
    }

    cargarProgresoAnterior() {
        const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
        
        if (denunciaTemp.respuestasFiltro) {
            this.respuestas = denunciaTemp.respuestasFiltro;
        }
        
        if (denunciaTemp.progresoFiltro) {
            this.preguntaActual = denunciaTemp.progresoFiltro;
        }
    }

    inicializarEventos() {
        // Navegación entre preguntas
        document.getElementById('btn-pregunta-anterior').addEventListener('click', () => {
            this.preguntaAnterior();
        });

        document.getElementById('btn-pregunta-siguiente').addEventListener('click', () => {
            this.preguntaSiguiente();
        });

        // Botón finalizar cuestionario
        document.getElementById('btn-finalizar-cuestionario').addEventListener('click', () => {
            this.finalizarCuestionario();
        });

        // Navegación principal anterior
        document.querySelector('[data-prev]').addEventListener('click', () => {
            window.location.href = 'identificacion-agresor.html';
        });
    }

    mostrarPregunta(indice) {
        this.preguntaActual = indice;
        const pregunta = this.preguntas[indice];
        
        const contenedor = document.getElementById('contenedor-preguntas');
        contenedor.innerHTML = this.generarHTMLPregunta(pregunta);
        
        this.actualizarNavegacion();
        this.actualizarContadores();
        
        // Restaurar respuesta si existe
        if (this.respuestas[pregunta.id] !== undefined) {
            const radio = document.querySelector(`input[name="pregunta_${pregunta.id}"][value="${this.respuestas[pregunta.id]}"]`);
            if (radio) {
                radio.checked = true;
                this.aplicarEstiloSeleccionado(pregunta.id, this.respuestas[pregunta.id]);
            }
        }
    }

    generarHTMLPregunta(pregunta) {
        return `
            <div class="pregunta-item border rounded-lg p-6 bg-white" data-pregunta-id="${pregunta.id}">
                <div class="mb-4">
                    <h4 class="text-lg font-semibold text-gray-900 mb-2">
                        ${pregunta.id}. ${pregunta.texto}
                    </h4>
                    ${pregunta.descripcion ? `
                        <p class="text-sm text-gray-600">${pregunta.descripcion}</p>
                    ` : ''}
                </div>
                
                <div class="espacio-respuesta">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        ${this.generarOpcionesRespuesta(pregunta.id)}
                    </div>
                </div>
                
                <div class="mt-4 text-sm text-gray-500">
                    <span>Categoría: <strong>${this.formatearCategoria(pregunta.categoria)}</strong></span>
                </div>
            </div>
        `;
    }

    generarOpcionesRespuesta(preguntaId) {
        const opciones = [
            { valor: "si", texto: "Sí", color: "bg-red-50 hover:bg-red-100 border-red-200" },
            { valor: "no", texto: "No", color: "bg-green-50 hover:bg-green-100 border-green-200" },
            { valor: "tal_vez", texto: "Tal vez", color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200" }
        ];

        return opciones.map(opcion => `
            <label class="cursor-pointer transition duration-200">
                <input type="radio" name="pregunta_${preguntaId}" value="${opcion.valor}" 
                       class="hidden" 
                       onchange="cuestionarioFiltro.guardarRespuesta(${preguntaId}, '${opcion.valor}')">
                <div class="${opcion.color} border-2 rounded-lg p-4 text-center transition duration-200 hover:shadow-md">
                    <div class="font-semibold text-gray-900 text-lg">${opcion.texto}</div>
                </div>
            </label>
        `).join('');
    }

    formatearCategoria(categoria) {
        const categorias = {
            'violencia_fisica': 'Violencia Física',
            'violencia_psicologica': 'Violencia Psicológica',
            'acoso_sexual': 'Acoso Sexual',
            'discriminacion': 'Discriminación',
            'impacto_academico': 'Impacto Académico/Laboral',
            'relacion_poder': 'Relación de Poder',
            'recurrencia': 'Recurrencia',
            'seguridad_personal': 'Seguridad Personal'
        };
        return categorias[categoria] || categoria;
    }

    guardarRespuesta(preguntaId, valor) {
        this.respuestas[preguntaId] = valor;
        this.aplicarEstiloSeleccionado(preguntaId, valor);
        this.actualizarProgreso();
    }

    aplicarEstiloSeleccionado(preguntaId, valor) {
        // Remover estilos de todas las opciones
        const labels = document.querySelectorAll(`input[name="pregunta_${preguntaId}"]`);
        labels.forEach(input => {
            const label = input.closest('label');
            const div = label.querySelector('div');
            div.classList.remove('ring-2', 'ring-blue-500', 'border-blue-500', 'bg-blue-50');
        });

        // Aplicar estilo a la opción seleccionada
        const inputSeleccionado = document.querySelector(`input[name="pregunta_${preguntaId}"][value="${valor}"]`);
        if (inputSeleccionado) {
            const label = inputSeleccionado.closest('label');
            const div = label.querySelector('div');
            div.classList.add('ring-2', 'ring-blue-500', 'border-blue-500', 'bg-blue-50');
        }
    }

    actualizarNavegacion() {
        const btnAnterior = document.getElementById('btn-pregunta-anterior');
        const btnSiguiente = document.getElementById('btn-pregunta-siguiente');
        const btnFinalizar = document.getElementById('btn-finalizar-cuestionario');
        const estadoPregunta = document.getElementById('estado-pregunta');

        // Actualizar estado
        estadoPregunta.textContent = `Pregunta ${this.preguntaActual + 1} de ${this.totalPreguntas}`;

        // Botón anterior
        if (this.preguntaActual === 0) {
            btnAnterior.disabled = true;
            btnAnterior.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            btnAnterior.disabled = false;
            btnAnterior.classList.remove('opacity-50', 'cursor-not-allowed');
        }

        // Botón siguiente/finalizar
        if (this.preguntaActual === this.totalPreguntas - 1) {
            btnSiguiente.classList.add('hidden');
            btnFinalizar.classList.remove('hidden');
        } else {
            btnSiguiente.classList.remove('hidden');
            btnFinalizar.classList.add('hidden');
        }
    }

    actualizarContadores() {
        document.getElementById('pregunta-actual').textContent = this.preguntaActual + 1;
        document.getElementById('total-preguntas').textContent = this.totalPreguntas;
    }

    actualizarProgreso() {
        const preguntasRespondidas = Object.keys(this.respuestas).length;
        const porcentaje = (preguntasRespondidas / this.totalPreguntas) * 100;
        
        document.getElementById('barra-progreso-cuestionario').style.width = `${porcentaje}%`;
        document.getElementById('porcentaje-progreso').textContent = `${Math.round(porcentaje)}%`;
    }

    preguntaAnterior() {
        if (this.preguntaActual > 0) {
            this.mostrarPregunta(this.preguntaActual - 1);
        }
    }

    preguntaSiguiente() {
        // Validar que la pregunta actual esté respondida
        if (!this.respuestas[this.preguntaActual + 1]) {
            this.mostrarError('Por favor responde esta pregunta antes de continuar');
            return;
        }

        if (this.preguntaActual < this.totalPreguntas - 1) {
            this.mostrarPregunta(this.preguntaActual + 1);
        }
    }

    finalizarCuestionario() {
        // Validar que todas las preguntas estén respondidas
        const preguntasRespondidas = Object.keys(this.respuestas).length;
        if (preguntasRespondidas < this.totalPreguntas) {
            this.mostrarError(`Por favor responde todas las preguntas. Te faltan ${this.totalPreguntas - preguntasRespondidas} preguntas.`);
            return;
        }

        // Guardar respuestas y calcular clasificación preliminar
        const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
        denunciaTemp.respuestasFiltro = this.respuestas;
        denunciaTemp.clasificacionPreliminar = this.calcularClasificacionPreliminar();
        localStorage.setItem('denuncia_temporal', JSON.stringify(denunciaTemp));
        
        // Redirigir al siguiente paso
        window.location.href = 'cuestionario-ponderacion.html';
    }

    calcularClasificacionPreliminar() {
        // Lógica simple de clasificación basada en las respuestas
        const puntuaciones = {
            'violencia_fisica': 0,
            'violencia_psicologica': 0,
            'acoso_sexual': 0,
            'discriminacion': 0
        };

        // Asignar puntuaciones basadas en respuestas "Sí"
        this.preguntas.forEach(pregunta => {
            if (this.respuestas[pregunta.id] === 'si') {
                switch(pregunta.categoria) {
                    case 'violencia_fisica':
                        puntuaciones.violencia_fisica += 3;
                        break;
                    case 'violencia_psicologica':
                        puntuaciones.violencia_psicologica += 2;
                        break;
                    case 'acoso_sexual':
                        puntuaciones.acoso_sexual += 3;
                        break;
                    case 'discriminacion':
                        puntuaciones.discriminacion += 2;
                        break;
                }
            } else if (this.respuestas[pregunta.id] === 'tal_vez') {
                switch(pregunta.categoria) {
                    case 'violencia_fisica':
                        puntuaciones.violencia_fisica += 1;
                        break;
                    case 'violencia_psicologica':
                        puntuaciones.violencia_psicologica += 1;
                        break;
                    case 'acoso_sexual':
                        puntuaciones.acoso_sexual += 1;
                        break;
                    case 'discriminacion':
                        puntuaciones.discriminacion += 1;
                        break;
                }
            }
        });

        // Determinar clasificación principal
        const maxPuntuacion = Math.max(...Object.values(puntuaciones));
        if (maxPuntuacion === 0) return 'Por determinar';

        for (const [categoria, puntuacion] of Object.entries(puntuaciones)) {
            if (puntuacion === maxPuntuacion) {
                return this.formatearCategoria(categoria);
            }
        }

        return 'Por determinar';
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
window.cuestionarioFiltro = new CuestionarioFiltro();