export interface UiColorScheme {
  primary?: string
  backgroundDark?: string
  teamA?: string
  teamB?: string
}

export interface UiComponentsConfig {
  roundHud?: boolean
  scoreboard?: boolean
  killfeed?: boolean
}

export interface UiConfig {
  colorScheme?: UiColorScheme
  components?: UiComponentsConfig
}
