import 'dotenv/config';
import { DiscordNotifier } from './discord.js';

const notifier = new DiscordNotifier(process.env.DISCORD_WEBHOOK_URL);

// Mock match data
const mockMatch = {
  fixture: {
    id: 999999,
    date: new Date(Date.now() + 20 * 60000).toISOString(),
    venue: {
      name: 'MetLife Stadium',
      city: 'East Rutherford, New Jersey'
    },
    referee: 'Javier Castrilli (Argentina)',
    status: {
      short: 'NS'
    }
  },
  teams: {
    home: {
      id: 1,
      name: 'Argentina',
      logo: 'https://media.api-sports.io/football/teams/1.png'
    },
    away: {
      id: 2,
      name: 'Brasil',
      logo: 'https://media.api-sports.io/football/teams/2.png'
    }
  },
  league: {
    id: 1,
    logo: 'https://media.api-sports.io/football/leagues/1.png'
  },
  goals: {
    home: 2,
    away: 1
  },
  events: [
    {
      type: 'Goal',
      time: { elapsed: 15 },
      player: { name: 'Lionel Messi' },
      assist: { name: 'Ángel Di María' }
    },
    {
      type: 'Goal',
      time: { elapsed: 42 },
      player: { name: 'Ángel Di María' },
      assist: null
    },
    {
      type: 'Goal',
      time: { elapsed: 88 },
      player: { name: 'Neymar Jr' },
      assist: { name: 'Rodrygo Goes' }
    }
  ]
};

const mockLineups = [
  {
    team: {
      id: 1,
      name: 'Argentina'
    },
    formation: '4-3-3',
    coach: {
      name: 'Lionel Scaloni'
    },
    startXI: [
      { player: { name: 'Gonzalo Montiel' } },
      { player: { name: 'Nicolás Otamendi' } },
      { player: { name: 'Marcos Acuña' } },
      { player: { name: 'Nahuel Molina' } },
      { player: { name: 'Alexis Mac Allister' } },
      { player: { name: 'Enzo Fernández' } },
      { player: { name: 'Leandro Paredes' } },
      { player: { name: 'Ángel Di María' } },
      { player: { name: 'Alejandro Garnacho' } },
      { player: { name: 'Julián Álvarez' } },
      { player: { name: 'Lionel Messi' } }
    ]
  },
  {
    team: {
      id: 2,
      name: 'Brasil'
    },
    formation: '5-2-3',
    coach: {
      name: 'Carlo Ancelotti'
    },
    startXI: [
      { player: { name: 'Danilo' } },
      { player: { name: 'Eder Militão' } },
      { player: { name: 'Marquinhos' } },
      { player: { name: 'Alex Sandro' } },
      { player: { name: 'Wendell' } },
      { player: { name: 'Bruno Guimarães' } },
      { player: { name: 'Lucas Paquetá' } },
      { player: { name: 'Vinícius Júnior' } },
      { player: { name: 'Rodrygo Goes' } },
      { player: { name: 'Neymar Jr' } },
      { player: { name: 'Richarlison' } }
    ]
  }
];

async function runTests() {
  console.log('\n🧪 Testing Discord Notifications...\n');

  try {
    console.log('1️⃣  Sending PRE-MATCH notification (15 min before)...');
    await notifier.notifyMatchIn15Minutes(mockMatch);
    console.log('✅ Sent to Discord\n');

    // Wait 2 seconds between messages
    await new Promise(r => setTimeout(r, 2000));

    console.log('2️⃣  Sending LINEUPS notification...');
    await notifier.notifyLineups(mockMatch, mockLineups);
    console.log('✅ Sent to Discord\n');

    await new Promise(r => setTimeout(r, 2000));

    console.log('3️⃣  Sending MATCH START notification...');
    await notifier.notifyMatchStart(mockMatch);
    console.log('✅ Sent to Discord\n');

    await new Promise(r => setTimeout(r, 2000));

    console.log('4️⃣  Sending MATCH END notification...');
    await notifier.notifyMatchEnd(mockMatch);
    console.log('✅ Sent to Discord\n');

    console.log('✅ All test notifications sent successfully!');
    console.log('📺 Check your Discord channel to see how they look\n');

  } catch (error) {
    console.error('❌ Error sending test notifications:', error.message);
    process.exit(1);
  }
}

runTests();
