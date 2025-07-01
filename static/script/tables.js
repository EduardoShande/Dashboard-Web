/**
 * Mercado P2P USDT - Bolivia
 * Script principal para manejo de datos y inicialización de DataTables
 */

// ===== DATOS SIMULADOS DEL MERCADO P2P =====

async function getData(jsonFile) {
    const response = await fetch(jsonFile);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json()
    return data
}

const table = await getData('json_file/json_table');


const mockP2PData = await getData('json_file/json_users');
console.log(mockP2PData);


// const mockP2PData = [
//     { usuario: "CryptoTrader_BO", precio: 6.92, usdtDisponible: 1500.50 },
//     { usuario: "BolivianExchange", precio: 6.91, usdtDisponible: 2300.75 },
//     { usuario: "P2P_Master", precio: 6.93, usdtDisponible: 850.25 },
//     { usuario: "TradingPro_LP", precio: 6.90, usdtDisponible: 3200.00 },
//     { usuario: "CoinDealer", precio: 6.92, usdtDisponible: 1750.30 },
//     { usuario: "DigitalMoney_BO", precio: 6.89, usdtDisponible: 980.80 },
//     { usuario: "FastTrade", precio: 6.94, usdtDisponible: 1200.45 },
//     { usuario: "SecureExchange", precio: 6.91, usdtDisponible: 2800.65 },
//     { usuario: "QuickBuy_Bolivia", precio: 6.88, usdtDisponible: 1450.90 },
//     { usuario: "TrustTrader", precio: 6.95, usdtDisponible: 760.20 },
//     { usuario: "ReliableP2P", precio: 6.90, usdtDisponible: 2100.35 },
//     { usuario: "SwiftExchange", precio: 6.93, usdtDisponible: 1350.80 },
//     { usuario: "SafeTrade_LP", precio: 6.87, usdtDisponible: 1890.25 },
//     { usuario: "PremiumDealer", precio: 6.96, usdtDisponible: 640.15 },
//     { usuario: "ExpressP2P", precio: 6.89, usdtDisponible: 2250.70 },
//     { usuario: "TopExchange", precio: 6.92, usdtDisponible: 1680.45 },
//     { usuario: "FlashTrade", precio: 6.85, usdtDisponible: 3500.20 },
//     { usuario: "UltraFast", precio: 6.97, usdtDisponible: 520.30 },
//     { usuario: "MegaTrader", precio: 6.88, usdtDisponible: 1920.85 },
//     { usuario: "EliteExchange", precio: 6.94, usdtDisponible: 1150.60 }
// ];

// ===== VARIABLES GLOBALES =====
let userOffersTable;
let priceOffersTable;

// ===== FUNCIONES AUXILIARES =====

/**
 * Formatea números como moneda boliviana
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency: 'BOB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Formatea números USDT con separadores de miles
 * @param {number} amount - Cantidad USDT
 * @returns {string} - Cantidad formateada
 */
function formatUSDT(amount) {
    return new Intl.NumberFormat('es-BO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount) + ' USDT';
}

/**
 * Calcula el precio promedio ponderado
 * @param {Array} data - Array de datos P2P
 * @returns {number} - Precio promedio
 */
function calculateWeightedAverage(data) {
    let totalValue = 0;
    let totalUsdt = 0;
    
    data.forEach(offer => {
        const value = offer.precio * offer.usdtDisponible;
        totalValue += value;
        totalUsdt += offer.usdtDisponible;
    });
    
    return totalUsdt > 0 ? totalValue / totalUsdt : 0;
}

/**
 * Procesa los datos para crear la tabla de ofertas por precio
 * @param {Array} data - Datos originales
 * @returns {Array} - Datos agrupados por precio
 */
function processDataByPrice(data) {
    const priceGroups = {};
    
    // Agrupar por precio
    data.forEach(offer => {
        const price = offer.precio;
        if (!priceGroups[price]) {
            priceGroups[price] = {
                precio: price,
                usdtDisponible: 0,
                cantidadOfertas: 0
            };
        }
        priceGroups[price].usdtDisponible += offer.usdtDisponible;
        priceGroups[price].cantidadOfertas += 1;
    });
    
    // Convertir a array y ordenar por precio
    return Object.values(priceGroups).sort((a, b) => a.precio - b.precio);
}

/**
 * Actualiza las estadísticas del encabezado
 * @param {Array} data - Datos P2P
 */
function updateHeaderStats(data) {
    const totalOffers = data.length;
    const avgPrice = calculateWeightedAverage(data);
    
    document.getElementById('totalOffers').textContent = totalOffers.toLocaleString();
    document.getElementById('avgPrice').textContent = formatCurrency(avgPrice);
}

/**
 * Actualiza la fecha de última actualización
 */
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('es-BO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('lastUpdate').textContent = timeString;
}

// ===== CONFIGURACIÓN DE DATATABLES =====

/**
 * Configuración común para todas las tablas DataTables
 */
const commonDataTableConfig = {
    pageLength: 10,
    lengthMenu: [5, 10, 25, 50, 100],
    language: {
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "No se encontraron registros",
        info: "Mostrando página _PAGE_ de _PAGES_ (_TOTAL_ registros total)",
        infoEmpty: "No hay registros disponibles",
        infoFiltered: "(filtrado de _MAX_ registros totales)",
        search: "Buscar:",
        paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior"
        },
        loadingRecords: "Cargando...",
        processing: "Procesando..."
    },
    responsive: true,
    autoWidth: false,
    scrollX: true,
    dom: '<"top"lf>rt<"bottom"ip><"clear">',
    order: [], // Sin ordenamiento inicial
    drawCallback: function() {
        // Aplicar estilos adicionales después de cada redraw
        this.api().columns.adjust();
    }
};

/**
 * Inicializa la tabla de ofertas por usuario
 */
function initUserOffersTable() {
    // Preparar datos para la tabla
    const tableData = mockP2PData.map(offer => [
        offer.usuario,
        formatCurrency(offer.precio),
        formatUSDT(offer.usdtDisponible),
        formatCurrency(offer.precio * offer.usdtDisponible)
    ]);
    
    // Configuración específica para tabla de usuarios
    const userTableConfig = {
        ...commonDataTableConfig,
        data: tableData,
        columnDefs: [
            {
                targets: [1, 2, 3], // Columnas de precio, USDT y valor total
                className: 'text-right'
            },
            {
                targets: 1, // Columna precio
                type: 'currency'
            },
            {
                targets: 2, // Columna USDT
                type: 'currency'
            }
        ],
        order: [[1, 'asc']] // Ordenar por precio de menor a mayor por defecto
    };
    
    userOffersTable = $('#userOffersTable').DataTable(userTableConfig);
}

/**
 * Inicializa la tabla de ofertas por precio
 */
function initPriceOffersTable() {
    // Procesar datos agrupados por precio
    const priceData = processDataByPrice(mockP2PData);
    
    // Preparar datos para la tabla
    const tableData = priceData.map(priceGroup => [
        formatCurrency(priceGroup.precio),
        formatUSDT(priceGroup.usdtDisponible),
        formatCurrency(priceGroup.precio * priceGroup.usdtDisponible),
        priceGroup.cantidadOfertas.toString()
    ]);
    
    // Configuración específica para tabla de precios
    const priceTableConfig = {
        ...commonDataTableConfig,
        data: tableData,
        columnDefs: [
            {
                targets: [0, 1, 2, 3], // Todas las columnas centradas/derecha
                className: 'text-right'
            },
            {
                targets: [0, 1, 2], // Columnas monetarias
                type: 'currency'
            }
        ],
        order: [[0, 'asc']] // Ordenar por precio de menor a mayor por defecto
    };
    
    priceOffersTable = $('#priceOffersTable').DataTable(priceTableConfig);
}

/**
 * Función para actualizar datos (simulación de actualización en tiempo real)
 */
function refreshData() {
    console.log('Actualizando datos...');
    
    // Simular pequeños cambios en los precios (variación de ±0.02)
    mockP2PData.forEach(offer => {
        const variation = (Math.random() - 0.5) * 0.04; // ±0.02
        offer.precio = Math.max(6.80, Math.min(7.00, offer.precio + variation));
        offer.precio = Math.round(offer.precio * 100) / 100; // Redondear a 2 decimales
    });
    
    // Actualizar estadísticas
    updateHeaderStats(mockP2PData);
    updateLastUpdateTime();
    
    // Recargar tablas
    if (userOffersTable) {
        userOffersTable.destroy();
        initUserOffersTable();
    }
    
    if (priceOffersTable) {
        priceOffersTable.destroy();
        initPriceOffersTable();
    }
    
    console.log('Datos actualizados exitosamente');
}

// ===== INICIALIZACIÓN =====

/**
 * Función principal de inicialización
 */
function initializeApp() {
    console.log('Inicializando aplicación Mercado P2P USDT - Bolivia');
    
    try {
        // Actualizar estadísticas iniciales
        updateHeaderStats(mockP2PData);
        updateLastUpdateTime();
        
        // Inicializar tablas
        initUserOffersTable();
        initPriceOffersTable();
        
        // Configurar actualización automática cada 30 segundos (opcional)
        // setInterval(refreshData, 30000);
        
        console.log('Aplicación inicializada correctamente');
        
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
}

// ===== EVENT LISTENERS =====

// Inicializar cuando el DOM esté listo
$(document).ready(function() {
    initializeApp();
});

// Manejar redimensionamiento de ventana
$(window).on('resize', function() {
    if (userOffersTable) {
        userOffersTable.columns.adjust().responsive.recalc();
    }
    if (priceOffersTable) {
        priceOffersTable.columns.adjust().responsive.recalc();
    }
});

// Función global para actualización manual (puede ser llamada desde consola)
window.refreshP2PData = refreshData;

// ===== UTILIDADES ADICIONALES =====

/**
 * Función para exportar datos (puede ser extendida para CSV, Excel, etc.)
 */
function exportData(tableType = 'user') {
    const data = tableType === 'user' ? mockP2PData : processDataByPrice(mockP2PData);
    console.log(`Datos de ${tableType === 'user' ? 'usuarios' : 'precios'}:`, data);
    return data;
}

/**
 * Función para obtener el mejor precio de compra
 */
function getBestPrice() {
    const sortedData = [...mockP2PData].sort((a, b) => a.precio - b.precio);
    return sortedData[0];
}

/**
 * Función para obtener estadísticas del mercado
 */
function getMarketStats() {
    const prices = mockP2PData.map(offer => offer.precio);
    const totalUSDT = mockP2PData.reduce((sum, offer) => sum + offer.usdtDisponible, 0);
    
    return {
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        avgPrice: calculateWeightedAverage(mockP2PData),
        totalUSDT: totalUSDT,
        totalOffers: mockP2PData.length
    };
}

// Exponer funciones útiles globalmente
window.exportP2PData = exportData;
window.getBestP2PPrice = getBestPrice;
window.getP2PMarketStats = getMarketStats;