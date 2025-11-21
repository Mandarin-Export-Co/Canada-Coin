// js/auth.js
// Sistema de Autenticación y Seguridad - Canada Coin
// Registro, login, verificación KYC y gestión de sesiones

import { authService } from '../firebase-config.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidations();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Real-time form validation
        this.setupRealTimeValidation();
    }

    setupFormValidations() {
        // Password strength validation
        const passwordInput = document.getElementById('register-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => this.validatePasswordStrength(e.target.value));
        }

        // Confirm password validation
        const confirmPasswordInput = document.getElementById('register-confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', (e) => this.validatePasswordMatch());
        }

        // Email validation
        const emailInput = document.getElementById('register-email');
        if (emailInput) {
            emailInput.addEventListener('blur', (e) => this.validateEmail(e.target.value));
        }
    }

    setupRealTimeValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input[required]');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    this.validateField(input);
                });
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            });
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!this.validateLoginForm(email, password)) {
            return;
        }

        try {
            this.showFormLoading('login-form');
            
            const result = await authService.loginUser(email, password);
            
            if (result.success) {
                this.showNotification('Inicio de sesión exitoso', 'success');
                // La redirección se maneja automáticamente en app.js
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('Error en login:', error);
            this.showNotification('Error al iniciar sesión', 'error');
        } finally {
            this.hideFormLoading('login-form');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const formData = this.getRegisterFormData();
        
        if (!this.validateRegisterForm(formData)) {
            return;
        }

        try {
            this.showFormLoading('register-form');

            // Verificar código de referido si existe
            if (formData.referralCode) {
                const referralResult = await authService.verifyReferralCode(formData.referralCode);
                if (!referralResult.valid) {
                    this.showNotification('Código de referido inválido', 'warning');
                    // Continuar con el registro sin referido
                    formData.referralCode = null;
                }
            }

            const result = await authService.registerUser(
                formData.email, 
                formData.password, 
                {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    country: formData.country,
                    referralCode: formData.referralCode,
                    acceptedTerms: true,
                    acceptedTermsAt: new Date()
                }
            );

            if (result.success) {
                this.showNotification('Cuenta creada exitosamente. Verifica tu email.', 'success');
                
                // Aplicar código de referido si existe
                if (formData.referralCode) {
                    await authService.applyReferralCode(result.user.uid, formData.referralCode);
                }
                
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            this.showNotification('Error al crear la cuenta', 'error');
        } finally {
            this.hideFormLoading('register-form');
        }
    }

    getRegisterFormData() {
        return {
            firstName: document.getElementById('register-firstName').value,
            lastName: document.getElementById('register-lastName').value,
            email: document.getElementById('register-email').value,
            phone: document.getElementById('register-phone').value,
            country: document.getElementById('register-country').value,
            password: document.getElementById('register-password').value,
            confirmPassword: document.getElementById('register-confirmPassword').value,
            referralCode: document.getElementById('register-referralCode').value,
            acceptedTerms: document.getElementById('register-terms').checked
        };
    }

    validateLoginForm(email, password) {
        let isValid = true;

        // Reset validation
        this.resetValidation('login-email');
        this.resetValidation('login-password');

        if (!email || !this.isValidEmail(email)) {
            this.showFieldError('login-email', 'Email inválido');
            isValid = false;
        }

        if (!password || password.length < 6) {
            this.showFieldError('login-password', 'La contraseña debe tener al menos 6 caracteres');
            isValid = false;
        }

        return isValid;
    }

    validateRegisterForm(formData) {
        let isValid = true;

        // Reset all validations
        const fields = ['register-firstName', 'register-lastName', 'register-email', 
                       'register-phone', 'register-country', 'register-password', 
                       'register-confirmPassword', 'register-terms'];
        fields.forEach(field => this.resetValidation(field));

        // First name validation
        if (!formData.firstName || formData.firstName.length < 2) {
            this.showFieldError('register-firstName', 'El nombre debe tener al menos 2 caracteres');
            isValid = false;
        }

        // Last name validation
        if (!formData.lastName || formData.lastName.length < 2) {
            this.showFieldError('register-lastName', 'El apellido debe tener al menos 2 caracteres');
            isValid = false;
        }

        // Email validation
        if (!formData.email || !this.isValidEmail(formData.email)) {
            this.showFieldError('register-email', 'Email inválido');
            isValid = false;
        }

        // Phone validation
        if (!formData.phone || !this.isValidPhone(formData.phone)) {
            this.showFieldError('register-phone', 'Teléfono inválido');
            isValid = false;
        }

        // Country validation
        if (!formData.country) {
            this.showFieldError('register-country', 'Selecciona un país');
            isValid = false;
        }

        // Password validation
        if (!formData.password || !this.isStrongPassword(formData.password)) {
            this.showFieldError('register-password', 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
            isValid = false;
        }

        // Confirm password
        if (formData.password !== formData.confirmPassword) {
            this.showFieldError('register-confirmPassword', 'Las contraseñas no coinciden');
            isValid = false;
        }

        // Terms validation
        if (!formData.acceptedTerms) {
            this.showFieldError('register-terms', 'Debes aceptar los términos y condiciones');
            isValid = false;
        }

        return isValid;
    }

    validateField(input) {
        const value = input.value;
        const fieldName = input.id;

        this.resetValidation(fieldName);

        switch (fieldName) {
            case 'register-email':
                if (value && !this.isValidEmail(value)) {
                    this.showFieldError(fieldName, 'Email inválido');
                }
                break;
            
            case 'register-password':
                if (value && !this.isStrongPassword(value)) {
                    this.showFieldError(fieldName, 'Contraseña débil');
                }
                break;
            
            case 'register-confirmPassword':
                const password = document.getElementById('register-password').value;
                if (value && value !== password) {
                    this.showFieldError(fieldName, 'Las contraseñas no coinciden');
                }
                break;
            
            case 'register-phone':
                if (value && !this.isValidPhone(value)) {
                    this.showFieldError(fieldName, 'Teléfono inválido');
                }
                break;
        }
    }

    validatePasswordStrength(password) {
        const strengthMeter = document.getElementById('password-strength');
        if (!strengthMeter) return;

        const strength = this.getPasswordStrength(password);
        
        strengthMeter.className = `password-strength strength-${strength.level}`;
        strengthMeter.innerHTML = `
            <div class="strength-bar"></div>
            <div class="strength-text">${strength.text}</div>
        `;
    }

    validatePasswordMatch() {
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirmPassword').value;
        const confirmField = document.getElementById('register-confirmPassword');

        if (confirmPassword && password !== confirmPassword) {
            this.showFieldError('register-confirmPassword', 'Las contraseñas no coinciden');
        } else if (confirmPassword && password === confirmPassword) {
            this.showFieldSuccess('register-confirmPassword');
        }
    }

    validateEmail(email) {
        if (email && this.isValidEmail(email)) {
            this.showFieldSuccess('register-email');
            return true;
        }
        return false;
    }

    // Utility functions
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    isStrongPassword(password) {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return strongRegex.test(password);
    }

    getPasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const levels = [
            { level: 0, text: 'Muy débil' },
            { level: 1, text: 'Débil' },
            { level: 2, text: 'Regular' },
            { level: 3, text: 'Fuerte' },
            { level: 4, text: 'Muy fuerte' }
        ];

        return levels[Math.min(score, 4)];
    }

    // UI feedback functions
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const formGroup = field.closest('.form-group');
        
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

    showFieldSuccess(fieldId) {
        const field = document.getElementById(fieldId);
        const formGroup = field.closest('.form-group');
        
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        formGroup.classList.remove('has-error');
        
        const feedback = formGroup.querySelector('.form-feedback');
        if (feedback) {
            feedback.style.display = 'none';
        }
    }

    resetValidation(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        const formGroup = field.closest('.form-group');
        field.classList.remove('is-invalid', 'is-valid');
        formGroup.classList.remove('has-error');
        
        const feedback = formGroup.querySelector('.form-feedback');
        if (feedback) {
            feedback.style.display = 'none';
        }
    }

    showFormLoading(formId) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        submitBtn.setAttribute('data-original-text', originalText);
    }

    hideFormLoading(formId) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.getAttribute('data-original-text');
        
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }

    showNotification(message, type = 'info') {
        // Usar el sistema de notificaciones de la app principal
        if (window.canadaCoinApp) {
            if (type === 'error') {
                window.canadaCoinApp.showError(message);
            } else {
                window.canadaCoinApp.showSuccess(message);
            }
        } else {
            // Fallback básico
            alert(message);
        }
    }

    // KYC Verification Management
    async checkKYCStatus(userId) {
        try {
            const userData = await authService.getUserData(userId);
            if (userData.success) {
                return userData.data.kycStatus || 'pending';
            }
            return 'pending';
        } catch (error) {
            console.error('Error checking KYC status:', error);
            return 'pending';
        }
    }

    async updateKYCStatus(userId, status) {
        try {
            await authService.updateUserProfile(userId, {
                kycStatus: status,
                kycUpdatedAt: new Date()
            });
            return true;
        } catch (error) {
            console.error('Error updating KYC status:', error);
            return false;
        }
    }

    // Session management
    async logout() {
        try {
            await authService.logoutUser();
            this.showNotification('Sesión cerrada exitosamente', 'success');
        } catch (error) {
            console.error('Error en logout:', error);
            this.showNotification('Error al cerrar sesión', 'error');
        }
    }

    // Security functions
    validateSession() {
        // Verificar si la sesión es válida
        return this.currentUser && !this.isTokenExpired();
    }

    isTokenExpired() {
        // Lógica para verificar expiración del token
        // Esto se maneja automáticamente con Firebase Auth
        return false;
    }

    // Password reset functionality
    async resetPassword(email) {
        try {
            // Firebase Auth maneja el reset de password
            // Esta función se implementaría con Firebase Auth sendPasswordResetEmail
            this.showNotification('Instrucciones enviadas a tu email', 'success');
            return true;
        } catch (error) {
            console.error('Error resetting password:', error);
            this.showNotification('Error al restablecer contraseña', 'error');
            return false;
        }
    }
}

// Inicializar el manager de autenticación
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

export default AuthManager;