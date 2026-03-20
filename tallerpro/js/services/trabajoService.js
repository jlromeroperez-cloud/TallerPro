/* TallerPro - Trabajo Service (placeholder) */
window.TallerPro = window.TallerPro || {};
window.TallerPro.TrabajoService = {
    listar() { return window.TallerPro.Store.getAll('trabajos'); },
    obtener(id) { return window.TallerPro.Store.getById('trabajos', id); },
    guardar(data) { return window.TallerPro.Store.save('trabajos', data); },
    eliminar(id) { return window.TallerPro.Store.remove('trabajos', id); },
    listarPorEstado(estado) {
        return window.TallerPro.Store.query('trabajos', t => t.estado === estado);
    },
    contarPorEstado() {
        const trabajos = this.listar();
        const conteo = {};
        trabajos.forEach(t => {
            conteo[t.estado] = (conteo[t.estado] || 0) + 1;
        });
        return conteo;
    }
};
