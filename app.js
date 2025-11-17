// Conneverse - Main Application JavaScript

// Global Variables
let currentLead = null;
let currentPart = null;
let allLeads = [];
let partsSearchHistory = [];
let quoteEditMode = false;
let currentQuoteData = {
    partPrice: 0,
    laborCost: 0,
    taxRate: 0.08,
    discount: 0
};

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
    const existingLeads = localStorage.getItem('conneverse_leads');
    const hasSeenWelcome = localStorage.getItem('conneverse_welcome_seen');

    if (!existingLeads || JSON.parse(existingLeads).length === 0) {
        // First run - load sample data
        localStorage.setItem('conneverse_leads', JSON.stringify(sampleLeads));
        console.log('Sample data loaded');
    }

    // Load leads from localStorage
    loadLeads();

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

    // Reset progress indicator to step 1
    resetProgressIndicator();

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

    // Create new lead object
    const newLead = {
        id: Date.now(),
        customerName: document.getElementById('newCustomerName').value.trim(),
        phone: document.getElementById('newPhone').value.trim(),
        email: document.getElementById('newEmail').value.trim(),
        carMake: document.getElementById('newCarMake').value.trim(),
        carModel: document.getElementById('newCarModel').value.trim(),
        carYear: document.getElementById('newCarYear').value.trim(),
        issue: document.getElementById('newIssue').value.trim(),
        status: 'New',
        timestamp: new Date().toISOString(),
        quoteAmount: null
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
    const parts = window.currentParts;
    const laborCost = window.currentLabor;
    currentPart = parts[partIndex];

    // Generate quote
    generateQuote(currentPart, laborCost);

    // Close parts modal, open quote modal
    closePartsModal();
    document.getElementById('quoteModal').style.display = 'block';

    // Update progress to step 3 (Review Quote)
    // We need to update it on the quote modal, so let's add progress indicator there too
    updateProgressIndicator(3);
}

// Generate Quote
function generateQuote(part, laborCost) {
    // Store quote data for editing
    currentQuoteData = {
        partPrice: part.price,
        laborCost: laborCost,
        taxRate: 0.08,
        discount: 0
    };

    // Reset edit mode
    quoteEditMode = false;

    // Render the quote
    renderQuote(part);
}

// Render Quote HTML
function renderQuote(part) {
    const subtotal = currentQuoteData.partPrice + currentQuoteData.laborCost - currentQuoteData.discount;
    const tax = subtotal * currentQuoteData.taxRate;
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

    document.getElementById('quoteContent').innerHTML = quoteHTML;

    // Store quote amount for later
    window.currentQuoteTotal = total;
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

// Close Quote Modal
function closeQuoteModal() {
    document.getElementById('quoteModal').style.display = 'none';
}

// Send Quote
function sendQuote() {
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
        location.reload();
    }
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

    if (event.target === partsModal) {
        closePartsModal();
    }
    if (event.target === quoteModal) {
        closeQuoteModal();
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
