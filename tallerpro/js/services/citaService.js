/* TallerPro - Cita Service (placeholder) */
window.TallerPro = window.TallerPro || {};
window.TallerPro.CitaService = {
    listarPorFecha(fecha) {
        return window.TallerPro.Store.query('citas', c => c.fecha === fecha);
    },
    guardar(data) { return window.TallerPro.Store.save('citas', data); },
    eliminar(id) { return window.TallerPro.Store.remove('citas', id); },
    obtenerProximas(n) {
        const hoy = window.TallerPro.Utils.hoy();
        return window.TallerPro.Store.query('citas', c => c.fecha >= hoy)
            .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.horaInicio.localeCompare(b.horaInicio))
            .slice(0, n);
    }
};
