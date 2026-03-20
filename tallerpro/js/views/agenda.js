/* =============================================
   TallerPro - Vista Agenda (Calendario)
   ============================================= */

window.TallerPro = window.TallerPro || {};
window.TallerPro.Views = window.TallerPro.Views || {};

(function() {
    const Utils = () => window.TallerPro.Utils;
    const Store = () => window.TallerPro.Store;
    const CitaService = () => window.TallerPro.CitaService;
    const EmpresaService = () => window.TallerPro.EmpresaService;
    const Modal = () => window.TallerPro.Modal;
    const Toast = () => window.TallerPro.Toast;

    let contenedorRef = null;
    let vistaActual = 'mes'; // 'mes' | 'semana' | 'dia'
    let fechaActual = new Date();

    const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    function render(contenedor) {
        contenedorRef = contenedor;
        renderVista();
        contenedor.addEventListener('click', manejarClick);
    }

    function renderVista() {
        const mes = fechaActual.getMonth();
        const anio = fechaActual.getFullYear();

        contenedorRef.innerHTML = `
            <div class="vista-header">
                <h1>Agenda</h1>
                <div class="vista-header-acciones">
                    <button class="btn btn-primario" id="btn-nueva-cita">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Nueva Cita
                    </button>
                </div>
            </div>

            <div class="agenda-controles">
                <div class="agenda-nav">
                    <button class="btn btn-fantasma btn-sm" id="btn-anterior">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <h2 class="agenda-titulo">${MESES[mes]} ${anio}</h2>
                    <button class="btn btn-fantasma btn-sm" id="btn-siguiente">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                    <button class="btn btn-fantasma btn-sm" id="btn-hoy">Hoy</button>
                </div>
                <div class="tabs" style="margin-bottom: 0; border: none;">
                    <button class="tab ${vistaActual === 'mes' ? 'activo' : ''}" data-vista="mes">Mes</button>
                    <button class="tab ${vistaActual === 'semana' ? 'activo' : ''}" data-vista="semana">Semana</button>
                    <button class="tab ${vistaActual === 'dia' ? 'activo' : ''}" data-vista="dia">Día</button>
                </div>
            </div>

            <div class="agenda-contenido">
                ${vistaActual === 'mes' ? renderMes(anio, mes) : ''}
                ${vistaActual === 'semana' ? renderSemana() : ''}
                ${vistaActual === 'dia' ? renderDia() : ''}
            </div>
        `;
    }

    function renderMes(anio, mes) {
        const primerDia = Utils().primerDiaSemana(anio, mes);
        const diasMes = Utils().diasEnMes(anio, mes);
        const hoy = Utils().hoy();

        let html = '<div class="calendario-grid">';
        // Header
        DIAS_SEMANA.forEach(d => {
            html += `<div class="calendario-header">${d}</div>`;
        });

        // Días vacíos
        for (let i = 0; i < primerDia; i++) {
            html += '<div class="calendario-dia vacio"></div>';
        }

        // Días del mes
        for (let dia = 1; dia <= diasMes; dia++) {
            const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const citas = CitaService().listarPorFecha(fecha);
            const esHoy = fecha === hoy;

            html += `
                <div class="calendario-dia ${esHoy ? 'hoy' : ''} ${citas.length > 0 ? 'con-citas' : ''}" data-fecha="${fecha}">
                    <span class="calendario-dia-numero">${dia}</span>
                    ${citas.length > 0 ? `
                        <div class="calendario-dia-citas">
                            ${citas.slice(0, 2).map(c => {
                                const empresa = EmpresaService().obtener(c.empresaId);
                                return `<div class="calendario-cita-punto" title="${c.horaInicio} - ${Utils().sanitizeHTML(empresa?.nombre || '')}">${c.horaInicio}</div>`;
                            }).join('')}
                            ${citas.length > 2 ? `<div class="calendario-cita-mas">+${citas.length - 2}</div>` : ''}
                        </div>
                    ` : ''}
                </div>`;
        }

        html += '</div>';
        return html;
    }

    function renderSemana() {
        const config = Store().getConfig();
        const inicio = config.horaInicioJornada || '08:00';
        const fin = config.horaFinJornada || '19:00';
        const intervalo = config.intervaloMinutos || 30;

        // Calcular inicio de semana (lunes)
        const d = new Date(fechaActual);
        const diaSemana = d.getDay();
        const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
        d.setDate(d.getDate() + diff);

        const slots = generarSlots(inicio, fin, intervalo);
        const hoy = Utils().hoy();

        let html = '<div class="semana-grid">';
        html += '<div class="semana-header-vacio"></div>';

        // Headers de días
        for (let i = 0; i < 7; i++) {
            const fecha = new Date(d);
            fecha.setDate(d.getDate() + i);
            const fechaStr = fecha.toISOString().split('T')[0];
            const esHoy = fechaStr === hoy;
            html += `<div class="semana-header ${esHoy ? 'hoy' : ''}">${DIAS_SEMANA[i]} ${fecha.getDate()}</div>`;
        }

        // Filas de tiempo
        slots.forEach(slot => {
            html += `<div class="semana-hora">${slot}</div>`;
            for (let i = 0; i < 7; i++) {
                const fecha = new Date(d);
                fecha.setDate(d.getDate() + i);
                const fechaStr = fecha.toISOString().split('T')[0];
                const citas = CitaService().listarPorFecha(fechaStr).filter(c => c.horaInicio === slot);
                html += `<div class="semana-celda" data-fecha="${fechaStr}" data-hora="${slot}">
                    ${citas.map(c => {
                        const empresa = EmpresaService().obtener(c.empresaId);
                        return `<div class="semana-cita" data-cita-id="${c.id}">${c.horaInicio} ${Utils().sanitizeHTML(empresa?.nombre?.substring(0, 15) || '')}</div>`;
                    }).join('')}
                </div>`;
            }
        });

        html += '</div>';
        return html;
    }

    function renderDia() {
        const config = Store().getConfig();
        const inicio = config.horaInicioJornada || '08:00';
        const fin = config.horaFinJornada || '19:00';
        const intervalo = config.intervaloMinutos || 30;
        const fechaStr = fechaActual.toISOString().split('T')[0];
        const citas = CitaService().listarPorFecha(fechaStr);
        const slots = generarSlots(inicio, fin, intervalo);

        let html = `<div class="dia-grid">`;
        slots.forEach(slot => {
            const citasSlot = citas.filter(c => c.horaInicio === slot);
            html += `
                <div class="dia-fila" data-fecha="${fechaStr}" data-hora="${slot}">
                    <div class="dia-hora">${slot}</div>
                    <div class="dia-contenido">
                        ${citasSlot.length > 0 ?
                            citasSlot.map(c => {
                                const empresa = EmpresaService().obtener(c.empresaId);
                                return `
                                    <div class="dia-cita" data-cita-id="${c.id}">
                                        <span class="font-medium">${c.horaInicio} - ${c.horaFin || ''}</span>
                                        <span class="text-sm">${Utils().sanitizeHTML(empresa?.nombre || '')} ${c.tipo ? `(${c.tipo})` : ''}</span>
                                        ${c.notas ? `<span class="text-xs text-terciario">${Utils().sanitizeHTML(c.notas)}</span>` : ''}
                                    </div>`;
                            }).join('') :
                            `<button class="dia-slot-vacio btn-fantasma" data-fecha="${fechaStr}" data-hora="${slot}">+ Añadir cita</button>`
                        }
                    </div>
                </div>`;
        });
        html += '</div>';
        return html;
    }

    function generarSlots(inicio, fin, intervalo) {
        const slots = [];
        let [h, m] = inicio.split(':').map(Number);
        const [hFin, mFin] = fin.split(':').map(Number);
        while (h < hFin || (h === hFin && m < mFin)) {
            slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
            m += intervalo;
            if (m >= 60) { h++; m -= 60; }
        }
        return slots;
    }

    function manejarClick(e) {
        // Navegación temporal
        if (e.target.closest('#btn-anterior')) {
            if (vistaActual === 'mes') fechaActual.setMonth(fechaActual.getMonth() - 1);
            else if (vistaActual === 'semana') fechaActual.setDate(fechaActual.getDate() - 7);
            else fechaActual.setDate(fechaActual.getDate() - 1);
            renderVista();
            return;
        }
        if (e.target.closest('#btn-siguiente')) {
            if (vistaActual === 'mes') fechaActual.setMonth(fechaActual.getMonth() + 1);
            else if (vistaActual === 'semana') fechaActual.setDate(fechaActual.getDate() + 7);
            else fechaActual.setDate(fechaActual.getDate() + 1);
            renderVista();
            return;
        }
        if (e.target.closest('#btn-hoy')) {
            fechaActual = new Date();
            renderVista();
            return;
        }

        // Cambio de vista
        const tabVista = e.target.closest('[data-vista]');
        if (tabVista) {
            vistaActual = tabVista.dataset.vista;
            renderVista();
            return;
        }

        // Click en día del mes
        const diaEl = e.target.closest('.calendario-dia[data-fecha]');
        if (diaEl && vistaActual === 'mes') {
            const [y, m, d] = diaEl.dataset.fecha.split('-').map(Number);
            fechaActual = new Date(y, m - 1, d);
            vistaActual = 'dia';
            renderVista();
            return;
        }

        // Nueva cita
        if (e.target.closest('#btn-nueva-cita') || e.target.closest('.dia-slot-vacio')) {
            const slotBtn = e.target.closest('.dia-slot-vacio');
            abrirFormularioCita(null, slotBtn?.dataset.fecha, slotBtn?.dataset.hora);
            return;
        }
    }

    function abrirFormularioCita(cita = null, fecha = null, hora = null) {
        const empresas = EmpresaService().listar();
        const fechaDefecto = fecha || fechaActual.toISOString().split('T')[0];
        const horaDefecto = hora || '09:00';

        Modal().abrir({
            titulo: cita ? 'Editar Cita' : 'Nueva Cita',
            contenido: `
                <div class="form-fila">
                    <div class="form-grupo">
                        <label class="form-label">Fecha *</label>
                        <input type="date" class="form-input" id="modal-cita-fecha" value="${cita?.fecha || fechaDefecto}">
                    </div>
                    <div class="form-grupo">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" id="modal-cita-tipo">
                            <option value="entrada" ${cita?.tipo === 'entrada' ? 'selected' : ''}>Entrada</option>
                            <option value="entrega" ${cita?.tipo === 'entrega' ? 'selected' : ''}>Entrega</option>
                            <option value="revision" ${cita?.tipo === 'revision' ? 'selected' : ''}>Revisión</option>
                            <option value="otro" ${cita?.tipo === 'otro' ? 'selected' : ''}>Otro</option>
                        </select>
                    </div>
                </div>
                <div class="form-fila">
                    <div class="form-grupo">
                        <label class="form-label">Hora inicio *</label>
                        <input type="time" class="form-input" id="modal-cita-hora-inicio" value="${cita?.horaInicio || horaDefecto}">
                    </div>
                    <div class="form-grupo">
                        <label class="form-label">Hora fin</label>
                        <input type="time" class="form-input" id="modal-cita-hora-fin" value="${cita?.horaFin || ''}">
                    </div>
                </div>
                <div class="form-grupo">
                    <label class="form-label">Empresa</label>
                    <select class="form-select" id="modal-cita-empresa">
                        <option value="">Seleccionar empresa...</option>
                        ${empresas.map(e => `<option value="${e.id}" ${cita?.empresaId === e.id ? 'selected' : ''}>${Utils().sanitizeHTML(e.nombre)}</option>`).join('')}
                    </select>
                </div>
                <div class="form-grupo">
                    <label class="form-label">Notas</label>
                    <textarea class="form-textarea" id="modal-cita-notas" placeholder="Observaciones...">${Utils().sanitizeHTML(cita?.notas || '')}</textarea>
                </div>
            `,
            textoConfirmar: cita ? 'Guardar' : 'Crear Cita',
            onConfirmar: () => {
                const fechaVal = document.getElementById('modal-cita-fecha')?.value;
                const horaInicio = document.getElementById('modal-cita-hora-inicio')?.value;
                if (!fechaVal || !horaInicio) {
                    Toast().error('Fecha y hora de inicio son obligatorias');
                    return;
                }
                CitaService().guardar({
                    ...(cita || {}),
                    fecha: fechaVal,
                    horaInicio,
                    horaFin: document.getElementById('modal-cita-hora-fin')?.value || '',
                    tipo: document.getElementById('modal-cita-tipo')?.value || 'entrada',
                    empresaId: document.getElementById('modal-cita-empresa')?.value || '',
                    notas: document.getElementById('modal-cita-notas')?.value?.trim() || ''
                });
                Modal().cerrar();
                Toast().exito(cita ? 'Cita actualizada' : 'Cita creada');
                renderVista();
            }
        });
    }

    function destroy() {
        if (contenedorRef) {
            contenedorRef.removeEventListener('click', manejarClick);
        }
        contenedorRef = null;
    }

    window.TallerPro.Views.Agenda = { render, destroy };
})();
