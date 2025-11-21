// js/data.js
// Datos Globales - Canada Coin
// Países, idiomas, monedas y datos estáticos de la aplicación

class DataManager {
    constructor() {
        this.countries = [];
        this.currencies = [];
        this.languages = [];
        this.appConfig = {};
        this.init();
    }

    async init() {
        await this.loadAllData();
        this.setupGlobalData();
    }

    async loadAllData() {
        await Promise.all([
            this.loadCountries(),
            this.loadCurrencies(),
            this.loadLanguages(),
            this.loadAppConfig()
        ]);
    }

    async loadCountries() {
        // Datos de países con monedas e idiomas
        this.countries = [
            // América del Norte
            {
                code: 'US',
                name: 'Estados Unidos',
                currency: 'USD',
                languages: ['en', 'es'],
                region: 'América del Norte',
                phoneCode: '+1'
            },
            {
                code: 'CA',
                name: 'Canadá',
                currency: 'CAD',
                languages: ['en', 'fr'],
                region: 'América del Norte',
                phoneCode: '+1'
            },
            {
                code: 'MX',
                name: 'México',
                currency: 'MXN',
                languages: ['es'],
                region: 'América del Norte',
                phoneCode: '+52'
            },

            // América Central
            {
                code: 'CR',
                name: 'Costa Rica',
                currency: 'CRC',
                languages: ['es'],
                region: 'América Central',
                phoneCode: '+506'
            },
            {
                code: 'PA',
                name: 'Panamá',
                currency: 'PAB',
                languages: ['es'],
                region: 'América Central',
                phoneCode: '+507'
            },

            // América del Sur
            {
                code: 'AR',
                name: 'Argentina',
                currency: 'ARS',
                languages: ['es'],
                region: 'América del Sur',
                phoneCode: '+54'
            },
            {
                code: 'BR',
                name: 'Brasil',
                currency: 'BRL',
                languages: ['pt'],
                region: 'América del Sur',
                phoneCode: '+55'
            },
            {
                code: 'CL',
                name: 'Chile',
                currency: 'CLP',
                languages: ['es'],
                region: 'América del Sur',
                phoneCode: '+56'
            },
            {
                code: 'CO',
                name: 'Colombia',
                currency: 'COP',
                languages: ['es'],
                region: 'América del Sur',
                phoneCode: '+57'
            },
            {
                code: 'PE',
                name: 'Perú',
                currency: 'PEN',
                languages: ['es'],
                region: 'América del Sur',
                phoneCode: '+51'
            },

            // Europa
            {
                code: 'ES',
                name: 'España',
                currency: 'EUR',
                languages: ['es'],
                region: 'Europa',
                phoneCode: '+34'
            },
            {
                code: 'FR',
                name: 'Francia',
                currency: 'EUR',
                languages: ['fr'],
                region: 'Europa',
                phoneCode: '+33'
            },
            {
                code: 'DE',
                name: 'Alemania',
                currency: 'EUR',
                languages: ['de'],
                region: 'Europa',
                phoneCode: '+49'
            },
            {
                code: 'IT',
                name: 'Italia',
                currency: 'EUR',
                languages: ['it'],
                region: 'Europa',
                phoneCode: '+39'
            },
            {
                code: 'GB',
                name: 'Reino Unido',
                currency: 'GBP',
                languages: ['en'],
                region: 'Europa',
                phoneCode: '+44'
            },

            // Asia
            {
                code: 'CN',
                name: 'China',
                currency: 'CNY',
                languages: ['zh'],
                region: 'Asia',
                phoneCode: '+86'
            },
            {
                code: 'JP',
                name: 'Japón',
                currency: 'JPY',
                languages: ['ja'],
                region: 'Asia',
                phoneCode: '+81'
            },
            {
                code: 'KR',
                name: 'Corea del Sur',
                currency: 'KRW',
                languages: ['ko'],
                region: 'Asia',
                phoneCode: '+82'
            },
            {
                code: 'IN',
                name: 'India',
                currency: 'INR',
                languages: ['hi', 'en'],
                region: 'Asia',
                phoneCode: '+91'
            },

            // África
            {
                code: 'ZA',
                name: 'Sudáfrica',
                currency: 'ZAR',
                languages: ['en', 'af'],
                region: 'África',
                phoneCode: '+27'
            },
            {
                code: 'NG',
                name: 'Nigeria',
                currency: 'NGN',
                languages: ['en'],
                region: 'África',
                phoneCode: '+234'
            },
            {
                code: 'EG',
                name: 'Egipto',
                currency: 'EGP',
                languages: ['ar'],
                region: 'África',
                phoneCode: '+20'
            }
        ];
    }

    async loadCurrencies() {
        // Datos de monedas globales
        this.currencies = [
            {
                code: 'USD',
                name: 'Dólar Estadounidense',
                symbol: '$',
                decimalDigits: 2,
                rateToUSD: 1
            },
            {
                code: 'EUR',
                name: 'Euro',
                symbol: '€',
                decimalDigits: 2,
                rateToUSD: 0.85
            },
            {
                code: 'GBP',
                name: 'Libra Esterlina',
                symbol: '£',
                decimalDigits: 2,
                rateToUSD: 0.73
            },
            {
                code: 'CAD',
                name: 'Dólar Canadiense',
                symbol: 'CA$',
                decimalDigits: 2,
                rateToUSD: 1.25
            },
            {
                code: 'MXN',
                name: 'Peso Mexicano',
                symbol: 'MX$',
                decimalDigits: 2,
                rateToUSD: 20.50
            },
            {
                code: 'ARS',
                name: 'Peso Argentino',
                symbol: 'AR$',
                decimalDigits: 2,
                rateToUSD: 350.25
            },
            {
                code: 'BRL',
                name: 'Real Brasileño',
                symbol: 'R$',
                decimalDigits: 2,
                rateToUSD: 5.45
            },
            {
                code: 'CLP',
                name: 'Peso Chileno',
                symbol: 'CLP$',
                decimalDigits: 0,
                rateToUSD: 890
            },
            {
                code: 'COP',
                name: 'Peso Colombiano',
                symbol: 'COL$',
                decimalDigits: 2,
                rateToUSD: 4200
            },
            {
                code: 'PEN',
                name: 'Sol Peruano',
                symbol: 'S/',
                decimalDigits: 2,
                rateToUSD: 3.75
            }
        ];
    }

    async loadLanguages() {
        // Datos de idiomas soportados
        this.languages = [
            {
                code: 'es',
                name: 'Español',
                nativeName: 'Español',
                direction: 'ltr'
            },
            {
                code: 'en',
                name: 'English',
                nativeName: 'English',
                direction: 'ltr'
            },
            {
                code: 'pt',
                name: 'Português',
                nativeName: 'Português',
                direction: 'ltr'
            },
            {
                code: 'fr',
                name: 'Français',
                nativeName: 'Français',
                direction: 'ltr'
            },
            {
                code: 'de',
                name: 'Deutsch',
                nativeName: 'Deutsch',
                direction: 'ltr'
            },
            {
                code: 'it',
                name: 'Italiano',
                nativeName: 'Italiano',
                direction: 'ltr'
            },
            {
                code: 'zh',
                name: '中文',
                nativeName: '中文',
                direction: 'ltr'
            },
            {
                code: 'ja',
                name: '日本語',
                nativeName: '日本語',
                direction: 'ltr'
            },
            {
                code: 'ko',
                name: '한국어',
                nativeName: '한국어',
                direction: 'ltr'
            },
            {
                code: 'ar',
                name: 'العربية',
                nativeName: 'العربية',
                direction: 'rtl'
            }
        ];
    }

    async loadAppConfig() {
        // Configuración global de la aplicación
        this.appConfig = {
            appName: 'Canada Coin',
            version: '1.0.0',
            supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD'],
            defaultCurrency: 'USD',
            minDepositAmount: 10,
            maxDepositAmount: 10000,
            minWithdrawalAmount: 10,
            maxWithdrawalAmount: 5000,
            referralBonus: 25,
            kycRequired: true,
            supportedDocuments: ['jpg', 'jpeg', 'png', 'pdf'],
            maxFileSize: 5 * 1024 * 1024, // 5MB
            maintenanceMode: false,
            supportEmail: 'soporte@canadacoin.com',
            supportPhone: '+1-800-CANADA',
            businessHours: {
                timezone: 'America/Toronto',
                open: '09:00',
                close: '18:00',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
            },
            socialLinks: {
                twitter: 'https://twitter.com/canadacoin',
                facebook: 'https://facebook.com/canadacoin',
                linkedin: 'https://linkedin.com/company/canadacoin',
                instagram: 'https://instagram.com/canadacoin'
            }
        };
    }

    setupGlobalData() {
        // Hacer los datos disponibles globalmente
        window.appData = {
            countries: this.countries,
            currencies: this.currencies,
            languages: this.languages,
            config: this.appConfig
        };
    }

    // Métodos de utilidad para países
    getCountryByCode(code) {
        return this.countries.find(country => country.code === code);
    }

    getCountriesByRegion(region) {
        return this.countries.filter(country => country.region === region);
    }

    getCountriesByLanguage(languageCode) {
        return this.countries.filter(country => 
            country.languages.includes(languageCode)
        );
    }

    // Métodos de utilidad para monedas
    getCurrencyByCode(code) {
        return this.currencies.find(currency => currency.code === code);
    }

    convertCurrency(amount, fromCurrency, toCurrency) {
        const from = this.getCurrencyByCode(fromCurrency);
        const to = this.getCurrencyByCode(toCurrency);
        
        if (!from || !to) {
            throw new Error('Moneda no soportada');
        }

        // Convertir a USD primero, luego a la moneda objetivo
        const amountInUSD = amount / from.rateToUSD;
        return amountInUSD * to.rateToUSD;
    }

    formatCurrency(amount, currencyCode, locale = 'es-MX') {
        const currency = this.getCurrencyByCode(currencyCode);
        if (!currency) {
            return this.formatCurrency(amount, 'USD', locale);
        }

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: currency.decimalDigits,
            maximumFractionDigits: currency.decimalDigits
        }).format(amount);
    }

    // Métodos de utilidad para idiomas
    getLanguageByCode(code) {
        return this.languages.find(language => language.code === code);
    }

    getSupportedLanguages() {
        return this.languages.filter(language => 
            this.appConfig.supportedLanguages?.includes(language.code) || 
            ['es', 'en'].includes(language.code)
        );
    }

    // Métodos de configuración de la aplicación
    getConfig(key) {
        const keys = key.split('.');
        let value = this.appConfig;
        
        for (const k of keys) {
            value = value?.[k];
        }
        
        return value;
    }

    updateConfig(updates) {
        this.appConfig = { ...this.appConfig, ...updates };
        this.setupGlobalData(); // Re-sincronizar datos globales
    }

    // Validación de datos
    isValidCountry(code) {
        return this.countries.some(country => country.code === code);
    }

    isValidCurrency(code) {
        return this.currencies.some(currency => currency.code === code);
    }

    isValidLanguage(code) {
        return this.languages.some(language => language.code === code);
    }

    // Filtrado y búsqueda
    searchCountries(query) {
        const lowerQuery = query.toLowerCase();
        return this.countries.filter(country =>
            country.name.toLowerCase().includes(lowerQuery) ||
            country.code.toLowerCase().includes(lowerQuery)
        );
    }

    searchCurrencies(query) {
        const lowerQuery = query.toLowerCase();
        return this.currencies.filter(currency =>
            currency.name.toLowerCase().includes(lowerQuery) ||
            currency.code.toLowerCase().includes(lowerQuery) ||
            currency.symbol.toLowerCase().includes(lowerQuery)
        );
    }

    // Grupos y categorías
    getRegions() {
        const regions = [...new Set(this.countries.map(country => country.region))];
        return regions.sort();
    }

    getCountriesByRegions() {
        const regions = this.getRegions();
        const grouped = {};
        
        regions.forEach(region => {
            grouped[region] = this.getCountriesByRegion(region);
        });
        
        return grouped;
    }

    // Datos para selectores y formularios
    getCountryOptions() {
        return this.countries.map(country => ({
            value: country.code,
            label: country.name,
            data: country
        })).sort((a, b) => a.label.localeCompare(b.label));
    }

    getCurrencyOptions() {
        return this.currencies.map(currency => ({
            value: currency.code,
            label: `${currency.code} - ${currency.name}`,
            data: currency
        }));
    }

    getLanguageOptions() {
        return this.languages.map(language => ({
            value: language.code,
            label: language.name,
            nativeLabel: language.nativeName,
            data: language
        }));
    }

    // Información de contacto por país
    getCountryContactInfo(countryCode) {
        const country = this.getCountryByCode(countryCode);
        if (!country) return null;

        return {
            phone: this.appConfig.supportPhone,
            email: this.appConfig.supportEmail,
            localOffice: this.getLocalOffice(countryCode),
            businessHours: this.getLocalBusinessHours(countryCode)
        };
    }

    getLocalOffice(countryCode) {
        const offices = {
            'US': { address: '123 Wall Street, New York, NY 10005', phone: '+1-212-555-0123' },
            'CA': { address: '456 Bay Street, Toronto, ON M5H 2Y2', phone: '+1-416-555-0123' },
            'MX': { address: '789 Paseo de la Reforma, Ciudad de México, 06600', phone: '+52-55-5555-0123' },
            'ES': { address: '123 Calle Serrano, Madrid, 28001', phone: '+34-91-555-0123' }
        };

        return offices[countryCode] || null;
    }

    getLocalBusinessHours(countryCode) {
        const country = this.getCountryByCode(countryCode);
        if (!country) return this.appConfig.businessHours;

        // Ajustar horarios según la región (simplificado)
        const timezoneOffsets = {
            'US': -5,
            'CA': -5,
            'MX': -6,
            'ES': +1
        };

        const offset = timezoneOffsets[countryCode] || 0;
        
        return {
            ...this.appConfig.businessHours,
            localOffset: offset
        };
    }

    // Métodos para estadísticas y reporting
    getCountryStats() {
        const stats = {
            totalCountries: this.countries.length,
            byRegion: {},
            byCurrency: {},
            byLanguage: {}
        };

        // Estadísticas por región
        this.getRegions().forEach(region => {
            stats.byRegion[region] = this.getCountriesByRegion(region).length;
        });

        // Estadísticas por moneda
        this.currencies.forEach(currency => {
            stats.byCurrency[currency.code] = this.countries.filter(
                country => country.currency === currency.code
            ).length;
        });

        // Estadísticas por idioma
        const allLanguages = [...new Set(this.countries.flatMap(country => country.languages))];
        allLanguages.forEach(language => {
            stats.byLanguage[language] = this.countries.filter(
                country => country.languages.includes(language)
            ).length;
        });

        return stats;
    }

    // Exportación de datos
    exportData(type = 'all') {
        const data = {
            countries: type === 'all' || type === 'countries' ? this.countries : undefined,
            currencies: type === 'all' || type === 'currencies' ? this.currencies : undefined,
            languages: type === 'all' || type === 'languages' ? this.languages : undefined,
            config: type === 'all' || type === 'config' ? this.appConfig : undefined,
            exportDate: new Date().toISOString(),
            version: this.appConfig.version
        };

        // Eliminar undefined values
        Object.keys(data).forEach(key => {
            if (data[key] === undefined) {
                delete data[key];
            }
        });

        return data;
    }

    // Importación de datos (para actualizaciones)
    importData(data) {
        if (data.countries) this.countries = data.countries;
        if (data.currencies) this.currencies = data.currencies;
        if (data.languages) this.languages = data.languages;
        if (data.config) this.appConfig = data.config;

        this.setupGlobalData();
    }

    // Verificación de actualizaciones
    async checkForUpdates() {
        try {
            // En producción, esto buscaría actualizaciones en un servidor
            const response = await fetch('/api/data/version');
            const latest = await response.json();
            
            return {
                updateAvailable: latest.version !== this.appConfig.version,
                currentVersion: this.appConfig.version,
                latestVersion: latest.version,
                changelog: latest.changelog
            };
        } catch (error) {
            console.error('Error checking for updates:', error);
            return {
                updateAvailable: false,
                error: error.message
            };
        }
    }
}

// Inicializar el manager de datos
document.addEventListener('DOMContentLoaded', async () => {
    window.dataManager = new DataManager();
    await window.dataManager.init();
});

export default DataManager;