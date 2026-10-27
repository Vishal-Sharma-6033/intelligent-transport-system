const bcrypt = require('bcryptjs');

// Pre-hashed passwords for instant sync loading
// Admin@123 -> $2a$10$wN9iL66EwNtrVqVeqZ04s.4KqY63bcvX.6k9X/1y2G3Wn1pZbQ4pG (or generated)
const hashPassword = (pwd) => bcrypt.hashSync(pwd, 10);

const adminHash = hashPassword('Admin@123');
const passengerHash = hashPassword('Pass@123');
const operatorHash = hashPassword('Operator@123');

const initialUsers = [
  {
    id: 'USR-001',
    name: 'Chief Transit Admin',
    email: 'admin@transit.ai',
    password: adminHash,
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date('2026-01-01T00:00:00.000Z')
  },
  {
    id: 'USR-002',
    name: 'Rahul Sharma',
    email: 'passenger@transit.ai',
    password: passengerHash,
    role: 'passenger',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date('2026-01-10T00:00:00.000Z')
  },
  {
    id: 'USR-003',
    name: 'Priya Patel',
    email: 'operator@transit.ai',
    password: operatorHash,
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date('2026-01-15T00:00:00.000Z')
  }
];

// 16 Realistically placed stops (Delhi NCR coordinates for realistic spatial relationships)
const initialStops = [
  {
    id: 'STP-001',
    code: 'CP-CENTRAL',
    name: 'Connaught Place Central',
    zone: 'Zone A - Downtown',
    latitude: 28.6315,
    longitude: 77.2167,
    passengerCapacity: 2500,
    amenities: ['Metro Interchange', 'Restrooms', 'Wheelchair Access', 'Smart Kiosks', 'WiFi'],
    isActive: true
  },
  {
    id: 'STP-002',
    code: 'NDLS-RAIL',
    name: 'New Delhi Railway Hub',
    zone: 'Zone A - Downtown',
    latitude: 28.6428,
    longitude: 77.2205,
    passengerCapacity: 3500,
    amenities: ['Train Terminal', 'Metro Line 1', 'Ticket Counters', 'Food Court', 'Wheelchair Access'],
    isActive: true
  },
  {
    id: 'STP-003',
    code: 'ITO-OFFICE',
    name: 'ITO Institutional Area',
    zone: 'Zone B - Commercial',
    latitude: 28.6289,
    longitude: 77.2410,
    passengerCapacity: 1800,
    amenities: ['EV Charging', 'Shelter', 'Bus Bay', 'ATM'],
    isActive: true
  },
  {
    id: 'STP-004',
    code: 'AIIMS-MED',
    name: 'AIIMS Medical Hub',
    zone: 'Zone C - Health Corridor',
    latitude: 28.5672,
    longitude: 77.2100,
    passengerCapacity: 2800,
    amenities: ['Hospital Direct Walkway', 'Wheelchair Ramps', 'Emergency SOS', 'Shelter'],
    isActive: true
  },
  {
    id: 'STP-005',
    code: 'HAUZ-KHAS',
    name: 'Hauz Khas Junction',
    zone: 'Zone C - South Hub',
    latitude: 28.5494,
    longitude: 77.2001,
    passengerCapacity: 2200,
    amenities: ['Dual Metro Line', 'Bike Sharing', 'Smart Display', 'Restrooms'],
    isActive: true
  },
  {
    id: 'STP-006',
    code: 'KASH-GATE',
    name: 'Kashmere Gate ISBT',
    zone: 'Zone D - North Terminal',
    latitude: 28.6665,
    longitude: 77.2285,
    passengerCapacity: 4500,
    amenities: ['Interstate Bus Terminal', 'Triple Metro Interchange', 'Large Waiting Hall', 'WiFi'],
    isActive: true
  },
  {
    id: 'STP-007',
    code: 'IGI-AIRPORT',
    name: 'IGI Airport Terminal 3',
    zone: 'Zone E - Airport Express',
    latitude: 28.5562,
    longitude: 77.0850,
    passengerCapacity: 5000,
    amenities: ['Flight Information Screen', 'Luggage Trolleys', 'High-Speed Metro', '24/7 Security'],
    isActive: true
  },
  {
    id: 'STP-008',
    code: 'DWARKA-SEC',
    name: 'Dwarka Sector 21 Hub',
    zone: 'Zone E - West Suburbs',
    latitude: 28.5522,
    longitude: 77.0583,
    passengerCapacity: 2000,
    amenities: ['Park & Ride', 'Metro Connection', 'Covered Walkways'],
    isActive: true
  },
  {
    id: 'STP-009',
    code: 'NEHRU-PLACE',
    name: 'Nehru Place Tech Center',
    zone: 'Zone F - IT & Business',
    latitude: 28.5495,
    longitude: 77.2526,
    passengerCapacity: 3000,
    amenities: ['Electronics Market', 'Bus Terminal', 'EV Quick Chargers', 'Restrooms'],
    isActive: true
  },
  {
    id: 'STP-010',
    code: 'LAJPAT-NAGAR',
    name: 'Lajpat Nagar Central Market',
    zone: 'Zone B - Commercial',
    latitude: 28.5700,
    longitude: 77.2400,
    passengerCapacity: 2600,
    amenities: ['Shopping Access', 'Wheelchair Friendly', 'High-Frequency Bay'],
    isActive: true
  },
  {
    id: 'STP-011',
    code: 'NOIDA-SEC18',
    name: 'Noida Sector 18 Mall Hub',
    zone: 'Zone G - East Suburbs',
    latitude: 28.5708,
    longitude: 77.3261,
    passengerCapacity: 3200,
    amenities: ['Mall Direct Entry', 'Multi-Level Parking', 'Food Plaza', 'WiFi'],
    isActive: true
  },
  {
    id: 'STP-012',
    code: 'BOTANICAL-G',
    name: 'Botanical Garden Interchange',
    zone: 'Zone G - East Suburbs',
    latitude: 28.5641,
    longitude: 77.3342,
    passengerCapacity: 3100,
    amenities: ['Suburban Bus Bays', 'Metro Interchange', 'Restrooms'],
    isActive: true
  },
  {
    id: 'STP-013',
    code: 'CYBER-CITY',
    name: 'Cyber City Hub',
    zone: 'Zone H - Corporate Sector',
    latitude: 28.4950,
    longitude: 77.0895,
    passengerCapacity: 4000,
    amenities: ['Rapid Metro Direct', 'Corporate Shuttles', 'Smart Ticketing', 'AC Waiting Area'],
    isActive: true
  },
  {
    id: 'STP-014',
    code: 'MG-ROAD',
    name: 'MG Road Commercial Strip',
    zone: 'Zone H - Corporate Sector',
    latitude: 28.4800,
    longitude: 77.0800,
    passengerCapacity: 2100,
    amenities: ['Bus Shelters', 'Walkway Overbridge', 'Bike Stands'],
    isActive: true
  },
  {
    id: 'STP-015',
    code: 'VASANT-KUNJ',
    name: 'Vasant Kunj Institutional Area',
    zone: 'Zone C - South Hub',
    latitude: 28.5250,
    longitude: 77.1550,
    passengerCapacity: 1700,
    amenities: ['University Connect', 'Green Transit Zone', 'Smart Benches'],
    isActive: true
  },
  {
    id: 'STP-016',
    code: 'DELHI-UNIV',
    name: 'Delhi University North Campus',
    zone: 'Zone D - North Terminal',
    latitude: 28.6900,
    longitude: 77.2100,
    passengerCapacity: 3600,
    amenities: ['Student Discount Kiosks', 'E-Rickshaw Stand', 'Shaded Waiting Area', 'WiFi'],
    isActive: true
  }
];

// 6 Interconnected Bus Routes with stop sequences, distances & travel times
const initialRoutes = [
  {
    id: 'R-101',
    code: 'RED-EXP-101',
    name: 'Red Line North-South Express',
    type: 'Bus Express',
    color: '#EF4444',
    stops: [
      { stopId: 'STP-016', sequence: 1, travelTimeToNext: 8, distanceToNext: 3.2 },
      { stopId: 'STP-006', sequence: 2, travelTimeToNext: 7, distanceToNext: 2.8 },
      { stopId: 'STP-002', sequence: 3, travelTimeToNext: 6, distanceToNext: 2.1 },
      { stopId: 'STP-001', sequence: 4, travelTimeToNext: 12, distanceToNext: 4.5 },
      { stopId: 'STP-004', sequence: 5, travelTimeToNext: 9, distanceToNext: 3.6 },
      { stopId: 'STP-005', sequence: 6, travelTimeToNext: 0, distanceToNext: 0 }
    ],
    fareBase: 15,
    farePerKm: 2.5,
    isActive: true,
    totalDistanceKm: 16.2,
    estimatedTotalMinutes: 42
  },
  {
    id: 'R-102',
    code: 'BLUE-AIR-102',
    name: 'Blue Line Airport Express',
    type: 'Rapid Transit',
    color: '#3B82F6',
    stops: [
      { stopId: 'STP-001', sequence: 1, travelTimeToNext: 14, distanceToNext: 5.2 },
      { stopId: 'STP-004', sequence: 2, travelTimeToNext: 11, distanceToNext: 4.1 },
      { stopId: 'STP-015', sequence: 3, travelTimeToNext: 15, distanceToNext: 6.8 },
      { stopId: 'STP-007', sequence: 4, travelTimeToNext: 8, distanceToNext: 3.5 },
      { stopId: 'STP-008', sequence: 5, travelTimeToNext: 0, distanceToNext: 0 }
    ],
    fareBase: 25,
    farePerKm: 3.0,
    isActive: true,
    totalDistanceKm: 19.6,
    estimatedTotalMinutes: 48
  },
  {
    id: 'R-103',
    code: 'GREEN-CIR-103',
    name: 'Green Line South Orbital',
    type: 'City Shuttle',
    color: '#10B981',
    stops: [
      { stopId: 'STP-005', sequence: 1, travelTimeToNext: 10, distanceToNext: 3.9 },
      { stopId: 'STP-009', sequence: 2, travelTimeToNext: 8, distanceToNext: 3.1 },
      { stopId: 'STP-010', sequence: 3, travelTimeToNext: 12, distanceToNext: 4.8 },
      { stopId: 'STP-003', sequence: 4, travelTimeToNext: 7, distanceToNext: 2.5 },
      { stopId: 'STP-001', sequence: 5, travelTimeToNext: 0, distanceToNext: 0 }
    ],
    fareBase: 10,
    farePerKm: 2.0,
    isActive: true,
    totalDistanceKm: 14.3,
    estimatedTotalMinutes: 37
  },
  {
    id: 'R-104',
    code: 'YELLOW-TECH-104',
    name: 'Yellow Line Corporate Corridor',
    type: 'Bus Express',
    color: '#F59E0B',
    stops: [
      { stopId: 'STP-005', sequence: 1, travelTimeToNext: 16, distanceToNext: 7.2 },
      { stopId: 'STP-013', sequence: 2, travelTimeToNext: 6, distanceToNext: 2.3 },
      { stopId: 'STP-014', sequence: 3, travelTimeToNext: 14, distanceToNext: 5.7 },
      { stopId: 'STP-007', sequence: 4, travelTimeToNext: 0, distanceToNext: 0 }
    ],
    fareBase: 20,
    farePerKm: 2.8,
    isActive: true,
    totalDistanceKm: 15.2,
    estimatedTotalMinutes: 36
  },
  {
    id: 'R-105',
    code: 'PURPLE-EAST-105',
    name: 'Purple Line Trans-Yamuna Link',
    type: 'City Bus',
    color: '#8B5CF6',
    stops: [
      { stopId: 'STP-003', sequence: 1, travelTimeToNext: 15, distanceToNext: 6.0 },
      { stopId: 'STP-010', sequence: 2, travelTimeToNext: 18, distanceToNext: 7.5 },
      { stopId: 'STP-011', sequence: 3, travelTimeToNext: 5, distanceToNext: 1.8 },
      { stopId: 'STP-012', sequence: 4, travelTimeToNext: 0, distanceToNext: 0 }
    ],
    fareBase: 12,
    farePerKm: 2.2,
    isActive: true,
    totalDistanceKm: 15.3,
    estimatedTotalMinutes: 38
  },
  {
    id: 'R-106',
    code: 'ORANGE-HER-106',
    name: 'Orange Line Central Connector',
    type: 'Feeder Bus',
    color: '#F97316',
    stops: [
      { stopId: 'STP-006', sequence: 1, travelTimeToNext: 10, distanceToNext: 3.5 },
      { stopId: 'STP-002', sequence: 2, travelTimeToNext: 8, distanceToNext: 2.9 },
      { stopId: 'STP-003', sequence: 3, travelTimeToNext: 11, distanceToNext: 4.2 },
      { stopId: 'STP-009', sequence: 4, travelTimeToNext: 0, distanceToNext: 0 }
    ],
    fareBase: 10,
    farePerKm: 2.0,
    isActive: true,
    totalDistanceKm: 10.6,
    estimatedTotalMinutes: 29
  }
];

// Active Fleet of Buses with live coordinates and statuses
const initialBuses = [
  {
    id: 'BUS-101',
    regNumber: 'DL-01-EXP-2041',
    routeId: 'R-101',
    currentStopId: 'STP-002',
    nextStopId: 'STP-001',
    latitude: 28.6360,
    longitude: 77.2180,
    speedKmH: 34,
    passengerCount: 42,
    capacity: 60,
    occupancyStatus: 'MODERATE',
    status: 'IN_TRANSIT',
    driverName: 'Vikram Singh',
    etaMinutesToNextStop: 3.5,
    delayMinutes: 1.2
  },
  {
    id: 'BUS-102',
    regNumber: 'DL-01-EXP-2042',
    routeId: 'R-101',
    currentStopId: 'STP-004',
    nextStopId: 'STP-005',
    latitude: 28.5580,
    longitude: 77.2050,
    speedKmH: 38,
    passengerCount: 56,
    capacity: 60,
    occupancyStatus: 'CROWDED',
    status: 'IN_TRANSIT',
    driverName: 'Amit Verma',
    etaMinutesToNextStop: 4.8,
    delayMinutes: 0.5
  },
  {
    id: 'BUS-103',
    regNumber: 'DL-02-AIR-3011',
    routeId: 'R-102',
    currentStopId: 'STP-015',
    nextStopId: 'STP-007',
    latitude: 28.5380,
    longitude: 77.1180,
    speedKmH: 45,
    passengerCount: 28,
    capacity: 50,
    occupancyStatus: 'LOW',
    status: 'IN_TRANSIT',
    driverName: 'Ramesh Chand',
    etaMinutesToNextStop: 6.2,
    delayMinutes: 0.0
  },
  {
    id: 'BUS-104',
    regNumber: 'DL-02-AIR-3012',
    routeId: 'R-102',
    currentStopId: 'STP-001',
    nextStopId: 'STP-004',
    latitude: 28.6010,
    longitude: 77.2120,
    speedKmH: 28,
    passengerCount: 48,
    capacity: 50,
    occupancyStatus: 'CROWDED',
    status: 'IN_TRANSIT',
    driverName: 'Sunil Kumar',
    etaMinutesToNextStop: 5.1,
    delayMinutes: 2.8
  },
  {
    id: 'BUS-105',
    regNumber: 'DL-03-CIR-4101',
    routeId: 'R-103',
    currentStopId: 'STP-009',
    nextStopId: 'STP-010',
    latitude: 28.5610,
    longitude: 77.2460,
    speedKmH: 32,
    passengerCount: 35,
    capacity: 60,
    occupancyStatus: 'MODERATE',
    status: 'IN_TRANSIT',
    driverName: 'Manoj Tiwari',
    etaMinutesToNextStop: 3.9,
    delayMinutes: 0.0
  },
  {
    id: 'BUS-106',
    regNumber: 'DL-04-TECH-5201',
    routeId: 'R-104',
    currentStopId: 'STP-013',
    nextStopId: 'STP-014',
    latitude: 28.4890,
    longitude: 77.0840,
    speedKmH: 40,
    passengerCount: 52,
    capacity: 55,
    occupancyStatus: 'CROWDED',
    status: 'IN_TRANSIT',
    driverName: 'Deepak Joshi',
    etaMinutesToNextStop: 2.1,
    delayMinutes: 1.5
  },
  {
    id: 'BUS-107',
    regNumber: 'DL-05-EAST-6301',
    routeId: 'R-105',
    currentStopId: 'STP-010',
    nextStopId: 'STP-011',
    latitude: 28.5704,
    longitude: 77.2800,
    speedKmH: 36,
    passengerCount: 38,
    capacity: 60,
    occupancyStatus: 'MODERATE',
    status: 'IN_TRANSIT',
    driverName: 'Harish Rawat',
    etaMinutesToNextStop: 8.5,
    delayMinutes: 3.2
  },
  {
    id: 'BUS-108',
    regNumber: 'DL-06-CON-7401',
    routeId: 'R-106',
    currentStopId: 'STP-002',
    nextStopId: 'STP-003',
    latitude: 28.6340,
    longitude: 77.2320,
    speedKmH: 26,
    passengerCount: 22,
    capacity: 50,
    occupancyStatus: 'LOW',
    status: 'IN_TRANSIT',
    driverName: 'Sanjay Yadav',
    etaMinutesToNextStop: 4.2,
    delayMinutes: 0.0
  }
];

// Schedules for Peak and Off-Peak times
const initialSchedules = [
  {
    id: 'SCH-101',
    routeId: 'R-101',
    periodName: 'Morning Peak (08:00 - 11:00)',
    headwayMinutesCurrent: 12,
    headwayMinutesOptimized: 6,
    busesAllocatedCurrent: 4,
    busesAllocatedOptimized: 7,
    averagePassengerWaitCurrent: 6.0,
    averagePassengerWaitOptimized: 3.0,
    status: 'OPTIMIZATION_RECOMMENDED',
    firstDeparture: '08:00',
    lastDeparture: '11:00',
    totalTripsPlanned: 15
  },
  {
    id: 'SCH-102',
    routeId: 'R-101',
    periodName: 'Midday Regular (11:00 - 17:00)',
    headwayMinutesCurrent: 15,
    headwayMinutesOptimized: 14,
    busesAllocatedCurrent: 3,
    busesAllocatedOptimized: 3,
    averagePassengerWaitCurrent: 7.5,
    averagePassengerWaitOptimized: 7.0,
    status: 'BALANCED',
    firstDeparture: '11:15',
    lastDeparture: '17:00',
    totalTripsPlanned: 24
  },
  {
    id: 'SCH-103',
    routeId: 'R-101',
    periodName: 'Evening Peak (17:00 - 21:00)',
    headwayMinutesCurrent: 14,
    headwayMinutesOptimized: 7,
    busesAllocatedCurrent: 4,
    busesAllocatedOptimized: 8,
    averagePassengerWaitCurrent: 7.0,
    averagePassengerWaitOptimized: 3.5,
    status: 'OPTIMIZATION_RECOMMENDED',
    firstDeparture: '17:05',
    lastDeparture: '21:00',
    totalTripsPlanned: 17
  },
  {
    id: 'SCH-104',
    routeId: 'R-102',
    periodName: 'Morning Peak (08:00 - 11:00)',
    headwayMinutesCurrent: 20,
    headwayMinutesOptimized: 10,
    busesAllocatedCurrent: 3,
    busesAllocatedOptimized: 5,
    averagePassengerWaitCurrent: 10.0,
    averagePassengerWaitOptimized: 5.0,
    status: 'OPTIMIZATION_RECOMMENDED',
    firstDeparture: '08:00',
    lastDeparture: '11:00',
    totalTripsPlanned: 9
  },
  {
    id: 'SCH-105',
    routeId: 'R-102',
    periodName: 'Evening Peak (17:00 - 21:00)',
    headwayMinutesCurrent: 18,
    headwayMinutesOptimized: 9,
    busesAllocatedCurrent: 3,
    busesAllocatedOptimized: 6,
    averagePassengerWaitCurrent: 9.0,
    averagePassengerWaitOptimized: 4.5,
    status: 'OPTIMIZATION_RECOMMENDED',
    firstDeparture: '17:00',
    lastDeparture: '21:00',
    totalTripsPlanned: 13
  },
  {
    id: 'SCH-106',
    routeId: 'R-104',
    periodName: 'Morning Peak (08:00 - 11:00)',
    headwayMinutesCurrent: 15,
    headwayMinutesOptimized: 8,
    busesAllocatedCurrent: 3,
    busesAllocatedOptimized: 5,
    averagePassengerWaitCurrent: 7.5,
    averagePassengerWaitOptimized: 4.0,
    status: 'OPTIMIZATION_RECOMMENDED',
    firstDeparture: '08:10',
    lastDeparture: '11:00',
    totalTripsPlanned: 12
  }
];

// Rich Historical 24-hour Demand Pattern Generator
const generateHourlyDemand = () => {
  const demandList = [];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Peak multiplier profile
  const getMultiplier = (hour) => {
    if (hour >= 8 && hour <= 10) return 2.8; // Morning peak
    if (hour >= 17 && hour <= 20) return 3.1; // Evening peak
    if (hour >= 11 && hour <= 16) return 1.4; // Midday normal
    if (hour >= 6 && hour <= 7) return 1.6; // Early morning
    if (hour >= 21 && hour <= 23) return 1.1; // Late evening
    return 0.3; // Night
  };

  initialRoutes.forEach((route) => {
    hours.forEach((hour) => {
      const baseDemand = 80;
      const mult = getMultiplier(hour);
      const randomNoise = Math.floor(Math.sin(hour + route.name.length) * 15);
      const passengerCount = Math.max(12, Math.round(baseDemand * mult + randomNoise));
      const boardings = Math.round(passengerCount * 0.55);
      const alightings = Math.round(passengerCount * 0.45);

      demandList.push({
        id: `DEM-${route.id}-${hour}`,
        routeId: route.id,
        routeName: route.name,
        hour,
        hourFormatted: `${hour.toString().padStart(2, '0')}:00`,
        passengerCount,
        boardings,
        alightings,
        isPeakHour: (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20),
        loadFactorPercent: Math.min(100, Math.round((passengerCount / 220) * 100)),
        dayType: hour % 7 === 0 ? 'Weekend' : 'Weekday'
      });
    });
  });

  return demandList;
};

const initialDemand = generateHourlyDemand();

module.exports = {
  initialUsers,
  initialStops,
  initialRoutes,
  initialBuses,
  initialSchedules,
  initialDemand
};
