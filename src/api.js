import axios from 'axios';

const API_BASE_URL = 'https://v3.football.api-sports.io';

export class APIFootball {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });
  }

  async getTodayMatches() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const response = await this.client.get('/fixtures', {
        params: {
          league: process.env.WORLD_CUP_LEAGUE_ID,
          season: process.env.WORLD_CUP_SEASON,
          date: today
        }
      });

      return response.data.response || [];
    } catch (error) {
      console.error('❌ Error fetching matches:', error.message);
      return [];
    }
  }

  async getMatch(fixtureId) {
    try {
      const response = await this.client.get('/fixtures', {
        params: { id: fixtureId }
      });

      return response.data.response?.[0] || null;
    } catch (error) {
      console.error(`❌ Error fetching match ${fixtureId}:`, error.message);
      return null;
    }
  }
}
