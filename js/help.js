// js/help.js
// Centro de Ayuda - Canada Coin
// FAQ interactivo y sistema de soporte

class HelpManager {
    constructor() {
        this.faqData = {};
        this.activeCategory = 'deposits';
        this.init();
    }

    init() {
        this.loadFAQData();
        this.setupEventListeners();
        this.setupSearch();
    }

    setupEventListeners() {
        // Category navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.help-category')) {
                e.preventDefault();
                this.handleCategoryChange(e.target);
            }
        });

        // FAQ item expansion
        document.addEventListener('click', (e) => {
            if (e.target.matches('.faq-question') || e.target.closest('.faq-question')) {
                const faqItem = e.target.closest('.faq-item');
                if (faqItem) {
                    this.toggleFAQItem(faqItem);
                }
            }
        });

        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }

        // Live chat
        const chatToggle = document.getElementById('chat-toggle');
        if (chatToggle) {
            chatToggle.addEventListener('click', () => this.toggleChat());
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('help-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }

    loadFAQData() {
        // Datos FAQ estáticos (en producción vendrían de una base de datos)
        this.faqData = {
            deposits: [
                {
                    question: "¿Cómo realizar un depósito?",
                    answer: `
                        <p>Para realizar un depósito:</p>
                        <ol>
                            <li>Ve a la sección <strong>Depósitos</strong> en tu dashboard</li>
                            <li>Haz clic en <strong>Nuevo Depósito</strong></li>
                            <li>Selecciona el monto y método de pago</li>
                            <li>Sube el comprobante de pago</li>
                            <li>Confirma la operación</li>
                        </ol>
                        <p>Tu depósito será acreditado en 1-24 horas hábiles después de la verificación.</p>
                    `
                },
                {
                    question: "¿Qué métodos de pago aceptan?",
                    answer: `
                        <p>Aceptamos los siguientes métodos de pago:</p>
                        <ul>
                            <li><strong>Transferencia Bancaria</strong> - Procesamiento: 1-24 horas</li>
                            <li><strong>PayPal</strong> - Procesamiento: Instantáneo a 2 horas</li>
                            <li><strong>Criptomonedas</strong> - Procesamiento: 10-30 minutos</li>
                        </ul>
                    `
                },
                {
                    question: "¿Hay montos mínimos o máximos para depositar?",
                    answer: `
                        <p>Sí, tenemos los siguientes límites:</p>
                        <ul>
                            <li><strong>Mínimo:</strong> $10 USD</li>
                            <li><strong>Máximo por transacción:</strong> $10,000 USD</li>
                            <li><strong>Límite diario:</strong> $50,000 USD</li>
                            <li><strong>Límite mensual:</strong> $500,000 USD</li>
                        </ul>
                    `
                },
                {
                    question: "¿Qué hacer si mi depósito no aparece?",
                    answer: `
                        <p>Si tu depósito no aparece después de 24 horas:</p>
                        <ol>
                            <li>Verifica que el comprobante sea claro y legible</li>
                            <li>Confirma que los datos de transferencia sean correctos</li>
                            <li>Contacta a soporte con tu número de transacción</li>
                        </ol>
                        <p>Nuestro equipo verificará el estado de tu depósito inmediatamente.</p>
                    `
                }
            ],
            withdrawals: [
                {
                    question: "¿Cómo solicitar un retiro?",
                    answer: `
                        <p>Para solicitar un retiro:</p>
                        <ol>
                            <li>Ve a la sección <strong>Retiros</strong></li>
                            <li>Haz clic en <strong>Solicitar Retiro</strong></li>
                            <li>Ingresa el monto a retirar</li>
                            <li>Selecciona el método de retiro</li>
                            <li>Confirma la solicitud</li>
                        </ol>
                    `
                },
                {
                    question: "¿Cuánto tarda en procesarse un retiro?",
                    answer: `
                        <p>Los tiempos de procesamiento varían por método:</p>
                        <ul>
                            <li><strong>Transferencia Bancaria:</strong> 3-5 días hábiles</li>
                            <li><strong>PayPal:</strong> 1-3 días hábiles</li>
                        </ul>
                        <p>Los retiros se procesan de lunes a viernes, excluyendo feriados bancarios.</p>
                    `
                },
                {
                    question: "¿Hay comisiones por retiro?",
                    answer: `
                        <p>Las comisiones varían según el método:</p>
                        <ul>
                            <li><strong>Transferencia Bancaria:</strong> $15 USD o 1% (lo que sea mayor)</li>
                            <li><strong>PayPal:</strong> 2.5% del monto retirado</li>
                        </ul>
                        <p>Las comisiones se deducen automáticamente del monto retirado.</p>
                    `
                }
            ],
            referrals: [
                {
                    question: "¿Cómo funciona el programa de referidos?",
                    answer: `
                        <p>Nuestro programa de referidos te permite ganar $25 USD por cada persona que invites:</p>
                        <ol>
                            <li>Comparte tu código único de referido</li>
                            <li>Tu referido se registra usando tu código</li>
                            <li>Realiza su primer depósito (mínimo $100)</li>
                            <li>Recibes $25 USD de bono en tu cuenta</li>
                        </ol>
                    `
                },
                {
                    question: "¿Cuándo recibo el bono por referido?",
                    answer: `
                        <p>El bono se acredita automáticamente cuando:</p>
                        <ul>
                            <li>Tu referido completa la verificación KYC</li>
                            <li>Realiza un depósito mínimo de $100 USD</li>
                            <li>El depósito es verificado y aprobado</li>
                        </ul>
                        <p>El bono estará disponible en tu cuenta dentro de las 24 horas posteriores.</p>
                    `
                },
                {
                    question: "¿Hay límite de referidos?",
                    answer: `
                        <p>No hay límite en la cantidad de referidos que puedes invitar.</p>
                        <p>Sin embargo, aplican las siguientes condiciones:</p>
                        <ul>
                            <li>Cada referido debe ser una persona real</li>
                            <li>No se permiten múltiples cuentas por persona</li>
                            <li>El referido debe cumplir con los requisitos KYC</li>
                        </ul>
                    `
                }
            ],
            legal: [
                {
                    question: "¿Es Canada Coin una plataforma regulada?",
                    answer: `
                        <p>Sí, Canada Coin opera bajo estrictas regulaciones financieras:</p>
                        <ul>
                            <li>Registrada en la Comisión de Valores</li>
                            <li>Cumplimiento AML/KYC internacional</li>
                            <li>Auditorías regulares externas</li>
                            <li>Seguro de depósitos hasta $500,000 USD</li>
                        </ul>
                    `
                },
                {
                    question: "¿Qué protección tienen mis inversiones?",
                    answer: `
                        <p>Tus inversiones están protegidas mediante:</p>
                        <ul>
                            <li><strong>Seguro de Depósitos:</strong> Hasta $500,000 USD por usuario</li>
                            <li><strong>Encriptación:</strong> TLS 1.3 y encriptación de extremo a extremo</li>
                            <li><strong>Autenticación:</strong> Verificación de dos factores opcional</li>
                            <li><strong>Reservas:</strong> Mantenemos el 100% de reservas líquidas</li>
                        </ul>
                    `
                },
                {
                    question: "¿Dónde se guardan mis fondos?",
                    answer: `
                        <p>Los fondos de los usuarios se mantienen en:</p>
                        <ul>
                            <li>Cuentas segregadas en bancos de primer nivel</li>
                            <li>Fondos separados de los activos operativos de la empresa</li>
                            <li>Reservas líquidas equivalentes al 100% de los depósitos</li>
                            <li>Bóvedas de criptomonedas con custodia múltiple</li>
                        </ul>
                    `
                }
            ]
        };

        this.renderFAQ();
    }

    handleCategoryChange(categoryButton) {
        // Update active category
        const categoryButtons = document.querySelectorAll('.help-category');
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        categoryButton.classList.add('active');

        this.activeCategory = categoryButton.dataset.category;
        this.renderFAQCategory(this.activeCategory);
    }

    renderFAQ() {
        this.renderFAQCategory(this.activeCategory);
    }

    renderFAQCategory(category) {
        const faqContainer = document.getElementById('faq-content');
        if (!faqContainer) return;

        const categoryData = this.faqData[category] || [];
        
        if (categoryData.length === 0) {
            faqContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-info-circle"></i>
                    <h3>No hay preguntas frecuentes en esta categoría</h3>
                    <p>Prueba con otra categoría o contacta a soporte</p>
                </div>
            `;
            return;
        }

        faqContainer.innerHTML = categoryData.map((faq, index) => `
            <div class="faq-item ${index === 0 ? 'active' : ''}">
                <div class="faq-question">
                    <span>${faq.question}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer" style="${index === 0 ? 'display: block;' : 'display: none;'}">
                    ${faq.answer}
                </div>
            </div>
        `).join('');
    }

    toggleFAQItem(faqItem) {
        const isActive = faqItem.classList.contains('active');
        const answer = faqItem.querySelector('.faq-answer');
        const icon = faqItem.querySelector('.faq-question i');

        // Close all other items
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
                item.querySelector('.faq-answer').style.display = 'none';
                item.querySelector('.faq-question i').className = 'fas fa-chevron-down';
            }
        });

        // Toggle current item
        if (!isActive) {
            faqItem.classList.add('active');
            answer.style.display = 'block';
            icon.className = 'fas fa-chevron-up';
        } else {
            faqItem.classList.remove('active');
            answer.style.display = 'none';
            icon.className = 'fas fa-chevron-down';
        }
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.renderFAQCategory(this.activeCategory);
            return;
        }

        const results = this.searchFAQ(query.toLowerCase());
        this.displaySearchResults(results, query);
    }

    searchFAQ(query) {
        const results = [];
        
        Object.entries(this.faqData).forEach(([category, faqs]) => {
            faqs.forEach(faq => {
                if (faq.question.toLowerCase().includes(query) || 
                    faq.answer.toLowerCase().includes(query)) {
                    results.push({
                        ...faq,
                        category: category
                    });
                }
            });
        });

        return results;
    }

    displaySearchResults(results, query) {
        const faqContainer = document.getElementById('faq-content');
        if (!faqContainer) return;

        if (results.length === 0) {
            faqContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron resultados</h3>
                    <p>No hay preguntas que coincidan con "${query}"</p>
                    <button class="btn btn-primary" id="contact-support-search">Contactar Soporte</button>
                </div>
            `;

            // Add event listener to the contact button
            const contactBtn = document.getElementById('contact-support-search');
            if (contactBtn) {
                contactBtn.addEventListener('click', () => this.showContactForm());
            }

            return;
        }

        faqContainer.innerHTML = `
            <div class="search-results-header">
                <h4>${results.length} resultado(s) para "${query}"</h4>
            </div>
            ${results.map((result, index) => `
                <div class="faq-item ${index === 0 ? 'active' : ''}">
                    <div class="faq-category-badge">${this.getCategoryName(result.category)}</div>
                    <div class="faq-question">
                        <span>${result.question}</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="faq-answer" style="${index === 0 ? 'display: block;' : 'display: none;'}">
                        ${result.answer}
                    </div>
                </div>
            `).join('')}
        `;
    }

    getCategoryName(category) {
        const categoryNames = {
            deposits: 'Depósitos',
            withdrawals: 'Retiros',
            referrals: 'Referidos',
            legal: 'Legal'
        };
        return categoryNames[category] || category;
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            category: formData.get('category'),
            message: formData.get('message'),
            urgency: formData.get('urgency'),
            timestamp: new Date().toISOString()
        };

        try {
            this.showNotification('Enviando mensaje...', 'info');
            
            // Simular envío (en producción, enviaríamos a un backend)
            await this.submitContactForm(contactData);
            
            this.showNotification('Mensaje enviado exitosamente. Te contactaremos pronto.', 'success');
            e.target.reset();
            
        } catch (error) {
            console.error('Error sending contact form:', error);
            this.showNotification('Error al enviar el mensaje. Intenta nuevamente.', 'error');
        }
    }

    async submitContactForm(contactData) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // En producción, aquí haríamos una llamada a la API
        console.log('Contact form submitted:', contactData);
        return { success: true };
    }

    showContactForm() {
        const contactSection = document.getElementById('contact-section');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            this.createContactModal();
        }
    }

    createContactModal() {
        const modal = document.createElement('div');
        modal.id = 'contact-modal';
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal modal-lg">
                <div class="modal-header">
                    <h3 class="modal-title">Contactar Soporte</h3>
                    <button class="modal-close" data-modal-close="contact-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="contact-form-modal">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="contact-name" class="form-label">Nombre Completo</label>
                                <input type="text" id="contact-name" name="name" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="contact-email" class="form-label">Email</label>
                                <input type="email" id="contact-email" name="email" class="form-control" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="contact-category" class="form-label">Categoría</label>
                                <select id="contact-category" name="category" class="form-control" required>
                                    <option value="">Selecciona una categoría</option>
                                    <option value="technical">Problema Técnico</option>
                                    <option value="billing">Facturación y Pagos</option>
                                    <option value="account">Cuenta y Seguridad</option>
                                    <option value="investment">Inversiones y Rendimientos</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="contact-urgency" class="form-label">Urgencia</label>
                                <select id="contact-urgency" name="urgency" class="form-control" required>
                                    <option value="low">Baja</option>
                                    <option value="medium" selected>Media</option>
                                    <option value="high">Alta</option>
                                    <option value="critical">Crítica</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="contact-subject" class="form-label">Asunto</label>
                            <input type="text" id="contact-subject" name="subject" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="contact-message" class="form-label">Mensaje</label>
                            <textarea id="contact-message" name="message" class="form-control" rows="5" required></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-modal-close="contact-modal">Cancelar</button>
                    <button class="btn btn-primary" id="submit-contact-modal">Enviar Mensaje</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('[data-modal-close="contact-modal"]').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        modal.querySelector('#submit-contact-modal').addEventListener('click', () => {
            const form = modal.querySelector('#contact-form-modal');
            this.handleContactSubmit(new Event('submit', { cancelable: true }), form);
        });
        
        modal.classList.add('active');
    }

    toggleChat() {
        const chatWidget = document.getElementById('chat-widget') || this.createChatWidget();
        chatWidget.classList.toggle('active');
    }

    createChatWidget() {
        const widget = document.createElement('div');
        widget.id = 'chat-widget';
        widget.className = 'chat-widget';
        widget.innerHTML = `
            <div class="chat-header">
                <h4>Soporte en Vivo</h4>
                <button class="chat-close" id="chat-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="chat-messages" id="chat-messages">
                <div class="chat-message bot">
                    <div class="message-content">
                        ¡Hola! Soy tu asistente de Canada Coin. ¿En qué puedo ayudarte hoy?
                    </div>
                    <div class="message-time">${this.getCurrentTime()}</div>
                </div>
            </div>
            <div class="chat-input">
                <input type="text" id="chat-input" placeholder="Escribe tu mensaje...">
                <button id="chat-send">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(widget);
        
        // Add event listeners
        widget.querySelector('#chat-close').addEventListener('click', () => {
            widget.classList.remove('active');
        });
        
        widget.querySelector('#chat-send').addEventListener('click', () => {
            this.sendChatMessage();
        });
        
        widget.querySelector('#chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
        
        return widget;
    }

    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addChatMessage(message, 'user');
        input.value = '';

        // Simulate bot response
        setTimeout(() => {
            this.generateBotResponse(message);
        }, 1000);
    }

    addChatMessage(message, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}`;
        messageElement.innerHTML = `
            <div class="message-content">${this.escapeHtml(message)}</div>
            <div class="message-time">${this.getCurrentTime()}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    generateBotResponse(userMessage) {
        const responses = {
            'depósito': 'Para realizar un depósito, ve a la sección "Depósitos" y sigue las instrucciones. ¿Necesitas ayuda con algún método de pago específico?',
            'retiro': 'Los retiros se procesan en 3-5 días hábiles. Puedes solicitar un retiro desde la sección "Retiros" de tu dashboard.',
            'referido': 'Por cada referido que se registre y deposite, recibes $25 de bono. Comparte tu código único desde la sección "Referidos".',
            'verificación': 'El proceso KYC toma 1-2 días hábiles. Asegúrate de que tus documentos sean claros y legibles.',
            'default': 'Entiendo que necesitas ayuda. Te recomiendo revisar nuestra sección de Preguntas Frecuentes o contactar a nuestro equipo de soporte para asistencia personalizada.'
        };

        let response = responses.default;
        
        // Simple keyword matching
        const lowerMessage = userMessage.toLowerCase();
        if (lowerMessage.includes('depósito') || lowerMessage.includes('deposito')) {
            response = responses.depósito;
        } else if (lowerMessage.includes('retiro')) {
            response = responses.retiro;
        } else if (lowerMessage.includes('referido')) {
            response = responses.referido;
        } else if (lowerMessage.includes('verificación') || lowerMessage.includes('verificacion') || lowerMessage.includes('kyc')) {
            response = responses.verificación;
        }

        this.addChatMessage(response, 'bot');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
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

    // Utility methods for external access
    showHelpSection(section) {
        if (this.faqData[section]) {
            this.activeCategory = section;
            this.renderFAQCategory(section);
            
            // Update active category button
            const categoryButton = document.querySelector(`[data-category="${section}"]`);
            if (categoryButton) {
                this.handleCategoryChange(categoryButton);
            }
        }
    }

    searchHelp(query) {
        const searchInput = document.getElementById('help-search');
        if (searchInput) {
            searchInput.value = query;
            this.handleSearch(query);
        }
    }
}

// Inicializar el manager de ayuda
document.addEventListener('DOMContentLoaded', () => {
    window.helpManager = new HelpManager();
});

export default HelpManager;