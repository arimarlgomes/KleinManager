// My Listings functionality
class ListingsManager extends KleinManagerCore {
    async loadMyListings() {
        try {
            const listings = await this.apiRequest('/my-listings');
            const container = document.getElementById('my-listings-list');

            if (listings.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-list-alt text-gray-600 text-4xl mb-4"></i>
                        <p class="text-gray-400">No listings found</p>
                        <button onclick="app.syncMyListings()" class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-sync mr-2"></i>Sync Listings
                        </button>
                    </div>
                `;
            } else {
                container.innerHTML = listings.map(listing => this.renderMyListing(listing)).join('');
            }
        } catch (error) {
            this.showToast('Failed to load my listings', 'error');
        }
    }

    renderMyListing(listing) {
        return `
            <div class="bg-gray-800 rounded-xl shadow-sm border border-gray-700 hover:border-gray-600 transition-all overflow-hidden">
                <div class="relative">
                    ${listing.image_url
                        ? `<img src="${listing.image_url}" class="w-full h-48 object-cover">`
                        : `<div class="w-full h-48 bg-gray-700 flex items-center justify-center">
                             <i class="fas fa-image text-gray-500 text-3xl"></i>
                           </div>`
                    }
                    <span class="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white rounded-lg text-xs font-medium">
                        ${listing.status}
                    </span>
                </div>

                <div class="p-4">
                    <h3 class="text-lg font-semibold text-white mb-2 line-clamp-2">${listing.title}</h3>
                    <p class="text-2xl font-bold text-green-400 mb-3">€${listing.price.toFixed(2)}</p>

                    <div class="space-y-1 text-sm text-gray-400 mb-3">
                        <div class="flex items-center">
                            <i class="fas fa-tag mr-2 w-4"></i>
                            <span class="truncate">${listing.category || 'N/A'}</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-calendar mr-2 w-4"></i>
                            <span class="truncate">Ends: ${listing.end_date || 'N/A'}</span>
                        </div>
                    </div>

                    <div class="flex justify-between items-center text-xs text-gray-400 mb-3">
                        <span><i class="fas fa-eye mr-1"></i>${listing.visitors} visitors</span>
                        <span><i class="fas fa-heart mr-1"></i>${listing.favorites} favorites</span>
                    </div>

                    <div class="flex gap-2">
                        ${listing.url ? `
                            <a href="${listing.url}" target="_blank"
                               class="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs text-center transition-colors">
                                <i class="fas fa-external-link-alt mr-1"></i>View
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    async syncMyListings() {
        this.showLoading('Syncing listings from Kleinanzeigen...');

        try {
            const result = await this.apiRequest('/my-listings/sync', { method: 'POST' });
            this.hideLoading();
            this.showToast(`Synced ${result.synced} listings`, 'success');
            this.loadMyListings();
        } catch (error) {
            this.hideLoading();
            this.showToast('Failed to sync listings', 'error');
        }
    }
}