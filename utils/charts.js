// utils/charts.js

let activeChart = null;

export function renderChart(canvas, data = []) {
    if (!canvas) return;

    // Si ya hay un gráfico previo, destruirlo antes de renderizar uno nuevo
    if (activeChart) {
        activeChart.destroy();
    }

    activeChart = new Chart(canvas, {
        type: "line",
        data: {
            labels: data.map((_, i) => `Día ${i + 1}`),
            datasets: [
                {
                    label: "Rendimiento",
                    data,
                    borderWidth: 2,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}
