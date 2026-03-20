/* =============================================
   TallerPro - Cita Service
   ============================================= */

window.TallerPro = window.TallerPro || {};

(function() {
    const Store = () => window.TallerPro.Store;
    const Utils = () => window.TallerPro.Utils;
    const COLECCION = 'citas';

    window.TallerPro.CitaService = {
        listarTodas() {
            return Store().getAll(COLECCION);
        },

        obtener(id) {
            return Store().getById(COLECCION, id);
        },

        listarPorFecha(fecha) {
            return Store().query(COLECCION, c => c.fecha === fecha)
                .sort((a, b) => (a.horaInicio || '').localeCompare(b.horaInicio || ''));
        },

        listarPorRango(fechaInicio, fechaFin) {
            return Store().query(COLECCION, c => c.fecha >= fechaInicio && c.fecha <= fechaFin)
                .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.horaInicio.localeCompare(b.horaInicio));
        },

        listarPorEmpresa(empresaId) {
            return Store().query(COLECCION, c => c.empresaId === empresaId)
                .sort((a, b) => a.fecha.localeCompare(b.fecha));
        },

        guardar(data) {
            if (!data.fecha) throw new Error('La fecha es obligatoria');
            if (!data.horaInicio) throw new Error('La hora de inicio es obligatoria');

            // Check capacity conflicts
            const config = Store().getConfig();
            const capacidad = config.capacidadSimultanea || 4;
            const citasMismoDia = this.listarPorFecha(data.fecha);
            const conflictos = citasMismoDia.filter(c => {
                if (data.id && c.id === data.id) return false; // exclude self on edit
                return horasSolapan(data.horaInicio, data.horaFin || data.horaInicio, c.horaInicio, c.horaFin || c.horaInicio);
            });

            if (conflictos.length >= capacidad) {
                throw new Error(`Se ha alcanzado la capacidad máxima (${capacidad}) para esa franja horaria`);
            }

            return Store().save(COLECCION, data);
        },

        eliminar(id) {
            return Store().remove(COLECCION, id);
        },

        obtenerProximas(n) {
            const hoy = Utils().hoy();
            return Store().query(COLECCION, c => c.fecha >= hoy)
                .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.horaInicio.localeCompare(b.horaInicio))
                .slice(0, n);
        },

        contarHoy() {
            return this.listarPorFecha(Utils().hoy()).length;
        },

        contarSemana() {
            const hoy = new Date();
            const lunes = new Date(hoy);
            const dia = hoy.getDay();
            lunes.setDate(hoy.getDate() - (dia === 0 ? 6 : dia - 1));
            const domingo = new Date(lunes);
            domingo.setDate(lunes.getDate() + 6);
            return this.listarPorRango(
                lunes.toISOString().split('T')[0],
                domingo.toISOString().split('T')[0]
            ).length;
        }
    };

    function horasSolapan(inicio1, fin1, inicio2, fin2) {
        // Simple overlap check
        return inicio1 < fin2 && fin1 > inicio2;
    }
})();
