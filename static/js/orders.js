// Orders management functionality
class OrdersManager extends KleinManagerCore {
    constructor() {
        super();
        this.selectedOrderForColor = null;
        this.selectedColor = undefined;
    }

    // Order Forms
    showAddOrderForm() {
        document.getElementById('addOrderForm').classList.remove('hidden');
        document.getElementById('orderUrl').focus();
    }

    hideAddOrderForm() {
        document.getElementById('addOrderForm').classList.add('hidden');
        document.getElementById('orderUrl').value = '';
    }

    async loadOrders() {
        try {
            const search = document.getElementById('searchInput')?.value || '';
            const status = document.getElementById('statusFilter')?.value || '';
            const color = document.getElementById('colorFilter')?.value || '';

            let url = '/orders?';
            if (search) url += `search=${encodeURIComponent(search)}&`;
            if (status) url += `status=${encodeURIComponent(status)}&`;
            if (color) url += `color=${encodeURIComponent(color)}&`;

            const orders = await this.apiRequest(url);
            const container = document.getElementById('orders-list');

            if (orders.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-box-open text-gray-600 text-4xl mb-4"></i>
                        <p class="text-gray-400">No orders found</p>
                    </div>
                `;
            } else {
                if (this.viewMode === 'grid') {
                    container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6';
                    container.innerHTML = orders.map(order => this.renderOrderCard(order)).join('');
                } else {
                    container.className = 'space-y-4';
                    container.innerHTML = orders.map(order => this.renderOrderListItem(order)).join('');
                }
            }
        } catch (error) {
            this.showToast('Failed to load orders', 'error');
        }
    }

    async addOrder(event) {
        event.preventDefault();
        const url = document.getElementById('orderUrl').value;

        this.showLoading(this.t('loading.title'));

        try {
            const order = await this.apiRequest('/orders', {
                method: 'POST',
                body: JSON.stringify({ url })
            });

            this.hideLoading();

            if (order.seller_is_new) {
                this.showToast(`⚠️ ${this.t('seller.new')}: ${order.seller_name} (${this.t('seller.since')} ${order.seller_since})`, 'warning');
            } else {
                this.showToast('Order added successfully', 'success');
            }

            this.hideAddOrderForm();
            this.loadOrders();
        } catch (error) {
            this.hideLoading();
            this.showToast(error.message, 'error');
        }
    }

    // Edit Order
    async editOrder(id) {
        try {
            const order = await this.apiRequest(`/orders/${id}`);

            document.getElementById('edit_id').value = order.id;
            document.getElementById('edit_title').value = order.title || '';
            document.getElementById('edit_price').value = order.price || '';
            document.getElementById('edit_status').value = order.status || 'Ordered';
            document.getElementById('edit_color').value = order.color || '';
            document.getElementById('edit_notes').value = order.notes || '';

            document.getElementById('editModal').classList.remove('hidden');
            document.getElementById('editModal').classList.add('flex');
        } catch (error) {
            this.showToast('Failed to load order', 'error');
        }
    }

    async saveEdit(event) {
        event.preventDefault();

        const id = document.getElementById('edit_id').value;
        const data = {
            title: document.getElementById('edit_title').value,
            price: parseFloat(document.getElementById('edit_price').value) || 0,
            status: document.getElementById('edit_status').value,
            color: document.getElementById('edit_color').value,
            notes: document.getElementById('edit_notes').value
        };

        this.showLoading('Saving changes...');

        try {
            await this.apiRequest(`/orders/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });

            this.hideLoading();
            this.closeEdit();
            this.showToast('Order updated successfully', 'success');

            if (this.currentSection === 'dashboard') this.loadDashboard();
            else if (this.currentSection === 'orders') this.loadOrders();
        } catch (error) {
            this.hideLoading();
            this.showToast('Failed to save changes', 'error');
        }
    }

    closeEdit() {
        document.getElementById('editModal').classList.add('hidden');
        document.getElementById('editModal').classList.remove('flex');
    }

    // Color Management
    showColorPicker(orderId) {
        this.selectedOrderForColor = orderId;
        const modal = document.getElementById('colorModal');
        const picker = document.getElementById('color-picker');

        if (!modal || !picker || !this.settings.colors) return;

        picker.innerHTML = this.settings.colors.map(color => `
            <button class="w-10 h-10 rounded-full border-2 border-gray-600 hover:border-white transition-colors"
                    style="background-color: ${color.value}"
                    onclick="app.selectColor('${color.value}')"
                    data-color="${color.value}">
            </button>
        `).join('');

        picker.innerHTML += `
            <button class="w-10 h-10 rounded-full border-2 border-gray-600 hover:border-white transition-colors bg-gray-700 flex items-center justify-center"
                    onclick="app.selectColor('')"
                    data-color="">
                <i class="fas fa-times text-white text-xs"></i>
            </button>
        `;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    selectColor(color) {
        document.querySelectorAll('#color-picker button').forEach(btn => {
            btn.classList.remove('ring-4', 'ring-white');
        });

        event.target.classList.add('ring-4', 'ring-white');
        this.selectedColor = color;
    }

    async applyColor() {
        if (this.selectedOrderForColor && this.selectedColor !== undefined) {
            try {
                await this.apiRequest(`/orders/${this.selectedOrderForColor}`, {
                    method: 'PUT',
                    body: JSON.stringify({ color: this.selectedColor })
                });

                this.closeColorModal();
                this.showToast('Color applied successfully', 'success');

                if (this.currentSection === 'orders') {
                    this.loadOrders();
                } else if (this.currentSection === 'dashboard') {
                    this.loadDashboard();
                }
            } catch (error) {
                this.showToast('Failed to apply color', 'error');
            }
        }
    }

    closeColorModal() {
        const modal = document.getElementById('colorModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        this.selectedOrderForColor = null;
        this.selectedColor = undefined;
    }

    async deleteOrder(id) {
        if (!confirm('Really delete this order?')) return;

        try {
            await this.apiRequest(`/orders/${id}`, { method: 'DELETE' });
            this.showToast('Order deleted successfully', 'success');

            if (this.currentSection === 'dashboard') this.loadDashboard();
            else if (this.currentSection === 'orders') this.loadOrders();
        } catch (error) {
            this.showToast('Failed to delete order', 'error');
        }
    }

    renderOrderCard(order) {
        const images = order.local_images ? JSON.parse(order.local_images) : [];
        const trackingData = order.tracking_details ? JSON.parse(order.tracking_details) : null;

        return `
            <div class="bg-gray-800 rounded-xl shadow-sm border border-gray-700 hover:border-gray-600 transition-all relative" data-order-id="${order.id}">
                ${order.color ? `
                    <div class="absolute top-2 left-2 w-4 h-4 rounded-full z-10 border-2 border-white shadow-lg"
                         style="background-color: ${order.color}"></div>
                ` : ''}

                <div class="relative">
                    ${images.length > 0
                        ? `<img src="/images/${images[0]}" class="w-full h-48 object-cover rounded-t-xl cursor-pointer" onclick="window.open('/images/${images[0]}', '_blank')">`
                        : `<div class="w-full h-48 bg-gray-700 rounded-t-xl flex items-center justify-center">
                             <i class="fas fa-image text-gray-500 text-3xl"></i>
                           </div>`
                    }
                    <span class="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${this.getStatusClass(order.status)}">
                        ${this.t(`status.${order.status.toLowerCase()}`)}
                    </span>
                    ${trackingData && trackingData.carrier ? `
                        <span class="absolute bottom-2 left-2 px-2 py-1 bg-gray-900/80 rounded-lg text-xs font-medium text-white">
                            ${trackingData.carrier}
                        </span>
                    ` : ''}
                </div>

                <div class="p-4">
                    <h3 class="text-lg font-semibold text-white mb-2 line-clamp-2">${order.title}</h3>
                    <p class="text-2xl font-bold text-blue-400 mb-3">€${order.price.toFixed(2)}</p>

                    <div class="space-y-1 text-sm text-gray-400 mb-3">
                        <div class="flex items-center">
                            <i class="fas fa-tag mr-2 w-4"></i>
                            <span class="truncate">${order.category || 'N/A'}</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-map-marker-alt mr-2 w-4"></i>
                            <span class="truncate">${order.location || 'N/A'}</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-user mr-2 w-4"></i>
                            <span class="truncate">${order.seller_name || 'N/A'}</span>
                        </div>
                    </div>

                    ${order.seller_is_new ? `
                        <div class="mb-3 px-2 py-1 bg-red-900/50 text-red-300 rounded text-xs text-center">
                            ⚠️ ${this.t('seller.new')}
                        </div>
                    ` : ''}

                    ${order.tracking_number && trackingData && !trackingData.error ? `
                        <div class="mb-3">
                            <button onclick="app.toggleTrackingDetails(${order.id})" class="w-full p-2 bg-blue-900/30 border border-blue-700 rounded hover:bg-blue-900/50 transition-colors">
                                <div class="flex items-center justify-between text-xs">
                                    <span class="text-blue-300">
                                        <i class="fas fa-truck mr-1"></i>${trackingData.carrier || 'Tracking'}: ${order.tracking_number}
                                    </span>
                                    <div class="flex items-center gap-2">
                                        <span class="text-blue-400">${trackingData.progress || 0}%</span>
                                        <i id="tracking-icon-${order.id}" class="fas fa-chevron-down text-blue-400"></i>
                                    </div>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-1 mt-2">
                                    <div class="bg-blue-500 h-1 rounded-full" style="width: ${trackingData.progress || 0}%"></div>
                                </div>
                            </button>

                            <div id="tracking-details-${order.id}" class="hidden mt-2 p-2 bg-gray-900 rounded text-xs text-gray-300">
                                <p class="mb-2 font-medium">${trackingData.status}</p>
                                ${trackingData.history && trackingData.history.length > 0 ? `
                                    <div class="space-y-1">
                                        ${trackingData.history.slice(0, 3).map(event => `
                                            <div class="flex items-start gap-2">
                                                <i class="fas fa-circle text-blue-400" style="font-size: 6px; margin-top: 5px;"></i>
                                                <div>
                                                    <span class="text-gray-500">${event.time}</span>
                                                    <p class="text-gray-400">${event.text}</p>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}

                    <div class="flex flex-wrap gap-2">
                        <button onclick="app.editOrder(${order.id})" class="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 text-xs transition-colors" title="${this.t('actions.edit')}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="app.showColorPicker(${order.id})" class="flex-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs transition-colors" title="Set Color">
                            <i class="fas fa-palette"></i>
                        </button>
                        ${!order.tracking_number ? `
                            <button onclick="app.showTrackingModal(${order.id})" class="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs transition-colors" title="${this.t('actions.addTracking')}">
                                <i class="fas fa-plus"></i>
                            </button>
                        ` : `
                            <button onclick="app.updateTracking(${order.id})" class="flex-1 px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-xs transition-colors" title="${this.t('actions.updateTracking')}">
                                <i class="fas fa-sync"></i>
                            </button>
                        `}
                        <a href="${order.article_url}" target="_blank" class="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs text-center transition-colors" title="${this.t('actions.viewListing')}">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                        <button onclick="app.deleteOrder(${order.id})" class="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-xs transition-colors" title="${this.t('actions.delete')}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderOrderListItem(order) {
        const images = order.local_images ? JSON.parse(order.local_images) : [];
        const trackingData = order.tracking_details ? JSON.parse(order.tracking_details) : null;

        return `
            <div class="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-700 hover:border-gray-600 transition-all relative" data-order-id="${order.id}">
                ${order.color ? `
                    <div class="absolute top-4 left-4 w-4 h-4 rounded-full z-10 border-2 border-white shadow-lg"
                         style="background-color: ${order.color}"></div>
                ` : ''}

                <div class="flex gap-4">
                    <div class="w-20 h-20 flex-shrink-0">
                        ${images.length > 0
                            ? `<img src="/images/${images[0]}" class="w-full h-full object-cover rounded-lg cursor-pointer" onclick="window.open('/images/${images[0]}', '_blank')">`
                            : `<div class="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                                 <i class="fas fa-image text-gray-500"></i>
                               </div>`
                        }
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-lg font-semibold text-white truncate">${order.title}</h3>
                            <span class="px-2 py-1 rounded text-xs font-medium ${this.getStatusClass(order.status)} ml-2">
                                ${this.t(`status.${order.status.toLowerCase()}`)}
                            </span>
                        </div>

                        <div class="flex items-center gap-4 text-sm text-gray-400 mb-2">
                            <span class="text-xl font-bold text-blue-400">€${order.price.toFixed(2)}</span>
                            <span><i class="fas fa-tag mr-1"></i>${order.category || 'N/A'}</span>
                            <span class="hidden sm:inline"><i class="fas fa-map-marker-alt mr-1"></i>${order.location || 'N/A'}</span>
                            <span class="hidden md:inline"><i class="fas fa-user mr-1"></i>${order.seller_name || 'N/A'}</span>
                        </div>

                        ${order.tracking_number && trackingData && !trackingData.error ? `
                            <div class="mb-2">
                                <button onclick="app.toggleTrackingDetails(${order.id})" class="flex items-center gap-2 text-xs">
                                    <span class="text-blue-300">
                                        <i class="fas fa-truck mr-1"></i>${trackingData.carrier}: ${order.tracking_number}
                                    </span>
                                    <div class="flex-1 max-w-xs">
                                        <div class="w-full bg-gray-700 rounded-full h-1">
                                            <div class="bg-blue-500 h-1 rounded-full" style="width: ${trackingData.progress || 0}%"></div>
                                        </div>
                                    </div>
                                    <span class="text-blue-400">${trackingData.progress || 0}%</span>
                                    <i id="tracking-icon-${order.id}" class="fas fa-chevron-down text-blue-400"></i>
                                </button>

                                <div id="tracking-details-${order.id}" class="hidden mt-2 p-2 bg-gray-900 rounded text-xs text-gray-400">
                                    ${trackingData.status}
                                </div>
                            </div>
                        ` : ''}

                        <div class="flex gap-2">
                            <button onclick="app.editOrder(${order.id})" class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 text-xs transition-colors">
                                <i class="fas fa-edit mr-1"></i>${this.t('actions.edit')}
                            </button>
                            <button onclick="app.showColorPicker(${order.id})" class="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs transition-colors">
                                <i class="fas fa-palette mr-1"></i>Color
                            </button>
                            ${!order.tracking_number ? `
                                <button onclick="app.showTrackingModal(${order.id})" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs transition-colors">
                                    <i class="fas fa-plus mr-1"></i>Tracking
                                </button>
                            ` : `
                                <button onclick="app.updateTracking(${order.id})" class="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-xs transition-colors">
                                    <i class="fas fa-sync mr-1"></i>Update
                                </button>
                            `}
                            <a href="${order.article_url}" target="_blank" class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs transition-colors">
                                <i class="fas fa-external-link-alt mr-1"></i>View
                            </a>
                            <button onclick="app.deleteOrder(${order.id})" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs transition-colors">
                                <i class="fas fa-trash mr-1"></i>Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}