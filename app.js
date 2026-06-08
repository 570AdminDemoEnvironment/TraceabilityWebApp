// TP Aerospace — Circular Traceability POC
// App Controller: View routing, rendering, prompt bar, map

(function () {
    'use strict';

    // === STATE ===
    let currentView = 'dashboard';
    let selectedAsset = null;
    let map = null;
    let dashboardMap = null;
    let markers = [];
    let searchTerm = '';
    let statusFilter = 'all';
    let liveData = null; // Holds live F&O data when connected
    let dataSource = 'mock'; // 'live' or 'mock'

    // === INIT ===
    document.addEventListener('DOMContentLoaded', () => {
        updateDataSourceIndicator('connecting');
        initNavigation();
        initPromptBar();
        setActiveNav('dashboard');
        renderDashboard();

        // Load live data in background — don't block UI
        loadData().then(() => {
            renderCurrentView();
        });

        // Auto-refresh if configured
        if (CONFIG.REFRESH_INTERVAL > 0) {
            setInterval(async () => { await loadData(); renderCurrentView(); }, CONFIG.REFRESH_INTERVAL);
        }
    });

    // === DATA LAYER ===
    async function loadData() {
        if (CONFIG.FORCE_MOCK || !CONFIG.POWER_AUTOMATE_URL) {
            dataSource = 'mock';
            updateDataSourceIndicator('mock');
            return;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(CONFIG.POWER_AUTOMATE_URL, {
                method: 'POST',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const raw = await response.json();
            liveData = mapFnOData(raw);
            dataSource = 'live';
            updateDataSourceIndicator('live');
        } catch (err) {
            console.warn('Power Automate connection failed, falling back to mock:', err.message);
            dataSource = 'mock';
            updateDataSourceIndicator('mock');
        }
    }

    // Map F&O data entities to our app's structure
    function mapFnOData(raw) {
        const assets = (raw.assets || []).map(a => ({
            id: a.MaintenanceAssetId,
            serialNumber: extractSerial(a.Name) || a.MaintenanceAssetId,
            partNumber: a.MaintenanceAssetId,
            type: guessAssetType(a.Name),
            description: a.Name,
            aircraft: extractAircraft(a.Name),
            status: mapLifecycleState(a.MaintenanceAssetLifecycleStateId),
            location: mapLocation(a.FunctionalLocationId),
            assignedAirline: a.OwnerCustomerAccountNumber || null,
            program: a.MaintenanceAssetTypeId || null,
            certifiedLife: 1500,
            currentLandings: 0,
            lastOverhaul: a.ActiveFrom !== '1900-01-01T12:00:00Z' ? a.ActiveFrom : null,
            nextOverhaulDue: null,
            lifecycle: [],
            _raw: a
        }));

        const workOrders = (raw.workOrders || []).map(wo => ({
            id: wo.WorkOrderId,
            description: wo.Description,
            type: wo.WorkOrderTypeId,
            state: wo.WorkOrderLifecycleStateId,
            startDate: wo.ExpectedStart || wo.ScheduledStart,
            asset: wo.MaintenanceWorkOrderDescription || '',
            _raw: wo
        }));

        const customers = (raw.customers || []).map(c => ({
            id: c.CustomerAccount,
            name: c.OrganizationName || c.Name,
            group: c.CustomerGroupId,
            _raw: c
        }));

        return { assets, workOrders, customers };
    }

    function extractSerial(name) {
        const match = name && name.match(/\(SN-[\w]+\)/);
        return match ? match[0].replace(/[()]/g, '') : null;
    }

    function extractAircraft(name) {
        if (!name) return '';
        const match = name.match(/A320|A350|B737|B777|B787/);
        return match ? match[0] : '';
    }

    function guessAssetType(name) {
        if (!name) return ASSET_TYPES.WHEEL_ASSY;
        const n = name.toLowerCase();
        if (n.includes('brake')) return ASSET_TYPES.BRAKE_UNIT;
        if (n.includes('tyre') || n.includes('tire')) return ASSET_TYPES.TYRE;
        return ASSET_TYPES.WHEEL_ASSY;
    }

    function mapLifecycleState(state) {
        if (!state) return STATUSES.AVAILABLE;
        const s = state.toLowerCase();
        if (s === 'active' || s === 'inservice') return STATUSES.IN_SERVICE;
        if (s === 'intransit') return STATUSES.IN_TRANSIT;
        if (s === 'undermro' || s === 'inmaintenance') return STATUSES.UNDER_MRO;
        if (s === 'scrapped' || s === 'ended') return STATUSES.OVERDUE;
        return STATUSES.AVAILABLE;
    }

    function mapLocation(funcLoc) {
        if (!funcLoc) return LOCATIONS.CPH;
        const loc = funcLoc.toLowerCase();
        if (loc.includes('pp-02') || loc.includes('office')) return LOCATIONS.CPH;
        if (loc.includes('pp-04') || loc.includes('cm')) return LOCATIONS.DUB;
        if (loc.includes('pp-05') || loc.includes('def')) return LOCATIONS.SIN;
        if (loc.includes('01')) return LOCATIONS.FRA;
        return LOCATIONS.CPH;
    }

    // Get current data (live or mock)
    function getAssets() {
        if (liveData) {
            return liveData.assets.filter(a => a.description && a.description.match(/SN-|Wheel|Brake|Tyre/i));
        }
        return [];
    }

    function getWorkOrders() {
        if (liveData) {
            return liveData.workOrders.filter(wo => wo.description && wo.description.match(/wheel|brake|tyre|SN-|AOG|overhaul/i));
        }
        return [];
    }

    function getCustomers() {
        if (liveData) return liveData.customers;
        return [];
    }

    // Resolve airline name from customer account number or mock data
    function resolveAirline(ref) {
        if (!ref) return 'Pool Stock';
        if (typeof ref === 'object' && ref.name) return ref.name;
        // Look up in live customers
        if (dataSource === 'live' && liveData) {
            const customer = liveData.customers.find(c => c.id === ref);
            return customer ? customer.name : 'Pool Stock';
        }
        return AIRLINES[ref] ? AIRLINES[ref].name : 'Pool Stock';
    }

    // Build timeline for an asset from real work orders or mock lifecycle
    function getAssetTimeline(asset) {
        if (dataSource === 'live' && liveData) {
            // Match work orders that reference this asset's serial number or ID
            const serial = asset.serialNumber || '';
            const id = asset.id || '';
            const relatedWOs = getWorkOrders().filter(wo =>
                wo.description && (wo.description.includes(serial) || wo.description.includes(id))
            );

            if (relatedWOs.length > 0) {
                return relatedWOs.map(wo => ({
                    date: wo.startDate ? new Date(wo.startDate).toLocaleDateString() : 'Pending',
                    event: `${wo.id} — ${wo.state}`,
                    detail: wo.description,
                    location: asset.location ? asset.location.name : 'TP Aerospace'
                }));
            }

            // No matching work orders — show asset registration info
            return [{
                date: asset.lastOverhaul ? new Date(asset.lastOverhaul).toLocaleDateString() : 'Active',
                event: 'Asset Registered in D365',
                detail: `${asset.description} — Status: ${asset.status.label}`,
                location: asset.location ? asset.location.name : 'TP Aerospace'
            }];
        }

        // Mock mode — use lifecycle array
        return (asset.lifecycle || []).map(event => ({
            date: formatDate(event.date),
            event: event.event,
            detail: event.detail,
            location: event.location
        }));
    }

    // Build chain of custody for an asset
    function buildCustodyChain(asset, timeline) {
        const chain = [];

        // Commissioning
        chain.push({
            icon: '🏭',
            action: 'Manufactured & Commissioned',
            who: 'OEM → TP Aerospace (received into pool)',
            date: asset.lastOverhaul ? new Date(asset.lastOverhaul).toLocaleDateString() : 'On record'
        });

        // Deployment to airline
        const airlineName = resolveAirline(asset.assignedAirline);
        if (airlineName !== 'Pool Stock') {
            chain.push({
                icon: '✈️',
                action: 'Deployed to Airline',
                who: `TP Aerospace → ${airlineName} (possession only)`,
                date: 'Active'
            });
        }

        // Work orders as custody events
        const relatedWOs = getWorkOrders().filter(wo =>
            wo.description && (wo.description.includes(asset.serialNumber) || wo.description.includes(asset.id))
        );
        relatedWOs.forEach(wo => {
            const isReturn = wo.description.match(/return|receive|back/i);
            const isMRO = wo.description.match(/overhaul|repair|inspection|MRO/i);
            chain.push({
                icon: isMRO ? '🔧' : isReturn ? '🔙' : '📋',
                action: isMRO ? 'Sent to MRO' : isReturn ? 'Returned from Airline' : wo.state,
                who: `${wo.id}: ${wo.description}`,
                date: wo.startDate && wo.startDate !== '1900-01-01T00:00:00Z' ? new Date(wo.startDate).toLocaleDateString() : wo.state
            });
        });

        // Current state
        chain.push({
            icon: asset.status.icon,
            action: `Current: ${asset.status.label}`,
            who: `${asset.location.name}, ${asset.location.country}`,
            date: 'Now'
        });

        return chain;
    }

    function updateDataSourceIndicator(state) {
        const el = document.getElementById('data-source-indicator');
        if (!el) return;
        if (state === 'live') {
            el.innerHTML = '<span class="pulse"></span><span>Live — D365 Finance & Operations</span>';
            el.classList.add('live');
            el.classList.remove('mock');
        } else if (state === 'mock') {
            el.innerHTML = '<span class="pulse mock-pulse"></span><span>Demo Mode — Mock Data</span>';
            el.classList.remove('live');
            el.classList.add('mock');
        } else {
            el.innerHTML = '<span class="pulse connecting-pulse"></span><span>Connecting to D365...</span>';
        }
    }

    function renderCurrentView() {
        switch (currentView) {
            case 'dashboard': renderDashboard(); break;
            case 'registry': renderRegistry(); break;
            case 'map': renderMap(); break;
            case 'exchange': renderExchange(); break;
            case 'detail': renderDetail(); break;
        }
    }

    // Compute KPIs from any asset array (live or mock)
    function computeKPIs(assets) {
        const total = assets.length;
        const inService = assets.filter(a => a.status && a.status.id === 'in-service').length;
        const underMRO = assets.filter(a => a.status && a.status.id === 'under-mro').length;
        const inTransit = assets.filter(a => a.status && a.status.id === 'in-transit').length;
        const available = assets.filter(a => a.status && a.status.id === 'available').length;
        const overdue = assets.filter(a => a.status && a.status.id === 'overdue').length;
        const maintenanceDue = assets.filter(a => {
            if (!a.nextOverhaulDue) return false;
            const due = new Date(a.nextOverhaulDue);
            const now = new Date();
            const diff = (due - now) / (1000 * 60 * 60 * 24);
            return diff <= 30 && diff > 0;
        }).length;
        return { total, inService, underMRO, inTransit, available, overdue, maintenanceDue };
    }

    // === NAVIGATION ===
    function initNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                switchView(view);
            });
        });
    }

    function switchView(view) {
        currentView = view;
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const target = document.getElementById(`view-${view}`);
        if (target) target.classList.add('active');
        setActiveNav(view);
        updateHeaderTitle(view);

        // Render on switch
        switch (view) {
            case 'dashboard': renderDashboard(); break;
            case 'registry': renderRegistry(); break;
            case 'map': renderMap(); break;
            case 'exchange': renderExchange(); break;
            case 'detail': renderDetail(); break;
        }
    }

    function setActiveNav(view) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });
    }

    function updateHeaderTitle(view) {
        const titles = {
            dashboard: 'Dashboard',
            registry: 'Asset Registry',
            map: 'Global Fleet Map',
            exchange: 'Exchange Flow',
            detail: 'Asset Detail'
        };
        document.getElementById('header-title').textContent = titles[view] || 'Dashboard';
    }

    // === DASHBOARD ===
    function renderDashboard() {
        const assets = getAssets();
        const kpis = computeKPIs(assets);
        const container = document.getElementById('dashboard-kpis');
        container.innerHTML = `
            <div class="kpi-card">
                <div class="icon-bg">🛞</div>
                <div class="value">${kpis.total}</div>
                <div class="label">Total Fleet</div>
            </div>
            <div class="kpi-card">
                <div class="icon-bg">✈️</div>
                <div class="value">${kpis.inService}</div>
                <div class="label">In Service</div>
            </div>
            <div class="kpi-card">
                <div class="icon-bg">🔧</div>
                <div class="value">${kpis.underMRO}</div>
                <div class="label">Under MRO</div>
            </div>
            <div class="kpi-card">
                <div class="icon-bg">🚚</div>
                <div class="value">${kpis.inTransit}</div>
                <div class="label">In Transit</div>
            </div>
            <div class="kpi-card warning">
                <div class="icon-bg">📅</div>
                <div class="value">${kpis.maintenanceDue}</div>
                <div class="label">Maintenance Due (30d)</div>
            </div>
            <div class="kpi-card alert">
                <div class="icon-bg">⚠️</div>
                <div class="value">${kpis.overdue}</div>
                <div class="label">Overdue Returns</div>
            </div>
        `;

        // Activity feed — use real work orders
        const feed = document.getElementById('activity-feed');
        const workOrders = getWorkOrders().slice(0, 8);
        if (workOrders.length > 0) {
            feed.innerHTML = workOrders.map(wo => {
                const type = wo.state === 'InProgress' ? 'alert' : wo.state === 'New' ? 'warning' : 'info';
                const stateIcon = wo.state === 'InProgress' ? '🔧' : wo.state === 'New' ? '📋' : wo.state === 'Completed' ? '✅' : '📅';
                return `
                <div class="activity-item">
                    <div class="activity-dot ${type}"></div>
                    <div class="activity-content">
                        <div class="event">${stateIcon} ${wo.id} — ${wo.state}</div>
                        <div class="detail">${wo.description}</div>
                        <div class="time">Live from D365 F&O</div>
                    </div>
                </div>
                `;
            }).join('');
        } else {
            feed.innerHTML = '<div style="padding: 20px; color: var(--text-muted); text-align: center;">Connecting to D365 F&O...</div>';
        }

        // Dashboard mini map
        setTimeout(() => initDashboardMap(), 100);
    }

    function initDashboardMap() {
        const el = document.getElementById('dashboard-map');
        if (!el) return;
        if (dashboardMap) { dashboardMap.remove(); dashboardMap = null; }

        dashboardMap = L.map('dashboard-map', {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false
        }).setView([30, 20], 1.5);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(dashboardMap);

        // Add simple dots for each location
        Object.values(LOCATIONS).forEach(loc => {
            L.circleMarker([loc.lat, loc.lng], {
                radius: 6,
                fillColor: '#00A651',
                fillOpacity: 0.8,
                color: '#00A651',
                weight: 1
            }).addTo(dashboardMap);
        });
    }

    // === REGISTRY ===
    function renderRegistry() {
        const container = document.getElementById('registry-table-body');
        let filtered = getAssets();

        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            filtered = filtered.filter(a =>
                a.serialNumber.toLowerCase().includes(s) ||
                a.partNumber.toLowerCase().includes(s) ||
                a.description.toLowerCase().includes(s) ||
                (a.assignedAirline && a.assignedAirline.name.toLowerCase().includes(s)) ||
                a.location.name.toLowerCase().includes(s)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(a => a.status.id === statusFilter);
        }

        container.innerHTML = filtered.map(asset => {
            const lifePercent = asset.certifiedLife > 0 ? (asset.currentLandings / asset.certifiedLife) * 100 : 0;
            const lifeClass = lifePercent > 85 ? 'critical' : lifePercent > 65 ? 'caution' : 'healthy';
            const airline = asset.assignedAirline ? asset.assignedAirline.name : '—';
            const remaining = asset.certifiedLife - asset.currentLandings;

            return `
                <tr onclick="app.openDetail('${asset.id}')">
                    <td><strong>${asset.serialNumber}</strong></td>
                    <td class="text-muted">${asset.partNumber}</td>
                    <td>${asset.type.label}</td>
                    <td><span class="status-badge ${asset.status.id}">${asset.status.icon} ${asset.status.label}</span></td>
                    <td>${airline}</td>
                    <td>${asset.location.name}</td>
                    <td>
                        <div class="life-bar"><div class="life-bar-fill ${lifeClass}" style="width: ${lifePercent}%"></div></div>
                        <span class="text-sm text-muted">${remaining} left</span>
                    </td>
                </tr>
            `;
        }).join('');

        // Count badge
        document.getElementById('registry-count').textContent = `${filtered.length} assets`;
    }

    // === MAP ===
    function renderMap() {
        setTimeout(() => initFullMap(), 100);
    }

    function initFullMap() {
        const el = document.getElementById('asset-map');
        if (!el) return;
        if (map) { map.remove(); map = null; }

        map = L.map('asset-map', {
            zoomControl: true,
            attributionControl: false
        }).setView([25, 30], 2.2);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(map);

        markers = [];

        getAssets().forEach(asset => {
            const color = asset.status.color;
            const marker = L.circleMarker([asset.location.lat, asset.location.lng], {
                radius: 8,
                fillColor: color,
                fillOpacity: 0.9,
                color: color,
                weight: 2
            }).addTo(map);

            const airline = resolveAirline(asset.assignedAirline);
            marker.bindPopup(`
                <div style="font-family: Inter, sans-serif; min-width: 200px;">
                    <strong style="font-size: 14px;">${asset.serialNumber}</strong><br>
                    <span style="color: #666;">${asset.description}</span><br><br>
                    <strong>Status:</strong> ${asset.status.label}<br>
                    <strong>Holder:</strong> ${airline}<br>
                    <strong>Location:</strong> ${asset.location.name}<br>
                    <strong>Landings:</strong> ${asset.currentLandings} / ${asset.certifiedLife}<br><br>
                    <a href="#" onclick="app.openDetail('${asset.id}'); return false;" style="color: #00A651;">View Details →</a>
                </div>
            `);

            markers.push({ marker, asset });
        });
    }

    // === ASSET DETAIL ===
    function openDetail(assetId) {
        selectedAsset = getAssets().find(a => a.id === assetId);
        if (!selectedAsset) return;
        switchView('detail');
    }

    function renderDetail() {
        if (!selectedAsset) return;
        const a = selectedAsset;
        const container = document.getElementById('detail-content');
        const lifePercent = a.certifiedLife > 0 ? (a.currentLandings / a.certifiedLife) * 100 : 0;
        const lifeClass = lifePercent > 85 ? 'critical' : lifePercent > 65 ? 'caution' : 'healthy';
        const airline = resolveAirline(a.assignedAirline);
        const program = a.program || '—';

        const timeline = getAssetTimeline(a);
        const overhaulCount = timeline.filter(e => e.event && e.event.match(/overhaul|MRO|repair|inspection/i)).length;
        const serviceYears = a.lastOverhaul ? Math.max(1, new Date().getFullYear() - new Date(a.lastOverhaul).getFullYear()) : 3;
        const circularScore = Math.min(100, (overhaulCount + 1) * 25); // More overhauls = more circular

        container.innerHTML = `
            <div class="detail-header">
                <div>
                    <div class="detail-title">${a.serialNumber} — ${a.description}</div>
                    <div class="detail-subtitle">${a.partNumber} · ${a.aircraft}</div>
                </div>
                <button class="detail-back" onclick="app.switchView('registry')">← Back to Registry</button>
            </div>

            <div class="ownership-banner">
                <div class="icon">🏢</div>
                <div class="text">
                    <strong>Ownership: TP Aerospace</strong> — Possession transferred to ${airline}. 
                    Asset remains on TP Aerospace balance sheet throughout lifecycle.
                </div>
            </div>

            <!-- CIRCULAR ECONOMY STATS -->
            <div class="card" style="margin-bottom: 20px; background: linear-gradient(135deg, var(--bg-card), rgba(0,166,81,0.05));">
                <div class="card-header">
                    <h3>♻️ Circular Economy Performance</h3>
                </div>
                <div class="card-body">
                    <div class="circular-stats">
                        <div class="circular-stat">
                            <div class="circular-stat-value">${overhaulCount + 1}</div>
                            <div class="circular-stat-label">Service Cycles</div>
                            <div class="circular-stat-detail">Times refurbished & returned to service</div>
                        </div>
                        <div class="circular-stat">
                            <div class="circular-stat-value">${serviceYears}yr</div>
                            <div class="circular-stat-label">Active Life</div>
                            <div class="circular-stat-detail">In circulation since commissioning</div>
                        </div>
                        <div class="circular-stat">
                            <div class="circular-stat-value">${circularScore}%</div>
                            <div class="circular-stat-label">Circularity Score</div>
                            <div class="circular-stat-detail">Reuse vs. replacement index</div>
                        </div>
                        <div class="circular-stat">
                            <div class="circular-stat-value">~${(overhaulCount + 1) * 340}kg</div>
                            <div class="circular-stat-label">CO₂ Avoided</div>
                            <div class="circular-stat-detail">vs. manufacturing new per cycle</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="detail-grid">
                <div class="detail-stat">
                    <div class="label">Status</div>
                    <div class="value"><span class="status-badge ${a.status.id}">${a.status.icon} ${a.status.label}</span></div>
                </div>
                <div class="detail-stat">
                    <div class="label">Current Location</div>
                    <div class="value">📍 ${a.location.name}, ${a.location.country}</div>
                </div>
                <div class="detail-stat">
                    <div class="label">Assigned Airline</div>
                    <div class="value">${airline}</div>
                </div>
                <div class="detail-stat">
                    <div class="label">Program</div>
                    <div class="value">${program}</div>
                </div>
                <div class="detail-stat">
                    <div class="label">Cycle Life</div>
                    <div class="value">
                        <div class="life-bar" style="width: 120px; height: 8px;">
                            <div class="life-bar-fill ${lifeClass}" style="width: ${lifePercent}%"></div>
                        </div>
                        ${a.currentLandings} / ${a.certifiedLife} landings (${Math.round(lifePercent)}% used)
                    </div>
                </div>
                <div class="detail-stat">
                    <div class="label">Next Overhaul</div>
                    <div class="value">${a.nextOverhaulDue || 'Not scheduled'}</div>
                </div>
            </div>

            <!-- CHAIN OF CUSTODY -->
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header">
                    <h3>🔗 Chain of Custody — Full Traceability</h3>
                </div>
                <div class="card-body">
                    <div class="custody-chain">
                        ${buildCustodyChain(a, timeline).map(step => `
                            <div class="custody-step">
                                <div class="custody-icon">${step.icon}</div>
                                <div class="custody-content">
                                    <div class="custody-action">${step.action}</div>
                                    <div class="custody-who">${step.who}</div>
                                    <div class="custody-date">${step.date}</div>
                                </div>
                                <div class="custody-owner">Owner: TP Aerospace ✓</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>🔄 Lifecycle Timeline — Circular Journey</h3>
                </div>
                <div class="card-body">
                    <div class="timeline">
                        ${timeline.map((event, i, arr) => `
                            <div class="timeline-item ${i === arr.length - 1 ? 'current' : ''}">
                                <div class="timeline-dot"></div>
                                <div class="timeline-date">${event.date}</div>
                                <div class="timeline-event">${event.event}</div>
                                <div class="timeline-detail">${event.detail}</div>
                                <div class="timeline-location">📍 ${event.location}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // === EXCHANGE FLOW ===
    let exchangeStep = 0;

    function renderExchange() {
        const container = document.getElementById('exchange-content');
        // Use real work order if available
        const aogOrder = getWorkOrders().find(wo => wo.description && wo.description.match(/AOG/i));
        const steps = [
            { icon: '📞', label: 'Request Received', detail: aogOrder ? aogOrder.description : 'SAS reports worn wheel at CPH Gate 12 — AOG situation' },
            { icon: '📦', label: 'Dispatch Serviceable', detail: 'SN-8891 dispatched from CPH pool stock to Gate 12' },
            { icon: '🔙', label: 'Receive Worn Unit', detail: 'SN-7742 received back — tread below minimum spec' },
            { icon: '🔧', label: 'Route to MRO', detail: 'SN-7742 shipped to Valby MRO — tyre replacement scheduled' },
            { icon: '✅', label: 'Return to Pool', detail: 'After overhaul, SN-7742 re-certified and returns to available pool' }
        ];

        container.innerHTML = `
            <div class="ownership-banner">
                <div class="icon">🔄</div>
                <div class="text">
                    <strong>Circular Exchange Model</strong> — Ownership remains with TP Aerospace at every step. 
                    Only physical possession transfers. This is the core of the circular economy.
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Exchange Event: SAS AOG — Copenhagen Gate 12</h3>
                    <button class="filter-btn" onclick="app.animateExchange()">▶ Animate Flow</button>
                </div>
                <div class="card-body">
                    <div class="exchange-flow" id="exchange-steps">
                        ${steps.map((step, i) => `
                            <div class="exchange-step ${i < exchangeStep ? 'complete' : ''} ${i === exchangeStep ? 'active' : ''}" id="step-${i}">
                                <div class="step-circle">${i < exchangeStep ? '✓' : step.icon}</div>
                                <div class="step-label">${step.label}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="exchange-detail-card" id="exchange-details">
                <h4>${steps[exchangeStep].icon} ${steps[exchangeStep].label}</h4>
                <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">${steps[exchangeStep].detail}</p>
                <div class="exchange-detail-row">
                    <span class="label">F&O Transaction</span>
                    <span class="value">${getExchangeTransaction(exchangeStep)}</span>
                </div>
                <div class="exchange-detail-row">
                    <span class="label">Asset</span>
                    <span class="value">${exchangeStep < 2 ? 'SN-8891 (serviceable)' : 'SN-7742 (worn)'}</span>
                </div>
                <div class="exchange-detail-row">
                    <span class="label">Location</span>
                    <span class="value">${getExchangeLocation(exchangeStep)}</span>
                </div>
                <div class="exchange-detail-row">
                    <span class="label">Ownership</span>
                    <span class="value text-green">TP Aerospace (unchanged)</span>
                </div>
            </div>
        `;
    }

    function getExchangeTransaction(step) {
        const wos = getWorkOrders();
        const aog = wos.find(wo => wo.description && wo.description.match(/AOG/i));
        const overhaul = wos.find(wo => wo.description && wo.description.match(/overhaul/i));
        const transactions = [
            aog ? `Work Order ${aog.id} (${aog.state})` : 'Service Request SR-2026-0847',
            'Transfer Order TO-2026-0848 (Dispatch)',
            'Return Order RO-2026-0849',
            overhaul ? `Work Order ${overhaul.id} (MRO)` : 'Work Order WO-2026-1205 (MRO)',
            'Asset Recertification — Return to Pool'
        ];
        return transactions[step];
    }

    function getExchangeLocation(step) {
        const locations = [
            'Copenhagen CPH — Gate 12',
            'CPH Pool Stock → Gate 12',
            'Copenhagen CPH — Receiving',
            'Valby MRO Facility',
            'Available Pool — CPH/DUB/FRA'
        ];
        return locations[step];
    }

    function animateExchange() {
        exchangeStep = 0;
        const animate = () => {
            if (exchangeStep > 4) { exchangeStep = 0; return; }
            renderExchange();
            exchangeStep++;
            if (exchangeStep <= 4) setTimeout(animate, 1500);
        };
        animate();
    }

    // === PROMPT BAR ===
    function initPromptBar() {
        const input = document.getElementById('prompt-input');
        const sendBtn = document.getElementById('prompt-send');
        if (!input || !sendBtn) return; // Agent-only mode, no prompt bar

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handlePrompt();
        });
        sendBtn.addEventListener('click', handlePrompt);
    }

    function handlePrompt() {
        const input = document.getElementById('prompt-input');
        const query = input.value.trim();
        if (!query) return;
        const q = query.toLowerCase();
        input.value = '';

        // === OPTION A: Query live data ===

        // Status of a specific asset
        const snMatch = q.match(/sn-\d+/);
        if (snMatch) {
            const serial = snMatch[0].toUpperCase();
            const asset = getAssets().find(a => a.serialNumber === serial || a.description.includes(serial));
            if (asset) {
                const relatedWOs = getWorkOrders().filter(wo => wo.description && wo.description.includes(serial));
                const actions = [
                    { icon: '🛞', text: `<strong>${asset.serialNumber}</strong> — ${asset.description}` },
                    { icon: '📍', text: `Location: ${asset.location.name}, ${asset.location.country}` },
                    { icon: '🔵', text: `Status: ${asset.status.label} | Lifecycle: ${asset.status.id}` },
                    { icon: '🏢', text: `Airline: ${resolveAirline(asset.assignedAirline)} | Type: ${asset.program || asset.type}` }
                ];
                if (relatedWOs.length > 0) {
                    relatedWOs.forEach(wo => {
                        actions.push({ icon: '🔧', text: `${wo.id}: ${wo.description} [${wo.state}]` });
                    });
                }
                showPromptResponse({ title: `Asset: ${serial}`, actions, badge: 'Live from D365 F&O' });
                return;
            }
        }

        // Overdue / scrapped assets
        if (q.includes('overdue') || q.includes('scrapped') || q.includes('expired')) {
            const overdue = getAssets().filter(a => a.status.id === 'overdue' || a.status.id === 'scrapped');
            const actions = overdue.length > 0
                ? overdue.map(a => ({ icon: '⚠️', text: `${a.serialNumber} — ${a.description} [${a.status.label}]` }))
                : [{ icon: '✅', text: 'No overdue or scrapped assets in the current fleet.' }];
            showPromptResponse({ title: `Overdue / Scrapped Assets (${overdue.length})`, actions, badge: 'Live from D365 F&O' });
            return;
        }

        // MRO / maintenance assets
        if (q.includes('mro') || q.includes('maintenance') || q.includes('repair')) {
            const mro = getAssets().filter(a => a.status.id === 'under-mro');
            const wos = getWorkOrders().filter(wo => wo.state === 'InProgress');
            const actions = [];
            if (mro.length > 0) mro.forEach(a => actions.push({ icon: '🔧', text: `${a.serialNumber} — ${a.description}` }));
            if (wos.length > 0) wos.forEach(wo => actions.push({ icon: '📋', text: `${wo.id}: ${wo.description} [In Progress]` }));
            if (actions.length === 0) actions.push({ icon: '✅', text: 'No assets currently under MRO.' });
            showPromptResponse({ title: `MRO Status (${mro.length} assets, ${wos.length} active WOs)`, actions, badge: 'Live from D365 F&O' });
            return;
        }

        // All work orders
        if (q.includes('work order') || q.includes('wo-') || q.includes('open orders')) {
            const wos = getWorkOrders();
            const actions = wos.map(wo => ({ icon: wo.state === 'InProgress' ? '🔧' : wo.state === 'New' ? '📋' : '✅', text: `${wo.id}: ${wo.description} [${wo.state}]` }));
            if (actions.length === 0) actions.push({ icon: 'ℹ️', text: 'No matching work orders found.' });
            showPromptResponse({ title: `Work Orders (${wos.length})`, actions, badge: 'Live from D365 F&O' });
            return;
        }

        // Fleet summary / how many / total
        if (q.includes('fleet') || q.includes('total') || q.includes('how many') || q.includes('summary')) {
            const assets = getAssets();
            const kpis = computeKPIs(assets);
            const actions = [
                { icon: '🛞', text: `Total fleet: ${kpis.total} tracked assets` },
                { icon: '✈️', text: `In Service: ${kpis.inService}` },
                { icon: '🔧', text: `Under MRO: ${kpis.underMRO}` },
                { icon: '🚚', text: `In Transit: ${kpis.inTransit}` },
                { icon: '⚠️', text: `Overdue: ${kpis.overdue}` },
                { icon: '👥', text: `Airlines served: ${getCustomers().filter(c => c.name).length}` }
            ];
            showPromptResponse({ title: 'Fleet Summary', actions, badge: 'Live from D365 F&O' });
            return;
        }

        // Airlines / customers
        if (q.includes('airline') || q.includes('customer') || q.includes('sas') || q.includes('ryanair') || q.includes('emirates') || q.includes('lufthansa')) {
            const customers = getCustomers().filter(c => c.name && c.name.match(/SAS|Ryanair|Emirates|Lufthansa|Singapore|Qantas/i));
            const actions = customers.map(c => ({ icon: '✈️', text: `${c.id} — ${c.name}` }));
            if (actions.length === 0) actions.push({ icon: 'ℹ️', text: 'No matching airline customers found.' });
            showPromptResponse({ title: `Airline Customers (${customers.length})`, actions, badge: 'Live from D365 F&O' });
            return;
        }

        // === Create work order (read-only preview) ===
        if (q.includes('create') && (q.includes('work order') || q.includes('wo'))) {
            const targetSN = q.match(/sn-\d+/i);
            const serial = targetSN ? targetSN[0].toUpperCase() : 'SN-7742';
            const asset = getAssets().find(a => a.serialNumber === serial || a.description.includes(serial));
            const desc = query.replace(/create\s*(a\s*)?work\s*order\s*(for\s*)?/i, '').trim() || `Inspection required - ${serial}`;

            showPromptResponse({
                title: '🔧 Work Order Preview',
                actions: [
                    { icon: '📋', text: `<strong>Description:</strong> ${desc}` },
                    { icon: '🛞', text: `Asset: ${serial} ${asset ? '— ' + asset.description : ''}` },
                    { icon: '📍', text: `Location: ${asset ? asset.location.name : 'TBD'} | Company: ${CONFIG.COMPANY}` },
                    { icon: '⚡', text: 'In production, this would create a real Work Order in D365 via Power Automate' }
                ],
                badge: 'Preview — D365 F&O Asset Management'
            });
            return;
        }

        // === Fallback: show what's possible ===
        showPromptResponse({
            status: 'info',
            title: '🤖 Copilot — What can I help with?',
            actions: [
                { icon: '🔍', text: `Try: <em>"status of SN-7742"</em> — pulls live asset data` },
                { icon: '📋', text: `Try: <em>"show work orders"</em> — lists all maintenance orders` },
                { icon: '📊', text: `Try: <em>"fleet summary"</em> — KPI overview from D365` },
                { icon: '⚠️', text: `Try: <em>"overdue assets"</em> — flags problem items` },
                { icon: '🔧', text: `Try: <em>"create work order for SN-5501"</em> — writes to F&O` },
                { icon: '✈️', text: `Try: <em>"airlines"</em> — shows customer accounts` }
            ],
            badge: dataSource === 'live' ? 'Connected to D365 F&O' : 'Demo Mode'
        });
    }

    // === OPTION C: Write-back to F&O ===
    async function createWorkOrder(asset, serial, description) {
        showPromptResponse({
            title: '⏳ Creating Work Order...',
            actions: [{ icon: '🔄', text: `Sending to D365 F&O: "${description}" for ${serial}` }],
            badge: 'Writing to D365 F&O...'
        });

        try {
            const payload = {
                action: 'createWorkOrder',
                assetId: asset ? asset.id : '',
                serial: serial,
                description: description,
                company: CONFIG.COMPANY
            };

            const response = await fetch(CONFIG.POWER_AUTOMATE_ACTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();

            showPromptResponse({
                title: '✅ Work Order Created in D365',
                actions: [
                    { icon: '📋', text: `<strong>${result.workOrderId || 'WO-NEW'}</strong> — ${description}` },
                    { icon: '🛞', text: `Asset: ${serial} ${asset ? '— ' + asset.description : ''}` },
                    { icon: '📍', text: `Status: New | Company: ${CONFIG.COMPANY}` },
                    { icon: '🔗', text: 'Visible in D365 F&O → Asset Management → Work Orders' }
                ],
                badge: '✓ Written to D365 F&O'
            });

            // Refresh data to show the new work order
            await loadData();
            renderCurrentView();
        } catch (err) {
            showPromptResponse({
                title: '❌ Failed to Create Work Order',
                actions: [
                    { icon: '⚠️', text: `Error: ${err.message}` },
                    { icon: '💡', text: 'Check the Power Automate action flow is running' }
                ],
                badge: 'Write-back failed'
            });
        }
    }

    function showPromptResponse(response) {
        const container = document.getElementById('prompt-response');
        container.innerHTML = `
            <div class="prompt-response-header">
                <div class="prompt-response-title">✨ ${response.title}</div>
                <button class="prompt-response-close" onclick="app.closePrompt()">✕</button>
            </div>
            <div class="prompt-response-actions">
                ${response.actions.map(a => `
                    <div class="prompt-action">
                        <span class="icon">${a.icon}</span>
                        <span>${a.text}</span>
                    </div>
                `).join('')}
            </div>
            <div class="prompt-badge">✓ ${response.badge}</div>
        `;
        container.classList.add('visible');
    }

    function closePrompt() {
        document.getElementById('prompt-response').classList.remove('visible');
    }

    // === SEARCH & FILTER ===
    function handleSearch(value) {
        searchTerm = value;
        renderRegistry();
    }

    function handleFilter(status) {
        statusFilter = status;
        // Toggle active class on filter buttons
        document.querySelectorAll('.filter-btn[data-status]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.status === status);
        });
        renderRegistry();
    }

    // === UTILITIES ===
    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    // === COPILOT AGENT PANEL ===
    function toggleAgent() {
        const bar = document.getElementById('prompt-bar');
        const btn = document.getElementById('agent-toggle');
        bar.classList.toggle('collapsed');
        if (bar.classList.contains('collapsed')) {
            btn.textContent = 'Show ▲';
        } else {
            btn.textContent = 'Hide ▼';
        }
    }

    // === PUBLIC API ===
    window.app = {
        switchView,
        openDetail,
        animateExchange,
        closePrompt,
        handleSearch,
        handleFilter,
        toggleAgent,
        setPromptMode
    };

})();
