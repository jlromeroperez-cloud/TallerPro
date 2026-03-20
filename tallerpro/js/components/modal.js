/* =============================================
   TallerPro - Componente Modal
   ============================================= */

window.TallerPro = window.TallerPro || {};

(function() {
    const Utils = () => window.TallerPro.Utils;
    let onConfirmarActual = null;

    function abrir({ titulo, contenido, onConfirmar, onCancelar, textoConfirmar = 'Guardar', textoCancelar = 'Cancelar', anchura = '560px' }) {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('modal-contenido');
        if (!overlay || !modal) return;

        onConfirmarActual = onConfirmar;

        modal.style.maxWidth = anchura;
        modal.innerHTML = `
            <div class="modal-header">
                <h2>${Utils().sanitizeHTML(titulo)}</h2>
                <button class="btn-icono modal-cerrar" aria-label="Cerrar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="modal-body">${contenido}</div>
            <div class="modal-footer">
                <button class="btn btn-secundario modal-cancelar">${textoCancelar}</button>
                ${onConfirmar ? `<button class="btn btn-primario modal-confirmar">${textoConfirmar}</button>` : ''}
            </div>
        `;

        overlay.classList.remove('oculto');

        // Event listeners
        modal.querySelector('.modal-cerrar')?.addEventListener('click', cerrar);
        modal.querySelector('.modal-cancelar')?.addEventListener('click', () => {
            if (onCancelar) onCancelar();
            cerrar();
        });
        modal.querySelector('.modal-confirmar')?.addEventListener('click', () => {
            if (onConfirmarActual) onConfirmarActual();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cerrar();
        });

        document.addEventListener('keydown', manejarEscape);

        // Focus primer input
        setTimeout(() => {
            const primerInput = modal.querySelector('input, select, textarea');
            if (primerInput) primerInput.focus();
        }, 100);
    }

    function cerrar() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.classList.add('oculto');
        document.removeEventListener('keydown', manejarEscape);
        onConfirmarActual = null;
    }

    function manejarEscape(e) {
        if (e.key === 'Escape') cerrar();
    }

    function confirmar({ titulo, mensaje, textoConfirmar = 'Confirmar', onConfirmar }) {
        abrir({
            titulo,
            contenido: `<p style="color: var(--color-texto)">${mensaje}</p>`,
            onConfirmar: () => {
                if (onConfirmar) onConfirmar();
                cerrar();
            },
            textoConfirmar
        });
    }

    window.TallerPro.Modal = { abrir, cerrar, confirmar };
})();
