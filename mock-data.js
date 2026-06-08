// TP Aerospace - Circular Traceability POC
// Mock data representing wheel & brake assets in circular economy

const AIRLINES = {
    SAS: { name: 'SAS Scandinavian', code: 'SK', color: '#000080', program: 'SAS Flat-Rate Program' },
    RYR: { name: 'Ryanair', code: 'FR', color: '#003580', program: 'Ryanair Exchange Pool' },
    UAE: { name: 'Emirates', code: 'EK', color: '#D71920', program: 'Emirates Premium Program' },
    DLH: { name: 'Lufthansa', code: 'LH', color: '#05164D', program: 'Lufthansa Managed Pool' },
    SIA: { name: 'Singapore Airlines', code: 'SQ', color: '#1A3263', program: 'SIA Flat-Rate Program' },
    QFA: { name: 'Qantas', code: 'QF', color: '#E0001B', program: 'Qantas Exchange Pool' },
    DAL: { name: 'Delta Air Lines', code: 'DL', color: '#003366', program: 'Delta For-Less Program' },
    AFR: { name: 'Air France', code: 'AF', color: '#002157', program: 'Air France Managed Pool' }
};

const LOCATIONS = {
    CPH: { name: 'Copenhagen', country: 'Denmark', lat: 55.6181, lng: 12.6561, type: 'hub', region: 'Europe' },
    DXB: { name: 'Dubai', country: 'UAE', lat: 25.2532, lng: 55.3657, type: 'warehouse', region: 'Middle East' },
    SIN: { name: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915, type: 'mro', region: 'Asia Pacific' },
    ATL: { name: 'Atlanta', country: 'USA', lat: 33.6407, lng: -84.4277, type: 'warehouse', region: 'Americas' },
    GRU: { name: 'São Paulo', country: 'Brazil', lat: -23.4356, lng: -46.4731, type: 'warehouse', region: 'Americas' },
    JNB: { name: 'Johannesburg', country: 'South Africa', lat: -26.1367, lng: 28.2411, type: 'warehouse', region: 'Africa' },
    DUB: { name: 'Dublin', country: 'Ireland', lat: 53.4264, lng: -6.2499, type: 'warehouse', region: 'Europe' },
    FRA: { name: 'Frankfurt', country: 'Germany', lat: 50.0379, lng: 8.5622, type: 'mro', region: 'Europe' },
    VBY: { name: 'Valby MRO', country: 'Denmark', lat: 55.6636, lng: 12.5158, type: 'mro', region: 'Europe' },
    NRT: { name: 'Tokyo Narita', country: 'Japan', lat: 35.7720, lng: 140.3929, type: 'warehouse', region: 'Asia Pacific' }
};

const STATUSES = {
    IN_SERVICE: { id: 'in-service', label: 'In Service', color: '#10B981', icon: '✈️' },
    IN_TRANSIT: { id: 'in-transit', label: 'In Transit', color: '#3B82F6', icon: '🚚' },
    UNDER_MRO: { id: 'under-mro', label: 'Under MRO', color: '#F59E0B', icon: '🔧' },
    AVAILABLE: { id: 'available', label: 'Available Pool', color: '#8B5CF6', icon: '📦' },
    OVERDUE: { id: 'overdue', label: 'Overdue Return', color: '#EF4444', icon: '⚠️' }
};

const ASSET_TYPES = {
    WHEEL_ASSY: { id: 'wheel-assy', label: 'Wheel Assembly', partPrefix: 'WHL' },
    BRAKE_UNIT: { id: 'brake-unit', label: 'Brake Unit', partPrefix: 'BRK' },
    TYRE: { id: 'tyre', label: 'Tyre', partPrefix: 'TYR' }
};

const ASSETS = [
    // === HERO ASSET — Demo story protagonist ===
    {
        id: 'A001',
        serialNumber: 'SN-7742',
        partNumber: 'WHL-A320-MG-042',
        type: ASSET_TYPES.WHEEL_ASSY,
        description: 'Main Gear Wheel Assembly - A320',
        aircraft: 'A320',
        status: STATUSES.UNDER_MRO,
        location: LOCATIONS.VBY,
        assignedAirline: AIRLINES.SAS,
        program: AIRLINES.SAS.program,
        certifiedLife: 1500,
        currentLandings: 653,
        lastOverhaul: '2025-09-14',
        nextOverhaulDue: '2026-07-01',
        lifecycle: [
            { date: '2023-03-15', event: 'Manufactured', location: 'Valby MRO', detail: 'New wheel assembly certified' },
            { date: '2023-04-02', event: 'Deployed', location: 'Copenhagen CPH', detail: 'Assigned to SAS - OY-KAL' },
            { date: '2024-06-18', event: 'Returned', location: 'Copenhagen CPH', detail: 'Routine exchange — 412 landings' },
            { date: '2024-06-22', event: 'MRO', location: 'Valby MRO', detail: 'Overhaul & recertification' },
            { date: '2024-07-10', event: 'Deployed', location: 'Dublin DUB', detail: 'Assigned to Ryanair - EI-DWJ' },
            { date: '2025-09-14', event: 'Returned', location: 'Dublin DUB', detail: 'Scheduled exchange — 241 landings' },
            { date: '2025-09-18', event: 'MRO', location: 'Valby MRO', detail: 'Full overhaul cycle' },
            { date: '2025-10-05', event: 'Deployed', location: 'Copenhagen CPH', detail: 'Assigned to SAS - OY-KBP' },
            { date: '2026-06-06', event: 'Returned', location: 'Copenhagen CPH', detail: 'AOG exchange — worn tread detected' },
            { date: '2026-06-07', event: 'MRO', location: 'Valby MRO', detail: 'Current — tyre replacement & inspection' }
        ]
    },
    // === HERO ASSET 2 — The replacement dispatched ===
    {
        id: 'A002',
        serialNumber: 'SN-8891',
        partNumber: 'WHL-A320-MG-042',
        type: ASSET_TYPES.WHEEL_ASSY,
        description: 'Main Gear Wheel Assembly - A320',
        aircraft: 'A320',
        status: STATUSES.IN_SERVICE,
        location: LOCATIONS.CPH,
        assignedAirline: AIRLINES.SAS,
        program: AIRLINES.SAS.program,
        certifiedLife: 1500,
        currentLandings: 89,
        lastOverhaul: '2026-05-20',
        nextOverhaulDue: '2027-05-20',
        lifecycle: [
            { date: '2024-01-10', event: 'Manufactured', location: 'Valby MRO', detail: 'New wheel assembly certified' },
            { date: '2024-02-01', event: 'Deployed', location: 'Frankfurt FRA', detail: 'Assigned to Lufthansa - D-AIZQ' },
            { date: '2025-11-30', event: 'Returned', location: 'Frankfurt FRA', detail: 'Program rotation — 580 landings' },
            { date: '2025-12-05', event: 'MRO', location: 'Frankfurt FRA', detail: 'Overhaul & recertification' },
            { date: '2026-01-15', event: 'Available', location: 'Copenhagen CPH', detail: 'Transferred to CPH pool stock' },
            { date: '2026-06-06', event: 'Deployed', location: 'Copenhagen CPH', detail: 'Emergency dispatch to SAS - OY-KBP (AOG swap for SN-7742)' }
        ]
    },
    // === Emirates assets in Dubai ===
    {
        id: 'A003',
        serialNumber: 'SN-3341',
        partNumber: 'WHL-B777-MG-018',
        type: ASSET_TYPES.WHEEL_ASSY,
        description: 'Main Gear Wheel Assembly - B777',
        aircraft: 'B777',
        status: STATUSES.IN_SERVICE,
        location: LOCATIONS.DXB,
        assignedAirline: AIRLINES.UAE,
        program: AIRLINES.UAE.program,
        certifiedLife: 2000,
        currentLandings: 1247,
        lastOverhaul: '2025-01-08',
        nextOverhaulDue: '2026-08-15',
        lifecycle: [
            { date: '2022-06-01', event: 'Manufactured', location: 'Valby MRO', detail: 'New assembly' },
            { date: '2022-07-01', event: 'Deployed', location: 'Dubai DXB', detail: 'Emirates - A6-EWA' },
            { date: '2024-12-20', event: 'Returned', location: 'Dubai DXB', detail: 'Scheduled — 1,102 landings' },
            { date: '2025-01-08', event: 'MRO', location: 'Dubai DXB', detail: 'Local MRO overhaul' },
            { date: '2025-02-01', event: 'Deployed', location: 'Dubai DXB', detail: 'Emirates - A6-EWG' }
        ]
    },
    {
        id: 'A004',
        serialNumber: 'SN-3342',
        partNumber: 'BRK-B777-MG-009',
        type: ASSET_TYPES.BRAKE_UNIT,
        description: 'Carbon Brake Unit - B777',
        aircraft: 'B777',
        status: STATUSES.IN_SERVICE,
        location: LOCATIONS.DXB,
        assignedAirline: AIRLINES.UAE,
        program: AIRLINES.UAE.program,
        certifiedLife: 2500,
        currentLandings: 1890,
        lastOverhaul: '2024-11-15',
        nextOverhaulDue: '2026-06-30',
        lifecycle: [
            { date: '2021-09-10', event: 'Manufactured', location: 'Valby MRO', detail: 'Carbon brake certified' },
            { date: '2021-10-01', event: 'Deployed', location: 'Dubai DXB', detail: 'Emirates - A6-EWA' },
            { date: '2024-11-01', event: 'Returned', location: 'Dubai DXB', detail: 'Wear limit reached' },
            { date: '2024-11-15', event: 'MRO', location: 'Dubai DXB', detail: 'Heat stack replacement' },
            { date: '2024-12-01', event: 'Deployed', location: 'Dubai DXB', detail: 'Emirates - A6-EWJ' }
        ]
    },
    // === Ryanair assets across Europe ===
    {
        id: 'A005',
        serialNumber: 'SN-5501',
        partNumber: 'WHL-B737-MG-031',
        type: ASSET_TYPES.WHEEL_ASSY,
        description: 'Main Gear Wheel Assembly - B737',
        aircraft: 'B737-800',
        status: STATUSES.IN_SERVICE,
        location: LOCATIONS.DUB,
        assignedAirline: AIRLINES.RYR,
        program: AIRLINES.RYR.program,
        certifiedLife: 1200,
        currentLandings: 987,
        lastOverhaul: '2025-04-10',
        nextOverhaulDue: '2026-06-15',
        lifecycle: [
            { date: '2023-08-01', event: 'Manufactured', location: 'Valby MRO', detail: 'New assembly' },
            { date: '2023-09-01', event: 'Deployed', location: 'Dublin DUB', detail: 'Ryanair - EI-DWJ' },
            { date: '2025-03-28', event: 'Returned', location: 'Dublin DUB', detail: 'Tyre change required' },
            { date: '2025-04-10', event: 'MRO', location: 'Valby MRO', detail: 'Tyre replacement + bearing check' },
            { date: '2025-05-01', event: 'Deployed', location: 'Dublin DUB', detail: 'Ryanair - EI-FRI' }
        ]
    },
    {
        id: 'A006',
        serialNumber: 'SN-5502',
        partNumber: 'WHL-B737-NG-022',
        type: ASSET_TYPES.WHEEL_ASSY,
        description: 'Nose Gear Wheel Assembly - B737',
        aircraft: 'B737-800',
        status: STATUSES.OVERDUE,
        location: LOCATIONS.DUB,
        assignedAirline: AIRLINES.RYR,
        program: AIRLINES.RYR.program,
        certifiedLife: 1800,
        currentLandings: 1650,
        lastOverhaul: '2024-08-20',
        nextOverhaulDue: '2026-05-01',
        lifecycle: [
            { date: '2022-11-15', event: 'Manufactured', location: 'Valby MRO', detail: 'New assembly' },
            { date: '2022-12-10', event: 'Deployed', location: 'Dublin DUB', detail: 'Ryanair - EI-DCL' },
            { date: '2024-08-01', event: 'Returned', location: 'Dublin DUB', detail: 'Scheduled rotation' },
            { date: '2024-08-20', event: 'MRO', location: 'Valby MRO', detail: 'Full overhaul' },
            { date: '2024-09-15', event: 'Deployed', location: 'Dublin DUB', detail: 'Ryanair - EI-EKV' }
        ]
    },
    {
        id: 'A007',
        serialNumber: 'SN-5503',
        partNumber: 'BRK-B737-MG-015',
        type: ASSET_TYPES.BRAKE_UNIT,
        description: 'Carbon Brake Unit - B737',
        aircraft: 'B737-800',
        status: STATUSES.IN_TRANSIT,
        location: LOCATIONS.VBY,
        assignedAirline: AIRLINES.RYR,
        program: AIRLINES.RYR.program,
        certifiedLife: 2000,
        currentLandings: 0,
        lastOverhaul: '2026-06-01',
        nextOverhaulDue: '2028-06-01',
        lifecycle: [
            { date: '2023-01-20', event: 'Manufactured', location: 'Valby MRO', detail: 'New brake unit' },
            { date: '2023-02-15', event: 'Deployed', location: 'Dublin DUB', detail: 'Ryanair - EI-DWJ' },
            { date: '2026-05-20', event: 'Returned', location: 'Dublin DUB', detail: 'Wear limit — heat stack' },
            { date: '2026-06-01', event: 'MRO', location: 'Valby MRO', detail: 'Full rebuild completed' },
            { date: '2026-06-07', event: 'In Transit', location: 'Valby MRO', detail: 'Shipping to Dublin — ETA Jun 10' }
        ]
    },
    // === Singapore Airlines ===
    {
        id: 'A008',
        serialNumber: 'SN-6610',
        partNumber: 'WHL-A350-MG-007',
        type: ASSET_TYPES.WHEEL_ASSY,
        description: 'Main Gear Wheel Assembly - A350',
        aircraft: 'A350-900',
        status: STATUSES.IN_SERVICE,
        location: LOCATIONS.SIN,
        assignedAirline: AIRLINES.SIA,
        program: AIRLINES.SIA.program,
        certifiedLife: 1800,
        currentLandings: 445,
        lastOverhaul: '2025-11-01',
        nextOverhaulDue: '2027-02-01',
        lifecycle: [
            { date: '2024-03-01', event: 'Manufactured', location: 'Valby MRO', detail: 'New A350 wheel assy' },
            { date: '2024-04-01', event: 'Deployed', location: 'Singapore SIN', detail: 'Singapore Airlines - 9V-SMA' },
            { date: '2025-10-15', event: 'Returned', location: 'Singapore SIN', detail: 'Routine exchange' },
            { date: '2025-11-01', event: 'MRO', location: 'Singapore SIN', detail: 'Local overhaul' },
            { date: '2025-11-20', event: 'Deployed', location: 'Singapore SIN', detail: 'Singapore Airlines - 9V-SMF' }
        ]
    },
    {
        id: 'A009',
        serialNumber: 'SN-6611',
        partNumber: 'TYR-A350-MG-003',
        type: ASSET_TYPES.TYRE,
        description: 'Main Gear Tyre - A350 (Radial)',
        aircraft: 'A350-900',
        status: STATUSES.AVAILABLE,
        location: LOCATIONS.SIN,
        assignedAirline: null,
        program: null,
        certifiedLife: 400,
        currentLandings: 0,
        lastOverhaul: '2026-05-15',
        nextOverhaulDue: null,
        lifecycle: [
            { date: '2026-05-15', event: 'Manufactured', location: 'Singapore SIN', detail: 'New tyre — ready for deployment' },
            { date: '2026-05-16', event: 'Available', location: 'Singapore SIN', detail: 'Added to SIN pool stock' }
        ]
    },
    // === Lufthansa assets ===
    {
        id: 'A010',
        serialNumber: 'SN-4421',
        partNumber: 'WHL-A320-MG-042',
        type: ASSET_TYPES.WHEEL_ASSY,
        description: 'Main Gear Wheel Assembly - A320',
        aircraft: 'A320neo',
        status: STATUSES.IN_SERVICE,
        location: LOCATIONS.FRA,
        assignedAirline: AIRLINES.DLH,
        program: AIRLINES.DLH.program,
        certifiedLife: 1500,
        currentLandings: 847,
        lastOverhaul: '2025-06-10',
        nextOverhaulDue: '2026-09-01',
        lifecycle: [
            { date: '2022-01-15', event: 'Manufactured', location: 'Valby MRO', detail: 'New assembly' },
            { date: '2022-02-20', event: 'Deployed', location: 'Frankfurt FRA', detail: 'Lufthansa - D-AIUQ' },
            { date: '2023-12-01', event: 'Returned', location: 'Frankfurt FRA', detail: 'Scheduled exchange' },
            { date: '2023-12-15', event: 'MRO', location: 'Frankfurt FRA', detail: 'Full overhaul' },
            { date: '2024-01-10', event: 'Deployed', location: 'Frankfurt FRA', detail: 'Lufthansa - D-AIZQ' },
            { date: '2025-05-28', event: 'Returned', location: 'Frankfurt FRA', detail: 'Tyre worn' },
            { date: '2025-06-10', event: 'MRO', location: 'Frankfurt FRA', detail: 'Tyre change + inspection' },
            { date: '2025-06-25', event: 'Deployed', location: 'Frankfurt FRA', detail: 'Lufthansa - D-AIUR' }
        ]
    },
    {
        id: 'A011',
        serialNumber: 'SN-4422',
        partNumber: 'BRK-A320-MG-011',
        type: ASSET_TYPES.BRAKE_UNIT,
        description: 'Carbon Brake Unit - A320',
        aircraft: 'A320neo',
        status: STATUSES.UNDER_MRO,
        location: LOCATIONS.FRA,
        assignedAirline: AIRLINES.DLH,
        program: AIRLINES.DLH.program,
        certifiedLife: 2200,
        currentLandings: 2050,
        lastOverhaul: '2024-03-01',
        nextOverhaulDue: '2026-06-10',
        lifecycle: [
            { date: '2021-05-01', event: 'Manufactured', location: 'Valby MRO', detail: 'New carbon brake' },
            { date: '2021-06-01', event: 'Deployed', location: 'Frankfurt FRA', detail: 'Lufthansa - D-AIUQ' },
            { date: '2024-02-15', event: 'Returned', location: 'Frankfurt FRA', detail: 'Wear indicator tripped' },
            { date: '2024-03-01', event: 'MRO', location: 'Frankfurt FRA', detail: 'Heat stack replacement' },
            { date: '2024-03-20', event: 'Deployed', location: 'Frankfurt FRA', detail: 'Lufthansa - D-AIZR' },
            { date: '2026-06-05', event: 'Returned', location: 'Frankfurt FRA', detail: 'Scheduled overhaul due' },
            { date: '2026-06-07', event: 'MRO', location: 'Frankfurt FRA', detail: 'Current — full rebuild in progress' }
        ]
    },
    // === Qantas ===
    {
        id: 'A012',
        serialNumber: 'SN-9901',
        partNumber: 'WHL-B787-MG-005',
        type: ASSET_TYPES.WHEEL_ASSY,
        description: 'Main Gear Wheel Assembly - B787',
        aircraft: 'B787-9',
        status: STATUSES.IN_SERVICE,
        location: LOCATIONS.SIN,
        assignedAirline: AIRLINES.QFA,
        program: AIRLINES.QFA.program,
        certifiedLife: 1600,
        currentLandings: 312,
        lastOverhaul: '2026-01-20',
        nextOverhaulDue: '2027-06-01',
        lifecycle: [
            { date: '2024-06-01', event: 'Manufactured', location: 'Valby MRO', detail: 'New B787 wheel assy' },
            { date: '2024-07-01', event: 'Deployed', location: 'Singapore SIN', detail: 'Qantas - VH-ZNA (SIN hub)' },
            { date: '2025-12-30', event: 'Returned', location: 'Singapore SIN', detail: 'Routine' },
            { date: '2026-01-20', event: 'MRO', location: 'Singapore SIN', detail: 'Tyre + bearing service' },
            { date: '2026-02-10', event: 'Deployed', location: 'Singapore SIN', detail: 'Qantas - VH-ZNB' }
        ]
    },
    // === Delta ===
    {
        id: 'A013',
        serialNumber: 'SN-2201',
        partNumber: 'WHL-B737-MG-031',
        type: ASSET_TYPES.WHEEL_ASSY,
        description: 'Main Gear Wheel Assembly - B737',
        aircraft: 'B737-900ER',
        status: STATUSES.IN_SERVICE,
        location: LOCATIONS.ATL,
        assignedAirline: AIRLINES.DAL,
        program: AIRLINES.DAL.program,
        certifiedLife: 1200,
        currentLandings: 1105,
        lastOverhaul: '2025-08-10',
        nextOverhaulDue: '2026-06-20',
        lifecycle: [
            { date: '2023-05-01', event: 'Manufactured', location: 'Valby MRO', detail: 'New assembly' },
            { date: '2023-06-15', event: 'Deployed', location: 'Atlanta ATL', detail: 'Delta - N801DN' },
            { date: '2025-07-20', event: 'Returned', location: 'Atlanta ATL', detail: 'Tyre worn' },
            { date: '2025-08-10', event: 'MRO', location: 'Atlanta ATL', detail: 'Tyre replacement' },
            { date: '2025-08-25', event: 'Deployed', location: 'Atlanta ATL', detail: 'Delta - N814DN' }
        ]
    },
    {
        id: 'A014',
        serialNumber: 'SN-2202',
        partNumber: 'WHL-B737-NG-022',
        type: ASSET_TYPES.WHEEL_ASSY,
        description: 'Nose Gear Wheel Assembly - B737',
        aircraft: 'B737-900ER',
        status: STATUSES.AVAILABLE,
        location: LOCATIONS.ATL,
        assignedAirline: null,
        program: null,
        certifiedLife: 1800,
        currentLandings: 0,
        lastOverhaul: '2026-05-01',
        nextOverhaulDue: null,
        lifecycle: [
            { date: '2023-02-01', event: 'Manufactured', location: 'Valby MRO', detail: 'New assembly' },
            { date: '2023-03-01', event: 'Deployed', location: 'Atlanta ATL', detail: 'Delta - N801DN' },
            { date: '2026-04-15', event: 'Returned', location: 'Atlanta ATL', detail: 'Fleet rotation' },
            { date: '2026-05-01', event: 'MRO', location: 'Atlanta ATL', detail: 'Overhaul complete' },
            { date: '2026-05-10', event: 'Available', location: 'Atlanta ATL', detail: 'Returned to ATL pool' }
        ]
    },
    // === Air France ===
    {
        id: 'A015',
        serialNumber: 'SN-7201',
        partNumber: 'WHL-A350-MG-007',
        type: ASSET_TYPES.WHEEL_ASSY,
        description: 'Main Gear Wheel Assembly - A350',
        aircraft: 'A350-900',
        status: STATUSES.IN_SERVICE,
        location: LOCATIONS.FRA,
        assignedAirline: AIRLINES.AFR,
        program: AIRLINES.AFR.program,
        certifiedLife: 1800,
        currentLandings: 622,
        lastOverhaul: '2025-09-01',
        nextOverhaulDue: '2027-01-01',
        lifecycle: [
            { date: '2024-01-01', event: 'Manufactured', location: 'Valby MRO', detail: 'New A350 wheel assy' },
            { date: '2024-02-01', event: 'Deployed', location: 'Frankfurt FRA', detail: 'Air France - F-HTYA (FRA base)' },
            { date: '2025-08-15', event: 'Returned', location: 'Frankfurt FRA', detail: 'Routine exchange' },
            { date: '2025-09-01', event: 'MRO', location: 'Frankfurt FRA', detail: 'Tyre + inspection' },
            { date: '2025-09-20', event: 'Deployed', location: 'Frankfurt FRA', detail: 'Air France - F-HTYC' }
        ]
    },
    // === More pool / transit items ===
    {
        id: 'A016',
        serialNumber: 'SN-1105',
        partNumber: 'TYR-B737-MG-008',
        type: ASSET_TYPES.TYRE,
        description: 'Main Gear Tyre - B737 (Radial)',
        aircraft: 'B737-800',
        status: STATUSES.AVAILABLE,
        location: LOCATIONS.CPH,
        assignedAirline: null,
        program: null,
        certifiedLife: 350,
        currentLandings: 0,
        lastOverhaul: '2026-06-01',
        nextOverhaulDue: null,
        lifecycle: [
            { date: '2026-06-01', event: 'Manufactured', location: 'Copenhagen CPH', detail: 'New retread tyre' },
            { date: '2026-06-02', event: 'Available', location: 'Copenhagen CPH', detail: 'Added to CPH pool' }
        ]
    },
    {
        id: 'A017',
        serialNumber: 'SN-1106',
        partNumber: 'TYR-B737-MG-008',
        type: ASSET_TYPES.TYRE,
        description: 'Main Gear Tyre - B737 (Radial)',
        aircraft: 'B737-800',
        status: STATUSES.AVAILABLE,
        location: LOCATIONS.DUB,
        assignedAirline: null,
        program: null,
        certifiedLife: 350,
        currentLandings: 0,
        lastOverhaul: '2026-05-20',
        nextOverhaulDue: null,
        lifecycle: [
            { date: '2026-05-20', event: 'Manufactured', location: 'Dublin DUB', detail: 'New retread tyre' },
            { date: '2026-05-21', event: 'Available', location: 'Dublin DUB', detail: 'Added to DUB pool' }
        ]
    },
    {
        id: 'A018',
        serialNumber: 'SN-3350',
        partNumber: 'WHL-B777-NG-012',
        type: ASSET_TYPES.WHEEL_ASSY,
        description: 'Nose Gear Wheel Assembly - B777',
        aircraft: 'B777-300ER',
        status: STATUSES.IN_TRANSIT,
        location: LOCATIONS.CPH,
        assignedAirline: AIRLINES.UAE,
        program: AIRLINES.UAE.program,
        certifiedLife: 2000,
        currentLandings: 0,
        lastOverhaul: '2026-06-03',
        nextOverhaulDue: '2028-06-01',
        lifecycle: [
            { date: '2022-09-01', event: 'Manufactured', location: 'Valby MRO', detail: 'New assembly' },
            { date: '2022-10-01', event: 'Deployed', location: 'Dubai DXB', detail: 'Emirates - A6-EWA' },
            { date: '2026-05-25', event: 'Returned', location: 'Dubai DXB', detail: 'Bearing noise detected' },
            { date: '2026-05-28', event: 'In Transit', location: 'Dubai DXB', detail: 'Shipped to Valby for specialist MRO' },
            { date: '2026-06-03', event: 'MRO', location: 'Valby MRO', detail: 'Bearing replacement complete' },
            { date: '2026-06-07', event: 'In Transit', location: 'Copenhagen CPH', detail: 'Returning to Dubai — ETA Jun 11' }
        ]
    },
    {
        id: 'A019',
        serialNumber: 'SN-8820',
        partNumber: 'BRK-A320-MG-011',
        type: ASSET_TYPES.BRAKE_UNIT,
        description: 'Carbon Brake Unit - A320',
        aircraft: 'A320neo',
        status: STATUSES.IN_SERVICE,
        location: LOCATIONS.CPH,
        assignedAirline: AIRLINES.SAS,
        program: AIRLINES.SAS.program,
        certifiedLife: 2200,
        currentLandings: 1450,
        lastOverhaul: '2025-03-01',
        nextOverhaulDue: '2026-12-01',
        lifecycle: [
            { date: '2022-07-01', event: 'Manufactured', location: 'Valby MRO', detail: 'New carbon brake' },
            { date: '2022-08-01', event: 'Deployed', location: 'Copenhagen CPH', detail: 'SAS - OY-KAL' },
            { date: '2025-02-15', event: 'Returned', location: 'Copenhagen CPH', detail: 'Scheduled exchange' },
            { date: '2025-03-01', event: 'MRO', location: 'Valby MRO', detail: 'Heat stack service' },
            { date: '2025-03-20', event: 'Deployed', location: 'Copenhagen CPH', detail: 'SAS - OY-KBP' }
        ]
    },
    {
        id: 'A020',
        serialNumber: 'SN-9120',
        partNumber: 'WHL-B787-MG-005',
        type: ASSET_TYPES.WHEEL_ASSY,
        description: 'Main Gear Wheel Assembly - B787',
        aircraft: 'B787-9',
        status: STATUSES.UNDER_MRO,
        location: LOCATIONS.SIN,
        assignedAirline: AIRLINES.SIA,
        program: AIRLINES.SIA.program,
        certifiedLife: 1600,
        currentLandings: 1420,
        lastOverhaul: '2024-09-01',
        nextOverhaulDue: '2026-06-01',
        lifecycle: [
            { date: '2023-01-01', event: 'Manufactured', location: 'Valby MRO', detail: 'New B787 wheel' },
            { date: '2023-02-01', event: 'Deployed', location: 'Singapore SIN', detail: 'Singapore Airlines - 9V-SMA' },
            { date: '2024-08-15', event: 'Returned', location: 'Singapore SIN', detail: 'Scheduled' },
            { date: '2024-09-01', event: 'MRO', location: 'Singapore SIN', detail: 'Full overhaul' },
            { date: '2024-09-25', event: 'Deployed', location: 'Singapore SIN', detail: 'Singapore Airlines - 9V-SMC' },
            { date: '2026-06-02', event: 'Returned', location: 'Singapore SIN', detail: 'Overhaul due' },
            { date: '2026-06-05', event: 'MRO', location: 'Singapore SIN', detail: 'Current — overhaul in progress' }
        ]
    },
    // === South America ===
    {
        id: 'A021',
        serialNumber: 'SN-4001',
        partNumber: 'WHL-A320-MG-042',
        type: ASSET_TYPES.WHEEL_ASSY,
        description: 'Main Gear Wheel Assembly - A320',
        aircraft: 'A320neo',
        status: STATUSES.IN_SERVICE,
        location: LOCATIONS.GRU,
        assignedAirline: AIRLINES.AFR,
        program: AIRLINES.AFR.program,
        certifiedLife: 1500,
        currentLandings: 290,
        lastOverhaul: '2026-02-01',
        nextOverhaulDue: '2027-04-01',
        lifecycle: [
            { date: '2024-06-01', event: 'Manufactured', location: 'Valby MRO', detail: 'New assembly' },
            { date: '2024-07-15', event: 'Deployed', location: 'São Paulo GRU', detail: 'Air France - F-HTYB (GRU route)' },
            { date: '2026-01-10', event: 'Returned', location: 'São Paulo GRU', detail: 'Routine' },
            { date: '2026-02-01', event: 'MRO', location: 'São Paulo GRU', detail: 'Local inspection + tyre change' },
            { date: '2026-02-20', event: 'Deployed', location: 'São Paulo GRU', detail: 'Air France - F-HTYD' }
        ]
    },
    // === Africa ===
    {
        id: 'A022',
        serialNumber: 'SN-6001',
        partNumber: 'WHL-B737-MG-031',
        type: ASSET_TYPES.WHEEL_ASSY,
        description: 'Main Gear Wheel Assembly - B737',
        aircraft: 'B737-800',
        status: STATUSES.AVAILABLE,
        location: LOCATIONS.JNB,
        assignedAirline: null,
        program: null,
        certifiedLife: 1200,
        currentLandings: 0,
        lastOverhaul: '2026-04-15',
        nextOverhaulDue: null,
        lifecycle: [
            { date: '2023-10-01', event: 'Manufactured', location: 'Valby MRO', detail: 'New assembly' },
            { date: '2023-11-01', event: 'Deployed', location: 'Johannesburg JNB', detail: 'Customer rotation' },
            { date: '2026-04-01', event: 'Returned', location: 'Johannesburg JNB', detail: 'Contract ended' },
            { date: '2026-04-15', event: 'MRO', location: 'Johannesburg JNB', detail: 'Overhaul complete' },
            { date: '2026-04-20', event: 'Available', location: 'Johannesburg JNB', detail: 'JNB pool stock' }
        ]
    },
    // === Tokyo ===
    {
        id: 'A023',
        serialNumber: 'SN-7801',
        partNumber: 'WHL-B787-MG-005',
        type: ASSET_TYPES.WHEEL_ASSY,
        description: 'Main Gear Wheel Assembly - B787',
        aircraft: 'B787-9',
        status: STATUSES.IN_SERVICE,
        location: LOCATIONS.NRT,
        assignedAirline: AIRLINES.SIA,
        program: AIRLINES.SIA.program,
        certifiedLife: 1600,
        currentLandings: 510,
        lastOverhaul: '2025-10-01',
        nextOverhaulDue: '2027-03-01',
        lifecycle: [
            { date: '2024-05-01', event: 'Manufactured', location: 'Valby MRO', detail: 'New B787 wheel' },
            { date: '2024-06-10', event: 'Deployed', location: 'Tokyo NRT', detail: 'Singapore Airlines - 9V-SME (NRT route)' },
            { date: '2025-09-15', event: 'Returned', location: 'Tokyo NRT', detail: 'Routine' },
            { date: '2025-10-01', event: 'MRO', location: 'Singapore SIN', detail: 'Overhaul at SIN facility' },
            { date: '2025-10-20', event: 'Deployed', location: 'Tokyo NRT', detail: 'Singapore Airlines - 9V-SMG' }
        ]
    },
    {
        id: 'A024',
        serialNumber: 'SN-2210',
        partNumber: 'TYR-B737-NG-004',
        type: ASSET_TYPES.TYRE,
        description: 'Nose Gear Tyre - B737',
        aircraft: 'B737-900ER',
        status: STATUSES.IN_SERVICE,
        location: LOCATIONS.ATL,
        assignedAirline: AIRLINES.DAL,
        program: AIRLINES.DAL.program,
        certifiedLife: 250,
        currentLandings: 180,
        lastOverhaul: '2026-03-15',
        nextOverhaulDue: '2026-07-01',
        lifecycle: [
            { date: '2026-03-15', event: 'Manufactured', location: 'Atlanta ATL', detail: 'New tyre fitted' },
            { date: '2026-03-16', event: 'Deployed', location: 'Atlanta ATL', detail: 'Delta - N814DN' }
        ]
    },
    {
        id: 'A025',
        serialNumber: 'SN-3360',
        partNumber: 'BRK-B777-MG-009',
        type: ASSET_TYPES.BRAKE_UNIT,
        description: 'Carbon Brake Unit - B777',
        aircraft: 'B777-300ER',
        status: STATUSES.IN_SERVICE,
        location: LOCATIONS.DXB,
        assignedAirline: AIRLINES.UAE,
        program: AIRLINES.UAE.program,
        certifiedLife: 2500,
        currentLandings: 720,
        lastOverhaul: '2025-12-01',
        nextOverhaulDue: '2027-09-01',
        lifecycle: [
            { date: '2025-01-01', event: 'Manufactured', location: 'Valby MRO', detail: 'New carbon brake' },
            { date: '2025-02-01', event: 'Deployed', location: 'Dubai DXB', detail: 'Emirates - A6-EWG' },
            { date: '2025-11-15', event: 'Returned', location: 'Dubai DXB', detail: 'Inspection required' },
            { date: '2025-12-01', event: 'MRO', location: 'Dubai DXB', detail: 'Passed — minor service' },
            { date: '2025-12-10', event: 'Deployed', location: 'Dubai DXB', detail: 'Emirates - A6-EWJ' }
        ]
    }
];

// === SCRIPTED AI PROMPT RESPONSES ===
const PROMPT_RESPONSES = [
    {
        triggers: ['emergency', 'aog', 'swap', 'exchange', 'sas', 'cph', 'copenhagen'],
        input: 'Emergency exchange SAS CPH Gate 12 - main gear wheel AOG',
        response: {
            status: 'success',
            title: 'Exchange Event Created',
            actions: [
                { icon: '📋', text: 'Return Order RO-2026-0847 created for SN-7742 (worn — tread below minimum)' },
                { icon: '✈️', text: 'Dispatch Order DO-2026-0848 created — SN-8891 from CPH pool stock' },
                { icon: '🔧', text: 'Work Order WO-2026-1205 generated — route SN-7742 to Valby MRO' },
                { icon: '✅', text: 'SAS notified — ETA serviceable unit: 45 minutes to Gate 12' }
            ],
            badge: 'Executed in Dynamics 365 F&O → Transfer Orders + Asset Management'
        }
    },
    {
        triggers: ['overdue', 'due', 'overhaul', 'this week', 'maintenance'],
        input: 'Show all assets due for overhaul this week',
        response: {
            status: 'filter',
            title: '4 Assets Due for Overhaul (Week of Jun 8)',
            actions: [
                { icon: '⚠️', text: 'SN-5502 — Ryanair DUB — Overdue since Jun 1 (nose gear B737)' },
                { icon: '🔶', text: 'SN-4422 — Lufthansa FRA — Due Jun 10 (brake unit A320)' },
                { icon: '🔶', text: 'SN-3341 — Emirates DXB — Due Jun 15 (wheel B777, approaching limit)' },
                { icon: '🔶', text: 'SN-2201 — Delta ATL — Due Jun 20 (wheel B737, 1105/1200 landings)' }
            ],
            badge: 'Queried from D365 F&O → Asset Management Work Orders'
        }
    },
    {
        triggers: ['remaining life', 'life', 'landings', 'sn-4421', '4421', 'cycles'],
        input: "What's the remaining life on SN-4421?",
        response: {
            status: 'info',
            title: 'Asset Life Report: SN-4421',
            actions: [
                { icon: '🛞', text: 'Part: WHL-A320-MG-042 — Main Gear Wheel Assembly (A320neo)' },
                { icon: '📊', text: 'Landings: 847 of 1,500 certified (56.5% used)' },
                { icon: '✅', text: 'Remaining: 653 landings — estimated 8.2 months at current utilisation' },
                { icon: '📍', text: 'Current: Lufthansa D-AIUR, Frankfurt FRA' },
                { icon: '📅', text: 'Next overhaul scheduled: Sep 2026' }
            ],
            badge: 'Retrieved from D365 F&O → Fixed Asset Counters + Maintenance Schedule'
        }
    },
    {
        triggers: ['transfer', 'move', 'dubai', 'singapore', 'pool'],
        input: 'Transfer 3 wheel assemblies from Dubai pool to Singapore',
        response: {
            status: 'success',
            title: 'Transfer Order Created',
            actions: [
                { icon: '📦', text: 'Transfer Order TO-2026-0392 created (DXB → SIN)' },
                { icon: '🛞', text: 'Line 1: Available B777 wheel assy from DXB stock' },
                { icon: '🛞', text: 'Line 2: Available B777 wheel assy from DXB stock' },
                { icon: '🛞', text: 'Line 3: Available B777 brake unit from DXB stock' },
                { icon: '🚚', text: 'Estimated transit: 3-4 days via air freight' }
            ],
            badge: 'Executed in D365 F&O → Inventory Transfer Orders'
        }
    },
    {
        triggers: ['report', 'utilisation', 'utilization', 'monthly', 'sas program'],
        input: 'Generate monthly utilisation report for SAS program',
        response: {
            status: 'info',
            title: 'SAS Flat-Rate Program — June 2026 Report',
            actions: [
                { icon: '📊', text: 'Fleet utilisation: 94.2% (16 of 17 managed assets in service)' },
                { icon: '✈️', text: 'Total landings this month: 1,847 across program' },
                { icon: '🔄', text: 'Exchange events: 3 (1 AOG, 2 routine)' },
                { icon: '⏱️', text: 'Average turnaround: 4.2 days (target: 5 days) ✓' },
                { icon: '💰', text: 'Cost per landing: $142.60 (below contract cap of $155)' }
            ],
            badge: 'Generated from D365 F&O → Asset Management + Trade Agreements + Billing'
        }
    }
];

// === KPI CALCULATIONS ===
function getKPIs() {
    const total = ASSETS.length;
    const inService = ASSETS.filter(a => a.status.id === 'in-service').length;
    const underMRO = ASSETS.filter(a => a.status.id === 'under-mro').length;
    const inTransit = ASSETS.filter(a => a.status.id === 'in-transit').length;
    const available = ASSETS.filter(a => a.status.id === 'available').length;
    const overdue = ASSETS.filter(a => a.status.id === 'overdue').length;
    const maintenanceDue = ASSETS.filter(a => {
        if (!a.nextOverhaulDue) return false;
        const due = new Date(a.nextOverhaulDue);
        const now = new Date();
        const diff = (due - now) / (1000 * 60 * 60 * 24);
        return diff <= 30 && diff > 0;
    }).length;

    return { total, inService, underMRO, inTransit, available, overdue, maintenanceDue };
}

// === RECENT ACTIVITY (for dashboard feed) ===
const RECENT_ACTIVITY = [
    { time: '2 hours ago', event: 'AOG Exchange', detail: 'SN-8891 dispatched to SAS at CPH Gate 12', type: 'exchange' },
    { time: '4 hours ago', event: 'MRO Started', detail: 'SN-7742 received at Valby — tyre replacement', type: 'mro' },
    { time: '1 day ago', event: 'MRO Complete', detail: 'SN-5503 brake rebuild finished — shipping to Dublin', type: 'complete' },
    { time: '2 days ago', event: 'Overdue Alert', detail: 'SN-5502 return overdue from Ryanair (7 days)', type: 'alert' },
    { time: '3 days ago', event: 'Transfer', detail: 'SN-3350 shipped from Valby to Dubai (bearing repair complete)', type: 'transit' },
    { time: '5 days ago', event: 'Deployed', detail: 'SN-9901 assigned to Qantas VH-ZNB at Singapore', type: 'deploy' }
];
