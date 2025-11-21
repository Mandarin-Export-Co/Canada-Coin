// libs/fontawesome.js
// Cargador principal de Font Awesome para Canada Coin

(function() {
    'use strict';

    const FontAwesomeManager = {
        config: {
            version: '6.4.0',
            cdnUrl: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
            integrity: 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==',
            crossOrigin: 'anonymous'
        },

        initialized: false,

        init: function() {
            if (this.initialized) return;

            this.loadCSS();
            this.setupGlobalMethods();
            this.initialized = true;

            console.log('FontAwesome Manager initialized');
        },

        loadCSS: function() {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = this.config.cdnUrl;
            link.integrity = this.config.integrity;
            link.crossOrigin = this.config.crossOrigin;
            link.referrerPolicy = 'no-referrer';

            link.onload = () => this.onCSSLoaded();
            link.onerror = () => this.onCSSLoadError();

            document.head.appendChild(link);
        },

        onCSSLoaded: function() {
            console.log('Font Awesome CSS loaded successfully');
            this.dispatchEvent('fa-loaded');
        },

        onCSSLoadError: function() {
            console.error('Failed to load Font Awesome CSS');
            this.dispatchEvent('fa-load-error');
        },

        setupGlobalMethods: function() {
            // Método global para crear íconos
            window.createIcon = (iconName, options = {}) => {
                return this.createIconElement(iconName, options);
            };

            // Método global para verificar ícono
            window.hasIcon = (iconName) => {
                return this.iconExists(iconName);
            };

            // Método global para obtener HTML de ícono
            window.getIconHTML = (iconName, classes = '') => {
                return this.getIconHTML(iconName, classes);
            };
        },

        createIconElement: function(iconName, options = {}) {
            const defaults = {
                type: 'solid', // solid, regular, light, thin, duotone, brands
                size: '',
                color: '',
                spin: false,
                pulse: false,
                border: false,
                pull: '', // left, right
                rotate: '', // 90, 180, 270
                flip: '', // horizontal, vertical
                animation: '',
                fixedWidth: false,
                classes: ''
            };

            const settings = { ...defaults, ...options };
            const icon = document.createElement('i');

            // Clase base
            let baseClass = 'fa-';
            switch(settings.type) {
                case 'regular': baseClass = 'far fa-'; break;
                case 'light': baseClass = 'fal fa-'; break;
                case 'thin': baseClass = 'fat fa-'; break;
                case 'duotone': baseClass = 'fad fa-'; break;
                case 'brands': baseClass = 'fab fa-'; break;
                default: baseClass = 'fas fa-'; // solid
            }

            let classNames = baseClass + iconName;

            // Añadir clases adicionales
            if (settings.size) classNames += ' fa-' + settings.size;
            if (settings.spin) classNames += ' fa-spin';
            if (settings.pulse) classNames += ' fa-pulse';
            if (settings.border) classNames += ' fa-border';
            if (settings.pull) classNames += ' fa-pull-' + settings.pull;
            if (settings.rotate) classNames += ' fa-rotate-' + settings.rotate;
            if (settings.flip) classNames += ' fa-flip-' + settings.flip;
            if (settings.animation) classNames += ' fa-' + settings.animation;
            if (settings.fixedWidth) classNames += ' fa-fw';
            if (settings.classes) classNames += ' ' + settings.classes;

            icon.className = classNames;

            // Estilos inline
            if (settings.color) {
                icon.style.color = settings.color;
            }

            return icon;
        },

        iconExists: function(iconName) {
            const knownIcons = [
                // Dashboard
                'chart-line', 'money-bill-wave', 'wallet', 'credit-card', 'exchange-alt',
                'users', 'qrcode', 'copy', 'share-alt', 'cog', 'bell', 'sign-out-alt',
                
                // Transacciones
                'plus', 'minus', 'upload', 'download', 'check-circle', 'times-circle',
                'exclamation-triangle', 'info-circle', 'lock', 'unlock',
                
                // Navegación
                'home', 'chart-bar', 'history', 'user-check', 'file-invoice-dollar',
                'hand-holding-usd', 'piggy-bank', 'rocket', 'shield-alt',
                
                // Técnicos
                'database', 'cloud-upload-alt', 'sync', 'spinner', 'wifi', 'server',
                
                // Comunes
                'envelope', 'phone', 'map-marker-alt', 'globe', 'calendar-alt',
                'search', 'filter', 'sort', 'sort-up', 'sort-down',
                'chevron-right', 'chevron-left', 'chevron-up', 'chevron-down',
                'bars', 'times', 'eye', 'eye-slash', 'trash', 'edit', 'save',
                'print', 'download', 'upload', 'link', 'external-link-alt'
            ];

            return knownIcons.includes(iconName);
        },

        getIconHTML: function(iconName, classes = '') {
            if (this.iconExists(iconName)) {
                return `<i class="fas fa-${iconName} ${classes}"></i>`;
            }
            return `<i class="fas fa-question-circle ${classes}"></i>`;
        },

        dispatchEvent: function(eventName, detail = {}) {
            const event = new CustomEvent(eventName, { detail });
            document.dispatchEvent(event);
        },

        // Método para cargar íconos dinámicamente
        loadIcon: function(iconName, container, options = {}) {
            if (typeof container === 'string') {
                container = document.querySelector(container);
            }

            if (container && this.iconExists(iconName)) {
                const icon = this.createIconElement(iconName, options);
                container.innerHTML = '';
                container.appendChild(icon);
                return icon;
            }

            return null;
        }
    };

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => FontAwesomeManager.init());
    } else {
        FontAwesomeManager.init();
    }

    // Exportar para uso global
    window.FontAwesomeManager = FontAwesomeManager;
})();