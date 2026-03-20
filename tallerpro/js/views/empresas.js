/* =============================================
   TallerPro - Vista Lista de Empresas
   ============================================= */

window.TallerPro = window.TallerPro || {};
window.TallerPro.Views = window.TallerPro.Views || {};

(function() {
    const Utils = () => window.TallerPro.Utils;
    const EmpresaService = () => window.TallerPro.EmpresaService;
    const VehiculoService = () => window.TallerPro.VehiculoService;
    const Modal = () => window.TallerPro.Modal;
    const Toast = () => window.TallerPro.Toast;

    let contenedorRef = null;

    function render(contenedor) {
        contenedorRef = contenedor;
        renderLista();
        contenedor.addEventListener('click', manejarClick);
        contenedor.addEventListener('input', manejarInput);
    }

    function renderLista(filtro = '') {
        let empresas = EmpresaService().listar();
        if (filtro) {
            const f = filtro.toLowerCase();
            empresas = empresas.filter(e =>
                e.nombre?.toLowerCase().includes(f) ||
                e.cif?.toLowerCase().includes(f)
            );
        }

        contenedorRef.innerHTML = `
            <div class="vista-header">
                <h1>Empresas</h1>
                <div class="vista-header-acciones">
                    <button class="btn btn-primario" id="btn-nueva-empresa">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Nueva Empresa
                    </button>
                </div>
            </div>

            <div class="busqueda-local" style="margin-bottom: var(--espacio-lg);">
                <input type="text" class="form-input" id="filtro-empresas" placeholder="Buscar por nombre o CIF..." value="${Utils().sanitizeHTML(filtro)}">
            </div>

            ${empresas.length === 0 ?
                `<div class="estado-vacio">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <p>${filtro ? 'No se encontraron empresas' : 'No hay empresas registradas'}</p>
                    ${!filtro ? '<button class="btn btn-primario" id="btn-nueva-empresa">Crear primera empresa</button>' : ''}
                </div>` :
                `<div class="tabla-wrapper">
                    <table class="tabla">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>CIF</th>
                                <th>Contacto Principal</th>
                                <th>Vehículos</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${empresas.map(e => {
                                const contacto = e.contactos?.[0];
                                const numVehiculos = VehiculoService().listarPorEmpresa(e.id).length;
                                return `
                                    <tr class="tabla-fila-clickable" data-empresa-id="${e.id}">
                                        <td class="font-medium">${Utils().sanitizeHTML(e.nombre)}</td>
                                        <td class="text-secundario">${Utils().sanitizeHTML(e.cif || '-')}</td>
                                        <td class="text-secundario">${contacto ? Utils().sanitizeHTML(contacto.nombre) : '-'}</td>
                                        <td><span class="badge badge-neutral">${numVehiculos}</span></td>
                                        <td class="text-right">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                        </td>
                                    </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>`
            }
        `;
    }

    function manejarClick(e) {
        // Nueva empresa
        if (e.target.closest('#btn-nueva-empresa')) {
            abrirFormularioEmpresa();
            return;
        }

        // Click en fila de tabla
        const fila = e.target.closest('[data-empresa-id]');
        if (fila) {
            window.TallerPro.Router.navegar('#/empresas/' + fila.dataset.empresaId);
        }
    }

    function manejarInput(e) {
        if (e.target.id === 'filtro-empresas') {
            const debouncedRender = Utils().debounce((valor) => renderLista(valor), 300);
            debouncedRender(e.target.value);
        }
    }

    function abrirFormularioEmpresa(empresa = null) {
        const esEdicion = !!empresa;
        Modal().abrir({
            titulo: esEdicion ? 'Editar Empresa' : 'Nueva Empresa',
            contenido: `
                <div class="form-grupo">
                    <label class="form-label">Nombre de la empresa *</label>
                    <input type="text" class="form-input" id="modal-nombre" value="${Utils().sanitizeHTML(empresa?.nombre || '')}" placeholder="Ej: Transportes García S.L.">
                </div>
                <div class="form-fila">
                    <div class="form-grupo">
                        <label class="form-label">CIF/NIF</label>
                        <input type="text" class="form-input" id="modal-cif" value="${Utils().sanitizeHTML(empresa?.cif || '')}" placeholder="Ej: B12345678">
                    </div>
                    <div class="form-grupo">
                        <label class="form-label">Teléfono principal</label>
                        <input type="text" class="form-input" id="modal-telefono" value="${Utils().sanitizeHTML(empresa?.contactos?.[0]?.telefono || '')}" placeholder="Ej: 612 345 678">
                    </div>
                </div>
                <div class="form-grupo">
                    <label class="form-label">Dirección</label>
                    <input type="text" class="form-input" id="modal-direccion" value="${Utils().sanitizeHTML(empresa?.direccion || '')}" placeholder="Ej: Calle Mayor 15, Madrid">
                </div>
                <div class="form-grupo">
                    <label class="form-label">Contacto principal</label>
                    <div class="form-fila">
                        <input type="text" class="form-input" id="modal-contacto-nombre" value="${Utils().sanitizeHTML(empresa?.contactos?.[0]?.nombre || '')}" placeholder="Nombre">
                        <input type="email" class="form-input" id="modal-contacto-email" value="${Utils().sanitizeHTML(empresa?.contactos?.[0]?.email || '')}" placeholder="Email">
                    </div>
                </div>
                <div class="form-grupo">
                    <label class="form-label">Notas de operación</label>
                    <textarea class="form-textarea" id="modal-notas" placeholder="Ej: Horarios preferidos, descuentos, condiciones...">${Utils().sanitizeHTML(empresa?.notasOperacion || '')}</textarea>
                </div>
            `,
            textoConfirmar: esEdicion ? 'Guardar Cambios' : 'Crear Empresa',
            onConfirmar: () => {
                const nombre = document.getElementById('modal-nombre')?.value?.trim();
                if (!nombre) {
                    Toast().error('El nombre de la empresa es obligatorio');
                    return;
                }

                const contactoNombre = document.getElementById('modal-contacto-nombre')?.value?.trim();
                const contactoEmail = document.getElementById('modal-contacto-email')?.value?.trim();
                const contactoTelefono = document.getElementById('modal-telefono')?.value?.trim();

                const contactos = [];
                if (contactoNombre || contactoEmail || contactoTelefono) {
                    contactos.push({
                        id: empresa?.contactos?.[0]?.id || Utils().generarId('con'),
                        nombre: contactoNombre || '',
                        email: contactoEmail || '',
                        telefono: contactoTelefono || '',
                        cargo: empresa?.contactos?.[0]?.cargo || ''
                    });
                }

                const datos = {
                    ...(empresa || {}),
                    nombre,
                    cif: document.getElementById('modal-cif')?.value?.trim() || '',
                    direccion: document.getElementById('modal-direccion')?.value?.trim() || '',
                    contactos: contactos.length > 0 ? contactos : (empresa?.contactos || []),
                    notasOperacion: document.getElementById('modal-notas')?.value?.trim() || ''
                };

                EmpresaService().guardar(datos);
                Modal().cerrar();
                Toast().exito(esEdicion ? 'Empresa actualizada' : 'Empresa creada');
                renderLista();
            }
        });
    }

    function destroy() {
        if (contenedorRef) {
            contenedorRef.removeEventListener('click', manejarClick);
            contenedorRef.removeEventListener('input', manejarInput);
        }
        contenedorRef = null;
    }

    window.TallerPro.Views.Empresas = { render, destroy, abrirFormularioEmpresa };
})();
