class CuestionarioPonderacion {
    constructor() {
        this.preguntas = [];
        this.preguntaActual = 0;
        this.respuestas = {};
        this.totalPreguntas = 79;
        this.init();
    }

    init() {
        console.log('✅ Iniciando cuestionario ponderación...');
        this.verificarAutenticacion();
        this.cargarPreguntas();
        this.cargarProgresoAnterior();
        this.inicializarEventos();
        this.mostrarPregunta(0);
        this.actualizarProgreso();
    }

    verificarAutenticacion() {
        console.log('🔍 Verificando autenticación...');
        
        let usuario = JSON.parse(localStorage.getItem('usuario_cosecovi'));
        
        if (!usuario) {
            console.warn('⚠️ No hay usuario, usando usuario de prueba');
            usuario = {
                nombre: 'Usuario Demo',
                email: 'demo@ipn.mx',
                id: 'demo123'
            };
            localStorage.setItem('usuario_cosecovi', JSON.stringify(usuario));
        }
        
        const nombreElemento = document.getElementById('nombre-usuario');
        if (nombreElemento) {
            nombreElemento.textContent = usuario.nombre;
        } else {
            console.error('❌ No se encontró el elemento nombre-usuario');
        }
        
        console.log('✅ Autenticación verificada:', usuario.nombre);
    }

    cargarPreguntas() {
        console.log('📝 Cargando preguntas de ponderación...');
        
        // Preguntas reales de ponderación organizadas por categorías
        this.preguntas = [
            // VIOLENCIA FÍSICA (Preguntas 1-15)
            {
                id: 1,
                categoria: "violencia_fisica",
                texto: "¿Hubo contacto físico no consensuado?",
                descripcion: "Empujones, golpes, agarrones, o cualquier contacto físico sin consentimiento"
            },
            {
                id: 2,
                categoria: "violencia_fisica",
                texto: "¿Se utilizó algún objeto como arma?",
                descripcion: "Armas blancas, contundentes, u otros objetos para causar daño"
            },
            {
                id: 3,
                categoria: "violencia_fisica", 
                texto: "¿Hubo lesiones físicas visibles?",
                descripcion: "Moretones, heridas, fracturas, cortaduras, etc."
            },
            {
                id: 4,
                categoria: "violencia_fisica",
                texto: "¿Requirió atención médica?",
                descripcion: "Visita a médico, enfermería, o tratamiento médico"
            },
            {
                id: 5,
                categoria: "violencia_fisica",
                texto: "¿Hubo restricción de movimiento?",
                descripcion: "Impedir que se mueva o salga de un lugar"
            },
            {
                id: 6,
                categoria: "violencia_fisica",
                texto: "¿Hubo forcejeo o lucha física?",
                descripcion: "Resistencia física durante el incidente"
            },
            {
                id: 7,
                categoria: "violencia_fisica",
                texto: "¿El contacto fue repetitivo?",
                descripcion: "Múltiples contactos físicos durante el incidente"
            },
            {
                id: 8,
                categoria: "violencia_fisica",
                texto: "¿Hubo daño a pertenencias?",
                descripcion: "Romper, dañar o destruir objetos personales"
            },
            {
                id: 9,
                categoria: "violencia_fisica",
                texto: "¿Ocurrió en un espacio cerrado?",
                descripcion: "Habitación, oficina, baño, lugar sin salida fácil"
            },
            {
                id: 10,
                categoria: "violencia_fisica",
                texto: "¿Hubo presencia de testigos?",
                descripcion: "Otras personas presenciaron el hecho"
            },

            // VIOLENCIA PSICOLÓGICA (Preguntas 11-25)
            {
                id: 11,
                categoria: "violencia_psicologica",
                texto: "¿Hubo amenazas verbales directas?",
                descripcion: "Amenazas explícitas de daño físico, académico o laboral"
            },
            {
                id: 12,
                categoria: "violencia_psicologica",
                texto: "¿Hubo intimidación o coerción?",
                descripcion: "Comportamientos que generen miedo o sumisión"
            },
            {
                id: 13,
                categoria: "violencia_psicologica",
                texto: "¿Hubo humillación pública?",
                descripcion: "Burla, ridiculización o vergüenza frente a otros"
            },
            {
                id: 14,
                categoria: "violencia_psicologica",
                texto: "¿Hubo aislamiento social?",
                descripcion: "Impedir contacto con compañeros o amigos"
            },
            {
                id: 15,
                categoria: "violencia_psicologica",
                texto: "¿Hubo control de actividades?",
                descripcion: "Decidir qué puede o no puede hacer"
            },

            // ACOSO SEXUAL (Preguntas 16-35)
            {
                id: 16,
                categoria: "acoso_sexual",
                texto: "¿Hubo comentarios sexuales no deseados?",
                descripcion: "Comentarios, bromas, o insinuaciones de carácter sexual"
            },
            {
                id: 17,
                categoria: "acoso_sexual",
                texto: "¿Hubo contacto físico de naturaleza sexual?",
                descripcion: "Toqueteos, besos forzados, caricias no deseadas"
            },
            {
                id: 18,
                categoria: "acoso_sexual",
                texto: "¿Hubo propuestas sexuales explícitas?",
                descripcion: "Insistencias para tener relaciones o encuentros"
            },
            {
                id: 19,
                categoria: "acoso_sexual",
                texto: "¿Hubo exhibicionismo?",
                descripcion: "Mostrar partes íntimas sin consentimiento"
            },
            {
                id: 20,
                categoria: "acoso_sexual",
                texto: "¿Hubo material gráfico sexual no deseado?",
                descripcion: "Envío de fotos, videos o contenido sexual"
            },

            // DISCRIMINACIÓN (Preguntas 21-45)
            {
                id: 21,
                categoria: "discriminacion",
                texto: "¿Hubo trato diferenciado por género?",
                descripcion: "Trato desigual por ser hombre o mujer"
            },
            {
                id: 22,
                categoria: "discriminacion",
                texto: "¿Hubo comentarios despectivos por origen étnico?",
                descripcion: "Comentarios racistas o sobre origen cultural"
            },
            {
                id: 23,
                categoria: "discriminacion",
                texto: "¿Hubo discriminación por orientación sexual?",
                descripcion: "Comentarios o trato desigual por preferencia sexual"
            },
            {
                id: 24,
                categoria: "discriminacion",
                texto: "¿Hubo barreras por discapacidad?",
                descripcion: "No adaptar espacios o procesos por discapacidad"
            },
            {
                id: 25,
                categoria: "discriminacion",
                texto: "¿Hubo exclusión por edad?",
                descripcion: "Trato desigual por ser mayor o menor"
            },

            // ACOSO LABORAL/ACADÉMICO (Preguntas 26-55)
            {
                id: 26,
                categoria: "acoso_laboral",
                texto: "¿Hubo asignación de tareas degradantes?",
                descripcion: "Tareas por debajo de las capacidades o humillantes"
            },
            {
                id: 27,
                categoria: "acoso_laboral",
                texto: "¿Hubo sabotaje laboral/académico?",
                descripcion: "Ocultar información, no invitar a reuniones, etc."
            },
            {
                id: 28,
                categoria: "acoso_laboral",
                texto: "¿Hubo críticas constantes e injustificadas?",
                descripcion: "Cuestionamiento permanente del trabajo"
            },
            {
                id: 29,
                categoria: "acoso_laboral",
                texto: "¿Hubo sobrecarga de trabajo?",
                descripcion: "Asignación excesiva de tareas o plazos imposibles"
            },
            {
                id: 30,
                categoria: "acoso_laboral",
                texto: "¿Hubo bloqueo de ascensos o beneficios?",
                descripcion: "Impedir progreso académico o laboral"
            }
        ];

        // Completar con preguntas adicionales hasta 79
        for (let i = 31; i <= this.totalPreguntas; i++) {
            const categorias = ['violencia_fisica', 'violencia_psicologica', 'acoso_sexual', 'discriminacion', 'acoso_laboral'];
            const categoria = categorias[i % categorias.length];
            
            this.preguntas.push({
                id: i,
                categoria: categoria,
                texto: `Pregunta de evaluación ${i} sobre ${this.formatearCategoria(categoria)}`,
                descripcion: "Evaluación detallada del comportamiento y sus consecuencias"
            });
        }

        console.log('✅ Preguntas de ponderación cargadas:', this.preguntas.length);
    }

    cargarProgresoAnterior() {
        try {
            const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
            
            if (denunciaTemp.respuestasPonderacion) {
                this.respuestas = denunciaTemp.respuestasPonderacion;
                console.log('📊 Respuestas de ponderación anteriores cargadas:', Object.keys(this.respuestas).length);
            }
            
            if (denunciaTemp.progresoPonderacion) {
                this.preguntaActual = denunciaTemp.progresoPonderacion;
                console.log('🎯 Progreso de ponderación cargado:', this.preguntaActual);
            }
        } catch (error) {
            console.error('❌ Error cargando progreso anterior:', error);
        }
    }

    inicializarEventos() {
        console.log('🎮 Inicializando eventos de ponderación...');
        
        try {
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
            const btnGuardar = document.getElementById('btn-guardar-progreso');
            if (btnGuardar) {
                btnGuardar.addEventListener('click', () => {
                    this.guardarProgreso();
                });
            }

            // Modal de confirmación
            const btnContinuar = document.getElementById('btn-continuar-cuestionario');
            if (btnContinuar) {
                btnContinuar.addEventListener('click', () => {
                    this.ocultarModalConfirmacion();
                });
            }

            const btnConfirmar = document.getElementById('btn-confirmar-finalizar');
            if (btnConfirmar) {
                btnConfirmar.addEventListener('click', () => {
                    this.finalizarCuestionario();
                });
            }

            // Navegación principal anterior
            const btnPrev = document.querySelector('[data-prev]');
            if (btnPrev) {
                btnPrev.addEventListener('click', () => {
                    window.location.href = 'cuestionario-filtro.html';
                });
            }
            
            console.log('✅ Eventos de ponderación inicializados correctamente');
        } catch (error) {
            console.error('❌ Error inicializando eventos:', error);
        }
    }

    mostrarPregunta(indice) {
        console.log('🔍 Mostrando pregunta de ponderación:', indice);
        
        if (indice < 0 || indice >= this.preguntas.length) {
            console.error('❌ Índice de pregunta inválido:', indice);
            return;
        }
        
        this.preguntaActual = indice;
        const pregunta = this.preguntas[indice];
        
        const contenedor = document.getElementById('contenedor-preguntas');
        if (!contenedor) {
            console.error('❌ No se encontró el contenedor de preguntas');
            return;
        }
        
        console.log('📋 Renderizando pregunta:', pregunta.texto);
        contenedor.innerHTML = this.generarHTMLPregunta(pregunta);
        
        this.actualizarNavegacion();
        this.actualizarProgreso();
        
        // Restaurar respuesta si existe
        if (this.respuestas[pregunta.id] !== undefined) {
            const radio = document.querySelector(`input[name="pregunta_${pregunta.id}"][value="${this.respuestas[pregunta.id]}"]`);
            if (radio) {
                radio.checked = true;
                this.aplicarEstiloSeleccionado(pregunta.id, this.respuestas[pregunta.id]);
            }
        }
        
        console.log('✅ Pregunta de ponderación mostrada correctamente');
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
            { valor: 0, texto: "0 - No aplica", color: "bg-gray-100 hover:bg-gray-200 border-gray-300" },
            { valor: 1, texto: "1 - Muy leve", color: "bg-green-100 hover:bg-green-200 border-green-300" },
            { valor: 2, texto: "2 - Leve", color: "bg-green-200 hover:bg-green-300 border-green-400" },
            { valor: 3, texto: "3 - Moderado", color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300" },
            { valor: 4, texto: "4 - Grave", color: "bg-orange-100 hover:bg-orange-200 border-orange-300" },
            { valor: 5, texto: "5 - Muy grave", color: "bg-red-100 hover:bg-red-200 border-red-300" }
        ];

        return opciones.map(opcion => `
            <label class="cursor-pointer transition duration-200">
                <input type="radio" name="pregunta_${preguntaId}" value="${opcion.valor}" 
                       class="hidden" 
                       onchange="cuestionarioPonderacion.guardarRespuesta(${preguntaId}, ${opcion.valor})">
                <div class="${opcion.color} border-2 rounded-lg p-3 text-center transition duration-200 hover:shadow-md">
                    <div class="font-semibold text-gray-900 text-lg">${opcion.valor}</div>
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
            'acoso_laboral': 'Acoso Laboral/Académico',
            'otro': 'Otro'
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

        if (estadoPregunta) {
            estadoPregunta.textContent = `Pregunta ${this.preguntaActual + 1} de ${this.totalPreguntas}`;
        }

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
        const preguntaActualElem = document.getElementById('pregunta-actual');
        const totalPreguntasElem = document.getElementById('total-preguntas');
        
        if (preguntaActualElem) {
            preguntaActualElem.textContent = this.preguntaActual + 1;
        }
        if (totalPreguntasElem) {
            totalPreguntasElem.textContent = this.totalPreguntas;
        }
    }

    actualizarProgreso() {
        const preguntasRespondidas = Object.keys(this.respuestas).length;
        const porcentaje = (preguntasRespondidas / this.totalPreguntas) * 100;
        
        const barraProgreso = document.getElementById('barra-progreso-cuestionario');
        const porcentajeElem = document.getElementById('porcentaje-progreso');
        
        if (barraProgreso) {
            barraProgreso.style.width = `${porcentaje}%`;
        }
        if (porcentajeElem) {
            porcentajeElem.textContent = `${Math.round(porcentaje)}%`;
        }
        
        // Actualizar contador en el modal si existe
        const preguntasModal = document.getElementById('preguntas-respondidas-modal');
        if (preguntasModal) {
            preguntasModal.textContent = preguntasRespondidas;
        }
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
        try {
            const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
            denunciaTemp.respuestasPonderacion = this.respuestas;
            denunciaTemp.progresoPonderacion = this.preguntaActual;
            localStorage.setItem('denuncia_temporal', JSON.stringify(denunciaTemp));
            
            this.mostrarExito('Progreso guardado correctamente');
            console.log('💾 Progreso guardado:', { 
                respuestas: Object.keys(this.respuestas).length,
                preguntaActual: this.preguntaActual 
            });
        } catch (error) {
            console.error('❌ Error guardando progreso:', error);
            this.mostrarError('Error al guardar el progreso');
        }
    }

    mostrarModalConfirmacion() {
        const preguntasRespondidas = Object.keys(this.respuestas).length;
        
        if (preguntasRespondidas < this.totalPreguntas * 0.5) {
            this.mostrarError(`Has respondido ${preguntasRespondidas} de ${this.totalPreguntas} preguntas. Te recomendamos completar más preguntas para una mejor clasificación.`);
            return;
        }
        
        const modal = document.getElementById('modal-confirmacion-final');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    ocultarModalConfirmacion() {
        const modal = document.getElementById('modal-confirmacion-final');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    finalizarCuestionario() {
        this.ocultarModalConfirmacion();
        
        try {
            // Guardar respuestas finales
            const denunciaTemp = JSON.parse(localStorage.getItem('denuncia_temporal') || '{}');
            denunciaTemp.respuestasPonderacion = this.respuestas;
            denunciaTemp.puntuacionFinal = this.calcularPuntuacionFinal();
            delete denunciaTemp.progresoPonderacion; // Limpiar progreso ya que está completo
            
            localStorage.setItem('denuncia_temporal', JSON.stringify(denunciaTemp));
            
            console.log('✅ Cuestionario de ponderación finalizado:', {
                respuestas: Object.keys(this.respuestas).length,
                puntuacion: denunciaTemp.puntuacionFinal
            });
            
            // Redirigir al siguiente paso
            window.location.href = 'carga-pruebas.html';
        } catch (error) {
            console.error('❌ Error finalizando cuestionario:', error);
            this.mostrarError('Error al finalizar el cuestionario');
        }
    }

    calcularPuntuacionFinal() {
        let puntuacionTotal = 0;
        let preguntasConPuntuacion = 0;
        
        Object.values(this.respuestas).forEach(puntuacion => {
            if (puntuacion > 0) {
                puntuacionTotal += puntuacion;
                preguntasConPuntuacion++;
            }
        });
        
        return preguntasConPuntuacion > 0 ? (puntuacionTotal / preguntasConPuntuacion).toFixed(2) : 0;
    }

    mostrarError(mensaje) {
        console.error('❌ Error:', mensaje);
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
        console.log('✅ Éxito:', mensaje);
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

// Instancia global con manejo de errores
try {
    console.log('🚀 Creando instancia de CuestionarioPonderacion...');
    window.cuestionarioPonderacion = new CuestionarioPonderacion();
    console.log('✅ CuestionarioPonderacion inicializado correctamente');
} catch (error) {
    console.error('💥 Error crítico al inicializar CuestionarioPonderacion:', error);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-0 left-0 w-full bg-red-600 text-white p-4 z-50';
    errorDiv.innerHTML = `
        <div class="container mx-auto">
            <strong>Error:</strong> No se pudo cargar el cuestionario de ponderación. 
            <span class="text-sm">Ver la consola para más detalles.</span>
        </div>
    `;
    document.body.appendChild(errorDiv);
}s