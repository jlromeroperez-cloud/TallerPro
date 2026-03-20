/* TallerPro - Empresa Service (placeholder) */
window.TallerPro = window.TallerPro || {};
window.TallerPro.EmpresaService = {
    listar(filtro) { return window.TallerPro.Store.getAll('empresas'); },
    obtener(id) { return window.TallerPro.Store.getById('empresas', id); },
    guardar(data) { return window.TallerPro.Store.save('empresas', data); },
    eliminar(id) { return window.TallerPro.Store.remove('empresas', id); }
};
