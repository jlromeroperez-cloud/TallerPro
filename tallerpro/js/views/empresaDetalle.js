/* =============================================
   TallerPro - Vista Detalle de Empresa
   ============================================= */

window.TallerPro = window.TallerPro || {};
window.TallerPro.Views = window.TallerPro.Views || {};

(function() {
    const Utils = () => window.TallerPro.Utils;
    const Store = () => window.TallerPro.Store;
    const EmpresaService = () => window.TallerPro.EmpresaService;
    const VehiculoService = () => window.TallerPro.VehiculoService;
    const TrabajoService = () => window.TallerPro.TrabajoService;
    const Modal = () => window.TallerPro.Modal;
    const Toast = () => window.TallerPro.Toast;

    let contenedorRef = null;
    let empresaId = null;

    function render(contenedor, params) {
        contenedorRef = contenedor;
        empresaId = params.id;
        renderDetalle();
        contenedor.addEventListener('click', manejarClick);
    }

    function renderDetalle() {
        const empresa = EmpresaService().obtener(empresaId);
        if (!empresa) {
            contenedorRef.innerHTML = `
                <div class="estado-vacio">
                    <p>Empresa no encontrada</p>
                    <a href="#/empresas" class="btn btn-primario">Volver a empresas</a>
                </div>`;
            return;
        }

        const vehiculos = VehiculoService().listarPorEmpresa(empresaId);
        const trabajos = Store().query('trabajos', t => t.empresaId === empresaId);

        contenedorRef.innerHTML = `
            <a href="#/empresas" class="vista-volver">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Volver a empresas
            </a>

            <div class="vista-header">
                <h1>${Utils().sanitizeHTML(empresa.nombre)}</h1>
                <div class="vista-header-acciones">
                    <button class="btn btn-secundario" id="btn-editar-empresa">Editar</button>
                    <button class="btn btn-peligro btn-sm" id="btn-eliminar-empresa">Eliminar</button>
                </div>
            </div>

            <div class="detalle-grid">
                <!-- Info general -->
                <div class="card">
                    <div class="card-header"><h3>Información</h3></div>
                    <div class="card-body">
                        <div class="detalle-campo">
                            <span class="detalle-label">CIF/NIF</span>
                            <span class="detalle-valor">${Utils().sanitizeHTML(empresa.cif || '-')}</span>
                        </div>
                        <div class="detalle-campo">
                            <span class="detalle-label">Dirección</span>
                            <span class="detalle-valor">${Utils().sanitizeHTML(empresa.direccion || '-')}</span>
                        </div>
                        ${empresa.notasOperacion ? `
                        <div class="detalle-campo">
                            <span class="detalle-label">Notas de operación</span>
                            <span class="detalle-valor">${Utils().sanitizeHTML(empresa.notasOperacion)}</span>
                        </div>` : ''}
                    </div>
                </div>

                <!-- Contactos -->
                <div class="card">
                    <div class="card-header">
                        <h3>Contactos</h3>
                        <button class="btn btn-sm btn-secundario" id="btn-nuevo-contacto">+ Añadir</button>
                    </div>
                    <div class="card-body">
                        ${(!empresa.contactos || empresa.contactos.length === 0) ?
                            '<p class="text-sm text-terciario">Sin contactos registrados</p>' :
                            empresa.contactos.map(c => `
                                <div class="contacto-item">
                                    <div class="contacto-info">
                                        <span class="font-medium">${Utils().sanitizeHTML(c.nombre || 'Sin nombre')}</span>
                                        <span class="text-sm text-secundario">${Utils().sanitizeHTML(c.cargo || '')}</span>
                                    </div>
                                    <div class="contacto-datos">
                                        ${c.telefono ? `<span class="text-sm">${Utils().sanitizeHTML(c.telefono)}</span>` : ''}
                                        ${c.email ? `<span class="text-sm text-secundario">${Utils().sanitizeHTML(c.email)}</span>` : ''}
                                    </div>
                                    <button class="btn-icono btn-eliminar-contacto" data-contacto-id="${c.id}" aria-label="Eliminar contacto">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>

                <!-- Vehículos -->
                <div class="card">
                    <div class="card-header">
                        <h3>Vehículos</h3>
                        <button class="btn btn-sm btn-secundario" id="btn-nuevo-vehiculo">+ Añadir</button>
                    </div>
                    <div class="card-body">
                        ${vehiculos.length === 0 ?
                            '<p class="text-sm text-terciario">Sin vehículos registrados</p>' :
                            vehiculos.map(v => `
                                <div class="vehiculo-item" data-vehiculo-id="${v.id}">
                                    <div class="vehiculo-info">
                                        <span class="font-medium">${Utils().sanitizeHTML(v.matricula)}</span>
                                        <span class="text-sm text-secundario">${Utils().sanitizeHTML(v.marca || '')} ${Utils().sanitizeHTML(v.modelo || '')} ${v.anio || ''}</span>
                                    </div>
                                    ${v.kilometraje ? `<span class="badge badge-neutral">${v.kilometraje.toLocaleString()} km</span>` : ''}
                                </div>
                            `).join('')
                        }
                    </div>
                </div>

                <!-- Trabajos activos -->
                <div class="card">
                    <div class="card-header">
                        <h3>Trabajos Activos</h3>
                    </div>
                    <div class="card-body">
                        ${trabajos.length === 0 ?
                            '<p class="text-sm text-terciario">Sin trabajos activos</p>' :
                            trabajos.filter(t => t.estado !== 'finalizado').map(t => {
                                const vehiculo = Store().getById('vehiculos', t.vehiculoId);
                                const ESTADOS_LABEL = {
                                    peticion: 'Petición', presupuesto_enviado: 'Pto. Enviado',
                                    presupuesto_autorizado: 'Pto. Autorizado', recambios: 'Recambios',
                                    cita_previa: 'Cita Previa', en_taller: 'En Taller', finalizado: 'Finalizado'
                                };
                                return `
                                    <a href="#/trabajo/${t.id}" class="dashboard-item">
                                        <div class="dashboard-item-info">
                                            <span class="font-medium">${Utils().sanitizeHTML(vehiculo?.matricula || 'Sin vehículo')}</span>
                                            <span class="text-sm text-secundario">${Utils().sanitizeHTML(t.descripcion || '')}</span>
                                        </div>
                                        <span class="badge badge-primario">${ESTADOS_LABEL[t.estado] || t.estado}</span>
                                    </a>`;
                            }).join('')
                        }
                    </div>
                </div>
            </div>
        `;
    }

    function manejarClick(e) {
        if (e.target.closest('#btn-editar-empresa')) {
            const empresa = EmpresaService().obtener(empresaId);
            if (empresa) {
                window.TallerPro.Views.Empresas.abrirFormularioEmpresa(empresa);
                // Re-render on modal close
                const observer = new MutationObserver(() => {
                    const overlay = document.getElementById('modal-overlay');
                    if (overlay?.classList.contains('oculto')) {
                        observer.disconnect();
                        renderDetalle();
                    }
                });
                observer.observe(document.getElementById('modal-overlay'), { attributes: true });
            }
            return;
        }

        if (e.target.closest('#btn-eliminar-empresa')) {
            Modal().confirmar({
                titulo: 'Eliminar Empresa',
                mensaje: '¿Estás seguro de que quieres eliminar esta empresa? Esta acción no se puede deshacer.',
                textoConfirmar: 'Eliminar',
                onConfirmar: () => {
                    EmpresaService().eliminar(empresaId);
                    Toast().exito('Empresa eliminada');
                    window.TallerPro.Router.navegar('#/empresas');
                }
            });
            return;
        }

        if (e.target.closest('#btn-nuevo-contacto')) {
            abrirFormularioContacto();
            return;
        }

        if (e.target.closest('.btn-eliminar-contacto')) {
            const contactoId = e.target.closest('.btn-eliminar-contacto').dataset.contactoId;
            const empresa = EmpresaService().obtener(empresaId);
            if (empresa) {
                empresa.contactos = empresa.contactos.filter(c => c.id !== contactoId);
                EmpresaService().guardar(empresa);
                Toast().info('Contacto eliminado');
                renderDetalle();
            }
            return;
        }

        if (e.target.closest('#btn-nuevo-vehiculo')) {
            abrirFormularioVehiculo();
            return;
        }
    }

    function abrirFormularioContacto() {
        Modal().abrir({
            titulo: 'Nuevo Contacto',
            contenido: `
                <div class="form-grupo">
                    <label class="form-label">Nombre *</label>
                    <input type="text" class="form-input" id="modal-contacto-nombre" placeholder="Nombre completo">
                </div>
                <div class="form-fila">
                    <div class="form-grupo">
                        <label class="form-label">Teléfono</label>
                        <input type="tel" class="form-input" id="modal-contacto-tel" placeholder="612 345 678">
                    </div>
                    <div class="form-grupo">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" id="modal-contacto-email" placeholder="email@ejemplo.com">
                    </div>
                </div>
                <div class="form-grupo">
                    <label class="form-label">Cargo</label>
                    <input type="text" class="form-input" id="modal-contacto-cargo" placeholder="Ej: Jefe de flota">
                </div>
            `,
            textoConfirmar: 'Añadir Contacto',
            onConfirmar: () => {
                const nombre = document.getElementById('modal-contacto-nombre')?.value?.trim();
                if (!nombre) {
                    Toast().error('El nombre es obligatorio');
                    return;
                }
                const empresa = EmpresaService().obtener(empresaId);
                if (!empresa.contactos) empresa.contactos = [];
                empresa.contactos.push({
                    id: Utils().generarId('con'),
                    nombre,
                    telefono: document.getElementById('modal-contacto-tel')?.value?.trim() || '',
                    email: document.getElementById('modal-contacto-email')?.value?.trim() || '',
                    cargo: document.getElementById('modal-contacto-cargo')?.value?.trim() || ''
                });
                EmpresaService().guardar(empresa);
                Modal().cerrar();
                Toast().exito('Contacto añadido');
                renderDetalle();
            }
        });
    }

    function abrirFormularioVehiculo() {
        Modal().abrir({
            titulo: 'Nuevo Vehículo',
            contenido: `
                <div class="form-fila">
                    <div class="form-grupo">
                        <label class="form-label">Matrícula *</label>
                        <input type="text" class="form-input" id="modal-matricula" placeholder="1234 ABC">
                    </div>
                    <div class="form-grupo">
                        <label class="form-label">Año</label>
                        <input type="number" class="form-input" id="modal-anio" placeholder="2022" min="1990" max="2030">
                    </div>
                </div>
                <div class="form-fila">
                    <div class="form-grupo">
                        <label class="form-label">Marca</label>
                        <input type="text" class="form-input" id="modal-marca" placeholder="Ej: Renault">
                    </div>
                    <div class="form-grupo">
                        <label class="form-label">Modelo</label>
                        <input type="text" class="form-input" id="modal-modelo" placeholder="Ej: Kangoo">
                    </div>
                </div>
                <div class="form-fila">
                    <div class="form-grupo">
                        <label class="form-label">VIN</label>
                        <input type="text" class="form-input" id="modal-vin" placeholder="Número de bastidor">
                    </div>
                    <div class="form-grupo">
                        <label class="form-label">Kilometraje</label>
                        <input type="number" class="form-input" id="modal-km" placeholder="85000">
                    </div>
                </div>
                <div class="form-grupo">
                    <label class="form-label">Notas</label>
                    <textarea class="form-textarea" id="modal-notas-v" placeholder="Observaciones del vehículo..."></textarea>
                </div>
            `,
            textoConfirmar: 'Añadir Vehículo',
            onConfirmar: () => {
                const matricula = document.getElementById('modal-matricula')?.value?.trim();
                if (!matricula) {
                    Toast().error('La matrícula es obligatoria');
                    return;
                }
                VehiculoService().guardar({
                    empresaId,
                    matricula,
                    marca: document.getElementById('modal-marca')?.value?.trim() || '',
                    modelo: document.getElementById('modal-modelo')?.value?.trim() || '',
                    anio: parseInt(document.getElementById('modal-anio')?.value) || null,
                    vin: document.getElementById('modal-vin')?.value?.trim() || '',
                    kilometraje: parseInt(document.getElementById('modal-km')?.value) || null,
                    notas: document.getElementById('modal-notas-v')?.value?.trim() || ''
                });
                Modal().cerrar();
                Toast().exito('Vehículo añadido');
                renderDetalle();
            }
        });
    }

    function destroy() {
        if (contenedorRef) {
            contenedorRef.removeEventListener('click', manejarClick);
        }
        contenedorRef = null;
        empresaId = null;
    }

    window.TallerPro.Views.EmpresaDetalle = { render, destroy };
})();
