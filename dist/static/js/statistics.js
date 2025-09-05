// Statistics functionality
class StatisticsManager extends KleinManagerCore {
    async loadStatistics() {
        try {
            const stats = await this.apiRequest('/stats/detail');
            document.getElementById('stats-content').innerHTML = this.renderStatistics(stats);
        } catch (error) {
            this.showToast('Failed to load statistics', 'error');
        }
    }

    renderStatistics(stats) {
        return `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-700">
                    <h3 class="text-lg font-semibold text-white mb-6">By Status</h3>
                    <div class="space-y-4">
                        ${Object.entries(stats.by_status || {}).map(([status, count]) => `
                            <div class="flex justify-between items-center py-2 border-b border-gray-700">
                                <span class="text-gray-400">${this.t(`status.${status.toLowerCase()}`)}</span>
                                <span class="font-semibold text-white text-lg">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-700">
                    <h3 class="text-lg font-semibold text-white mb-6">Top Categories</h3>
                    <div class="space-y-4">
                        ${(stats.top_categories || []).map(cat => `
                            <div class="flex justify-between items-center py-2 border-b border-gray-700">
                                <span class="text-gray-400">${cat.category}</span>
                                <span class="font-semibold text-white text-lg">${cat.count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
}