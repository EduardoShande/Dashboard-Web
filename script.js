// Dashboard P2P Binance Bolivia - JavaScript
// Author: Dashboard Analytics Team
// Version: 1.0.0

class P2PDashboard {
    constructor() {
        this.config = {
            powerBIUrl: '', // Aquí pondrás la URL de tu Power BI
            refreshInterval: 300000, // 5 minutos en milisegundos
            theme: 'light',
            isFullscreen: false,
            lastUpdate: null
        };
        
        this.elements = {
            // Navigation
            themeToggle: document.getElementById('themeToggle'),
            mobileToggle: document.getElementById('mobileToggle'),
            navLinks: document.querySelectorAll('.nav-link'),
            
            // Dashboard
            dashboardFrame: document.getElementById('dashboardFrame'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            refreshBtn: document.getElementById('refreshBtn'),
            fullscreenBtn: document.getElementById('fullscreenBtn'),
            
            // Stats
            totalAds: document.getElementById('totalAds'),
            lastUpdate: document.getElementById('lastUpdate'),
            buyPriceRange: document.getElementById('buyPriceRange'),
            sellPriceRange: document.getElementById('sellPriceRange'),
            buyAvgPrice: document.getElementById('buyAvgPrice'),
            sellAvgPrice: document.getElementById('sellAvgPrice')
        };
        
        this.mockData = {
            totalAds: 0,
            buyOrders: [],
            sellOrders: [],
            lastUpdate: new Date()
        };
        
        this.init();
    }
    
    init() {
        this.loadTheme();
        this.bindEvents();
        this.initNavigation();
        this.loadMockData();
        this.setupDashboard();
        this.startAutoRefresh();
        this.initAnimations();
        
        console.log('P2P Dashboard initialized successfully');
    }
    
    // Theme Management
    loadTheme() {
        const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
        this.config.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        if (this.elements.themeToggle) {
            const icon = this.elements.themeToggle.querySelector('i');
            if (icon) {
                icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }
    
    toggleTheme() {
        const newTheme = this.config.theme === 'light' ? 'dark' : 'light';
        this.config.theme = newTheme;
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('dashboard-theme', newTheme);
        
        const icon = this.elements.themeToggle.querySelector('i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        this.showNotification(`Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'success');
    }
    
    // Event Binding
    bindEvents() {
        // Theme toggle
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Mobile menu toggle
        if (this.elements.mobileToggle) {
            this.elements.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        // Dashboard controls
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }
        
        if (this.elements.fullscreenBtn) {
            this.elements.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        
        // Smooth scrolling for navigation links
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });
        
        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Dashboard iframe events
        if (this.elements.dashboardFrame) {
            this.elements.dashboardFrame.addEventListener('load', () => this.onDashboardLoad());
            this.elements.dashboardFrame.addEventListener('error', () => this.onDashboardError());
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    // Navigation
    initNavigation() {
        this.updateActiveNavLink();
    }
    
    handleNavClick(e) {
        const href = e.target.getAttribute('href');
        
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                this.scrollToElement(targetElement);
                this.updateActiveNavLink(e.target);
            }
        }
    }
    
    updateActiveNavLink(activeLink = null) {
        this.elements.navLinks.forEach(link => link.classList.remove('active'));
        
        if (activeLink) {
            activeLink.classList.add('active');
        } else {
            // Determine active section based on scroll position
            const sections = ['dashboard', 'about', 'data'];
            const scrollPosition = window.scrollY + 100;
            
            for (const sectionId of sections) {
                const section = document.getElementById(sectionId);
                if (section) {
                    const sectionTop = section.offsetTop;
                    const sectionBottom = sectionTop + section.offsetHeight;
                    
                    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                        const correspondingLink = document.querySelector(`[href="#${sectionId}"]`);
                        if (correspondingLink) {
                            correspondingLink.classList.add('active');
                        }
                        break;
                    }
                }
            }
        }
    }
    
    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.classList.toggle('mobile-open');
        }
        
        // Animate hamburger menu
        const spans = this.elements.mobileToggle.querySelectorAll('span');
        spans.forEach((span, index) => {
            span.style.transform = navMenu.classList.contains('mobile-open') 
                ? `rotate(${index === 1 ? 45 : index === 0 ? 45 : -45}deg) translateY(${index === 1 ? 0 : index === 0 ? 7 : -7}px)`
                : 'none';
        });
    }
    
    scrollToElement(element) {
        const offsetTop = element.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
    
    // Dashboard Management
    setupDashboard() {
        // Configurar la URL del iframe de Power BI
        // IMPORTANTE: Reemplaza esta URL con la URL real de tu Power BI embebido
        const powerBIUrl = this.config.powerBIUrl || 'about:blank';
        
        if (powerBIUrl !== 'about:blank') {
            this.loadDashboard(powerBIUrl);
        } else {
            // Mostrar mensaje de configuración pendiente
            this.showDashboardPlaceholder();
        }
    }
    
    loadDashboard(url) {
        if (!this.elements.dashboardFrame) return;
        
        this.showLoading(true);
        this.elements.dashboardFrame.src = url;
        
        // Timeout para manejar casos donde el iframe no carga
        setTimeout(() => {
            if (this.elements.loadingOverlay && !this.elements.loadingOverlay.classList.contains('hidden')) {
                this.onDashboardError();
            }
        }, 30000); // 30 segundos timeout
    }
    
    showDashboardPlaceholder() {
        const placeholder = document.createElement('div');
        placeholder.className = 'dashboard-placeholder';
        placeholder.innerHTML = `
            <div class="placeholder-content">
                <i class="fas fa-chart-line"></i>
                <h3>Dashboard Listo para Configurar</h3>
                <p>Para ver tu dashboard de Power BI, actualiza la variable <code>powerBIUrl</code> en el archivo JavaScript con la URL de tu Power BI embebido.</p>
                <div class="placeholder-steps">
                    <div class="step">
                        <span class="step-number">1</span>
                        <span>Obtén la URL de tu Power BI embebido</span>
                    </div>
                    <div class="step">
                        <span class="step-number">2</span>
                        <span>Actualiza <code>config.powerBIUrl</code> en script.js</span>
                    </div>
                    <div class="step">
                        <span class="step-number">3</span>
                        <span>Recarga la página</span>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar estilos dinámicamente
        const style = document.createElement('style');
        style.textContent = `
            .dashboard-placeholder {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                background: var(--bg-secondary);
                border-radius: var(--border-radius);
            }
            .placeholder-content {
                text-align: center;
                max-width: 600px;
                padding: var(--spacing-xl);
            }
            .placeholder-content i {
                font-size: 4rem;
                color: var(--primary-color);
                margin-bottom: var(--spacing-lg);
            }
            .placeholder-content h3 {
                font-size: var(--font-size-2xl);
                margin-bottom: var(--spacing-md);
                color: var(--text-primary);
            }
            .placeholder-content p {
                font-size: var(--font-size-lg);
                color: var(--text-secondary);
                margin-bottom: var(--spacing-xl);
                line-height: 1.6;
            }
            .placeholder-steps {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
                text-align: left;
            }
            .step {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                padding: var(--spacing-md);
                background: var(--bg-primary);
                border-radius: var(--border-radius-sm);
                border: 1px solid var(--border-color);
            }
            .step-number {
                width: 32px;
                height: 32px;
                background: var(--primary-color);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                flex-shrink: 0;
            }
            code {
                background: var(--bg-tertiary);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 0.9em;
                color: var(--primary-color);
            }
        `;
        document.head.appendChild(style);
        
        this.elements.dashboardFrame.style.display = 'none';
        this.elements.dashboardFrame.parentNode.appendChild(placeholder);
        this.showLoading(false);
    }
    
    onDashboardLoad() {
        this.showLoading(false);
        this.config.lastUpdate = new Date();
        this.updateLastUpdateTime();
        console.log('✅ Dashboard loaded successfully');
    }
    
    onDashboardError() {
        this.showLoading(false);
        this.showNotification('Error al cargar el dashboard', 'error');
        console.error('❌ Dashboard failed to load');
    }
    
    refreshDashboard() {
        if (!this.elements.dashboardFrame || !this.config.powerBIUrl) return;
        
        this.showNotification('Actualizando dashboard...', 'info');
        this.elements.refreshBtn.querySelector('i').classList.add('fa-spin');
        
        // Reload iframe
        this.elements.dashboardFrame.src = this.elements.dashboardFrame.src;
        
        setTimeout(() => {
            if (this.elements.refreshBtn) {
                this.elements.refreshBtn.querySelector('i').classList.remove('fa-spin');
            }
        }, 2000);
    }
    
    toggleFullscreen() {
        const dashboardContainer = document.querySelector('.dashboard-container');
        
        if (!this.config.isFullscreen) {
            if (dashboardContainer.requestFullscreen) {
                dashboardContainer.requestFullscreen();
            } else if (dashboardContainer.webkitRequestFullscreen) {
                dashboardContainer.webkitRequestFullscreen();
            } else if (dashboardContainer.msRequestFullscreen) {
                dashboardContainer.msRequestFullscreen();
            }
            
            this.config.isFullscreen = true;
            this.elements.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> Salir';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            
            this.config.isFullscreen = false;
            this.elements.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Pantalla Completa';
        }
    }
    
    // Data Management
    loadMockData() {
        // Simular datos para mostrar en las estadísticas mientras no hay datos reales
        this.mockData = {
            totalAds: Math.floor(Math.random() * 500) + 100,
            buyOrders: this.generateMockOrders('buy', 50),
            sellOrders: this.generateMockOrders('sell', 45),
            lastUpdate: new Date()
        };
        
        this.updateStats();
    }
    
    generateMockOrders(type, count) {
        const orders = [];
        const basePrice = 6.96; // Precio base aproximado BOB/USD
        
        for (let i = 0; i < count; i++) {
            const variation = (Math.random() - 0.5) * 0.2;
            const price = basePrice + variation;
            
            orders.push({
                type: type,
                price: price,
                amount: Math.random() * 1000 + 100,
                currency: Math.random() > 0.5 ? 'USDT' : 'USDC'
            });
        }
        
        return orders.sort((a, b) => type === 'buy' ? b.price - a.price : a.price - b.price);
    }
    
    updateStats() {
        // Actualizar total de anuncios
        // if (this.elements.totalAds) {
        //     this.animateNumber(this.elements.totalAds, this.mockData.totalAds);
        // }
        
        // Actualizar rangos de precios
        if (this.mockData.buyOrders.length > 0) {
            const buyPrices = this.mockData.buyOrders.map(order => order.price);
            const buyMin = Math.min(...buyPrices);
            const buyMax = Math.max(...buyPrices);
            const buyAvg = buyPrices.reduce((a, b) => a + b, 0) / buyPrices.length;
            
            if (this.elements.buyPriceRange) {
                this.elements.buyPriceRange.textContent = `${buyMin.toFixed(2)} - ${buyMax.toFixed(2)} BOB`;
            }
            if (this.elements.buyAvgPrice) {
                this.elements.buyAvgPrice.textContent = `${buyAvg.toFixed(2)} BOB`;
            }
        }
        
        if (this.mockData.sellOrders.length > 0) {
            const sellPrices = this.mockData.sellOrders.map(order => order.price);
            const sellMin = Math.min(...sellPrices);
            const sellMax = Math.max(...sellPrices);
            const sellAvg = sellPrices.reduce((a, b) => a + b, 0) / sellPrices.length;
            
            if (this.elements.sellPriceRange) {
                this.elements.sellPriceRange.textContent = `${sellMin.toFixed(2)} - ${sellMax.toFixed(2)} BOB`;
            }
            if (this.elements.sellAvgPrice) {
                this.elements.sellAvgPrice.textContent = `${sellAvg.toFixed(2)} BOB`;
            }
        }
        
        this.updateLastUpdateTime();
    }
    
    updateLastUpdateTime() {
        if (this.elements.lastUpdate) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('es-BO', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
            });
            this.elements.lastUpdate.textContent = timeString;
        }
    }
    
    // Utility Functions
    animateNumber(element, targetNumber, duration = 1000) {
        const startNumber = 0;
        const increment = targetNumber / (duration / 16);
        let currentNumber = startNumber;
        
        const timer = setInterval(() => {
            currentNumber += increment;
            if (currentNumber >= targetNumber) {
                element.textContent = targetNumber;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(currentNumber);
            }
        }, 16);
    }
    
    showLoading(show) {
        if (this.elements.loadingOverlay) {
            if (show) {
                this.elements.loadingOverlay.classList.remove('hidden');
            } else {
                this.elements.loadingOverlay.classList.add('hidden');
            }
        }
    }
    
    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Agregar estilos si no existen
        this.addNotificationStyles();
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Mostrar con animación
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => this.removeNotification(notification), 5000);
        
        // Evento para cerrar manualmente
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
    
    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    addNotificationStyles() {
        if (document.querySelector('#notification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-lg);
                padding: var(--spacing-md);
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 500px;
                z-index: 10000;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease;
            }
            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                flex: 1;
            }
            .notification-success {
                border-left: 4px solid var(--success-color);
            }
            .notification-success .notification-content i {
                color: var(--success-color);
            }
            .notification-error {
                border-left: 4px solid var(--danger-color);
            }
            .notification-error .notification-content i {
                color: var(--danger-color);
            }
            .notification-warning {
                border-left: 4px solid var(--warning-color);
            }
            .notification-warning .notification-content i {
                color: var(--warning-color);
            }
            .notification-info {
                border-left: 4px solid var(--accent-color);
            }
            .notification-info .notification-content i {
                color: var(--accent-color);
            }
            .notification-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            .notification-close:hover {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Auto-refresh functionality
    startAutoRefresh() {
        setInterval(() => {
            this.loadMockData(); // En producción, aquí cargarías datos reales
            console.log('🔄 Auto-refresh executed');
        }, this.config.refreshInterval);
    }
    
    // Event Handlers
    handleResize() {
        // Ajustar comportamientos según el tamaño de pantalla
        if (window.innerWidth <= 768) {
            // Comportamiento móvil
            this.closeMobileMenuOnResize();
        }
    }
    
    handleScroll() {
        this.updateActiveNavLink();
        this.handleNavbarOnScroll();
    }
    
    handleNavbarOnScroll() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }
    
    closeMobileMenuOnResize() {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && navMenu.classList.contains('mobile-open')) {
            navMenu.classList.remove('mobile-open');
        }
    }
    
    handleKeyboard(e) {
        // Atajos de teclado
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'r':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.refreshDashboard();
                    }
                    break;
                case 'f':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.toggleFullscreen();
                    }
                    break;
                case 'd':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.toggleTheme();
                    }
                    break;
            }
        }
        
        // Escape para salir de pantalla completa
        if (e.key === 'Escape' && this.config.isFullscreen) {
            this.toggleFullscreen();
        }
    }
    
    // Animation utilities
    initAnimations() {
        // Intersection Observer para animaciones al scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);
        
        // Observar elementos que queremos animar
        const elementsToAnimate = document.querySelectorAll(
            '.market-card, .data-card, .stat-card, .about-content > *'
        );
        
        elementsToAnimate.forEach(el => observer.observe(el));
    }
    
    // Public methods for external access
    updatePowerBIUrl(url) {
        this.config.powerBIUrl = url;
        this.setupDashboard();
    }
    
    getConfig() {
        return { ...this.config };
    }
    
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia global del dashboard
    window.p2pDashboard = new P2PDashboard();
    
    // Agregar información de desarrollo a la consola
    console.log(`
    🚀 P2P Dashboard Bolivia v1.0.0
    
    📊 Dashboard Features:
    • Tema claro/oscuro automático
    • Responsive design
    • Auto-refresh cada 5 minutos
    • Notificaciones en tiempo real
    • Atajos de teclado
    
    ⌨️  Keyboard Shortcuts:
    • Ctrl+Shift+R: Refresh dashboard
    • Ctrl+Shift+F: Toggle fullscreen
    • Ctrl+Shift+D: Toggle dark/light theme
    • Escape: Exit fullscreen
    
    🔧 Configuration:
    • Update powerBIUrl in config to load your Power BI dashboard
    • Modify refreshInterval to change auto-refresh timing
    
    📱 Contact: Dashboard Analytics Team
    `);
});

// Configuración global para desarrollo
window.dashboardConfig = {
    // IMPORTANTE: Actualiza esta URL con tu URL de Power BI
    powerBIUrl: '', // Ejemplo: 'https://app.powerbi.com/reportEmbed?reportId=YOUR_REPORT_ID&autoAuth=true&ctid=YOUR_TENANT_ID'
    
    // Configuraciones adicionales
    refreshInterval: 300000, // 5 minutos
    enableNotifications: true,
    enableKeyboardShortcuts: true,
    enableAutoRefresh: true
};

// Función helper para actualizar la URL de Power BI desde la consola
window.updatePowerBIUrl = function(url) {
    if (window.p2pDashboard) {
        window.p2pDashboard.updatePowerBIUrl(url);
        console.log('✅ Power BI URL updated successfully');
    } else {
        console.error('❌ Dashboard not initialized');
    }
};

// Export para uso en módulos (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = P2PDashboard;
}