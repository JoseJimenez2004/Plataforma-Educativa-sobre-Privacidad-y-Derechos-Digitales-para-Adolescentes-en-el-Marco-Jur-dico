// Sistema de Tipo de Denuncia para Defensoría Politécnica
class TipoDenuncia {
    constructor() {
        this.formulario = document.getElementById('tipoDenunciaForm');
        this.siguienteBtn = document.getElementById('siguienteBtn');
        this.progressFill = document.getElementById('progressFill');
        this.init();
    }

    init() {
        this.verificarAutenticacion();
        this.inicializarEventos();
        this.inicializarSeleccion();
        this.crearComandosConsola();
        
        console.log('🚀 Sistema de Denuncias - Defensoría Politécnica IPN');
        console.log('📋 Paso 1: Selección del tipo de denuncia');
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

    inicializarEventos() {
        // Selección de tipo de denuncia
        document.querySelectorAll('.denuncia-radio').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.actualizarSeleccion(e.target.value);
            });
        });

        // Botón siguiente
        this.siguienteBtn.addEventListener('click', () => {
            this.siguientePaso();
        });

        // Efectos hover en las opciones
        document.querySelectorAll('.denuncia-option').forEach(option => {
            option.addEventListener('mouseenter', () => {
                this.agregarEfectoHover(option);
            });
            
            option.addEventListener('mouseleave', () => {
                this.removerEfectoHover(option);
            });
        });
    }

    inicializarSeleccion() {
        // Cargar selección previa si existe
        const denunciaTemp = JSON.parse(localStorage.getItem('defensoria_denuncia_temp') || '{}');
        if (denunciaTemp.tipoDenuncia) {
            const radio = document.querySelector(`input[value="${denunciaTemp.tipoDenuncia}"]`);
            if (radio) {
                radio.checked = true;
                this.actualizarSeleccion(denunciaTemp.tipoDenuncia);
            }
        }
    }

    actualizarSeleccion(tipo) {
        // Remover selección previa
        document.querySelectorAll('.denuncia-option').forEach(option => {
            option.querySelector('.option-card').classList.remove('selected');
        });

        // Aplicar selección actual
        const opcionSeleccionada = document.querySelector(`input[value="${tipo}"]`).closest('.denuncia-option');
        opcionSeleccionada.querySelector('.option-card').classList.add('selected');
        
        // Habilitar botón siguiente
        this.siguienteBtn.disabled = false;
        
        // Efecto visual de confirmación
        this.mostrarConfirmacionSeleccion(tipo);
    }

    agregarEfectoHover(option) {
        if (!option.querySelector('.denuncia-radio').checked) {
            option.querySelector('.option-card').style.transform = 'translateY(-2px)';
            option.querySelector('.option-card').style.boxShadow = 'var(--shadow-md)';
        }
    }

    removerEfectoHover(option) {
        if (!option.querySelector('.denuncia-radio').checked) {
            option.querySelector('.option-card').style.transform = '';
            option.querySelector('.option-card').style.boxShadow = '';
        }
    }

    mostrarConfirmacionSeleccion(tipo) {
        const opcionSeleccionada = document.querySelector(`input[value="${tipo}"]`).closest('.denuncia-option');
        const icono = opcionSeleccionada.querySelector('.option-icon');
        
        // Efecto de pulso en el ícono
        icono.style.animation = 'pulse 0.6s ease-in-out';
        setTimeout(() => {
            icono.style.animation = '';
        }, 600);
    }

    siguientePaso() {
        const tipoSeleccionado = document.querySelector('.denuncia-radio:checked');
        
        if (!tipoSeleccionado) {
            this.mostrarError('Por favor selecciona un tipo de denuncia para continuar');
            this.mostrarEfectoError();
            return;
        }

        // Mostrar carga
        this.mostrarCargando(true);

        // Guardar en denuncia temporal
        const denunciaTemp = JSON.parse(localStorage.getItem('defensoria_denuncia_temp') || '{}');
        denunciaTemp.tipoDenuncia = tipoSeleccionado.value;
        denunciaTemp.fechaInicio = new Date().toISOString();
        denunciaTemp.estado = 'en_proceso';
        
        localStorage.setItem('defensoria_denuncia_temp', JSON.stringify(denunciaTemp));

        // Simular procesamiento
        setTimeout(() => {
            this.mostrarCargando(false);
            this.redirigirSiguientePaso(tipoSeleccionado.value);
        }, 1000);
    }

    redirigirSiguientePaso(tipo) {
        this.mostrarExito(`Tipo de denuncia "${this.obtenerNombreTipo(tipo)}" seleccionado`);
        
        setTimeout(() => {
            if (tipo === 'infraestructura') {
                window.location.href = 'infraestructura-simple.html';
            } else {
                window.location.href = 'detalles-incidente.html';
            }
        }, 1500);
    }

    obtenerNombreTipo(tipo) {
        const tipos = {
            'personal': 'Denuncia Personal',
            'infraestructura': 'Infraestructura y Servicios'
        };
        return tipos[tipo] || tipo;
    }

    mostrarEfectoError() {
        const opciones = document.querySelectorAll('.denuncia-option');
        opciones.forEach((opcion, index) => {
            setTimeout(() => {
                opcion.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    opcion.style.animation = '';
                }, 500);
            }, index * 100);
        });
    }

    mostrarCargando(mostrar) {
        if (mostrar) {
            this.siguienteBtn.innerHTML = `
                <div class="btn-loader">
                    <div class="spinner"></div>
                    <span>Procesando...</span>
                </div>
            `;
            this.siguienteBtn.disabled = true;
        } else {
            this.siguienteBtn.innerHTML = `
                Siguiente
                <i class="fas fa-arrow-right"></i>
            `;
            this.siguienteBtn.disabled = false;
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
        window.denunciaCommands = {
            // Selección de tipos
            seleccionarPersonal: () => {
                document.querySelector('input[value="personal"]').checked = true;
                this.actualizarSeleccion('personal');
                console.log('✅ Denuncia personal seleccionada');
            },
            
            seleccionarInfraestructura: () => {
                document.querySelector('input[value="infraestructura"]').checked = true;
                this.actualizarSeleccion('infraestructura');
                console.log('✅ Denuncia de infraestructura seleccionada');
            },
            
            // Navegación
            siguiente: () => {
                this.siguientePaso();
            },
            
            // Datos de prueba
            cargarDatosPrueba: () => {
                const denunciaTemp = {
                    tipoDenuncia: 'personal',
                    fechaInicio: new Date().toISOString(),
                    estado: 'en_proceso',
                    usuario: JSON.parse(localStorage.getItem('defensoria_sesion'))
                };
                localStorage.setItem('defensoria_denuncia_temp', JSON.stringify(denunciaTemp));
                this.mostrarInfo('Datos de prueba cargados');
            },
            
            // Debug
            debug: () => {
                console.log('=== DEBUG DENUNCIA ===');
                console.log('Usuario en sesión:', localStorage.getItem('defensoria_sesion'));
                console.log('Denuncia temporal:', localStorage.getItem('defensoria_denuncia_temp'));
                console.log('Tipo seleccionado:', document.querySelector('.denuncia-radio:checked')?.value);
            },
            
            // Limpiar datos
            limpiar: () => {
                localStorage.removeItem('defensoria_denuncia_temp');
                this.formulario.reset();
                document.querySelectorAll('.denuncia-option').forEach(option => {
                    option.querySelector('.option-card').classList.remove('selected');
                });
                this.mostrarInfo('Formulario limpiado');
            }
        };

        console.log('🎮 Comandos de consola disponibles:');
        console.log('   denunciaCommands.seleccionarPersonal() - Seleccionar denuncia personal');
        console.log('   denunciaCommands.seleccionarInfraestructura() - Seleccionar infraestructura');
        console.log('   denunciaCommands.siguiente() - Ir al siguiente paso');
        console.log('   denunciaCommands.cargarDatosPrueba() - Cargar datos de prueba');
        console.log('   denunciaCommands.debug() - Información de debug');
        console.log('   denunciaCommands.limpiar() - Limpiar formulario');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new TipoDenuncia();
});

// Agregar animación de shake si no existe
if (!document.querySelector('#shake-animation')) {
    const style = document.createElement('style');
    style.id = 'shake-animation';
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .option-card.selected {
            border-color: var(--color-primary) !important;
            background: linear-gradient(135deg, var(--color-white) 0%, var(--color-gray-50) 100%) !important;
            transform: translateY(-5px) !important;
            box-shadow: var(--shadow-lg) !important;
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
    `;
    document.head.appendChild(style);
}