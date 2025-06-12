// ===== DOM ELEMENTS =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const backToTop = document.getElementById('backToTop');
const refreshBtn = document.getElementById('refreshDashboard');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const dashboardFrame = document.getElementById('dashboardFrame');
const powerBiFrame = document.getElementById('powerBiFrame');
const dashboardLoading = document.getElementById('dashboardLoading');

// Statistics counters
const statAds = document.getElementById('statAds');
const statCountries = document.getElementById('statCountries');
const statCurrencies = document.getElementById('statCurrencies');

// ===== NAVIGATION FUNCTIONALITY =====
// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===== NAVBAR SCROLL EFFECT =====
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add/remove scroll class for styling
    if (scrollTop > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Update active nav link based on scroll position
    updateActiveNavLink();
    
    // Show/hide back to top button
    if (scrollTop > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// ===== ACTIVE NAVIGATION LINK UPDATE =====
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop && 
            window.pageYOffset < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ===== BACK TO TOP FUNCTIONALITY =====
backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== DASHBOARD FUNCTIONALITY =====
// Dashboard view controls
document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        const view = btn.getAttribute('data-view');
        adjustDashboardView(view);
    });
});

function adjustDashboardView(view) {
    const frame = document.getElementById('dashboardFrame');
    
    if (view === 'mobile') {
        frame.style.maxWidth = '375px';
        frame.style.margin = '0 auto';
        frame.style.height = '667px';
    } else {
        frame.style.maxWidth = '100%';
        frame.style.margin = '0';
        frame.style.height = '800px';
    }
}

// Refresh dashboard
refreshBtn.addEventListener('click', () => {
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Actualizando...';
    refreshBtn.disabled = true;
    
    // Show loading state
    dashboardLoading.style.display = 'flex';
    
    // Simulate refresh (reload iframe)
    setTimeout(() => {
        if (powerBiFrame.src) {
            powerBiFrame.src = powerBiFrame.src;
        }
        
        setTimeout(() => {
            dashboardLoading.style.display = 'none';
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar';
            refreshBtn.disabled = false;
        }, 2000);
    }, 500);
});

// Fullscreen functionality
let isFullscreen = false;

fullscreenBtn.addEventListener('click', () => {
    toggleFullscreen();
});

function toggleFullscreen() {
    if (!isFullscreen) {
        dashboardFrame.classList.add('fullscreen');
        fullscreenBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i> Salir';
        isFullscreen = true;
        
        // Add escape key listener
        document.addEventListener('keydown', handleEscapeKey);
    } else {
        exitFullscreen();
    }
}

function exitFullscreen() {
    dashboardFrame.classList.remove('fullscreen');
    fullscreenBtn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i> Pantalla Completa';
    isFullscreen = false;
    
    // Remove escape key listener
    document.removeEventListener('keydown', handleEscapeKey);
}

function handleEscapeKey(e) {
    if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
    }
}

// ===== STATISTICS ANIMATION =====
function animateCounter(element, start, end, duration) {
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current.toLocaleString();
        
        if (current === end) {
            clearInterval(timer);
        }
    }, stepTime);
}

// Initialize counters when page loads
window.addEventListener('load', () => {
    // Animate statistics counters
    setTimeout(() => {
        animateCounter(statAds, 0, 15840, 2000);
        animateCounter(statCountries, 0, 47, 1500);
        animateCounter(statCurrencies, 0, 23, 1000);
    }, 1000);
});

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-scroll');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.feature-item, .stat-card, .timeline-item, .crypto-card'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});

// ===== IFRAME LOADING HANDLER =====
powerBiFrame.addEventListener('load', () => {
    setTimeout(() => {
        dashboardLoading.style.display = 'none';
    }, 1000);
});

// Handle iframe load error
powerBiFrame.addEventListener('error', () => {
    dashboardLoading.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--error-color); margin-bottom: 1rem;"></i>
            <h3>Error al cargar el dashboard</h3>
            <p>Verifica la URL de Power BI y la configuración de permisos</p>
            <button onclick="location.reload()" class="retry-btn">
                <i class="fas fa-redo"></i> Reintentar
            </button>
        </div>
    `;
});

// ===== THEME DETECTION =====
function detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        document.body.classList.add('light-theme');
    }
}

// Listen for theme changes
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
        if (e.matches) {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    });
}

// ===== PERFORMANCE OPTIMIZATION =====
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll event
const optimizedScrollHandler = debounce(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    updateActiveNavLink();
    
    if (scrollTop > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
}, 10);

window.addEventListener('scroll', optimizedScrollHandler);

// ===== ACCESSIBILITY ENHANCEMENTS =====
// Keyboard navigation for dashboard controls
document.querySelectorAll('.control-btn, .refresh-btn, .fullscreen-btn').forEach(btn => {
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btn.click();
        }
    });
});

// Focus management for mobile menu
navToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navToggle.click();
    }
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    
    // Show user-friendly error message for critical errors
    if (e.error && e.error.message.includes('PowerBI')) {
        showNotification('Error en el dashboard. Intenta actualizar la página.', 'error');
    }
});

// ===== UTILITY FUNCTIONS =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    detectSystemTheme();
    
    // Show loading state initially
    dashboardLoading.style.display = 'flex';
    
    // Add loading animation to crypto cards
    document.querySelectorAll('.crypto-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.5}s`;
    });
    
    // Initialize tooltips (if needed)
    initializeTooltips();
    
    console.log('Dashboard site initialized successfully!');
});

function initializeTooltips() {
    // Simple tooltip implementation
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.getAttribute('data-tooltip');
    
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    
    setTimeout(() => tooltip.classList.add('show'), 10);
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// ===== PWA FUNCTIONALITY (OPTIONAL) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}