/* =============================================
   TallerPro - Store (Abstracción localStorage)
   ============================================= */

window.TallerPro = window.TallerPro || {};

(function() {
    const PREFIJO = 'tallerpro_';

    const CONFIG_DEFECTO = {
        tema: 'oscuro',
        horaInicioJornada: '08:00',
        horaFinJornada: '19:00',
        intervaloMinutos: 30,
        nombreTaller: 'TallerPro',
        capacidadSimultanea: 4
    };

    function leer(coleccion) {
        try {
            const datos = localStorage.getItem(PREFIJO + coleccion);
            return datos ? JSON.parse(datos) : [];
        } catch (e) {
            console.error(`Error leyendo ${coleccion}:`, e);
            return [];
        }
    }

    function escribir(coleccion, datos) {
        try {
            localStorage.setItem(PREFIJO + coleccion, JSON.stringify(datos));
        } catch (e) {
            console.error(`Error escribiendo ${coleccion}:`, e);
        }
    }

    function notificar(coleccion, accion, item) {
        document.dispatchEvent(new CustomEvent('tallerpro:datachange', {
            detail: { coleccion, accion, item }
        }));
    }

    window.TallerPro.Store = {
        getAll(coleccion) {
            return leer(coleccion);
        },

        getById(coleccion, id) {
            const items = leer(coleccion);
            return items.find(item => item.id === id) || null;
        },

        save(coleccion, item) {
            const items = leer(coleccion);
            const Utils = window.TallerPro.Utils;

            if (item.id) {
                // Actualizar
                const index = items.findIndex(i => i.id === item.id);
                if (index !== -1) {
                    item.actualizadoEn = Utils.ahora();
                    items[index] = { ...items[index], ...item };
                    escribir(coleccion, items);
                    notificar(coleccion, 'actualizar', items[index]);
                    return items[index];
                }
            }

            // Crear nuevo
            item.id = item.id || Utils.generarId(coleccion.substring(0, 3));
            item.creadoEn = item.creadoEn || Utils.ahora();
            item.actualizadoEn = Utils.ahora();
            items.push(item);
            escribir(coleccion, items);
            notificar(coleccion, 'crear', item);
            return item;
        },

        remove(coleccion, id) {
            const items = leer(coleccion);
            const index = items.findIndex(item => item.id === id);
            if (index === -1) return false;

            const eliminado = items.splice(index, 1)[0];
            escribir(coleccion, items);
            notificar(coleccion, 'eliminar', eliminado);
            return true;
        },

        query(coleccion, filterFn) {
            const items = leer(coleccion);
            return items.filter(filterFn);
        },

        count(coleccion, filterFn) {
            if (filterFn) {
                return this.query(coleccion, filterFn).length;
            }
            return leer(coleccion).length;
        },

        getConfig() {
            try {
                const datos = localStorage.getItem(PREFIJO + 'config');
                return datos ? { ...CONFIG_DEFECTO, ...JSON.parse(datos) } : { ...CONFIG_DEFECTO };
            } catch (e) {
                return { ...CONFIG_DEFECTO };
            }
        },

        setConfig(parcial) {
            const config = this.getConfig();
            const nueva = { ...config, ...parcial };
            try {
                localStorage.setItem(PREFIJO + 'config', JSON.stringify(nueva));
            } catch (e) {
                console.error('Error guardando config:', e);
            }
            notificar('config', 'actualizar', nueva);
            return nueva;
        },

        getStorageUsage() {
            let total = 0;
            for (let key in localStorage) {
                if (key.startsWith(PREFIJO)) {
                    total += localStorage.getItem(key).length * 2; // UTF-16
                }
            }
            return {
                usado: total,
                usadoMB: (total / (1024 * 1024)).toFixed(2),
                limiteEstimado: 5 * 1024 * 1024,
                porcentaje: ((total / (5 * 1024 * 1024)) * 100).toFixed(1)
            };
        }
    };
})();
