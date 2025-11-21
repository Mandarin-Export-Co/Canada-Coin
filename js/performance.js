// js/performance.js
// Seguimiento de Rendimientos - Canada Coin
// Métricas de performance, gráficos interactivos y proyecciones

class PerformanceManager {
    constructor() {
        this.charts = {};
        this.performanceData = {
            historical: [],
            projections: [],
            metrics: {}
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
    }

    setupEventListeners() {
        // Chart period selectors
        document.addEventListener('click', (e) => {
            if (e.target.matches('.chart-period')) {
                e.preventDefault();
                this.handlePeriodChange(e.target);
            }
        });

        // Performance view navigation
        document.addEventListener('viewChanged', (e) => {
            if (e.detail.view === 'performance') {
                this.loadPerformanceView();
            }
        });
    }

    async loadInitialData() {
        // Cargar datos de rendimiento iniciales
        await this.loadHistoricalData();
        this.calculateMetrics();
    }

    async loadHistoricalData() {
        // Simular datos históricos (en producción vendría de Firebase)
        const mockData = this.generateMockHistoricalData();
        this.performanceData.historical = mockData;
        
        // Calcular proyecciones
        this.calculateProjections();
    }

    generateMockHistoricalData() {
        const data = [];
        let balance = 1000; // Saldo inicial
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12); // Últimos 12 meses

        for (let i = 0; i < 365; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            
            // Simular crecimiento con variación aleatoria
            const dailyReturn = (Math.random() * 0.008) - 0.002; // -0.2% a +0.8%
            balance *= (1 + dailyReturn);
            
            // Agregar depósitos/retiros ocasionales
            if (i % 30 === 0 && Math.random() > 0.7) {
                const transaction = Math.random() > 0.5 ? 500 : -200;
                balance += transaction;
            }

            data.push({
                date: date,
                balance: parseFloat(balance.toFixed(2)),
                dailyReturn: parseFloat(dailyReturn.toFixed(4)),
                cumulativeReturn: parseFloat(((balance - 1000) / 1000 * 100).toFixed(2))
            });
        }

        return data;
    }

    calculateMetrics() {
        const data = this.performanceData.historical;
        if (data.length === 0) return;

        const initialBalance = data[0].balance;
        const currentBalance = data[data.length - 1].balance;
        const totalReturn = ((currentBalance - initialBalance) / initialBalance) * 100;

        // Calcular retorno anualizado
        const days = data.length;
        const years = days / 365;
        const annualizedReturn = (Math.pow(1 + totalReturn/100, 1/years) - 1) * 100;

        // Calcular métricas de riesgo
        const dailyReturns = data.map(d => d.dailyReturn);
        const volatility = this.calculateVolatility(dailyReturns);
        const sharpeRatio = this.calculateSharpeRatio(annualizedReturn, volatility);

        this.performanceData.metrics = {
            totalReturn: parseFloat(totalReturn.toFixed(2)),
            annualizedReturn: parseFloat(annualizedReturn.toFixed(2)),
            currentBalance: parseFloat(currentBalance.toFixed(2)),
            totalEarnings: parseFloat((currentBalance - initialBalance).toFixed(2)),
            volatility: parseFloat(volatility.toFixed(2)),
            sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
            investmentPeriod: days
        };

        this.updateMetricsDisplay();
    }

    calculateVolatility(returns) {
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        return Math.sqrt(variance) * Math.sqrt(365); // Anualizada
    }

    calculateSharpeRatio(returnRate, volatility, riskFreeRate = 0.02) {
        return (returnRate - riskFreeRate) / volatility;
    }

    calculateProjections() {
        const data = this.performanceData.historical;
        if (data.length === 0) return;

        const lastBalance = data[data.length - 1].balance;
        const projections = [];
        const projectionDays = 90; // Proyectar 90 días

        // Usar retorno promedio reciente para proyecciones
        const recentReturns = data.slice(-30).map(d => d.dailyReturn);
        const avgReturn = recentReturns.reduce((a, b) => a + b, 0) / recentReturns.length;

        let projectedBalance = lastBalance;
        const startDate = new Date();

        for (let i = 1; i <= projectionDays; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            
            // Proyectar con variación aleatoria basada en volatilidad histórica
            const variation = (Math.random() - 0.5) * 0.01;
            projectedBalance *= (1 + avgReturn + variation);

            projections.push({
                date: date,
                balance: parseFloat(projectedBalance.toFixed(2)),
                type: 'projection'
            });
        }

        this.performanceData.projections = projections;
    }

    loadPerformanceView() {
        this.initPerformanceCharts();
        this.updateMetricsDisplay();
    }

    initPerformanceCharts() {
        this.initBalanceChart();
        this.initReturnsChart();
        this.initProjectionChart();
    }

    initBalanceChart() {
        const ctx = document.getElementById('performance-chart');
        if (!ctx) return;

        if (this.charts.balance) {
            this.charts.balance.destroy();
        }

        const historicalData = this.performanceData.historical;
        const labels = historicalData.map(d => this.formatChartDate(d.date));
        const balances = historicalData.map(d => d.balance);

        this.charts.balance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Saldo de Inversión',
                    data: balances,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => {
                                return `Saldo: $${context.raw.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 6
                        }
                    },
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: (value) => {
                                return '$' + value.toLocaleString('es-MX');
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    initReturnsChart() {
        const ctx = document.getElementById('historical-chart');
        if (!ctx) return;

        if (this.charts.returns) {
            this.charts.returns.destroy();
        }

        const historicalData = this.performanceData.historical;
        const labels = historicalData.map(d => this.formatChartDate(d.date));
        const returns = historicalData.map(d => d.cumulativeReturn);

        this.charts.returns = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Rendimiento Acumulado (%)',
                    data: returns,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => {
                                return `Rendimiento: ${context.raw.toFixed(2)}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 6
                        }
                    },
                    y: {
                        ticks: {
                            callback: (value) => {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    initProjectionChart() {
        // Este gráfico combina datos históricos y proyecciones
        const ctx = document.getElementById('projection-chart');
        if (!ctx) return;

        const historicalData = this.performanceData.historical.slice(-60); // Últimos 60 días
        const projectionData = this.performanceData.projections;

        const allData = [...historicalData, ...projectionData];
        const labels = allData.map(d => this.formatChartDate(d.date));
        const balances = allData.map(d => d.balance);

        // Crear datasets separados para histórico y proyección
        const historicalBalances = [...historicalData.map(d => d.balance), ...Array(projectionData.length).fill(null)];
        const projectionBalances = [...Array(historicalData.length).fill(null), ...projectionData.map(d => d.balance)];

        this.charts.projection = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Histórico',
                        data: historicalBalances,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: 'Proyección',
                        data: projectionBalances,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        ticks: {
                            callback: (value) => {
                                return '$' + value.toLocaleString('es-MX');
                            }
                        }
                    }
                }
            }
        });
    }

    updateMetricsDisplay() {
        const metrics = this.performanceData.metrics;
        
        // Actualizar métricas en el DOM
        this.updateMetricElement('total-return', metrics.totalReturn + '%');
        this.updateMetricElement('annualized-return', metrics.annualizedReturn + '%');
        this.updateMetricElement('current-balance', this.formatCurrency(metrics.currentBalance));
        this.updateMetricElement('total-earnings', this.formatCurrency(metrics.totalEarnings));
        this.updateMetricElement('volatility', metrics.volatility + '%');
        this.updateMetricElement('sharpe-ratio', metrics.sharpeRatio);
        this.updateMetricElement('investment-period', metrics.investmentPeriod + ' días');
    }

    updateMetricElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    handlePeriodChange(button) {
        // Actualizar botones activos
        const periodButtons = document.querySelectorAll('.chart-period');
        periodButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Recargar datos según el período seleccionado
        const period = button.textContent;
        this.filterDataByPeriod(period);
        this.updateCharts();
    }

    filterDataByPeriod(period) {
        const allData = this.performanceData.historical;
        let filteredData = allData;

        const now = new Date();
        let cutoffDate = new Date();

        switch (period) {
            case '1M':
                cutoffDate.setMonth(now.getMonth() - 1);
                break;
            case '3M':
                cutoffDate.setMonth(now.getMonth() - 3);
                break;
            case '6M':
                cutoffDate.setMonth(now.getMonth() - 6);
                break;
            case '1A':
                cutoffDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'Todo':
            default:
                // Usar todos los datos
                cutoffDate = null;
                break;
        }

        if (cutoffDate) {
            filteredData = allData.filter(d => new Date(d.date) >= cutoffDate);
        }

        // Actualizar gráficos con datos filtrados
        this.updateChartsWithData(filteredData);
    }

    updateChartsWithData(filteredData) {
        // Actualizar los gráficos existentes con datos filtrados
        if (this.charts.balance) {
            const labels = filteredData.map(d => this.formatChartDate(d.date));
            const balances = filteredData.map(d => d.balance);

            this.charts.balance.data.labels = labels;
            this.charts.balance.data.datasets[0].data = balances;
            this.charts.balance.update();
        }

        if (this.charts.returns) {
            const labels = filteredData.map(d => this.formatChartDate(d.date));
            const returns = filteredData.map(d => d.cumulativeReturn);

            this.charts.returns.data.labels = labels;
            this.charts.returns.data.datasets[0].data = returns;
            this.charts.returns.update();
        }
    }

    updateCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.update();
            }
        });
    }

    // Utility functions
    formatChartDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('es-MX', {
            month: 'short',
            day: 'numeric'
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Export functionality
    exportPerformanceData() {
        const data = {
            metrics: this.performanceData.metrics,
            historical: this.performanceData.historical,
            projections: this.performanceData.projections,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `canada-coin-performance-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Public method to update from app state
    updateFromAppState(appState) {
        if (appState.transactions && appState.userData) {
            this.syncWithAppData(appState);
        }
    }

    syncWithAppData(appState) {
        // Sincronizar con datos reales de la aplicación
        // Esto se conectaría con Firebase en producción
        console.log('Sincronizando datos de rendimiento con estado de la app', appState);
    }

    // Performance comparison methods
    compareWithBenchmark(benchmark = 'SP500') {
        // Comparar rendimiento con benchmarks
        const userReturn = this.performanceData.metrics.totalReturn;
        let benchmarkReturn;

        switch (benchmark) {
            case 'SP500':
                benchmarkReturn = 8.5; // Retorno anual promedio histórico
                break;
            case 'NASDAQ':
                benchmarkReturn = 10.2;
                break;
            case 'DOWJONES':
                benchmarkReturn = 7.8;
                break;
            default:
                benchmarkReturn = 8.5;
        }

        const comparison = {
            userReturn,
            benchmarkReturn,
            difference: parseFloat((userReturn - benchmarkReturn).toFixed(2)),
            outperforming: userReturn > benchmarkReturn
        };

        return comparison;
    }

    // Risk analysis
    analyzeRiskProfile() {
        const metrics = this.performanceData.metrics;
        let riskLevel = 'MODERADO';
        let description = 'Perfil de riesgo balanceado';

        if (metrics.volatility > 20) {
            riskLevel = 'ALTO';
            description = 'Perfil de riesgo alto - Alta volatilidad';
        } else if (metrics.volatility < 10) {
            riskLevel = 'BAJO';
            description = 'Perfil de riesgo conservador';
        }

        if (metrics.sharpeRatio < 0.5) {
            description += ' - Retornos ajustados al riesgo podrían mejorarse';
        } else if (metrics.sharpeRatio > 1.5) {
            description += ' - Excelentes retornos ajustados al riesgo';
        }

        return {
            level: riskLevel,
            description: description,
            volatility: metrics.volatility,
            sharpeRatio: metrics.sharpeRatio
        };
    }
}

// Inicializar el manager de rendimiento
document.addEventListener('DOMContentLoaded', () => {
    window.performanceManager = new PerformanceManager();
    window.initPerformanceCharts = (appState) => {
        if (appState) {
            window.performanceManager.updateFromAppState(appState);
        }
        window.performanceManager.loadPerformanceView();
    };
});

export default PerformanceManager;