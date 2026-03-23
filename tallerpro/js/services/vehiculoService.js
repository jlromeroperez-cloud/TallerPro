/* =============================================
   TallerPro - Vehículo Service
   ============================================= */

window.TallerPro = window.TallerPro || {};

(function() {
    const Store = () => window.TallerPro.Store;
    const COLECCION = 'vehiculos';

    window.TallerPro.VehiculoService = {
        listarPorEmpresa(empresaId) {
            return Store().query(COLECCION, v => v.empresaId === empresaId)
                .sort((a, b) => (a.matricula || '').localeCompare(b.matricula || ''));
        },

        listarTodos() {
            return Store().getAll(COLECCION);
        },

        obtener(id) {
            return Store().getById(COLECCION, id);
        },

        guardar(data) {
            if (!data.matricula?.trim()) {
                throw new Error('La matrícula es obligatoria');
            }
            if (!data.empresaId) {
                throw new Error('El vehículo debe estar asociado a una empresa');
            }
            data.matricula = data.matricula.trim().toUpperCase();
            return Store().save(COLECCION, data);
        },

        eliminar(id) {
            const trabajos = Store().query('trabajos', t => t.vehiculoId === id && t.estado !== 'finalizado');
            if (trabajos.length > 0) {
                throw new Error('Este vehículo tiene trabajos activos');
            }
            return Store().remove(COLECCION, id);
        },

        buscar(query) {
            const q = query.toLowerCase();
            return Store().getAll(COLECCION).filter(v =>
                v.matricula?.toLowerCase().includes(q) ||
                v.marca?.toLowerCase().includes(q) ||
                v.modelo?.toLowerCase().includes(q)
            );
        }
    };
})();
