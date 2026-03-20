/* =============================================
   TallerPro - Vista Dashboard
   ============================================= */

window.TallerPro = window.TallerPro || {};
window.TallerPro.Views = window.TallerPro.Views || {};

(function() {
    const Utils = () => window.TallerPro.Utils;
    const Store = () => window.TallerPro.Store;
    const TrabajoService = () => window.TallerPro.TrabajoService;
    const CitaService = () => window.TallerPro.CitaService;

    const ESTADOS = {
        peticion: 'Peticiones',
        presupuesto_enviado: 'Ptos. Enviados',
        presupuesto_autorizado: 'Ptos. Autorizados',
        recambios: 'Recambios',
        cita_previa: 'Cita Previa',
        en_taller: 'En Taller',
        finalizado: 'Finalizados'
    };

    function render(contenedor) {
        const conteo = TrabajoService().contarPorEstado();
        const enTaller = TrabajoService().listarPorEstado('en_taller');
        const proximasCitas = CitaService().obtenerProximas(5);
        const peticionesPendientes = conteo.peticion || 0;
        const presupuestosPendientes = conteo.presupuesto_enviado || 0;

        // Contar recambios pendientes
        const trabajos = TrabajoService().listar();
        let recambiosPorPedir = 0;
        let recambiosPedidos = 0;
        trabajos.forEach(t => {
            if (t.recambiosPendientes) {
                t.recambiosPendientes.forEach(r => {
                    if (r.estado === 'por_pedir') recambiosPorPedir++;
                    if (r.estado === 'pedido') recambiosPedidos++;
                });
            }
        });

        const capacidad = Store().getConfig().capacidadSimultanea || 4;

        contenedor.innerHTML = `
            <div class="vista-header">
                <h1>Panel de Control</h1>
            </div>

            <div class="dashboard-grid">
                <!-- Coches en taller -->
                <div class="card dashboard-card">
                    <div class="card-header">
                        <h3>Coches en Taller</h3>
                        <span class="badge ${enTaller.length >= capacidad ? 'badge-error' : 'badge-info'}">${enTaller.length}/${capacidad}</span>
                    </div>
                    <div class="card-body">
                        ${enTaller.length === 0 ? '<p class="text-sm text-terciario">No hay coches en taller</p>' :
                            enTaller.map(t => {
                                const empresa = Store().getById('empresas', t.empresaId);
                                const vehiculo = Store().getById('vehiculos', t.vehiculoId);
                                const tareasTotal = t.tareasPendientes?.length || 0;
                                const tareasHechas = t.tareasPendientes?.filter(x => x.completada).length || 0;
                                return `
                                    <a href="#/trabajo/${t.id}" class="dashboard-item">
                                        <div class="dashboard-item-info">
                                            <span class="font-medium">${Utils().sanitizeHTML(vehiculo?.matricula || 'Sin matrícula')}</span>
                                            <span class="text-sm text-secundario">${Utils().sanitizeHTML(empresa?.nombre || 'Sin empresa')}</span>
                                        </div>
                                        <div class="dashboard-item-meta">
                                            ${tareasTotal > 0 ? `<span class="badge badge-neutral">${tareasHechas}/${tareasTotal} tareas</span>` : ''}
                                        </div>
                                    </a>`;
                            }).join('')
                        }
                    </div>
                </div>

                <!-- Gestiones pendientes -->
                <div class="card dashboard-card">
                    <div class="card-header">
                        <h3>Gestiones Pendientes</h3>
                    </div>
                    <div class="card-body">
                        <a href="#/pipeline" class="dashboard-stat">
                            <span class="dashboard-stat-numero">${peticionesPendientes}</span>
                            <span class="dashboard-stat-label">Peticiones nuevas</span>
                        </a>
                        <a href="#/pipeline" class="dashboard-stat">
                            <span class="dashboard-stat-numero">${presupuestosPendientes}</span>
                            <span class="dashboard-stat-label">Presupuestos por autorizar</span>
                        </a>
                    </div>
                </div>

                <!-- Recambios pendientes -->
                <div class="card dashboard-card">
                    <div class="card-header">
                        <h3>Recambios</h3>
                    </div>
                    <div class="card-body">
                        <div class="dashboard-stat">
                            <span class="dashboard-stat-numero" style="color: var(--color-error)">${recambiosPorPedir}</span>
                            <span class="dashboard-stat-label">Por pedir</span>
                        </div>
                        <div class="dashboard-stat">
                            <span class="dashboard-stat-numero" style="color: var(--color-advertencia)">${recambiosPedidos}</span>
                            <span class="dashboard-stat-label">Pedidos (esperando)</span>
                        </div>
                    </div>
                </div>

                <!-- Próximas citas -->
                <div class="card dashboard-card">
                    <div class="card-header">
                        <h3>Próximas Citas</h3>
                        <a href="#/agenda" class="btn btn-sm btn-fantasma">Ver agenda</a>
                    </div>
                    <div class="card-body">
                        ${proximasCitas.length === 0 ? '<p class="text-sm text-terciario">No hay citas programadas</p>' :
                            proximasCitas.map(c => {
                                const empresa = Store().getById('empresas', c.empresaId);
                                return `
                                    <div class="dashboard-item">
                                        <div class="dashboard-item-info">
                                            <span class="font-medium">${Utils().formatearFecha(c.fecha)} ${c.horaInicio}</span>
                                            <span class="text-sm text-secundario">${Utils().sanitizeHTML(empresa?.nombre || '')}</span>
                                        </div>
                                        <span class="badge badge-primario">${Utils().sanitizeHTML(c.tipo || 'Cita')}</span>
                                    </div>`;
                            }).join('')
                        }
                    </div>
                </div>

                <!-- Resumen pipeline -->
                <div class="card dashboard-card dashboard-card-ancho">
                    <div class="card-header">
                        <h3>Resumen del Flujo</h3>
                        <a href="#/pipeline" class="btn btn-sm btn-fantasma">Ver tablero</a>
                    </div>
                    <div class="card-body">
                        <div class="pipeline-resumen">
                            ${Object.entries(ESTADOS).map(([key, label]) => {
                                const count = conteo[key] || 0;
                                return `
                                    <div class="pipeline-resumen-item">
                                        <span class="pipeline-resumen-label">${label}</span>
                                        <div class="pipeline-resumen-barra">
                                            <div class="pipeline-resumen-relleno" style="width: ${Math.min(count * 10, 100)}%"></div>
                                        </div>
                                        <span class="pipeline-resumen-count">${count}</span>
                                    </div>`;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function destroy() {}

    window.TallerPro.Views.Dashboard = { render, destroy };
})();
