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
  let nearbyMatches = 0;

  for (const match of matches) {
    const fixtureId = match.fixture.id;
    const status = match.fixture.status.short;
    const previousStatus = state.getMatchStatus(fixtureId);
    const minutesUntilMatch = api.getMinutesUntilMatch(match.fixture.date);
    const matchStartWindow = parseInt(process.env.MATCH_START_WINDOW);

    // Pre-match notification: 15-20 minutes before
    if (status === 'NS' && minutesUntilMatch > 0 && minutesUntilMatch <= 20) {
      if (!state.hasPreMatchBeenNotified(fixtureId)) {
        console.log(`⏰ Pre-match: ${match.teams.home.name} vs ${match.teams.away.name}`);
        await notifier.notifyMatchIn15Minutes(match);
        state.markPreMatchNotified(fixtureId);
      }
      nearbyMatches++;
    }

    // Lineups notification: when available (20-40 min before)
    if (status === 'NS' && minutesUntilMatch > 0 && minutesUntilMatch <= 40) {
      if (!state.hasLineupBeenNotified(fixtureId)) {
        const lineups = await api.getLineups(fixtureId);
        if (lineups.length > 0) {
          console.log(`📋 Lineups available: ${match.teams.home.name} vs ${match.teams.away.name}`);
          await notifier.notifyLineups(match, lineups);
          state.markLineupNotified(fixtureId);
        }
      }
      nearbyMatches++;
    }

    // Match started: NS -> LIVE
    if (previousStatus !== 'LIVE' && status === 'LIVE') {
      if (!state.hasNotified(fixtureId, 'START')) {
        console.log(`✅ Match started: ${match.teams.home.name} vs ${match.teams.away.name}`);
        await notifier.notifyMatchStart(match);
        state.markNotified(fixtureId, 'START');
      }
    }

    // Match ended: LIVE -> FT/AET/PEN (use cached match data from getTodayMatches)
    if (previousStatus === 'LIVE' && ['FT', 'AET', 'PEN'].includes(status)) {
      if (!state.hasNotified(fixtureId, 'END')) {
        console.log(`✅ Match ended: ${match.teams.home.name} vs ${match.teams.away.name}`);
        await notifier.notifyMatchEnd(match);
        state.markNotified(fixtureId, 'END');
      }
    }

    // Update status
    state.setMatchStatus(fixtureId, status);

    if (status === 'LIVE') {
      liveCount++;
    }
  }

  // Smart polling: increase frequency when matches are nearby
  const shouldIncreasePoll = nearbyMatches > 0 || liveCount > 0;
  const newHasLiveMatches = liveCount > 0 || nearbyMatches > 0;

  if (newHasLiveMatches !== hasLiveMatches) {
    hasLiveMatches = newHasLiveMatches;
    const newInterval = shouldIncreasePoll
      ? parseInt(process.env.POLLING_INTERVAL_LIVE)
      : parseInt(process.env.POLLING_INTERVAL_NORMAL);

    if (newInterval !== pollingInterval) {
      pollingInterval = newInterval;
      const minutes = Math.round(pollingInterval / 1000 / 60);
      console.log(`📊 Polling interval: every ${minutes} min (${shouldIncreasePoll ? 'match nearby' : 'normal mode'})`);
    }
  }

  console.log(`📊 Status: ${matches.length} total, ${liveCount} live, ${nearbyMatches} nearby`);
}

async function start() {
  console.log('🌍 FIFA World Cup 2026 - Discord Notifier');
  console.log('⚙️  Initialized');

  await checkMatches();

  setInterval(checkMatches, pollingInterval);
}

start().catch(console.error);
