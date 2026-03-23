/* =============================================
   TallerPro - Componente Toast
   ============================================= */

window.TallerPro = window.TallerPro || {};

(function() {
    function mostrar(mensaje, tipo = 'info', duracion = 3000) {
        const contenedor = document.getElementById('toast-container');
        if (!contenedor) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.innerHTML = `
            <span>${mensaje}</span>
            <button class="toast-cerrar">&times;</button>
        `;

        contenedor.appendChild(toast);

        toast.querySelector('.toast-cerrar').addEventListener('click', () => {
            toast.remove();
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duracion);
    }

    window.TallerPro.Toast = {
        exito: (msg) => mostrar(msg, 'exito'),
        error: (msg) => mostrar(msg, 'error'),
        info: (msg) => mostrar(msg, 'info'),
        advertencia: (msg) => mostrar(msg, 'advertencia')
    };
})();
