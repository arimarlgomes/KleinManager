// Tracking functionality
class TrackingManager extends KleinManagerCore {
    showTrackingModal(orderId) {
        document.getElementById('tracking_order_id').value = orderId;
        document.getElementById('tracking_carrier').value = '';
        document.getElementById('tracking_number').value = '';

        document.getElementById('trackingModal').classList.remove('hidden');
        document.getElementById('trackingModal').classList.add('flex');

        setTimeout(() => {
            document.getElementById('tracking_carrier').focus();
        }, 100);
    }

    closeTrackingModal() {
        document.getElementById('trackingModal').classList.add('hidden');
        document.getElementById('trackingModal').classList.remove('flex');
    }

    async saveTracking(event) {
        event.preventDefault();

        const orderId = document.getElementById('tracking_order_id').value;
        const carrier = document.getElementById('tracking_carrier').value;
        const trackingNumber = document.getElementById('tracking_number').value;

        if (!carrier || !trackingNumber) {
            this.showToast('Please select carrier and enter tracking number', 'error');
            return;
        }

        this.showLoading('Adding tracking information...');

        try {
            await this.apiRequest(`/orders/${orderId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    tracking_number: trackingNumber,
                    carrier: carrier
                })
            });

            this.hideLoading();
            this.closeTrackingModal();
            this.showToast('Tracking added successfully', 'success');

            if (this.currentSection === 'dashboard') this.loadDashboard();
            else if (this.currentSection === 'orders') this.loadOrders();
            else if (this.currentSection === 'tracking') this.loadTracking();
        } catch (error) {
            this.hideLoading();
            this.showToast('Failed to add tracking', 'error');
        }
    }

    async loadTracking() {
        try {
            const orders = await this.apiRequest('/orders/tracking');
            const container = document.getElementById('tracking-list');

            if (orders.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-truck text-gray-600 text-4xl mb-4"></i>
                        <p class="text-gray-400">No active shipments</p>
                    </div>
                `;
            } else {
                container.innerHTML = orders.map(order => this.renderTrackingCard(order)).join('');
            }
        } catch (error) {
            this.showToast('Failed to load tracking', 'error');
        }
    }

    async updateAllTracking() {
        this.showLoading('Updating all tracking information...');

        try {
            const result = await this.apiRequest('/tracking/update-all', { method: 'POST' });
            this.hideLoading();
            this.showToast(`Updated ${result.updated} shipments`, 'success');

            if (this.currentSection === 'tracking') {
                this.loadTracking();
            } else if (this.currentSection === 'dashboard') {
                this.loadDashboard();
            } else if (this.currentSection === 'orders') {
                this.loadOrders();
            }
        } catch (error) {
            this.hideLoading();
            this.showToast('Failed to update tracking', 'error');
        }
    }

    async updateTracking(id) {
        this.showLoading('Updating tracking information...');

        try {
            await this.apiRequest(`/orders/${id}/tracking`, { method: 'POST' });
            this.hideLoading();
            this.showToast('Tracking updated', 'success');

            if (this.currentSection === 'dashboard') this.loadDashboard();
            else if (this.currentSection === 'orders') this.loadOrders();
            else if (this.currentSection === 'tracking') this.loadTracking();
        } catch (error) {
            this.hideLoading();
            this.showToast('Failed to update tracking', 'error');
        }
    }

    goToOrder(orderId) {
        this.showSection('orders');
        setTimeout(() => {
            const orderElement = document.querySelector(`[data-order-id="${orderId}"]`);
            if (orderElement) {
                orderElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                orderElement.classList.add('ring-2', 'ring-blue-500');
                setTimeout(() => {
                    orderElement.classList.remove('ring-2', 'ring-blue-500');
                }, 3000);
            }
        }, 500);
    }

    renderTrackingCard(order) {
        const trackingData = order.tracking_details ? JSON.parse(order.tracking_details) : null;
        if (!trackingData || trackingData.error) {
            return '';
        }

        return `
            <div class="bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-700 relative">
                ${order.color ? `
                    <div class="absolute top-4 right-4 w-4 h-4 rounded-full border-2 border-white shadow-lg"
                         style="background-color: ${order.color}"></div>
                ` : ''}

                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div>
                        <h3 class="text-xl font-semibold text-white mb-1">${order.title}</h3>
                        <p class="text-gray-400">
                            <i class="fas fa-truck mr-2"></i>${trackingData.carrier || 'Unknown'}: ${order.tracking_number}
                        </p>
                    </div>
                    <span class="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-lg text-sm font-medium mt-2 sm:mt-0">
                        ${trackingData.status}
                    </span>
                </div>

                <div class="mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <p class="text-sm text-gray-400">${this.t('tracking.progress')}</p>
                        <span class="text-sm font-medium text-blue-400">${trackingData.progress || 0}%</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-3">
                        <div class="bg-blue-500 h-3 rounded-full" style="width: ${trackingData.progress || 0}%"></div>
                    </div>
                </div>

                ${trackingData.history && trackingData.history.length > 0 ? `
                    <div class="mb-4">
                        <h4 class="font-medium text-white mb-3">${this.t('tracking.history')}</h4>
                        <div class="space-y-3 max-h-60 overflow-y-auto">
                            ${trackingData.history.slice(0, 3).map((event, index) => `
                                <div class="flex items-start gap-3 ${index === 0 ? 'text-blue-400' : 'text-gray-400'}">
                                    <div class="w-2 h-2 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-600'} mt-2 flex-shrink-0"></div>
                                    <div class="flex-1">
                                        <p class="text-xs font-medium">${event.time}</p>
                                        <p class="text-sm">${event.text}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="flex flex-wrap gap-2">
                    <button onclick="app.goToOrder(${order.id})" class="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors">
                        <i class="fas fa-box mr-2"></i>${this.t('actions.viewOrder')}
                    </button>
                    <button onclick="app.updateTracking(${order.id})" class="flex-1 sm:flex-none px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm transition-colors">
                        <i class="fas fa-sync mr-2"></i>${this.t('actions.refresh')}
                    </button>
                    <a href="${trackingData.url}" target="_blank" class="flex-1 sm:flex-none px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm text-center transition-colors">
                        <i class="fas fa-external-link-alt mr-2"></i>${trackingData.carrier}
                    </a>
                </div>
            </div>
        `;
    }
}