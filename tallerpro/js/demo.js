/* =============================================
   TallerPro - Datos de Demostración
   Carga datos de ejemplo si no hay datos previos
   ============================================= */

(function() {
    const Store = window.TallerPro.Store;
    const Utils = window.TallerPro.Utils;

    // Only seed if no empresas exist
    if (Store.getAll('empresas').length > 0) return;

    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const hoyStr = `${yyyy}-${mm}-${dd}`;

    function diasDesdeHoy(n) {
        const d = new Date(hoy);
        d.setDate(d.getDate() + n);
        return d.toISOString().split('T')[0];
    }

    function diasAntesHoy(n) {
        return diasDesdeHoy(-n);
    }

    // === EMPRESAS ===
    const empresas = [
        {
            id: 'emp_demo_001',
            nombre: 'Transportes García S.L.',
            cif: 'B12345678',
            direccion: 'Calle Mayor 15, 28001 Madrid',
            contactos: [
                { id: 'con_d01', nombre: 'Juan García', telefono: '612 345 678', email: 'juan@transportesgarcia.es', cargo: 'Jefe de flota' },
                { id: 'con_d02', nombre: 'Ana Ruiz', telefono: '698 765 432', email: 'ana@transportesgarcia.es', cargo: 'Administración' }
            ],
            notasOperacion: 'Prefieren citas por la mañana. Descuento 10% en mano de obra. Facturación a 30 días.',
            creadoEn: diasAntesHoy(90) + 'T09:00:00Z',
            actualizadoEn: diasAntesHoy(5) + 'T10:00:00Z'
        },
        {
            id: 'emp_demo_002',
            nombre: 'Mensajería López Express',
            cif: 'A87654321',
            direccion: 'Av. de la Constitución 42, 28006 Madrid',
            contactos: [
                { id: 'con_d03', nombre: 'María López', telefono: '654 321 987', email: 'maria@lopezexpress.com', cargo: 'Gerente' }
            ],
            notasOperacion: 'Flota de furgonetas pequeñas. Necesitan vehículos de sustitución.',
            creadoEn: diasAntesHoy(60) + 'T09:00:00Z',
            actualizadoEn: diasAntesHoy(3) + 'T10:00:00Z'
        },
        {
            id: 'emp_demo_003',
            nombre: 'Construcciones Martínez',
            cif: 'B55667788',
            direccion: 'Polígono Industrial Sur, Nave 7, Getafe',
            contactos: [
                { id: 'con_d04', nombre: 'Pedro Martínez', telefono: '611 222 333', email: 'pedro@constmartinez.es', cargo: 'Director' },
                { id: 'con_d05', nombre: 'Luis Fernández', telefono: '622 333 444', email: 'luis@constmartinez.es', cargo: 'Jefe de vehículos' }
            ],
            notasOperacion: 'Vehículos pesados y todoterreno. Trabajos frecuentes de suspensión.',
            creadoEn: diasAntesHoy(120) + 'T09:00:00Z',
            actualizadoEn: diasAntesHoy(1) + 'T10:00:00Z'
        },
        {
            id: 'emp_demo_004',
            nombre: 'Clínica Dental Sonrisa',
            cif: 'B99887766',
            direccion: 'Calle Serrano 88, 28006 Madrid',
            contactos: [
                { id: 'con_d06', nombre: 'Dr. Carlos Vega', telefono: '633 444 555', email: 'carlos@clinicasonrisa.es', cargo: 'Director' }
            ],
            notasOperacion: 'Solo 2 vehículos. Prefieren recogida y entrega del coche.',
            creadoEn: diasAntesHoy(45) + 'T09:00:00Z',
            actualizadoEn: diasAntesHoy(10) + 'T10:00:00Z'
        }
    ];

    // === VEHÍCULOS ===
    const vehiculos = [
        { id: 'veh_d01', empresaId: 'emp_demo_001', matricula: '1234 ABC', marca: 'Renault', modelo: 'Kangoo', anio: 2022, kilometraje: 85000, notas: '' },
        { id: 'veh_d02', empresaId: 'emp_demo_001', matricula: '5678 DEF', marca: 'Mercedes', modelo: 'Sprinter', anio: 2021, kilometraje: 120000, notas: 'Problema recurrente de embrague' },
        { id: 'veh_d03', empresaId: 'emp_demo_001', matricula: '9012 GHI', marca: 'Renault', modelo: 'Master', anio: 2020, kilometraje: 150000, notas: '' },
        { id: 'veh_d04', empresaId: 'emp_demo_002', matricula: '3456 JKL', marca: 'Citroën', modelo: 'Berlingo', anio: 2023, kilometraje: 45000, notas: '' },
        { id: 'veh_d05', empresaId: 'emp_demo_002', matricula: '7890 MNO', marca: 'Peugeot', modelo: 'Partner', anio: 2022, kilometraje: 62000, notas: '' },
        { id: 'veh_d06', empresaId: 'emp_demo_002', matricula: '2345 PQR', marca: 'Ford', modelo: 'Transit Connect', anio: 2021, kilometraje: 98000, notas: '' },
        { id: 'veh_d07', empresaId: 'emp_demo_003', matricula: '6789 STU', marca: 'Toyota', modelo: 'Land Cruiser', anio: 2019, kilometraje: 180000, notas: 'Uso en obra' },
        { id: 'veh_d08', empresaId: 'emp_demo_003', matricula: '0123 VWX', marca: 'Mitsubishi', modelo: 'L200', anio: 2020, kilometraje: 95000, notas: '' },
        { id: 'veh_d09', empresaId: 'emp_demo_004', matricula: '4567 YZA', marca: 'BMW', modelo: 'X3', anio: 2023, kilometraje: 25000, notas: '' },
        { id: 'veh_d10', empresaId: 'emp_demo_004', matricula: '8901 BCD', marca: 'Audi', modelo: 'A4 Avant', anio: 2022, kilometraje: 38000, notas: '' }
    ];

    // === TRABAJOS ===
    const trabajos = [
        {
            id: 'tra_d01', empresaId: 'emp_demo_001', vehiculoId: 'veh_d01',
            descripcion: 'Revisión completa + cambio pastillas de freno',
            estado: 'en_taller', subEstadoRecambios: null, prioridad: 'alta',
            presupuesto: {
                manoObra: 180, recambios: 95, total: 275,
                detalleLineas: [
                    { concepto: 'Pastillas freno delanteras Brembo', cantidad: 1, precio: 65, tipo: 'recambio' },
                    { concepto: 'Líquido de frenos DOT4', cantidad: 1, precio: 30, tipo: 'recambio' },
                    { concepto: 'Mano de obra frenos', cantidad: 2, precio: 45, tipo: 'mano_obra' },
                    { concepto: 'Revisión general', cantidad: 2, precio: 45, tipo: 'mano_obra' }
                ]
            },
            recambiosPendientes: [
                { nombre: 'Pastillas Brembo P06033', estado: 'recibido', fechaPedido: diasAntesHoy(5), proveedor: 'Recambios López' }
            ],
            tareasPendientes: [
                { descripcion: 'Cambiar pastillas delanteras', completada: true },
                { descripcion: 'Purgar líquido de frenos', completada: true },
                { descripcion: 'Revisar nivel aceite', completada: false },
                { descripcion: 'Comprobar neumáticos', completada: false }
            ],
            fechaEntrada: diasAntesHoy(1) + 'T08:30:00Z', fechaSalida: null,
            notas: 'Cliente solicita fotos del trabajo terminado',
            creadoEn: diasAntesHoy(8) + 'T09:00:00Z', actualizadoEn: diasAntesHoy(0) + 'T10:00:00Z',
            historial: [
                { fecha: diasAntesHoy(8) + 'T09:00:00Z', estadoAnterior: null, estadoNuevo: 'peticion' },
                { fecha: diasAntesHoy(7) + 'T11:00:00Z', estadoAnterior: 'peticion', estadoNuevo: 'presupuesto_enviado' },
                { fecha: diasAntesHoy(6) + 'T09:30:00Z', estadoAnterior: 'presupuesto_enviado', estadoNuevo: 'presupuesto_autorizado' },
                { fecha: diasAntesHoy(5) + 'T10:00:00Z', estadoAnterior: 'presupuesto_autorizado', estadoNuevo: 'recambios' },
                { fecha: diasAntesHoy(2) + 'T14:00:00Z', estadoAnterior: 'recambios', estadoNuevo: 'cita_previa' },
                { fecha: diasAntesHoy(1) + 'T08:30:00Z', estadoAnterior: 'cita_previa', estadoNuevo: 'en_taller' }
            ]
        },
        {
            id: 'tra_d02', empresaId: 'emp_demo_001', vehiculoId: 'veh_d02',
            descripcion: 'Cambio de embrague completo',
            estado: 'en_taller', subEstadoRecambios: null, prioridad: 'urgente',
            presupuesto: {
                manoObra: 450, recambios: 380, total: 830,
                detalleLineas: [
                    { concepto: 'Kit embrague LUK', cantidad: 1, precio: 320, tipo: 'recambio' },
                    { concepto: 'Volante bimasa', cantidad: 1, precio: 60, tipo: 'recambio' },
                    { concepto: 'Mano de obra embrague', cantidad: 5, precio: 90, tipo: 'mano_obra' }
                ]
            },
            recambiosPendientes: [],
            tareasPendientes: [
                { descripcion: 'Desmontar caja de cambios', completada: true },
                { descripcion: 'Cambiar kit embrague', completada: false },
                { descripcion: 'Montar y ajustar', completada: false }
            ],
            fechaEntrada: diasAntesHoy(2) + 'T09:00:00Z', fechaSalida: null,
            notas: '', creadoEn: diasAntesHoy(12) + 'T09:00:00Z', actualizadoEn: diasAntesHoy(0) + 'T10:00:00Z',
            historial: [
                { fecha: diasAntesHoy(12) + 'T09:00:00Z', estadoAnterior: null, estadoNuevo: 'peticion' },
                { fecha: diasAntesHoy(10) + 'T10:00:00Z', estadoAnterior: 'peticion', estadoNuevo: 'presupuesto_enviado' },
                { fecha: diasAntesHoy(8) + 'T09:00:00Z', estadoAnterior: 'presupuesto_enviado', estadoNuevo: 'presupuesto_autorizado' },
                { fecha: diasAntesHoy(3) + 'T08:00:00Z', estadoAnterior: 'presupuesto_autorizado', estadoNuevo: 'cita_previa' },
                { fecha: diasAntesHoy(2) + 'T09:00:00Z', estadoAnterior: 'cita_previa', estadoNuevo: 'en_taller' }
            ]
        },
        {
            id: 'tra_d03', empresaId: 'emp_demo_002', vehiculoId: 'veh_d04',
            descripcion: 'Cambio aceite + filtros',
            estado: 'presupuesto_enviado', subEstadoRecambios: null, prioridad: 'normal',
            presupuesto: {
                manoObra: 60, recambios: 85, total: 145,
                detalleLineas: [
                    { concepto: 'Aceite 5W30 5L', cantidad: 1, precio: 45, tipo: 'recambio' },
                    { concepto: 'Filtro aceite', cantidad: 1, precio: 15, tipo: 'recambio' },
                    { concepto: 'Filtro aire', cantidad: 1, precio: 25, tipo: 'recambio' },
                    { concepto: 'Mano de obra', cantidad: 1, precio: 60, tipo: 'mano_obra' }
                ]
            },
            recambiosPendientes: [], tareasPendientes: [],
            fechaEntrada: null, fechaSalida: null,
            notas: '', creadoEn: diasAntesHoy(3) + 'T09:00:00Z', actualizadoEn: diasAntesHoy(2) + 'T10:00:00Z',
            historial: [
                { fecha: diasAntesHoy(3) + 'T09:00:00Z', estadoAnterior: null, estadoNuevo: 'peticion' },
                { fecha: diasAntesHoy(2) + 'T10:00:00Z', estadoAnterior: 'peticion', estadoNuevo: 'presupuesto_enviado' }
            ]
        },
        {
            id: 'tra_d04', empresaId: 'emp_demo_002', vehiculoId: 'veh_d05',
            descripcion: 'Reparación aire acondicionado',
            estado: 'peticion', subEstadoRecambios: null, prioridad: 'normal',
            presupuesto: { manoObra: 0, recambios: 0, total: 0, detalleLineas: [] },
            recambiosPendientes: [], tareasPendientes: [],
            fechaEntrada: null, fechaSalida: null,
            notas: 'No enfría nada, posible fuga', creadoEn: diasAntesHoy(1) + 'T09:00:00Z', actualizadoEn: diasAntesHoy(1) + 'T09:00:00Z',
            historial: [{ fecha: diasAntesHoy(1) + 'T09:00:00Z', estadoAnterior: null, estadoNuevo: 'peticion' }]
        },
        {
            id: 'tra_d05', empresaId: 'emp_demo_003', vehiculoId: 'veh_d07',
            descripcion: 'Cambio amortiguadores delanteros y traseros',
            estado: 'recambios', subEstadoRecambios: 'pedido', prioridad: 'alta',
            presupuesto: {
                manoObra: 240, recambios: 520, total: 760,
                detalleLineas: [
                    { concepto: 'Amortiguadores delanteros (par)', cantidad: 1, precio: 280, tipo: 'recambio' },
                    { concepto: 'Amortiguadores traseros (par)', cantidad: 1, precio: 240, tipo: 'recambio' },
                    { concepto: 'Mano de obra suspensión', cantidad: 4, precio: 60, tipo: 'mano_obra' }
                ]
            },
            recambiosPendientes: [
                { nombre: 'Amortiguadores Bilstein B4 delanteros', estado: 'recibido', fechaPedido: diasAntesHoy(4), proveedor: 'AutoRecambios Madrid' },
                { nombre: 'Amortiguadores Bilstein B4 traseros', estado: 'pedido', fechaPedido: diasAntesHoy(3), proveedor: 'AutoRecambios Madrid' }
            ],
            tareasPendientes: [], fechaEntrada: null, fechaSalida: null,
            notas: 'Uso en obra, necesita amortiguadores reforzados',
            creadoEn: diasAntesHoy(10) + 'T09:00:00Z', actualizadoEn: diasAntesHoy(0) + 'T10:00:00Z',
            historial: [
                { fecha: diasAntesHoy(10) + 'T09:00:00Z', estadoAnterior: null, estadoNuevo: 'peticion' },
                { fecha: diasAntesHoy(8) + 'T10:00:00Z', estadoAnterior: 'peticion', estadoNuevo: 'presupuesto_enviado' },
                { fecha: diasAntesHoy(6) + 'T11:00:00Z', estadoAnterior: 'presupuesto_enviado', estadoNuevo: 'presupuesto_autorizado' },
                { fecha: diasAntesHoy(5) + 'T09:00:00Z', estadoAnterior: 'presupuesto_autorizado', estadoNuevo: 'recambios' }
            ]
        },
        {
            id: 'tra_d06', empresaId: 'emp_demo_003', vehiculoId: 'veh_d08',
            descripcion: 'ITV + revisión pre-ITV',
            estado: 'cita_previa', subEstadoRecambios: null, prioridad: 'normal',
            presupuesto: {
                manoObra: 90, recambios: 0, total: 90,
                detalleLineas: [
                    { concepto: 'Revisión pre-ITV completa', cantidad: 1.5, precio: 60, tipo: 'mano_obra' }
                ]
            },
            recambiosPendientes: [], tareasPendientes: [],
            fechaEntrada: null, fechaSalida: null,
            notas: 'ITV caduca el día 28',
            creadoEn: diasAntesHoy(5) + 'T09:00:00Z', actualizadoEn: diasAntesHoy(1) + 'T10:00:00Z',
            historial: [
                { fecha: diasAntesHoy(5) + 'T09:00:00Z', estadoAnterior: null, estadoNuevo: 'peticion' },
                { fecha: diasAntesHoy(4) + 'T10:00:00Z', estadoAnterior: 'peticion', estadoNuevo: 'presupuesto_enviado' },
                { fecha: diasAntesHoy(3) + 'T09:00:00Z', estadoAnterior: 'presupuesto_enviado', estadoNuevo: 'presupuesto_autorizado' },
                { fecha: diasAntesHoy(1) + 'T10:00:00Z', estadoAnterior: 'presupuesto_autorizado', estadoNuevo: 'cita_previa' }
            ]
        },
        {
            id: 'tra_d07', empresaId: 'emp_demo_004', vehiculoId: 'veh_d09',
            descripcion: 'Cambio neumáticos + alineado',
            estado: 'presupuesto_autorizado', subEstadoRecambios: null, prioridad: 'baja',
            presupuesto: {
                manoObra: 80, recambios: 480, total: 560,
                detalleLineas: [
                    { concepto: 'Neumáticos Michelin Primacy 4 (x4)', cantidad: 4, precio: 120, tipo: 'recambio' },
                    { concepto: 'Alineado y equilibrado', cantidad: 1, precio: 80, tipo: 'mano_obra' }
                ]
            },
            recambiosPendientes: [], tareasPendientes: [],
            fechaEntrada: null, fechaSalida: null,
            notas: '', creadoEn: diasAntesHoy(4) + 'T09:00:00Z', actualizadoEn: diasAntesHoy(1) + 'T10:00:00Z',
            historial: [
                { fecha: diasAntesHoy(4) + 'T09:00:00Z', estadoAnterior: null, estadoNuevo: 'peticion' },
                { fecha: diasAntesHoy(3) + 'T10:00:00Z', estadoAnterior: 'peticion', estadoNuevo: 'presupuesto_enviado' },
                { fecha: diasAntesHoy(1) + 'T10:00:00Z', estadoAnterior: 'presupuesto_enviado', estadoNuevo: 'presupuesto_autorizado' }
            ]
        },
        {
            id: 'tra_d08', empresaId: 'emp_demo_002', vehiculoId: 'veh_d06',
            descripcion: 'Cambio correa distribución + bomba agua',
            estado: 'recambios', subEstadoRecambios: 'por_pedir', prioridad: 'alta',
            presupuesto: {
                manoObra: 350, recambios: 290, total: 640,
                detalleLineas: [
                    { concepto: 'Kit distribución Gates', cantidad: 1, precio: 190, tipo: 'recambio' },
                    { concepto: 'Bomba de agua', cantidad: 1, precio: 100, tipo: 'recambio' },
                    { concepto: 'Mano de obra distribución', cantidad: 5, precio: 70, tipo: 'mano_obra' }
                ]
            },
            recambiosPendientes: [
                { nombre: 'Kit distribución Gates K015603XS', estado: 'por_pedir', fechaPedido: null, proveedor: '' },
                { nombre: 'Bomba agua SKF VKPC 85314', estado: 'por_pedir', fechaPedido: null, proveedor: '' }
            ],
            tareasPendientes: [], fechaEntrada: null, fechaSalida: null,
            notas: 'Urgente, 150.000km sin cambiar',
            creadoEn: diasAntesHoy(2) + 'T09:00:00Z', actualizadoEn: diasAntesHoy(0) + 'T10:00:00Z',
            historial: [
                { fecha: diasAntesHoy(2) + 'T09:00:00Z', estadoAnterior: null, estadoNuevo: 'peticion' },
                { fecha: diasAntesHoy(1) + 'T10:00:00Z', estadoAnterior: 'peticion', estadoNuevo: 'presupuesto_enviado' },
                { fecha: diasAntesHoy(1) + 'T14:00:00Z', estadoAnterior: 'presupuesto_enviado', estadoNuevo: 'presupuesto_autorizado' },
                { fecha: diasAntesHoy(0) + 'T09:00:00Z', estadoAnterior: 'presupuesto_autorizado', estadoNuevo: 'recambios' }
            ]
        },
        {
            id: 'tra_d09', empresaId: 'emp_demo_001', vehiculoId: 'veh_d03',
            descripcion: 'Reparación sistema de escape',
            estado: 'peticion', subEstadoRecambios: null, prioridad: 'normal',
            presupuesto: { manoObra: 0, recambios: 0, total: 0, detalleLineas: [] },
            recambiosPendientes: [], tareasPendientes: [],
            fechaEntrada: null, fechaSalida: null,
            notas: 'Se escucha ruido fuerte al acelerar',
            creadoEn: diasAntesHoy(0) + 'T08:00:00Z', actualizadoEn: diasAntesHoy(0) + 'T08:00:00Z',
            historial: [{ fecha: diasAntesHoy(0) + 'T08:00:00Z', estadoAnterior: null, estadoNuevo: 'peticion' }]
        },
        {
            id: 'tra_d10', empresaId: 'emp_demo_004', vehiculoId: 'veh_d10',
            descripcion: 'Revisión oficial 30.000km',
            estado: 'finalizado', subEstadoRecambios: null, prioridad: 'normal',
            presupuesto: {
                manoObra: 120, recambios: 75, total: 195,
                detalleLineas: [
                    { concepto: 'Aceite Castrol 5W30', cantidad: 1, precio: 50, tipo: 'recambio' },
                    { concepto: 'Filtro aceite', cantidad: 1, precio: 25, tipo: 'recambio' },
                    { concepto: 'Revisión 30.000km', cantidad: 2, precio: 60, tipo: 'mano_obra' }
                ]
            },
            recambiosPendientes: [], tareasPendientes: [
                { descripcion: 'Cambio aceite y filtro', completada: true },
                { descripcion: 'Revisión multipunto', completada: true },
                { descripcion: 'Reset intervalo servicio', completada: true }
            ],
            fechaEntrada: diasAntesHoy(5) + 'T09:00:00Z', fechaSalida: diasAntesHoy(4) + 'T17:00:00Z',
            notas: '', creadoEn: diasAntesHoy(15) + 'T09:00:00Z', actualizadoEn: diasAntesHoy(4) + 'T17:00:00Z',
            historial: [
                { fecha: diasAntesHoy(15) + 'T09:00:00Z', estadoAnterior: null, estadoNuevo: 'peticion' },
                { fecha: diasAntesHoy(12) + 'T10:00:00Z', estadoAnterior: 'peticion', estadoNuevo: 'presupuesto_enviado' },
                { fecha: diasAntesHoy(10) + 'T09:00:00Z', estadoAnterior: 'presupuesto_enviado', estadoNuevo: 'presupuesto_autorizado' },
                { fecha: diasAntesHoy(6) + 'T10:00:00Z', estadoAnterior: 'presupuesto_autorizado', estadoNuevo: 'cita_previa' },
                { fecha: diasAntesHoy(5) + 'T09:00:00Z', estadoAnterior: 'cita_previa', estadoNuevo: 'en_taller' },
                { fecha: diasAntesHoy(4) + 'T17:00:00Z', estadoAnterior: 'en_taller', estadoNuevo: 'finalizado' }
            ]
        }
    ];

    // === CITAS ===
    const citas = [
        { id: 'cit_d01', trabajoId: 'tra_d06', empresaId: 'emp_demo_003', vehiculoId: 'veh_d08', fecha: diasDesdeHoy(2), horaInicio: '09:00', horaFin: '10:00', tipo: 'entrada', notas: 'Traer documentación ITV', creadoEn: diasAntesHoy(1) + 'T10:00:00Z' },
        { id: 'cit_d02', trabajoId: null, empresaId: 'emp_demo_001', vehiculoId: 'veh_d03', fecha: diasDesdeHoy(3), horaInicio: '10:30', horaFin: '11:00', tipo: 'revision', notas: 'Diagnóstico escape', creadoEn: diasAntesHoy(0) + 'T08:00:00Z' },
        { id: 'cit_d03', trabajoId: null, empresaId: 'emp_demo_002', vehiculoId: 'veh_d04', fecha: diasDesdeHoy(4), horaInicio: '08:30', horaFin: '09:00', tipo: 'entrada', notas: '', creadoEn: diasAntesHoy(2) + 'T10:00:00Z' },
        { id: 'cit_d04', trabajoId: 'tra_d01', empresaId: 'emp_demo_001', vehiculoId: 'veh_d01', fecha: diasDesdeHoy(1), horaInicio: '16:00', horaFin: '16:30', tipo: 'entrega', notas: 'Llamar 30min antes para que vengan', creadoEn: diasAntesHoy(0) + 'T10:00:00Z' },
        { id: 'cit_d05', trabajoId: null, empresaId: 'emp_demo_004', vehiculoId: 'veh_d09', fecha: diasDesdeHoy(5), horaInicio: '11:00', horaFin: '11:30', tipo: 'entrada', notas: 'Cambio neumáticos', creadoEn: diasAntesHoy(0) + 'T10:00:00Z' },
        { id: 'cit_d06', trabajoId: null, empresaId: 'emp_demo_003', vehiculoId: 'veh_d07', fecha: hoyStr, horaInicio: '15:00', horaFin: '15:30', tipo: 'revision', notas: 'Comprobar amortiguadores traseros recibidos', creadoEn: diasAntesHoy(1) + 'T10:00:00Z' }
    ];

    // Save all demo data
    empresas.forEach(e => Store.save('empresas', e));
    vehiculos.forEach(v => Store.save('vehiculos', v));
    trabajos.forEach(t => Store.save('trabajos', t));
    citas.forEach(c => Store.save('citas', c));

    console.log('TallerPro: Datos de demostración cargados');
})();
