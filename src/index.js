import 'dotenv/config';
import { APIFootball } from './api.js';
import { DiscordNotifier } from './discord.js';
import { StateManager } from './state.js';

const api = new APIFootball(process.env.API_KEY);
const notifier = new DiscordNotifier(process.env.DISCORD_WEBHOOK_URL);
const state = new StateManager();

let hasLiveMatches = false;
let pollingInterval = parseInt(process.env.POLLING_INTERVAL_NORMAL);

async function checkMatches() {
  console.log(`\n🔍 Checking matches... (${new Date().toLocaleTimeString()})`);

  const matches = await api.getTodayMatches();

  if (matches.length === 0) {
    console.log('ℹ️  No matches today');
    hasLiveMatches = false;
    return;
  }

  let liveCount = 0;

  for (const match of matches) {
    const fixtureId = match.fixture.id;
    const status = match.fixture.status.short;
    const previousStatus = state.getMatchStatus(fixtureId);

    // Match started: NS -> LIVE
    if (previousStatus !== 'LIVE' && status === 'LIVE') {
      if (!state.hasNotified(fixtureId, 'START')) {
        console.log(`✅ Match started: ${match.teams.home.name} vs ${match.teams.away.name}`);
        await notifier.notifyMatchStart(match);
        state.markNotified(fixtureId, 'START');
      }
    }

    // Match ended: LIVE -> FT/AET/PEN
    if (previousStatus === 'LIVE' && ['FT', 'AET', 'PEN'].includes(status)) {
      if (!state.hasNotified(fixtureId, 'END')) {
        const fullMatch = await api.getMatch(fixtureId);
        if (fullMatch) {
          console.log(`✅ Match ended: ${fullMatch.teams.home.name} vs ${fullMatch.teams.away.name}`);
          await notifier.notifyMatchEnd(fullMatch);
          state.markNotified(fixtureId, 'END');
        }
      }
    }

    // Update status
    state.setMatchStatus(fixtureId, status);

    if (status === 'LIVE') {
      liveCount++;
    }
  }

  // Adjust polling based on live matches
  const newHasLiveMatches = liveCount > 0;
  if (newHasLiveMatches !== hasLiveMatches) {
    hasLiveMatches = newHasLiveMatches;
    const newInterval = hasLiveMatches
      ? parseInt(process.env.POLLING_INTERVAL_LIVE)
      : parseInt(process.env.POLLING_INTERVAL_NORMAL);

    if (newInterval !== pollingInterval) {
      pollingInterval = newInterval;
      const minutes = Math.round(pollingInterval / 1000 / 60);
      console.log(`📊 Live matches detected. Polling every ${minutes} minutes`);
    }
  }

  console.log(`📊 Status: ${matches.length} matches, ${liveCount} live`);
}

async function start() {
  console.log('🌍 FIFA World Cup 2026 - Discord Notifier');
  console.log('⚙️  Initialized');

  await checkMatches();

  setInterval(checkMatches, pollingInterval);
}

start().catch(console.error);
