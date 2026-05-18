# ⚽ FIFA World Cup 2026 - Discord Notifier

Un notificador **ultra-liviano** para Discord que envía notificaciones cuando comienza y termina un partido del Mundial de Fútbol 2026.

## ✨ Características

- ✅ Notificación cuando **comienza** un partido
- ✅ Notificación cuando **termina** un partido con goles
- ✅ Polling inteligente: 30 min normalmente, 5 min durante partidos en vivo
- ✅ Cero spam: solo estados críticos
- ✅ Persistencia local: nunca envía notificaciones duplicadas
- ✅ Extremadamente liviano: <50 líneas de lógica principal

## 📦 Stack

- **Node.js** - Runtime
- **Axios** - HTTP client
- **API-Football v3** - Datos de partidos
- **Discord Webhook** - Notificaciones

## 🚀 Setup

### Opción 1: Ejecutar Localmente

```bash
# 1. Instalar dependencias
npm install

# 2. El .env ya está configurado con tus credenciales
# API_KEY y DISCORD_WEBHOOK_URL ya están setup

# 3. Ejecutar
npm start

# Desarrollo (con auto-reload)
npm run dev
```

### Opción 2: Deploy en Railway (Recomendado) 🎯

Railway ejecuta tu app 24/7 sin necesidad de una computadora encendida.

1. Ve a [railway.app](https://railway.app)
2. Conecta tu repo de GitHub
3. Configura las variables de entorno
4. ¡Listo! 🚀

## 📊 Cómo funciona

1. **Polling diario**: Obtiene todos los partidos del Mundial de hoy
2. **Detección de estado**: Monitorea cambios de estado
3. **Notificaciones**: Envía a Discord solo cuando:
   - Estado cambia de `NS` (Not Started) → `LIVE`
   - Estado cambia de `LIVE` → `FT` (Full Time)
4. **Adaptación dinámica**: Si hay partidos en vivo, aumenta frecuencia de polling

## 📁 Estructura

```
src/
├── index.js      # Entry point + polling logic
├── api.js        # API-Football wrapper
├── discord.js    # Discord webhook sender
└── state.js      # State manager (persistencia)
data/
└── match_state.json  # Local state (auto-generado)
```

## 📊 Consumo de API

**Máximo por día**: ~96 requests
- 30 min entre polls = 48 requests
- 5 min durante partidos (4 horas máximo) = 48 requests
- **Total**: 96 requests/día (bajo el límite de 100 del plan free)

## 🔧 Customización

### Cambiar horarios de polling

En `.env`:

```env
POLLING_INTERVAL_NORMAL=1800000    # 30 minutos
POLLING_INTERVAL_LIVE=300000       # 5 minutos
```

### Cambiar liga o temporada

```env
WORLD_CUP_LEAGUE_ID=1
WORLD_CUP_SEASON=2026
```

## 🐛 Troubleshooting

### Errores de autenticación API

```
❌ Error fetching matches: Request failed with status code 403
```

Verifica que `API_KEY` sea válido en `.env`.

### Webhook no funciona

```
❌ Error sending Discord notification: Request failed with status code 401
```

Verifica que `DISCORD_WEBHOOK_URL` sea válido y no haya expirado.

### No hay datos de partidos

Asegúrate que:
1. Hay partidos del Mundial 2026 hoy
2. `WORLD_CUP_LEAGUE_ID=1` es correcto
3. `WORLD_CUP_SEASON=2026` es correcto

## 📝 Logs

```
🌍 FIFA World Cup 2026 - Discord Notifier
⚙️  Initialized

🔍 Checking matches... (10:30:45)
✅ Match started: Argentina vs Brasil
📊 Status: 1 matches, 1 live
📊 Live matches detected. Polling every 5 minutes

🔍 Checking matches... (10:35:45)
✅ Match ended: Argentina 2 - 1 Brasil
📊 Status: 1 matches, 0 live
```

## 🚀 Deployment

### Railway (Ultra-fácil - Recomendado)

```
1. Conectar GitHub a Railway
2. Configurar 6 variables de entorno
3. ¡Auto-deploy! 🎉
```

### Docker (Docker Compose)

```bash
docker-compose up -d
```

### PM2 (VPS/Servidor Local)

```bash
npm install -g pm2
pm2 start src/index.js --name "world-cup-notifier"
pm2 startup
pm2 save
```

## 🎯 Próximos Pasos

1. **Push a GitHub**: `git push -u origin main`
2. **Deploy a Railway**: Conecta tu repo en railway.app
3. **Monitor**: Revisa los logs en Railway

## 💡 Tips

- Railway ofrece $5 créditos mensuales gratis (más que suficiente)
- La app se reinicia automáticamente si falla
- Puedes cambiar el código, hacer push, y Railway redeploy automáticamente
- Los logs están disponibles 24/7 en el dashboard de Railway

## 📄 Licencia

MIT

---

**Hecho para el Mundial de Fútbol 2026** ⚽🏆
Powered by Node.js + Discord Webhook + API-Football
