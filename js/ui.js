// js/ui.js
// Sistema de UI y Microinteracciones - Canada Coin
// Modales, notificaciones, loaders y componentes de interfaz

class UIManager {
    constructor() {
        this.activeModals = new Set();
        this.notificationQueue = [];
        this.isShowingNotification = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initModals();
        this.initNotifications();
        this.initSidebar();
    }

    setupEventListeners() {
        // Global click handler for modals
        document.addEventListener('click', (e) => {
            // Handle modal close buttons
            if (e.target.matches('[data-modal-close]') || e.target.closest('[data-modal-close]')) {
                const modalId = e.target.getAttribute('data-modal-close') || 
                               e.target.closest('[data-modal-close]').getAttribute('data-modal-close');
                this.closeModal(modalId);
            }

            // Handle sidebar toggle
            if (e.target.matches('#sidebar-toggle') || e.target.closest('#sidebar-toggle')) {
                this.toggleSidebar();
            }

            // Handle sidebar close
            if (e.target.matches('#sidebar-close') || e.target.closest('#sidebar-close')) {
                this.closeSidebar();
            }
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            // Close modals with ESC key
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    initModals() {
        // Initialize all modals
        const modals = document.querySelectorAll('.modal-backdrop');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    initNotifications() {
        // Ensure toast container exists
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
    }

    initSidebar() {
        // Initialize sidebar state based on screen size
        this.handleResize();
    }

    // Modal Management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn(`Modal ${modalId} not found`);
            return;
        }

        // Close other modals if needed
        if (this.activeModals.size > 0) {
            this.closeAllModals();
        }

        // Show modal
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        this.activeModals.add(modalId);

        // Disable body scroll
        document.body.style.overflow = 'hidden';

        // Emit event
        this.emitEvent('modalOpened', { modalId });
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('active');
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);

        this.activeModals.delete(modalId);

        // Re-enable body scroll if no more modals
        if (this.activeModals.size === 0) {
            document.body.style.overflow = '';
        }

        // Emit event
        this.emitEvent('modalClosed', { modalId });
    }

    closeAllModals() {
        this.activeModals.forEach(modalId => {
            this.closeModal(modalId);
        });
    }

    // Notification System
    showNotification(message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now().toString(),
            message,
            type,
            duration
        };

        this.notificationQueue.push(notification);
        this.processNotificationQueue();
    }

    processNotificationQueue() {
        if (this.isShowingNotification || this.notificationQueue.length === 0) {
            return;
        }

        this.isShowingNotification = true;
        const notification = this.notificationQueue.shift();
        this.displayNotification(notification);
    }

    displayNotification(notification) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${notification.type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${this.getNotificationTitle(notification.type)}</div>
                <div class="toast-message">${notification.message}</div>
            </div>
            <button class="toast-close" onclick="window.uiManager.removeNotification('${notification.id}')">
                <i class="fas fa-times"></i>
            </button>
        `;

        toast.setAttribute('data-notification-id', notification.id);
        toastContainer.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Auto remove after duration
        if (notification.duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification.id);
            }, notification.duration);
        }
    }

    removeNotification(notificationId) {
        const toast = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (!toast) return;

        toast.classList.remove('show');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.isShowingNotification = false;
            this.processNotificationQueue();
        }, 300);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    getNotificationTitle(type) {
        const titles = {
            success: 'Éxito',
            error: 'Error',
            warning: 'Advertencia',
            info: 'Información'
        };
        return titles[type] || 'Información';
    }

    // Sidebar Management
    toggleSidebar() {
        const sidebar = document.querySelector('.dashboard-sidebar');
        if (!sidebar) return;

        if (window.innerWidth <= 1024) {
            sidebar.classList.toggle('mobile-open');
        }
    }

    closeSidebar() {
        const sidebar = document.querySelector('.dashboard-sidebar');
        if (sidebar) {
            sidebar.classList.remove('mobile-open');
        }
    }

    handleResize() {
        const sidebar = document.querySelector('.dashboard-sidebar');
        if (!sidebar) return;

        if (window.innerWidth > 1024) {
            sidebar.classList.remove('mobile-open');
        }
    }

    // Loading States
    showGlobalLoading(message = 'Cargando...') {
        const loader = document.getElementById('global-loader');
        if (!loader) return;

        const loaderText = loader.querySelector('.loader-text');
        if (loaderText) {
            loaderText.textContent = message;
        }

        loader.style.display = 'flex';
    }

    hideGlobalLoading() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    showButtonLoading(button, text = 'Procesando...') {
        if (!button) return;

        button.setAttribute('data-original-text', button.innerHTML);
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    }

    hideButtonLoading(button) {
        if (!button) return;

        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.innerHTML = originalText;
        }
        button.disabled = false;
    }

    // Form Validation UI
    showFieldError(field, message) {
        if (!field) return;

        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        field.classList.add('is-invalid');
        formGroup.classList.add('has-error');

        let feedback = formGroup.querySelector('.form-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'form-feedback invalid';
            formGroup.appendChild(feedback);
        }

        feedback.textContent = message;
        feedback.style.display = 'block';
    }

    showFieldSuccess(field) {
        if (!field) return;

        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        formGroup.classList.remove('has-error');

        const feedback = formGroup.querySelector('.form-feedback');
        if (feedback) {
            feedback.style.display = 'none';
        }
    }

    resetFieldValidation(field) {
        if (!field) return;

        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        field.classList.remove('is-invalid', 'is-valid');
        formGroup.classList.remove('has-error');

        const feedback = formGroup.querySelector('.form-feedback');
        if (feedback) {
            feedback.style.display = 'none';
        }
    }

    // Animation Helpers
    fadeIn(element, duration = 300) {
        if (!element) return;

        element.style.opacity = '0';
        element.style.display = 'block';

        setTimeout(() => {
            element.style.transition = `opacity ${duration}ms ease-in-out`;
            element.style.opacity = '1';
        }, 10);
    }

    fadeOut(element, duration = 300) {
        if (!element) return;

        element.style.transition = `opacity ${duration}ms ease-in-out`;
        element.style.opacity = '0';

        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }

    slideToggle(element, duration = 300) {
        if (!element) return;

        if (element.style.display === 'none') {
            this.slideDown(element, duration);
        } else {
            this.slideUp(element, duration);
        }
    }

    slideDown(element, duration = 300) {
        if (!element) return;

        element.style.display = 'block';
        const height = element.offsetHeight;
        element.style.height = '0px';
        element.style.overflow = 'hidden';

        setTimeout(() => {
            element.style.transition = `height ${duration}ms ease-in-out`;
            element.style.height = height + 'px';
        }, 10);

        setTimeout(() => {
            element.style.height = '';
            element.style.overflow = '';
        }, duration + 10);
    }

    slideUp(element, duration = 300) {
        if (!element) return;

        const height = element.offsetHeight;
        element.style.height = height + 'px';
        element.style.overflow = 'hidden';

        setTimeout(() => {
            element.style.transition = `height ${duration}ms ease-in-out`;
            element.style.height = '0px';
        }, 10);

        setTimeout(() => {
            element.style.display = 'none';
            element.style.height = '';
            element.style.overflow = '';
        }, duration + 10);
    }

    // Utility Functions
    formatCurrency(amount, currency = 'USD', locale = 'es-MX') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    formatDate(date, locale = 'es-MX') {
        if (!date) return '';

        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(dateObj);
    }

    formatDateTime(date, locale = 'es-MX') {
        if (!date) return '';

        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(dateObj);
    }

    debounce(func, wait) {
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

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Event System
    emitEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    on(eventName, callback) {
        document.addEventListener(eventName, callback);
    }

    off(eventName, callback) {
        document.removeEventListener(eventName, callback);
    }

    // Theme Management
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('canada-coin-theme', theme);
    }

    getTheme() {
        return localStorage.getItem('canada-coin-theme') || 'light';
    }

    toggleTheme() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    // Language Management
    setLanguage(lang) {
        document.documentElement.setAttribute('lang', lang);
        localStorage.setItem('canada-coin-language', lang);
        // En una implementación real, aquí recargaríamos las traducciones
    }

    getLanguage() {
        return localStorage.getItem('canada-coin-language') || 'es';
    }

    // Responsive Helpers
    isMobile() {
        return window.innerWidth <= 768;
    }

    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    isDesktop() {
        return window.innerWidth > 1024;
    }
}

// Inicializar el manager de UI
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
    window.openModal = (modalId) => window.uiManager.openModal(modalId);
    window.closeModal = (modalId) => window.uiManager.closeModal(modalId);
    window.showNotification = (message, type, duration) => window.uiManager.showNotification(message, type, duration);
});

export default UIManager;