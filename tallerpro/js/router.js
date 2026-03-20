/* =============================================
   TallerPro - Router Hash-Based
   ============================================= */

window.TallerPro = window.TallerPro || {};

(function() {
    let rutas = [];
    let vistaActual = null;
    let contenedor = null;

    function registrar(patron, vista) {
        rutas.push({ patron, vista });
    }

    function parsearRuta(hash) {
        const path = hash.replace('#', '') || '/';
        for (const ruta of rutas) {
            const params = matchRuta(ruta.patron, path);
            if (params !== null) {
                return { vista: ruta.vista, params };
            }
        }
        return null;
    }

    function matchRuta(patron, path) {
        const partes_patron = patron.split('/').filter(Boolean);
        const partes_path = path.split('/').filter(Boolean);

        if (partes_patron.length !== partes_path.length) return null;

        const params = {};
        for (let i = 0; i < partes_patron.length; i++) {
            if (partes_patron[i].startsWith(':')) {
                params[partes_patron[i].substring(1)] = decodeURIComponent(partes_path[i]);
            } else if (partes_patron[i] !== partes_path[i]) {
                return null;
            }
        }
        return params;
    }

    function navegar(hash) {
        window.location.hash = hash;
    }

    function actualizarLinks() {
        const hash = window.location.hash.replace('#', '') || '/';

        document.querySelectorAll('.sidebar-link, .bottom-tab').forEach(link => {
            const ruta = link.dataset.ruta;
            if (!ruta) return;
            const esActivo = hash === ruta || (ruta !== '/' && hash.startsWith(ruta));
            link.classList.toggle('activo', esActivo);
        });
    }

    function manejarCambio() {
        const hash = window.location.hash || '#/';
        const resultado = parsearRuta(hash);

        if (!resultado) {
            navegar('#/');
            return;
        }

        // Destruir vista actual
        if (vistaActual && typeof vistaActual.destroy === 'function') {
            vistaActual.destroy();
        }

        // Renderizar nueva vista
        vistaActual = resultado.vista;
        if (contenedor && typeof vistaActual.render === 'function') {
            vistaActual.render(contenedor, resultado.params);
        }

        actualizarLinks();

        // Cerrar sidebar mobile
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.remove('abierto');
        if (overlay) overlay.classList.remove('activo');
    }

    function init() {
        contenedor = document.getElementById('app-content');

        window.addEventListener('hashchange', manejarCambio);

        // Sidebar mobile toggle
        const toggleBtn = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (toggleBtn && sidebar && overlay) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('abierto');
                overlay.classList.toggle('activo');
            });
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('abierto');
                overlay.classList.remove('activo');
            });
        }

        // Navegar a ruta inicial
        if (!window.location.hash) {
            window.location.hash = '#/';
        } else {
            manejarCambio();
        }
    }

    window.TallerPro.Router = { init, registrar, navegar };
})();
