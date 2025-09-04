// KleinManager Frontend Application
class KleinManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.currentSection = 'dashboard';
        this.viewMode = localStorage.getItem('viewMode') || 'grid';
        this.apiBase = '/api/v1';
        this.mobileMenuOpen = false;
        this.charts = {};

        this.translations = {
            en: {
                'nav.dashboard': 'Dashboard',
                'nav.orders': 'Orders',
                'nav.tracking': 'Package Tracking',
                'nav.statistics': 'Statistics',
                'dashboard.title': 'Dashboard',
                'dashboard.statusChart': 'Order Status Distribution',
                'dashboard.weeklyChart': 'Weekly Overview',
                'dashboard.recentActivity': 'Recent Activity',
                'orders.title': 'Orders',
                'orders.addNew': 'Add New Order',
                'orders.searchPlaceholder': 'Search...',
                'orders.urlPlaceholder': 'Enter Kleinanzeigen URL...',
                'orders.allStatus': 'All Status',
                'tracking.title': 'Package Tracking',
                'tracking.addTitle': 'Add Tracking Number',
                'tracking.carrier': 'Select Carrier',
                'tracking.number': 'Tracking Number',
                'statistics.title': 'Statistics',
                'stats.total': 'Total Orders',
                'stats.transit': 'In Transit',
                'stats.value': 'Total Value',
                'stats.newSellers': 'New Sellers',
                'status.ordered': 'Ordered',
                'status.shipped': 'Shipped',
                'status.delivered': 'Delivered',
                'actions.addOrder': 'Add Order',
                'actions.save': 'Save',
                'actions.cancel': 'Cancel',
                'actions.refresh': 'Refresh',
                'actions.updateAll': 'Update All',
                'actions.edit': 'Edit',
                'actions.delete': 'Delete',
                'actions.addTracking': 'Add Tracking',
                'actions.updateTracking': 'Update',
                'actions.viewListing': 'View Ad',
                'actions.viewOrder': 'View Order',
                'actions.expandTracking': 'Show Tracking',
                'loading.title': 'Loading...',
                'seller.new': 'New Seller',
                'seller.since': 'Since',
                'tracking.progress': 'Progress',
                'tracking.history': 'Tracking History',
                'tracking.lastUpdate': 'Last Update',
                'order.price': 'Price',
                'order.category': 'Category',
                'order.location': 'Location',
                'order.seller': 'Seller',
                'edit.title': 'Edit Order'
            },
            de: {
                'nav.dashboard': 'Übersicht',
                'nav.orders': 'Bestellungen',
                'nav.tracking': 'Sendungsverfolgung',
                'nav.statistics': 'Statistiken',
                'dashboard.title': 'Übersicht',
                'dashboard.statusChart': 'Bestellstatus Verteilung',
                'dashboard.weeklyChart': 'Wochenübersicht',
                'dashboard.recentActivity': 'Letzte Aktivitäten',
                'orders.title': 'Bestellungen',
                'orders.addNew': 'Neue Bestellung hinzufügen',
                'orders.searchPlaceholder': 'Suchen...',
                'orders.urlPlaceholder': 'Kleinanzeigen URL eingeben...',
                'orders.allStatus': 'Alle Status',
                'tracking.title': 'Sendungsverfolgung',
                'tracking.addTitle': 'Sendungsnummer hinzufügen',
                'tracking.carrier': 'Versanddienst wählen',
                'tracking.number': 'Sendungsnummer',
                'statistics.title': 'Statistiken',
                'stats.total': 'Gesamt',
                'stats.transit': 'Unterwegs',
                'stats.value': 'Gesamtwert',
                'stats.newSellers': 'Neue Verkäufer',
                'status.ordered': 'Bestellt',
                'status.shipped': 'Versendet',
                'status.delivered': 'Zugestellt',
                'actions.addOrder': 'Bestellung hinzufügen',
                'actions.save': 'Speichern',
                'actions.cancel': 'Abbrechen',
                'actions.refresh': 'Aktualisieren',
                'actions.updateAll': 'Alle aktualisieren',
                'actions.edit': 'Bearbeiten',
                'actions.delete': 'Löschen',
                'actions.addTracking': 'Sendungsnr. hinzufügen',
                'actions.updateTracking': 'Aktualisieren',
                'actions.viewListing': 'Anzeige öffnen',
                'actions.viewOrder': 'Bestellung anzeigen',
                'actions.expandTracking': 'Tracking anzeigen',
                'loading.title': 'Lädt...',
                'seller.new': 'Neuer Verkäufer',
                'seller.since': 'Seit',
                'tracking.progress': 'Fortschritt',
                'tracking.history': 'Sendungsverlauf',
                'tracking.lastUpdate': 'Letztes Update',
                'order.price': 'Preis',
                'order.category': 'Kategorie',
                'order.location': 'Ort',
                'order.seller': 'Verkäufer',
                'edit.title': 'Bestellung bearbeiten'
            }
        };

        this.init();
    }

    init() {
        this.updateTranslations();
        this.updateViewIcon();
        this.loadDashboard();

        // Close mobile menu on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                this.closeMobileMenu();
            }
        });
    }

    // Mobile Menu
    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobileOverlay');

        if (this.mobileMenuOpen) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
        } else {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        }
    }

    closeMobileMenu() {
        this.mobileMenuOpen = false;
        document.getElementById('sidebar').classList.add('-translate-x-full');
        document.getElementById('mobileOverlay').classList.add('hidden');
    }

    // Language Management
    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'de' : 'en';
        localStorage.setItem('language', this.currentLang);
        document.getElementById('currentLang').textContent = this.currentLang.toUpperCase();
        this.updateTranslations();
    }

    updateTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (this.translations[this.currentLang][key]) {
                element.textContent = this.translations[this.currentLang][key];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (this.translations[this.currentLang][key]) {
                element.placeholder = this.translations[this.currentLang][key];
            }
        });
    }

    t(key) {
        return this.translations[this.currentLang][key] || key;
    }

    // View Mode Management
    toggleView() {
        this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
        localStorage.setItem('viewMode', this.viewMode);
        this.updateViewIcon();
        this.loadOrders();
    }

    updateViewIcon() {
        const icon = document.getElementById('viewToggleIcon');
        if (icon) {
            icon.className = this.viewMode === 'grid' ? 'fas fa-list' : 'fas fa-th';
        }
    }

    // Navigation
    showSection(section) {
        document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
        document.getElementById(section).classList.remove('hidden');

        document.querySelectorAll('.nav-item').forEach(n => {
            n.classList.remove('active', 'bg-blue-900/50', 'border-l-4', 'border-blue-500');
        });
        event.target.closest('.nav-item').classList.add('active', 'bg-blue-900/50', 'border-l-4', 'border-blue-500');

        this.currentSection = section;
        this.closeMobileMenu();

        // Load section data
        if (section === 'dashboard') this.loadDashboard();
        else if (section === 'orders') this.loadOrders();
        else if (section === 'tracking') this.loadTracking();
        else if (section === 'statistics') this.loadStatistics();
    }

    // Add Order Form
    showAddOrderForm() {
        document.getElementById('addOrderForm').classList.remove('hidden');
        document.getElementById('orderUrl').focus();
    }

    hideAddOrderForm() {
        document.getElementById('addOrderForm').classList.add('hidden');
        document.getElementById('orderUrl').value = '';
    }

    // UI Helpers
    showLoading(text) {
        document.getElementById('loadingText').textContent = text;
        document.getElementById('loadingOverlay').classList.remove('hidden');
        document.getElementById('loadingOverlay').classList.add('flex');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
        document.getElementById('loadingOverlay').classList.remove('flex');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const content = document.getElementById('toastContent');
        const icon = document.getElementById('toastIcon');
        const text = document.getElementById('toastText');

        text.textContent = message;

        if (type === 'success') {
            content.className = 'px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md bg-green-500 text-white';
            icon.className = 'fas fa-check-circle text-xl';
        } else if (type === 'error') {
            content.className = 'px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md bg-red-500 text-white';
            icon.className = 'fas fa-exclamation-circle text-xl';
        } else if (type === 'warning') {
            content.className = 'px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md bg-yellow-500 text-white';
            icon.className = 'fas fa-exclamation-triangle text-xl';
        }

        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 5000);
    }

    // Toggle tracking details in card
    toggleTrackingDetails(orderId) {
        const details = document.getElementById(`tracking-details-${orderId}`);
        const icon = document.getElementById(`tracking-icon-${orderId}`);

        if (details.classList.contains('hidden')) {
            details.classList.remove('hidden');
            icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        } else {
            details.classList.add('hidden');
            icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
        }
    }

    // API Calls
    async apiRequest(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.apiBase}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Dashboard with Charts
    async loadDashboard() {
        try {
            const stats = await this.apiRequest('/stats');
            document.getElementById('stat-total').textContent = stats.total;
            document.getElementById('stat-transit').textContent = stats.transit;
            document.getElementById('stat-value').textContent = `€${stats.value}`;
            document.getElementById('stat-new-sellers').textContent = stats.new_sellers;

            // Load charts
            const detailStats = await this.apiRequest('/stats/detail');
            this.renderCharts(detailStats);

            // Load recent activity
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

            // Generate mock weekly data
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
                        <div class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <i class="fas fa-box text-gray-400"></i>
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

    // Orders with working search/filter
    async loadOrders() {
        try {
            const search = document.getElementById('searchInput')?.value || '';
            const status = document.getElementById('statusFilter')?.value || '';

            let url = '/orders?';
            if (search) url += `search=${encodeURIComponent(search)}&`;
            if (status) url += `status=${encodeURIComponent(status)}&`;

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

    // Add Order
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

    // Tracking Modal
    showTrackingModal(orderId) {
        document.getElementById('tracking_order_id').value = orderId;
        document.getElementById('tracking_carrier').value = '';
        document.getElementById('tracking_number').value = '';

        document.getElementById('trackingModal').classList.remove('hidden');
        document.getElementById('trackingModal').classList.add('flex');

        // Focus on carrier select
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

            // Reload current view
            if (this.currentSection === 'dashboard') this.loadDashboard();
            else if (this.currentSection === 'orders') this.loadOrders();
            else if (this.currentSection === 'tracking') this.loadTracking();
        } catch (error) {
            this.hideLoading();
            this.showToast('Failed to add tracking', 'error');
        }
    }

    // Tracking
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

    // Statistics
    async loadStatistics() {
        try {
            const stats = await this.apiRequest('/stats/detail');
            document.getElementById('stats-content').innerHTML = this.renderStatistics(stats);
        } catch (error) {
            this.showToast('Failed to load statistics', 'error');
        }
    }

    // Go to Order from Tracking
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

    // Render Order Card with working collapsible tracking
    renderOrderCard(order) {
        const images = order.local_images ? JSON.parse(order.local_images) : [];
        const trackingData = order.tracking_details ? JSON.parse(order.tracking_details) : null;

        return `
            <div class="bg-gray-800 rounded-xl shadow-sm border border-gray-700 hover:border-gray-600 transition-all" data-order-id="${order.id}">
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
                        <span class="absolute top-2 left-2 px-2 py-1 bg-gray-900/80 rounded-lg text-xs font-medium text-white">
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

    // Render List Item
    renderOrderListItem(order) {
        const images = order.local_images ? JSON.parse(order.local_images) : [];
        const trackingData = order.tracking_details ? JSON.parse(order.tracking_details) : null;

        return `
            <div class="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-700 hover:border-gray-600 transition-all" data-order-id="${order.id}">
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

    // Tracking Card
    renderTrackingCard(order) {
        const trackingData = order.tracking_details ? JSON.parse(order.tracking_details) : null;
        if (!trackingData || trackingData.error) {
            return '';
        }

        return `
            <div class="bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-700">
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

    getStatusClass(status) {
        const classes = {
            'Ordered': 'bg-gray-700 text-gray-300',
            'Shipped': 'bg-blue-700 text-blue-200',
            'Delivered': 'bg-green-700 text-green-200'
        };
        return classes[status] || classes['Ordered'];
    }

    // Order Actions
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
}

// Initialize application
const app = new KleinManager();