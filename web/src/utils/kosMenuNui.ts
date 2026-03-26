import { fetchNui } from '@/utils/fetchNui'
import type {
  ActiveMatchActionResponse,
  GetActiveMatchesResponse,
  GetLeaderboardGangsResponse,
  GetLeaderboardPlayersResponse,
  GetMatchHistoryResponse,
  GetOnlinePlayersResponse,
  MatchHistoryDetail,
} from '@/types/admin'
import type { UiConfig } from '@/types/ui'

export interface LeaderboardQueryPayload {
  limit: number
  offset: number
  query: string
}

export interface MatchHistoryPayload {
  limit: number
  offset: number
}

export interface ActiveMatchActionPayload {
  matchId: string
  action: string
  message?: string
  targetPlayerId?: number
  playerId?: number
  team?: 'teamA' | 'teamB'
  winsA?: number
  winsB?: number
}

export interface CreateMatchPayload {
  modeKey: 'kill_limit' | 'time_limit' | 'competitive'
  mapId: string
  killsToWinRound?: number
  roundSeconds?: number
  rounds: number
  teamAPlayerIds: number[]
  teamBPlayerIds: number[]
}

export interface CreateMatchResponse {
  ok: boolean
  matchId?: string
  error?: string
}

export function nuiGetLeaderboardPlayers(payload: LeaderboardQueryPayload, mockData?: GetLeaderboardPlayersResponse) {
  return fetchNui<GetLeaderboardPlayersResponse>('kosMenu:getLeaderboardPlayers', payload, mockData)
}

export function nuiGetLeaderboardGangs(payload: LeaderboardQueryPayload, mockData?: GetLeaderboardGangsResponse) {
  return fetchNui<GetLeaderboardGangsResponse>('kosMenu:getLeaderboardGangs', payload, mockData)
}

export function nuiGetMatchHistory(payload: MatchHistoryPayload, mockData?: GetMatchHistoryResponse) {
  return fetchNui<GetMatchHistoryResponse>('kosMenu:getMatchHistory', payload, mockData)
}

export function nuiGetMatchHistoryDetail(matchId: number, mockData?: MatchHistoryDetail | null) {
  return fetchNui<MatchHistoryDetail | null>('kosMenu:getMatchHistoryDetail', { id: matchId }, mockData)
}

export function nuiGetOnlinePlayers(mockData?: GetOnlinePlayersResponse) {
  return fetchNui<GetOnlinePlayersResponse>('kosMenu:getOnlinePlayers', {}, mockData)
}

export function nuiGetActiveMatches(mockData?: GetActiveMatchesResponse) {
  return fetchNui<GetActiveMatchesResponse>('kosMenu:getActiveMatches', {}, mockData)
}

export function nuiActiveMatchAction(payload: ActiveMatchActionPayload, mockData?: ActiveMatchActionResponse) {
  return fetchNui<ActiveMatchActionResponse>('kosMenu:activeMatchAction', payload, mockData)
}

export function nuiCreateMatch(payload: CreateMatchPayload, mockData?: CreateMatchResponse) {
  return fetchNui<CreateMatchResponse>('kosMenu:createMatch', payload, mockData)
}

export function nuiGetUiConfig(mockData?: UiConfig) {
  return fetchNui<UiConfig>('kos:getUiConfig', {}, mockData)
}

export function nuiGetUiLocale(mockData?: Record<string, string>) {
  return fetchNui<Record<string, string>>('kos:getUiLocale', {}, mockData)
}
