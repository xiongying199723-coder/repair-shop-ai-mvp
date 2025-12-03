// Conneverse - Main Application JavaScript

// Global Variables
let currentLead = null;
let currentPart = null;
let allLeads = [];
let allMissedCalls = [];
let partsSearchHistory = [];
let quoteEditMode = false;
let currentQuoteData = {
    partPrice: 0,
    laborCost: 0,
    taxRate: 0.08,
    discount: 0
};

// ============================================
// MARKET PRICE COMPARISON DATA & FUNCTIONS
// ============================================

// Market data for common services
const marketPriceData = {
    'brake pad': { low: 220, high: 315, avg: 285 },
    'brake pads': { low: 220, high: 315, avg: 285 },
    'oil change': { low: 45, high: 75, avg: 58 },
    'tire rotation': { low: 35, high: 60, avg: 45 },
    'battery': { low: 125, high: 200, avg: 165 },
    'alternator': { low: 350, high: 650, avg: 485 },
    'starter': { low: 280, high: 520, avg: 395 },
    'air filter': { low: 25, high: 55, avg: 38 },
    'cabin filter': { low: 30, high: 65, avg: 45 },
    'spark plug': { low: 80, high: 180, avg: 125 },
    'spark plugs': { low: 80, high: 180, avg: 125 },
    'diagnostic': { low: 80, high: 150, avg: 110 },
    'diagnostics': { low: 80, high: 150, avg: 110 },
    'engine': { low: 80, high: 150, avg: 110 },
    'transmission': { low: 150, high: 350, avg: 235 },
    'coolant': { low: 75, high: 135, avg: 98 },
    'radiator': { low: 320, high: 580, avg: 445 },
    'water pump': { low: 280, high: 485, avg: 375 },
    'timing belt': { low: 420, high: 780, avg: 595 },
    'serpentine belt': { low: 95, high: 185, avg: 135 },
    'muffler': { low: 180, high: 350, avg: 255 },
    'exhaust': { low: 250, high: 520, avg: 375 }
};

// Calculate market price comparison
function calculateMarketPrice(quotedPrice, serviceDescription = '') {
    // Try to find matching service in market data
    let marketData = null;

    if (serviceDescription) {
        const lowerDesc = serviceDescription.toLowerCase();
        for (const [key, data] of Object.entries(marketPriceData)) {
            if (lowerDesc.includes(key)) {
                marketData = data;
                break;
            }
        }
    }

    // If no match found, calculate based on quoted price with variation
    if (!marketData) {
        const marketAvg = quotedPrice * 1.09; // 9% higher than quoted price
        marketData = {
            low: Math.round(marketAvg * 0.82),
            high: Math.round(marketAvg * 1.17),
            avg: Math.round(marketAvg)
        };
    }

    const difference = ((quotedPrice - marketData.avg) / marketData.avg) * 100;

    return {
        yourPrice: quotedPrice,
        marketAverage: marketData.avg,
        marketLow: marketData.low,
        marketHigh: marketData.high,
        percentDifference: difference,
        positioning: getPricePositioning(difference),
        strategy: getPricingStrategy(difference, quotedPrice)
    };
}

// Get price positioning indicator
function getPricePositioning(percentDiff) {
    if (percentDiff <= -15) {
        return {
            icon: '⚠️',
            label: 'Significantly BELOW market average',
            status: 'warning',
            message: 'May appear too cheap - customers might question quality'
        };
    } else if (percentDiff > -15 && percentDiff <= -5) {
        return {
            icon: '✓',
            label: 'BELOW market average',
            status: 'good',
            message: 'Competitive pricing, attractive to cost-conscious customers'
        };
    } else if (percentDiff > -5 && percentDiff <= 5) {
        return {
            icon: '✓',
            label: 'AT market average',
            status: 'good',
            message: 'Standard pricing - emphasize your service quality'
        };
    } else if (percentDiff > 5 && percentDiff <= 15) {
        return {
            icon: '⚠️',
            label: 'ABOVE market average',
            status: 'caution',
            message: 'Higher than average - emphasize premium service/quality'
        };
    } else {
        return {
            icon: '❌',
            label: 'Significantly ABOVE market average',
            status: 'risk',
            message: 'May lose price-sensitive customers - justify premium pricing'
        };
    }
}

// Get pricing strategy suggestion
function getPricingStrategy(percentDiff, price) {
    if (percentDiff <= -10) {
        return '💡 Strategy: Your competitive pricing is great for attracting new customers. Consider highlighting "Best Price Guarantee" or "New Customer Special" in your quote to build your customer base.';
    } else if (percentDiff > -10 && percentDiff <= 0) {
        return '💡 Strategy: Your price is well-positioned. For routine services, competitive pricing helps attract customers who may need bigger repairs later. Mention your expertise and quick turnaround time.';
    } else if (percentDiff > 0 && percentDiff <= 10) {
        return '💡 Strategy: Your pricing is slightly above market. Emphasize your value proposition: faster service, better warranty, premium parts, or certified technicians. Make sure customers understand what they\'re getting for the price.';
    } else {
        return '💡 Strategy: Your premium pricing requires strong justification. Highlight exclusive benefits: extended warranty, loaner vehicles, same-day service, OEM parts only, or master technician certification. Consider if the market will support this premium.';
    }
}

// Sample Data
const sampleLeads = [
    {
        id: 1698234567890,
        customerName: "John Smith",
        phone: "(555) 123-4567",
        email: "john.smith@email.com",
        carMake: "Honda",
        carModel: "Accord",
        carYear: "2018",
        issue: "Needs new brake pads. Hearing squeaking noise when braking, especially at low speeds.",
        status: "New",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        quoteAmount: null,
        communications: [
            {
                id: 1698234567890,
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                sender: "client",
                senderName: "John Smith",
                message: "Needs new brake pads. Hearing squeaking noise when braking, especially at low speeds.",
                type: "initial_inquiry"
            },
            {
                id: 1698234567891,
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1000).toISOString(),
                sender: "dealer",
                senderName: "Conneverse Auto Shop",
                message: "Thanks for using Conneverse Auto Shop! We are working on your case and evaluating the issue. We'll get back to you shortly with a quote.",
                type: "auto_reply"
            }
        ]
    },
    {
        id: 1698234567891,
        customerName: "Sarah Johnson",
        phone: "(555) 234-5678",
        email: "sarah.j@email.com",
        carMake: "Toyota",
        carModel: "Camry",
        carYear: "2020",
        issue: "Regular oil change needed plus new oil filter. Due for 30,000 mile service.",
        status: "Contacted",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        quoteAmount: null,
        communications: [
            {
                id: 1698234567892,
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                sender: "client",
                senderName: "Sarah Johnson",
                message: "Regular oil change needed plus new oil filter. Due for 30,000 mile service.",
                type: "initial_inquiry"
            },
            {
                id: 1698234567893,
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1000).toISOString(),
                sender: "dealer",
                senderName: "Conneverse Auto Shop",
                message: "Thanks for using Conneverse Auto Shop! We are working on your case and evaluating the issue. We'll get back to you shortly with a quote.",
                type: "auto_reply"
            }
        ]
    },
    {
        id: 1698234567892,
        customerName: "Mike Davis",
        phone: "(555) 345-6789",
        email: "mike.davis@email.com",
        carMake: "Ford",
        carModel: "F-150",
        carYear: "2019",
        issue: "Battery light is on. Truck is having trouble starting. Might need a new alternator.",
        status: "Quote Sent",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        quoteAmount: 485.00,
        communications: [
            {
                id: 1698234567894,
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                sender: "client",
                senderName: "Mike Davis",
                message: "Battery light is on. Truck is having trouble starting. Might need a new alternator.",
                type: "initial_inquiry"
            },
            {
                id: 1698234567895,
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 1000).toISOString(),
                sender: "dealer",
                senderName: "Conneverse Auto Shop",
                message: "Thanks for using Conneverse Auto Shop! We are working on your case and evaluating the issue. We'll get back to you shortly with a quote.",
                type: "auto_reply"
            },
            {
                id: 1698234567896,
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
                sender: "system",
                senderName: "System",
                message: "Searching for parts across multiple suppliers...",
                type: "parts_search"
            },
            {
                id: 1698234567897,
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 7200000).toISOString(),
                sender: "dealer",
                senderName: "Conneverse Auto Shop",
                message: "We have your quote ready! Please review:\n\n📋 2019 Ford F-150 - Alternator Replacement\n💰 Total: $485.00 (Parts + Labor)\n\nThis includes a remanufactured Bosch alternator with 1-2 day delivery. The quote is valid for 7 days.",
                type: "quote_sent",
                quoteAmount: 485.00
            }
        ]
    },
    {
        id: 1698234567893,
        customerName: "Emily Rodriguez",
        phone: "(555) 456-7890",
        email: "emily.r@email.com",
        carMake: "Chevrolet",
        carModel: "Malibu",
        carYear: "2017",
        issue: "Air conditioning not working properly. Blowing warm air instead of cold.",
        status: "New",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        quoteAmount: null,
        communications: [
            {
                id: 1698234567898,
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                sender: "client",
                senderName: "Emily Rodriguez",
                message: "Air conditioning not working properly. Blowing warm air instead of cold.",
                type: "initial_inquiry"
            },
            {
                id: 1698234567899,
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 1000).toISOString(),
                sender: "dealer",
                senderName: "Conneverse Auto Shop",
                message: "Thanks for using Conneverse Auto Shop! We are working on your case and evaluating the issue. We'll get back to you shortly with a quote.",
                type: "auto_reply"
            }
        ]
    }
];

// Sample Missed Calls Data
const sampleMissedCalls = [
    {
        id: "call-001",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        phone: "+1 (617) 555-0123",
        duration: "2m 34s",
        status: "new",
        aiSummary: {
            customerName: "Sarah Johnson",
            vehicle: {
                year: 2018,
                make: "Honda",
                model: "Accord"
            },
            serviceNeeded: "Brake noise and vibration when stopping",
            urgency: "urgent",
            notes: "Customer mentioned brakes making grinding noise for past 3 days. Concerned about safety. Would like appointment this week if possible."
        },
        transcript: [
            { speaker: "AI", text: "Hello, thank you for calling Conneverse Auto Repair. I'm the AI assistant. How can I help you today?" },
            { speaker: "Customer", text: "Hi, my brakes are making a weird grinding noise." },
            { speaker: "AI", text: "I can help you with that. What's your name?" },
            { speaker: "Customer", text: "Sarah Johnson." },
            { speaker: "AI", text: "Thanks Sarah. Can you tell me what kind of vehicle you have?" },
            { speaker: "Customer", text: "It's a 2018 Honda Accord." },
            { speaker: "AI", text: "Got it. When did you first notice the grinding noise?" },
            { speaker: "Customer", text: "About 3 days ago. It's getting worse and I'm worried it's not safe." },
            { speaker: "AI", text: "I understand your concern. Safety is our top priority. Can I get your phone number so we can follow up?" },
            { speaker: "Customer", text: "Sure, it's 617-555-0123." },
            { speaker: "AI", text: "Perfect. I've logged your information. We'll review this and get back to you within the hour with options for this week. Is there anything else I can help with?" },
            { speaker: "Customer", text: "No, that's all. Thank you!" }
        ],
        audioUrl: null
    },
    {
        id: "call-002",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        phone: "+1 (508) 555-0198",
        duration: "1m 45s",
        status: "new",
        aiSummary: {
            customerName: "Michael Chen",
            vehicle: {
                year: 2020,
                make: "Toyota",
                model: "RAV4"
            },
            serviceNeeded: "Check engine light is on",
            urgency: "standard",
            notes: "Check engine light came on yesterday. No noticeable performance issues. Customer wants diagnostic before the weekend."
        },
        transcript: [
            { speaker: "AI", text: "Hello, thank you for calling Conneverse Auto Repair. I'm the AI assistant. How can I help you today?" },
            { speaker: "Customer", text: "My check engine light just came on." },
            { speaker: "AI", text: "I can help with that. What's your name?" },
            { speaker: "Customer", text: "Michael Chen." },
            { speaker: "AI", text: "Thanks Michael. What vehicle are you driving?" },
            { speaker: "Customer", text: "2020 Toyota RAV4." },
            { speaker: "AI", text: "Is the vehicle running normally otherwise?" },
            { speaker: "Customer", text: "Yeah, seems fine. Just the light is on." },
            { speaker: "AI", text: "Understood. We can run a diagnostic to see what's causing it. What's a good phone number to reach you?" },
            { speaker: "Customer", text: "508-555-0198." },
            { speaker: "AI", text: "Perfect. We'll review this and get back to you with diagnostic options. Thanks for calling!" }
        ],
        audioUrl: null
    },
    {
        id: "call-003",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        phone: "+1 (781) 555-0245",
        duration: "3m 12s",
        status: "reviewed",
        aiSummary: {
            customerName: "Jennifer Martinez",
            vehicle: {
                year: 2016,
                make: "Ford",
                model: "Explorer"
            },
            serviceNeeded: "Transmission slipping, rough shifting",
            urgency: "urgent",
            notes: "Transmission has been slipping when accelerating. Shifting feels rough between gears. Issue started 2 weeks ago and getting progressively worse."
        },
        transcript: [
            { speaker: "AI", text: "Hello, thank you for calling Conneverse Auto Repair. I'm the AI assistant. How can I help you today?" },
            { speaker: "Customer", text: "I'm having transmission problems with my Ford Explorer." },
            { speaker: "AI", text: "I'm sorry to hear that. Can you describe what's happening?" },
            { speaker: "Customer", text: "It's slipping when I accelerate and the shifts feel really rough." },
            { speaker: "AI", text: "That does sound concerning. What's your name?" },
            { speaker: "Customer", text: "Jennifer Martinez." },
            { speaker: "AI", text: "Thanks Jennifer. What year is your Explorer?" },
            { speaker: "Customer", text: "It's a 2016." },
            { speaker: "AI", text: "How long has this been happening?" },
            { speaker: "Customer", text: "Started about 2 weeks ago and it's getting worse." },
            { speaker: "AI", text: "I understand. This definitely needs attention. What's your phone number?" },
            { speaker: "Customer", text: "781-555-0245." },
            { speaker: "AI", text: "Got it. We'll have a transmission specialist review this and call you back today with options. We take transmission issues very seriously." },
            { speaker: "Customer", text: "Thank you, I appreciate it." }
        ],
        audioUrl: null
    },
    {
        id: "call-004",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        phone: "+1 (339) 555-0167",
        duration: "1m 58s",
        status: "new",
        aiSummary: {
            customerName: "Robert Thompson",
            vehicle: {
                year: 2019,
                make: "Chevrolet",
                model: "Silverado"
            },
            serviceNeeded: "Oil change and tire rotation",
            urgency: "flexible",
            notes: "Regular maintenance due. Customer flexible on scheduling, prefers sometime next week."
        },
        transcript: [
            { speaker: "AI", text: "Hello, thank you for calling Conneverse Auto Repair. I'm the AI assistant. How can I help you today?" },
            { speaker: "Customer", text: "I need an oil change and tire rotation." },
            { speaker: "AI", text: "Happy to help with that. What's your name?" },
            { speaker: "Customer", text: "Robert Thompson." },
            { speaker: "AI", text: "Thanks Robert. What vehicle?" },
            { speaker: "Customer", text: "2019 Chevy Silverado." },
            { speaker: "AI", text: "Perfect. When are you looking to come in?" },
            { speaker: "Customer", text: "Sometime next week works for me, I'm flexible." },
            { speaker: "AI", text: "Great. Can I get your phone number?" },
            { speaker: "Customer", text: "339-555-0167." },
            { speaker: "AI", text: "Excellent. We'll call you back with available times for next week. Thanks for calling Conneverse!" }
        ],
        audioUrl: null
    },
    {
        id: "call-005",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        phone: "+1 (857) 555-0289",
        duration: "2m 21s",
        status: "new",
        aiSummary: {
            customerName: "Lisa Anderson",
            vehicle: {
                year: 2017,
                make: "Nissan",
                model: "Altima"
            },
            serviceNeeded: "Air conditioning not cooling properly",
            urgency: "standard",
            notes: "A/C blowing warm air instead of cold. Issue started last week. Customer wants it fixed before summer heat arrives."
        },
        transcript: [
            { speaker: "AI", text: "Hello, thank you for calling Conneverse Auto Repair. I'm the AI assistant. How can I help you today?" },
            { speaker: "Customer", text: "My air conditioning isn't working right." },
            { speaker: "AI", text: "I can help with that. What's happening with it?" },
            { speaker: "Customer", text: "It's blowing warm air instead of cold." },
            { speaker: "AI", text: "Got it. What's your name?" },
            { speaker: "Customer", text: "Lisa Anderson." },
            { speaker: "AI", text: "Thanks Lisa. What vehicle do you have?" },
            { speaker: "Customer", text: "2017 Nissan Altima." },
            { speaker: "AI", text: "When did you first notice this?" },
            { speaker: "Customer", text: "About a week ago. I want to get it fixed before it gets really hot." },
            { speaker: "AI", text: "That's a smart idea. What's your phone number?" },
            { speaker: "Customer", text: "857-555-0289." },
            { speaker: "AI", text: "Perfect. We'll review your A/C issue and get back to you with options and pricing. Thanks for calling!" },
            { speaker: "Customer", text: "Thank you!" }
        ],
        audioUrl: null
    }
];

// Parts Database (simulated AI search results)
const partsDatabase = {
    "brake": [
        {
            name: "Premium Ceramic Brake Pads",
            brand: "Wagner ThermoQuiet",
            supplier: "AutoZone",
            price: 45.99,
            delivery: "1-2 days",
            rating: 4.5,
            stock: "In Stock",
            bestValue: false
        },
        {
            name: "OEM Brake Pad Set",
            brand: "ACDelco",
            supplier: "O'Reilly Auto Parts",
            price: 52.99,
            delivery: "2-3 days",
            rating: 4.8,
            stock: "In Stock",
            bestValue: true
        },
        {
            name: "Performance Brake Pads",
            brand: "Brembo",
            supplier: "NAPA",
            price: 68.99,
            delivery: "1 day",
            rating: 4.9,
            stock: "Limited",
            bestValue: false
        },
        {
            name: "Economy Brake Pads",
            brand: "Duralast",
            supplier: "Local Supplier",
            price: 38.99,
            delivery: "Same day",
            rating: 4.2,
            stock: "In Stock",
            bestValue: false
        }
    ],
    "oil": [
        {
            name: "Full Synthetic Motor Oil 5W-30",
            brand: "Mobil 1",
            supplier: "AutoZone",
            price: 28.99,
            delivery: "1 day",
            rating: 4.8,
            stock: "In Stock",
            bestValue: true
        },
        {
            name: "Synthetic Blend Oil 5W-30",
            brand: "Castrol",
            supplier: "O'Reilly Auto Parts",
            price: 22.99,
            delivery: "1-2 days",
            rating: 4.6,
            stock: "In Stock",
            bestValue: false
        },
        {
            name: "Premium Oil Filter",
            brand: "Fram Ultra",
            supplier: "NAPA",
            price: 12.99,
            delivery: "1 day",
            rating: 4.7,
            stock: "In Stock",
            bestValue: false
        },
        {
            name: "OEM Oil Filter",
            brand: "Toyota Genuine",
            supplier: "Local Supplier",
            price: 8.99,
            delivery: "Same day",
            rating: 4.9,
            stock: "In Stock",
            bestValue: false
        }
    ],
    "alternator": [
        {
            name: "Remanufactured Alternator 130A",
            brand: "Bosch",
            supplier: "AutoZone",
            price: 189.99,
            delivery: "1-2 days",
            rating: 4.6,
            stock: "In Stock",
            bestValue: true
        },
        {
            name: "New Alternator 130A",
            brand: "Motorcraft",
            supplier: "O'Reilly Auto Parts",
            price: 245.99,
            delivery: "2-3 days",
            rating: 4.8,
            stock: "In Stock",
            bestValue: false
        },
        {
            name: "Premium Alternator 150A",
            brand: "Denso",
            supplier: "NAPA",
            price: 279.99,
            delivery: "1 day",
            rating: 4.9,
            stock: "Limited",
            bestValue: false
        },
        {
            name: "Economy Alternator 120A",
            brand: "Duralast",
            supplier: "RockAuto",
            price: 149.99,
            delivery: "3-4 days",
            rating: 4.3,
            stock: "In Stock",
            bestValue: false
        }
    ],
    "air conditioning": [
        {
            name: "A/C Compressor Assembly",
            brand: "Four Seasons",
            supplier: "AutoZone",
            price: 225.99,
            delivery: "1-2 days",
            rating: 4.5,
            stock: "In Stock",
            bestValue: true
        },
        {
            name: "A/C Refrigerant R-134a",
            brand: "Interdynamics",
            supplier: "O'Reilly Auto Parts",
            price: 15.99,
            delivery: "1 day",
            rating: 4.4,
            stock: "In Stock",
            bestValue: false
        },
        {
            name: "A/C Condenser",
            brand: "Denso",
            supplier: "NAPA",
            price: 189.99,
            delivery: "2-3 days",
            rating: 4.7,
            stock: "In Stock",
            bestValue: false
        },
        {
            name: "A/C Recharge Kit",
            brand: "AC Pro",
            supplier: "Local Supplier",
            price: 29.99,
            delivery: "Same day",
            rating: 4.3,
            stock: "In Stock",
            bestValue: false
        }
    ],
    "default": [
        {
            name: "Standard Replacement Part",
            brand: "OEM",
            supplier: "AutoZone",
            price: 125.99,
            delivery: "1-2 days",
            rating: 4.5,
            stock: "In Stock",
            bestValue: true
        },
        {
            name: "Premium Replacement Part",
            brand: "ACDelco",
            supplier: "O'Reilly Auto Parts",
            price: 165.99,
            delivery: "2-3 days",
            rating: 4.7,
            stock: "In Stock",
            bestValue: false
        },
        {
            name: "Performance Part",
            brand: "Bosch",
            supplier: "NAPA",
            price: 199.99,
            delivery: "1 day",
            rating: 4.8,
            stock: "Limited",
            bestValue: false
        },
        {
            name: "Economy Part",
            brand: "Aftermarket",
            supplier: "RockAuto",
            price: 89.99,
            delivery: "3-4 days",
            rating: 4.2,
            stock: "In Stock",
            bestValue: false
        }
    ]
};

// Labor costs for different services
const laborCosts = {
    "brake": 120,
    "oil": 35,
    "alternator": 150,
    "air conditioning": 200,
    "default": 100
};

// Initialize Application
function initializeApp() {
    // Check if this is the first run
    const existingLeads = localStorage.getItem('conneverse_leads');
    const hasSeenWelcome = localStorage.getItem('conneverse_welcome_seen');

    if (!existingLeads || JSON.parse(existingLeads).length === 0) {
        // First run - load sample data
        localStorage.setItem('conneverse_leads', JSON.stringify(sampleLeads));
        console.log('Sample data loaded');
    }

    // Load leads from localStorage
    loadLeads();

    // Initialize missed calls
    initializeMissedCalls();

    // Render initial view
    renderLeads();
    updateAnalytics();

    // Attach event listener to new lead form
    const newLeadForm = document.getElementById('newLeadForm');
    if (newLeadForm) {
        newLeadForm.addEventListener('submit', handleNewLeadSubmit);

        // Add real-time validation on blur
        const fields = ['newCustomerName', 'newPhone', 'newEmail', 'newCarMake', 'newCarModel', 'newCarYear', 'newIssue'];
        const fieldNames = ['Customer name', 'Phone number', 'Email', 'Car make', 'Car model', 'Year', 'Issue description'];

        fields.forEach((fieldId, index) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => validateNewLeadField(fieldId, fieldNames[index]));
                field.addEventListener('input', () => {
                    // Clear error on input
                    const errorDiv = document.getElementById(`error-${fieldId}`);
                    if (errorDiv && field.value.trim()) {
                        errorDiv.classList.add('hidden');
                        field.classList.remove('border-red-500');
                    }
                });
            }
        });
    }

    // Show welcome modal on first visit
    if (!hasSeenWelcome) {
        setTimeout(() => {
            showWelcome();
        }, 500);
    }
}

// Load leads from localStorage
function loadLeads() {
    const stored = localStorage.getItem('conneverse_leads');
    allLeads = stored ? JSON.parse(stored) : [];
}

// Save leads to localStorage
function saveLeads() {
    localStorage.setItem('conneverse_leads', JSON.stringify(allLeads));
}

// Render Leads
function renderLeads() {
    const container = document.getElementById('leadsContainer');
    const emptyState = document.getElementById('emptyState');
    const leadCount = document.getElementById('leadCount');

    // Get filter values
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';

    // Filter leads
    let filteredLeads = allLeads.filter(lead => {
        const matchesSearch = lead.customerName.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Sort by timestamp (newest first)
    filteredLeads.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Update lead count
    if (leadCount) {
        leadCount.textContent = filteredLeads.length;
    }

    // Update leads badge in tab
    const leadsBadge = document.getElementById('leads-badge');
    if (leadsBadge) {
        leadsBadge.textContent = allLeads.length;
    }

    if (filteredLeads.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    // Determine status colors for left border
    const getStatusBorder = (status) => {
        switch(status) {
            case 'New': return 'border-l-blue-500';
            case 'Contacted': return 'border-l-yellow-500';
            case 'Quote Sent': return 'border-l-purple-500';
            case 'Closed': return 'border-l-green-500';
            case 'Lost': return 'border-l-red-500';
            default: return 'border-l-gray-500';
        }
    };

    // Check if lead is less than 24 hours old
    const isNewLead = (timestamp) => {
        const now = new Date();
        const leadDate = new Date(timestamp);
        const hoursDiff = (now - leadDate) / (1000 * 60 * 60);
        return hoursDiff < 24;
    };

    // Render lead cards
    container.innerHTML = filteredLeads.map((lead, index) => `
        <div class="bg-white rounded-lg shadow-sm p-6 card-hover border border-gray-200 border-l-4 ${getStatusBorder(lead.status)} relative animate-slide-in ${isNewLead(lead.timestamp) && lead.status === 'New' ? 'ring-2 ring-blue-300' : ''}" style="animation-delay: ${index * 0.05}s">
            ${isNewLead(lead.timestamp) && lead.status === 'New' ? '<div class="absolute top-2 left-2"><span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-500 text-white new-lead-pulse"><span class="mr-1">●</span> NEW</span></div>' : ''}
            <!-- Status Badge -->
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-bold text-gray-900">${lead.customerName}</h3>
                    <p class="text-gray-600 text-sm mt-1">${formatDate(lead.timestamp)}</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="status-badge status-${lead.status.toLowerCase().replace(' ', '-')}">${lead.status}</span>
                    <!-- Actions Menu -->
                    <div class="relative group">
                        <button class="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition" onclick="toggleMenu(event, ${lead.id})">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                            </svg>
                        </button>
                        <!-- Dropdown Menu -->
                        <div id="menu-${lead.id}" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                            <button onclick="updateLeadStatus(${lead.id}); closeMenu(${lead.id})" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                ${lead.status === 'New' ? 'Mark Contacted' : lead.status === 'Contacted' ? 'Mark Quote Sent' : 'Update Status'}
                            </button>
                            <button onclick="markAsClosed(${lead.id}); closeMenu(${lead.id})" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                                Mark as Closed
                            </button>
                            <button onclick="markAsLost(${lead.id}); closeMenu(${lead.id})" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                Mark as Lost
                            </button>
                            <div class="border-t border-gray-200 my-1"></div>
                            <button onclick="deleteLead(${lead.id}); closeMenu(${lead.id})" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
                                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                                Delete Lead
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contact Info -->
            <div class="space-y-2 mb-4">
                <div class="flex items-center text-gray-600">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <a href="tel:${lead.phone}" class="text-sm hover:text-auto-blue transition">${lead.phone}</a>
                </div>
                ${lead.email ? `
                <div class="flex items-center text-gray-600">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <a href="mailto:${lead.email}" class="text-sm hover:text-auto-blue transition">${lead.email}</a>
                </div>
                ` : ''}
            </div>

            <!-- Vehicle Info -->
            <div class="bg-blue-50 rounded-lg p-3 mb-4">
                <div class="flex items-center text-auto-blue mb-2">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    <span class="font-semibold text-sm">${lead.carYear} ${lead.carMake} ${lead.carModel}</span>
                </div>
                <p class="text-gray-700 text-sm">${lead.issue}</p>
            </div>

            <!-- Quote Amount -->
            ${lead.quoteAmount ? `
            <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div class="flex justify-between items-center">
                    <span class="text-green-700 font-semibold text-sm">Quote Amount:</span>
                    <span class="text-green-900 font-bold text-lg">$${lead.quoteAmount.toFixed(2)}</span>
                </div>
            </div>
            ` : ''}

            <!-- Primary Action Button (Full Width, Prominent) -->
            <button onclick="openPartsModal(${lead.id})" class="w-full bg-gradient-to-r from-auto-orange to-orange-600 text-white px-6 py-3 rounded-lg text-base font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 mb-3">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Find Parts & Create Quote
            </button>

            <!-- Secondary Actions -->
            <div class="flex flex-col sm:flex-row gap-2">
                <button onclick="openCommunicationModal(${lead.id})" class="flex-1 bg-white border-2 border-purple-600 text-purple-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 transition flex items-center justify-center gap-1">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    Messages ${lead.communications && lead.communications.length > 2 ? `<span class="bg-purple-500 text-white text-xs rounded-full px-2 ml-1">${lead.communications.length}</span>` : ''}
                </button>
                <button onclick="updateLeadStatus(${lead.id})" class="flex-1 bg-white border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition">
                    ${lead.status === 'New' ? 'Mark Contacted' : lead.status === 'Contacted' ? 'Mark Quote Sent' : 'Update Status'}
                </button>
                <a href="tel:${lead.phone}" class="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition text-center flex items-center justify-center gap-1">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    Call
                </a>
            </div>
        </div>
    `).join('');
}

// Filter Leads
function filterLeads() {
    renderLeads();
    updateFilterStatus();
}

// Clear Filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'all';
    filterLeads();
    showToast('Filters cleared', 'info');
}

// Update Filter Status
function updateFilterStatus() {
    const searchTerm = document.getElementById('searchInput')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const filterStatus = document.getElementById('filterStatus');

    if (!filterStatus) return;

    if (searchTerm || statusFilter !== 'all') {
        const parts = [];
        if (searchTerm) parts.push(`Search: "${searchTerm}"`);
        if (statusFilter !== 'all') parts.push(`Status: ${statusFilter}`);

        const totalFiltered = allLeads.filter(lead => {
            const matchesSearch = lead.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
            return matchesSearch && matchesStatus;
        }).length;

        filterStatus.innerHTML = `<span class="font-medium">Showing ${totalFiltered} of ${allLeads.length} leads</span> • ${parts.join(' • ')}`;
        filterStatus.classList.remove('hidden');
    } else {
        filterStatus.innerHTML = '';
        filterStatus.classList.add('hidden');
    }
}

// Update Lead Status
function updateLeadStatus(leadId) {
    const lead = allLeads.find(l => l.id === leadId);
    if (lead) {
        const oldStatus = lead.status;
        if (lead.status === 'New') {
            lead.status = 'Contacted';
            showToast('Lead marked as contacted', 'success');
        } else if (lead.status === 'Contacted') {
            lead.status = 'Quote Sent';
            showToast('Lead marked as quote sent', 'success');
        } else {
            showToast('Status updated', 'info');
        }
        saveLeads();
        renderLeads();
        updateAnalytics();
    }
}

// Delete Lead
function deleteLead(leadId) {
    if (confirm('Are you sure you want to delete this lead?')) {
        allLeads = allLeads.filter(l => l.id !== leadId);
        saveLeads();
        renderLeads();
        updateAnalytics();
    }
}

// Open Parts Modal
function openPartsModal(leadId, skipReset = false) {
    currentLead = allLeads.find(l => l.id === leadId);
    if (!currentLead) return;

    const modal = document.getElementById('partsModal');
    const detailsSection = document.getElementById('modalLeadDetails');

    // Populate lead details
    detailsSection.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">${currentLead.customerName}</h3>
            <span class="status-badge status-${currentLead.status.toLowerCase().replace(' ', '-')}">${currentLead.status}</span>
        </div>
        <div class="grid md:grid-cols-2 gap-4">
            <div>
                <p class="text-gray-600 text-sm">Contact</p>
                <p class="text-gray-900 font-semibold">${currentLead.phone}</p>
                ${currentLead.email ? `<p class="text-gray-700 text-sm">${currentLead.email}</p>` : ''}
            </div>
            <div>
                <p class="text-gray-600 text-sm">Vehicle</p>
                <p class="text-gray-900 font-semibold">${currentLead.carYear} ${currentLead.carMake} ${currentLead.carModel}</p>
            </div>
        </div>
        <div class="mt-4">
            <p class="text-gray-600 text-sm mb-1">Issue Description</p>
            <p class="text-gray-900">${currentLead.issue}</p>
        </div>
    `;

    // Only reset modal state if not coming from "Back to Parts"
    if (!skipReset) {
        document.getElementById('searchSection').classList.remove('hidden');
        document.getElementById('loadingSection').classList.add('hidden');
        document.getElementById('partsResults').classList.add('hidden');
        resetProgressIndicator();
    }

    modal.style.display = 'block';
}

// Close Parts Modal
function closePartsModal() {
    document.getElementById('partsModal').style.display = 'none';
    currentLead = null;
}

// New Lead Modal Functions
function openNewLeadModal() {
    document.getElementById('newLeadModal').style.display = 'block';
    // Clear any previous error messages
    document.querySelectorAll('[id^="error-new"]').forEach(el => {
        el.classList.add('hidden');
        el.textContent = '';
    });
    // Clear all error styling
    document.querySelectorAll('#newLeadForm input, #newLeadForm textarea').forEach(el => {
        el.classList.remove('border-red-500');
    });
}

function closeNewLeadModal() {
    document.getElementById('newLeadModal').style.display = 'none';
    document.getElementById('newLeadForm').reset();
    // Clear any error messages
    document.querySelectorAll('[id^="error-new"]').forEach(el => {
        el.classList.add('hidden');
        el.textContent = '';
    });
    // Clear all error styling
    document.querySelectorAll('#newLeadForm input, #newLeadForm textarea').forEach(el => {
        el.classList.remove('border-red-500');
    });
}

function validateNewLeadField(fieldId, fieldName) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(`error-${fieldId}`);

    if (!field.value.trim() && field.hasAttribute('required')) {
        errorDiv.textContent = `${fieldName} is required`;
        errorDiv.classList.remove('hidden');
        field.classList.add('border-red-500');
        return false;
    } else if (field.type === 'email' && field.value && !field.validity.valid) {
        errorDiv.textContent = 'Please enter a valid email address';
        errorDiv.classList.remove('hidden');
        field.classList.add('border-red-500');
        return false;
    } else {
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';
        field.classList.remove('border-red-500');
        return true;
    }
}

function handleNewLeadSubmit(event) {
    event.preventDefault();

    // Validate all fields
    const validations = [
        validateNewLeadField('newCustomerName', 'Customer name'),
        validateNewLeadField('newPhone', 'Phone number'),
        validateNewLeadField('newEmail', 'Email'),
        validateNewLeadField('newCarMake', 'Car make'),
        validateNewLeadField('newCarModel', 'Car model'),
        validateNewLeadField('newCarYear', 'Year'),
        validateNewLeadField('newIssue', 'Issue description')
    ];

    if (!validations.every(v => v)) {
        return; // Don't submit if validation fails
    }

    const customerName = document.getElementById('newCustomerName').value.trim();
    const issue = document.getElementById('newIssue').value.trim();
    const timestamp = new Date().toISOString();

    // Create new lead object with communications
    const newLead = {
        id: Date.now(),
        customerName: customerName,
        phone: document.getElementById('newPhone').value.trim(),
        email: document.getElementById('newEmail').value.trim(),
        carMake: document.getElementById('newCarMake').value.trim(),
        carModel: document.getElementById('newCarModel').value.trim(),
        carYear: document.getElementById('newCarYear').value.trim(),
        issue: issue,
        status: 'New',
        timestamp: timestamp,
        quoteAmount: null,
        communications: [
            {
                id: Date.now(),
                timestamp: timestamp,
                sender: 'client',
                senderName: customerName,
                message: issue,
                type: 'initial_inquiry'
            },
            {
                id: Date.now() + 1,
                timestamp: timestamp,
                sender: 'dealer',
                senderName: 'Conneverse Auto Shop',
                message: 'Thanks for using Conneverse Auto Shop! We are working on your case and evaluating the issue. We\'ll get back to you shortly with a quote.',
                type: 'auto_reply'
            }
        ]
    };

    // Add to leads array
    allLeads.push(newLead);

    // Save to localStorage
    saveLeads();

    // Re-render leads
    renderLeads();
    updateAnalytics();

    // Close modal
    closeNewLeadModal();

    // Show success toast
    showToast('Lead created successfully!', 'success');

    // Switch to leads tab if not already there
    switchTab('leads');
}

// Progress Indicator Functions
function updateProgressIndicator(currentStep) {
    const steps = document.querySelectorAll('.progress-step');

    steps.forEach((step, index) => {
        const stepNumber = index + 1;

        if (stepNumber < currentStep) {
            // Completed steps
            step.classList.remove('active');
            step.classList.add('completed');
            step.querySelector('.progress-step-circle').innerHTML = '✓';
        } else if (stepNumber === currentStep) {
            // Current active step
            step.classList.add('active');
            step.classList.remove('completed');
            step.querySelector('.progress-step-circle').innerHTML = stepNumber;
        } else {
            // Future steps
            step.classList.remove('active', 'completed');
            step.querySelector('.progress-step-circle').innerHTML = stepNumber;
        }
    });
}

function resetProgressIndicator() {
    updateProgressIndicator(1);
}

// Communication Helper Functions
function addCommunication(leadId, commData) {
    const lead = allLeads.find(l => l.id === leadId);
    if (!lead) return;
    
    if (!lead.communications) {
        lead.communications = [];
    }
    
    const communication = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        sender: commData.sender,
        senderName: commData.senderName,
        message: commData.message,
        type: commData.type,
        ...commData
    };
    
    lead.communications.push(communication);
    saveLeads();
}

function openCommunicationModal(leadId) {
    const lead = allLeads.find(l => l.id === leadId);
    console.log(lead, leadId)
    if (!lead) return;
    
    // Ensure communications exist
    if (!lead.communications || lead.communications.length === 0) {
        lead.communications = [
            {
                id: Date.now(),
                timestamp: lead.timestamp,
                sender: 'client',
                senderName: lead.customerName,
                message: lead.issue,
                type: 'initial_inquiry'
            },
            {
                id: Date.now() + 1,
                timestamp: lead.timestamp,
                sender: 'dealer',
                senderName: 'Conneverse Auto Shop',
                message: 'Thanks for using Conneverse Auto Shop! We are working on your case and evaluating the issue. We\'ll get back to you shortly with a quote.',
                type: 'auto_reply'
            }
        ];
        saveLeads();
    }
    
    currentLead = lead;
    
    // Set lead info
    document.getElementById('commLeadName').textContent = lead.customerName;
    document.getElementById('commLeadVehicle').textContent = `${lead.carYear} ${lead.carMake} ${lead.carModel}`;
    
    // Render communications
    renderCommunications(leadId);
    
    // Show modal with animation
    const modal = document.getElementById('communicationModal');
    const panel = document.getElementById('communicationPanel');
    modal.classList.remove('hidden');
    panel.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
        panel.style.transform = 'translateX(0)';
    }, 10);
}

function closeCommunicationModal() {
    const modal = document.getElementById('communicationModal');
    const panel = document.getElementById('communicationPanel');
    
    panel.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
        modal.classList.add('hidden');
        currentLead = null;
    }, 300);
}

function renderCommunications(leadId) {
    const lead = allLeads.find(l => l.id === leadId);
    if (!lead || !lead.communications) return;
    
    const container = document.getElementById('communicationTimeline');
    
    const messages = lead.communications.map(comm => {
        const isClient = comm.sender === 'client';
        const isDealer = comm.sender === 'dealer';
        const bgColor = isClient ? 'bg-blue-50 border-blue-200' : 
                       isDealer ? 'bg-green-50 border-green-200' : 
                       'bg-gray-50 border-gray-200';
        const icon = isClient ? '🔵' : isDealer ? '🟢' : '🟠';
        
        return `
            <div class="border-l-4 ${bgColor} rounded-lg p-4">
                <div class="flex items-start gap-3">
                    <span class="text-2xl">${icon}</span>
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-2">
                            <span class="font-semibold text-gray-900">${comm.senderName}</span>
                            <span class="text-sm text-gray-500">${formatDate(comm.timestamp)}</span>
                        </div>
                        <p class="text-gray-700 whitespace-pre-line">${comm.message}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = messages;
}

// Search for Parts (Simulated AI)
function searchForParts() {
    // Add system communication
    addCommunication(currentLead.id, {
        sender: 'system',
        senderName: 'System',
        message: 'Searching for parts across multiple suppliers...',
        type: 'parts_search'
    });
    
    // Hide search button, show loading
    document.getElementById('searchSection').classList.add('hidden');
    document.getElementById('loadingSection').classList.remove('hidden');

    // Simulate AI search delay
    setTimeout(() => {
        // Determine part type from issue
        const issue = currentLead.issue.toLowerCase();
        let partType = 'default';

        if (issue.includes('brake')) partType = 'brake';
        else if (issue.includes('oil')) partType = 'oil';
        else if (issue.includes('alternator') || issue.includes('battery')) partType = 'alternator';
        else if (issue.includes('air') || issue.includes('a/c') || issue.includes('conditioning')) partType = 'air conditioning';

        // Get parts for this type
        const parts = partsDatabase[partType];
        const laborCost = laborCosts[partType];

        // Render parts
        renderParts(parts, laborCost);

        // Save to search history
        partsSearchHistory.push({
            leadId: currentLead.id,
            customerName: currentLead.customerName,
            vehicle: `${currentLead.carYear} ${currentLead.carMake} ${currentLead.carModel}`,
            partType: partType,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('conneverse_searches', JSON.stringify(partsSearchHistory));

        // Hide loading, show results
        document.getElementById('loadingSection').classList.add('hidden');
        document.getElementById('partsResults').classList.remove('hidden');

        // Update progress to step 2 (Select Part)
        updateProgressIndicator(2);
    }, 2000);
}

// Render Parts Results
function renderParts(parts, laborCost) {
    const container = document.getElementById('partsGrid');

    container.innerHTML = parts.map((part, index) => `
        <div class="bg-white rounded-lg border-2 ${part.bestValue ? 'border-green-500' : 'border-gray-200'} p-4 sm:p-6 relative hover:shadow-lg transition-shadow">
            ${part.bestValue ? '<div class="absolute top-0 right-0 m-3 sm:m-4"><span class="best-value-badge text-xs sm:text-sm">BEST VALUE</span></div>' : ''}

            <div class="mb-4 ${part.bestValue ? 'pr-24' : ''}">
                <h4 class="text-base sm:text-lg font-bold text-gray-900 mb-1">${part.name}</h4>
                <p class="text-gray-600 text-xs sm:text-sm">${part.brand}</p>
            </div>

            <div class="space-y-2 mb-4">
                <div class="flex justify-between text-xs sm:text-sm">
                    <span class="text-gray-600">Supplier:</span>
                    <span class="font-semibold text-gray-900 text-right">${part.supplier}</span>
                </div>
                <div class="flex justify-between text-xs sm:text-sm">
                    <span class="text-gray-600">Delivery:</span>
                    <span class="font-semibold text-gray-900">${part.delivery}</span>
                </div>
                <div class="flex justify-between text-xs sm:text-sm">
                    <span class="text-gray-600">Stock:</span>
                    <span class="font-semibold ${part.stock === 'In Stock' ? 'text-green-600' : 'text-orange-600'}">${part.stock}</span>
                </div>
                <div class="flex justify-between items-center text-xs sm:text-sm">
                    <span class="text-gray-600">Rating:</span>
                    <div class="flex items-center">
                        <span class="text-yellow-500 mr-1">${'★'.repeat(Math.floor(part.rating))}${'☆'.repeat(5 - Math.floor(part.rating))}</span>
                        <span class="font-semibold text-gray-900">${part.rating}</span>
                    </div>
                </div>
            </div>

            <div class="border-t pt-4 mb-4">
                <div class="flex justify-between items-center">
                    <span class="text-gray-600 font-semibold text-sm sm:text-base">Price:</span>
                    <span class="text-xl sm:text-2xl font-bold text-auto-orange">$${part.price.toFixed(2)}</span>
                </div>
            </div>

            <button onclick="selectPart(${index})" class="w-full ${part.bestValue ? 'bg-green-600 hover:bg-green-700' : 'bg-auto-blue hover:bg-blue-800'} text-white px-4 py-3 rounded-lg font-semibold transition text-sm sm:text-base">
                Select This Part
            </button>
        </div>
    `).join('');

    // Update labor cost
    document.getElementById('laborCost').textContent = `$${laborCost.toFixed(2)}`;

    // Store current parts and labor for quote generation
    window.currentParts = parts;
    window.currentLabor = laborCost;
}

// Select Part and Generate Quote
function selectPart(partIndex) {
    console.log('selectPart called with index:', partIndex);
    const parts = window.currentParts;
    const laborCost = window.currentLabor;
    currentPart = parts[partIndex];
    console.log('Selected part:', currentPart);
    console.log('Labor cost:', laborCost);

    // Generate quote
    generateQuote(currentPart, laborCost);

    // Close parts modal (but keep currentLead), open quote modal
    document.getElementById('partsModal').style.display = 'none';
    // DON'T call closePartsModal() here because it clears currentLead
    document.getElementById('quoteModal').style.display = 'block';

    // Update progress to step 3 (Review Quote)
    updateProgressIndicator(3);
}

// Generate Quote
function generateQuote(part, laborCost) {
    console.log('generateQuote called');
    console.log('Part:', part);
    console.log('Labor cost:', laborCost);
    console.log('currentLead:', currentLead);
    
    // Store quote data for editing
    currentQuoteData = {
        partPrice: part.price,
        laborCost: laborCost,
        taxRate: 0.08,
        discount: 0
    };
    console.log('currentQuoteData:', currentQuoteData);

    // Reset edit mode
    quoteEditMode = false;

    // Render the quote
    renderQuote(part);
}

// Render Quote HTML
function renderQuote(part) {
    console.log('renderQuote called with part:', part);
    console.log('currentLead in renderQuote:', currentLead);
    
    const subtotal = currentQuoteData.partPrice + currentQuoteData.laborCost - currentQuoteData.discount;
    const tax = subtotal * currentQuoteData.taxRate;
    const total = subtotal + tax;

    console.log('Calculated totals - Subtotal:', subtotal, 'Tax:', tax, 'Total:', total);

    // Calculate market price comparison
    const marketComparison = calculateMarketPrice(total, currentLead.issue);
    console.log('Market comparison:', marketComparison);

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);

    const quoteHTML = `
        <div class="print-section">
            <!-- Quote Header -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-t-lg mb-6">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-3xl font-bold mb-2">SERVICE QUOTE</h2>
                        <p class="text-blue-100">Quote #${currentLead.id}</p>
                    </div>
                    <div class="text-right">
                        <div class="flex items-center text-white mb-2">
                            <svg class="h-10 w-10 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            <span class="text-2xl font-bold">Conne<span class="text-orange-300">verse</span></span>
                        </div>
                        <p class="text-blue-100 text-sm">Your Trusted Auto Shop</p>
                    </div>
                </div>
            </div>

            <!-- Customer & Vehicle Info -->
            <div class="grid md:grid-cols-2 gap-6 mb-6">
                <div class="bg-gray-50 rounded-lg p-6">
                    <h3 class="text-sm font-semibold text-gray-600 mb-3">CUSTOMER INFORMATION</h3>
                    <div class="space-y-2">
                        <p class="text-gray-900 font-semibold text-lg">${currentLead.customerName}</p>
                        <p class="text-gray-700">${currentLead.phone}</p>
                        ${currentLead.email ? `<p class="text-gray-700">${currentLead.email}</p>` : ''}
                    </div>
                </div>
                <div class="bg-gray-50 rounded-lg p-6">
                    <h3 class="text-sm font-semibold text-gray-600 mb-3">VEHICLE INFORMATION</h3>
                    <div class="space-y-2">
                        <p class="text-gray-900 font-semibold text-lg">${currentLead.carYear} ${currentLead.carMake} ${currentLead.carModel}</p>
                        <p class="text-gray-700"><strong>Issue:</strong> ${currentLead.issue}</p>
                    </div>
                </div>
            </div>

            <!-- Quote Details -->
            <div class="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">QUOTE DETAILS</h3>

                <!-- Edit Mode Notification -->
                <div id="editModeNotice" class="hidden bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <div class="flex items-center text-orange-800">
                        <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                        </svg>
                        <span class="font-semibold">Edit Mode Active - Adjust values below</span>
                    </div>
                </div>

                <!-- Parts -->
                <div class="mb-6">
                    <div class="bg-blue-50 rounded-lg p-4 mb-3">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex-1">
                                <h4 class="font-bold text-gray-900">${part.name}</h4>
                                <p class="text-sm text-gray-600">${part.brand} - ${part.supplier}</p>
                                <p class="text-xs text-gray-500 mt-1">Delivery: ${part.delivery} | Stock: ${part.stock}</p>
                            </div>
                            <div class="text-right">
                                <span id="partPriceView" class="text-xl font-bold text-gray-900">$${currentQuoteData.partPrice.toFixed(2)}</span>
                                <input type="number" id="partPriceEdit" step="0.01" min="0"
                                    value="${currentQuoteData.partPrice.toFixed(2)}"
                                    onchange="recalculateQuote()"
                                    class="hidden text-xl font-bold text-gray-900 border-2 border-orange-500 rounded px-2 py-1 w-32 text-right" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Labor -->
                <div class="border-t pt-4 mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-gray-700 font-semibold">Labor & Installation</span>
                        <div class="text-right">
                            <span id="laborCostView" class="text-lg font-semibold text-gray-900">$${currentQuoteData.laborCost.toFixed(2)}</span>
                            <input type="number" id="laborCostEdit" step="0.01" min="0"
                                value="${currentQuoteData.laborCost.toFixed(2)}"
                                onchange="recalculateQuote()"
                                class="hidden text-lg font-semibold text-gray-900 border-2 border-orange-500 rounded px-2 py-1 w-32 text-right" />
                        </div>
                    </div>
                </div>

                <!-- Discount (only show in edit mode) -->
                <div id="discountSection" class="hidden border-t pt-4 mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-gray-700 font-semibold">Discount</span>
                        <div class="text-right">
                            <input type="number" id="discountEdit" step="0.01" min="0"
                                value="${currentQuoteData.discount.toFixed(2)}"
                                onchange="recalculateQuote()"
                                placeholder="0.00"
                                class="text-lg font-semibold text-gray-900 border-2 border-orange-500 rounded px-2 py-1 w-32 text-right" />
                        </div>
                    </div>
                </div>

                <!-- Subtotal -->
                <div class="border-t pt-4 mb-2">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-gray-700 font-semibold">Subtotal</span>
                        <span class="text-lg font-semibold text-gray-900" id="quoteSubtotal">$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between items-center mb-4">
                        <div class="flex items-center gap-2">
                            <span class="text-gray-600">Tax</span>
                            <span id="taxRateView" class="text-gray-600">(${(currentQuoteData.taxRate * 100).toFixed(0)}%)</span>
                            <input type="number" id="taxRateEdit" step="0.01" min="0" max="0.5"
                                value="${(currentQuoteData.taxRate * 100).toFixed(2)}"
                                onchange="recalculateQuote()"
                                class="hidden text-gray-600 border-2 border-orange-500 rounded px-2 py-1 w-20 text-center" />
                        </div>
                        <span class="text-gray-900" id="quoteTax">$${tax.toFixed(2)}</span>
                    </div>
                </div>

                <!-- Total -->
                <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4">
                    <div class="flex justify-between items-center">
                        <span class="text-xl font-bold">TOTAL ESTIMATE</span>
                        <span class="text-3xl font-bold" id="quoteTotal">$${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <!-- Market Price Comparison -->
            <div class="market-comparison-section bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">📊</span>
                        <h3 class="text-xl font-bold text-gray-900">Market Price Comparison</h3>
                    </div>
                    <button onclick="toggleMarketInfo()" class="market-info-btn text-blue-600 hover:text-blue-800 transition">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </button>
                </div>
                <p class="text-gray-600 text-sm mb-6">Helping you price competitively</p>

                <!-- Price Details -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-xs text-gray-500 font-semibold uppercase mb-1">Your Price</p>
                        <p class="text-2xl font-bold text-orange-600">$${marketComparison.yourPrice.toFixed(2)}</p>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-xs text-gray-500 font-semibold uppercase mb-1">Market Average</p>
                        <p class="text-2xl font-bold text-blue-600">$${marketComparison.marketAverage.toFixed(2)}</p>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-xs text-gray-500 font-semibold uppercase mb-1">Market Range</p>
                        <p class="text-lg font-bold text-gray-700">$${marketComparison.marketLow} - $${marketComparison.marketHigh}</p>
                    </div>
                </div>

                <!-- Price Slider Visualization -->
                <div class="market-price-slider mb-6">
                    <div class="relative bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 h-3 rounded-full">
                        <div class="absolute top-1/2 transform -translate-y-1/2"
                             style="left: ${Math.max(0, Math.min(100, ((marketComparison.yourPrice - marketComparison.marketLow) / (marketComparison.marketHigh - marketComparison.marketLow)) * 100))}%">
                            <div class="relative">
                                <div class="w-6 h-6 bg-gray-900 border-4 border-white rounded-full shadow-lg transform -translate-x-1/2"></div>
                                <div class="absolute top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                    <span class="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">YOU</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-between text-xs text-gray-600 mt-2">
                        <span>Low</span>
                        <span>Average</span>
                        <span>High</span>
                    </div>
                </div>

                <!-- Price Positioning -->
                <div class="market-position-indicator mb-6 p-4 rounded-lg ${
                    marketComparison.positioning.status === 'good' ? 'bg-green-50 border border-green-200' :
                    marketComparison.positioning.status === 'caution' ? 'bg-yellow-50 border border-yellow-200' :
                    marketComparison.positioning.status === 'warning' ? 'bg-orange-50 border border-orange-200' :
                    'bg-red-50 border border-red-200'
                }">
                    <div class="flex items-start gap-3">
                        <span class="text-2xl">${marketComparison.positioning.icon}</span>
                        <div class="flex-1">
                            <p class="font-bold ${
                                marketComparison.positioning.status === 'good' ? 'text-green-800' :
                                marketComparison.positioning.status === 'caution' ? 'text-yellow-800' :
                                marketComparison.positioning.status === 'warning' ? 'text-orange-800' :
                                'text-red-800'
                            }">
                                Your Price: ${Math.abs(marketComparison.percentDifference).toFixed(1)}% ${marketComparison.positioning.label}
                            </p>
                            <p class="text-sm ${
                                marketComparison.positioning.status === 'good' ? 'text-green-700' :
                                marketComparison.positioning.status === 'caution' ? 'text-yellow-700' :
                                marketComparison.positioning.status === 'warning' ? 'text-orange-700' :
                                'text-red-700'
                            } mt-1">
                                ${marketComparison.positioning.message}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Pricing Strategy -->
                <div class="market-strategy bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p class="text-sm text-purple-900 leading-relaxed">
                        ${marketComparison.strategy}
                    </p>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-3 mt-6 no-print">
                    <button onclick="adjustPriceFromMarket('lower')" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                        Adjust Price Lower
                    </button>
                    <button onclick="adjustPriceFromMarket('higher')" class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
                        Adjust Price Higher
                    </button>
                    <button onclick="toggleQuoteEditMode()" class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition">
                        Keep Current Price
                    </button>
                </div>
            </div>

            <!-- Quote Validity -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div class="flex items-center">
                    <svg class="h-5 w-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p class="text-yellow-800"><strong>Quote Valid Until:</strong> ${validUntil.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            <!-- Terms -->
            <div class="text-sm text-gray-600 space-y-1">
                <p><strong>Terms & Conditions:</strong></p>
                <ul class="list-disc pl-5 space-y-1">
                    <li>This quote is an estimate and final costs may vary based on additional findings during service.</li>
                    <li>Parts availability and pricing subject to change.</li>
                    <li>Labor rates are based on standard repair time estimates.</li>
                    <li>Additional diagnostic fees may apply if issue differs from description.</li>
                </ul>
            </div>

            <div class="text-center text-gray-500 text-sm mt-8 pt-6 border-t">
                <p>Thank you for choosing Conneverse!</p>
                <p class="mt-1">Questions? Contact us at (555) 123-4567 or info@conneverse.com</p>
            </div>
        </div>
    `;

    console.log('About to set innerHTML. quoteHTML length:', quoteHTML.length);
    const quoteContentDiv = document.getElementById('quoteContent');
    console.log('quoteContent div exists:', !!quoteContentDiv);
    
    if (quoteContentDiv) {
        quoteContentDiv.innerHTML = quoteHTML;
        console.log('innerHTML set. New content length:', quoteContentDiv.innerHTML.length);
        console.log('quoteContent div display style:', window.getComputedStyle(quoteContentDiv).display);
    } else {
        console.error('quoteContent div not found!');
    }

    // Store quote amount for later
    window.currentQuoteTotal = total;
    console.log('Quote rendering complete. Total:', total);
}

// Toggle Quote Edit Mode
function toggleQuoteEditMode() {
    quoteEditMode = !quoteEditMode;

    const editBtn = document.getElementById('editQuoteBtnText');
    const editNotice = document.getElementById('editModeNotice');
    const discountSection = document.getElementById('discountSection');

    // Toggle view/edit elements
    const viewElements = ['partPriceView', 'laborCostView', 'taxRateView'];
    const editElements = ['partPriceEdit', 'laborCostEdit', 'taxRateEdit'];

    if (quoteEditMode) {
        // Enter edit mode
        editBtn.textContent = 'Done Editing';
        editNotice?.classList.remove('hidden');
        discountSection?.classList.remove('hidden');

        viewElements.forEach(id => document.getElementById(id)?.classList.add('hidden'));
        editElements.forEach(id => document.getElementById(id)?.classList.remove('hidden'));

        document.getElementById('editQuoteBtn').classList.remove('bg-orange-500', 'hover:bg-orange-600');
        document.getElementById('editQuoteBtn').classList.add('bg-green-600', 'hover:bg-green-700');
    } else {
        // Exit edit mode
        editBtn.textContent = 'Edit Quote';
        editNotice?.classList.add('hidden');
        discountSection?.classList.add('hidden');

        viewElements.forEach(id => document.getElementById(id)?.classList.remove('hidden'));
        editElements.forEach(id => document.getElementById(id)?.classList.add('hidden'));

        document.getElementById('editQuoteBtn').classList.remove('bg-green-600', 'hover:bg-green-700');
        document.getElementById('editQuoteBtn').classList.add('bg-orange-500', 'hover:bg-orange-600');

        // Update values from inputs
        recalculateQuote();
    }
}

// Recalculate Quote
function recalculateQuote() {
    // Get values from inputs
    const partPriceInput = document.getElementById('partPriceEdit');
    const laborCostInput = document.getElementById('laborCostEdit');
    const discountInput = document.getElementById('discountEdit');
    const taxRateInput = document.getElementById('taxRateEdit');

    if (partPriceInput) currentQuoteData.partPrice = parseFloat(partPriceInput.value) || 0;
    if (laborCostInput) currentQuoteData.laborCost = parseFloat(laborCostInput.value) || 0;
    if (discountInput) currentQuoteData.discount = parseFloat(discountInput.value) || 0;
    if (taxRateInput) currentQuoteData.taxRate = parseFloat(taxRateInput.value) / 100 || 0.08;

    // Calculate new totals
    const subtotal = currentQuoteData.partPrice + currentQuoteData.laborCost - currentQuoteData.discount;
    const tax = subtotal * currentQuoteData.taxRate;
    const total = subtotal + tax;

    // Update display values
    const partPriceView = document.getElementById('partPriceView');
    const laborCostView = document.getElementById('laborCostView');
    const taxRateView = document.getElementById('taxRateView');
    const quoteSubtotal = document.getElementById('quoteSubtotal');
    const quoteTax = document.getElementById('quoteTax');
    const quoteTotal = document.getElementById('quoteTotal');

    if (partPriceView) partPriceView.textContent = `$${currentQuoteData.partPrice.toFixed(2)}`;
    if (laborCostView) laborCostView.textContent = `$${currentQuoteData.laborCost.toFixed(2)}`;
    if (taxRateView) taxRateView.textContent = `(${(currentQuoteData.taxRate * 100).toFixed(0)}%)`;
    if (quoteSubtotal) quoteSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (quoteTax) quoteTax.textContent = `$${tax.toFixed(2)}`;
    if (quoteTotal) quoteTotal.textContent = `$${total.toFixed(2)}`;

    // Update stored total
    window.currentQuoteTotal = total;
}

// Market Price Comparison Helper Functions
function toggleMarketInfo() {
    alert('Market Price Data\n\n' +
          'Our market price comparison is based on:\n' +
          '• Industry data from common repair services\n' +
          '• Regional pricing averages\n' +
          '• Service type and complexity\n\n' +
          'This helps you price competitively while maintaining healthy margins.');
}

function adjustPriceFromMarket(direction) {
    // Get current total from the page
    const currentTotal = window.currentQuoteTotal || 0;

    if (currentTotal === 0) {
        alert('Unable to adjust price. Please try again.');
        return;
    }

    // Calculate new price
    let adjustmentPercent = direction === 'lower' ? 0.95 : 1.05; // 5% adjustment
    const newTotal = currentTotal * adjustmentPercent;

    // Calculate how much to adjust the part price (keeping labor and tax the same)
    const currentSubtotal = currentQuoteData.partPrice + currentQuoteData.laborCost - currentQuoteData.discount;
    const currentTax = currentSubtotal * currentQuoteData.taxRate;
    const targetSubtotal = newTotal / (1 + currentQuoteData.taxRate);
    const targetPartPrice = targetSubtotal - currentQuoteData.laborCost + currentQuoteData.discount;

    // Update the part price
    currentQuoteData.partPrice = Math.max(0, targetPartPrice);

    // Re-render the quote with new price
    if (currentPart) {
        renderQuote(currentPart);
    } else {
        alert('Unable to adjust price. Please try again.');
    }
}

// Close Quote Modal
function closeQuoteModal() {
    document.getElementById('quoteModal').style.display = 'none';
    // Don't clear currentLead here - we need it for backToParts()
}

// Back to Parts Selection
function backToParts() {
    console.log('backToParts called');
    console.log('currentLead:', currentLead);
    console.log('window.currentParts:', window.currentParts);
    console.log('window.currentLabor:', window.currentLabor);
    
    // Close quote modal
    closeQuoteModal();
    
    // Reopen parts modal with the same lead, skipping the reset
    if (currentLead && window.currentParts && window.currentLabor) {
        console.log('Opening parts modal with skipReset=true');
        // Show the parts that were already searched
        openPartsModal(currentLead.id, true); // Pass true to skip reset
        document.getElementById('searchSection').classList.add('hidden');
        document.getElementById('partsResults').classList.remove('hidden');
        updateProgressIndicator(2);
    } else if (currentLead) {
        console.log('Opening parts modal normally (no parts searched yet)');
        // If no parts were searched yet, open normally
        openPartsModal(currentLead.id);
    } else {
        console.error('currentLead is null! Cannot open parts modal');
    }
}

// Send Quote
function sendQuote() {
    // Add quote communication
    addCommunication(currentLead.id, {
        sender: 'dealer',
        senderName: 'Conneverse Auto Shop',
        message: `We have your quote ready! Please review:\n\n📋 ${currentLead.carYear} ${currentLead.carMake} ${currentLead.carModel}\n💰 Total: $${window.currentQuoteTotal.toFixed(2)} (Parts + Labor)\n\n[View Full Quote]`,
        type: 'quote_sent',
        quoteAmount: window.currentQuoteTotal
    });
    
    // Update progress to step 4 (Send)
    updateProgressIndicator(4);

    // Show brief animation before closing
    setTimeout(() => {
        // Update lead status to "Quote Sent"
        currentLead.status = 'Quote Sent';
        currentLead.quoteAmount = window.currentQuoteTotal;

        // Find and update the lead in the array
        const leadIndex = allLeads.findIndex(l => l.id === currentLead.id);
        if (leadIndex !== -1) {
            allLeads[leadIndex] = currentLead;
        }

        saveLeads();
        renderLeads();
        updateAnalytics();

        // Show success message
        showToast('Quote sent successfully! Customer will receive it via email and SMS.', 'success');

        closeQuoteModal();
    }, 800);
}

// Update Analytics
function updateAnalytics() {
    // Calculate metrics
    const totalLeads = allLeads.length;
    const quoteSentCount = allLeads.filter(l => l.status === 'Quote Sent' || l.status === 'Closed').length;
    const closedCount = allLeads.filter(l => l.status === 'Closed').length;
    const conversionRate = totalLeads > 0 ? ((closedCount / totalLeads) * 100).toFixed(1) : 0;
    const totalRevenue = allLeads
        .filter(l => l.status === 'Closed' && l.quoteAmount)
        .reduce((sum, l) => sum + l.quoteAmount, 0);

    // Update metric displays
    document.getElementById('metric-total-leads').textContent = totalLeads;
    document.getElementById('metric-quotes').textContent = quoteSentCount;
    document.getElementById('metric-conversion').textContent = conversionRate + '%';
    document.getElementById('metric-revenue').textContent = '$' + totalRevenue.toFixed(0);

    // Update charts
    updateLeadsChart();
    updateStatusChart();
    updateRecentSearches();
}

// Update Leads Per Week Chart
function updateLeadsChart() {
    const ctx = document.getElementById('leadsChart');
    if (!ctx) return;

    // Calculate leads per week (last 4 weeks)
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const now = new Date();
    const weekData = [0, 0, 0, 0];

    allLeads.forEach(lead => {
        const leadDate = new Date(lead.timestamp);
        const daysDiff = Math.floor((now - leadDate) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(daysDiff / 7);

        if (weekIndex < 4) {
            weekData[3 - weekIndex]++;
        }
    });

    // Destroy existing chart if it exists
    if (window.leadsChartInstance) {
        window.leadsChartInstance.destroy();
    }

    window.leadsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: weeks,
            datasets: [{
                label: 'New Leads',
                data: weekData,
                backgroundColor: 'rgba(249, 115, 22, 0.8)',
                borderColor: 'rgba(249, 115, 22, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Update Status Distribution Chart
function updateStatusChart() {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;

    // Count leads by status
    const statusCounts = {
        'New': 0,
        'Contacted': 0,
        'Quote Sent': 0,
        'Closed': 0,
        'Lost': 0
    };

    allLeads.forEach(lead => {
        if (statusCounts.hasOwnProperty(lead.status)) {
            statusCounts[lead.status]++;
        }
    });

    // Destroy existing chart if it exists
    if (window.statusChartInstance) {
        window.statusChartInstance.destroy();
    }

    window.statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(251, 191, 36, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update Recent Searches
function updateRecentSearches() {
    const container = document.getElementById('recentSearches');
    if (!container) return;

    // Load searches from localStorage
    const stored = localStorage.getItem('conneverse_searches');
    partsSearchHistory = stored ? JSON.parse(stored) : [];

    if (partsSearchHistory.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No parts searches yet</p>';
        return;
    }

    // Show last 5 searches
    const recentSearches = partsSearchHistory.slice(-5).reverse();

    container.innerHTML = recentSearches.map(search => `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center">
                <div class="bg-auto-orange text-white rounded-lg p-2 mr-4">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                </div>
                <div>
                    <p class="font-semibold text-gray-900">${search.customerName}</p>
                    <p class="text-sm text-gray-600">${search.vehicle} - ${search.partType}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-sm text-gray-500">${formatDate(search.timestamp)}</p>
            </div>
        </div>
    `).join('');
}

// Switch Tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('[id^="tab-"]').forEach(btn => {
        btn.classList.remove('tab-active');
        btn.classList.add('text-gray-600', 'hover:text-gray-900');
    });

    document.getElementById(`tab-${tabName}`).classList.add('tab-active');
    document.getElementById(`tab-${tabName}`).classList.remove('text-gray-600', 'hover:text-gray-900');

    // Update content
    document.querySelectorAll('[id^="content-"]').forEach(content => {
        content.classList.add('hidden');
    });

    document.getElementById(`content-${tabName}`).classList.remove('hidden');

    // If switching to analytics, update the data
    if (tabName === 'analytics') {
        updateAnalytics();
    }
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Toggle Dropdown Menu
function toggleMenu(event, leadId) {
    event.stopPropagation();
    const menu = document.getElementById(`menu-${leadId}`);

    // Close all other menus
    document.querySelectorAll('[id^="menu-"]').forEach(m => {
        if (m.id !== `menu-${leadId}`) {
            m.classList.add('hidden');
        }
    });

    menu.classList.toggle('hidden');
}

// Close Menu
function closeMenu(leadId) {
    const menu = document.getElementById(`menu-${leadId}`);
    if (menu) {
        menu.classList.add('hidden');
    }
}

// Mark Lead as Closed
function markAsClosed(leadId) {
    const lead = allLeads.find(l => l.id === leadId);
    if (lead) {
        lead.status = 'Closed';
        saveLeads();
        renderLeads();
        updateAnalytics();
        showToast('Lead marked as closed!', 'success');
    }
}

// Mark Lead as Lost
function markAsLost(leadId) {
    const lead = allLeads.find(l => l.id === leadId);
    if (lead) {
        lead.status = 'Lost';
        saveLeads();
        renderLeads();
        updateAnalytics();
        showToast('Lead marked as lost', 'info');
    }
}

// Clear All Data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This will reset the app to initial state with sample data.')) {
        localStorage.removeItem('conneverse_leads');
        localStorage.removeItem('conneverse_searches');
        localStorage.removeItem('conneverse_welcome_seen');
        localStorage.removeItem('conneverse_missed_calls');
        location.reload();
    }
}

// ============================================
// MISSED CALLS FUNCTIONALITY
// ============================================

// Load missed calls from localStorage
function loadMissedCalls() {
    const stored = localStorage.getItem('conneverse_missed_calls');
    allMissedCalls = stored ? JSON.parse(stored) : [];
}

// Save missed calls to localStorage
function saveMissedCalls() {
    localStorage.setItem('conneverse_missed_calls', JSON.stringify(allMissedCalls));
}

// Initialize missed calls with sample data
function initializeMissedCalls() {
    const existingCalls = localStorage.getItem('conneverse_missed_calls');

    if (!existingCalls || JSON.parse(existingCalls).length === 0) {
        // First run - load sample data
        localStorage.setItem('conneverse_missed_calls', JSON.stringify(sampleMissedCalls));
        console.log('Sample missed calls loaded');
    }

    // Load calls from localStorage
    loadMissedCalls();

    // Update badge
    updateMissedCallsBadge();
}

// Update missed calls badge count
function updateMissedCallsBadge() {
    const newCallsCount = allMissedCalls.filter(call => call.status === 'new').length;
    const badge = document.getElementById('missedCallsBadge');

    if (badge) {
        badge.textContent = newCallsCount;

        // Hide button if no calls
        const btn = document.getElementById('missedCallsBtn');
        if (newCallsCount === 0 && allMissedCalls.length === 0) {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'flex';
        }
    }
}

// Open Missed Calls Modal
function openMissedCallsModal() {
    const modal = document.getElementById('missedCallsModal');
    modal.style.display = 'block';
    renderMissedCalls();
}

// Close Missed Calls Modal
function closeMissedCallsModal() {
    const modal = document.getElementById('missedCallsModal');
    modal.style.display = 'none';
}

// Render Missed Calls
function renderMissedCalls() {
    const container = document.getElementById('missedCallsContainer');
    const emptyState = document.getElementById('missedCallsEmptyState');

    if (allMissedCalls.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    // Sort by timestamp (newest first)
    const sortedCalls = [...allMissedCalls].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    container.innerHTML = sortedCalls.map(call => {
        const urgencyColors = {
            urgent: 'bg-red-100 text-red-800 border-red-300',
            standard: 'bg-blue-100 text-blue-800 border-blue-300',
            flexible: 'bg-green-100 text-green-800 border-green-300'
        };

        const urgencyColor = urgencyColors[call.aiSummary.urgency] || urgencyColors.standard;
        const isReviewed = call.status === 'reviewed';

        return `
            <div class="bg-white rounded-xl border-2 ${isReviewed ? 'border-gray-200 opacity-75' : 'border-orange-200'} p-6 hover:shadow-lg transition-all duration-200 ${isReviewed ? '' : 'missed-call-card-pulse'}">
                <!-- Header Row -->
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h3 class="text-xl font-bold text-gray-900">${call.aiSummary.customerName}</h3>
                            <span class="status-badge ${isReviewed ? 'bg-gray-200 text-gray-600' : 'bg-orange-500 text-white'}">
                                ${isReviewed ? 'REVIEWED' : 'NEW'}
                            </span>
                        </div>
                        <div class="flex items-center gap-4 text-sm text-gray-600">
                            <span class="flex items-center gap-1">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                ${formatDate(call.timestamp)}
                            </span>
                            <span class="flex items-center gap-1">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                ${call.duration}
                            </span>
                            <a href="tel:${call.phone}" class="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                </svg>
                                ${call.phone}
                            </a>
                        </div>
                    </div>
                </div>

                <!-- AI Summary Section -->
                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 mb-4 border border-blue-200">
                    <div class="flex items-center gap-2 mb-3">
                        <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                        </svg>
                        <h4 class="font-bold text-gray-900">AI Summary</h4>
                    </div>

                    <div class="grid md:grid-cols-2 gap-4 mb-3">
                        <div>
                            <p class="text-xs font-semibold text-gray-600 mb-1">VEHICLE</p>
                            <p class="text-gray-900 font-semibold">${call.aiSummary.vehicle.year} ${call.aiSummary.vehicle.make} ${call.aiSummary.vehicle.model}</p>
                        </div>
                        <div>
                            <p class="text-xs font-semibold text-gray-600 mb-1">URGENCY</p>
                            <span class="inline-block px-3 py-1 rounded-full text-xs font-bold border ${urgencyColor}">
                                ${call.aiSummary.urgency.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div class="mb-3">
                        <p class="text-xs font-semibold text-gray-600 mb-1">SERVICE NEEDED</p>
                        <p class="text-gray-900 font-semibold">${call.aiSummary.serviceNeeded}</p>
                    </div>

                    <div>
                        <p class="text-xs font-semibold text-gray-600 mb-1">NOTES</p>
                        <p class="text-gray-700 text-sm leading-relaxed">${call.aiSummary.notes}</p>
                    </div>
                </div>

                <!-- Transcript Section (Collapsible) -->
                <div class="mb-4">
                    <button onclick="toggleTranscript('${call.id}')" class="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-sm transition">
                        <svg id="transcript-icon-${call.id}" class="h-4 w-4 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                        View Full Transcript
                    </button>

                    <div id="transcript-${call.id}" class="hidden mt-3 bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto border border-gray-200">
                        ${call.transcript.map(msg => `
                            <div class="mb-3 ${msg.speaker === 'AI' ? 'text-left' : 'text-left'}">
                                <span class="inline-block px-2 py-1 rounded text-xs font-bold ${msg.speaker === 'AI' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'} mb-1">
                                    ${msg.speaker}
                                </span>
                                <p class="text-gray-700 text-sm">${msg.text}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Audio Player (Simulated) -->
                <div class="bg-gray-100 rounded-lg p-4 mb-4 flex items-center gap-3">
                    <button class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                    <div class="flex-1">
                        <div class="h-2 bg-gray-300 rounded-full overflow-hidden">
                            <div class="h-full bg-blue-600 w-0"></div>
                        </div>
                    </div>
                    <span class="text-sm text-gray-600 font-semibold">${call.duration}</span>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3">
                    <button onclick="createLeadFromCall('${call.id}')" class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Create Lead
                    </button>
                    ${!isReviewed ? `
                        <button onclick="markCallAsReviewed('${call.id}')" class="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition-all duration-200">
                            Mark as Reviewed
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Toggle Transcript Visibility
function toggleTranscript(callId) {
    const transcript = document.getElementById(`transcript-${callId}`);
    const icon = document.getElementById(`transcript-icon-${callId}`);

    if (transcript.classList.contains('hidden')) {
        transcript.classList.remove('hidden');
        icon.style.transform = 'rotate(90deg)';
    } else {
        transcript.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
    }
}

// Create Lead from Missed Call
function createLeadFromCall(callId) {
    const call = allMissedCalls.find(c => c.id === callId);
    if (!call) return;

    const timestamp = new Date().toISOString();

    // Create new lead object
    const newLead = {
        id: Date.now(),
        customerName: call.aiSummary.customerName,
        phone: call.phone,
        email: '', // Not captured in call
        carMake: call.aiSummary.vehicle.make,
        carModel: call.aiSummary.vehicle.model,
        carYear: call.aiSummary.vehicle.year.toString(),
        issue: call.aiSummary.serviceNeeded + '. ' + call.aiSummary.notes,
        status: 'New',
        timestamp: timestamp,
        quoteAmount: null,
        source: 'AI Voice Agent',
        communications: [
            {
                id: Date.now(),
                timestamp: timestamp,
                sender: 'system',
                senderName: 'AI Voice Agent',
                message: `Lead created from missed call on ${formatDate(call.timestamp)}.\n\nCall Duration: ${call.duration}\nUrgency: ${call.aiSummary.urgency}\n\nOriginal Issue: ${call.aiSummary.serviceNeeded}`,
                type: 'system_note'
            },
            {
                id: Date.now() + 1,
                timestamp: timestamp,
                sender: 'dealer',
                senderName: 'Conneverse Auto Shop',
                message: 'Thanks for calling! We received your message through our AI voice system and are reviewing your request. We\'ll get back to you shortly with a quote.',
                type: 'auto_reply'
            }
        ]
    };

    // Add to leads array
    allLeads.push(newLead);
    saveLeads();

    // Mark call as reviewed
    call.status = 'reviewed';
    saveMissedCalls();

    // Update UI
    renderLeads();
    renderMissedCalls();
    updateAnalytics();
    updateMissedCallsBadge();

    // Show success message
    showToast(`Lead created for ${call.aiSummary.customerName}! The call has been marked as reviewed.`, 'success');

    // Close modal and highlight new lead
    setTimeout(() => {
        closeMissedCallsModal();
        switchTab('leads');
    }, 1500);
}

// Mark Call as Reviewed
function markCallAsReviewed(callId) {
    const call = allMissedCalls.find(c => c.id === callId);
    if (!call) return;

    call.status = 'reviewed';
    saveMissedCalls();

    renderMissedCalls();
    updateMissedCallsBadge();

    showToast('Call marked as reviewed', 'info');
}

// Welcome Tour Functions
function showWelcome() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeWelcome() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.display = 'none';
        localStorage.setItem('conneverse_welcome_seen', 'true');
    }
}

function startTour() {
    closeWelcome();
    localStorage.setItem('conneverse_welcome_seen', 'true');
    initOnboardingTour();
}

// Restart tour from Help button
function restartTour() {
    initOnboardingTour();
}

// Onboarding Tour System
let currentTourStep = 0;
const tourSteps = [
    {
        element: '#tab-leads',
        title: 'Leads Tab',
        description: 'All customer inquiries appear here. New leads are highlighted with a pulsing badge so you never miss an opportunity.',
        position: 'bottom'
    },
    {
        element: '#leadsContainer',
        title: 'Lead Cards',
        description: 'Each card shows customer info, vehicle details, and the issue. Click "Find Parts & Create Quote" to start the AI-powered parts search.',
        position: 'top'
    },
    {
        element: '#tab-analytics',
        title: 'Analytics Dashboard',
        description: 'Track your performance with metrics like total leads, conversion rates, and revenue. Monitor your success in real-time.',
        position: 'bottom'
    },
    {
        element: 'nav',
        title: 'Help Button',
        description: 'Click the Help button anytime to restart this tour. You can also clear all data to reset the app to its initial state.',
        position: 'bottom'
    }
];

function initOnboardingTour() {
    currentTourStep = 0;
    showTourStep(currentTourStep);
}

function showTourStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= tourSteps.length) {
        endTour();
        return;
    }

    const step = tourSteps[stepIndex];
    const element = document.querySelector(step.element);

    if (!element) {
        console.error('Tour element not found:', step.element);
        nextTourStep();
        return;
    }

    // Show overlay
    const overlay = document.getElementById('tourOverlay');
    const spotlight = document.getElementById('tourSpotlight');
    const tooltip = document.getElementById('tourTooltip');

    overlay.classList.add('active');

    // Position spotlight on element
    const rect = element.getBoundingClientRect();
    const padding = 8;

    spotlight.style.top = (rect.top - padding) + 'px';
    spotlight.style.left = (rect.left - padding) + 'px';
    spotlight.style.width = (rect.width + padding * 2) + 'px';
    spotlight.style.height = (rect.height + padding * 2) + 'px';

    // Add highlight class to element
    element.classList.add('tour-highlight');

    // Position tooltip
    positionTooltip(tooltip, rect, step.position);

    // Render tooltip content
    tooltip.innerHTML = `
        <h3>${step.title}</h3>
        <p>${step.description}</p>
        <div class="tour-tooltip-footer">
            <div class="tour-progress">Step ${stepIndex + 1} of ${tourSteps.length}</div>
            <div class="tour-buttons">
                <button onclick="skipTour()" class="tour-btn tour-btn-skip">Skip</button>
                ${stepIndex > 0 ? '<button onclick="prevTourStep()" class="tour-btn tour-btn-prev">Previous</button>' : ''}
                <button onclick="nextTourStep()" class="tour-btn tour-btn-next">
                    ${stepIndex === tourSteps.length - 1 ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    `;

    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function positionTooltip(tooltip, elementRect, position) {
    const padding = 20;
    const tooltipWidth = 400;

    // Reset any previous positioning
    tooltip.style.top = '';
    tooltip.style.bottom = '';
    tooltip.style.left = '';
    tooltip.style.right = '';

    if (position === 'bottom') {
        tooltip.style.top = (elementRect.bottom + padding) + 'px';
        tooltip.style.left = Math.max(padding, Math.min(
            window.innerWidth - tooltipWidth - padding,
            elementRect.left + (elementRect.width / 2) - (tooltipWidth / 2)
        )) + 'px';
    } else if (position === 'top') {
        tooltip.style.bottom = (window.innerHeight - elementRect.top + padding) + 'px';
        tooltip.style.left = Math.max(padding, Math.min(
            window.innerWidth - tooltipWidth - padding,
            elementRect.left + (elementRect.width / 2) - (tooltipWidth / 2)
        )) + 'px';
    } else if (position === 'right') {
        tooltip.style.top = (elementRect.top + (elementRect.height / 2) - 100) + 'px';
        tooltip.style.left = (elementRect.right + padding) + 'px';
    } else if (position === 'left') {
        tooltip.style.top = (elementRect.top + (elementRect.height / 2) - 100) + 'px';
        tooltip.style.right = (window.innerWidth - elementRect.left + padding) + 'px';
    }
}

function nextTourStep() {
    // Remove highlight from current element
    const currentStep = tourSteps[currentTourStep];
    const currentElement = document.querySelector(currentStep.element);
    if (currentElement) {
        currentElement.classList.remove('tour-highlight');
    }

    currentTourStep++;

    if (currentTourStep >= tourSteps.length) {
        endTour();
        showToast('Tour complete! You\'re ready to start using Conneverse.', 'success');
    } else {
        showTourStep(currentTourStep);
    }
}

function prevTourStep() {
    // Remove highlight from current element
    const currentStep = tourSteps[currentTourStep];
    const currentElement = document.querySelector(currentStep.element);
    if (currentElement) {
        currentElement.classList.remove('tour-highlight');
    }

    currentTourStep--;
    showTourStep(currentTourStep);
}

function skipTour() {
    endTour();
    showToast('Tour skipped. Click Help to restart anytime.', 'info');
}

function endTour() {
    // Remove highlight from current element
    if (currentTourStep < tourSteps.length) {
        const currentStep = tourSteps[currentTourStep];
        const currentElement = document.querySelector(currentStep.element);
        if (currentElement) {
            currentElement.classList.remove('tour-highlight');
        }
    }

    // Hide overlay
    const overlay = document.getElementById('tourOverlay');
    overlay.classList.remove('active');

    currentTourStep = 0;
}

// Toast Notification System
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    const toastId = 'toast-' + Date.now();
    toast.id = toastId;

    const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
    const icon = type === 'success'
        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
        : type === 'error'
        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>';

    toast.className = `${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] transform transition-all duration-300 translate-x-full`;
    toast.innerHTML = `
        <svg class="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            ${icon}
        </svg>
        <span class="flex-1 font-medium">${message}</span>
        <button onclick="dismissToast('${toastId}')" class="text-white hover:text-gray-200 transition">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    `;

    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
        dismissToast(toastId);
    }, 4000);
}

function dismissToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}

// Close modals and menus when clicking outside
window.onclick = function(event) {
    const partsModal = document.getElementById('partsModal');
    const quoteModal = document.getElementById('quoteModal');
    const missedCallsModal = document.getElementById('missedCallsModal');

    if (event.target === partsModal) {
        closePartsModal();
    }
    if (event.target === quoteModal) {
        closeQuoteModal();
    }
    if (event.target === missedCallsModal) {
        closeMissedCallsModal();
    }

    // Close dropdown menus when clicking outside
    if (!event.target.closest('[onclick^="toggleMenu"]')) {
        document.querySelectorAll('[id^="menu-"]').forEach(menu => {
            menu.classList.add('hidden');
        });
    }
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
