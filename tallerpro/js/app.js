/* =============================================
   TallerPro - Application Bootstrap
   ============================================= */

(function() {
    const Router = window.TallerPro.Router;
    const Theme = window.TallerPro.Theme;
    const Views = window.TallerPro.Views;
    const Store = window.TallerPro.Store;
    const Utils = window.TallerPro.Utils;

    // Registrar rutas
    Router.registrar('/', Views.Dashboard);
    Router.registrar('/empresas', Views.Empresas);
    Router.registrar('/empresas/:id', Views.EmpresaDetalle);
    Router.registrar('/agenda', Views.Agenda);
    Router.registrar('/pipeline', Views.Pipeline);
    Router.registrar('/trabajo/:id', Views.TrabajoDetalle);

    // Búsqueda global
    function initBusquedaGlobal() {
        const input = document.getElementById('busqueda-global');
        const resultados = document.getElementById('busqueda-resultados');
        if (!input || !resultados) return;

        const buscar = Utils.debounce((query) => {
            if (!query || query.length < 2) {
                resultados.classList.add('oculto');
                return;
            }

            const q = query.toLowerCase();
            const items = [];

            // Buscar empresas
            Store.getAll('empresas').forEach(e => {
                if (e.nombre?.toLowerCase().includes(q) || e.cif?.toLowerCase().includes(q)) {
                    items.push({ tipo: 'Empresa', texto: e.nombre, url: `#/empresas/${e.id}` });
                }
            });

            // Buscar vehículos
            Store.getAll('vehiculos').forEach(v => {
                if (v.matricula?.toLowerCase().includes(q) || v.marca?.toLowerCase().includes(q)) {
                    const empresa = Store.getById('empresas', v.empresaId);
                    items.push({ tipo: 'Vehículo', texto: `${v.matricula} - ${v.marca || ''} ${v.modelo || ''}`, url: empresa ? `#/empresas/${empresa.id}` : '#/empresas' });
                }
            });

            // Buscar trabajos
            Store.getAll('trabajos').forEach(t => {
                if (t.descripcion?.toLowerCase().includes(q)) {
                    items.push({ tipo: 'Trabajo', texto: t.descripcion.substring(0, 50), url: `#/trabajo/${t.id}` });
                }
            });

            if (items.length === 0) {
                resultados.innerHTML = '<div class="resultado-item"><span class="text-sm text-terciario">Sin resultados</span></div>';
            } else {
                resultados.innerHTML = items.slice(0, 8).map(item =>
                    `<a href="${item.url}" class="resultado-item">
                        <span class="resultado-tipo">${item.tipo}</span>
                        <span class="resultado-texto">${Utils.sanitizeHTML(item.texto)}</span>
                    </a>`
                ).join('');
            }
            resultados.classList.remove('oculto');
        }, 250);

        input.addEventListener('input', (e) => buscar(e.target.value.trim()));
        input.addEventListener('focus', (e) => {
            if (e.target.value.trim().length >= 2) buscar(e.target.value.trim());
        });

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.busqueda-global')) {
                resultados.classList.add('oculto');
            }
        });

        // Cerrar al navegar
        resultados.addEventListener('click', () => {
            resultados.classList.add('oculto');
            input.value = '';
        });
    }

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
        Theme.init();
        Router.init();
        initBusquedaGlobal();
    });
})();
