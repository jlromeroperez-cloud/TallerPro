/* =============================================
   TallerPro - Trabajo Service
   ============================================= */

window.TallerPro = window.TallerPro || {};

(function() {
    const Store = () => window.TallerPro.Store;
    const Utils = () => window.TallerPro.Utils;
    const COLECCION = 'trabajos';

    const TRANSICIONES = {
        peticion:               ['presupuesto_enviado'],
        presupuesto_enviado:    ['presupuesto_autorizado', 'peticion'],
        presupuesto_autorizado: ['recambios', 'cita_previa'],
        recambios:              ['cita_previa'],
        cita_previa:            ['en_taller'],
        en_taller:              ['finalizado'],
        finalizado:             ['peticion']
    };

    const ESTADOS_LABEL = {
        peticion: 'Petición de presupuesto',
        presupuesto_enviado: 'Presupuesto enviado',
        presupuesto_autorizado: 'Presupuesto autorizado',
        recambios: 'Recambios',
        cita_previa: 'Cita previa',
        en_taller: 'Coche en taller',
        finalizado: 'Finalizado'
    };

    window.TallerPro.TrabajoService = {
        TRANSICIONES,
        ESTADOS_LABEL,

        listar() {
            return Store().getAll(COLECCION);
        },

        obtener(id) {
            return Store().getById(COLECCION, id);
        },

        guardar(data) {
            if (!data.descripcion?.trim()) {
                throw new Error('La descripción es obligatoria');
            }
            if (!data.empresaId) {
                throw new Error('Debe seleccionar una empresa');
            }
            // Ensure arrays exist
            if (!data.presupuesto) data.presupuesto = { manoObra: 0, recambios: 0, total: 0, detalleLineas: [] };
            if (!data.recambiosPendientes) data.recambiosPendientes = [];
            if (!data.tareasPendientes) data.tareasPendientes = [];
            if (!data.historial) data.historial = [];
            if (!data.estado) data.estado = 'peticion';
            if (!data.prioridad) data.prioridad = 'normal';

            return Store().save(COLECCION, data);
        },

        eliminar(id) {
            return Store().remove(COLECCION, id);
        },

        listarPorEstado(estado) {
            return Store().query(COLECCION, t => t.estado === estado)
                .sort((a, b) => {
                    // Urgentes primero
                    const prioridades = { urgente: 0, alta: 1, normal: 2, baja: 3 };
                    return (prioridades[a.prioridad] || 2) - (prioridades[b.prioridad] || 2);
                });
        },

        listarPorEmpresa(empresaId) {
            return Store().query(COLECCION, t => t.empresaId === empresaId);
        },

        contarPorEstado() {
            const trabajos = this.listar();
            const conteo = {};
            trabajos.forEach(t => {
                conteo[t.estado] = (conteo[t.estado] || 0) + 1;
            });
            return conteo;
        },

        moverEstado(trabajoId, nuevoEstado) {
            const trabajo = this.obtener(trabajoId);
            if (!trabajo) throw new Error('Trabajo no encontrado');

            const permitidos = TRANSICIONES[trabajo.estado] || [];
            if (!permitidos.includes(nuevoEstado)) {
                throw new Error(`No se puede mover de "${ESTADOS_LABEL[trabajo.estado]}" a "${ESTADOS_LABEL[nuevoEstado]}"`);
            }

            const estadoAnterior = trabajo.estado;

            // Set sub-estado recambios
            if (nuevoEstado === 'recambios') {
                trabajo.subEstadoRecambios = 'por_pedir';
            } else {
                trabajo.subEstadoRecambios = null;
            }

            // Auto-set dates
            if (nuevoEstado === 'en_taller') trabajo.fechaEntrada = Utils().ahora();
            if (nuevoEstado === 'finalizado') trabajo.fechaSalida = Utils().ahora();

            // Record history
            trabajo.historial.push({
                fecha: Utils().ahora(),
                estadoAnterior,
                estadoNuevo: nuevoEstado
            });

            trabajo.estado = nuevoEstado;
            return this.guardar(trabajo);
        },

        puedeAvanzarDesdeRecambios(trabajoId) {
            const trabajo = this.obtener(trabajoId);
            if (!trabajo || !trabajo.recambiosPendientes) return true;
            return trabajo.recambiosPendientes.every(r => r.estado === 'recibido');
        },

        actualizarRecambio(trabajoId, index, nuevoEstado) {
            const trabajo = this.obtener(trabajoId);
            if (!trabajo?.recambiosPendientes?.[index]) return null;
            trabajo.recambiosPendientes[index].estado = nuevoEstado;
            if (nuevoEstado === 'pedido') {
                trabajo.recambiosPendientes[index].fechaPedido = Utils().hoy();
            }
            // Update global sub-estado
            const estados = trabajo.recambiosPendientes.map(r => r.estado);
            if (estados.every(e => e === 'recibido')) trabajo.subEstadoRecambios = 'recibido';
            else if (estados.some(e => e === 'pedido')) trabajo.subEstadoRecambios = 'pedido';
            else trabajo.subEstadoRecambios = 'por_pedir';

            return this.guardar(trabajo);
        },

        toggleTarea(trabajoId, index) {
            const trabajo = this.obtener(trabajoId);
            if (!trabajo?.tareasPendientes?.[index]) return null;
            trabajo.tareasPendientes[index].completada = !trabajo.tareasPendientes[index].completada;
            return this.guardar(trabajo);
        },

        recalcularPresupuesto(trabajoId) {
            const trabajo = this.obtener(trabajoId);
            if (!trabajo?.presupuesto) return null;
            let manoObra = 0, recambios = 0;
            trabajo.presupuesto.detalleLineas.forEach(l => {
                const subtotal = (l.cantidad || 1) * (l.precio || 0);
                if (l.tipo === 'mano_obra') manoObra += subtotal;
                else recambios += subtotal;
            });
            trabajo.presupuesto.manoObra = manoObra;
            trabajo.presupuesto.recambios = recambios;
            trabajo.presupuesto.total = manoObra + recambios;
            return this.guardar(trabajo);
        },

        // Dashboard helpers
        resumenRecambios() {
            const trabajos = this.listar();
            let porPedir = 0, pedidos = 0, recibidos = 0;
            trabajos.forEach(t => {
                (t.recambiosPendientes || []).forEach(r => {
                    if (r.estado === 'por_pedir') porPedir++;
                    else if (r.estado === 'pedido') pedidos++;
                    else if (r.estado === 'recibido') recibidos++;
                });
            });
            return { porPedir, pedidos, recibidos };
        },

        enTallerConProgreso() {
            return this.listarPorEstado('en_taller').map(t => {
                const total = t.tareasPendientes?.length || 0;
                const hechas = t.tareasPendientes?.filter(x => x.completada).length || 0;
                return { ...t, tareasTotal: total, tareasHechas: hechas };
            });
        }
    };
})();
