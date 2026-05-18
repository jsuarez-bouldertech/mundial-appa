import axios from 'axios';

export class DiscordNotifier {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  async notifyMatchStart(match) {
    const { teams, fixture, league } = match;

    const homeTeam = teams.home;
    const awayTeam = teams.away;
    const stadium = fixture.venue?.name || 'TBD';
    const matchTime = new Date(fixture.date).toLocaleString('es-ES');

    const embed = {
      title: '⚽ Comenzó el partido',
      color: 3066993,
      fields: [
        {
          name: `${homeTeam.name} vs ${awayTeam.name}`,
          value: `🏆 FIFA World Cup ${process.env.WORLD_CUP_SEASON}`,
          inline: false
        },
        {
          name: '🕒 Hora',
          value: matchTime,
          inline: true
        },
        {
          name: '📍 Estadio',
          value: stadium,
          inline: true
        }
      ],
      thumbnail: {
        url: league.logo
      },
      timestamp: new Date().toISOString()
    };

    return this._send({ embeds: [embed] });
  }

  async notifyMatchEnd(match) {
    const { teams, goals, score, fixture, league } = match;

    const homeTeam = teams.home;
    const awayTeam = teams.away;
    const homeGoals = goals.home;
    const awayGoals = goals.away;

    const events = await this._getGoalscorers(match);
    const goalsDescription = events.length > 0
      ? 'Goles:\n\n' + events.map(e => `• ${e}`).join('\n')
      : '';

    const embed = {
      title: '🏁 Final del partido',
      color: 16776960,
      fields: [
        {
          name: `${homeTeam.name} ${homeGoals} - ${awayGoals} ${awayTeam.name}`,
          value: `🏆 FIFA World Cup ${process.env.WORLD_CUP_SEASON}`,
          inline: false
        },
        {
          name: 'Resultado',
          value: goalsDescription || 'Sin goles registrados',
          inline: false
        }
      ],
      thumbnail: {
        url: league.logo
      },
      timestamp: new Date().toISOString()
    };

    return this._send({ embeds: [embed] });
  }

  async _getGoalscorers(match) {
    const goals = [];

    if (!match.events) return goals;

    for (const event of match.events) {
      if (event.type === 'Goal') {
        const minute = event.time.elapsed || 0;
        const player = event.player?.name || 'Desconocido';
        const assist = event.assist?.name ? ` (${event.assist.name})` : '';
        goals.push(`${player}${assist} ${minute}'`);
      }
    }

    return goals;
  }

  async _send(payload) {
    try {
      await axios.post(this.webhookUrl, payload);
      console.log('✅ Notification sent to Discord');
      return true;
    } catch (error) {
      console.error('❌ Error sending Discord notification:', error.message);
      return false;
    }
  }
}
