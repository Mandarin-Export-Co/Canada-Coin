// js/formatters.js
// Sistema de Formateo - Canada Coin
// Formato de fechas, números, monedas y datos

class Formatters {
    constructor() {
        this.locale = 'es-MX';
        this.currency = 'USD';
        this.timezone = 'America/Toronto';
        this.init();
    }

    init() {
        // Detectar locale del navegador
        this.detectLocale();
        // Configurar timezone
        this.setupTimezone();
    }

    detectLocale() {
        const storedLocale = localStorage.getItem('canada-coin-locale');
        if (storedLocale) {
            this.locale = storedLocale;
        } else {
            this.locale = navigator.language || 'es-MX';
        }
    }

    setupTimezone() {
        // Podría detectar timezone del usuario
        this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    // Formateo de monedas
    formatCurrency(amount, currency = this.currency, locale = this.locale) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '$0.00';
        }

        const options = {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        };

        try {
            return new Intl.NumberFormat(locale, options).format(amount);
        } catch (error) {
            console.warn('Error formateando moneda:', error);
            return `$${parseFloat(amount).toFixed(2)}`;
        }
    }

    formatCurrencyCompact(amount, currency = this.currency, locale = this.locale) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '$0';
        }

        const absAmount = Math.abs(amount);
        let formatted;

        if (absAmount >= 1000000) {
            formatted = (amount / 1000000).toFixed(1) + 'M';
        } else if (absAmount >= 1000) {
            formatted = (amount / 1000).toFixed(1) + 'K';
        } else {
            formatted = this.formatCurrency(amount, currency, locale);
            return formatted.replace(/(\.|,)00$/g, ''); // Remover .00
        }

        return `${formatted} ${currency}`;
    }

    // Formateo de números
    formatNumber(number, options = {}) {
        if (number === null || number === undefined || isNaN(number)) {
            return '0';
        }

        const defaultOptions = {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
            useGrouping: true
        };

        const mergedOptions = { ...defaultOptions, ...options };

        try {
            return new Intl.NumberFormat(this.locale, mergedOptions).format(number);
        } catch (error) {
            console.warn('Error formateando número:', error);
            return number.toString();
        }
    }

    formatPercentage(value, decimals = 2) {
        if (value === null || value === undefined || isNaN(value)) {
            return '0%';
        }

        const formatted = parseFloat(value).toFixed(decimals);
        return `${formatted}%`;
    }

    // Formateo de fechas
    formatDate(date, options = {}) {
        if (!date) return '';

        const dateObj = this.parseDate(date);
        if (!dateObj) return '';

        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };

        const mergedOptions = { ...defaultOptions, ...options };

        try {
            return new Intl.DateTimeFormat(this.locale, mergedOptions).format(dateObj);
        } catch (error) {
            console.warn('Error formateando fecha:', error);
            return dateObj.toLocaleDateString();
        }
    }

    formatDateTime(date, options = {}) {
        if (!date) return '';

        const dateObj = this.parseDate(date);
        if (!dateObj) return '';

        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };

        const mergedOptions = { ...defaultOptions, ...options };

        try {
            return new Intl.DateTimeFormat(this.locale, mergedOptions).format(dateObj);
        } catch (error) {
            console.warn('Error formateando fecha/hora:', error);
            return dateObj.toLocaleString();
        }
    }

    formatTime(date, options = {}) {
        if (!date) return '';

        const dateObj = this.parseDate(date);
        if (!dateObj) return '';

        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: options.showSeconds ? '2-digit' : undefined
        };

        const mergedOptions = { ...defaultOptions, ...options };

        try {
            return new Intl.DateTimeFormat(this.locale, mergedOptions).format(dateObj);
        } catch (error) {
            console.warn('Error formateando hora:', error);
            return dateObj.toLocaleTimeString();
        }
    }

    // Formateo relativo (hace x tiempo)
    formatRelativeTime(date) {
        if (!date) return '';

        const dateObj = this.parseDate(date);
        if (!dateObj) return '';

        const now = new Date();
        const diffInMs = now - dateObj;
        const diffInSeconds = Math.floor(diffInMs / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInSeconds < 0) {
            return 'en el futuro';
        } else if (diffInSeconds < 60) {
            return 'hace un momento';
        } else if (diffInMinutes < 60) {
            return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
        } else if (diffInHours < 24) {
            return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
        } else if (diffInDays < 7) {
            return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
        } else if (diffInDays < 30) {
            const weeks = Math.floor(diffInDays / 7);
            return `hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
        } else if (diffInDays < 365) {
            const months = Math.floor(diffInDays / 30);
            return `hace ${months} mes${months > 1 ? 'es' : ''}`;
        } else {
            const years = Math.floor(diffInDays / 365);
            return `hace ${years} año${years > 1 ? 's' : ''}`;
        }
    }

    // Formateo de duración
    formatDuration(seconds) {
        if (!seconds || seconds < 0) return '0s';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const parts = [];

        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

        return parts.join(' ');
    }

    // Formateo de nombres
    formatName(firstName, lastName) {
        if (!firstName && !lastName) return '';

        const formatPart = (part) => {
            if (!part) return '';
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        };

        const formattedFirst = formatPart(firstName);
        const formattedLast = formatPart(lastName);

        return `${formattedFirst} ${formattedLast}`.trim();
    }

    formatInitials(firstName, lastName) {
        if (!firstName && !lastName) return '??';

        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';

        return `${firstInitial}${lastInitial}`;
    }

    // Formateo de archivos
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatFileName(name, maxLength = 30) {
        if (!name) return '';

        if (name.length <= maxLength) return name;

        const extension = name.split('.').pop();
        const nameWithoutExt = name.slice(0, -(extension.length + 1));
        const charsToKeep = maxLength - extension.length - 4; // ... + .ext

        if (charsToKeep <= 3) {
            return name.slice(0, maxLength - 3) + '...';
        }

        return nameWithoutExt.slice(0, charsToKeep) + '...' + name.slice(-(extension.length + 1));
    }

    // Formateo de números de teléfono
    formatPhoneNumber(phone) {
        if (!phone) return '';

        // Remover todo excepto números
        const cleaned = phone.replace(/\D/g, '');

        // Formatear según el país (ejemplo para números internacionales)
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 11) {
            return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
        }

        return phone;
    }

    // Formateo de direcciones
    formatAddress(address) {
        if (!address) return '';

        const parts = [
            address.street,
            address.city,
            address.state,
            address.postalCode,
            address.country
        ].filter(Boolean);

        return parts.join(', ');
    }

    // Formateo de datos financieros
    formatFinancialChange(amount, isPercentage = false) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '0.00';
        }

        const numAmount = parseFloat(amount);
        const isPositive = numAmount >= 0;
        const prefix = isPositive ? '+' : '';
        const value = isPercentage ? 
            this.formatPercentage(Math.abs(numAmount)) : 
            this.formatCurrency(Math.abs(numAmount));

        return `${prefix}${value}`;
    }

    formatFinancialChangeWithIcon(amount, isPercentage = false) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '<span class="change-neutral">0.00</span>';
        }

        const numAmount = parseFloat(amount);
        const isPositive = numAmount > 0;
        const isNeutral = numAmount === 0;
        
        const icon = isPositive ? '▲' : (isNeutral ? '●' : '▼');
        const value = isPercentage ? 
            this.formatPercentage(Math.abs(numAmount)) : 
            this.formatCurrency(Math.abs(numAmount));

        const className = isPositive ? 'change-positive' : 
                         (isNeutral ? 'change-neutral' : 'change-negative');

        return `<span class="${className}">${icon} ${value}</span>`;
    }

    // Formateo para display en tablas
    formatTableValue(value, type = 'text') {
        if (value === null || value === undefined) {
            return '-';
        }

        switch (type) {
            case 'currency':
                return this.formatCurrency(value);
            case 'percentage':
                return this.formatPercentage(value);
            case 'number':
                return this.formatNumber(value);
            case 'date':
                return this.formatDate(value);
            case 'datetime':
                return this.formatDateTime(value);
            case 'boolean':
                return value ? 'Sí' : 'No';
            case 'status':
                return this.formatStatus(value);
            default:
                return value.toString();
        }
    }

    formatStatus(status) {
        const statusMap = {
            'pending': { text: 'Pendiente', class: 'status-pending' },
            'approved': { text: 'Aprobado', class: 'status-approved' },
            'rejected': { text: 'Rechazado', class: 'status-rejected' },
            'processing': { text: 'Procesando', class: 'status-processing' },
            'completed': { text: 'Completado', class: 'status-completed' },
            'active': { text: 'Activo', class: 'status-active' },
            'inactive': { text: 'Inactivo', class: 'status-inactive' }
        };

        const statusInfo = statusMap[status] || { text: status, class: 'status-unknown' };
        return `<span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>`;
    }

    // Utilidades de parseo
    parseDate(date) {
        if (date instanceof Date) return date;
        if (typeof date === 'string' || typeof date === 'number') {
            const parsed = new Date(date);
            return isNaN(parsed.getTime()) ? null : parsed;
        }
        if (date && typeof date.toDate === 'function') {
            // Firebase Timestamp
            return date.toDate();
        }
        return null;
    }

    parseCurrency(currencyString) {
        if (!currencyString) return 0;

        // Remover símbolos de moneda y separadores
        const cleaned = currencyString
            .replace(/[^\d,.-]/g, '')
            .replace(',', '');

        return parseFloat(cleaned) || 0;
    }

    // Configuración regional
    setLocale(locale) {
        this.locale = locale;
        localStorage.setItem('canada-coin-locale', locale);
    }

    setCurrency(currency) {
        this.currency = currency;
    }

    setTimezone(timezone) {
        this.timezone = timezone;
    }

    // Métodos de ayuda para templates
    getCurrencySymbol(currency = this.currency) {
        try {
            return new Intl.NumberFormat(this.locale, {
                style: 'currency',
                currency: currency
            }).formatToParts(0).find(part => part.type === 'currency').value;
        } catch {
            return '$';
        }
    }

    getDecimalSeparator() {
        return new Intl.NumberFormat(this.locale).format(1.1).replace(/\d/g, '');
    }

    getThousandsSeparator() {
        return new Intl.NumberFormat(this.locale).format(1000).replace(/\d/g, '')[0];
    }
}

// Inicializar y exportar
window.formatters = new Formatters();
export default Formatters;