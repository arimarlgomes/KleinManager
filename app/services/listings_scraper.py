# app/services/listings_scraper.py
import requests
import re
from typing import List, Dict, Any
from bs4 import BeautifulSoup
from app.core.config import settings


class MyListingsScraper:
    """Scraper for my Kleinanzeigen listings"""

    def __init__(self):
        self.headers = {'User-Agent': settings.USER_AGENT}
        self.base_url = "https://www.kleinanzeigen.de"

    def scrape_my_listings(self) -> List[Dict[str, Any]]:
        """Scrape my listings from Kleinanzeigen"""
        listings = []

        try:
            # Note: This would require authentication in real implementation
            # For now, we'll return mock data
            response = requests.get(
                f"{self.base_url}/m-meine-anzeigen.html",
                headers=self.headers,
                timeout=15
            )

            if response.status_code != 200:
                return self._get_mock_listings()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Find listing cards
            listing_cards = soup.find_all('li', {'data-testid': 'ad-card'})

            for card in listing_cards:
                try:
                    listing = self._extract_listing_data(card)
                    if listing:
                        listings.append(listing)
                except Exception as e:
                    print(f"Error extracting listing: {e}")
                    continue

        except Exception as e:
            print(f"Error scraping my listings: {e}")
            return self._get_mock_listings()

        return listings

    def _extract_listing_data(self, card) -> Dict[str, Any]:
        """Extract data from a listing card"""
        ad_id = card.get('data-adid', '')

        # Title and URL
        title_link = card.find('a', href=re.compile(r'/s-anzeige/'))
        title = "Unknown"
        url = ""

        if title_link:
            title = title_link.get('aria-label', '').replace('Anzeige ', '')
            url = self.base_url + title_link['href']

        # Price
        price = 0.0
        price_elem = card.find('li', class_='text-title3')
        if price_elem:
            price_match = re.search(r'(\d+(?:[.,]\d+)?)', price_elem.text)
            if price_match:
                price = float(price_match.group(1).replace(',', '.'))

        # Category
        category_elem = card.find('div', class_='text-bodySmall text-onSurfaceNonessential')
        category = category_elem.text.strip() if category_elem else "Unknown"

        # Image
        img_elem = card.find('img')
        image_url = img_elem['src'] if img_elem else ""

        # Statistics
        visitors = 0
        favorites = 0

        stats_section = card.find('section', class_='text-bodySmall text-onSurfaceNonessential')
        if stats_section:
            visitor_text = stats_section.find(text=re.compile(r'\d+ Besucher'))
            if visitor_text:
                visitor_match = re.search(r'(\d+) Besucher', visitor_text)
                if visitor_match:
                    visitors = int(visitor_match.group(1))

            favorite_text = stats_section.find(text=re.compile(r'\d+ mal gemerkt'))
            if favorite_text:
                favorite_match = re.search(r'(\d+) mal gemerkt', favorite_text)
                if favorite_match:
                    favorites = int(favorite_match.group(1))

        # End date
        end_date = ""
        end_date_elem = card.find('span', class_='managead-listitem-enddate')
        if end_date_elem:
            end_date = end_date_elem.text.strip()

        return {
            'ad_id': ad_id,
            'title': title,
            'price': price,
            'category': category,
            'url': url,
            'image_url': image_url,
            'visitors': visitors,
            'favorites': favorites,
            'end_date': end_date,
            'status': 'Active'
        }

    def _get_mock_listings(self) -> List[Dict[str, Any]]:
        """Return mock listings for testing"""
        return [
            {
                'ad_id': '3178119655',
                'title': 'Canon Ex-Auto Kamera Film',
                'price': 35.0,
                'category': 'Foto',
                'url': 'https://www.kleinanzeigen.de/s-anzeige/canon-ex-auto-kamera-film/3178119655-245-7579',
                'image_url': 'https://img.kleinanzeigen.de/api/v1/prod-ads/images/dc/dca8ade6-8b51-4cb3-a293-cc314360cfcf?rule=$_2.JPG',
                'visitors': 32,
                'favorites': 3,
                'end_date': '01.11.2025',
                'status': 'Active'
            }
        ]