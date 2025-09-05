// Orders management functionality - Completely redesigned
class OrdersManager extends KleinManagerCore {
    constructor() {
        super();
        this.selectedOrderForColor = null;
        this.selectedColor = undefined;
        this.activeFilters = {
            search: '',
            status: '',
            color: '',
            seller: '',
            priceMin: '',
            priceMax: ''
        };
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
            // Collect all filter values
            this.activeFilters = {
                search: document.getElementById('searchInput')?.value || '',
                status: document.getElementById('statusFilter')?.value || '',
                color: document.getElementById('colorFilter')?.value || '',
                seller: document.getElementById('sellerFilter')?.value || '',
                priceMin: document.getElementById('priceMinFilter')?.value || '',
                priceMax: document.getElementById('priceMaxFilter')?.value || ''
            };

            let url = '/orders?';
            Object.entries(this.activeFilters).forEach(([key, value]) => {
                if (value) url += `${key}=${encodeURIComponent(value)}&`;
            });

            const orders = await this.apiRequest(url);
            const container = document.getElementById('orders-list');

            if (orders.length === 0) {
                container.innerHTML = this.renderEmptyState();
            } else {
                this.renderOrdersWithCurrentView(orders, container);
            }

            // Update stats
            this.updateOrderStats(orders);
        } catch (error) {
            this.showToast('Failed to load orders', 'error');
        }
    }

    renderEmptyState() {
        return `
            <div class="col-span-full bg-gray-800 rounded-2xl p-12 text-center border border-gray-700">
                <div class="mb-6">
                    <i class="fas fa-search text-6xl text-gray-600 mb-4"></i>
                    <h3 class="text-xl font-semibold text-white mb-2">No Orders Found</h3>
                    <p class="text-gray-400">Try adjusting your filters or add a new order</p>
                </div>
                <button onclick="app.showAddOrderForm()" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg">
                    <i class="fas fa-plus mr-2"></i>Add Your First Order
                </button>
            </div>
        `;
    }

    renderOrdersWithCurrentView(orders, container) {
        if (this.viewMode === 'grid') {
            container.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6';
            container.innerHTML = orders.map(order => this.renderCompactOrderCard(order)).join('');
        } else if (this.viewMode === 'list') {
            container.className = 'space-y-3';
            container.innerHTML = orders.map(order => this.renderDetailedListItem(order)).join('');
        } else {
            // Table view
            container.className = 'overflow-hidden bg-gray-800 rounded-2xl border border-gray-700';
            container.innerHTML = this.renderOrdersTable(orders);
        }
    }

    updateOrderStats(orders) {
        const statsContainer = document.getElementById('order-stats');
        if (!statsContainer) return;

        const stats = {
            total: orders.length,
            ordered: orders.filter(o => o.status === 'Ordered').length,
            shipped: orders.filter(o => o.status === 'Shipped').length,
            delivered: orders.filter(o => o.status === 'Delivered').length,
            totalValue: orders.reduce((sum, o) => sum + (o.price || 0), 0),
            newSellers: orders.filter(o => o.seller_is_new).length
        };

        statsContainer.innerHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div class="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-4 text-center">
                    <div class="text-2xl font-bold text-blue-400">${stats.total}</div>
                    <div class="text-xs text-blue-300 mt-1">Total</div>
                </div>
                <div class="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-4 text-center">
                    <div class="text-2xl font-bold text-yellow-400">${stats.ordered}</div>
                    <div class="text-xs text-yellow-300 mt-1">Ordered</div>
                </div>
                <div class="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-xl p-4 text-center">
                    <div class="text-2xl font-bold text-orange-400">${stats.shipped}</div>
                    <div class="text-xs text-orange-300 mt-1">Shipped</div>
                </div>
                <div class="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-4 text-center">
                    <div class="text-2xl font-bold text-green-400">${stats.delivered}</div>
                    <div class="text-xs text-green-300 mt-1">Delivered</div>
                </div>
                <div class="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-4 text-center">
                    <div class="text-2xl font-bold text-purple-400">€${stats.totalValue.toFixed(0)}</div>
                    <div class="text-xs text-purple-300 mt-1">Value</div>
                </div>
                <div class="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-xl p-4 text-center">
                    <div class="text-2xl font-bold text-red-400">${stats.newSellers}</div>
                    <div class="text-xs text-red-300 mt-1">New Sellers</div>
                </div>
            </div>
        `;
    }

    renderCompactOrderCard(order) {
        const images = order.local_images ? JSON.parse(order.local_images) : [];
        const trackingData = order.tracking_details ? JSON.parse(order.tracking_details) : null;

        return `
            <div class="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 hover:border-gray-600 hover:shadow-xl transition-all duration-300 group overflow-hidden" data-order-id="${order.id}">
                <!-- Header with Color and Status -->
                <div class="relative">
                    ${images.length > 0
                        ? `<div class="relative overflow-hidden">
                             <img src="/images/${images[0]}" class="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer" onclick="window.open('/images/${images[0]}', '_blank')">
                             <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                           </div>`
                        : `<div class="w-full h-32 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                             <i class="fas fa-image text-gray-500 text-2xl"></i>
                           </div>`
                    }

                    <!-- Status Badge -->
                    <div class="absolute top-3 right-3">
                        <span class="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${this.getStatusClass(order.status)}">
                            ${this.getStatusIcon(order.status)} ${this.t(`status.${order.status.toLowerCase()}`)}
                        </span>
                    </div>

                    <!-- Color Indicator -->
                    ${order.color ? `
                        <div class="absolute top-3 left-3 w-4 h-4 rounded-full border-2 border-white shadow-lg" style="background-color: ${order.color}"></div>
                    ` : ''}

                    <!-- Price Badge -->
                    <div class="absolute -bottom-4 left-4">
                        <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
                            €${order.price.toFixed(2)}
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <div class="p-4 pt-6">
                    <h3 class="text-white font-semibold text-sm mb-3 line-clamp-2 leading-tight">${order.title}</h3>

                    <!-- Info Grid -->
                    <div class="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div class="text-gray-400 flex items-center">
                            <i class="fas fa-tag mr-2 w-3 text-center"></i>
                            <span class="truncate">${order.category || 'N/A'}</span>
                        </div>
                        <div class="text-gray-400 flex items-center">
                            <i class="fas fa-map-marker-alt mr-2 w-3 text-center"></i>
                            <span class="truncate">${order.location || 'N/A'}</span>
                        </div>
                        <div class="text-gray-400 flex items-center col-span-2">
                            <i class="fas fa-user mr-2 w-3 text-center"></i>
                            <span class="truncate">${order.seller_name || 'N/A'}</span>
                            ${order.seller_is_new ? '<span class="ml-2 text-red-400 text-xs">⚠️ NEW</span>' : ''}
                        </div>
                    </div>

                    <!-- Tracking Info -->
                    ${order.tracking_number && trackingData && !trackingData.error ? `
                        <div class="mb-3 p-2 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-xl border border-blue-500/30">
                            <div class="flex items-center justify-between text-xs mb-2">
                                <span class="text-blue-300 font-medium">
                                    <i class="fas fa-truck mr-1"></i>${trackingData.carrier}
                                </span>
                                <span class="text-blue-400 font-bold">${trackingData.progress || 0}%</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-1.5">
                                <div class="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500" style="width: ${trackingData.progress || 0}%"></div>
                            </div>
                            <div class="text-xs text-gray-400 mt-1 truncate">${trackingData.status || 'No status available'}</div>
                        </div>
                    ` : ''}

                    <!-- Action Buttons -->
                    <div class="flex gap-1.5">
                        <button onclick="app.editOrder(${order.id})" class="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-xs transition-colors" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="app.showColorPicker(${order.id})" class="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs transition-colors" title="Color">
                            <i class="fas fa-palette"></i>
                        </button>
                        ${!order.tracking_number ? `
                            <button onclick="app.showTrackingModal(${order.id})" class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs transition-colors" title="Add Tracking">
                                <i class="fas fa-plus"></i>
                            </button>
                        ` : `
                            <button onclick="app.updateTracking(${order.id})" class="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs transition-colors" title="Update">
                                <i class="fas fa-sync"></i>
                            </button>
                        `}
                        <a href="${order.article_url}" target="_blank" class="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs text-center transition-colors" title="View">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                        <button onclick="app.deleteOrder(${order.id})" class="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs transition-colors" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderDetailedListItem(order) {
        const images = order.local_images ? JSON.parse(order.local_images) : [];
        const trackingData = order.tracking_details ? JSON.parse(order.tracking_details) : null;

        return `
            <div class="bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-700 hover:border-gray-600 hover:shadow-xl transition-all duration-300" data-order-id="${order.id}">
                <div class="flex gap-4">
                    <!-- Image -->
                    <div class="w-20 h-20 flex-shrink-0 relative">
                        ${order.color ? `
                            <div class="absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-white shadow-lg z-10" style="background-color: ${order.color}"></div>
                        ` : ''}
                        ${images.length > 0
                            ? `<img src="/images/${images[0]}" class="w-full h-full object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform" onclick="window.open('/images/${images[0]}', '_blank')">`
                            : `<div class="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                                 <i class="fas fa-image text-gray-500"></i>
                               </div>`
                        }
                    </div>

                    <!-- Main Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-lg font-semibold text-white truncate pr-4">${order.title}</h3>
                            <div class="flex items-center gap-3">
                                <span class="text-xl font-bold text-blue-400">€${order.price.toFixed(2)}</span>
                                <span class="px-3 py-1 rounded-full text-xs font-medium ${this.getStatusClass(order.status)} whitespace-nowrap">
                                    ${this.getStatusIcon(order.status)} ${this.t(`status.${order.status.toLowerCase()}`)}
                                </span>
                            </div>
                        </div>

                        <!-- Info Row -->
                        <div class="flex items-center gap-6 text-sm text-gray-400 mb-3">
                            <span class="flex items-center">
                                <i class="fas fa-tag mr-2 w-4 text-center"></i>
                                ${order.category || 'N/A'}
                            </span>
                            <span class="flex items-center">
                                <i class="fas fa-map-marker-alt mr-2 w-4 text-center"></i>
                                ${order.location || 'N/A'}
                            </span>
                            <span class="flex items-center">
                                <i class="fas fa-user mr-2 w-4 text-center"></i>
                                ${order.seller_name || 'N/A'}
                                ${order.seller_is_new ? '<span class="ml-2 text-red-400 text-xs">⚠️ NEW SELLER</span>' : ''}
                            </span>
                        </div>

                        <!-- Tracking Section -->
                        ${order.tracking_number && trackingData && !trackingData.error ? `
                            <div class="mb-3">
                                <button onclick="app.toggleTrackingDetails(${order.id})" class="w-full p-3 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 rounded-xl hover:from-blue-900/50 hover:to-indigo-900/50 transition-all">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-blue-300 font-medium">
                                            <i class="fas fa-truck mr-2"></i>${trackingData.carrier}: ${order.tracking_number}
                                        </span>
                                        <div class="flex items-center gap-2">
                                            <span class="text-blue-400 font-bold">${trackingData.progress || 0}%</span>
                                            <i id="tracking-icon-${order.id}" class="fas fa-chevron-down text-blue-400"></i>
                                        </div>
                                    </div>
                                    <div class="w-full bg-gray-700 rounded-full h-2 mb-2">
                                        <div class="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500" style="width: ${trackingData.progress || 0}%"></div>
                                    </div>
                                    <div class="text-sm text-gray-300">${trackingData.status || 'No status available'}</div>
                                </button>

                                <div id="tracking-details-${order.id}" class="hidden mt-3 p-4 bg-gray-900 rounded-xl border border-gray-600">
                                    <h4 class="text-white font-medium mb-3">Tracking History</h4>
                                    ${trackingData.history && trackingData.history.length > 0 ? `
                                        <div class="space-y-3">
                                            ${trackingData.history.map(event => `
                                                <div class="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                                                    <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                    <div class="flex-1">
                                                        <div class="text-sm text-gray-400 mb-1">${event.time}</div>
                                                        <div class="text-gray-300">${event.text}</div>
                                                        ${event.location ? `<div class="text-xs text-gray-500 mt-1">${event.location}</div>` : ''}
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : '<div class="text-gray-400 text-center py-4">No tracking history available</div>'}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Action Buttons -->
                        <div class="flex gap-2">
                            <button onclick="app.editOrder(${order.id})" class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition-colors">
                                <i class="fas fa-edit mr-1"></i>Edit
                            </button>
                            <button onclick="app.showColorPicker(${order.id})" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
                                <i class="fas fa-palette mr-1"></i>Color
                            </button>
                            ${!order.tracking_number ? `
                                <button onclick="app.showTrackingModal(${order.id})" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                                    <i class="fas fa-plus mr-1"></i>Add Tracking
                                </button>
                            ` : `
                                <button onclick="app.updateTracking(${order.id})" class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors">
                                    <i class="fas fa-sync mr-1"></i>Update
                                </button>
                            `}
                            <a href="${order.article_url}" target="_blank" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors">
                                <i class="fas fa-external-link-alt mr-1"></i>View
                            </a>
                            <button onclick="app.deleteOrder(${order.id})" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
                                <i class="fas fa-trash mr-1"></i>Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderOrdersTable(orders) {
        return `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-700 border-b border-gray-600">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Item</th>
                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Seller</th>
                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tracking</th>
                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-700">
                        ${orders.map(order => this.renderTableRow(order)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderTableRow(order) {
        const images = order.local_images ? JSON.parse(order.local_images) : [];
        const trackingData = order.tracking_details ? JSON.parse(order.tracking_details) : null;

        return `
            <tr class="hover:bg-gray-700 transition-colors" data-order-id="${order.id}">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-12 w-12 relative">
                            ${order.color ? `
                                <div class="absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-white shadow-lg z-10" style="background-color: ${order.color}"></div>
                            ` : ''}
                            ${images.length > 0
                                ? `<img src="/images/${images[0]}" class="h-12 w-12 rounded-lg object-cover cursor-pointer" onclick="window.open('/images/${images[0]}', '_blank')">`
                                : `<div class="h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center">
                                     <i class="fas fa-image text-gray-500"></i>
                                   </div>`
                            }
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-white max-w-xs truncate">${order.title}</div>
                            <div class="text-sm text-gray-400">${order.category || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-lg font-bold text-blue-400">€${order.price.toFixed(2)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getStatusClass(order.status)}">
                        ${this.getStatusIcon(order.status)} ${this.t(`status.${order.status.toLowerCase()}`)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-300">${order.seller_name || 'N/A'}</div>
                    <div class="text-sm text-gray-400">${order.location || 'N/A'}</div>
                    ${order.seller_is_new ? '<div class="text-xs text-red-400">⚠️ New Seller</div>' : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${order.tracking_number && trackingData && !trackingData.error ? `
                        <div class="text-sm">
                            <div class="text-blue-300 font-medium">${trackingData.carrier}</div>
                            <div class="text-gray-400 text-xs">${order.tracking_number}</div>
                            <div class="w-24 bg-gray-700 rounded-full h-1 mt-1">
                                <div class="bg-blue-500 h-1 rounded-full" style="width: ${trackingData.progress || 0}%"></div>
                            </div>
                        </div>
                    ` : '<span class="text-gray-500 text-sm">No tracking</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="app.editOrder(${order.id})" class="text-gray-400 hover:text-white" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="app.showColorPicker(${order.id})" class="text-purple-400 hover:text-purple-300" title="Color">
                            <i class="fas fa-palette"></i>
                        </button>
                        ${!order.tracking_number ? `
                            <button onclick="app.showTrackingModal(${order.id})" class="text-green-400 hover:text-green-300" title="Add Tracking">
                                <i class="fas fa-plus"></i>
                            </button>
                        ` : `
                            <button onclick="app.updateTracking(${order.id})" class="text-yellow-400 hover:text-yellow-300" title="Update">
                                <i class="fas fa-sync"></i>
                            </button>
                        `}
                        <a href="${order.article_url}" target="_blank" class="text-gray-400 hover:text-white" title="View">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                        <button onclick="app.deleteOrder(${order.id})" class="text-red-400 hover:text-red-300" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    getStatusIcon(status) {
        const icons = {
            'Ordered': '📦',
            'Shipped': '🚚',
            'Delivered': '✅'
        };
        return icons[status] || '📦';
    }

    // Add Order functionality
    async addOrder(event) {
        event.preventDefault();
        const url = document.getElementById('orderUrl').value;

        this.showLoading('Adding order...');

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

    // Toggle view modes
    toggleView() {
        const modes = ['grid', 'list', 'table'];
        const currentIndex = modes.indexOf(this.viewMode);
        this.viewMode = modes[(currentIndex + 1) % modes.length];
        localStorage.setItem('viewMode', this.viewMode);
        this.updateViewIcon();
        this.loadOrders();
    }

    updateViewIcon() {
        const icon = document.getElementById('viewToggleIcon');
        if (icon) {
            const icons = {
                'grid': 'fas fa-th',
                'list': 'fas fa-list',
                'table': 'fas fa-table'
            };
            icon.className = icons[this.viewMode] || 'fas fa-th';
        }
    }

    // Clear all filters
    clearAllFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('colorFilter').value = '';
        document.getElementById('sellerFilter').value = '';
        document.getElementById('priceMinFilter').value = '';
        document.getElementById('priceMaxFilter').value = '';
        this.loadOrders();
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
            <button class="w-12 h-12 rounded-full border-2 border-gray-600 hover:border-white transition-colors shadow-lg hover:shadow-xl hover:scale-110 transform duration-200"
                    style="background-color: ${color.value}"
                    onclick="app.selectColor('${color.value}')"
                    data-color="${color.value}"
                    title="${color.name}">
            </button>
        `).join('');

        picker.innerHTML += `
            <button class="w-12 h-12 rounded-full border-2 border-gray-600 hover:border-white transition-colors bg-gray-700 flex items-center justify-center hover:scale-110 transform duration-200"
                    onclick="app.selectColor('')"
                    data-color=""
                    title="Remove Color">
                <i class="fas fa-times text-white"></i>
            </button>
        `;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    selectColor(color) {
        document.querySelectorAll('#color-picker button').forEach(btn => {
            btn.classList.remove('ring-4', 'ring-white', 'ring-offset-2', 'ring-offset-gray-800');
        });

        event.target.classList.add('ring-4', 'ring-white', 'ring-offset-2', 'ring-offset-gray-800');
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
                this.loadOrders();
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
            this.loadOrders();
        } catch (error) {
            this.showToast('Failed to delete order', 'error');
        }
    }
}