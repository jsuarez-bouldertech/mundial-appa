import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, '../data/match_state.json');

export class StateManager {
  constructor() {
    this._ensureDirectory();
    this.state = this._loadState();
  }

  _ensureDirectory() {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  _loadState() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const data = fs.readFileSync(STATE_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('⚠️  Could not load state file, starting fresh:', error.message);
    }
    return {};
  }

  _saveState() {
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (error) {
      console.error('❌ Error saving state:', error.message);
    }
  }

  getMatchStatus(fixtureId) {
    return this.state[fixtureId]?.status || null;
  }

  setMatchStatus(fixtureId, status) {
    if (!this.state[fixtureId]) {
      this.state[fixtureId] = {};
    }
    this.state[fixtureId].status = status;
    this.state[fixtureId].lastUpdated = new Date().toISOString();
    this._saveState();
  }

  hasNotified(fixtureId, eventType) {
    const match = this.state[fixtureId];
    if (!match) return false;
    return match.notifications?.includes(eventType) || false;
  }

  markNotified(fixtureId, eventType) {
    if (!this.state[fixtureId]) {
      this.state[fixtureId] = {};
    }
    if (!this.state[fixtureId].notifications) {
      this.state[fixtureId].notifications = [];
    }
    this.state[fixtureId].notifications.push(eventType);
    this._saveState();
  }

  hasLineupBeenNotified(fixtureId) {
    return this.state[fixtureId]?.lineupNotified || false;
  }

  markLineupNotified(fixtureId) {
    if (!this.state[fixtureId]) {
      this.state[fixtureId] = {};
    }
    this.state[fixtureId].lineupNotified = true;
    this._saveState();
  }

  hasPreMatchBeenNotified(fixtureId) {
    return this.state[fixtureId]?.preMatchNotified || false;
  }

  markPreMatchNotified(fixtureId) {
    if (!this.state[fixtureId]) {
      this.state[fixtureId] = {};
    }
    this.state[fixtureId].preMatchNotified = true;
    this._saveState();
  }
}
