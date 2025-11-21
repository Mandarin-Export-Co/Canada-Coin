// assets/icons/fontawesome/fontawesome-config.js
// Configuración local de Font Awesome para Canada Coin

class FontAwesomeLoader {
    constructor() {
        this.loaded = false;
        this.init();
    }

    init() {
        if (!this.loaded) {
            // Crear elemento link para los estilos
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            link.integrity = 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==';
            link.crossOrigin = 'anonymous';
            link.referrerPolicy = 'no-referrer';
            
            document.head.appendChild(link);
            this.loaded = true;
            
            console.log('Font Awesome loaded successfully');
        }
    }

    // Método para verificar si un ícono existe
    iconExists(iconName) {
        const icons = [
            'user', 'chart-line', 'money-bill-wave', 'wallet', 'credit-card',
            'exchange-alt', 'users', 'qrcode', 'copy', 'share-alt',
            'cog', 'bell', 'sign-out-alt', 'plus', 'minus',
            'upload', 'download', 'check-circle', 'times-circle', 'exclamation-triangle',
            'info-circle', 'lock', 'unlock', 'eye', 'eye-slash',
            'envelope', 'phone', 'map-marker-alt', 'globe', 'calendar-alt',
            'search', 'filter', 'sort', 'sort-up', 'sort-down',
            'chevron-right', 'chevron-left', 'chevron-up', 'chevron-down',
            'bars', 'times', 'home', 'chart-bar', 'history',
            'user-check', 'file-invoice-dollar', 'hand-holding-usd', 'piggy-bank', 'rocket',
            'shield-alt', 'database', 'cloud-upload-alt', 'sync', 'spinner'
        ];
        return icons.includes(iconName);
    }

    // Método para obtener el HTML de un ícono
    getIcon(iconName, additionalClasses = '') {
        if (this.iconExists(iconName)) {
            return `<i class="fas fa-${iconName} ${additionalClasses}"></i>`;
        }
        return `<i class="fas fa-question-circle ${additionalClasses}"></i>`;
    }
}

// Instancia global
const fontAwesome = new FontAwesomeLoader();

// Función global para usar Font Awesome
window.getFAIcon = (iconName, classes = '') => fontAwesome.getIcon(iconName, classes);