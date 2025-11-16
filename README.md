# Conneverse - Parts Finder & Lead Manager

AI-powered tool for auto repair shops to manage customer leads and find parts automatically.

## Features

### Landing Page
- Professional hero section with compelling tagline
- Three key benefit cards highlighting core value propositions
- Call-to-action button leading to demo dashboard
- Automotive-themed design (blue/orange color scheme)

### Lead Capture System
- Customer inquiry form simulating phone calls or web submissions
- Captures customer details, vehicle information, and service needs
- Automatic lead creation with timestamp and status tracking

### Dashboard
Complete management interface with three main tabs:

#### Leads Tab
- Visual lead cards with full customer and vehicle details
- Status badges (New, Contacted, Quote Sent, Closed, Lost)
- Filter by status
- Search by customer name
- Quick action buttons for each lead
- Real-time lead counter

#### AI Parts Finder
- Simulated AI search across multiple suppliers
- Displays 4-5 realistic part options with:
  - Part name, brand, and supplier
  - Pricing and delivery estimates
  - Quality ratings and stock status
  - "Best Value" recommendations
- Labor cost estimation
- One-click part selection

#### Quote Generation
- Professional quote documents with:
  - Shop branding section
  - Customer and vehicle details
  - Itemized parts and labor costs
  - Validity period (7 days)
- Send quote functionality (simulated)
- Printable PDF view
- Automatic status updates

#### Analytics Dashboard
- Key metrics overview:
  - Total leads this month
  - Quotes sent
  - Conversion rate
  - Total revenue
- Visual bar chart showing leads per week
- Recent parts search history

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS (via CDN)
- **Data Storage**: localStorage (simulating backend database)
- **Architecture**: Single-Page Application (SPA)

## File Structure

```
repair-shop-ai-mvp/
├── index.html          # Landing page
├── dashboard.html      # Main application interface
├── app.js             # Core JavaScript functionality
├── styles.css         # Custom CSS styles
└── README.md          # Project documentation
```

## Installation & Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd repair-shop-ai-mvp
```

2. Open in browser:
Simply open `index.html` in your web browser. No build process or server required!

Alternatively, use a local server:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server
```

Then navigate to `http://localhost:8000`

## Usage

### Getting Started
1. Open `index.html` to see the landing page
2. Click "Try Demo" to access the dashboard
3. Explore pre-loaded sample leads

### Managing Leads
1. View all leads in the Leads tab
2. Use filters to sort by status
3. Search for specific customers
4. Click action buttons to interact with leads

### Finding Parts
1. Click "Find Parts" on any lead
2. Wait for AI search results (simulated)
3. Review options and select best part
4. Generate quote automatically

### Generating Quotes
1. After selecting a part, review the quote
2. Use "Send Quote" to mark as sent (simulated)
3. Use "Download PDF" for printable version
4. Lead status updates automatically

### Viewing Analytics
1. Switch to Analytics tab
2. View key performance metrics
3. Check weekly lead trends
4. Review recent parts searches

## Sample Data

The application comes pre-loaded with:
- 3 sample leads with realistic customer data
- Multiple part suppliers (AutoZone, O'Reilly, NAPA, RockAuto)
- Realistic pricing and delivery information

## Features in Detail

### Lead Status Workflow
- **New**: Just submitted, needs attention
- **Contacted**: Customer has been reached
- **Quote Sent**: Formal quote provided
- **Closed**: Deal completed successfully
- **Lost**: Opportunity lost

### Parts Search Logic
The AI Parts Finder simulates searching across multiple suppliers and provides:
- Competitive pricing comparison
- Delivery time estimates
- Quality ratings
- Stock availability
- Best value recommendations

### Data Persistence
All data is stored in localStorage, persisting across sessions:
- Customer leads
- Quote history
- Analytics data
- Parts search history

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Future Enhancements

- Real backend API integration
- Actual SMS/Email notifications
- Real parts API integration (AutoZone, RockAuto APIs)
- User authentication
- Multi-shop support
- Advanced analytics and reporting
- CRM integrations

## Development

This is an MVP (Minimum Viable Product) demonstrating core functionality. All AI features are currently simulated with realistic dummy data.

### Key Functions
- `initializeApp()`: Loads sample data on first run
- `renderLeads()`: Displays lead cards
- `searchParts()`: Simulates AI parts search
- `generateQuote()`: Creates professional quotes
- `updateAnalytics()`: Calculates and displays metrics

## License

MIT License - feel free to use for your projects!

## Support

For issues or feature requests, please open an issue in the repository.

---

Built with ❤️ for auto repair shops everywhere
