// js/dashboard.js
import { getUserData, getRecentTransactions } from "./data.js";
import { formatCurrency } from "./formatters.js";
import { renderChart } from "../utils/charts.js";
import { showNotification } from "./ui.js";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadDashboard();
    } catch (error) {
        console.error("Error cargando el dashboard:", error);
        showNotification("Error al cargar datos.", "error");
    }
});

async function loadDashboard() {
    const user = await getUserData();
    const transactions = await getRecentTransactions();

    updateBalanceCard(user.balance);
    updateTransactionsTable(transactions);
    renderPerformanceChart(transactions);
}

function updateBalanceCard(balance) {
    const balanceEl = document.querySelector("#dashboard-balance");
    if (balanceEl) balanceEl.textContent = formatCurrency(balance);
}

function updateTransactionsTable(transactions) {
    const table = document.querySelector("#transactions-table tbody");
    if (!table) return;

    table.innerHTML = "";

    transactions.slice(0, 5).forEach(tx => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${tx.date}</td>
            <td>${tx.type}</td>
            <td>${formatCurrency(tx.amount)}</td>
            <td class="text-right">${tx.status}</td>
        `;
        table.appendChild(row);
    });
}

function renderPerformanceChart(transactions) {
    const ctx = document.querySelector("#performance-chart");
    if (!ctx) return;

    const data = transactions.map(t => t.amount);
    renderChart(ctx, data);
}
