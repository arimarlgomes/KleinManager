# KleinManager - Order Management System

KleinManager is a comprehensive web-based order management application designed specifically for tracking and managing Kleinanzeigen purchases. Built with FastAPI, it provides a modern, responsive interface for monitoring orders, tracking packages, watching price changes, and analyzing purchase statistics.

<img width="2540" height="1290" alt="Screenshot 2025-09-04 170731" src="https://github.com/user-attachments/assets/7dde9388-3d46-4b14-9c08-108ac20fc129" />


## 🚀 Key Features

### 📊 Dashboard & Analytics
- **Real-time Statistics**: Total orders, packages in transit, total value spent, and new seller alerts
- **Interactive Charts**: Visual representation of order status distribution and weekly activity
- **Recent Activity Feed**: Live updates on order changes, tracking updates, and system events
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 📦 Order Management
- **URL-based Order Addition**: Simply paste a Kleinanzeigen URL to automatically extract product details
- **Smart Data Extraction**: Automatically pulls title, price, images, and seller information
- **Status Tracking**: Track orders through Ordered → Shipped → Delivered lifecycle
- **Color-coded Organization**: Assign custom colors to categorize orders by priority or type
- **Advanced Search & Filtering**: Filter by status, color, price range, or search by keywords
- **Bulk Operations**: Update multiple orders simultaneously
- **Notes & Comments**: Add personal notes and comments to each order

### 👁️ Price Watcher
- **Automated Price Monitoring**: Track price changes on items you're interested in
- **Price History Charts**: Visual representation of price fluctuations over time
- **Instant Notifications**: Get alerted when prices drop below your target
- **Comparison Tools**: Compare current prices with historical data
- **Wishlist Management**: Maintain a list of items to watch without purchasing

### 🚚 Package Tracking
- **Multi-carrier Support**: Integrated tracking for DHL, Hermes, and other major carriers
- **Real-time Updates**: Automatic tracking status updates with detailed delivery information
- **Delivery Notifications**: Get notified when packages are out for delivery or delivered
- **Tracking History**: Complete timeline of package movement
- **Estimated Delivery**: Smart predictions based on carrier data and historical patterns

### 📈 Statistics & Insights
- **Spending Analytics**: Monthly, quarterly, and yearly spending breakdowns
- **Seller Analysis**: Track which sellers you buy from most frequently
- **Category Insights**: Understand your purchasing patterns by product category
- **Savings Tracking**: Monitor money saved through price watching
- **Performance Metrics**: Success rates, average delivery times, and more

### 🔔 Smart Notifications
- **Real-time Alerts**: Instant notifications for price changes, tracking updates, and deliveries
- **Customizable Sounds**: Choose from multiple notification sounds
- **Badge System**: Visual indicators for unread notifications
- **Notification History**: Keep track of all past alerts and updates
- **Smart Filtering**: Only get notified about changes that matter to you

### ⚙️ Advanced Settings
- **Auto-monitoring**: Set automatic intervals for price and tracking checks
- **Custom Colors**: Create and manage custom color schemes for order organization
- **Background Tasks**: Automated monitoring runs in the background
- **Data Export**: Export your data for backup or analysis

## 🛠️ Technical Architecture

### Backend
- **FastAPI**: Modern, high-performance web framework
- **SQLite**: Lightweight, embedded database
- **SQLAlchemy**: Powerful ORM for database operations
- **Asyncio**: Asynchronous operations for better performance
- **Background Tasks**: Automated monitoring and updates

### Frontend
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Chart.js**: Interactive charts and data visualization
- **Font Awesome**: Comprehensive icon library
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Progressive Web App**: Works offline and can be installed

### Desktop Integration
- **PyInstaller**: Single executable bundling
- **Automatic Browser Launch**: Seamless desktop experience
- **Local Database**: All data stored locally for privacy
- **No Internet Required**: Core functionality works offline

## 📦 Installation & Setup

### Requirements
- **Python 3.11+**
- **Virtual environment** (recommended)

### Quick Start
```bash
# Clone the repository
git clone https://github.com/yourusername/kleinmanager.git
cd kleinmanager

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python main.py
```

### Building Executable
```bash
# Install PyInstaller
pip install pyinstaller

# Build the executable
pyinstaller main.spec

# Copy static files (required)
cp -r static/ dist/KleinManager/static/

# Run the executable
./dist/KleinManager/KleinManager.exe
```

## 🎯 Usage Guide

### Adding Your First Order
1. Navigate to the **Orders** section
2. Click **"Add Order"**
3. Paste a Kleinanzeigen URL
4. The system automatically extracts product details
5. Assign a color and add notes if needed
6. Save the order

### Setting Up Price Watching
1. Go to **Price Watcher**
2. Click **"Add Watch"**
3. Enter the URL of the item you want to monitor
4. Set your target price (optional)
5. The system will check for price changes automatically

### Adding Package Tracking
1. Find your order in the **Orders** section
2. Click the tracking icon
3. Select the carrier (DHL, Hermes, etc.)
4. Enter the tracking number
5. The system will automatically update tracking status

### Configuring Notifications
1. Access **Settings**
2. Enable notifications and choose your preferred sound
3. Set up auto-monitoring intervals
4. Configure which events trigger notifications

## 🔧 Project Structure

```
KleinManager/
├── app/
│   ├── core/
│   │   ├── config.py              # Application configuration
│   │   ├── database.py            # Database setup and models
│   │   └── security.py            # Security utilities
│   ├── api/
│   │   ├── routes/
│   │   │   ├── orders.py          # Order management endpoints
│   │   │   ├── tracking.py        # Package tracking endpoints
│   │   │   ├── watcher.py         # Price watching endpoints
│   │   │   ├── statistics.py      # Analytics endpoints
│   │   │   └── notifications.py   # Notification endpoints
│   │   └── dependencies.py        # API dependencies
│   ├── services/
│   │   ├── kleinanzeigen.py       # Kleinanzeigen integration
│   │   ├── tracking_service.py    # Package tracking service
│   │   ├── price_monitor.py       # Price monitoring service
│   │   └── notification_service.py # Notification service
│   └── models/
│       ├── order.py               # Order data models
│       ├── tracking.py            # Tracking data models
│       └── watcher.py             # Price watcher models
├── templates/
│   └── index.html                 # Main application template
├── static/
│   ├── js/
│   │   ├── app.js                 # Main application logic
│   │   ├── dashboard.js           # Dashboard functionality
│   │   ├── orders.js              # Order management
│   │   ├── watcher.js             # Price watching
│   │   ├── tracking.js            # Package tracking
│   │   ├── statistics.js          # Analytics
│   │   ├── settings.js            # Settings management
│   │   └── notifications.js       # Notification system
│   ├── css/
│   │   └── style.css              # Custom styles
│   └── images/                    # Application assets
├── data/
│   └── kleinmanager.db            # SQLite database
├── main.py                        # Application entry point
├── main.spec                      # PyInstaller configuration
└── requirements.txt               # Python dependencies
```

## 🔒 Privacy & Security

- **Local Storage**: All data is stored locally on your machine
- **No Cloud Dependencies**: Works completely offline for core features
- **Secure Requests**: HTTPS requests to external services when needed
- **Data Encryption**: Sensitive data is encrypted in the database
- **No Tracking**: The application doesn't track or collect user data

## 🌍 Supported Platforms

- **Windows**: Full support with executable
- **macOS**: Compatible (build executable manually)
- **Linux**: Compatible (build executable manually)
- **Web Browsers**: Chrome, Firefox, Safari, Edge


## 🐛 Troubleshooting

### Common Issues

**Static files not loading after building executable:**
```bash
# Ensure static folder is copied to the executable directory
cp -r static/ dist/KleinManager/static/
```

**Database connection errors:**
- Check if the database file exists and has proper permissions
- Verify SQLite is properly bundled in the executable

**Tracking not working:**
- Verify internet connection for carrier API calls
- Check if carrier services are accessible from your network

**Price monitoring issues:**
- Ensure the URLs are valid Kleinanzeigen links
- Check if the site structure has changed

### Getting Help

- **Issues**: Report bugs on GitHub Issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI** team for the excellent web framework
- **Tailwind CSS** for the beautiful UI components
- **Chart.js** for the interactive charts
- **Kleinanzeigen** for the marketplace data
- All contributors who help improve this project

---

**Made with ❤️ for the Kleinanzeigen community**

*KleinManager is not affiliated with or endorsed by Kleinanzeigen. It's an independent tool created to help users better manage their purchases.*
