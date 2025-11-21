// js/i18n.js
// Sistema de Internacionalización - Canada Coin
// Soporte multilenguaje (español/inglés) y cambio dinámico

class I18nManager {
    constructor() {
        this.currentLanguage = 'es';
        this.translations = {};
        this.init();
    }

    async init() {
        await this.loadTranslations();
        this.setupEventListeners();
        this.applyStoredLanguage();
    }

    async loadTranslations() {
        // Cargar traducciones desde archivos JSON o objeto local
        this.translations = {
            es: await this.loadSpanishTranslations(),
            en: await this.loadEnglishTranslations()
        };
    }

    async loadSpanishTranslations() {
        // Traducciones al español
        return {
            // Navegación
            'nav.dashboard': 'Dashboard',
            'nav.deposits': 'Depósitos',
            'nav.withdrawals': 'Retiros',
            'nav.performance': 'Rendimiento',
            'nav.referrals': 'Referidos',
            'nav.profile': 'Perfil',
            'nav.help': 'Ayuda',
            'nav.logout': 'Cerrar Sesión',

            // Dashboard
            'dashboard.title': 'Dashboard Principal',
            'dashboard.welcome': 'Bienvenido de vuelta',
            'dashboard.total_balance': 'Saldo Total',
            'dashboard.total_earnings': 'Ganancias Totales',
            'dashboard.total_deposits': 'Total Depositado',
            'dashboard.referral_count': 'Referidos Activos',
            'dashboard.recent_transactions': 'Transacciones Recientes',
            'dashboard.view_all': 'Ver Todo',
            'dashboard.performance_chart': 'Rendimiento de Inversión',

            // Depósitos
            'deposits.title': 'Gestión de Depósitos',
            'deposits.subtitle': 'Realiza seguimiento y gestiona tus depósitos',
            'deposits.new_deposit': 'Nuevo Depósito',
            'deposits.history': 'Historial de Depósitos',
            'deposits.amount': 'Monto',
            'deposits.method': 'Método',
            'deposits.status': 'Estado',
            'deposits.date': 'Fecha',
            'deposits.receipt': 'Comprobante',

            // Retiros
            'withdrawals.title': 'Solicitudes de Retiro',
            'withdrawals.subtitle': 'Gestiona tus retiros y consulta el estado',
            'withdrawals.new_withdrawal': 'Solicitar Retiro',
            'withdrawals.history': 'Historial de Retiros',
            'withdrawals.processing_time': 'Tiempo de Procesamiento',

            // Rendimiento
            'performance.title': 'Rendimiento de Inversión',
            'performance.subtitle': 'Analiza el crecimiento y rendimiento de tu portafolio',
            'performance.total_return': 'Rendimiento Total',
            'performance.annualized_return': 'Rendimiento Anualizado',
            'performance.current_balance': 'Saldo Actual',
            'performance.total_earnings': 'Ganancias Totales',
            'performance.volatility': 'Volatilidad',
            'performance.sharpe_ratio': 'Ratio Sharpe',
            'performance.investment_period': 'Período de Inversión',

            // Referidos
            'referrals.title': 'Programa de Referidos',
            'referrals.subtitle': 'Invita amigos y gana bonificaciones',
            'referrals.your_code': 'Tu Código de Referido',
            'referrals.bonus_info': 'Comparte este código y gana $25 por cada referido verificado',
            'referrals.copy_code': 'Copiar Código',
            'referrals.share': 'Compartir',
            'referrals.total_referrals': 'Total Referidos',
            'referrals.active_referrals': 'Referidos Activos',
            'referrals.pending_referrals': 'Pendientes',
            'referrals.total_bonus': 'Bonos Ganados',

            // Perfil
            'profile.title': 'Mi Perfil',
            'profile.subtitle': 'Gestiona tu información personal y configuración',
            'profile.personal_info': 'Información Personal',
            'profile.first_name': 'Nombre',
            'profile.last_name': 'Apellido',
            'profile.email': 'Email',
            'profile.phone': 'Teléfono',
            'profile.country': 'País',
            'profile.save_changes': 'Guardar Cambios',
            'profile.kyc_verification': 'Verificación KYC',
            'profile.kyc_status': 'Estado KYC',
            'profile.settings': 'Configuración',
            'profile.language': 'Idioma',
            'profile.theme': 'Tema',

            // Ayuda
            'help.title': 'Centro de Ayuda',
            'help.subtitle': 'Encuentra respuestas a tus preguntas frecuentes',
            'help.search_placeholder': 'Buscar en la ayuda...',
            'help.contact_support': 'Contactar Soporte',
            'help.live_chat': 'Chat en Vivo',

            // Estados
            'status.pending': 'Pendiente',
            'status.approved': 'Aprobado',
            'status.rejected': 'Rechazado',
            'status.processing': 'Procesando',
            'status.completed': 'Completado',

            // Métodos de pago
            'method.bank_transfer': 'Transferencia Bancaria',
            'method.paypal': 'PayPal',
            'method.crypto': 'Criptomonedas',

            // Botones
            'button.confirm': 'Confirmar',
            'button.cancel': 'Cancelar',
            'button.save': 'Guardar',
            'button.submit': 'Enviar',
            'button.close': 'Cerrar',
            'button.download': 'Descargar',
            'button.view_details': 'Ver Detalles',

            // Mensajes de éxito
            'success.profile_updated': 'Perfil actualizado exitosamente',
            'success.deposit_submitted': 'Depósito enviado exitosamente',
            'success.withdrawal_requested': 'Solicitud de retiro enviada exitosamente',
            'success.code_copied': 'Código copiado al portapapeles',

            // Mensajes de error
            'error.generic': 'Ha ocurrido un error',
            'error.insufficient_balance': 'Saldo insuficiente',
            'error.invalid_file': 'Archivo inválido',
            'error.network': 'Error de conexión',

            // Tiempo
            'time.days': 'días',
            'time.hours': 'horas',
            'time.minutes': 'minutos',
            'time.ago': 'hace',

            // Moneda
            'currency.usd': 'USD',
            'currency.eur': 'EUR',
            'currency.gbp': 'GBP'
        };
    }

    async loadEnglishTranslations() {
        // English translations
        return {
            // Navigation
            'nav.dashboard': 'Dashboard',
            'nav.deposits': 'Deposits',
            'nav.withdrawals': 'Withdrawals',
            'nav.performance': 'Performance',
            'nav.referrals': 'Referrals',
            'nav.profile': 'Profile',
            'nav.help': 'Help',
            'nav.logout': 'Logout',

            // Dashboard
            'dashboard.title': 'Main Dashboard',
            'dashboard.welcome': 'Welcome back',
            'dashboard.total_balance': 'Total Balance',
            'dashboard.total_earnings': 'Total Earnings',
            'dashboard.total_deposits': 'Total Deposits',
            'dashboard.referral_count': 'Active Referrals',
            'dashboard.recent_transactions': 'Recent Transactions',
            'dashboard.view_all': 'View All',
            'dashboard.performance_chart': 'Investment Performance',

            // Deposits
            'deposits.title': 'Deposit Management',
            'deposits.subtitle': 'Track and manage your deposits',
            'deposits.new_deposit': 'New Deposit',
            'deposits.history': 'Deposit History',
            'deposits.amount': 'Amount',
            'deposits.method': 'Method',
            'deposits.status': 'Status',
            'deposits.date': 'Date',
            'deposits.receipt': 'Receipt',

            // Withdrawals
            'withdrawals.title': 'Withdrawal Requests',
            'withdrawals.subtitle': 'Manage your withdrawals and check status',
            'withdrawals.new_withdrawal': 'Request Withdrawal',
            'withdrawals.history': 'Withdrawal History',
            'withdrawals.processing_time': 'Processing Time',

            // Performance
            'performance.title': 'Investment Performance',
            'performance.subtitle': 'Analyze your portfolio growth and performance',
            'performance.total_return': 'Total Return',
            'performance.annualized_return': 'Annualized Return',
            'performance.current_balance': 'Current Balance',
            'performance.total_earnings': 'Total Earnings',
            'performance.volatility': 'Volatility',
            'performance.sharpe_ratio': 'Sharpe Ratio',
            'performance.investment_period': 'Investment Period',

            // Referrals
            'referrals.title': 'Referral Program',
            'referrals.subtitle': 'Invite friends and earn bonuses',
            'referrals.your_code': 'Your Referral Code',
            'referrals.bonus_info': 'Share this code and earn $25 for each verified referral',
            'referrals.copy_code': 'Copy Code',
            'referrals.share': 'Share',
            'referrals.total_referrals': 'Total Referrals',
            'referrals.active_referrals': 'Active Referrals',
            'referrals.pending_referrals': 'Pending',
            'referrals.total_bonus': 'Total Bonus Earned',

            // Profile
            'profile.title': 'My Profile',
            'profile.subtitle': 'Manage your personal information and settings',
            'profile.personal_info': 'Personal Information',
            'profile.first_name': 'First Name',
            'profile.last_name': 'Last Name',
            'profile.email': 'Email',
            'profile.phone': 'Phone',
            'profile.country': 'Country',
            'profile.save_changes': 'Save Changes',
            'profile.kyc_verification': 'KYC Verification',
            'profile.kyc_status': 'KYC Status',
            'profile.settings': 'Settings',
            'profile.language': 'Language',
            'profile.theme': 'Theme',

            // Help
            'help.title': 'Help Center',
            'help.subtitle': 'Find answers to your frequently asked questions',
            'help.search_placeholder': 'Search help...',
            'help.contact_support': 'Contact Support',
            'help.live_chat': 'Live Chat',

            // Status
            'status.pending': 'Pending',
            'status.approved': 'Approved',
            'status.rejected': 'Rejected',
            'status.processing': 'Processing',
            'status.completed': 'Completed',

            // Payment Methods
            'method.bank_transfer': 'Bank Transfer',
            'method.paypal': 'PayPal',
            'method.crypto': 'Cryptocurrencies',

            // Buttons
            'button.confirm': 'Confirm',
            'button.cancel': 'Cancel',
            'button.save': 'Save',
            'button.submit': 'Submit',
            'button.close': 'Close',
            'button.download': 'Download',
            'button.view_details': 'View Details',

            // Success Messages
            'success.profile_updated': 'Profile updated successfully',
            'success.deposit_submitted': 'Deposit submitted successfully',
            'success.withdrawal_requested': 'Withdrawal request submitted successfully',
            'success.code_copied': 'Code copied to clipboard',

            // Error Messages
            'error.generic': 'An error has occurred',
            'error.insufficient_balance': 'Insufficient balance',
            'error.invalid_file': 'Invalid file',
            'error.network': 'Network error',

            // Time
            'time.days': 'days',
            'time.hours': 'hours',
            'time.minutes': 'minutes',
            'time.ago': 'ago',

            // Currency
            'currency.usd': 'USD',
            'currency.eur': 'EUR',
            'currency.gbp': 'GBP'
        };
    }

    setupEventListeners() {
        // Language selector change
        const languageSelector = document.getElementById('language-selector');
        if (languageSelector) {
            languageSelector.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }

        // Listen for language change events from other components
        window.addEventListener('languageChanged', (e) => {
            this.changeLanguage(e.detail.language);
        });
    }

    applyStoredLanguage() {
        const storedLanguage = localStorage.getItem('canada-coin-language');
        if (storedLanguage && this.translations[storedLanguage]) {
            this.currentLanguage = storedLanguage;
            this.applyLanguage();
        }
    }

    changeLanguage(language) {
        if (!this.translations[language]) {
            console.warn(`Language ${language} not supported`);
            return;
        }

        this.currentLanguage = language;
        localStorage.setItem('canada-coin-language', language);
        
        this.applyLanguage();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language }
        }));
    }

    applyLanguage() {
        this.updatePageLanguage();
        this.translatePage();
        this.updateLanguageSelector();
    }

    updatePageLanguage() {
        document.documentElement.lang = this.currentLanguage;
    }

    translatePage() {
        // Find all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update page title and meta descriptions if needed
        this.updateMetaTranslations();
    }

    translate(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            value = value?.[k];
        }
        
        return value || key; // Return key if translation not found
    }

    updateMetaTranslations() {
        // Update page title and meta tags based on language
        const title = this.translate('dashboard.title');
        if (title && title !== 'dashboard.title') {
            document.title = `Canada Coin - ${title}`;
        }
    }

    updateLanguageSelector() {
        const selector = document.getElementById('language-selector');
        if (selector) {
            selector.value = this.currentLanguage;
        }
    }

    // Public method to get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Public method to translate strings in JavaScript
    t(key, params = {}) {
        let translation = this.translate(key);
        
        // Replace parameters in translation
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{{${param}}}`, params[param]);
        });
        
        return translation;
    }

    // Format numbers based on language
    formatNumber(number, options = {}) {
        return new Intl.NumberFormat(this.currentLanguage, options).format(number);
    }

    // Format currency based on language and currency code
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat(this.currentLanguage, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // Format date based on language
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        
        return new Intl.DateTimeFormat(this.currentLanguage, {
            ...defaultOptions,
            ...options
        }).format(new Date(date));
    }

    // Format time based on language
    formatTime(date, options = {}) {
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return new Intl.DateTimeFormat(this.currentLanguage, {
            ...defaultOptions,
            ...options
        }).format(new Date(date));
    }

    // Format relative time (e.g., "2 hours ago")
    formatRelativeTime(date) {
        const now = new Date();
        const diffInMs = now - new Date(date);
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMinutes < 1) {
            return this.t('time.just_now');
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} ${this.t('time.minutes')} ${this.t('time.ago')}`;
        } else if (diffInHours < 24) {
            return `${diffInHours} ${this.t('time.hours')} ${this.t('time.ago')}`;
        } else {
            return `${diffInDays} ${this.t('time.days')} ${this.t('time.ago')}`;
        }
    }

    // RTL support detection
    isRTL() {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(this.currentLanguage);
    }

    // Direction getter for CSS
    getDirection() {
        return this.isRTL() ? 'rtl' : 'ltr';
    }

    // Apply RTL styles if needed
    applyTextDirection() {
        document.documentElement.dir = this.getDirection();
    }

    // Load additional language packs dynamically
    async loadLanguagePack(language) {
        try {
            // In production, this would fetch from a server
            const response = await fetch(`/locales/${language}.json`);
            const translations = await response.json();
            
            this.translations[language] = translations;
            return true;
        } catch (error) {
            console.error(`Failed to load language pack: ${language}`, error);
            return false;
        }
    }

    // Get available languages
    getAvailableLanguages() {
        return Object.keys(this.translations).map(code => ({
            code,
            name: this.getLanguageName(code)
        }));
    }

    getLanguageName(code) {
        const languageNames = {
            'es': 'Español',
            'en': 'English',
            'fr': 'Français',
            'de': 'Deutsch',
            'pt': 'Português',
            'it': 'Italiano',
            'zh': '中文',
            'ja': '日本語',
            'ko': '한국어',
            'ar': 'العربية'
        };
        
        return languageNames[code] || code;
    }
}

// Inicializar el manager de internacionalización
document.addEventListener('DOMContentLoaded', async () => {
    window.i18n = new I18nManager();
    await window.i18n.init();
    
    // Make translation function globally available
    window.t = (key, params) => window.i18n.t(key, params);
});

export default I18nManager;