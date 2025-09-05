// Price Watcher functionality
class WatcherManager extends KleinManagerCore {
    constructor() {
        super();
        this.priceHistoryChart = null;
    }

    showAddWatchForm() {
        document.getElementById('addWatchForm').classList.remove('hidden');
        document.getElementById('watchUrl').focus();
    }

    hideAddWatchForm() {
        document.getElementById('addWatchForm').classList.add('hidden');
        document.getElementById('watchUrl').value = '';
    }

    async addWatchedItem(event) {
        event.preventDefault();
        const url = document.getElementById('watchUrl').value;

        this.showLoading('Adding item to watch list...');

        try {
            await this.apiRequest('/watched-items', {
                method: 'POST',
                body: JSON.stringify({ url })
            });

            this.hideLoading();
            this.showToast('Item added to watch list', 'success');
            this.hideAddWatchForm();

            if (this.currentSection === 'watcher') {
                this.loadWatchedItems();
            }
        } catch (error) {
            this.hideLoading();
            this.showToast(error.message, 'error');
        }
    }

    async loadWatchedItems() {
        try {
            const items = await this.apiRequest('/watched-items');
            const container = document.getElementById('watched-items-list');

            if (items.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-eye-slash text-gray-600 text-4xl mb-4"></i>
                        <p class="text-gray-400">No watched items</p>
                    </div>
                `;
            } else {
                container.innerHTML = items.map(item => this.renderWatchedItem(item)).join('');
            }
        } catch (error) {
            this.showToast('Failed to load watched items', 'error');
        }
    }

    renderWatchedItem(item) {
        const priceHistory = item.price_history ? JSON.parse(item.price_history) : [];
        const priceChange = item.current_price - item.initial_price;
        const changeClass = priceChange > 0 ? 'text-red-400' : priceChange < 0 ? 'text-green-400' : 'text-gray-400';
        const changeIcon = priceChange > 0 ? 'fa-arrow-up' : priceChange < 0 ? 'fa-arrow-down' : 'fa-minus';

        const prices = priceHistory.map(p => p.price);
        const lowestPrice = prices.length > 0 ? Math.min(...prices) : item.initial_price;
        const highestPrice = prices.length > 0 ? Math.max(...prices) : item.initial_price;

        return `
            <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-5 shadow-lg border border-slate-700 hover:border-slate-600 transition-all duration-200">
                <!-- Header -->
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1 min-w-0">
                        <h3 class="text-lg font-semibold text-white mb-2 truncate" title="${item.title}">${item.title}</h3>
                        <div class="flex items-center gap-3 text-sm">
                            <div class="bg-slate-700 px-2 py-1 rounded">
                                <span class="text-slate-400">Current:</span>
                                <span class="text-blue-400 font-bold ml-1">€${item.current_price.toFixed(2)}</span>
                            </div>
                            <div class="${changeClass} font-medium">
                                <i class="fas ${changeIcon} mr-1"></i>
                                ${priceChange !== 0 ? (priceChange > 0 ? '+' : '') + '€' + priceChange.toFixed(2) : '0'}
                            </div>
                        </div>
                    </div>

                    <label class="relative inline-flex items-center cursor-pointer ml-2">
                        <input type="checkbox" ${item.notifications_enabled ? 'checked' : ''}
                               onchange="app.toggleWatchNotifications(${item.id})"
                               class="sr-only peer">
                        <div class="w-10 h-5 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <!-- Price Stats -->
                <div class="grid grid-cols-3 gap-2 mb-4">
                    <div class="bg-slate-700/50 rounded-lg p-2 text-center">
                        <p class="text-xs text-slate-400">Initial</p>
                        <p class="text-sm font-bold text-slate-200">€${item.initial_price.toFixed(2)}</p>
                    </div>
                    <div class="bg-slate-700/50 rounded-lg p-2 text-center">
                        <p class="text-xs text-slate-400">Lowest</p>
                        <p class="text-sm font-bold text-green-400">€${lowestPrice.toFixed(2)}</p>
                    </div>
                    <div class="bg-slate-700/50 rounded-lg p-2 text-center">
                        <p class="text-xs text-slate-400">Changes</p>
                        <p class="text-sm font-bold text-orange-400">${priceHistory.length}</p>
                    </div>
                </div>

                <!-- Chart -->
                <div class="mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="text-xs font-medium text-slate-300">Price Trend</h4>
                        <button onclick="app.showPriceHistory(${item.id})"
                                class="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                            <i class="fas fa-expand-alt mr-1"></i>Details
                        </button>
                    </div>
                    ${this.renderCompactChart(item, priceHistory)}
                </div>

                <!-- Actions -->
                <div class="flex gap-2">
                    <a href="${item.url}" target="_blank"
                       class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs text-center transition-colors">
                        <i class="fas fa-external-link-alt mr-1"></i>View
                    </a>
                    <button onclick="app.checkSinglePrice(${item.id})"
                            class="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-xs transition-colors">
                        <i class="fas fa-sync"></i>
                    </button>
                    <button onclick="app.deleteWatchedItem(${item.id})"
                            class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs transition-colors">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>

                <!-- Footer -->
                <div class="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500">
                    <div class="flex justify-between">
                        <span><i class="fas fa-clock mr-1"></i>Last: ${new Date(item.last_checked).toLocaleDateString()}</span>
                        <span><i class="fas fa-calendar-plus mr-1"></i>Added: ${new Date(item.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderCompactChart(item, priceHistory) {
        if (priceHistory.length === 0) {
            return `
                <div class="h-20 bg-slate-700/30 rounded-lg flex items-center justify-center">
                    <p class="text-xs text-slate-500">No price history</p>
                </div>
            `;
        }

        const recentHistory = priceHistory.slice(-20);
        const prices = recentHistory.map(p => p.price);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const priceRange = maxPrice - minPrice || 1;

        const width = 100;
        const height = 60;
        const points = recentHistory.map((entry, index) => {
            const x = (index / Math.max(recentHistory.length - 1, 1)) * width;
            const y = height - ((entry.price - minPrice) / priceRange) * height;
            return `${x},${y}`;
        }).join(' ');

        const firstPrice = prices[0];
        const lastPrice = prices[prices.length - 1];
        const trendColor = lastPrice > firstPrice ? '#f87171' : lastPrice < firstPrice ? '#4ade80' : '#60a5fa';

        return `
            <div class="relative h-20 bg-slate-700/30 rounded-lg p-2 overflow-hidden">
                <svg class="w-full h-full" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="gradient-${item.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:${trendColor};stop-opacity:0.2" />
                            <stop offset="100%" style="stop-color:${trendColor};stop-opacity:0.02" />
                        </linearGradient>
                    </defs>
                    <polygon points="0,${height} ${points} ${width},${height}" fill="url(#gradient-${item.id})" />
                    <polyline points="${points}"
                              fill="none"
                              stroke="${trendColor}"
                              stroke-width="2"
                              stroke-linecap="round" />
                </svg>
                ${prices.length > 1 ? `
                <div class="absolute top-1 right-1 text-xs font-medium px-2 py-1 bg-slate-800/80 rounded text-white">
                    ${lastPrice >= firstPrice ? '+' : ''}€${(lastPrice - firstPrice).toFixed(2)}
                </div>` : ''}
            </div>
        `;
    }

    async showPriceHistory(itemId) {
        try {
            const items = await this.apiRequest('/watched-items');
            const item = items.find(i => i.id === itemId);

            if (!item) {
                this.showToast('Item not found', 'error');
                return;
            }

            const priceHistory = item.price_history ? JSON.parse(item.price_history) : [];

            document.getElementById('priceHistoryItemTitle').textContent = item.title;
            document.getElementById('initialPrice').textContent = `€${item.initial_price.toFixed(2)}`;
            document.getElementById('currentPrice').textContent = `€${item.current_price.toFixed(2)}`;

            const prices = priceHistory.map(p => p.price);
            const lowestPrice = prices.length > 0 ? Math.min(...prices) : item.initial_price;
            document.getElementById('lowestPrice').textContent = `€${lowestPrice.toFixed(2)}`;
            document.getElementById('totalChanges').textContent = priceHistory.length;

            this.createPriceHistoryChart(item, priceHistory);
            this.createPriceHistoryTable(priceHistory);

            document.getElementById('priceHistoryModal').classList.remove('hidden');
            document.getElementById('priceHistoryModal').classList.add('flex');

        } catch (error) {
            this.showToast('Failed to load price history', 'error');
        }
    }

    createPriceHistoryChart(item, priceHistory) {
        const ctx = document.getElementById('priceHistoryChart').getContext('2d');

        if (this.priceHistoryChart) {
            this.priceHistoryChart.destroy();
        }

        const allPrices = [
            { price: item.initial_price, date: item.created_at || new Date().toISOString() },
            ...priceHistory
        ];

        this.priceHistoryChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: allPrices.map(p => new Date(p.date).toLocaleDateString()),
                datasets: [{
                    label: 'Price (€)',
                    data: allPrices.map(p => p.price),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
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
                        backgroundColor: '#1f2937',
                        titleColor: '#ffffff',
                        bodyColor: '#d1d5db',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#374151',
                        },
                        ticks: {
                            color: '#9ca3af',
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        grid: {
                            color: '#374151',
                        },
                        ticks: {
                            color: '#9ca3af',
                            callback: function(value) {
                                return '€' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }

    createPriceHistoryTable(priceHistory) {
        const tableBody = document.getElementById('priceHistoryTableBody');

        if (priceHistory.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="px-4 py-8 text-center text-gray-500">No price history available</td>
                </tr>
            `;
            return;
        }

        const sortedHistory = [...priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

        tableBody.innerHTML = sortedHistory.slice(0, 50).map((entry, index) => {
            const previousPrice = index < sortedHistory.length - 1 ? sortedHistory[index + 1].price : entry.price;
            const change = entry.price - previousPrice;
            const changeClass = change > 0 ? 'text-red-400' : change < 0 ? 'text-green-400' : 'text-gray-400';
            const changeIcon = change > 0 ? 'fa-arrow-up' : change < 0 ? 'fa-arrow-down' : 'fa-minus';

            return `
                <tr class="border-b border-gray-700 hover:bg-gray-700/30">
                    <td class="px-4 py-2">${new Date(entry.date).toLocaleString()}</td>
                    <td class="px-4 py-2 font-medium">€${entry.price.toFixed(2)}</td>
                    <td class="px-4 py-2 ${changeClass}">
                        <i class="fas ${changeIcon} mr-1"></i>
                        ${change !== 0 ? (change > 0 ? '+' : '') + '€' + change.toFixed(2) : 'No change'}
                    </td>
                </tr>
            `;
        }).join('');
    }

    closePriceHistoryModal() {
        document.getElementById('priceHistoryModal').classList.add('hidden');
        document.getElementById('priceHistoryModal').classList.remove('flex');

        if (this.priceHistoryChart) {
            this.priceHistoryChart.destroy();
            this.priceHistoryChart = null;
        }
    }

    async toggleWatchNotifications(itemId) {
        try {
            await this.apiRequest(`/watched-items/${itemId}`, {
                method: 'PUT',
                body: JSON.stringify({ notifications_enabled: event.target.checked })
            });
        } catch (error) {
            this.showToast('Failed to update notification setting', 'error');
            event.target.checked = !event.target.checked; // Revert on error
        }
    }

    async deleteWatchedItem(itemId) {
        if (!confirm('Remove this item from watch list?')) return;

        try {
            await this.apiRequest(`/watched-items/${itemId}`, { method: 'DELETE' });
            this.showToast('Item removed from watch list', 'success');
            this.loadWatchedItems();
        } catch (error) {
            this.showToast('Failed to remove item', 'error');
        }
    }

    async checkSinglePrice(itemId) {
        this.showLoading('Checking price...');

        try {
            const result = await this.apiRequest('/watched-items/check-all', { method: 'POST' });
            this.hideLoading();

            const updateForThisItem = result.updates.find(update => update.item_id === itemId);

            if (updateForThisItem) {
                this.showToast(`Price changed: €${updateForThisItem.old_price} → €${updateForThisItem.new_price}`,
                              updateForThisItem.new_price > updateForThisItem.old_price ? 'warning' : 'success');
            } else {
                this.showToast('No price change detected', 'success');
            }

            this.loadWatchedItems();
            this.checkNotifications();

        } catch (error) {
            this.hideLoading();
            this.showToast('Failed to check price: ' + error.message, 'error');
        }
    }

    async checkAllPrices() {
        this.showLoading('Checking all prices...');

        try {
            const result = await this.apiRequest('/watched-items/check-all', { method: 'POST' });
            this.hideLoading();
            this.showToast(`Checked ${result.checked} items, ${result.updates.length} price changes found`, 'success');
            this.loadWatchedItems();
            this.checkNotifications();
        } catch (error) {
            this.hideLoading();
            this.showToast('Failed to check prices', 'error');
        }
    }
}