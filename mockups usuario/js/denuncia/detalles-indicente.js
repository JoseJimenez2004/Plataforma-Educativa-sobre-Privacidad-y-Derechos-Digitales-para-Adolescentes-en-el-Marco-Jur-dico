// Sistema de Detalles del Incidente con Violentómetro para Defensoría Politécnica
class DetallesIncidente {
    constructor() {
        this.maxCaracteres = 5000;
        this.form = document.getElementById('detallesIncidenteForm');
        this.btnSiguiente = document.getElementById('btnSiguiente');
        this.btnAnterior = document.getElementById('btnAnterior');
        this.progressFill = document.getElementById('progressFill');
        this.descripcionTextarea = document.getElementById('descripcion-hechos');
        this.conductasDetectadas = document.getElementById('conductasDetectadas');
        this.nivelBadge = document.getElementById('nivelBadge');
        this.nivelActual = document.getElementById('nivelActual');
        
        // Base de datos del Violentómetro
        this.violentometroData = {
            nivel1: [
                'bromas hirientes', 'chantajear', 'mentir', 'engañar', 'ignorar', 
                'ley del hielo', 'celar', 'acechar', 'stalkear', 'culpabilizar',
                'descalificar', 'ridiculizar', 'ofender', 'humillar', 'intimidar',
                'controlar', 'destruir', 'manosear', 'caricias agresivas'
            ],
            nivel2: [
                'golpear', 'pellizcar', 'arañar', 'empujar', 'jalonear', 'cachetear',
                'patear', 'encerrar', 'aislar', 'sextorsión', 'amenazar', 'difundir',
                'forzar', 'amenaza de muerte'
            ],
            nivel3: [
                'violar', 'abuso sexual', 'mutilar', 'asesinar', 'homicidio', 'feminicidio'
            ]
        };
        
        this.init();
    }

    init() {
        this.verificarAutenticacion();
        this.configurarFechaMaxima();
        this.cargarDatosPrevios();
        this.inicializarEventos();
        this.inicializarContadorCaracteres();
        this.inicializarViolentometro();
        this.crearComandosConsola();
        
        console.log('🚀 Sistema de Denuncias - Defensoría Politécnica IPN');
        console.log('📋 Paso 2: Detalles del incidente con Violentómetro');
    }

    verificarAutenticacion() {
        const usuario = JSON.parse(localStorage.getItem('defensoria_sesion'));
        if (!usuario) {
            this.mostrarError('Debes iniciar sesión para continuar');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        document.getElementById('nombre-usuario').textContent = usuario.nombre;
        
        // Evento para cerrar sesión
        document.getElementById('cerrar-sesion').addEventListener('click', () => {
            this.cerrarSesion();
        });
    }

    configurarFechaMaxima() {
        // Establecer fecha máxima como hoy
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha-incidente').max = hoy;
    }

    cargarDatosPrevios() {
        const denunciaTemp = JSON.parse(localStorage.getItem('defensoria_denuncia_temp') || '{}');
        
        if (denunciaTemp.fechaIncidente) {
            document.getElementById('fecha-incidente').value = denunciaTemp.fechaIncidente;
        }
        
        if (denunciaTemp.horaIncidente) {
            document.getElementById('hora-incidente').value = denunciaTemp.horaIncidente;
        }
        
        if (denunciaTemp.lugarIncidente) {
            document.getElementById('lugar-incidente').value = denunciaTemp.lugarIncidente;
            this.mostrarLugarEspecifico(denunciaTemp.lugarIncidente);
        }
        
        if (denunciaTemp.lugarEspecifico) {
            document.getElementById('lugar-especifico').value = denunciaTemp.lugarEspecifico;
        }
        
        if (denunciaTemp.descripcionHechos) {
            document.getElementById('descripcion-hechos').value = denunciaTemp.descripcionHechos;
            this.actualizarContadorCaracteres();
            this.analizarViolentometro();
        }
    }

    inicializarEventos() {
        // Validación en tiempo real
        document.getElementById('fecha-incidente').addEventListener('change', (e) => {
            this.validarFecha(e.target);
        });

        document.getElementById('hora-incidente').addEventListener('change', (e) => {
            this.validarHora(e.target);
        });

        document.getElementById('lugar-incidente').addEventListener('change', (e) => {
            this.mostrarLugarEspecifico(e.target.value);
            this.validarCampo(e.target);
        });

        document.getElementById('descripcion-hechos').addEventListener('input', (e) => {
            this.actualizarContadorCaracteres();
            this.validarDescripcion(e.target);
            this.analizarViolentometro();
        });

        // Botón siguiente
        this.btnSiguiente.addEventListener('click', () => {
            this.siguientePaso();
        });

        // Botón anterior
        this.btnAnterior.addEventListener('click', () => {
            this.pasoAnterior();
        });

        // Efectos de focus
        this.form.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('focus', () => {
                this.agregarEfectoFocus(input);
            });
            
            input.addEventListener('blur', () => {
                this.removerEfectoFocus(input);
            });
        });
    }

    inicializarViolentometro() {
        // Agregar tooltips a las conductas
        document.querySelectorAll('.conducta').forEach(conducta => {
            conducta.addEventListener('mouseenter', (e) => {
                this.mostrarTooltipConducta(e.target);
            });
            
            conducta.addEventListener('mouseleave', () => {
                this.ocultarTooltipConducta();
            });
        });
    }

    mostrarTooltipConducta(conducta) {
        const texto = conducta.textContent;
        const nivel = conducta.closest('.nivel-violencia').dataset.nivel;
        
        let mensaje = '';
        switch(nivel) {
            case '1':
                mensaje = 'Nivel 1: ¡Ten cuidado! ¡La violencia aumentará!';
                break;
            case '2':
                mensaje = 'Nivel 2: ¡Reacciona! ¡No te dejes destruir!';
                break;
            case '3':
                mensaje = 'Nivel 3: ¡Necesitas ayuda profesional!';
                break;
        }
        
        // Crear tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'conducta-tooltip';
        tooltip.innerHTML = `
            <strong>${texto}</strong><br>
            <small>${mensaje}</small>
        `;
        tooltip.style.cssText = `
            position: absolute;
            background: var(--color-gray-900);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            max-width: 200px;
            box-shadow: var(--shadow-lg);
        `;
        
        document.body.appendChild(tooltip);
        
        // Posicionar tooltip
        const rect = conducta.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
        
        conducta._tooltip = tooltip;
    }

    ocultarTooltipConducta() {
        const tooltip = document.querySelector('.conducta-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    analizarViolentometro() {
        const texto = this.descripcionTextarea.value.toLowerCase();
        const conductasEncontradas = [];
        let maxNivel = 0;

        // Buscar coincidencias en cada nivel
        Object.keys(this.violentometroData).forEach(nivelKey => {
            const nivelNum = parseInt(nivelKey.replace('nivel', ''));
            this.violentometroData[nivelKey].forEach(conducta => {
                if (this.buscarCoincidencia(texto, conducta)) {
                    conductasEncontradas.push({
                        conducta: conducta,
                        nivel: nivelNum
                    });
                    maxNivel = Math.max(maxNivel, nivelNum);
                }
            });
        });

        // Actualizar interfaz
        this.actualizarViolentometroUI(conductasEncontradas, maxNivel);
    }

    buscarCoincidencia(texto, conducta) {
        const palabrasConducta = conducta.toLowerCase().split(' ');
        const palabrasTexto = texto.split(/\s+/);
        
        // Buscar coincidencias exactas o parciales
        for (let palabraConducta of palabrasConducta) {
            if (palabraConducta.length < 3) continue;
            
            for (let palabraTexto of palabrasTexto) {
                if (palabraTexto.includes(palabraConducta) || 
                    this.calcularSimilitud(palabraTexto, palabraConducta) > 0.7) {
                    return true;
                }
            }
        }
        return false;
    }

    calcularSimilitud(palabra1, palabra2) {
        const longitud = Math.max(palabra1.length, palabra2.length);
        let coincidencias = 0;
        
        for (let i = 0; i < Math.min(palabra1.length, palabra2.length); i++) {
            if (palabra1[i] === palabra2[i]) {
                coincidencias++;
            }
        }
        
        return coincidencias / longitud;
    }

    actualizarViolentometroUI(conductasEncontradas, maxNivel) {
        // Limpiar detecciones anteriores
        document.querySelectorAll('.conducta').forEach(conducta => {
            conducta.classList.remove('detectada');
        });
        
        document.querySelectorAll('.conducta-detectada').forEach(el => el.remove());

        // Actualizar conductas detectadas
        if (conductasEncontradas.length > 0) {
            this.conductasDetectadas.innerHTML = '';
            
            conductasEncontradas.forEach(({conducta, nivel}) => {
                const elemento = document.createElement('div');
                elemento.className = `conducta-detectada nivel-${nivel}`;
                elemento.innerHTML = `
                    <span class="conducta-nombre">${this.capitalizar(conducta)}</span>
                    <span class="conducta-nivel nivel-${nivel}">N${nivel}</span>
                `;
                this.conductasDetectadas.appendChild(elemento);
                
                // Resaltar en el violentómetro
                const conductaElement = document.querySelector(`[data-conducta="${conducta}"]`);
                if (conductaElement) {
                    conductaElement.classList.add('detectada');
                }
            });
        } else {
            this.conductasDetectadas.innerHTML = '<p class="sin-deteccion">Escribe tu descripción para detectar conductas violentas</p>';
        }

        // Actualizar nivel máximo
        this.actualizarNivelMaximo(maxNivel);
    }

    actualizarNivelMaximo(nivel) {
        this.nivelBadge.textContent = nivel > 0 ? nivel : '-';
        this.nivelBadge.className = 'nivel-badge ' + (nivel > 0 ? `nivel-${nivel}` : 'sin-deteccion');
        
        const nivelText = this.nivelActual.querySelector('.nivel-text');
        if (nivel > 0) {
            nivelText.textContent = this.obtenerTextoNivel(nivel);
        } else {
            nivelText.textContent = 'Sin detección';
        }
    }

    obtenerTextoNivel(nivel) {
        switch(nivel) {
            case 1: return 'Violencia psicológica';
            case 2: return 'Violencia física';
            case 3: return 'Violencia extrema';
            default: return 'Sin detección';
        }
    }

    capitalizar(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    agregarEfectoFocus(input) {
        input.parentElement.classList.add('focused');
    }

    removerEfectoFocus(input) {
        input.parentElement.classList.remove('focused');
    }

    inicializarContadorCaracteres() {
        this.actualizarContadorCaracteres();
    }

    actualizarContadorCaracteres() {
        const textarea = this.descripcionTextarea;
        const contador = document.getElementById('contador-caracteres');
        const caracteres = textarea.value.length;
        
        contador.textContent = `${caracteres}/${this.maxCaracteres} caracteres`;
        
        // Actualizar clases según el conteo
        contador.classList.remove('warning', 'error');
        
        if (caracteres > this.maxCaracteres * 0.8) {
            contador.classList.add('warning');
        }
        
        if (caracteres > this.maxCaracteres) {
            contador.classList.add('error');
        }
    }

    validarFecha(campo) {
        const fechaSeleccionada = new Date(campo.value);
        const hoy = new Date();
        hoy.setHours(23, 59, 59, 999); // Fin del día actual

        const errorDiv = campo.parentElement.querySelector('.error-message');
        
        if (fechaSeleccionada > hoy) {
            this.mostrarErrorCampo(campo, 'La fecha no puede ser futura');
            return false;
        } else if (!campo.value) {
            this.mostrarErrorCampo(campo, 'La fecha es requerida');
            return false;
        } else {
            this.limpiarError(campo);
            campo.classList.add('success');
            return true;
        }
    }

    validarHora(campo) {
        const errorDiv = campo.parentElement.querySelector('.error-message');
        
        if (!campo.value) {
            this.mostrarErrorCampo(campo, 'La hora es requerida');
            return false;
        } else {
            this.limpiarError(campo);
            campo.classList.add('success');
            return true;
        }
    }

    validarCampo(campo) {
        const valor = campo.value.trim();
        const errorDiv = campo.parentElement.querySelector('.error-message');
        
        if (!valor) {
            this.mostrarErrorCampo(campo, 'Este campo es requerido');
            return false;
        } else {
            this.limpiarError(campo);
            campo.classList.add('success');
            return true;
        }
    }

    validarDescripcion(campo) {
        const valor = campo.value.trim();
        const errorDiv = campo.parentElement.querySelector('.error-message');
        
        if (!valor) {
            this.mostrarErrorCampo(campo, 'La descripción de los hechos es obligatoria');
            return false;
        }

        if (valor.length < 50) {
            this.mostrarErrorCampo(campo, 'La descripción debe tener al menos 50 caracteres');
            return false;
        }

        if (valor.length > this.maxCaracteres) {
            this.mostrarErrorCampo(campo, `La descripción no puede exceder ${this.maxCaracteres} caracteres`);
            return false;
        }

        this.limpiarError(campo);
        campo.classList.add('success');
        return true;
    }

    mostrarLugarEspecifico(lugarSeleccionado) {
        const container = document.getElementById('lugar-especifico-container');
        const input = document.getElementById('lugar-especifico');
        
        if (lugarSeleccionado === 'otro') {
            container.classList.remove('hidden');
            input.required = true;
        } else {
            container.classList.add('hidden');
            input.required = false;
            input.value = '';
            this.limpiarError(input);
        }
    }

    mostrarErrorCampo(campo, mensaje) {
        const errorDiv = campo.parentElement.querySelector('.error-message');
        errorDiv.textContent = mensaje;
        errorDiv.classList.add('show');
        campo.classList.add('error');
        campo.classList.remove('success');
        
        // Efecto de shake
        campo.style.animation = 'none';
        setTimeout(() => {
            campo.style.animation = 'shake 0.5s ease-in-out';
        }, 10);
    }

    limpiarError(campo) {
        const errorDiv = campo.parentElement.querySelector('.error-message');
        errorDiv.classList.remove('show');
        campo.classList.remove('error', 'success');
    }

    validarFormulario() {
        let valido = true;

        // Validar fecha
        const fecha = document.getElementById('fecha-incidente');
        if (!this.validarFecha(fecha)) {
            valido = false;
        }

        // Validar hora
        const hora = document.getElementById('hora-incidente');
        if (!this.validarHora(hora)) {
            valido = false;
        }

        // Validar lugar
        const lugar = document.getElementById('lugar-incidente');
        if (!this.validarCampo(lugar)) {
            valido = false;
        }

        // Validar lugar específico si es necesario
        const lugarEspecificoContainer = document.getElementById('lugar-especifico-container');
        if (!lugarEspecificoContainer.classList.contains('hidden')) {
            const lugarEspecifico = document.getElementById('lugar-especifico');
            if (!this.validarCampo(lugarEspecifico)) {
                valido = false;
            }
        }

        // Validar descripción
        const descripcion = document.getElementById('descripcion-hechos');
        if (!this.validarDescripcion(descripcion)) {
            valido = false;
        }

        return valido;
    }

    obtenerDatosFormulario() {
        const formData = new FormData(this.form);
        const datos = Object.fromEntries(formData.entries());
        
        // Si no se seleccionó "otro", limpiar lugarEspecifico
        if (datos.lugarIncidente !== 'otro') {
            datos.lugarEspecifico = '';
        }

        // Agregar datos del violentómetro
        const texto = this.descripcionTextarea.value.toLowerCase();
        const detecciones = [];
        let nivelMaximo = 0;

        Object.keys(this.violentometroData).forEach(nivelKey => {
            const nivelNum = parseInt(nivelKey.replace('nivel', ''));
            this.violentometroData[nivelKey].forEach(conducta => {
                if (this.buscarCoincidencia(texto, conducta)) {
                    detecciones.push({
                        conducta: conducta,
                        nivel: nivelNum
                    });
                    nivelMaximo = Math.max(nivelMaximo, nivelNum);
                }
            });
        });

        datos.violentometro = {
            detecciones: detecciones,
            nivelMaximo: nivelMaximo,
            totalDetecciones: detecciones.length
        };

        return datos;
    }

    siguientePaso() {
        if (!this.validarFormulario()) {
            this.mostrarError('Por favor completa todos los campos requeridos correctamente');
            this.mostrarEfectoError();
            return;
        }

        const datos = this.obtenerDatosFormulario();

        // Mostrar carga
        this.mostrarCargando(true);

        // Guardar en denuncia temporal
        const denunciaTemp = JSON.parse(localStorage.getItem('defensoria_denuncia_temp') || '{}');
        Object.assign(denunciaTemp, datos);
        localStorage.setItem('defensoria_denuncia_temp', JSON.stringify(denunciaTemp));

        // Simular procesamiento
        setTimeout(() => {
            this.mostrarCargando(false);
            this.mostrarExito('Detalles del incidente guardados correctamente');
            
            // Redirigir al siguiente paso
            setTimeout(() => {
                window.location.href = 'identificacion-agresor.html';
            }, 1500);
        }, 1000);
    }

    pasoAnterior() {
        this.mostrarInfo('Volviendo al paso anterior...');
        setTimeout(() => {
            window.location.href = 'tipo-denuncia.html';
        }, 500);
    }

    mostrarEfectoError() {
        const campos = this.form.querySelectorAll('.form-input');
        campos.forEach((campo, index) => {
            if (campo.classList.contains('error')) {
                setTimeout(() => {
                    campo.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(() => {
                        campo.style.animation = '';
                    }, 500);
                }, index * 100);
            }
        });
    }

    mostrarCargando(mostrar) {
        if (mostrar) {
            this.btnSiguiente.innerHTML = `
                <div class="btn-loader">
                    <div class="spinner"></div>
                    <span>Guardando...</span>
                </div>
            `;
            this.btnSiguiente.disabled = true;
        } else {
            this.btnSiguiente.innerHTML = `
                Siguiente
                <i class="fas fa-arrow-right"></i>
            `;
            this.btnSiguiente.disabled = false;
        }
    }

    cerrarSesion() {
        localStorage.removeItem('defensoria_sesion');
        localStorage.removeItem('defensoria_credenciales');
        this.mostrarInfo('Sesión cerrada correctamente');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    // =========================================================================
    // SISTEMA DE NOTIFICACIONES
    // =========================================================================

    mostrarExito(mensaje) {
        this.mostrarNotificacion(mensaje, 'success', '¡Éxito!');
    }

    mostrarError(mensaje) {
        this.mostrarNotificacion(mensaje, 'error', 'Error');
    }

    mostrarInfo(mensaje) {
        this.mostrarNotificacion(mensaje, 'info', 'Información');
    }

    mostrarNotificacion(mensaje, tipo = 'info', titulo = '') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        
        const iconos = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <div class="notification-icon">
                <i class="${iconos[tipo]}"></i>
            </div>
            <div class="notification-content">
                ${titulo ? `<div class="notification-title">${titulo}</div>` : ''}
                <div class="notification-message">${mensaje}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);

        // Cerrar manualmente
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        });
    }

    // =========================================================================
    // COMANDOS DE CONSOLA PARA DESARROLLO
    // =========================================================================

    crearComandosConsola() {
        window.incidenteCommands = {
            // Datos de prueba
            cargarDatosPrueba: () => {
                const fecha = new Date();
                fecha.setDate(fecha.getDate() - 1); // Ayer
                
                document.getElementById('fecha-incidente').value = fecha.toISOString().split('T')[0];
                document.getElementById('hora-incidente').value = '14:30';
                document.getElementById('lugar-incidente').value = 'escom';
                document.getElementById('descripcion-hechos').value = `El incidente ocurrió en el laboratorio de cómputo de la ESCOM. Estaba trabajando en mi proyecto cuando un compañero comenzó a hacer bromas hirientes sobre mi trabajo. Primero intenté ignorarlo, pero continuó con comentarios despectivos y chantajes. Luego se acercó a mi computadora y comenzó a criticar mi código de manera agresiva, empujándome cuando le pedí que se alejara. Cuando le pedí que se alejara, se negó y comenzó a hablar más fuerte, humillándome frente a otros estudiantes. El incidente duró aproximadamente 15 minutos hasta que un asistente del laboratorio intervino.`;

                this.actualizarContadorCaracteres();
                this.analizarViolentometro();
                this.mostrarInfo('Datos de prueba cargados con conductas violentas');
            },
            
            // Validación
            validarFormulario: () => {
                const valido = this.validarFormulario();
                console.log(`Formulario ${valido ? 'válido' : 'inválido'}`);
                return valido;
            },
            
            // Violentómetro
            analizarTexto: (texto) => {
                this.descripcionTextarea.value = texto;
                this.actualizarContadorCaracteres();
                this.analizarViolentometro();
                console.log('Texto analizado con Violentómetro');
            },
            
            // Navegación
            siguiente: () => {
                this.siguientePaso();
            },
            
            anterior: () => {
                this.pasoAnterior();
            },
            
            // Debug
            debug: () => {
                console.log('=== DEBUG INCIDENTE ===');
                console.log('Datos del formulario:', this.obtenerDatosFormulario());
                console.log('Denuncia temporal:', localStorage.getItem('defensoria_denuncia_temp'));
                console.log('Caracteres descripción:', this.descripcionTextarea.value.length);
                console.log('Violentómetro data:', this.violentometroData);
            },
            
            // Limpiar formulario
            limpiar: () => {
                this.form.reset();
                document.getElementById('lugar-especifico-container').classList.add('hidden');
                this.actualizarContadorCaracteres();
                this.analizarViolentometro();
                this.mostrarInfo('Formulario limpiado');
            }
        };

        console.log('🎮 Comandos de consola disponibles:');
        console.log('   incidenteCommands.cargarDatosPrueba() - Cargar datos de prueba con conductas violentas');
        console.log('   incidenteCommands.validarFormulario() - Validar formulario');
        console.log('   incidenteCommands.analizarTexto("texto") - Analizar texto específico');
        console.log('   incidenteCommands.siguiente() - Ir al siguiente paso');
        console.log('   incidenteCommands.anterior() - Volver al paso anterior');
        console.log('   incidenteCommands.debug() - Información de debug');
        console.log('   incidenteCommands.limpiar() - Limpiar formulario');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new DetallesIncidente();
});

// Agregar animaciones CSS si no existen
if (!document.querySelector('#incidente-animations')) {
    const style = document.createElement('style');
    style.id = 'incidente-animations';
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .form-group.focused .form-label {
            color: var(--color-primary);
            transform: translateY(-2px);
        }
        
        .btn-loader {
            display: flex;
            align-items: center;
            gap: var(--spacing-2);
        }
        
        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid transparent;
            border-top: 2px solid currentColor;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .char-counter.warning {
            color: var(--color-warning);
            font-weight: 600;
        }
        
        .char-counter.error {
            color: var(--color-error);
            font-weight: 600;
        }
        
        .conducta-tooltip {
            position: absolute;
            background: var(--color-gray-900);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            max-width: 200px;
            box-shadow: var(--shadow-lg);
            pointer-events: none;
        }
        
        .conducta-tooltip strong {
            display: block;
            margin-bottom: 4px;
        }
        
        .conducta-tooltip small {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
}