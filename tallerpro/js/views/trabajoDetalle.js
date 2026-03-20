/* =============================================
   TallerPro - Vista Detalle de Trabajo
   ============================================= */

window.TallerPro = window.TallerPro || {};
window.TallerPro.Views = window.TallerPro.Views || {};

(function() {
    const Utils = () => window.TallerPro.Utils;
    const Store = () => window.TallerPro.Store;
    const TrabajoService = () => window.TallerPro.TrabajoService;
    const EmpresaService = () => window.TallerPro.EmpresaService;
    const Modal = () => window.TallerPro.Modal;
    const Toast = () => window.TallerPro.Toast;

    const ESTADOS_LABEL = {
        peticion: 'Petición de presupuesto',
        presupuesto_enviado: 'Presupuesto enviado',
        presupuesto_autorizado: 'Presupuesto autorizado',
        recambios: 'Recambios',
        cita_previa: 'Cita previa',
        en_taller: 'Coche en taller',
        finalizado: 'Finalizado'
    };

    const TRANSICIONES = {
        peticion: ['presupuesto_enviado'],
        presupuesto_enviado: ['presupuesto_autorizado', 'peticion'],
        presupuesto_autorizado: ['recambios', 'cita_previa'],
        recambios: ['cita_previa'],
        cita_previa: ['en_taller'],
        en_taller: ['finalizado'],
        finalizado: ['peticion']
    };

    let contenedorRef = null;
    let trabajoId = null;

    function render(contenedor, params) {
        contenedorRef = contenedor;
        trabajoId = params.id;
        renderDetalle();
        contenedor.addEventListener('click', manejarClick);
        contenedor.addEventListener('change', manejarChange);
    }

    function renderDetalle() {
        const trabajo = TrabajoService().obtener(trabajoId);
        if (!trabajo) {
            contenedorRef.innerHTML = `
                <div class="estado-vacio">
                    <p>Trabajo no encontrado</p>
                    <a href="#/pipeline" class="btn btn-primario">Volver al flujo</a>
                </div>`;
            return;
        }

        const empresa = EmpresaService().obtener(trabajo.empresaId);
        const vehiculo = Store().getById('vehiculos', trabajo.vehiculoId);
        const siguientes = TRANSICIONES[trabajo.estado] || [];

        contenedorRef.innerHTML = `
            <a href="#/pipeline" class="vista-volver">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Volver al flujo
            </a>

            <div class="vista-header">
                <div>
                    <h1>${Utils().sanitizeHTML(vehiculo?.matricula || 'Sin vehículo')} - ${Utils().sanitizeHTML(empresa?.nombre || 'Sin empresa')}</h1>
                    <span class="badge badge-primario">${ESTADOS_LABEL[trabajo.estado] || trabajo.estado}</span>
                </div>
                <div class="vista-header-acciones">
                    ${siguientes.map(s => `
                        <button class="btn btn-primario btn-mover-estado" data-nuevo-estado="${s}">
                            → ${ESTADOS_LABEL[s] || s}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="detalle-grid">
                <!-- Info general -->
                <div class="card">
                    <div class="card-header"><h3>Información</h3></div>
                    <div class="card-body">
                        <div class="detalle-campo">
                            <span class="detalle-label">Empresa</span>
                            <a href="#/empresas/${trabajo.empresaId}" class="detalle-valor">${Utils().sanitizeHTML(empresa?.nombre || '-')}</a>
                        </div>
                        <div class="detalle-campo">
                            <span class="detalle-label">Vehículo</span>
                            <span class="detalle-valor">${Utils().sanitizeHTML(vehiculo ? `${vehiculo.matricula} - ${vehiculo.marca || ''} ${vehiculo.modelo || ''}` : '-')}</span>
                        </div>
                        <div class="detalle-campo">
                            <span class="detalle-label">Prioridad</span>
                            <span class="badge badge-${trabajo.prioridad === 'urgente' ? 'error' : trabajo.prioridad === 'alta' ? 'advertencia' : 'neutral'}">${trabajo.prioridad || 'normal'}</span>
                        </div>
                        <div class="detalle-campo">
                            <span class="detalle-label">Descripción</span>
                            <span class="detalle-valor">${Utils().sanitizeHTML(trabajo.descripcion || '-')}</span>
                        </div>
                        ${trabajo.notas ? `
                        <div class="detalle-campo">
                            <span class="detalle-label">Notas</span>
                            <span class="detalle-valor">${Utils().sanitizeHTML(trabajo.notas)}</span>
                        </div>` : ''}
                        <div class="detalle-campo">
                            <span class="detalle-label">Creado</span>
                            <span class="detalle-valor">${Utils().formatearFecha(trabajo.creadoEn)}</span>
                        </div>
                        ${trabajo.fechaEntrada ? `<div class="detalle-campo"><span class="detalle-label">Entrada taller</span><span class="detalle-valor">${Utils().formatearFecha(trabajo.fechaEntrada)}</span></div>` : ''}
                        ${trabajo.fechaSalida ? `<div class="detalle-campo"><span class="detalle-label">Salida</span><span class="detalle-valor">${Utils().formatearFecha(trabajo.fechaSalida)}</span></div>` : ''}
                    </div>
                </div>

                <!-- Presupuesto -->
                <div class="card">
                    <div class="card-header">
                        <h3>Presupuesto</h3>
                        <button class="btn btn-sm btn-secundario" id="btn-add-linea">+ Línea</button>
                    </div>
                    <div class="card-body">
                        ${(!trabajo.presupuesto?.detalleLineas || trabajo.presupuesto.detalleLineas.length === 0) ?
                            '<p class="text-sm text-terciario">Sin líneas de presupuesto</p>' :
                            `<div class="tabla-wrapper">
                                <table class="tabla">
                                    <thead><tr><th>Concepto</th><th>Cant.</th><th>Precio</th><th>Tipo</th><th></th></tr></thead>
                                    <tbody>
                                        ${trabajo.presupuesto.detalleLineas.map((l, i) => `
                                            <tr>
                                                <td>${Utils().sanitizeHTML(l.concepto)}</td>
                                                <td>${l.cantidad}</td>
                                                <td>${Utils().formatearMoneda(l.precio)}</td>
                                                <td><span class="badge badge-neutral">${l.tipo === 'recambio' ? 'Recambio' : 'M. Obra'}</span></td>
                                                <td><button class="btn-icono btn-eliminar-linea" data-linea="${i}" aria-label="Eliminar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            <div style="text-align: right; margin-top: var(--espacio-md);">
                                <span class="font-semibold" style="font-size: var(--font-size-lg);">Total: ${Utils().formatearMoneda(trabajo.presupuesto.total)}</span>
                            </div>`
                        }
                    </div>
                </div>

                <!-- Recambios -->
                <div class="card">
                    <div class="card-header">
                        <h3>Recambios</h3>
                        <button class="btn btn-sm btn-secundario" id="btn-add-recambio">+ Recambio</button>
                    </div>
                    <div class="card-body">
                        ${(!trabajo.recambiosPendientes || trabajo.recambiosPendientes.length === 0) ?
                            '<p class="text-sm text-terciario">Sin recambios</p>' :
                            trabajo.recambiosPendientes.map((r, i) => `
                                <div class="recambio-item">
                                    <div class="recambio-info">
                                        <span class="font-medium">${Utils().sanitizeHTML(r.nombre)}</span>
                                        ${r.proveedor ? `<span class="text-xs text-secundario">${Utils().sanitizeHTML(r.proveedor)}</span>` : ''}
                                    </div>
                                    <select class="form-select recambio-estado-select" data-recambio-index="${i}" style="width: auto; min-width: 120px;">
                                        <option value="por_pedir" ${r.estado === 'por_pedir' ? 'selected' : ''}>Por pedir</option>
                                        <option value="pedido" ${r.estado === 'pedido' ? 'selected' : ''}>Pedido</option>
                                        <option value="recibido" ${r.estado === 'recibido' ? 'selected' : ''}>Recibido</option>
                                    </select>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>

                <!-- Tareas -->
                <div class="card">
                    <div class="card-header">
                        <h3>Tareas</h3>
                        <button class="btn btn-sm btn-secundario" id="btn-add-tarea">+ Tarea</button>
                    </div>
                    <div class="card-body">
                        ${(!trabajo.tareasPendientes || trabajo.tareasPendientes.length === 0) ?
                            '<p class="text-sm text-terciario">Sin tareas</p>' :
                            trabajo.tareasPendientes.map((t, i) => `
                                <label class="checkbox-grupo">
                                    <input type="checkbox" ${t.completada ? 'checked' : ''} data-tarea-index="${i}">
                                    <span class="checkbox-label">${Utils().sanitizeHTML(t.descripcion)}</span>
                                </label>
                            `).join('')
                        }
                    </div>
                </div>

                <!-- Historial -->
                <div class="card">
                    <div class="card-header"><h3>Historial</h3></div>
                    <div class="card-body">
                        ${(!trabajo.historial || trabajo.historial.length === 0) ?
                            '<p class="text-sm text-terciario">Sin historial</p>' :
                            trabajo.historial.slice().reverse().map(h => `
                                <div class="historial-item">
                                    <span class="text-xs text-terciario">${Utils().formatearFecha(h.fecha)}</span>
                                    <span class="text-sm">${h.estadoAnterior ? `${ESTADOS_LABEL[h.estadoAnterior] || h.estadoAnterior} → ` : ''}${ESTADOS_LABEL[h.estadoNuevo] || h.estadoNuevo}</span>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            </div>
        `;
    }

    function manejarClick(e) {
        // Mover estado
        const btnMover = e.target.closest('.btn-mover-estado');
        if (btnMover) {
            const trabajo = TrabajoService().obtener(trabajoId);
            if (!trabajo) return;
            const nuevoEstado = btnMover.dataset.nuevoEstado;

            if (nuevoEstado === 'recambios') {
                trabajo.subEstadoRecambios = 'por_pedir';
            } else {
                trabajo.subEstadoRecambios = null;
            }
            if (nuevoEstado === 'en_taller') trabajo.fechaEntrada = Utils().ahora();
            if (nuevoEstado === 'finalizado') trabajo.fechaSalida = Utils().ahora();

            if (!trabajo.historial) trabajo.historial = [];
            trabajo.historial.push({ fecha: Utils().ahora(), estadoAnterior: trabajo.estado, estadoNuevo: nuevoEstado });
            trabajo.estado = nuevoEstado;
            TrabajoService().guardar(trabajo);
            Toast().exito(`Estado cambiado a: ${ESTADOS_LABEL[nuevoEstado]}`);
            renderDetalle();
            return;
        }

        // Añadir línea presupuesto
        if (e.target.closest('#btn-add-linea')) {
            Modal().abrir({
                titulo: 'Nueva Línea de Presupuesto',
                contenido: `
                    <div class="form-grupo">
                        <label class="form-label">Concepto *</label>
                        <input type="text" class="form-input" id="modal-linea-concepto" placeholder="Ej: Pastillas de freno">
                    </div>
                    <div class="form-fila">
                        <div class="form-grupo">
                            <label class="form-label">Cantidad</label>
                            <input type="number" class="form-input" id="modal-linea-cantidad" value="1" min="1">
                        </div>
                        <div class="form-grupo">
                            <label class="form-label">Precio</label>
                            <input type="number" class="form-input" id="modal-linea-precio" value="0" step="0.01" min="0">
                        </div>
                    </div>
                    <div class="form-grupo">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" id="modal-linea-tipo">
                            <option value="recambio">Recambio</option>
                            <option value="mano_obra">Mano de obra</option>
                        </select>
                    </div>
                `,
                textoConfirmar: 'Añadir',
                onConfirmar: () => {
                    const concepto = document.getElementById('modal-linea-concepto')?.value?.trim();
                    if (!concepto) { Toast().error('El concepto es obligatorio'); return; }
                    const trabajo = TrabajoService().obtener(trabajoId);
                    if (!trabajo.presupuesto) trabajo.presupuesto = { manoObra: 0, recambios: 0, total: 0, detalleLineas: [] };
                    const cantidad = parseFloat(document.getElementById('modal-linea-cantidad')?.value) || 1;
                    const precio = parseFloat(document.getElementById('modal-linea-precio')?.value) || 0;
                    const tipo = document.getElementById('modal-linea-tipo')?.value || 'recambio';
                    trabajo.presupuesto.detalleLineas.push({ concepto, cantidad, precio, tipo });
                    recalcularPresupuesto(trabajo);
                    TrabajoService().guardar(trabajo);
                    Modal().cerrar();
                    Toast().exito('Línea añadida');
                    renderDetalle();
                }
            });
            return;
        }

        // Eliminar línea
        const btnEliminarLinea = e.target.closest('.btn-eliminar-linea');
        if (btnEliminarLinea) {
            const index = parseInt(btnEliminarLinea.dataset.linea);
            const trabajo = TrabajoService().obtener(trabajoId);
            trabajo.presupuesto.detalleLineas.splice(index, 1);
            recalcularPresupuesto(trabajo);
            TrabajoService().guardar(trabajo);
            Toast().info('Línea eliminada');
            renderDetalle();
            return;
        }

        // Añadir recambio
        if (e.target.closest('#btn-add-recambio')) {
            Modal().abrir({
                titulo: 'Nuevo Recambio',
                contenido: `
                    <div class="form-grupo">
                        <label class="form-label">Nombre del recambio *</label>
                        <input type="text" class="form-input" id="modal-recambio-nombre" placeholder="Ej: Pastillas Brembo P06033">
                    </div>
                    <div class="form-grupo">
                        <label class="form-label">Proveedor</label>
                        <input type="text" class="form-input" id="modal-recambio-proveedor" placeholder="Ej: Recambios López">
                    </div>
                `,
                textoConfirmar: 'Añadir',
                onConfirmar: () => {
                    const nombre = document.getElementById('modal-recambio-nombre')?.value?.trim();
                    if (!nombre) { Toast().error('El nombre es obligatorio'); return; }
                    const trabajo = TrabajoService().obtener(trabajoId);
                    if (!trabajo.recambiosPendientes) trabajo.recambiosPendientes = [];
                    trabajo.recambiosPendientes.push({
                        nombre,
                        estado: 'por_pedir',
                        proveedor: document.getElementById('modal-recambio-proveedor')?.value?.trim() || '',
                        fechaPedido: null
                    });
                    TrabajoService().guardar(trabajo);
                    Modal().cerrar();
                    Toast().exito('Recambio añadido');
                    renderDetalle();
                }
            });
            return;
        }

        // Añadir tarea
        if (e.target.closest('#btn-add-tarea')) {
            Modal().abrir({
                titulo: 'Nueva Tarea',
                contenido: `
                    <div class="form-grupo">
                        <label class="form-label">Descripción *</label>
                        <input type="text" class="form-input" id="modal-tarea-desc" placeholder="Ej: Cambiar pastillas delanteras">
                    </div>
                `,
                textoConfirmar: 'Añadir',
                onConfirmar: () => {
                    const desc = document.getElementById('modal-tarea-desc')?.value?.trim();
                    if (!desc) { Toast().error('La descripción es obligatoria'); return; }
                    const trabajo = TrabajoService().obtener(trabajoId);
                    if (!trabajo.tareasPendientes) trabajo.tareasPendientes = [];
                    trabajo.tareasPendientes.push({ descripcion: desc, completada: false });
                    TrabajoService().guardar(trabajo);
                    Modal().cerrar();
                    Toast().exito('Tarea añadida');
                    renderDetalle();
                }
            });
            return;
        }
    }

    function manejarChange(e) {
        // Toggle tarea
        if (e.target.matches('[data-tarea-index]')) {
            const index = parseInt(e.target.dataset.tareaIndex);
            const trabajo = TrabajoService().obtener(trabajoId);
            if (trabajo?.tareasPendientes?.[index] !== undefined) {
                trabajo.tareasPendientes[index].completada = e.target.checked;
                TrabajoService().guardar(trabajo);
            }
            return;
        }

        // Cambiar estado recambio
        if (e.target.matches('.recambio-estado-select')) {
            const index = parseInt(e.target.dataset.recambioIndex);
            const trabajo = TrabajoService().obtener(trabajoId);
            if (trabajo?.recambiosPendientes?.[index] !== undefined) {
                trabajo.recambiosPendientes[index].estado = e.target.value;
                if (e.target.value === 'pedido') {
                    trabajo.recambiosPendientes[index].fechaPedido = Utils().hoy();
                }
                TrabajoService().guardar(trabajo);
                Toast().info('Estado de recambio actualizado');
            }
            return;
        }
    }

    function recalcularPresupuesto(trabajo) {
        if (!trabajo.presupuesto) return;
        let manoObra = 0, recambios = 0;
        trabajo.presupuesto.detalleLineas.forEach(l => {
            const subtotal = (l.cantidad || 1) * (l.precio || 0);
            if (l.tipo === 'mano_obra') manoObra += subtotal;
            else recambios += subtotal;
        });
        trabajo.presupuesto.manoObra = manoObra;
        trabajo.presupuesto.recambios = recambios;
        trabajo.presupuesto.total = manoObra + recambios;
    }

    function destroy() {
        if (contenedorRef) {
            contenedorRef.removeEventListener('click', manejarClick);
            contenedorRef.removeEventListener('change', manejarChange);
        }
        contenedorRef = null;
        trabajoId = null;
    }

    window.TallerPro.Views.TrabajoDetalle = { render, destroy };
})();
