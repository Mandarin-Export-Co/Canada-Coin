// js/profile.js
// Gestión de Perfil - Canada Coin
// Edición de datos personales, KYC y configuración

import { authService } from '../firebase-config.js';

class ProfileManager {
    constructor() {
        this.countries = [];
        this.languages = [
            { code: 'es', name: 'Español' },
            { code: 'en', name: 'English' }
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCountries();
        this.loadProfileData();
    }

    setupEventListeners() {
        // Profile form submission
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        // KYC verification
        const kycVerifyBtn = document.getElementById('verify-kyc');
        if (kycVerifyBtn) {
            kycVerifyBtn.addEventListener('click', () => this.initiateKYCVerification());
        }

        // Language selector
        const languageSelector = document.getElementById('language-selector');
        if (languageSelector) {
            languageSelector.addEventListener('change', (e) => this.handleLanguageChange(e.target.value));
        }

        // Theme selector
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => this.handleThemeChange(e.target.value));
        }

        // Password change
        const changePasswordBtn = document.getElementById('change-password');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.showPasswordChangeModal());
        }

        // Document upload for KYC
        const kycDocumentInput = document.getElementById('kyc-document');
        if (kycDocumentInput) {
            kycDocumentInput.addEventListener('change', (e) => this.handleKYCDocumentUpload(e));
        }
    }

    async loadCountries() {
        // Cargar lista de países (en producción vendría de una API)
        this.countries = await this.fetchCountries();
        this.populateCountrySelectors();
    }

    async fetchCountries() {
        // Lista de países para desarrollo
        return [
            { code: 'US', name: 'Estados Unidos' },
            { code: 'CA', name: 'Canadá' },
            { code: 'MX', name: 'México' },
            { code: 'ES', name: 'España' },
            { code: 'AR', name: 'Argentina' },
            { code: 'CO', name: 'Colombia' },
            { code: 'CL', name: 'Chile' },
            { code: 'PE', name: 'Perú' },
            { code: 'BR', name: 'Brasil' },
            { code: 'DE', name: 'Alemania' },
            { code: 'FR', name: 'Francia' },
            { code: 'IT', name: 'Italia' },
            { code: 'GB', name: 'Reino Unido' }
        ];
    }

    populateCountrySelectors() {
        const selectors = document.querySelectorAll('select[id*="country"]');
        selectors.forEach(selector => {
            selector.innerHTML = '<option value="">Selecciona un país</option>' +
                this.countries.map(country => 
                    `<option value="${country.code}">${country.name}</option>`
                ).join('');
        });
    }

    async loadProfileData() {
        const userId = window.canadaCoinApp?.currentUser?.uid;
        if (!userId) return;

        try {
            const result = await authService.getUserData(userId);
            if (result.success) {
                this.populateProfileForm(result.data);
                this.updateKYCStatus(result.data.kycStatus);
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
        }
    }

    populateProfileForm(userData) {
        const form = document.getElementById('profile-form');
        if (!form) return;

        const fields = ['firstName', 'lastName', 'email', 'phone', 'country'];
        fields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input && userData[field]) {
                input.value = userData[field];
            }
        });

        // Actualizar información de solo lectura
        const emailInput = document.getElementById('profile-email');
        if (emailInput) {
            emailInput.value = userData.email || window.canadaCoinApp?.currentUser?.email || '';
        }

        // Cargar preferencias
        this.loadUserPreferences(userData);
    }

    loadUserPreferences(userData) {
        // Idioma
        const languageSelector = document.getElementById('language-selector');
        if (languageSelector && userData.language) {
            languageSelector.value = userData.language;
        }

        // Tema
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector && userData.theme) {
            themeSelector.value = userData.theme;
        }

        // Otras preferencias
        const notificationsEnabled = document.getElementById('notifications-enabled');
        if (notificationsEnabled && userData.notificationsEnabled !== undefined) {
            notificationsEnabled.checked = userData.notificationsEnabled;
        }

        const marketingEmails = document.getElementById('marketing-emails');
        if (marketingEmails && userData.marketingEmails !== undefined) {
            marketingEmails.checked = userData.marketingEmails;
        }
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        
        if (!this.validateProfileForm()) {
            return;
        }

        try {
            this.showFormLoading(true);

            const formData = this.getProfileFormData();
            const userId = window.canadaCoinApp?.currentUser?.uid;

            if (!userId) {
                throw new Error('Usuario no autenticado');
            }

            const result = await authService.updateUserProfile(userId, formData);

            if (result.success) {
                this.showNotification('Perfil actualizado exitosamente', 'success');
                
                // Actualizar datos en la app principal
                if (window.canadaCoinApp) {
                    await window.canadaCoinApp.loadUserData(userId);
                }
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification(error.message || 'Error al actualizar el perfil', 'error');
        } finally {
            this.showFormLoading(false);
        }
    }

    getProfileFormData() {
        return {
            firstName: document.getElementById('profile-firstName').value,
            lastName: document.getElementById('profile-lastName').value,
            phone: document.getElementById('profile-phone').value,
            country: document.getElementById('profile-country').value,
            updatedAt: new Date()
        };
    }

    validateProfileForm() {
        let isValid = true;

        // Reset validations
        this.resetValidation('profile-firstName');
        this.resetValidation('profile-lastName');
        this.resetValidation('profile-phone');
        this.resetValidation('profile-country');

        // First name validation
        const firstName = document.getElementById('profile-firstName').value;
        if (!firstName || firstName.length < 2) {
            this.showFieldError('profile-firstName', 'El nombre debe tener al menos 2 caracteres');
            isValid = false;
        }

        // Last name validation
        const lastName = document.getElementById('profile-lastName').value;
        if (!lastName || lastName.length < 2) {
            this.showFieldError('profile-lastName', 'El apellido debe tener al menos 2 caracteres');
            isValid = false;
        }

        // Phone validation
        const phone = document.getElementById('profile-phone').value;
        if (!phone || !this.isValidPhone(phone)) {
            this.showFieldError('profile-phone', 'Teléfono inválido');
            isValid = false;
        }

        // Country validation
        const country = document.getElementById('profile-country').value;
        if (!country) {
            this.showFieldError('profile-country', 'Selecciona un país');
            isValid = false;
        }

        return isValid;
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    async initiateKYCVerification() {
        const userId = window.canadaCoinApp?.currentUser?.uid;
        if (!userId) return;

        try {
            this.showNotification('Iniciando proceso de verificación KYC...', 'info');
            
            // Mostrar modal de documentación KYC
            this.showKYCModal();
            
        } catch (error) {
            console.error('Error initiating KYC:', error);
            this.showNotification('Error al iniciar la verificación KYC', 'error');
        }
    }

    showKYCModal() {
        const modal = document.getElementById('kyc-modal') || this.createKYCModal();
        modal.classList.add('active');
    }

    createKYCModal() {
        const modal = document.createElement('div');
        modal.id = 'kyc-modal';
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal modal-lg">
                <div class="modal-header">
                    <h3 class="modal-title">Verificación KYC/AML</h3>
                    <button class="modal-close" data-modal-close="kyc-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="kyc-steps">
                        <div class="kyc-step active">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h4>Información Personal</h4>
                                <p>Verifica que tu información personal sea correcta</p>
                            </div>
                        </div>
                        <div class="kyc-step">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h4>Documento de Identidad</h4>
                                <p>Sube una foto de tu documento de identidad</p>
                            </div>
                        </div>
                        <div class="kyc-step">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h4>Verificación Facial</h4>
                                <p>Toma una selfie para verificar tu identidad</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="kyc-document-upload">
                        <h4>Documento de Identidad</h4>
                        <p>Sube una foto clara de tu documento de identidad (DNI, pasaporte o licencia)</p>
                        
                        <div class="drag-drop-zone" id="kyc-drop-zone">
                            <input type="file" id="kyc-document" class="drag-drop-file-input" accept=".jpg,.jpeg,.png">
                            <div class="drag-drop-icon">
                                <i class="fas fa-id-card"></i>
                            </div>
                            <div class="drag-drop-text">
                                Arrastra tu documento aquí o haz clic para seleccionar
                            </div>
                            <div class="drag-drop-hint">
                                Formatos permitidos: JPG, PNG (Máx. 5MB)
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-modal-close="kyc-modal">Cancelar</button>
                    <button class="btn btn-primary" id="submit-kyc" disabled>Enviar para Verificación</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('[data-modal-close="kyc-modal"]').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        const kycDocumentInput = modal.querySelector('#kyc-document');
        if (kycDocumentInput) {
            kycDocumentInput.addEventListener('change', (e) => this.handleKYCDocumentUpload(e));
        }
        
        return modal;
    }

    async handleKYCDocumentUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validar archivo
        const validation = this.validateKYCDocument(file);
        if (!validation.valid) {
            this.showNotification(validation.error, 'error');
            return;
        }

        try {
            // Aquí subiríamos el documento a Firebase Storage
            // Por ahora, simulamos la subida
            this.showNotification('Documento subido exitosamente', 'success');
            
            // Habilitar botón de envío
            const submitBtn = document.getElementById('submit-kyc');
            if (submitBtn) {
                submitBtn.disabled = false;
            }

            // Actualizar estado KYC a "en revisión"
            await this.updateKYCStatus('under_review');

        } catch (error) {
            console.error('Error uploading KYC document:', error);
            this.showNotification('Error al subir el documento', 'error');
        }
    }

    validateKYCDocument(file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Tipo de archivo no permitido. Use JPG o PNG.'
            };
        }

        if (file.size > maxSize) {
            return {
                valid: false,
                error: 'El archivo es demasiado grande. Máximo 5MB.'
            };
        }

        return { valid: true };
    }

    async updateKYCStatus(status) {
        const userId = window.canadaCoinApp?.currentUser?.uid;
        if (!userId) return;

        try {
            await authService.updateUserProfile(userId, {
                kycStatus: status,
                kycUpdatedAt: new Date()
            });

            this.showKYCStatus(status);
            
            if (window.canadaCoinApp) {
                await window.canadaCoinApp.loadUserData(userId);
            }

        } catch (error) {
            console.error('Error updating KYC status:', error);
        }
    }

    showKYCStatus(status) {
        const kycStatusElement = document.getElementById('kyc-status');
        if (!kycStatusElement) return;

        const statusMap = {
            'pending': { text: 'Pendiente', class: 'pending' },
            'under_review': { text: 'En Revisión', class: 'warning' },
            'verified': { text: 'Verificado', class: 'success' },
            'rejected': { text: 'Rechazado', class: 'error' }
        };

        const statusInfo = statusMap[status] || statusMap.pending;
        
        kycStatusElement.textContent = statusInfo.text;
        kycStatusElement.className = `kyc-status ${statusInfo.class}`;
    }

    async handleLanguageChange(language) {
        try {
            // Actualizar preferencia de idioma
            const userId = window.canadaCoinApp?.currentUser?.uid;
            if (userId) {
                await authService.updateUserProfile(userId, {
                    language: language,
                    preferencesUpdatedAt: new Date()
                });
            }

            // Aplicar cambio de idioma en la UI
            this.applyLanguage(language);
            this.showNotification('Idioma actualizado', 'success');

        } catch (error) {
            console.error('Error changing language:', error);
            this.showNotification('Error al cambiar el idioma', 'error');
        }
    }

    applyLanguage(language) {
        // En una implementación completa, aquí cargaríamos las traducciones
        document.documentElement.lang = language;
        
        // Disparar evento para que otros componentes se actualicen
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
    }

    async handleThemeChange(theme) {
        try {
            // Actualizar preferencia de tema
            const userId = window.canadaCoinApp?.currentUser?.uid;
            if (userId) {
                await authService.updateUserProfile(userId, {
                    theme: theme,
                    preferencesUpdatedAt: new Date()
                });
            }

            // Aplicar cambio de tema
            this.applyTheme(theme);
            this.showNotification('Tema actualizado', 'success');

        } catch (error) {
            console.error('Error changing theme:', error);
            this.showNotification('Error al cambiar el tema', 'error');
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Disparar evento para que otros componentes se actualicen
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    showPasswordChangeModal() {
        const modal = document.getElementById('password-modal') || this.createPasswordModal();
        modal.classList.add('active');
    }

    createPasswordModal() {
        const modal = document.createElement('div');
        modal.id = 'password-modal';
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Cambiar Contraseña</h3>
                    <button class="modal-close" data-modal-close="password-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="password-form">
                        <div class="form-group">
                            <label for="current-password" class="form-label">Contraseña Actual</label>
                            <input type="password" id="current-password" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="new-password" class="form-label">Nueva Contraseña</label>
                            <input type="password" id="new-password" class="form-control" required>
                            <div class="password-strength" id="password-strength"></div>
                        </div>
                        <div class="form-group">
                            <label for="confirm-password" class="form-label">Confirmar Nueva Contraseña</label>
                            <input type="password" id="confirm-password" class="form-control" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-modal-close="password-modal">Cancelar</button>
                    <button class="btn btn-primary" id="submit-password">Cambiar Contraseña</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('[data-modal-close="password-modal"]').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        modal.querySelector('#submit-password').addEventListener('click', () => {
            this.handlePasswordChange();
        });
        
        // Password strength indicator
        const newPasswordInput = modal.querySelector('#new-password');
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', (e) => {
                this.validatePasswordStrength(e.target.value);
            });
        }
        
        return modal;
    }

    async handlePasswordChange() {
        // Implementar cambio de contraseña
        this.showNotification('Funcionalidad de cambio de contraseña en desarrollo', 'info');
    }

    validatePasswordStrength(password) {
        const strengthMeter = document.getElementById('password-strength');
        if (!strengthMeter) return;

        let strength = 0;
        let text = '';

        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const strengthText = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
        const strengthClass = ['very-weak', 'weak', 'medium', 'strong', 'very-strong'];

        strengthMeter.className = `password-strength ${strengthClass[strength - 1] || 'very-weak'}`;
        strengthMeter.textContent = strengthText[strength - 1] || 'Muy débil';
    }

    // UI Helper functions
    showFormLoading(show) {
        const submitBtn = document.querySelector('#profile-form button[type="submit"]');
        if (!submitBtn) return;

        if (show) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar Cambios';
        }
    }

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

    showNotification(message, type = 'info') {
        if (window.canadaCoinApp) {
            if (type === 'error') {
                window.canadaCoinApp.showError(message);
            } else {
                window.canadaCoinApp.showSuccess(message);
            }
        } else {
            alert(message);
        }
    }

    // Account security methods
    async enableTwoFactorAuth() {
        // Implementar 2FA
        this.showNotification('Autenticación de dos factores en desarrollo', 'info');
    }

    async viewLoginHistory() {
        // Mostrar historial de inicios de sesión
        this.showNotification('Historial de inicios de sesión en desarrollo', 'info');
    }

    // Data export functionality
    async exportUserData() {
        const userId = window.canadaCoinApp?.currentUser?.uid;
        if (!userId) return;

        try {
            const userData = await authService.getUserData(userId);
            if (userData.success) {
                this.downloadUserData(userData.data);
            }
        } catch (error) {
            console.error('Error exporting user data:', error);
            this.showNotification('Error al exportar datos', 'error');
        }
    }

    downloadUserData(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `canada-coin-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Datos exportados exitosamente', 'success');
    }
}

// Inicializar el manager de perfil
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});

export default ProfileManager;