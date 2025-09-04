# Web scraper for Kleinanzeigen.de
import re
import json
import requests
import os
from typing import Dict, Any, Optional
from datetime import datetime
from bs4 import BeautifulSoup
from app.core.config import settings

class KleinanzeigenScraper:
    """Scraper for extracting data from Kleinanzeigen listings"""
    
    def __init__(self):
        self.headers = {'User-Agent': settings.USER_AGENT}
    
    def download_image(self, url: str, ad_id: str, index: int) -> Optional[str]:
        """Download and save an image locally"""
        try:
            response = requests.get(url, timeout=10, headers=self.headers)
            if response.status_code == 200:
                filename = f"{ad_id}_{index}.jpg"
                filepath = os.path.join(settings.IMAGE_STORAGE_PATH, filename)
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                return filename
        except Exception as e:
            print(f"Error downloading image: {e}")
        return None
    
    def scrape_listing(self, url: str) -> Dict[str, Any]:
        """Scrape a Kleinanzeigen listing and return structured data"""
        response = requests.get(url, headers=self.headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title
        title_elem = soup.find('h1', {'id': 'viewad-title'})
        title = title_elem.text.strip() if title_elem else "Unknown"
        title = re.sub(r'(Reserviert|Gelöscht)\s*•\s*', '', title)
        
        # Extract price
        price_elem = soup.find('h2', {'id': 'viewad-price'})
        price = 0.0
        if price_elem:
            price_match = re.search(r'(\d+(?:[.,]\d+)?)', price_elem.text)
            if price_match:
                price = float(price_match.group(1).replace(',', '.'))
        
        # Extract description
        desc_elem = soup.find('p', {'id': 'viewad-description-text'})
        description = desc_elem.text.strip() if desc_elem else ""
        
        # Extract ad ID
        ad_id = None
        id_section = soup.find('div', {'id': 'viewad-ad-id-box'})
        if id_section:
            id_match = re.search(r'(\d{10})', id_section.text)
            if id_match:
                ad_id = id_match.group(1)
        if not ad_id:
            id_match = re.search(r'/(\d{10})-', url)
            if id_match:
                ad_id = id_match.group(1)
        
        # Extract location
        location_elem = soup.find('span', {'id': 'viewad-locality'})
        location = location_elem.text.strip() if location_elem else "Unknown"
        
        # Extract category
        category = "Unknown"
        breadcrumb = soup.find('div', {'id': 'vap-brdcrmb'})
        if breadcrumb:
            links = breadcrumb.find_all('a', class_='breadcrump-link')
            if links and len(links) > 1:
                category = links[-1].text.strip()
        
        # Extract seller information
        seller_data = self._extract_seller_info(soup, url)
        
        # Extract and download images
        images = []
        local_images = []
        gallery = soup.find('div', class_='vip-image-gallery')
        if gallery:
            img_elements = gallery.find_all('img')
            for idx, img in enumerate(img_elements[:8]):  # Max 8 images
                img_url = None
                if 'data-imgsrc' in img.attrs:
                    img_url = img['data-imgsrc']
                elif 'src' in img.attrs and 'kleinanzeigen.de' in img['src']:
                    img_url = img['src']
                
                if img_url:
                    img_url = re.sub(r'\$_\d+\.', '$_59.', img_url)
                    images.append(img_url)
                    
                    # Download image
                    local_filename = self.download_image(img_url, ad_id, idx)
                    if local_filename:
                        local_images.append(local_filename)
        
        return {
            'ad_id': ad_id,
            'title': title,
            'price': price,
            'description': description,
            'category': category,
            'location': location,
            'seller_name': seller_data['name'],
            'seller_profile_url': seller_data['profile_url'],
            'seller_since': seller_data['since'],
            'seller_is_new': seller_data['is_new'],
            'article_url': url,
            'image_urls': json.dumps(images),
            'local_images': json.dumps(local_images)
        }
    
    def _extract_seller_info(self, soup: BeautifulSoup, listing_url: str) -> Dict[str, Any]:
        """Extract seller information from the listing page"""
        seller_data = {
            'name': 'Unknown',
            'profile_url': '',
            'since': '',
            'is_new': False
        }
        
        seller_section = soup.find('div', {'id': 'viewad-contact'})
        if seller_section:
            name_elem = seller_section.find('a', href=re.compile(r'/s-bestandsliste'))
            if name_elem:
                seller_data['name'] = name_elem.text.strip()
                seller_data['profile_url'] = f"https://www.kleinanzeigen.de{name_elem['href']}"
                
                # Check seller registration date
                try:
                    profile_response = requests.get(
                        seller_data['profile_url'], 
                        headers=self.headers, 
                        timeout=10
                    )
                    profile_soup = BeautifulSoup(profile_response.content, 'html.parser')
                    
                    details = profile_soup.find_all('div', class_='userprofile-details')
                    for detail in details:
                        text = detail.get_text(strip=True)
                        if 'Aktiv seit' in text:
                            date_match = re.search(r'(\d+\.\d+\.\d+)', text)
                            if date_match:
                                seller_data['since'] = date_match.group(1)
                                try:
                                    reg_date = datetime.strptime(date_match.group(1), '%d.%m.%Y')
                                    days_old = (datetime.now() - reg_date).days
                                    if days_old < 60:
                                        seller_data['is_new'] = True
                                except:
                                    pass
                except:
                    pass
        
        return seller_data
