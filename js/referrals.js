// js/referrals.js
// Sistema de Referidos - Canada Coin
// Generación de códigos, seguimiento y bonificaciones

import { referralService } from '../firebase-config.js';

class ReferralManager {
    constructor() {
        this.referralStats = {
            totalReferrals: 0,
            activeReferrals: 0,
            pendingReferrals: 0,
            totalBonus: 0
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadReferralData();
    }

    setupEventListeners() {
        // Copy referral code
        const copyBtn = document.getElementById('copy-referral-code');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyReferralCode());
        }

        // Share referral
        const shareBtn = document.getElementById('share-referral');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareReferral());
        }

        // Generate QR code
        const qrBtn = document.getElementById('generate-qr');
        if (qrBtn) {
            qrBtn.addEventListener('click', () => this.generateQRCode());
        }

        // View referral details
        document.addEventListener('click', (e) => {
            if (e.target.matches('.view-referral-details')) {
                const referralId = e.target.dataset.referralId;
                this.showReferralDetails(referralId);
            }
        });
    }

    async loadReferralData() {
        const userId = window.canadaCoinApp?.currentUser?.uid;
        if (!userId) return;

        try {
            const result = await referralService.getReferralStats(userId);
            if (result.success) {
                this.referralStats = result.stats;
                this.updateReferralDisplay();
            }
        } catch (error) {
            console.error('Error loading referral data:', error);
        }
    }

    updateReferralDisplay() {
        // Update referral code
        const referralCodeElement = document.getElementById('referral-code');
        const userData = window.canadaCoinApp?.userData;
        
        if (referralCodeElement && userData?.referralCode) {
            referralCodeElement.textContent = userData.referralCode;
        }

        // Update stats
        this.updateStatsDisplay();
        
        // Update referral list
        this.updateReferralList();
    }

    updateStatsDisplay() {
        const statsContainer = document.getElementById('referral-stats');
        if (!statsContainer) return;

        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${this.referralStats.totalReferrals}</div>
                    <div class="stat-label">Total Referidos</div>
                </div>
            </div>
            <div class="stat-card success">
                <div class="stat-icon">
                    <i class="fas fa-user-check"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${this.referralStats.activeReferrals}</div>
                    <div class="stat-label">Referidos Activos</div>
                </div>
            </div>
            <div class="stat-card warning">
                <div class="stat-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${this.referralStats.pendingReferrals}</div>
                    <div class="stat-label">Pendientes</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-gift"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${this.formatCurrency(this.referralStats.totalBonus)}</div>
                    <div class="stat-label">Bonos Ganados</div>
                </div>
            </div>
        `;
    }

    async copyReferralCode() {
        const referralCode = window.canadaCoinApp?.userData?.referralCode;
        if (!referralCode) {
            this.showNotification('No se pudo encontrar tu código de referido', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(referralCode);
            this.showNotification('Código copiado al portapapeles', 'success');
            
            // Track copy event
            this.trackReferralAction('copy');
        } catch (error) {
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = referralCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Código copiado al portapapeles', 'success');
        }
    }

    async shareReferral() {
        const referralCode = window.canadaCoinApp?.userData?.referralCode;
        if (!referralCode) return;

        const shareData = {
            title: 'Únete a Canada Coin',
            text: `Únete a Canada Coin usando mi código de referido: ${referralCode}. Obtendrás $25 de bono en tu primer depósito.`,
            url: window.location.origin
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                this.trackReferralAction('share_native');
            } else {
                // Fallback: copiar mensaje personalizado
                await navigator.clipboard.writeText(shareData.text);
                this.showNotification('Mensaje de referido copiado. Compártelo donde quieras!', 'success');
                this.trackReferralAction('share_copy');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
                this.showNotification('Error al compartir', 'error');
            }
        }
    }

    generateQRCode() {
        const referralCode = window.canadaCoinApp?.userData?.referralCode;
        if (!referralCode) return;

        const qrUrl = `${window.location.origin}?ref=${referralCode}`;
        
        // En una implementación real, usaríamos una librería QR
        // Por ahora, mostramos un modal con la URL
        this.showQRModal(qrUrl);
        this.trackReferralAction('qr_generate');
    }

    showQRModal(qrUrl) {
        const modal = document.getElementById('qr-modal') || this.createQRModal();
        const qrImage = modal.querySelector('#qr-image');
        const qrUrlElement = modal.querySelector('#qr-url');
        
        if (qrImage) {
            // En producción, generaríamos un QR code real
            qrImage.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-qrcode" style="font-size: 120px; color: #2563eb;"></i>
                    <p style="margin-top: 10px; font-size: 12px; color: #666;">Código QR</p>
                </div>
            `;
        }
        
        if (qrUrlElement) {
            qrUrlElement.textContent = qrUrl;
            qrUrlElement.href = qrUrl;
        }
        
        modal.classList.add('active');
    }

    createQRModal() {
        const modal = document.createElement('div');
        modal.id = 'qr-modal';
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Código QR de Referido</h3>
                    <button class="modal-close" data-modal-close="qr-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="qr-image" style="text-align: center;"></div>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="#" id="qr-url" target="_blank" style="word-break: break-all;"></a>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-modal-close="qr-modal">Cerrar</button>
                    <button class="btn btn-primary" id="download-qr">Descargar QR</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('#download-qr').addEventListener('click', () => this.downloadQR());
        modal.querySelector('[data-modal-close="qr-modal"]').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        return modal;
    }

    downloadQR() {
        // En producción, generaríamos y descargaríamos un QR real
        this.showNotification('Funcionalidad de descarga de QR en desarrollo', 'info');
        this.trackReferralAction('qr_download');
    }

    async showReferralDetails(referralId) {
        // Cargar detalles específicos del referido
        try {
            const referralDetails = await this.loadReferralDetails(referralId);
            this.displayReferralDetails(referralDetails);
        } catch (error) {
            console.error('Error loading referral details:', error);
            this.showNotification('Error al cargar detalles del referido', 'error');
        }
    }

    async loadReferralDetails(referralId) {
        // Simular carga de detalles (en producción vendría de Firebase)
        return {
            id: referralId,
            referredUser: {
                name: 'Usuario Referido',
                email: 'usuario@ejemplo.com',
                joinDate: new Date().toISOString()
            },
            status: 'active',
            bonusAmount: 25,
            bonusStatus: 'pending',
            timeline: [
                {
                    date: new Date().toISOString(),
                    action: 'registered',
                    description: 'Usuario se registró'
                },
                {
                    date: new Date().toISOString(),
                    action: 'verified',
                    description: 'Email verificado'
                }
            ]
        };
    }

    displayReferralDetails(details) {
        const modal = document.getElementById('referral-details-modal') || this.createReferralDetailsModal();
        
        modal.querySelector('#referral-user-name').textContent = details.referredUser.name;
        modal.querySelector('#referral-user-email').textContent = details.referredUser.email;
        modal.querySelector('#referral-join-date').textContent = this.formatDate(details.referredUser.joinDate);
        modal.querySelector('#referral-status').textContent = this.getStatusText(details.status);
        modal.querySelector('#referral-bonus-amount').textContent = this.formatCurrency(details.bonusAmount);
        modal.querySelector('#referral-bonus-status').textContent = this.getBonusStatusText(details.bonusStatus);
        
        // Build timeline
        const timelineElement = modal.querySelector('#referral-timeline');
        timelineElement.innerHTML = details.timeline.map(event => `
            <div class="timeline-event">
                <div class="timeline-date">${this.formatDateTime(event.date)}</div>
                <div class="timeline-description">${event.description}</div>
            </div>
        `).join('');
        
        modal.classList.add('active');
    }

    createReferralDetailsModal() {
        const modal = document.createElement('div');
        modal.id = 'referral-details-modal';
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal modal-lg">
                <div class="modal-header">
                    <h3 class="modal-title">Detalles del Referido</h3>
                    <button class="modal-close" data-modal-close="referral-details-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="referral-details-grid">
                        <div class="detail-group">
                            <label>Usuario:</label>
                            <span id="referral-user-name"></span>
                        </div>
                        <div class="detail-group">
                            <label>Email:</label>
                            <span id="referral-user-email"></span>
                        </div>
                        <div class="detail-group">
                            <label>Fecha de Registro:</label>
                            <span id="referral-join-date"></span>
                        </div>
                        <div class="detail-group">
                            <label>Estado:</label>
                            <span id="referral-status" class="status-badge"></span>
                        </div>
                        <div class="detail-group">
                            <label>Bono:</label>
                            <span id="referral-bonus-amount"></span>
                        </div>
                        <div class="detail-group">
                            <label>Estado del Bono:</label>
                            <span id="referral-bonus-status" class="status-badge"></span>
                        </div>
                    </div>
                    
                    <div class="timeline-section">
                        <h4>Historial</h4>
                        <div id="referral-timeline" class="timeline"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-modal-close="referral-details-modal">Cerrar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('[data-modal-close="referral-details-modal"]').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        return modal;
    }

    updateReferralList() {
        const listContainer = document.getElementById('referrals-list');
        if (!listContainer) return;

        // En producción, esto cargaría una lista real de referidos
        const mockReferrals = this.generateMockReferrals();
        
        if (mockReferrals.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Aún no tienes referidos</h3>
                    <p>Comparte tu código para comenzar a ganar bonos</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = mockReferrals.map(referral => `
            <div class="referral-item card">
                <div class="referral-header">
                    <div class="referral-user">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-info">
                            <div class="user-name">${referral.name}</div>
                            <div class="user-email">${referral.email}</div>
                        </div>
                    </div>
                    <div class="referral-status ${referral.status}">
                        ${this.getStatusText(referral.status)}
                    </div>
                </div>
                <div class="referral-details">
                    <div class="referral-date">
                        <i class="fas fa-calendar"></i>
                        Referido: ${this.formatDate(referral.joinDate)}
                    </div>
                    <div class="referral-bonus">
                        <i class="fas fa-gift"></i>
                        Bono: ${this.formatCurrency(referral.bonusAmount)}
                    </div>
                </div>
                <div class="referral-actions">
                    <button class="btn btn-sm btn-outline view-referral-details" data-referral-id="${referral.id}">
                        Ver Detalles
                    </button>
                </div>
            </div>
        `).join('');
    }

    generateMockReferrals() {
        // Datos de ejemplo para desarrollo
        return [
            {
                id: 'ref1',
                name: 'Juan Pérez',
                email: 'juan@ejemplo.com',
                joinDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active',
                bonusAmount: 25,
                bonusStatus: 'completed'
            },
            {
                id: 'ref2',
                name: 'María García',
                email: 'maria@ejemplo.com',
                joinDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'pending',
                bonusAmount: 25,
                bonusStatus: 'pending'
            }
        ];
    }

    trackReferralAction(action) {
        // Registrar acciones de referido para analytics
        const analyticsData = {
            action: action,
            userId: window.canadaCoinApp?.currentUser?.uid,
            timestamp: new Date().toISOString(),
            referralCode: window.canadaCoinApp?.userData?.referralCode
        };
        
        console.log('Referral action tracked:', analyticsData);
        
        // En producción, enviaríamos esto a Google Analytics o similar
        if (window.gtag) {
            window.gtag('event', 'referral_action', analyticsData);
        }
    }

    // Utility functions
    getStatusText(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'active': 'Activo',
            'completed': 'Completado',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    }

    getBonusStatusText(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'paid': 'Pagado',
            'processing': 'Procesando',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX');
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('es-MX');
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

    // Bonus calculation methods
    calculatePotentialEarnings(referralsCount) {
        const bonusPerReferral = 25;
        return referralsCount * bonusPerReferral;
    }

    getNextBonusMilestone() {
        const currentCount = this.referralStats.totalReferrals;
        const milestones = [5, 10, 25, 50, 100];
        const nextMilestone = milestones.find(m => m > currentCount);
        
        if (nextMilestone) {
            return {
                milestone: nextMilestone,
                referralsNeeded: nextMilestone - currentCount,
                potentialBonus: (nextMilestone - currentCount) * 25
            };
        }
        
        return null;
    }
}

// Inicializar el manager de referidos
document.addEventListener('DOMContentLoaded', () => {
    window.referralManager = new ReferralManager();
});

export default ReferralManager;