/* TallerPro - Vehículo Service (placeholder) */
window.TallerPro = window.TallerPro || {};
window.TallerPro.VehiculoService = {
    listarPorEmpresa(empresaId) {
        return window.TallerPro.Store.query('vehiculos', v => v.empresaId === empresaId);
    },
    guardar(data) { return window.TallerPro.Store.save('vehiculos', data); },
    eliminar(id) { return window.TallerPro.Store.remove('vehiculos', id); }
};
