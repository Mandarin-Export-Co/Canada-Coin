// js/withdrawals.js
// Sistema de Retiros - Canada Coin
// Solicitud, validación y seguimiento de retiros

import { withdrawalService } from '../firebase-config.js';

class WithdrawalManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Withdrawal modal events
        const withdrawalModal = document.getElementById('withdrawal-modal');
        if (withdrawalModal) {
            withdrawalModal.addEventListener('click', (e) => {
                if (e.target === withdrawalModal) {
                    this.closeWithdrawalModal();
                }
            });
        }

        // Withdrawal form submission
        const withdrawalForm = document.getElementById('withdrawal-form');
        if (withdrawalForm) {
            withdrawalForm.addEventListener('submit', (e) => this.handleWithdrawalSubmit(e));
        }

        // Amount validation
        const amountInput = document.getElementById('withdrawal-amount');
        if (amountInput) {
            amountInput.addEventListener('input', () => this.validateAmount());
        }

        // Method change
        const methodSelect = document.getElementById('withdrawal-method');
        if (methodSelect) {
            methodSelect.addEventListener('change', () => this.handleMethodChange());
        }
    }

    async handleWithdrawalSubmit(e) {
        e.preventDefault();
        
        if (!this.validateWithdrawalForm()) {
            return;
        }

        try {
            this.showWithdrawalLoading(true);

            const amount = parseFloat(document.getElementById('withdrawal-amount').value);
            const method = document.getElementById('withdrawal-method').value;
            const userId = window.canadaCoinApp?.currentUser?.uid;

            if (!userId) {
                throw new Error('Usuario no autenticado');
            }

            // Verificar saldo disponible
            const availableBalance = window.canadaCoinApp?.state.balance || 0;
            if (amount > availableBalance) {
                throw new Error('Saldo insuficiente para realizar el retiro');
            }

            const withdrawalData = {
                amount: amount,
                method: method,
                currency: 'USD',
                timestamp: new Date(),
                accountDetails: this.getAccountDetails(method)
            };

            const result = await withdrawalService.requestWithdrawal(
                userId, 
                withdrawalData
            );

            if (result.success) {
                this.showNotification('Solicitud de retiro enviada exitosamente', 'success');
                this.closeWithdrawalModal();
                this.resetWithdrawalForm();
                
                // Recargar datos del dashboard
                if (window.canadaCoinApp) {
                    await window.canadaCoinApp.loadUserData(userId);
                }
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Error submitting withdrawal:', error);
            this.showNotification(error.message || 'Error al enviar la solicitud de retiro', 'error');
        } finally {
            this.showWithdrawalLoading(false);
        }
    }

    validateWithdrawalForm() {
        let isValid = true;

        // Reset validations
        this.resetValidation('withdrawal-amount');
        this.resetValidation('withdrawal-method');

        // Amount validation
        const amount = document.getElementById('withdrawal-amount').value;
        const availableBalance = window.canadaCoinApp?.state.balance || 0;

        if (!amount || amount < 10) {
            this.showFieldError('withdrawal-amount', 'El monto mínimo de retiro es $10');
            isValid = false;
        } else if (amount > availableBalance) {
            this.showFieldError('withdrawal-amount', 'Saldo insuficiente');
            isValid = false;
        }

        // Method validation
        const method = document.getElementById('withdrawal-method').value;
        if (!method) {
            this.showFieldError('withdrawal-method', 'Selecciona un método de retiro');
            isValid = false;
        }

        return isValid;
    }

    validateAmount() {
        const amountInput = document.getElementById('withdrawal-amount');
        const amount = parseFloat(amountInput.value);
        const availableBalance = window.canadaCoinApp?.state.balance || 0;

        this.resetValidation('withdrawal-amount');

        if (amount && amount < 10) {
            this.showFieldError('withdrawal-amount', 'El monto mínimo es $10');
        } else if (amount && amount > availableBalance) {
            this.showFieldError('withdrawal-amount', 'Saldo insuficiente');
        } else if (amount) {
            this.showFieldSuccess('withdrawal-amount');
        }
    }

    handleMethodChange() {
        const method = document.getElementById('withdrawal-method').value;
        this.resetValidation('withdrawal-method');
        
        if (method) {
            this.showFieldSuccess('withdrawal-method');
            this.showMethodInstructions(method);
        }
    }

    showMethodInstructions(method) {
        // Podríamos mostrar instrucciones específicas por método aquí
        const instructions = {
            'bank-transfer': 'Proporciona los datos bancarios completos para la transferencia',
            'paypal': 'Asegúrate de que tu email de PayPal esté verificado'
        };

        if (instructions[method]) {
            console.log('Instructions for', method, ':', instructions[method]);
        }
    }

    getAccountDetails(method) {
        // En una implementación real, esto vendría de un formulario adicional
        // Por ahora, retornamos datos de ejemplo
        const details = {
            'bank-transfer': {
                bankName: 'Por definir',
                accountNumber: 'Por definir',
                accountHolder: 'Por definir'
            },
            'paypal': {
                email: 'Por definir'
            }
        };

        return details[method] || {};
    }

    showWithdrawalLoading(show) {
        const submitBtn = document.getElementById('submit-withdrawal');
        if (!submitBtn) return;

        if (show) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Solicitar Retiro';
        }
    }

    resetWithdrawalForm() {
        const form = document.getElementById('withdrawal-form');
        if (form) form.reset();
        
        // Reset validations
        this.resetValidation('withdrawal-amount');
        this.resetValidation('withdrawal-method');
    }

    closeWithdrawalModal() {
        const modal = document.getElementById('withdrawal-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    openWithdrawalModal() {
        const modal = document.getElementById('withdrawal-modal');
        if (modal) {
            modal.classList.add('active');
            this.resetWithdrawalForm();
            this.updateBalanceDisplay();
        }
    }

    updateBalanceDisplay() {
        const balanceElement = document.querySelector('#withdrawal-form [data-balance]');
        const availableBalance = window.canadaCoinApp?.state.balance || 0;
        
        if (balanceElement) {
            balanceElement.textContent = this.formatCurrency(availableBalance);
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

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Withdrawal status tracking
    getWithdrawalStatusText(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'processing': 'Procesando',
            'completed': 'Completado',
            'rejected': 'Rechazado',
            'cancelled': 'Cancelado'
        };
        
        return statusMap[status] || status;
    }

    getWithdrawalStatusClass(status) {
        const classMap = {
            'pending': 'warning',
            'processing': 'info',
            'completed': 'success',
            'rejected': 'error',
            'cancelled': 'secondary'
        };
        
        return classMap[status] || 'secondary';
    }

    getProcessingTime(method) {
        const processingTimes = {
            'bank-transfer': '3-5 días hábiles',
            'paypal': '1-3 días hábiles'
        };
        
        return processingTimes[method] || '3-5 días hábiles';
    }

    // Update withdrawals list
    updateWithdrawalsList(withdrawals) {
        const withdrawalsList = document.getElementById('withdrawals-list');
        if (!withdrawalsList) return;

        if (withdrawals.length === 0) {
            withdrawalsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No hay retiros</h3>
                    <p>No has realizado ninguna solicitud de retiro</p>
                </div>
            `;
            return;
        }

        withdrawalsList.innerHTML = withdrawals.map(withdrawal => `
            <div class="withdrawal-item card">
                <div class="withdrawal-header">
                    <div class="withdrawal-info">
                        <div class="withdrawal-amount">${this.formatCurrency(withdrawal.amount)}</div>
                        <div class="withdrawal-method">${this.getMethodText(withdrawal.method)}</div>
                    </div>
                    <div class="withdrawal-status ${this.getWithdrawalStatusClass(withdrawal.status)}">
                        ${this.getWithdrawalStatusText(withdrawal.status)}
                    </div>
                </div>
                <div class="withdrawal-details">
                    <div class="withdrawal-date">
                        <i class="fas fa-calendar"></i>
                        Solicitado: ${this.formatDate(withdrawal.createdAt)}
                    </div>
                    ${withdrawal.estimatedCompletion ? `
                        <div class="withdrawal-estimated">
                            <i class="fas fa-clock"></i>
                            Estimado: ${this.formatDate(withdrawal.estimatedCompletion)}
                        </div>
                    ` : ''}
                    <div class="withdrawal-processing">
                        <i class="fas fa-info-circle"></i>
                        Tiempo estimado: ${this.getProcessingTime(withdrawal.method)}
                    </div>
                </div>
                ${withdrawal.status === 'rejected' && withdrawal.rejectionReason ? `
                    <div class="withdrawal-rejection">
                        <strong>Motivo de rechazo:</strong> ${withdrawal.rejectionReason}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    getMethodText(method) {
        const methodMap = {
            'bank-transfer': 'Transferencia Bancaria',
            'paypal': 'PayPal'
        };
        
        return methodMap[method] || method;
    }

    formatDate(date) {
        if (!date) return '';
        
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return new Intl.DateTimeFormat('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(dateObj);
    }

    // Withdrawal limits and validation
    getWithdrawalLimits() {
        return {
            minAmount: 10,
            maxAmount: 10000,
            dailyLimit: 5000,
            monthlyLimit: 50000
        };
    }

    validateWithdrawalLimits(amount, userId) {
        const limits = this.getWithdrawalLimits();
        const today = new Date().toDateString();
        
        // En una implementación real, verificaríamos los retiros del día/mes
        // Por ahora, solo validamos los límites básicos
        
        if (amount < limits.minAmount) {
            return { valid: false, error: `El monto mínimo de retiro es ${this.formatCurrency(limits.minAmount)}` };
        }
        
        if (amount > limits.maxAmount) {
            return { valid: false, error: `El monto máximo por retiro es ${this.formatCurrency(limits.maxAmount)}` };
        }
        
        return { valid: true };
    }
}

// Inicializar el manager de retiros
document.addEventListener('DOMContentLoaded', () => {
    window.withdrawalManager = new WithdrawalManager();
});

export default WithdrawalManager;