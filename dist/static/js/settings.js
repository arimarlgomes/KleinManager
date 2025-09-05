// Settings functionality with auto-monitoring controls
class SettingsManager extends KleinManagerCore {
    updateSettingsUI() {
        const notificationsEnabled = document.getElementById('notifications-enabled');
        const notificationSound = document.getElementById('notification-sound');
        const autoCheckEnabled = document.getElementById('auto-check-enabled');
        const autoCheckInterval = document.getElementById('auto-check-interval');
        const autoTrackingEnabled = document.getElementById('auto-tracking-enabled');
        const autoTrackingInterval = document.getElementById('auto-tracking-interval');

        if (notificationsEnabled) {
            notificationsEnabled.checked = this.settings.notifications_enabled;
        }

        if (notificationSound) {
            notificationSound.value = this.settings.notification_sound || 'default';
        }

        if (autoCheckEnabled) {
            autoCheckEnabled.checked = this.settings.auto_check_enabled !== false;
        }

        if (autoCheckInterval) {
            autoCheckInterval.value = this.settings.auto_check_interval || 60;
        }

        if (autoTrackingEnabled) {
            autoTrackingEnabled.checked = this.settings.auto_tracking_enabled !== false;
        }

        if (autoTrackingInterval) {
            autoTrackingInterval.value = this.settings.auto_tracking_interval || 30;
        }

        this.renderColorSettings();
        this.updateBackgroundTaskStatus();
    }

    async updateBackgroundTaskStatus() {
        try {
            const status = await this.apiRequest('/background-tasks/status');

            const priceStatus = document.getElementById('price-monitoring-status');
            const trackingStatus = document.getElementById('tracking-monitoring-status');
            const lastPriceCheck = document.getElementById('last-price-check');
            const lastTrackingCheck = document.getElementById('last-tracking-check');

            if (priceStatus) {
                priceStatus.textContent = status.price_monitoring_active ? '✅ Active' : '❌ Inactive';
                priceStatus.className = status.price_monitoring_active ? 'text-green-400' : 'text-red-400';
            }

            if (trackingStatus) {
                trackingStatus.textContent = status.tracking_monitoring_active ? '✅ Active' : '❌ Inactive';
                trackingStatus.className = status.tracking_monitoring_active ? 'text-green-400' : 'text-red-400';
            }

            if (lastPriceCheck) {
                lastPriceCheck.textContent = status.last_price_check ?
                    new Date(status.last_price_check).toLocaleString() : 'Never';
            }

            if (lastTrackingCheck) {
                lastTrackingCheck.textContent = status.last_tracking_check ?
                    new Date(status.last_tracking_check).toLocaleString() : 'Never';
            }

        } catch (error) {
            console.error('Failed to update background task status:', error);
        }
    }

    renderColorSettings() {
        const container = document.getElementById('color-settings');
        if (!container || !this.settings.colors) return;

        container.innerHTML = this.settings.colors.map((color, index) => `
            <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div class="flex items-center gap-3">
                    <div class="w-6 h-6 rounded-full border border-gray-500" style="background-color: ${color.value}"></div>
                    <input type="text" value="${color.name}"
                           onchange="app.updateColorName(${index}, event.target.value)"
                           class="bg-transparent text-white border-none focus:outline-none">
                </div>
                <button onclick="app.removeColor(${index})"
                        class="text-red-400 hover:text-red-300">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    updateColorName(index, name) {
        if (this.settings.colors && this.settings.colors[index]) {
            this.settings.colors[index].name = name;
        }
    }

    removeColor(index) {
        if (this.settings.colors) {
            this.settings.colors.splice(index, 1);
            this.renderColorSettings();
        }
    }

    addNewColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        if (!this.settings.colors) {
            this.settings.colors = [];
        }

        this.settings.colors.push({
            name: `Color ${this.settings.colors.length + 1}`,
            value: randomColor
        });

        this.renderColorSettings();
    }

    async saveSettings() {
        const notificationsEnabled = document.getElementById('notifications-enabled')?.checked || false;
        const notificationSound = document.getElementById('notification-sound')?.value || 'default';
        const autoCheckEnabled = document.getElementById('auto-check-enabled')?.checked || false;
        const autoCheckInterval = parseInt(document.getElementById('auto-check-interval')?.value) || 60;
        const autoTrackingEnabled = document.getElementById('auto-tracking-enabled')?.checked || false;
        const autoTrackingInterval = parseInt(document.getElementById('auto-tracking-interval')?.value) || 30;

        const settingsData = {
            colors: this.settings.colors || [],
            notifications_enabled: notificationsEnabled,
            notification_sound: notificationSound,
            auto_check_enabled: autoCheckEnabled,
            auto_check_interval: autoCheckInterval,
            auto_tracking_enabled: autoTrackingEnabled,
            auto_tracking_interval: autoTrackingInterval
        };

        this.showLoading('Saving settings and restarting background tasks...');

        try {
            await this.apiRequest('/settings', {
                method: 'PUT',
                body: JSON.stringify(settingsData)
            });

            this.settings = { ...this.settings, ...settingsData };
            this.updateColorFilters();
            this.updateEditColorOptions();
            this.initNotificationSound();

            this.hideLoading();
            this.showToast('Settings saved successfully', 'success');

            // Wait a bit then update status
            setTimeout(() => {
                this.updateBackgroundTaskStatus();
            }, 2000);

        } catch (error) {
            this.hideLoading();
            this.showToast('Failed to save settings', 'error');
        }
    }

    async startBackgroundTasks() {
        this.showLoading('Starting background monitoring...');
        try {
            await this.apiRequest('/background-tasks/start', { method: 'POST' });
            this.hideLoading();
            this.showToast('Background monitoring started', 'success');
            this.updateBackgroundTaskStatus();
        } catch (error) {
            this.hideLoading();
            this.showToast('Failed to start background monitoring', 'error');
        }
    }

    async stopBackgroundTasks() {
        this.showLoading('Stopping background monitoring...');
        try {
            await this.apiRequest('/background-tasks/stop', { method: 'POST' });
            this.hideLoading();
            this.showToast('Background monitoring stopped', 'success');
            this.updateBackgroundTaskStatus();
        } catch (error) {
            this.hideLoading();
            this.showToast('Failed to stop background monitoring', 'error');
        }
    }
}