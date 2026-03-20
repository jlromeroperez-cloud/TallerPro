/* =============================================
   TallerPro - Empresa Service
   ============================================= */

window.TallerPro = window.TallerPro || {};

(function() {
    const Store = () => window.TallerPro.Store;
    const Utils = () => window.TallerPro.Utils;
    const COLECCION = 'empresas';

    window.TallerPro.EmpresaService = {
        listar(filtro) {
            let empresas = Store().getAll(COLECCION);
            if (filtro) {
                const f = filtro.toLowerCase();
                empresas = empresas.filter(e =>
                    e.nombre?.toLowerCase().includes(f) ||
                    e.cif?.toLowerCase().includes(f) ||
                    e.contactos?.some(c => c.nombre?.toLowerCase().includes(f))
                );
            }
            return empresas.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
        },

        obtener(id) {
            return Store().getById(COLECCION, id);
        },

        guardar(data) {
            if (!data.nombre?.trim()) {
                throw new Error('El nombre de la empresa es obligatorio');
            }
            // Ensure contactos array
            if (!data.contactos) data.contactos = [];
            data.contactos.forEach(c => {
                if (!c.id) c.id = Utils().generarId('con');
            });
            return Store().save(COLECCION, data);
        },

        eliminar(id) {
            // Check for linked work orders
            const trabajos = Store().query('trabajos', t => t.empresaId === id);
            if (trabajos.length > 0) {
                const activos = trabajos.filter(t => t.estado !== 'finalizado');
                if (activos.length > 0) {
                    throw new Error(`Esta empresa tiene ${activos.length} trabajo(s) activo(s). Finalízalos antes de eliminar.`);
                }
            }
            // Remove linked vehicles
            const vehiculos = Store().query('vehiculos', v => v.empresaId === id);
            vehiculos.forEach(v => Store().remove('vehiculos', v.id));
            return Store().remove(COLECCION, id);
        },

        agregarContacto(empresaId, contacto) {
            const empresa = this.obtener(empresaId);
            if (!empresa) return null;
            if (!empresa.contactos) empresa.contactos = [];
            contacto.id = contacto.id || Utils().generarId('con');
            empresa.contactos.push(contacto);
            return this.guardar(empresa);
        },

        eliminarContacto(empresaId, contactoId) {
            const empresa = this.obtener(empresaId);
            if (!empresa) return null;
            empresa.contactos = (empresa.contactos || []).filter(c => c.id !== contactoId);
            return this.guardar(empresa);
        },

        contarVehiculos(empresaId) {
            return Store().query('vehiculos', v => v.empresaId === empresaId).length;
        },

        contarTrabajosActivos(empresaId) {
            return Store().query('trabajos', t => t.empresaId === empresaId && t.estado !== 'finalizado').length;
        }
    };
})();
