// Core functionality and utilities
class KleinManagerCore {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.currentSection = 'dashboard';
        this.viewMode = localStorage.getItem('viewMode') || 'grid';
        this.apiBase = '/api/v1';
        this.mobileMenuOpen = false;
        this.settings = {};
        this.notifications = [];
        this.notificationsOpen = false;
        this.selectedOrderForColor = null;
        this.selectedColor = undefined;
        this.notificationSound = null;
        this.charts = {};

        this.translations = {
            en: {
                'nav.dashboard': 'Dashboard',
                'nav.orders': 'Orders',
                'nav.watcher': 'Price Watcher',
                'nav.tracking': 'Package Tracking',
                'nav.listings': 'My Listings',
                'nav.statistics': 'Statistics',
                'nav.settings': 'Settings',
                'dashboard.title': 'Dashboard',
                'orders.title': 'Orders',
                'watcher.title': 'Price Watcher',
                'tracking.title': 'Package Tracking',
                'listings.title': 'My Listings',
                'statistics.title': 'Statistics',
                'settings.title': 'Settings',
                'orders.addNew': 'Add New Order',
                'orders.searchPlaceholder': 'Search...',
                'orders.urlPlaceholder': 'Enter Kleinanzeigen URL...',
                'orders.allStatus': 'All Status',
                'actions.checkPrices': 'Check Prices',
                'actions.addWatch': 'Add Watch',
                'actions.sync': 'Sync Listings',
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
                'loading.title': 'Loading...',
                'seller.new': 'New Seller',
                'seller.since': 'Since',
                'tracking.progress': 'Progress',
                'tracking.history': 'Tracking History',
                'tracking.lastUpdate': 'Last Update',
                'tracking.addTitle': 'Add Tracking Number',
                'tracking.carrier': 'Carrier',
                'tracking.number': 'Tracking Number',
                'order.price': 'Price',
                'order.category': 'Category',
                'order.location': 'Location',
                'order.seller': 'Seller',
                'edit.title': 'Edit Order',
                'stats.total': 'Total Orders',
                'stats.transit': 'In Transit',
                'stats.value': 'Total Value',
                'stats.newSellers': 'New Sellers',
                'status.ordered': 'Ordered',
                'status.shipped': 'Shipped',
                'status.delivered': 'Delivered'
            },
            de: {
                'nav.dashboard': 'Übersicht',
                'nav.orders': 'Bestellungen',
                'nav.watcher': 'Preis-Watcher',
                'nav.tracking': 'Sendungsverfolgung',
                'nav.listings': 'Meine Anzeigen',
                'nav.statistics': 'Statistiken',
                'nav.settings': 'Einstellungen',
                'dashboard.title': 'Übersicht',
                'orders.title': 'Bestellungen',
                'watcher.title': 'Preis-Watcher',
                'tracking.title': 'Sendungsverfolgung',
                'listings.title': 'Meine Anzeigen',
                'statistics.title': 'Statistiken',
                'settings.title': 'Einstellungen',
                'orders.addNew': 'Neue Bestellung hinzufügen',
                'orders.searchPlaceholder': 'Suchen...',
                'orders.urlPlaceholder': 'Kleinanzeigen URL eingeben...',
                'orders.allStatus': 'Alle Status',
                'actions.checkPrices': 'Preise prüfen',
                'actions.addWatch': 'Überwachung hinzufügen',
                'actions.sync': 'Synchronisieren',
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
                'loading.title': 'Lädt...',
                'seller.new': 'Neuer Verkäufer',
                'seller.since': 'Seit',
                'tracking.progress': 'Fortschritt',
                'tracking.history': 'Sendungsverlauf',
                'tracking.lastUpdate': 'Letztes Update',
                'tracking.addTitle': 'Sendungsnummer hinzufügen',
                'tracking.carrier': 'Versanddienst',
                'tracking.number': 'Sendungsnummer',
                'order.price': 'Preis',
                'order.category': 'Kategorie',
                'order.location': 'Ort',
                'order.seller': 'Verkäufer',
                'edit.title': 'Bestellung bearbeiten',
                'stats.total': 'Gesamt',
                'stats.transit': 'Unterwegs',
                'stats.value': 'Gesamtwert',
                'stats.newSellers': 'Neue Verkäufer',
                'status.ordered': 'Bestellt',
                'status.shipped': 'Versendet',
                'status.delivered': 'Zugestellt'
            }
        };
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

    // Settings Management
    async loadSettings() {
        try {
            this.settings = await this.apiRequest('/settings');
            this.updateColorFilters();
            this.updateEditColorOptions();
            if (this.updateSettingsUI) {
                this.updateSettingsUI();
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.settings = {
                colors: [
                    {'name': 'Red', 'value': '#ef4444'},
                    {'name': 'Blue', 'value': '#3b82f6'},
                    {'name': 'Green', 'value': '#10b981'},
                    {'name': 'Yellow', 'value': '#f59e0b'},
                    {'name': 'Purple', 'value': '#8b5cf6'},
                    {'name': 'Pink', 'value': '#ec4899'}
                ],
                notifications_enabled: true,
                notification_sound: 'default'
            };
            this.updateColorFilters();
            this.updateEditColorOptions();
        }
    }

    updateColorFilters() {
        const colorFilter = document.getElementById('colorFilter');
        const editColor = document.getElementById('edit_color');

        if (!this.settings.colors) return;

        if (colorFilter) {
            colorFilter.innerHTML = '<option value="">All Colors</option>';
            this.settings.colors.forEach(color => {
                colorFilter.innerHTML += `<option value="${color.value}">${color.name}</option>`;
            });
        }

        if (editColor) {
            const currentValue = editColor.value;
            editColor.innerHTML = '<option value="">No Color</option>';
            this.settings.colors.forEach(color => {
                editColor.innerHTML += `<option value="${color.value}">${color.name}</option>`;
            });
            editColor.value = currentValue;
        }
    }

    updateEditColorOptions() {
        const editColor = document.getElementById('edit_color');
        if (!editColor || !this.settings.colors) return;

        const currentValue = editColor.value;
        editColor.innerHTML = '<option value="">No Color</option>';
        this.settings.colors.forEach(color => {
            editColor.innerHTML += `<option value="${color.value}">${color.name}</option>`;
        });
        editColor.value = currentValue;
    }

    // Utility functions
    getStatusClass(status) {
        const classes = {
            'Ordered': 'bg-gray-700 text-gray-300',
            'Shipped': 'bg-blue-700 text-blue-200',
            'Delivered': 'bg-green-700 text-green-200'
        };
        return classes[status] || classes['Ordered'];
    }

    toggleTrackingDetails(orderId) {
        const details = document.getElementById(`tracking-details-${orderId}`);
        const icon = document.getElementById(`tracking-icon-${orderId}`);

        if (details && icon) {
            if (details.classList.contains('hidden')) {
                details.classList.remove('hidden');
                icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            } else {
                details.classList.add('hidden');
                icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            }
        }
    }
}