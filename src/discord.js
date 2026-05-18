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
      title: '⚽ COMENZÓ EL PARTIDO',
      color: 3066993,
      fields: [
        {
          name: `🇦🇷 ${homeTeam.name}`,
          value: `[Escudo](${homeTeam.logo})`,
          inline: true
        },
        {
          name: `🆚 EN VIVO 🆚`,
          value: `​`,
          inline: true
        },
        {
          name: `${awayTeam.name} 🇧🇷`,
          value: `[Escudo](${awayTeam.logo})`,
          inline: true
        },
        {
          name: '🏆 Torneo',
          value: `FIFA World Cup ${process.env.WORLD_CUP_SEASON}`,
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
        url: homeTeam.logo
      },
      image: {
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
      title: '🏁 FINAL DEL PARTIDO',
      color: 16776960,
      fields: [
        {
          name: `🇦🇷 ${homeTeam.name}`,
          value: `[Escudo](${homeTeam.logo})\n**${homeGoals} GOLES**`,
          inline: true
        },
        {
          name: `RESULTADO`,
          value: `**${homeGoals} - ${awayGoals}**`,
          inline: true
        },
        {
          name: `${awayTeam.name} 🇧🇷`,
          value: `[Escudo](${awayTeam.logo})\n**${awayGoals} GOLES**`,
          inline: true
        },
        {
          name: '🏆 Torneo',
          value: `FIFA World Cup ${process.env.WORLD_CUP_SEASON}`,
          inline: false
        },
        {
          name: 'Goles',
          value: goalsDescription || 'Sin goles registrados',
          inline: false
        }
      ],
      thumbnail: {
        url: homeTeam.logo
      },
      image: {
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

  async notifyMatchIn15Minutes(match) {
    const { teams, fixture, league } = match;

    const homeTeam = teams.home;
    const awayTeam = teams.away;
    const stadium = fixture.venue?.name || 'TBD';
    const city = fixture.venue?.city || '';
    const matchTime = new Date(fixture.date).toLocaleString('es-ES');
    const referee = match.fixture.referee || 'TBD';

    const embed = {
      title: '⏰ COMIENZA EN 15 MINUTOS',
      color: 16766464,
      fields: [
        {
          name: `🇦🇷 ${homeTeam.name}`,
          value: `[Escudo](${homeTeam.logo})`,
          inline: true
        },
        {
          name: `🆚 VS 🆚`,
          value: `​`,
          inline: true
        },
        {
          name: `${awayTeam.name} 🇧🇷`,
          value: `[Escudo](${awayTeam.logo})`,
          inline: true
        },
        {
          name: '🏆 Torneo',
          value: `FIFA World Cup ${process.env.WORLD_CUP_SEASON}`,
          inline: false
        },
        {
          name: '🕒 Hora',
          value: matchTime,
          inline: true
        },
        {
          name: '📍 Estadio',
          value: `${stadium}${city ? ` - ${city}` : ''}`,
          inline: true
        },
        {
          name: '🏆 Árbitro',
          value: referee,
          inline: false
        }
      ],
      thumbnail: {
        url: homeTeam.logo
      },
      image: {
        url: league.logo
      },
      timestamp: new Date().toISOString()
    };

    return this._send({ embeds: [embed] });
  }

  async notifyLineups(match, lineups) {
    const { teams, fixture, league } = match;

    const homeTeam = teams.home;
    const awayTeam = teams.away;

    const homeLineup = lineups.find(l => l.team.id === homeTeam.id);
    const awayLineup = lineups.find(l => l.team.id === awayTeam.id);

    const formatLineup = (team, lineup) => {
      if (!lineup) return 'No disponible';

      const formation = lineup.formation || 'TBD';
      const coach = lineup.coach?.name || 'TBD';

      let players = '';
      if (lineup.startXI && lineup.startXI.length > 0) {
        const playerNames = lineup.startXI.map(p => p.player.name).slice(0, 5).join(', ');
        players = `XI: ${playerNames}...`;
      }

      return `[${team.logo}](${team.logo})\n**Formación: ${formation}**\nDT: ${coach}\n${players}`;
    };

    const embed = {
      title: '📋 ALINEACIONES CONFIRMADAS',
      color: 16776960,
      fields: [
        {
          name: `🇦🇷 ${homeTeam.name}`,
          value: formatLineup(homeTeam, homeLineup),
          inline: true
        },
        {
          name: `🇧🇷 ${awayTeam.name}`,
          value: formatLineup(awayTeam, awayLineup),
          inline: true
        },
        {
          name: '⚽ El partido comenzará en breve',
          value: `${homeTeam.name} vs ${awayTeam.name}`,
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
