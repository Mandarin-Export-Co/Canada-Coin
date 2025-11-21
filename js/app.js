// js/app.js
// Canada Coin - Aplicación Principal
// Estado global, enrutamiento y lógica central de la plataforma financiera

import { 
    authService, 
    depositService, 
    withdrawalService, 
    transactionService, 
    referralService 
} from '../firebase-config.js';

class CanadaCoinApp {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.currentView = 'dashboard';
        this.isLoading = false;
        
        // Estado global de la aplicación
        this.state = {
            user: null,
            balance: 0,
            transactions: [],
            deposits: [],
            withdrawals: [],
            referrals: [],
            kycStatus: 'pending',
            language: 'es',
            theme: 'light'
        };

        this.init();
    }

    // Inicialización de la aplicación
    async init() {
        try {
            this.showLoading();
            
            // Configurar listeners de autenticación
            this.setupAuthListeners();
            
            // Inicializar UI
            this.initUI();
            
            // Configurar enrutamiento
            this.setupRouting();
            
            // Cargar datos iniciales
            await this.loadInitialData();
            
            this.hideLoading();
            
            console.log('✅ Canada Coin App inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando la app:', error);
            this.showError('Error al inicializar la aplicación');
        }
    }

    // Configurar listeners de autenticación
    setupAuthListeners() {
        authService.onAuthStateChange(async (user) => {
            if (user) {
                this.currentUser = user;
                await this.loadUserData(user.uid);
                this.showAuthenticatedUI();
                this.navigateTo('dashboard');
            } else {
                this.currentUser = null;
                this.userData = null;
                this.showUnauthenticatedUI();
                this.navigateTo('login');
            }
        });
    }

    // Cargar datos del usuario
    async loadUserData(uid) {
        try {
            this.showLoading();
            
            const result = await authService.getUserData(uid);
            if (result.success) {
                this.userData = result.data;
                this.state.user = result.data;
                this.state.balance = result.data.balance || 0;
                this.state.kycStatus = result.data.kycStatus || 'pending';
                
                // Cargar datos adicionales en paralelo
                await Promise.all([
                    this.loadTransactions(uid),
                    this.loadDeposits(uid),
                    this.loadWithdrawals(uid),
                    this.loadReferralStats(uid)
                ]);
                
                this.updateUI();
            } else {
                throw new Error(result.error);
            }
            
            this.hideLoading();
        } catch (error) {
            console.error('Error cargando datos del usuario:', error);
            this.showError('Error al cargar datos del usuario');
        }
    }

    // Cargar transacciones
    async loadTransactions(userId) {
        const result = await transactionService.getUserTransactions(userId, 10);
        if (result.success) {
            this.state.transactions = result.transactions;
        }
    }

    // Cargar depósitos
    async loadDeposits(userId) {
        const result = await depositService.getUserDeposits(userId);
        if (result.success) {
            this.state.deposits = result.deposits;
        }
    }

    // Cargar retiros
    async loadWithdrawals(userId) {
        const result = await withdrawalService.getUserWithdrawals(userId);
        if (result.success) {
            this.state.withdrawals = result.withdrawals;
        }
    }

    // Cargar estadísticas de referidos
    async loadReferralStats(userId) {
        const result = await referralService.getReferralStats(userId);
        if (result.success) {
            this.state.referrals = result.stats;
        }
    }

    // Configurar enrutamiento
    setupRouting() {
        // Manejar cambios de hash en la URL
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });

        // Manejar carga inicial
        window.addEventListener('load', () => {
            this.handleRouteChange();
        });
    }

    // Manejar cambios de ruta
    handleRouteChange() {
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        this.navigateTo(hash);
    }

    // Navegar a una vista específica
    navigateTo(view, params = {}) {
        this.currentView = view;
        
        // Actualizar URL
        window.location.hash = view;
        
        // Ocultar todas las vistas
        this.hideAllViews();
        
        // Mostrar vista actual
        this.showView(view);
        
        // Ejecutar lógica específica de la vista
        this.executeViewLogic(view, params);
        
        // Actualizar navegación activa
        this.updateActiveNavigation(view);
    }

    // Ocultar todas las vistas
    hideAllViews() {
        const views = document.querySelectorAll('[data-view]');
        views.forEach(view => {
            view.style.display = 'none';
        });
    }

    // Mostrar vista específica
    showView(view) {
        const viewElement = document.querySelector(`[data-view="${view}"]`);
        if (viewElement) {
            viewElement.style.display = 'block';
        }
    }

    // Ejecutar lógica específica de la vista
    executeViewLogic(view, params) {
        switch (view) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'deposits':
                this.loadDepositsView();
                break;
            case 'withdrawals':
                this.loadWithdrawalsView();
                break;
            case 'performance':
                this.loadPerformanceView();
                break;
            case 'referrals':
                this.loadReferralsView();
                break;
            case 'profile':
                this.loadProfileView();
                break;
            case 'help':
                this.loadHelpView();
                break;
        }
    }

    // Actualizar navegación activa
    updateActiveNavigation(view) {
        // Remover clase active de todos los enlaces
        const navLinks = document.querySelectorAll('[data-nav]');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Agregar clase active al enlace actual
        const activeLink = document.querySelector(`[data-nav="${view}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Cargar datos del dashboard
    async loadDashboardData() {
        if (!this.currentUser) return;
        
        try {
            // Actualizar datos en tiempo real
            await this.loadUserData(this.currentUser.uid);
            
            // Actualizar métricas del dashboard
            this.updateDashboardMetrics();
            
            // Inicializar gráficos si existen
            this.initDashboardCharts();
            
        } catch (error) {
            console.error('Error cargando datos del dashboard:', error);
        }
    }

    // Actualizar métricas del dashboard
    updateDashboardMetrics() {
        // Actualizar saldo total
        const balanceElement = document.getElementById('total-balance');
        if (balanceElement) {
            balanceElement.textContent = this.formatCurrency(this.state.balance);
        }
        
        // Actualizar ganancias totales
        const earningsElement = document.getElementById('total-earnings');
        if (earningsElement && this.userData) {
            earningsElement.textContent = this.formatCurrency(this.userData.totalEarnings || 0);
        }
        
        // Actualizar depósitos totales
        const depositsElement = document.getElementById('total-deposits');
        if (depositsElement && this.userData) {
            depositsElement.textContent = this.formatCurrency(this.userData.totalDeposits || 0);
        }
        
        // Actualizar transacciones recientes
        this.updateRecentTransactions();
    }

    // Formatear moneda
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Actualizar transacciones recientes
    updateRecentTransactions() {
        const transactionsContainer = document.getElementById('recent-transactions');
        if (!transactionsContainer) return;
        
        const recentTransactions = this.state.transactions.slice(0, 5);
        
        transactionsContainer.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-type ${transaction.type}">
                    <i class="fas ${transaction.type === 'deposit' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-description">
                        ${transaction.type === 'deposit' ? 'Depósito' : 'Retiro'} - ${transaction.method}
                    </div>
                    <div class="transaction-date">
                        ${this.formatDate(transaction.date)}
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'deposit' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </div>
                <div class="transaction-status ${transaction.status}">
                    ${this.getStatusText(transaction.status)}
                </div>
            </div>
        `).join('');
    }

    // Formatear fecha
    formatDate(date) {
        if (!date) return '';
        
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return new Intl.DateTimeFormat('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(dateObj);
    }

    // Obtener texto del estado
    getStatusText(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'completed': 'Completado',
            'processing': 'Procesando',
            'approved': 'Aprobado',
            'rejected': 'Rechazado'
        };
        
        return statusMap[status] || status;
    }

    // Inicializar gráficos del dashboard
    initDashboardCharts() {
        // Esta función se implementará en charts.js
        if (window.initPerformanceCharts) {
            window.initPerformanceCharts(this.state);
        }
    }

    // Cargar vista de depósitos
    loadDepositsView() {
        if (!this.currentUser) return;
        
        this.updateDepositsList();
        
        // Configurar listener en tiempo real para depósitos
        if (this.depositsUnsubscribe) {
            this.depositsUnsubscribe();
        }
        
        this.depositsUnsubscribe = depositService.listenToUserDeposits(
            this.currentUser.uid,
            (deposits) => {
                this.state.deposits = deposits;
                this.updateDepositsList();
            }
        );
    }

    // Actualizar lista de depósitos
    updateDepositsList() {
        const depositsContainer = document.getElementById('deposits-list');
        if (!depositsContainer) return;
        
        depositsContainer.innerHTML = this.state.deposits.map(deposit => `
            <div class="deposit-item card">
                <div class="deposit-header">
                    <div class="deposit-amount">${this.formatCurrency(deposit.amount)}</div>
                    <div class="deposit-status ${deposit.status}">
                        ${this.getStatusText(deposit.status)}
                    </div>
                </div>
                <div class="deposit-details">
                    <div class="deposit-method">Método: ${deposit.method}</div>
                    <div class="deposit-date">Fecha: ${this.formatDate(deposit.createdAt)}</div>
                    ${deposit.receiptURL ? `
                        <div class="deposit-receipt">
                            <a href="${deposit.receiptURL}" target="_blank" class="btn btn-sm btn-outline">
                                <i class="fas fa-file-invoice"></i> Ver comprobante
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Cargar vista de retiros
    loadWithdrawalsView() {
        if (!this.currentUser) return;
        
        this.updateWithdrawalsList();
    }

    // Actualizar lista de retiros
    updateWithdrawalsList() {
        const withdrawalsContainer = document.getElementById('withdrawals-list');
        if (!withdrawalsContainer) return;
        
        withdrawalsContainer.innerHTML = this.state.withdrawals.map(withdrawal => `
            <div class="withdrawal-item card">
                <div class="withdrawal-header">
                    <div class="withdrawal-amount">${this.formatCurrency(withdrawal.amount)}</div>
                    <div class="withdrawal-status ${withdrawal.status}">
                        ${this.getStatusText(withdrawal.status)}
                    </div>
                </div>
                <div class="withdrawal-details">
                    <div class="withdrawal-method">Método: ${withdrawal.method}</div>
                    <div class="withdrawal-date">Solicitado: ${this.formatDate(withdrawal.createdAt)}</div>
                    ${withdrawal.estimatedCompletion ? `
                        <div class="withdrawal-estimated">
                            Estimado: ${this.formatDate(withdrawal.estimatedCompletion)}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Cargar vista de rendimiento
    loadPerformanceView() {
        if (!this.currentUser) return;
        
        // Inicializar gráficos de rendimiento
        if (window.initPerformanceCharts) {
            window.initPerformanceCharts(this.state);
        }
    }

    // Cargar vista de referidos
    loadReferralsView() {
        if (!this.currentUser) return;
        
        this.updateReferralsInfo();
    }

    // Actualizar información de referidos
    updateReferralsInfo() {
        // Actualizar código de referido
        const referralCodeElement = document.getElementById('referral-code');
        if (referralCodeElement && this.userData) {
            referralCodeElement.textContent = this.userData.referralCode;
        }
        
        // Actualizar estadísticas
        const statsElement = document.getElementById('referral-stats');
        if (statsElement) {
            statsElement.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${this.state.referrals.totalReferrals || 0}</div>
                    <div class="stat-label">Total Referidos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.state.referrals.completedReferrals || 0}</div>
                    <div class="stat-label">Referidos Activos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.formatCurrency(this.state.referrals.totalBonus || 0)}</div>
                    <div class="stat-label">Bonos Ganados</div>
                </div>
            `;
        }
    }

    // Cargar vista de perfil
    loadProfileView() {
        if (!this.currentUser || !this.userData) return;
        
        this.updateProfileForm();
    }

    // Actualizar formulario de perfil
    updateProfileForm() {
        const profileForm = document.getElementById('profile-form');
        if (!profileForm) return;
        
        // Llenar formulario con datos actuales
        const fields = ['firstName', 'lastName', 'email', 'phone', 'country'];
        fields.forEach(field => {
            const input = profileForm.querySelector(`[name="${field}"]`);
            if (input && this.userData[field]) {
                input.value = this.userData[field];
            }
        });
        
        // Actualizar estado KYC
        const kycStatusElement = document.getElementById('kyc-status');
        if (kycStatusElement) {
            kycStatusElement.textContent = this.getStatusText(this.state.kycStatus);
            kycStatusElement.className = `kyc-status ${this.state.kycStatus}`;
        }
    }

    // Cargar vista de ayuda
    loadHelpView() {
        // Cargar FAQ y contenido de ayuda
        this.loadFAQContent();
    }

    // Cargar contenido FAQ
    loadFAQContent() {
        const faqContainer = document.getElementById('faq-content');
        if (!faqContainer) return;
        
        faqContainer.innerHTML = `
            <div class="faq-section">
                <h3>Depósitos</h3>
                <div class="faq-item">
                    <div class="faq-question">¿Cómo realizar un depósito?</div>
                    <div class="faq-answer">
                        Ve a la sección de Depósitos, selecciona el monto y método de pago, 
                        sube el comprobante y confirma la operación.
                    </div>
                </div>
                <div class="faq-item">
                    <div class="faq-question">¿Cuánto tarda en acreditarse un depósito?</div>
                    <div class="faq-answer">
                        Los depósitos se acreditan en un plazo de 1 a 24 horas hábiles después 
                        de la verificación del comprobante.
                    </div>
                </div>
            </div>
            
            <div class="faq-section">
                <h3>Retiros</h3>
                <div class="faq-item">
                    <div class="faq-question">¿Cómo solicitar un retiro?</div>
                    <div class="faq-answer">
                        En la sección de Retiros, ingresa el monto a retirar, selecciona el método 
                        y confirma la solicitud.
                    </div>
                </div>
                <div class="faq-item">
                    <div class="faq-question">¿Cuál es el tiempo de procesamiento?</div>
                    <div class="faq-answer">
                        Los retiros se procesan en 3-5 días hábiles dependiendo del método seleccionado.
                    </div>
                </div>
            </div>
            
            <div class="faq-section">
                <h3>Referidos</h3>
                <div class="faq-item">
                    <div class="faq-question">¿Cómo funciona el programa de referidos?</div>
                    <div class="faq-answer">
                        Comparte tu código único de referido. Por cada persona que se registre 
                        usando tu código y realice su primer depósito, recibirás $25 de bono.
                    </div>
                </div>
            </div>
        `;
    }

    // Mostrar UI autenticada
    showAuthenticatedUI() {
        const authElements = document.querySelectorAll('[data-auth="true"]');
        const unauthElements = document.querySelectorAll('[data-auth="false"]');
        
        authElements.forEach(el => el.style.display = 'block');
        unauthElements.forEach(el => el.style.display = 'none');
    }

    // Mostrar UI no autenticada
    showUnauthenticatedUI() {
        const authElements = document.querySelectorAll('[data-auth="true"]');
        const unauthElements = document.querySelectorAll('[data-auth="false"]');
        
        authElements.forEach(el => el.style.display = 'none');
        unauthElements.forEach(el => el.style.display = 'block');
    }

    // Mostrar loading
    showLoading() {
        this.isLoading = true;
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'flex';
        }
    }

    // Ocultar loading
    hideLoading() {
        this.isLoading = false;
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    // Mostrar error
    showError(message) {
        // Implementar sistema de notificaciones
        if (window.showNotification) {
            window.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    // Mostrar éxito
    showSuccess(message) {
        if (window.showNotification) {
            window.showNotification(message, 'success');
        } else {
            alert(message);
        }
    }

    // Inicializar UI
    initUI() {
        this.setupEventListeners();
        this.initModals();
        this.initNotifications();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Navegación
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-nav]');
            if (navLink) {
                e.preventDefault();
                const view = navLink.getAttribute('data-nav');
                this.navigateTo(view);
            }
        });
        
        // Cerrar sesión
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await this.logout();
            });
        }
        
        // Modal de depósito
        const depositBtn = document.getElementById('new-deposit-btn');
        if (depositBtn) {
            depositBtn.addEventListener('click', () => {
                this.openDepositModal();
            });
        }
        
        // Modal de retiro
        const withdrawalBtn = document.getElementById('new-withdrawal-btn');
        if (withdrawalBtn) {
            withdrawalBtn.addEventListener('click', () => {
                this.openWithdrawalModal();
            });
        }
    }

    // Inicializar modales
    initModals() {
        // Esta función se implementará en ui.js
        if (window.initModals) {
            window.initModals();
        }
    }

    // Inicializar notificaciones
    initNotifications() {
        // Esta función se implementará en ui.js
        if (window.initNotifications) {
            window.initNotifications();
        }
    }

    // Abrir modal de depósito
    openDepositModal() {
        if (window.openModal) {
            window.openModal('deposit-modal');
        }
    }

    // Abrir modal de retiro
    openWithdrawalModal() {
        if (window.openModal) {
            window.openModal('withdrawal-modal');
        }
    }

    // Cerrar sesión
    async logout() {
        try {
            this.showLoading();
            await authService.logoutUser();
            this.showSuccess('Sesión cerrada correctamente');
        } catch (error) {
            this.showError('Error al cerrar sesión');
        } finally {
            this.hideLoading();
        }
    }

    // Cargar datos iniciales
    async loadInitialData() {
        // Cargar configuraciones, idiomas, etc.
        await this.loadAppConfig();
    }

    // Cargar configuración de la app
    async loadAppConfig() {
        // Implementar carga de configuración
        console.log('Configuración de la app cargada');
    }

    // Método para acceder al estado global
    getState() {
        return { ...this.state };
    }

    // Método para actualizar estado
    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.updateUI();
    }

    // Actualizar UI basado en estado
    updateUI() {
        // Actualizar elementos de UI basados en el estado actual
        this.updateUserInfo();
        this.updateBalanceDisplay();
    }

    // Actualizar información del usuario
    updateUserInfo() {
        const userInfoElement = document.getElementById('user-info');
        if (userInfoElement && this.userData) {
            userInfoElement.textContent = `${this.userData.firstName || ''} ${this.userData.lastName || ''}`.trim() || this.userData.email;
        }
    }

    // Actualizar display de balance
    updateBalanceDisplay() {
        const balanceElements = document.querySelectorAll('[data-balance]');
        balanceElements.forEach(element => {
            element.textContent = this.formatCurrency(this.state.balance);
        });
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.canadaCoinApp = new CanadaCoinApp();
});

// Exportar para uso en otros módulos
export default CanadaCoinApp;