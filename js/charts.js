// js/charts.js
// Sistema de Gráficos - Canada Coin
// Configuración y gestión de gráficos financieros

class ChartsManager {
    constructor() {
        this.charts = new Map();
        this.defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#1f2937',
                    bodyColor: '#374151',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {}
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
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        };
    }

    // Gráfico de rendimiento de inversión
    createPerformanceChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        this.destroyChart(canvasId);

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Rendimiento',
                    data: data.values,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                ...this.defaultOptions,
                plugins: {
                    ...this.defaultOptions.plugins,
                    tooltip: {
                        ...this.defaultOptions.plugins.tooltip,
                        callbacks: {
                            label: (context) => {
                                return `Rendimiento: ${this.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    ...this.defaultOptions.scales,
                    y: {
                        ...this.defaultOptions.scales.y,
                        ticks: {
                            callback: (value) => {
                                return this.formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    // Gráfico de balance histórico
    createBalanceChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        this.destroyChart(canvasId);

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Balance Total',
                    data: data.balances,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                ...this.defaultOptions,
                plugins: {
                    ...this.defaultOptions.plugins,
                    tooltip: {
                        ...this.defaultOptions.plugins.tooltip,
                        callbacks: {
                            label: (context) => {
                                return `Balance: ${this.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    ...this.defaultOptions.scales,
                    y: {
                        ...this.defaultOptions.scales.y,
                        ticks: {
                            callback: (value) => {
                                return this.formatCurrencyCompact(value);
                            }
                        }
                    }
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    // Gráfico de distribución de inversiones
    createDistributionChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        this.destroyChart(canvasId);

        const backgroundColors = [
            '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#64748b'
        ];

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: backgroundColors,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            options: {
                ...this.defaultOptions,
                cutout: '65%',
                plugins: {
                    ...this.defaultOptions.plugins,
                    legend: {
                        ...this.defaultOptions.plugins.legend,
                        position: 'bottom'
                    },
                    tooltip: {
                        ...this.defaultOptions.plugins.tooltip,
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${this.formatCurrency(context.raw)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    // Gráfico de rendimiento comparativo
    createComparativeChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        this.destroyChart(canvasId);

        const datasets = data.datasets.map((dataset, index) => {
            const colors = this.getChartColors(index);
            return {
                label: dataset.label,
                data: dataset.values,
                borderColor: colors.border,
                backgroundColor: colors.background,
                borderWidth: 2,
                fill: false,
                tension: 0.3,
                pointBackgroundColor: colors.border,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 3
            };
        });

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: datasets
            },
            options: {
                ...this.defaultOptions,
                plugins: {
                    ...this.defaultOptions.plugins,
                    tooltip: {
                        ...this.defaultOptions.plugins.tooltip,
                        mode: 'index',
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${this.formatPercentage(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    ...this.defaultOptions.scales,
                    y: {
                        ...this.defaultOptions.scales.y,
                        ticks: {
                            callback: (value) => {
                                return this.formatPercentage(value);
                            }
                        }
                    }
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    // Gráfico de barras para transacciones mensuales
    createMonthlyTransactionsChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        this.destroyChart(canvasId);

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Depósitos',
                        data: data.deposits,
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: '#10b981',
                        borderWidth: 1
                    },
                    {
                        label: 'Retiros',
                        data: data.withdrawals,
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: '#ef4444',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    ...this.defaultOptions.scales,
                    x: {
                        ...this.defaultOptions.scales.x,
                        stacked: false
                    },
                    y: {
                        ...this.defaultOptions.scales.y,
                        stacked: false,
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => {
                                return this.formatCurrencyCompact(value);
                            }
                        }
                    }
                },
                plugins: {
                    ...this.defaultOptions.plugins,
                    tooltip: {
                        ...this.defaultOptions.plugins.tooltip,
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${this.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    // Gráfico de proyecciones
    createProjectionChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        this.destroyChart(canvasId);

        // Preparar datos para área con proyección
        const historicalData = [...data.historical, ...Array(data.projection.length).fill(null)];
        const projectionData = [...Array(data.historical.length).fill(null), ...data.projection];

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Histórico',
                        data: historicalData,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#2563eb',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 3
                    },
                    {
                        label: 'Proyección',
                        data: projectionData,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: '#f59e0b',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                ...this.defaultOptions,
                plugins: {
                    ...this.defaultOptions.plugins,
                    tooltip: {
                        ...this.defaultOptions.plugins.tooltip,
                        callbacks: {
                            label: (context) => {
                                if (context.raw === null) return null;
                                return `${context.dataset.label}: ${this.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    ...this.defaultOptions.scales,
                    y: {
                        ...this.defaultOptions.scales.y,
                        ticks: {
                            callback: (value) => {
                                return this.formatCurrencyCompact(value);
                            }
                        }
                    }
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    // Gráfico de métricas KPI
    createKPIGauge(canvasId, value, max = 100, label = 'Rendimiento') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        this.destroyChart(canvasId);

        const percentage = (value / max) * 100;
        const color = this.getGaugeColor(percentage);

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [value, max - value],
                    backgroundColor: [color, '#e5e7eb'],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                    title: {
                        display: true,
                        text: label,
                        position: 'bottom',
                        font: { size: 14, weight: 'bold' }
                    }
                }
            },
            plugins: [{
                id: 'gaugeText',
                afterDraw: (chart) => {
                    const { ctx, chartArea: { width, height } } = chart;
                    const x = width / 2;
                    const y = height / 2 + 20;

                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = 'bold 24px sans-serif';
                    ctx.fillStyle = color;
                    ctx.fillText(`${value}%`, x, y);

                    ctx.font = '12px sans-serif';
                    ctx.fillStyle = '#6b7280';
                    ctx.fillText(label, x, y + 25);
                    ctx.restore();
                }
            }]
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    // Utilidades
    getChartColors(index) {
        const colors = [
            { border: '#2563eb', background: 'rgba(37, 99, 235, 0.1)' },
            { border: '#10b981', background: 'rgba(16, 185, 129, 0.1)' },
            { border: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' },
            { border: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' },
            { border: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }
        ];
        return colors[index % colors.length];
    }

    getGaugeColor(percentage) {
        if (percentage >= 80) return '#10b981';
        if (percentage >= 60) return '#84cc16';
        if (percentage >= 40) return '#f59e0b';
        if (percentage >= 20) return '#f97316';
        return '#ef4444';
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    }

    formatCurrencyCompact(value) {
        if (value >= 1000000) {
            return '$' + (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
            return '$' + (value / 1000).toFixed(1) + 'K';
        }
        return this.formatCurrency(value);
    }

    formatPercentage(value) {
        return value.toFixed(1) + '%';
    }

    // Gestión de charts
    destroyChart(canvasId) {
        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
            this.charts.delete(canvasId);
        }
    }

    destroyAllCharts() {
        this.charts.forEach((chart, canvasId) => {
            chart.destroy();
        });
        this.charts.clear();
    }

    updateChart(canvasId, newData) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.data = newData;
            chart.update();
        }
    }

    resizeChart(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.resize();
        }
    }

    // Métodos para datos
    generateMonthlyLabels(months = 12) {
        const labels = [];
        const now = new Date();
        
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(date.toLocaleDateString('es-MX', { 
                month: 'short', 
                year: '2-digit' 
            }));
        }
        
        return labels;
    }

    generateDailyLabels(days = 30) {
        const labels = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            labels.push(date.toLocaleDateString('es-MX', { 
                day: '2-digit', 
                month: 'short' 
            }));
        }
        
        return labels;
    }

    // Exportar gráfico como imagen
    exportChartAsImage(canvasId, filename = 'chart') {
        const chart = this.charts.get(canvasId);
        if (!chart) return;

        const link = document.createElement('a');
        link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = chart.toBase64Image();
        link.click();
    }
}

// Inicializar y exportar
window.chartsManager = new ChartsManager();
export default ChartsManager;