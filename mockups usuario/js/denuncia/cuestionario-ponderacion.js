class CuestionarioPonderacion {
    constructor() {
        this.preguntas = [];
        this.preguntaActual = 0;
        this.respuestas = {};
        this.totalPreguntas = 79;
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
        // Simulación de las 79 preguntas de ponderación
        this.preguntas = [
            {
                id: 1,
                categoria: "violencia_fisica",
                texto: "¿Hubo contacto físico no consensuado?",
                descripcion: "Incluye empujones, golpes, agarrones, etc."
            },
            {
                id: 2,
                categoria: "violencia_fisica",
                texto: "¿Se utilizó algún objeto como arma?",
                descripcion: "Armas blancas, contundentes, u otros objetos"
            },
            {
                id: 3,
                categoria: "violencia_fisica", 
                texto: "¿Hubo lesiones físicas visibles?",
                descripcion: "Moretones, heridas, fracturas, etc."
            },
            {
                id: 4,
                categoria: "violencia_psicologica",
                texto: "¿Hubo amenazas verbales?",
                descripcion: "Amenazas de daño físico, académico, laboral, etc."
            },
            {
                id: 5,
                categoria: "violencia_psicologica",
                texto: "¿Hubo intimidación o coerción?",
                descripcion: "Comportamientos que generen miedo o sumisión"
            },
            {
                id: 6,
                categoria: "acoso_sexual",
                texto: "¿Hubo comentarios o insinuaciones sexuales no deseadas?",
                descripcion: "Comentarios, bromas, o insinuaciones de carácter sexual"
            },
            {
                id: 7,
                categoria: "acoso_sexual",
                texto: "¿Hubo contacto físico de naturaleza sexual?",
                descripcion: "Toqueteos, besos forzados, etc."
            },
            {
                id: 8,
                categoria: "discriminacion",
                texto: "¿Hubo trato diferenciado por características personales?",
                descripcion: "Género, orientación sexual, etnia, discapacidad, etc."
            },
            {
                id: 9,
                categoria: "acoso_laboral",
                texto: "¿Hubo asignación de tareas degradantes?",
                descripcion: "Tareas por debajo de las capacidades o humillantes"
            },
            {
                id: 10,
                categoria: "acoso_laboral",
                texto: "¿Hubo sabotaje laboral/académico?",
                descripcion: "Ocultar información, no invitar a reuniones, etc."
            }
            // En una implementación real, aquí irían las 69 preguntas restantes
        ];

        // Para desarrollo, completamos con preguntas de ejemplo
        for (let i = 11; i <= this.totalPreguntas; i++) {
            this.preguntas.push({
                id: i,
                categoria: "otro",
                texto: `Pregunta de ejemplo ${i} sobre el incidente`,
                descripcion: "Descripción detallada de lo que se está evaluando"
            });
        }
    }

    cargarProgresoAnterior() {
        const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
        
        if (denunciaTemp.respuestasPonderacion) {
            this.respuestas = denunciaTemp.respuestasPonderacion;
        }
        
        if (denunciaTemp.progresoPonderacion) {
            this.preguntaActual = denunciaTemp.progresoPonderacion;
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
            this.mostrarModalConfirmacion();
        });

        // Botón guardar progreso
        document.getElementById('btn-guardar-progreso').addEventListener('click', () => {
            this.guardarProgreso();
        });

        // Modal de confirmación
        document.getElementById('btn-continuar-cuestionario').addEventListener('click', () => {
            this.ocultarModalConfirmacion();
        });

        document.getElementById('btn-confirmar-finalizar').addEventListener('click', () => {
            this.finalizarCuestionario();
        });

        // Navegación principal anterior
        document.querySelector('[data-prev]').addEventListener('click', () => {
            window.location.href = 'cuestionario-filtro.html';
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
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        ${this.generarOpcionesPonderacion(pregunta.id)}
                    </div>
                </div>
                
                <div class="mt-4 flex justify-between items-center text-sm text-gray-500">
                    <span>Categoría: <strong>${this.formatearCategoria(pregunta.categoria)}</strong></span>
                    <span>Pregunta ${pregunta.id} de ${this.totalPreguntas}</span>
                </div>
            </div>
        `;
    }

    generarOpcionesPonderacion(preguntaId) {
        const opciones = [
            { valor: 0, texto: "0 - No aplica", color: "bg-gray-100 hover:bg-gray-200" },
            { valor: 1, texto: "1 - Muy leve", color: "bg-green-100 hover:bg-green-200" },
            { valor: 2, texto: "2 - Leve", color: "bg-green-200 hover:bg-green-300" },
            { valor: 3, texto: "3 - Moderado", color: "bg-yellow-100 hover:bg-yellow-200" },
            { valor: 4, texto: "4 - Grave", color: "bg-orange-100 hover:bg-orange-200" },
            { valor: 5, texto: "5 - Muy grave", color: "bg-red-100 hover:bg-red-200" }
        ];

        return opciones.map(opcion => `
            <label class="cursor-pointer">
                <input type="radio" name="pregunta_${preguntaId}" value="${opcion.valor}" 
                       class="hidden" 
                       onchange="cuestionarioPonderacion.guardarRespuesta(${preguntaId}, ${opcion.valor})">
                <div class="${opcion.color} border border-gray-300 rounded-lg p-3 text-center transition duration-200 hover:shadow-md">
                    <div class="font-semibold text-gray-900">${opcion.valor}</div>
                    <div class="text-xs text-gray-600 mt-1">${opcion.texto.split(' - ')[1]}</div>
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
            'acoso_laboral': 'Acoso Laboral',
            'otro': 'Otro'
        };
        return categorias[categoria] || categoria;
    }

    guardarRespuesta(preguntaId, valor) {
        this.respuestas[preguntaId] = valor;
        this.actualizarProgreso();
        
        // Resaltar la opción seleccionada
        const labels = document.querySelectorAll(`input[name="pregunta_${preguntaId}"]`);
        labels.forEach(input => {
            const label = input.closest('label');
            const div = label.querySelector('div');
            if (input.checked) {
                div.classList.add('ring-2', 'ring-blue-500', 'border-blue-500');
            } else {
                div.classList.remove('ring-2', 'ring-blue-500', 'border-blue-500');
            }
        });
    }

    actualizarNavegacion() {
        const btnAnterior = document.getElementById('btn-pregunta-anterior');
        const btnSiguiente = document.getElementById('btn-pregunta-siguiente');
        const btnFinalizar = document.getElementById('btn-finalizar-cuestionario');

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
        
        // Actualizar contador en el modal
        document.getElementById('preguntas-respondidas-modal').textContent = preguntasRespondidas;
    }

    preguntaAnterior() {
        if (this.preguntaActual > 0) {
            this.mostrarPregunta(this.preguntaActual - 1);
        }
    }

    preguntaSiguiente() {
        if (this.preguntaActual < this.totalPreguntas - 1) {
            this.mostrarPregunta(this.preguntaActual + 1);
        }
    }

    guardarProgreso() {
        const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
        denunciaTemp.respuestasPonderacion = this.respuestas;
        denunciaTemp.progresoPonderacion = this.preguntaActual;
        localStorage.setItem('denuncia_temporal', JSON.stringify(denunciaTemp));
        
        this.mostrarExito('Progreso guardado correctamente');
    }

    mostrarModalConfirmacion() {
        const preguntasRespondidas = Object.keys(this.respuestas).length;
        
        if (preguntasRespondidas < this.totalPreguntas * 0.5) {
            this.mostrarError(`Has respondido ${preguntasRespondidas} de ${this.totalPreguntas} preguntas. Te recomendamos completar más preguntas para una mejor clasificación.`);
            return;
        }
        
        document.getElementById('modal-confirmacion-final').classList.remove('hidden');
    }

    ocultarModalConfirmacion() {
        document.getElementById('modal-confirmacion-final').classList.add('hidden');
    }

    finalizarCuestionario() {
        this.ocultarModalConfirmacion();
        
        // Guardar respuestas finales
        const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
        denunciaTemp.respuestasPonderacion = this.respuestas;
        delete denunciaTemp.progresoPonderacion; // Limpiar progreso ya que está completo
        localStorage.setItem('denuncia_temporal', JSON.stringify(denunciaTemp));
        
        // Redirigir al siguiente paso
        window.location.href = 'carga-pruebas.html';
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
window.cuestionarioPonderacion = new CuestionarioPonderacion();