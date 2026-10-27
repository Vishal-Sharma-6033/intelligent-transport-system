const fs = require('fs');
const path = require('path');
const {
  initialUsers,
  initialStops,
  initialRoutes,
  initialBuses,
  initialSchedules,
  initialDemand
} = require('./seedData');

const DATA_FILE = path.join(__dirname, '../../data/store.json');

class DatabaseStore {
  constructor() {
    this.users = [];
    this.stops = [];
    this.routes = [];
    this.buses = [];
    this.schedules = [];
    this.demand = [];
    this.isInitialized = false;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data = JSON.parse(raw);
        this.users = data.users || initialUsers;
        this.stops = data.stops || initialStops;
        this.routes = data.routes || initialRoutes;
        this.buses = data.buses || initialBuses;
        this.schedules = data.schedules || initialSchedules;
        this.demand = data.demand || initialDemand;
        console.log('✅ In-Memory Data Store restored from local storage.');
      } else {
        this.resetToSeed();
      }
    } catch (err) {
      console.warn('⚠️ Error reading store.json, loading fresh seed data:', err.message);
      this.resetToSeed();
    }
    this.isInitialized = true;
  }

  resetToSeed() {
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.stops = JSON.parse(JSON.stringify(initialStops));
    this.routes = JSON.parse(JSON.stringify(initialRoutes));
    this.buses = JSON.parse(JSON.stringify(initialBuses));
    this.schedules = JSON.parse(JSON.stringify(initialSchedules));
    this.demand = JSON.parse(JSON.stringify(initialDemand));
    this.persist();
    console.log('🚀 In-Memory Data Store seeded with initial transit network data.');
  }

  persist() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const state = {
        users: this.users,
        stops: this.stops,
        routes: this.routes,
        buses: this.buses,
        schedules: this.schedules,
        demand: this.demand,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist store.json:', err.message);
    }
  }

  // Model-like helper accessors
  collection(name) {
    if (!this[name]) {
      throw new Error(`Collection ${name} does not exist in store.`);
    }

    const target = this[name];
    const self = this;

    return {
      find: (filter = {}) => {
        return target.filter((item) => {
          for (let key in filter) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        });
      },
      findById: (id) => {
        return target.find((item) => item.id === id || item._id === id);
      },
      findOne: (filter = {}) => {
        return target.find((item) => {
          for (let key in filter) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        });
      },
      create: (item) => {
        const record = {
          id: item.id || `${name.toUpperCase().slice(0, 3)}-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...item
        };
        target.push(record);
        self.persist();
        return record;
      },
      findByIdAndUpdate: (id, updates) => {
        const index = target.findIndex((item) => item.id === id || item._id === id);
        if (index === -1) return null;
        target[index] = { ...target[index], ...updates, updatedAt: new Date().toISOString() };
        self.persist();
        return target[index];
      },
      findByIdAndDelete: (id) => {
        const index = target.findIndex((item) => item.id === id || item._id === id);
        if (index === -1) return null;
        const deleted = target.splice(index, 1)[0];
        self.persist();
        return deleted;
      },
      count: () => target.length,
      getAll: () => target
    };
  }
}

const db = new DatabaseStore();

module.exports = db;
