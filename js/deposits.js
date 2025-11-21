// js/deposits.js
// Gestión de Depósitos - Canada Coin
// Subida de comprobantes, validación y seguimiento de depósitos

import { depositService } from '../firebase-config.js';

class DepositManager {
    constructor() {
        this.currentFile = null;
        this.uploadProgress = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initDragAndDrop();
    }

    setupEventListeners() {
        // Deposit modal events
        const depositModal = document.getElementById('deposit-modal');
        if (depositModal) {
            depositModal.addEventListener('click', (e) => {
                if (e.target === depositModal) {
                    this.closeDepositModal();
                }
            });
        }

        // Deposit form submission
        const depositForm = document.getElementById('deposit-form');
        if (depositForm) {
            depositForm.addEventListener('submit', (e) => this.handleDepositSubmit(e));
        }

        // File input change
        const fileInput = document.getElementById('receipt-file');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Remove file button
        const removeFileBtn = document.getElementById('remove-file');
        if (removeFileBtn) {
            removeFileBtn.addEventListener('click', () => this.removeSelectedFile());
        }

        // Amount validation
        const amountInput = document.getElementById('deposit-amount');
        if (amountInput) {
            amountInput.addEventListener('input', () => this.validateAmount());
        }

        // Method change
        const methodSelect = document.getElementById('deposit-method');
        if (methodSelect) {
            methodSelect.addEventListener('change', () => this.handleMethodChange());
        }
    }

    initDragAndDrop() {
        const dropZone = document.getElementById('drop-zone');
        if (!dropZone) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => this.highlightDropZone(), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => this.unhighlightDropZone(), false);
        });

        // Handle dropped files
        dropZone.addEventListener('drop', (e) => this.handleDrop(e), false);

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    highlightDropZone() {
        const dropZone = document.getElementById('drop-zone');
        dropZone.classList.add('dragover');
    }

    unhighlightDropZone() {
        const dropZone = document.getElementById('drop-zone');
        dropZone.classList.remove('dragover');
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    processFile(file) {
        // Validar archivo
        const validation = this.validateFile(file);
        if (!validation.valid) {
            this.showNotification(validation.error, 'error');
            return;
        }

        this.currentFile = file;
        this.showFilePreview(file);
        this.updateSubmitButton();
    }

    validateFile(file) {
        // Tipos MIME permitidos
        const allowedTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'application/pdf'
        ];

        // Tamaño máximo 5MB
        const maxSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Tipo de archivo no permitido. Use JPG, PNG o PDF.'
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

    showFilePreview(file) {
        const preview = document.getElementById('file-preview');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');

        if (preview && fileName && fileSize) {
            fileName.textContent = file.name;
            fileSize.textContent = this.formatFileSize(file.size);
            preview.style.display = 'flex';
        }

        // Si es una imagen, mostrar preview
        if (file.type.startsWith('image/')) {
            this.showImagePreview(file);
        }
    }

    showImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Podríamos mostrar una miniatura aquí si es necesario
            console.log('Image preview loaded');
        };
        reader.readAsDataURL(file);
    }

    removeSelectedFile() {
        this.currentFile = null;
        
        const preview = document.getElementById('file-preview');
        const fileInput = document.getElementById('receipt-file');
        
        if (preview) preview.style.display = 'none';
        if (fileInput) fileInput.value = '';
        
        this.updateSubmitButton();
    }

    async handleDepositSubmit(e) {
        e.preventDefault();
        
        if (!this.validateDepositForm()) {
            return;
        }

        try {
            this.showDepositLoading(true);

            const amount = parseFloat(document.getElementById('deposit-amount').value);
            const method = document.getElementById('deposit-method').value;
            const userId = window.canadaCoinApp?.currentUser?.uid;

            if (!userId) {
                throw new Error('Usuario no autenticado');
            }

            const depositData = {
                amount: amount,
                method: method,
                currency: 'USD',
                timestamp: new Date()
            };

            const result = await depositService.uploadDepositReceipt(
                this.currentFile, 
                userId, 
                depositData
            );

            if (result.success) {
                this.showNotification('Depósito enviado exitosamente. En revisión.', 'success');
                this.closeDepositModal();
                this.resetDepositForm();
                
                // Recargar datos del dashboard
                if (window.canadaCoinApp) {
                    await window.canadaCoinApp.loadUserData(userId);
                }
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Error submitting deposit:', error);
            this.showNotification(error.message || 'Error al enviar el depósito', 'error');
        } finally {
            this.showDepositLoading(false);
        }
    }

    validateDepositForm() {
        let isValid = true;

        // Reset validations
        this.resetValidation('deposit-amount');
        this.resetValidation('deposit-method');

        // Amount validation
        const amount = document.getElementById('deposit-amount').value;
        if (!amount || amount < 10) {
            this.showFieldError('deposit-amount', 'El monto mínimo es $10');
            isValid = false;
        }

        // Method validation
        const method = document.getElementById('deposit-method').value;
        if (!method) {
            this.showFieldError('deposit-method', 'Selecciona un método de pago');
            isValid = false;
        }

        // File validation
        if (!this.currentFile) {
            this.showNotification('Debes subir un comprobante de pago', 'error');
            isValid = false;
        }

        return isValid;
    }

    validateAmount() {
        const amountInput = document.getElementById('deposit-amount');
        const amount = parseFloat(amountInput.value);

        this.resetValidation('deposit-amount');

        if (amount && amount < 10) {
            this.showFieldError('deposit-amount', 'El monto mínimo es $10');
        } else if (amount) {
            this.showFieldSuccess('deposit-amount');
        }
    }

    handleMethodChange() {
        const method = document.getElementById('deposit-method').value;
        this.resetValidation('deposit-method');
        
        if (method) {
            this.showFieldSuccess('deposit-method');
        }
    }

    updateSubmitButton() {
        const submitBtn = document.getElementById('submit-deposit');
        if (submitBtn) {
            submitBtn.disabled = !this.currentFile;
        }
    }

    showDepositLoading(show) {
        const submitBtn = document.getElementById('submit-deposit');
        if (!submitBtn) return;

        if (show) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirmar Depósito';
        }
    }

    resetDepositForm() {
        const form = document.getElementById('deposit-form');
        if (form) form.reset();
        
        this.removeSelectedFile();
        this.currentFile = null;
        
        // Reset validations
        this.resetValidation('deposit-amount');
        this.resetValidation('deposit-method');
    }

    closeDepositModal() {
        const modal = document.getElementById('deposit-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    openDepositModal() {
        const modal = document.getElementById('deposit-modal');
        if (modal) {
            modal.classList.add('active');
            this.resetDepositForm();
        }
    }

    // UI Helper functions
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

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Deposit status tracking
    getDepositStatusText(status) {
        const statusMap = {
            'pending': 'En revisión',
            'approved': 'Aprobado',
            'rejected': 'Rechazado',
            'processing': 'Procesando'
        };
        
        return statusMap[status] || status;
    }

    getDepositStatusClass(status) {
        const classMap = {
            'pending': 'warning',
            'approved': 'success',
            'rejected': 'error',
            'processing': 'info'
        };
        
        return classMap[status] || 'secondary';
    }

    // Update deposit list in real-time
    setupDepositsListener(userId) {
        if (this.depositsUnsubscribe) {
            this.depositsUnsubscribe();
        }

        this.depositsUnsubscribe = depositService.listenToUserDeposits(
            userId,
            (deposits) => {
                this.updateDepositsList(deposits);
            }
        );
    }

    updateDepositsList(deposits) {
        const depositsList = document.getElementById('deposits-list');
        if (!depositsList) return;

        if (deposits.length === 0) {
            depositsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No hay depósitos</h3>
                    <p>Realiza tu primer depósito para comenzar a invertir</p>
                </div>
            `;
            return;
        }

        depositsList.innerHTML = deposits.map(deposit => `
            <div class="deposit-item card">
                <div class="deposit-header">
                    <div class="deposit-info">
                        <div class="deposit-amount">${this.formatCurrency(deposit.amount)}</div>
                        <div class="deposit-method">${this.getMethodText(deposit.method)}</div>
                    </div>
                    <div class="deposit-status ${this.getDepositStatusClass(deposit.status)}">
                        ${this.getDepositStatusText(deposit.status)}
                    </div>
                </div>
                <div class="deposit-details">
                    <div class="deposit-date">
                        <i class="fas fa-calendar"></i>
                        ${this.formatDate(deposit.createdAt)}
                    </div>
                    ${deposit.receiptURL ? `
                        <div class="deposit-receipt">
                            <a href="${deposit.receiptURL}" target="_blank" class="btn btn-sm btn-outline">
                                <i class="fas fa-file-invoice"></i> Ver comprobante
                            </a>
                        </div>
                    ` : ''}
                </div>
                ${deposit.status === 'rejected' && deposit.rejectionReason ? `
                    <div class="deposit-rejection">
                        <strong>Motivo de rechazo:</strong> ${deposit.rejectionReason}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    getMethodText(method) {
        const methodMap = {
            'bank-transfer': 'Transferencia Bancaria',
            'paypal': 'PayPal',
            'crypto': 'Criptomonedas'
        };
        
        return methodMap[method] || method;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(date) {
        if (!date) return '';
        
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return new Intl.DateTimeFormat('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(dateObj);
    }
}

// Inicializar el manager de depósitos
document.addEventListener('DOMContentLoaded', () => {
    window.depositManager = new DepositManager();
});

export default DepositManager;