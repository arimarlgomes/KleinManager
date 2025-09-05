// Main Application Class - combines all functionality
class KleinManager extends KleinManagerCore {
    constructor() {
        super();

        // Initialize all managers as properties
        this.dashboardManager = new DashboardManager();
        this.ordersManager = new OrdersManager();
        this.watcherManager = new WatcherManager();
        this.trackingManager = new TrackingManager();
        this.listingsManager = new ListingsManager();
        this.statisticsManager = new StatisticsManager();
        this.settingsManager = new SettingsManager();
        this.notificationsManager = new NotificationsManager();

        // Copy all methods from managers to this instance
        this.copyMethodsFromManager(this.dashboardManager);
        this.copyMethodsFromManager(this.ordersManager);
        this.copyMethodsFromManager(this.watcherManager);
        this.copyMethodsFromManager(this.trackingManager);
        this.copyMethodsFromManager(this.listingsManager);
        this.copyMethodsFromManager(this.statisticsManager);
        this.copyMethodsFromManager(this.settingsManager);
        this.copyMethodsFromManager(this.notificationsManager);

        this.init();
    }

    copyMethodsFromManager(manager) {
        // Get all method names from the manager's prototype
        const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(manager))
            .filter(name => name !== 'constructor' && typeof manager[name] === 'function');

        // Copy each method to this instance
        methodNames.forEach(methodName => {
            if (!this[methodName]) { // Don't override existing methods
                this[methodName] = manager[methodName].bind(this);
            }
        });

        // Also copy properties
        Object.keys(manager).forEach(key => {
            if (!this.hasOwnProperty(key)) {
                this[key] = manager[key];
            }
        });
    }

    async init() {
        this.updateTranslations();
        this.updateViewIcon();
        await this.loadSettings();
        this.initNotificationSound();
        this.loadDashboard();
        this.startNotificationPolling();

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                this.closeMobileMenu();
            }
        });
    }

    // Override showSection to handle mixed functionality
    showSection(section) {
        document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
        document.getElementById(section).classList.remove('hidden');

        document.querySelectorAll('.nav-item').forEach(n => {
            n.classList.remove('active', 'bg-blue-900/50', 'border-l-4', 'border-blue-500');
        });

        // Find the clicked nav item
        const clickedItem = event?.target?.closest?.('.nav-item') ||
                           document.querySelector(`.nav-item[onclick*="${section}"]`);
        if (clickedItem) {
            clickedItem.classList.add('active', 'bg-blue-900/50', 'border-l-4', 'border-blue-500');
        }

        this.currentSection = section;
        this.closeMobileMenu();

        // Load section data
        if (section === 'dashboard') this.loadDashboard();
        else if (section === 'orders') this.loadOrders();
        else if (section === 'watcher') this.loadWatchedItems();
        else if (section === 'tracking') this.loadTracking();
        else if (section === 'listings') this.loadMyListings();
        else if (section === 'statistics') this.loadStatistics();
        else if (section === 'settings') this.loadSettings();
    }
}

// Initialize application
const app = new KleinManager();