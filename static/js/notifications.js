// Notifications functionality
class NotificationsManager extends KleinManagerCore {
    constructor() {
        super();
        this.notifications = [];
        this.notificationsOpen = false;
        this.notificationSound = null;
    }

    initNotificationSound() {
        if (this.settings.notification_sound && this.settings.notification_sound !== 'default') {
            this.notificationSound = new Audio(`/static/sounds/${this.settings.notification_sound}.mp3`);
        }
    }

    startNotificationPolling() {
        this.checkNotifications();
        setInterval(() => {
            this.checkNotifications();
        }, 30000); // Check every 30 seconds
    }

    async checkNotifications() {
        try {
            const notifications = await this.apiRequest('/notifications');
            if (notifications.length > this.notifications.length) {
                // New notification
                if (this.settings.notifications_enabled && this.notificationSound) {
                    this.notificationSound.play().catch(() => {});
                }
            }
            this.notifications = notifications;
            this.updateNotificationBadge();
        } catch (error) {
            console.error('Failed to check notifications:', error);
        }
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        if (this.notifications.length > 0) {
            badge.textContent = this.notifications.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    toggleNotifications() {
        this.notificationsOpen = !this.notificationsOpen;
        const panel = document.getElementById('notificationsPanel');

        if (this.notificationsOpen) {
            panel.classList.remove('hidden');
            this.renderNotifications();
            // Position the panel relative to the sidebar notification button
            const rect = document.getElementById('sidebar').getBoundingClientRect();
            panel.style.left = `${rect.right + 10}px`;
            panel.style.top = '50%';
            panel.style.transform = 'translateY(-50%)';
            panel.style.right = 'auto';
        } else {
            panel.classList.add('hidden');
        }
    }

    renderNotifications() {
        const container = document.getElementById('notificationsList');

        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="p-4 text-center text-gray-400">
                    <i class="fas fa-bell-slash text-2xl mb-2"></i>
                    <p>No new notifications</p>
                </div>
            `;
        } else {
            container.innerHTML = this.notifications.map(notification => `
                <div class="p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
                     onclick="app.markNotificationRead(${notification.id})">
                    <div class="flex items-start gap-3">
                        <i class="fas ${this.getNotificationIcon(notification.type)} text-blue-400 mt-1"></i>
                        <div class="flex-1">
                            <p class="text-white font-medium text-sm">${notification.title}</p>
                            <p class="text-gray-400 text-xs">${notification.message}</p>
                            <p class="text-gray-500 text-xs mt-1">${new Date(notification.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    getNotificationIcon(type) {
        const icons = {
            'price_change': 'fa-chart-line',
            'tracking_update': 'fa-truck',
            'system': 'fa-info-circle'
        };
        return icons[type] || 'fa-bell';
    }

    async markNotificationRead(notificationId) {
        try {
            await this.apiRequest(`/notifications/${notificationId}/read`, { method: 'POST' });
            this.checkNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }

    async clearAllNotifications() {
        try {
            await this.apiRequest('/notifications', { method: 'DELETE' });
            this.notifications = [];
            this.updateNotificationBadge();
            this.renderNotifications();
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    }
}