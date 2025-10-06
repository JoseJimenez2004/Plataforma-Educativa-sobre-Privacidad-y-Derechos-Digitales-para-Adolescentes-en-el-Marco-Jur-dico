class Validadores {
    static validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    static validarPassword(password) {
        return password.length >= 8 && 
               /[A-Z]/.test(password) && 
               /[a-z]/.test(password) && 
               /[0-9]/.test(password) && 
               /[^A-Za-z0-9]/.test(password);
    }

    static validarNumeroIdentificacion(numero, tipo) {
        if (tipo === 'estudiante') {
            return /^\d{10}$/.test(numero); // 10 dígitos para boleta
        } else if (tipo === 'trabajador') {
            return /^\d{6,10}$/.test(numero); // 6-10 dígitos para trabajador
        }
        return false;
    }

    static validarFecha(fecha) {
        const fechaObj = new Date(fecha);
        const hoy = new Date();
        return fechaObj <= hoy;
    }

    static validarHora(hora) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora);
    }

    static sanitizarTexto(texto) {
        return texto.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    static validarLongitudTexto(texto, min, max) {
        const longitud = texto.trim().length;
        return longitud >= min && longitud <= max;
    }
}

// Exportar para uso global
window.Validadores = Validadores;