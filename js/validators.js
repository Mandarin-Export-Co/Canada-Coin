// js/validators.js
// Sistema de Validaciones - Canada Coin
// Validaciones de formularios, datos y seguridad

class Validators {
    constructor() {
        this.patterns = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[\+]?[1-9][\d]{0,15}$/,
            password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
            name: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]{2,50}$/,
            amount: /^\d+(\.\d{1,2})?$/,
            document: /^[a-zA-Z0-9\-_]{5,50}$/,
            referralCode: /^[A-Z0-9\-_]{3,20}$/
        };
    }

    // Validación de email
    validateEmail(email) {
        if (!email) {
            return { isValid: false, message: 'El email es requerido' };
        }

        if (!this.patterns.email.test(email)) {
            return { isValid: false, message: 'Formato de email inválido' };
        }

        return { isValid: true, message: 'Email válido' };
    }

    // Validación de contraseña
    validatePassword(password) {
        if (!password) {
            return { isValid: false, message: 'La contraseña es requerida' };
        }

        if (password.length < 8) {
            return { isValid: false, message: 'Mínimo 8 caracteres' };
        }

        if (!this.patterns.password.test(password)) {
            return { 
                isValid: false, 
                message: 'Debe contener mayúscula, minúscula y número' 
            };
        }

        return { isValid: true, message: 'Contraseña segura' };
    }

    // Validación de teléfono
    validatePhone(phone) {
        if (!phone) {
            return { isValid: false, message: 'El teléfono es requerido' };
        }

        const cleanPhone = phone.replace(/\s/g, '');
        if (!this.patterns.phone.test(cleanPhone)) {
            return { isValid: false, message: 'Formato de teléfono inválido' };
        }

        return { isValid: true, message: 'Teléfono válido' };
    }

    // Validación de nombre
    validateName(name, fieldName = 'Nombre') {
        if (!name) {
            return { isValid: false, message: `${fieldName} es requerido` };
        }

        if (name.length < 2) {
            return { 
                isValid: false, 
                message: `${fieldName} debe tener al menos 2 caracteres` 
            };
        }

        if (!this.patterns.name.test(name)) {
            return { 
                isValid: false, 
                message: `${fieldName} contiene caracteres inválidos` 
            };
        }

        return { isValid: true, message: `${fieldName} válido` };
    }

    // Validación de monto financiero
    validateAmount(amount, options = {}) {
        const { min = 0, max = 1000000, required = true } = options;

        if (!amount && required) {
            return { isValid: false, message: 'El monto es requerido' };
        }

        if (!amount && !required) {
            return { isValid: true, message: 'Monto opcional' };
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) {
            return { isValid: false, message: 'Monto debe ser un número' };
        }

        if (numAmount < min) {
            return { 
                isValid: false, 
                message: `Monto mínimo: ${this.formatCurrency(min)}` 
            };
        }

        if (numAmount > max) {
            return { 
                isValid: false, 
                message: `Monto máximo: ${this.formatCurrency(max)}` 
            };
        }

        if (!this.patterns.amount.test(amount.toString())) {
            return { 
                isValid: false, 
                message: 'Máximo 2 decimales permitidos' 
            };
        }

        return { isValid: true, message: 'Monto válido' };
    }

    // Validación de archivos
    validateFile(file, options = {}) {
        const { 
            maxSize = 5 * 1024 * 1024, // 5MB
            allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
            allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']
        } = options;

        if (!file) {
            return { isValid: false, message: 'Archivo requerido' };
        }

        // Validar tipo MIME
        if (!allowedTypes.includes(file.type)) {
            return { 
                isValid: false, 
                message: `Tipo de archivo no permitido. Use: ${allowedExtensions.join(', ')}` 
            };
        }

        // Validar tamaño
        if (file.size > maxSize) {
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
            return { 
                isValid: false, 
                message: `Archivo demasiado grande. Máximo: ${maxSizeMB}MB` 
            };
        }

        // Validar extensión por nombre (seguridad adicional)
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            return { 
                isValid: false, 
                message: `Extensión no permitida. Use: ${allowedExtensions.join(', ')}` 
            };
        }

        return { isValid: true, message: 'Archivo válido' };
    }

    // Validación de código de referido
    validateReferralCode(code) {
        if (!code) {
            return { isValid: true, message: 'Código opcional' };
        }

        if (!this.patterns.referralCode.test(code)) {
            return { 
                isValid: false, 
                message: 'Formato de código inválido' 
            };
        }

        return { isValid: true, message: 'Código válido' };
    }

    // Validación de formulario completo
    validateForm(formData, rules) {
        const errors = {};
        let isValid = true;

        Object.keys(rules).forEach(field => {
            const value = formData[field];
            const rule = rules[field];
            const validation = this.validateField(value, rule);

            if (!validation.isValid) {
                errors[field] = validation.message;
                isValid = false;
            }
        });

        return { isValid, errors };
    }

    // Validación de campo individual con reglas
    validateField(value, rules) {
        if (rules.required && (!value || value.toString().trim() === '')) {
            return { isValid: false, message: rules.requiredMessage || 'Campo requerido' };
        }

        if (value && rules.type) {
            switch (rules.type) {
                case 'email':
                    return this.validateEmail(value);
                case 'password':
                    return this.validatePassword(value);
                case 'phone':
                    return this.validatePhone(value);
                case 'name':
                    return this.validateName(value, rules.fieldName);
                case 'amount':
                    return this.validateAmount(value, rules.options);
                case 'file':
                    return this.validateFile(value, rules.options);
                case 'referralCode':
                    return this.validateReferralCode(value);
            }
        }

        if (value && rules.minLength && value.length < rules.minLength) {
            return { 
                isValid: false, 
                message: `Mínimo ${rules.minLength} caracteres` 
            };
        }

        if (value && rules.maxLength && value.length > rules.maxLength) {
            return { 
                isValid: false, 
                message: `Máximo ${rules.maxLength} caracteres` 
            };
        }

        if (value && rules.pattern && !rules.pattern.test(value)) {
            return { 
                isValid: false, 
                message: rules.patternMessage || 'Formato inválido' 
            };
        }

        return { isValid: true, message: 'Campo válido' };
    }

    // Validación de transacción
    validateTransaction(transaction, userBalance) {
        const errors = {};

        // Validar monto
        const amountValidation = this.validateAmount(transaction.amount, {
            min: 10,
            max: 10000,
            required: true
        });

        if (!amountValidation.isValid) {
            errors.amount = amountValidation.message;
        }

        // Validar saldo suficiente para retiros
        if (transaction.type === 'withdrawal' && transaction.amount > userBalance) {
            errors.amount = 'Saldo insuficiente';
        }

        // Validar método
        if (!transaction.method) {
            errors.method = 'Método requerido';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Validación KYC
    validateKYCData(kycData) {
        const errors = {};

        // Validar información personal
        if (!kycData.firstName) errors.firstName = 'Nombre requerido';
        if (!kycData.lastName) errors.lastName = 'Apellido requerido';
        if (!kycData.documentNumber) errors.documentNumber = 'Número de documento requerido';
        if (!kycData.documentType) errors.documentType = 'Tipo de documento requerido';
        if (!kycData.birthDate) errors.birthDate = 'Fecha de nacimiento requerida';

        // Validar fecha de nacimiento (mayor de 18 años)
        if (kycData.birthDate) {
            const birthDate = new Date(kycData.birthDate);
            const age = new Date().getFullYear() - birthDate.getFullYear();
            if (age < 18) {
                errors.birthDate = 'Debes ser mayor de 18 años';
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Sanitización de datos
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;

        return input
            .trim()
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#x27;')
            .replace(/"/g, '&quot;')
            .replace(/\//g, '&#x2F;')
            .replace(/\\/g, '&#x5C;')
            .replace(/`/g, '&#96;');
    }

    sanitizeObject(obj) {
        const sanitized = {};
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'string') {
                sanitized[key] = this.sanitizeInput(obj[key]);
            } else {
                sanitized[key] = obj[key];
            }
        });
        return sanitized;
    }

    // Utilidades de formato
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Validación de seguridad
    validateSecurityInput(input) {
        const dangerousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
            /javascript:/gi, // JavaScript protocol
            /on\w+\s*=/gi, // Event handlers
            /expression\s*\(/gi, // CSS expressions
            /vbscript:/gi, // VBScript
            /<\?php/gi, // PHP tags
            /<\/?\w+:[^>]*>/gi // Namespaced tags
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(input)) {
                return false;
            }
        }

        return true;
    }

    // Validación de URL segura
    validateSafeURL(url) {
        try {
            const parsed = new URL(url);
            const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
            
            if (!safeProtocols.includes(parsed.protocol)) {
                return false;
            }

            // Validar dominios seguros si es necesario
            const safeDomains = ['canadacoin.com', 'firebaseapp.com'];
            if (!safeDomains.some(domain => parsed.hostname.endsWith(domain))) {
                // En producción, podríamos ser más restrictivos
                console.warn('URL de dominio no verificado:', parsed.hostname);
            }

            return true;
        } catch {
            return false;
        }
    }

    // Validación de datos financieros
    validateFinancialData(data) {
        const errors = {};

        if (data.balance !== undefined && (data.balance < 0 || !isFinite(data.balance))) {
            errors.balance = 'Saldo inválido';
        }

        if (data.amount !== undefined && (data.amount <= 0 || !isFinite(data.amount))) {
            errors.amount = 'Monto inválido';
        }

        if (data.percentage !== undefined && (data.percentage < -100 || data.percentage > 1000)) {
            errors.percentage = 'Porcentaje inválido';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Validación en tiempo real (para inputs)
    setupRealTimeValidation(input, rules) {
        let timeout;

        input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const validation = this.validateField(e.target.value, rules);
                this.showValidationFeedback(input, validation);
            }, 500);
        });

        input.addEventListener('blur', (e) => {
            const validation = this.validateField(e.target.value, rules);
            this.showValidationFeedback(input, validation);
        });
    }

    showValidationFeedback(input, validation) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;

        // Remover estados previos
        input.classList.remove('is-valid', 'is-invalid');
        formGroup.classList.remove('has-error');

        let feedback = formGroup.querySelector('.form-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'form-feedback';
            formGroup.appendChild(feedback);
        }

        if (validation.isValid) {
            input.classList.add('is-valid');
            feedback.style.display = 'none';
        } else {
            input.classList.add('is-invalid');
            formGroup.classList.add('has-error');
            feedback.textContent = validation.message;
            feedback.className = 'form-feedback invalid';
            feedback.style.display = 'block';
        }
    }
}

// Inicializar y exportar
window.validators = new Validators();
export default Validators;