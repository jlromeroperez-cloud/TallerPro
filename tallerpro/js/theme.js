/* =============================================
   TallerPro - Sistema de Temas
   ============================================= */

window.TallerPro = window.TallerPro || {};

(function() {
    const Store = () => window.TallerPro.Store;

    function aplicarTema(tema) {
        document.documentElement.className = `tema-${tema}`;
        const metaColor = document.querySelector('meta[name="theme-color"]');
        if (metaColor) {
            metaColor.setAttribute('content', tema === 'oscuro' ? '#1a1a2e' : '#ffffff');
        }
    }

    function toggleTema() {
        const config = Store().getConfig();
        const actual = config.tema || 'oscuro';
        const nuevo = actual === 'oscuro' ? 'claro' : 'oscuro';
        Store().setConfig({ tema: nuevo });
        aplicarTema(nuevo);
    }

    function init() {
        const config = Store().getConfig();
        aplicarTema(config.tema || 'oscuro');

        const btnTema = document.getElementById('btn-tema');
        if (btnTema) {
            btnTema.addEventListener('click', toggleTema);
        }
    }

    window.TallerPro.Theme = { init, aplicarTema, toggleTema };
})();
