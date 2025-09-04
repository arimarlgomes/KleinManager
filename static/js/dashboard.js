// Dashboard functionality
class DashboardManager extends KleinManagerCore {
    constructor() {
        super();
        this.charts = {};
    }

    async loadDashboard() {
        try {
            const stats = await this.apiRequest('/stats');
            document.getElementById('stat-total').textContent = stats.total;
            document.getElementById('stat-transit').textContent = stats.transit;
            document.getElementById('stat-value').textContent = `€${stats.value}`;
            document.getElementById('stat-new-sellers').textContent = stats.new_sellers;

            const detailStats = await this.apiRequest('/stats/detail');
            this.renderCharts(detailStats);

            const recentOrders = await this.apiRequest('/orders?limit=5');
            this.renderRecentActivity(recentOrders);
        } catch (error) {
            this.showToast('Failed to load dashboard', 'error');
        }
    }

    renderCharts(stats) {
        // Status Chart
        const statusCtx = document.getElementById('statusChart');
        if (statusCtx) {
            if (this.charts.status) this.charts.status.destroy();

            this.charts.status = new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(stats.by_status || {}).map(s => this.t(`status.${s.toLowerCase()}`)),
                    datasets: [{
                        data: Object.values(stats.by_status || {}),
                        backgroundColor: ['#6b7280', '#3b82f6', '#10b981'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#e5e7eb',
                                padding: 15
                            }
                        }
                    }
                }
            });
        }

        // Weekly Chart
        const weeklyCtx = document.getElementById('weeklyChart');
        if (weeklyCtx) {
            if (this.charts.weekly) this.charts.weekly.destroy();

            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const data = days.map(() => Math.floor(Math.random() * 10));

            this.charts.weekly = new Chart(weeklyCtx, {
                type: 'line',
                data: {
                    labels: days,
                    datasets: [{
                        label: 'Orders',
                        data: data,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(107, 114, 128, 0.2)'
                            },
                            ticks: {
                                color: '#e5e7eb'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#e5e7eb'
                            }
                        }
                    }
                }
            });
        }
    }

    renderRecentActivity(orders) {
        const container = document.getElementById('recent-activity');
        if (orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-history text-gray-600 text-3xl mb-3"></i>
                    <p class="text-gray-400">No recent activity</p>
                </div>
            `;
        } else {
            container.innerHTML = orders.map(order => `
                <div class="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center relative">
                            <i class="fas fa-box text-gray-400"></i>
                            ${order.color ? `<div class="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white" style="background-color: ${order.color}"></div>` : ''}
                        </div>
                        <div>
                            <p class="text-white font-medium">${order.title}</p>
                            <p class="text-xs text-gray-400">${new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-white font-bold">€${order.price.toFixed(2)}</p>
                        <span class="text-xs px-2 py-1 rounded ${this.getStatusClass(order.status)}">
                            ${this.t(`status.${order.status.toLowerCase()}`)}
                        </span>
                    </div>
                </div>
            `).join('');
        }
    }
}