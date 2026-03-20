/* =============================================
   TallerPro - Vista Pipeline (Kanban)
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

    const ESTADOS = [
        { key: 'peticion', label: 'Peticiones', color: 'var(--color-info)' },
        { key: 'presupuesto_enviado', label: 'Ptos. Enviados', color: 'var(--color-advertencia)' },
        { key: 'presupuesto_autorizado', label: 'Ptos. Autorizados', color: 'var(--color-exito)' },
        { key: 'recambios', label: 'Recambios', color: 'var(--color-error)' },
        { key: 'cita_previa', label: 'Cita Previa', color: 'var(--color-primario)' },
        { key: 'en_taller', label: 'En Taller', color: '#9C27B0' },
        { key: 'finalizado', label: 'Finalizados', color: 'var(--color-exito)' }
    ];

    const TRANSICIONES = {
        peticion: ['presupuesto_enviado'],
        presupuesto_enviado: ['presupuesto_autorizado', 'peticion'],
        presupuesto_autorizado: ['recambios', 'cita_previa'],
        recambios: ['cita_previa'],
        cita_previa: ['en_taller'],
        en_taller: ['finalizado'],
        finalizado: ['peticion']
    };

    const SUB_ESTADOS_RECAMBIOS = {
        por_pedir: { label: 'Por pedir', clase: 'badge-error' },
        pedido: { label: 'Pedido', clase: 'badge-advertencia' },
        recibido: { label: 'Recibido', clase: 'badge-exito' }
    };

    let contenedorRef = null;
    let draggedId = null;

    function render(contenedor) {
        contenedorRef = contenedor;
        renderTablero();
        contenedor.addEventListener('click', manejarClick);
        initDragDrop();
    }

    function renderTablero() {
        const trabajos = TrabajoService().listar();

        contenedorRef.innerHTML = `
            <div class="vista-header">
                <h1>Flujo de Trabajo</h1>
                <div class="vista-header-acciones">
                    <button class="btn btn-primario" id="btn-nuevo-trabajo">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Nuevo Trabajo
                    </button>
                </div>
            </div>

            <div class="kanban-tablero">
                ${ESTADOS.map(estado => {
                    const tarjetas = trabajos.filter(t => t.estado === estado.key);
                    return `
                        <div class="kanban-columna" data-estado="${estado.key}">
                            <div class="kanban-columna-header">
                                <div class="kanban-columna-titulo">
                                    <span class="kanban-columna-dot" style="background: ${estado.color}"></span>
                                    <span>${estado.label}</span>
                                    <span class="contador">${tarjetas.length}</span>
                                </div>
                            </div>
                            <div class="kanban-columna-body" data-estado="${estado.key}">
                                ${tarjetas.map(t => renderTarjeta(t)).join('')}
                            </div>
                        </div>`;
                }).join('')}
            </div>

            <!-- Vista tabs mobile -->
            <div class="kanban-mobile">
                <div class="tabs kanban-tabs">
                    ${ESTADOS.map((e, i) => `
                        <button class="tab ${i === 0 ? 'activo' : ''}" data-tab-estado="${e.key}">${e.label}</button>
                    `).join('')}
                </div>
                <div class="kanban-mobile-contenido" id="kanban-mobile-contenido">
                    ${renderMobileColumna(ESTADOS[0].key, trabajos)}
                </div>
            </div>
        `;
    }

    function renderTarjeta(trabajo) {
        const empresa = Store().getById('empresas', trabajo.empresaId);
        const vehiculo = Store().getById('vehiculos', trabajo.vehiculoId);
        const prioridadClase = {
            baja: 'prioridad-baja',
            normal: 'prioridad-normal',
            alta: 'prioridad-alta',
            urgente: 'prioridad-urgente'
        }[trabajo.prioridad || 'normal'];

        return `
            <div class="kanban-tarjeta ${prioridadClase}" draggable="true" data-trabajo-id="${trabajo.id}">
                <div class="kanban-tarjeta-header">
                    <span class="kanban-tarjeta-matricula">${Utils().sanitizeHTML(vehiculo?.matricula || 'Sin matrícula')}</span>
                    ${trabajo.prioridad === 'urgente' ? '<span class="badge badge-error">Urgente</span>' : ''}
                    ${trabajo.prioridad === 'alta' ? '<span class="badge badge-advertencia">Alta</span>' : ''}
                </div>
                <div class="kanban-tarjeta-empresa">${Utils().sanitizeHTML(empresa?.nombre || 'Sin empresa')}</div>
                ${trabajo.descripcion ? `<div class="kanban-tarjeta-desc">${Utils().sanitizeHTML(trabajo.descripcion.substring(0, 60))}${trabajo.descripcion.length > 60 ? '...' : ''}</div>` : ''}
                <div class="kanban-tarjeta-footer">
                    ${trabajo.estado === 'recambios' && trabajo.subEstadoRecambios ?
                        `<span class="badge ${SUB_ESTADOS_RECAMBIOS[trabajo.subEstadoRecambios]?.clase || 'badge-neutral'}">${SUB_ESTADOS_RECAMBIOS[trabajo.subEstadoRecambios]?.label || ''}</span>` : ''}
                    ${trabajo.estado === 'en_taller' && trabajo.tareasPendientes?.length > 0 ?
                        `<span class="badge badge-neutral">${trabajo.tareasPendientes.filter(x => x.completada).length}/${trabajo.tareasPendientes.length}</span>` : ''}
                    ${trabajo.presupuesto?.total ? `<span class="text-xs text-secundario">${Utils().formatearMoneda(trabajo.presupuesto.total)}</span>` : ''}
                </div>
                ${esMobile() ? renderBotonesMover(trabajo) : ''}
            </div>
        `;
    }

    function renderBotonesMover(trabajo) {
        const permitidos = TRANSICIONES[trabajo.estado] || [];
        if (permitidos.length === 0) return '';
        return `
            <div class="kanban-tarjeta-acciones">
                ${permitidos.map(estado => {
                    const label = ESTADOS.find(e => e.key === estado)?.label || estado;
                    return `<button class="btn btn-sm btn-secundario btn-mover" data-trabajo-id="${trabajo.id}" data-nuevo-estado="${estado}">→ ${label}</button>`;
                }).join('')}
            </div>`;
    }

    function renderMobileColumna(estadoKey, trabajos) {
        const tarjetas = (trabajos || TrabajoService().listar()).filter(t => t.estado === estadoKey);
        if (tarjetas.length === 0) {
            return '<div class="estado-vacio"><p>No hay trabajos en este estado</p></div>';
        }
        return tarjetas.map(t => renderTarjeta(t)).join('');
    }

    function esMobile() {
        return 'ontouchstart' in window || window.innerWidth < 768;
    }

    function initDragDrop() {
        contenedorRef.addEventListener('dragstart', (e) => {
            const tarjeta = e.target.closest('.kanban-tarjeta');
            if (!tarjeta) return;
            draggedId = tarjeta.dataset.trabajoId;
            tarjeta.classList.add('arrastrando');
            e.dataTransfer.effectAllowed = 'move';
        });

        contenedorRef.addEventListener('dragend', (e) => {
            const tarjeta = e.target.closest('.kanban-tarjeta');
            if (tarjeta) tarjeta.classList.remove('arrastrando');
            document.querySelectorAll('.kanban-columna-body').forEach(c => c.classList.remove('drag-over', 'drag-invalid'));
            draggedId = null;
        });

        contenedorRef.addEventListener('dragover', (e) => {
            const columna = e.target.closest('.kanban-columna-body');
            if (!columna || !draggedId) return;
            e.preventDefault();

            const trabajo = TrabajoService().obtener(draggedId);
            const nuevoEstado = columna.dataset.estado;
            const permitidos = TRANSICIONES[trabajo?.estado] || [];

            columna.classList.toggle('drag-over', permitidos.includes(nuevoEstado));
            columna.classList.toggle('drag-invalid', !permitidos.includes(nuevoEstado));
        });

        contenedorRef.addEventListener('dragleave', (e) => {
            const columna = e.target.closest('.kanban-columna-body');
            if (columna && !columna.contains(e.relatedTarget)) {
                columna.classList.remove('drag-over', 'drag-invalid');
            }
        });

        contenedorRef.addEventListener('drop', (e) => {
            e.preventDefault();
            const columna = e.target.closest('.kanban-columna-body');
            if (!columna || !draggedId) return;

            columna.classList.remove('drag-over', 'drag-invalid');

            const trabajo = TrabajoService().obtener(draggedId);
            const nuevoEstado = columna.dataset.estado;
            const permitidos = TRANSICIONES[trabajo?.estado] || [];

            if (!permitidos.includes(nuevoEstado)) {
                Toast().error('Transición no permitida');
                return;
            }

            moverTrabajo(trabajo, nuevoEstado);
        });
    }

    function moverTrabajo(trabajo, nuevoEstado) {
        const estadoAnterior = trabajo.estado;

        // Configurar sub-estado de recambios
        if (nuevoEstado === 'recambios') {
            trabajo.subEstadoRecambios = 'por_pedir';
        } else {
            trabajo.subEstadoRecambios = null;
        }

        // Auto-set fechas
        if (nuevoEstado === 'en_taller') {
            trabajo.fechaEntrada = Utils().ahora();
        }
        if (nuevoEstado === 'finalizado') {
            trabajo.fechaSalida = Utils().ahora();
        }

        // Historial
        if (!trabajo.historial) trabajo.historial = [];
        trabajo.historial.push({
            fecha: Utils().ahora(),
            estadoAnterior,
            estadoNuevo: nuevoEstado
        });

        trabajo.estado = nuevoEstado;
        TrabajoService().guardar(trabajo);
        Toast().exito(`Movido a ${ESTADOS.find(e => e.key === nuevoEstado)?.label || nuevoEstado}`);
        renderTablero();
        initDragDrop();
    }

    function manejarClick(e) {
        // Nuevo trabajo
        if (e.target.closest('#btn-nuevo-trabajo')) {
            abrirFormularioTrabajo();
            return;
        }

        // Botón mover (mobile)
        const btnMover = e.target.closest('.btn-mover');
        if (btnMover) {
            e.stopPropagation();
            const trabajo = TrabajoService().obtener(btnMover.dataset.trabajoId);
            if (trabajo) moverTrabajo(trabajo, btnMover.dataset.nuevoEstado);
            return;
        }

        // Click tarjeta -> detalle
        const tarjeta = e.target.closest('.kanban-tarjeta');
        if (tarjeta && !e.target.closest('.btn-mover')) {
            window.TallerPro.Router.navegar('#/trabajo/' + tarjeta.dataset.trabajoId);
            return;
        }

        // Tabs mobile
        const tabEstado = e.target.closest('[data-tab-estado]');
        if (tabEstado) {
            contenedorRef.querySelectorAll('.kanban-tabs .tab').forEach(t => t.classList.remove('activo'));
            tabEstado.classList.add('activo');
            document.getElementById('kanban-mobile-contenido').innerHTML = renderMobileColumna(tabEstado.dataset.tabEstado);
            return;
        }
    }

    function abrirFormularioTrabajo(trabajo = null) {
        const empresas = EmpresaService().listar();
        const esEdicion = !!trabajo;

        Modal().abrir({
            titulo: esEdicion ? 'Editar Trabajo' : 'Nuevo Trabajo',
            contenido: `
                <div class="form-grupo">
                    <label class="form-label">Empresa *</label>
                    <select class="form-select" id="modal-trabajo-empresa">
                        <option value="">Seleccionar empresa...</option>
                        ${empresas.map(e => `<option value="${e.id}" ${trabajo?.empresaId === e.id ? 'selected' : ''}>${Utils().sanitizeHTML(e.nombre)}</option>`).join('')}
                    </select>
                </div>
                <div class="form-grupo">
                    <label class="form-label">Vehículo</label>
                    <select class="form-select" id="modal-trabajo-vehiculo">
                        <option value="">Seleccionar vehículo...</option>
                    </select>
                </div>
                <div class="form-grupo">
                    <label class="form-label">Descripción *</label>
                    <textarea class="form-textarea" id="modal-trabajo-desc" placeholder="Descripción del trabajo...">${Utils().sanitizeHTML(trabajo?.descripcion || '')}</textarea>
                </div>
                <div class="form-fila">
                    <div class="form-grupo">
                        <label class="form-label">Prioridad</label>
                        <select class="form-select" id="modal-trabajo-prioridad">
                            <option value="baja" ${trabajo?.prioridad === 'baja' ? 'selected' : ''}>Baja</option>
                            <option value="normal" ${(!trabajo?.prioridad || trabajo?.prioridad === 'normal') ? 'selected' : ''}>Normal</option>
                            <option value="alta" ${trabajo?.prioridad === 'alta' ? 'selected' : ''}>Alta</option>
                            <option value="urgente" ${trabajo?.prioridad === 'urgente' ? 'selected' : ''}>Urgente</option>
                        </select>
                    </div>
                </div>
                <div class="form-grupo">
                    <label class="form-label">Notas</label>
                    <textarea class="form-textarea" id="modal-trabajo-notas" placeholder="Notas adicionales...">${Utils().sanitizeHTML(trabajo?.notas || '')}</textarea>
                </div>
            `,
            textoConfirmar: esEdicion ? 'Guardar' : 'Crear Trabajo',
            onConfirmar: () => {
                const empresaId = document.getElementById('modal-trabajo-empresa')?.value;
                const descripcion = document.getElementById('modal-trabajo-desc')?.value?.trim();
                if (!empresaId) { Toast().error('Selecciona una empresa'); return; }
                if (!descripcion) { Toast().error('La descripción es obligatoria'); return; }

                const datos = {
                    ...(trabajo || {}),
                    empresaId,
                    vehiculoId: document.getElementById('modal-trabajo-vehiculo')?.value || '',
                    descripcion,
                    estado: trabajo?.estado || 'peticion',
                    prioridad: document.getElementById('modal-trabajo-prioridad')?.value || 'normal',
                    notas: document.getElementById('modal-trabajo-notas')?.value?.trim() || '',
                    presupuesto: trabajo?.presupuesto || { manoObra: 0, recambios: 0, total: 0, detalleLineas: [] },
                    recambiosPendientes: trabajo?.recambiosPendientes || [],
                    tareasPendientes: trabajo?.tareasPendientes || [],
                    historial: trabajo?.historial || [{ fecha: Utils().ahora(), estadoAnterior: null, estadoNuevo: 'peticion' }]
                };

                TrabajoService().guardar(datos);
                Modal().cerrar();
                Toast().exito(esEdicion ? 'Trabajo actualizado' : 'Trabajo creado');
                renderTablero();
                initDragDrop();
            }
        });

        // Cargar vehículos al seleccionar empresa
        setTimeout(() => {
            const selectEmpresa = document.getElementById('modal-trabajo-empresa');
            const selectVehiculo = document.getElementById('modal-trabajo-vehiculo');
            if (selectEmpresa && selectVehiculo) {
                function cargarVehiculos() {
                    const eid = selectEmpresa.value;
                    const vehiculos = eid ? window.TallerPro.VehiculoService.listarPorEmpresa(eid) : [];
                    selectVehiculo.innerHTML = '<option value="">Seleccionar vehículo...</option>' +
                        vehiculos.map(v => `<option value="${v.id}" ${trabajo?.vehiculoId === v.id ? 'selected' : ''}>${Utils().sanitizeHTML(v.matricula)} - ${Utils().sanitizeHTML(v.marca || '')} ${Utils().sanitizeHTML(v.modelo || '')}</option>`).join('');
                }
                selectEmpresa.addEventListener('change', cargarVehiculos);
                if (selectEmpresa.value) cargarVehiculos();
            }
        }, 100);
    }

    function destroy() {
        if (contenedorRef) {
            contenedorRef.removeEventListener('click', manejarClick);
        }
        contenedorRef = null;
        draggedId = null;
    }

    window.TallerPro.Views.Pipeline = { render, destroy, abrirFormularioTrabajo };
})();
