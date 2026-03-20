/* =============================================
   TallerPro - Utilidades
   ============================================= */

window.TallerPro = window.TallerPro || {};

window.TallerPro.Utils = {
    /**
     * Genera un ID único con prefijo
     */
    generarId(prefijo = 'id') {
        const rand = Math.random().toString(36).substring(2, 10);
        const time = Date.now().toString(36);
        return `${prefijo}_${time}${rand}`;
    },

    /**
     * Formatea fecha ISO a formato español dd/mm/yyyy
     */
    formatearFecha(fecha) {
        if (!fecha) return '';
        const d = new Date(fecha);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },

    /**
     * Formatea fecha a texto legible
     */
    formatearFechaTexto(fecha) {
        if (!fecha) return '';
        const d = new Date(fecha);
        return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    },

    /**
     * Formatea hora HH:MM
     */
    formatearHora(hora) {
        return hora || '';
    },

    /**
     * Formatea número como moneda EUR
     */
    formatearMoneda(cantidad) {
        if (cantidad == null || isNaN(cantidad)) return '0,00 €';
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(cantidad);
    },

    /**
     * Valida CIF/NIF básico
     */
    validarCIF(cif) {
        if (!cif) return false;
        return /^[A-Z]\d{7}[A-Z0-9]$/i.test(cif.trim()) || /^\d{8}[A-Z]$/i.test(cif.trim());
    },

    /**
     * Debounce
     */
    debounce(fn, ms = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), ms);
        };
    },

    /**
     * Sanitiza HTML para prevenir XSS
     */
    sanitizeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Obtiene fecha actual en formato ISO (solo fecha)
     */
    hoy() {
        return new Date().toISOString().split('T')[0];
    },

    /**
     * Obtiene fecha y hora actual en ISO
     */
    ahora() {
        return new Date().toISOString();
    },

    /**
     * Compara dos fechas (solo día)
     */
    mismaFecha(fecha1, fecha2) {
        return fecha1?.split('T')[0] === fecha2?.split('T')[0];
    },

    /**
     * Nombre del día de la semana
     */
    nombreDia(fecha) {
        const d = new Date(fecha);
        return d.toLocaleDateString('es-ES', { weekday: 'short' });
    },

    /**
     * Días en un mes
     */
    diasEnMes(anio, mes) {
        return new Date(anio, mes + 1, 0).getDate();
    },

    /**
     * Primer día del mes (0=domingo, 1=lunes...)
     */
    primerDiaSemana(anio, mes) {
        const dia = new Date(anio, mes, 1).getDay();
        return dia === 0 ? 6 : dia - 1; // Lunes = 0
    }
};
