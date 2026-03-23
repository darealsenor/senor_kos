# Redzones NUI Structure

## Components

| Component | Purpose |
|-----------|---------|
| **hud/MiniLeaderboard** | Top 5 players, TAB hint for big scoreboard. Shown when in zone. |
| **scoreboard/BigScoreboard** | Full scoreboard (TAB toggle). |
| **end-results/EndOfZoneResults** | End screen with stats and top 3. Shown when zone ends. |
| **admin/AdminPanel** | Create/manage zones and settings. |

## Store (Jotai)

| Store | Atoms | Purpose |
|-------|-------|---------|
| **zone.state** | `zonesAtom`, `currentZoneAtom` | All zones, current zone (when in one) |
| **leaderboard.state** | `leaderboardAtom`, `endResultsAtom` | Live leaderboard, end-of-zone results |
| **ui.state** | `nuiViewAtom`, `scoreboardOpenAtom` | Active view, scoreboard toggle |
| **admin.state** | `isAdminAtom`, `adminZonesAtom`, `createZoneFormAtom` | Admin state, zones list, create form |

## Types (from backend)

- **Zone** – Zone data from `redzone:get()` (ADD_ZONE payload)
- **ZonePlayerStats** – kills, deaths, streak per player
- **ZoneLeaderboard** – zone + sorted players + totalKills
- **EndOfZoneResults** – zone ended, top 3, stats
- **CreateZoneInput** – admin create form payload

## NUI Events (to wire)

- `setVisible` – show/hide NUI
- `zoneJoined` – player entered zone (zone, leaderboard snapshot)
- `leaderboardUpdate` – leaderboard data refresh
- `zoneEnded` – zone expired (end results)
- `adminOpen` – open admin panel (zones list)
- `zonesUpdate` – zones list changed (ADD/REMOVE)
