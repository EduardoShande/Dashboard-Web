// Global variables for DataTables instances
let userTable;
let priceTable;

// Main function to initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadAndProcessData();
});

/**
 * Loads JSON data from file and processes it to populate tables
 */
async function loadAndProcessData() {
    try {
        showLoading(true);
        
        // Fetch JSON data from file
        const response = await fetch('json_file/clean_data_json.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process data and create tables
        processDataAndCreateTables(data);
        
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError(true);
        showLoading(false);
    }
}

/**
 * Processes raw data and creates both DataTables
 * @param {Array} rawData - Array of P2P offer objects
 */
function processDataAndCreateTables(rawData) {
    // Group data by user and by price
    const userGroupedData = groupByUser(rawData);
    const priceGroupedData = groupByPrice(rawData);
    
    // Create DataTables
    createUserTable(userGroupedData);
    createPriceTable(priceGroupedData);
}

/**
 * Groups data by user, calculating average price and total USDT
 * @param {Array} data - Raw P2P data
 * @returns {Array} Grouped data by user
 */
function groupByUser(data) {
    const userMap = new Map();
    
    data.forEach(item => {
        const user = item.usuario;
        const price = parseFloat(item.precio);
        const usdt = parseFloat(item.usdtDisponible);
        
        if (userMap.has(user)) {
            const existing = userMap.get(user);
            existing.totalUsdt += usdt;
            existing.totalPriceWeight += price * usdt; // Weighted average calculation
            existing.count += 1;
        } else {
            userMap.set(user, {
                usuario: user,
                totalUsdt: usdt,
                totalPriceWeight: price * usdt,
                count: 1
            });
        }
    });
    
    // Calculate weighted average price and format data
    const result = Array.from(userMap.values()).map(item => ({
        usuario: item.usuario,
        precioPromedio: (item.totalPriceWeight / item.totalUsdt).toFixed(2),
        usdtDisponible: item.totalUsdt.toFixed(2)
    }));
    
    return result;
}

/**
 * Groups data by price, summing USDT amounts
 * @param {Array} data - Raw P2P data
 * @returns {Array} Grouped data by price
 */
function groupByPrice(data) {
    const priceMap = new Map();
    
    data.forEach(item => {
        const price = parseFloat(item.precio);
        const usdt = parseFloat(item.usdtDisponible);
        
        if (priceMap.has(price)) {
            priceMap.set(price, priceMap.get(price) + usdt);
        } else {
            priceMap.set(price, usdt);
        }
    });
    
    // Convert to array and format
    const result = Array.from(priceMap.entries()).map(([price, totalUsdt]) => ({
        precio: price.toFixed(2),
        usdtDisponible: totalUsdt.toFixed(2)
    }));
    
    return result;
}

/**
 * Creates and initializes the user DataTable
 * @param {Array} data - Processed user data
 */
function createUserTable(data) {
    // Destroy existing table if it exists
    if (userTable) {
        userTable.destroy();
    }
    
    // Clear existing table body
    const tableBody = document.querySelector('#userTable tbody');
    tableBody.innerHTML = '';
    
    // Populate table with data
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.usuario}</td>
            <td>${row.precioPromedio}</td>
            <td>${row.usdtDisponible}</td>
        `;
        tableBody.appendChild(tr);
    });
    
    // Initialize DataTable
    userTable = $('#userTable').DataTable({
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        order: [[2, 'desc']], // Sort by USDT Available descending
        language: {
            search: "Buscar:",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 a 0 de 0 registros",
            infoFiltered: "(filtrado de _MAX_ registros totales)",
            paginate: {
                first: "Primero",
                last: "Último",
                next: "Siguiente",
                previous: "Anterior"
            },
            emptyTable: "No hay datos disponibles"
        },
        columnDefs: [
            {
                targets: [1, 2], // Price and USDT columns
                type: 'num',
                render: function(data, type, row) {
                    if (type === 'display') {
                        return parseFloat(data).toLocaleString('es-ES', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                    }
                    return data;
                }
            }
        ]
    });
}

/**
 * Creates and initializes the price DataTable
 * @param {Array} data - Processed price data
 */
function createPriceTable(data) {
    // Destroy existing table if it exists
    if (priceTable) {
        priceTable.destroy();
    }
    
    // Clear existing table body
    const tableBody = document.querySelector('#priceTable tbody');
    tableBody.innerHTML = '';
    
    // Populate table with data
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.precio}</td>
            <td>${row.usdtDisponible}</td>
        `;
        tableBody.appendChild(tr);
    });
    
    // Initialize DataTable
    priceTable = $('#priceTable').DataTable({
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        order: [[0, 'asc']], // Sort by Price ascending
        language: {
            search: "Buscar:",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 a 0 de 0 registros",
            infoFiltered: "(filtrado de _MAX_ registros totales)",
            paginate: {
                first: "Primero",
                last: "Último",
                next: "Siguiente",
                previous: "Anterior"
            },
            emptyTable: "No hay datos disponibles"
        },
        columnDefs: [
            {
                targets: [0, 1], // Both columns are numeric
                type: 'num',
                render: function(data, type, row) {
                    if (type === 'display') {
                        return parseFloat(data).toLocaleString('es-ES', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                    }
                    return data;
                }
            }
        ]
    });
}

/**
 * Shows or hides the loading indicator
 * @param {boolean} show - Whether to show the loading indicator
 */
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    const containerElement = document.querySelector('.container');
    
    if (show) {
        loadingElement.style.display = 'block';
        containerElement.style.display = 'none';
    } else {
        loadingElement.style.display = 'none';
        containerElement.style.display = 'block';
    }
}

/**
 * Shows or hides the error message
 * @param {boolean} show - Whether to show the error message
 */
function showError(show) {
    const errorElement = document.getElementById('error');
    const containerElement = document.querySelector('.container');
    
    if (show) {
        errorElement.style.display = 'block';
        containerElement.style.display = 'none';
    } else {
        errorElement.style.display = 'none';
        containerElement.style.display = 'block';
    }
}

/**
 * Utility function to refresh data (can be called externally)
 */
function refreshData() {
    loadAndProcessData();
}