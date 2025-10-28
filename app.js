// RepairShop AI - Main Application JavaScript

// Global Variables
let currentLead = null;
let currentPart = null;
let allLeads = [];
let partsSearchHistory = [];

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
        quoteAmount: null
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
        quoteAmount: null
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
        quoteAmount: 485.00
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
        quoteAmount: null
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
    const existingLeads = localStorage.getItem('repairshop_leads');

    if (!existingLeads || JSON.parse(existingLeads).length === 0) {
        // First run - load sample data
        localStorage.setItem('repairshop_leads', JSON.stringify(sampleLeads));
        console.log('Sample data loaded');
    }

    // Load leads from localStorage
    loadLeads();

    // Render initial view
    renderLeads();
    updateAnalytics();
}

// Load leads from localStorage
function loadLeads() {
    const stored = localStorage.getItem('repairshop_leads');
    allLeads = stored ? JSON.parse(stored) : [];
}

// Save leads to localStorage
function saveLeads() {
    localStorage.setItem('repairshop_leads', JSON.stringify(allLeads));
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

    if (filteredLeads.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    // Render lead cards
    container.innerHTML = filteredLeads.map(lead => `
        <div class="bg-white rounded-lg shadow-sm p-6 card-hover border border-gray-200">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-bold text-gray-900">${lead.customerName}</h3>
                    <p class="text-gray-600 text-sm mt-1">${formatDate(lead.timestamp)}</p>
                </div>
                <span class="status-badge status-${lead.status.toLowerCase().replace(' ', '-')}">${lead.status}</span>
            </div>

            <div class="space-y-2 mb-4">
                <div class="flex items-center text-gray-600">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span class="text-sm">${lead.phone}</span>
                </div>
                ${lead.email ? `
                <div class="flex items-center text-gray-600">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span class="text-sm">${lead.email}</span>
                </div>
                ` : ''}
            </div>

            <div class="bg-blue-50 rounded-lg p-3 mb-4">
                <div class="flex items-center text-auto-blue mb-2">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    <span class="font-semibold text-sm">${lead.carYear} ${lead.carMake} ${lead.carModel}</span>
                </div>
                <p class="text-gray-700 text-sm">${lead.issue}</p>
            </div>

            ${lead.quoteAmount ? `
            <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div class="flex justify-between items-center">
                    <span class="text-green-700 font-semibold text-sm">Quote Amount:</span>
                    <span class="text-green-900 font-bold text-lg">$${lead.quoteAmount.toFixed(2)}</span>
                </div>
            </div>
            ` : ''}

            <div class="flex gap-2">
                <button onclick="openPartsModal(${lead.id})" class="flex-1 bg-auto-orange text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition">
                    Find Parts
                </button>
                <button onclick="updateLeadStatus(${lead.id})" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                    Mark Contacted
                </button>
                <button onclick="deleteLead(${lead.id})" class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Filter Leads
function filterLeads() {
    renderLeads();
}

// Update Lead Status
function updateLeadStatus(leadId) {
    const lead = allLeads.find(l => l.id === leadId);
    if (lead) {
        if (lead.status === 'New') {
            lead.status = 'Contacted';
        } else if (lead.status === 'Contacted') {
            lead.status = 'Quote Sent';
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
function openPartsModal(leadId) {
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

    // Reset modal state
    document.getElementById('searchSection').classList.remove('hidden');
    document.getElementById('loadingSection').classList.add('hidden');
    document.getElementById('partsResults').classList.add('hidden');

    modal.style.display = 'block';
}

// Close Parts Modal
function closePartsModal() {
    document.getElementById('partsModal').style.display = 'none';
    currentLead = null;
}

// Search for Parts (Simulated AI)
function searchForParts() {
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
        localStorage.setItem('repairshop_searches', JSON.stringify(partsSearchHistory));

        // Hide loading, show results
        document.getElementById('loadingSection').classList.add('hidden');
        document.getElementById('partsResults').classList.remove('hidden');
    }, 2000);
}

// Render Parts Results
function renderParts(parts, laborCost) {
    const container = document.getElementById('partsGrid');

    container.innerHTML = parts.map((part, index) => `
        <div class="bg-white rounded-lg border-2 ${part.bestValue ? 'border-green-500' : 'border-gray-200'} p-6 relative">
            ${part.bestValue ? '<div class="absolute top-0 right-0 m-4"><span class="best-value-badge">BEST VALUE</span></div>' : ''}

            <div class="mb-4">
                <h4 class="text-lg font-bold text-gray-900 mb-1">${part.name}</h4>
                <p class="text-gray-600 text-sm">${part.brand}</p>
            </div>

            <div class="space-y-2 mb-4">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Supplier:</span>
                    <span class="font-semibold text-gray-900">${part.supplier}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Delivery:</span>
                    <span class="font-semibold text-gray-900">${part.delivery}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Stock:</span>
                    <span class="font-semibold ${part.stock === 'In Stock' ? 'text-green-600' : 'text-orange-600'}">${part.stock}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-600">Rating:</span>
                    <div class="flex items-center">
                        <span class="text-yellow-500 mr-1">${'★'.repeat(Math.floor(part.rating))}${'☆'.repeat(5 - Math.floor(part.rating))}</span>
                        <span class="font-semibold text-gray-900">${part.rating}</span>
                    </div>
                </div>
            </div>

            <div class="border-t pt-4 mb-4">
                <div class="flex justify-between items-center">
                    <span class="text-gray-600 font-semibold">Price:</span>
                    <span class="text-2xl font-bold text-auto-orange">$${part.price.toFixed(2)}</span>
                </div>
            </div>

            <button onclick="selectPart(${index})" class="w-full ${part.bestValue ? 'bg-green-600 hover:bg-green-700' : 'bg-auto-blue hover:bg-blue-800'} text-white px-4 py-3 rounded-lg font-semibold transition">
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
    const parts = window.currentParts;
    const laborCost = window.currentLabor;
    currentPart = parts[partIndex];

    // Generate quote
    generateQuote(currentPart, laborCost);

    // Close parts modal, open quote modal
    closePartsModal();
    document.getElementById('quoteModal').style.display = 'block';
}

// Generate Quote
function generateQuote(part, laborCost) {
    const subtotal = part.price + laborCost;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

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
                            <span class="text-2xl font-bold">RepairShop<span class="text-orange-300">AI</span></span>
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
                                <p class="text-xl font-bold text-gray-900">$${part.price.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Labor -->
                <div class="border-t pt-4 mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-gray-700 font-semibold">Labor & Installation</span>
                        <span class="text-lg font-semibold text-gray-900">$${laborCost.toFixed(2)}</span>
                    </div>
                </div>

                <!-- Subtotal -->
                <div class="border-t pt-4 mb-2">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-gray-700 font-semibold">Subtotal</span>
                        <span class="text-lg font-semibold text-gray-900">$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-gray-600">Tax (8%)</span>
                        <span class="text-gray-900">$${tax.toFixed(2)}</span>
                    </div>
                </div>

                <!-- Total -->
                <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4">
                    <div class="flex justify-between items-center">
                        <span class="text-xl font-bold">TOTAL ESTIMATE</span>
                        <span class="text-3xl font-bold">$${total.toFixed(2)}</span>
                    </div>
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
                <p>Thank you for choosing RepairShop AI!</p>
                <p class="mt-1">Questions? Contact us at (555) 123-4567 or info@repairshopaI.com</p>
            </div>
        </div>
    `;

    document.getElementById('quoteContent').innerHTML = quoteHTML;

    // Store quote amount for later
    window.currentQuoteTotal = total;
}

// Close Quote Modal
function closeQuoteModal() {
    document.getElementById('quoteModal').style.display = 'none';
}

// Send Quote
function sendQuote() {
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
    alert('Quote sent successfully! The customer will receive it via email and SMS.');

    closeQuoteModal();
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
    const stored = localStorage.getItem('repairshop_searches');
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

// Clear All Data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This will reset the app to initial state with sample data.')) {
        localStorage.removeItem('repairshop_leads');
        localStorage.removeItem('repairshop_searches');
        location.reload();
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const partsModal = document.getElementById('partsModal');
    const quoteModal = document.getElementById('quoteModal');

    if (event.target === partsModal) {
        closePartsModal();
    }
    if (event.target === quoteModal) {
        closeQuoteModal();
    }
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
