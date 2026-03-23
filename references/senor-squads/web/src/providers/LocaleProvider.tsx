import { Context, createContext, useContext, useEffect, useState } from 'react'
import { debugData } from '../utils/debugData'
import { fetchNui } from '../utils/fetchNui'
import { useNuiEvent } from '../hooks/useNuiEvent'

interface Locale {
  ui_container_title: string
  ui_container_label: string
  ui_toggle_active: string
  ui_toggle_disable: string

  ui_settings: string
  ui_hud_toggle: string
  ui_hud_health: string
  ui_hud_armor: string
  ui_tags: string
  ui_tags_label: string
  ui_blips: string
  ui_blips_label: string
  ui_blip_select_color: string
  ui_voicechat: string
  ui_voicechat_label: string
  ui_hud_position: string
  ui_hud_position_label: string

  ui_hud_minimized: string
  ui_hud_minimized_label: string

  ui_hud_radio_icon: string
  ui_hud_radio_icon_label: string

  ui_notifications_chat: string
  ui_notifications_chat_label: string
  ui_hud_max_players: string
  ui_hud_max_players_label: string
  ui_hud_edit_indicator: string
  ui_settings_reset: string

  ui_create_squad_button: string
  ui_create_squad_name: string
  ui_create_squad_label: string
  ui_create_squad_placeholder: string
  ui_create_squad_photo: string
  ui_create_squad_photo_label: string
  ui_create_squad_photo_placeholder: string
  ui_create_squad_password: string
  ui_create_squad_password_label: string
  ui_create_squad_password_placeholder: string
  ui_create_squad_limit: string
  ui_create_squad_limit_label: string
  ui_create_squad_create: string

  ui_edit_squad: string
  ui_exit_squad: string

  ui_browse_create_squad: string
  ui_browse_search_placeholder: string
  ui_browse_password_placeholder: string
  ui_browse_login_password: string
  ui_browse_join_squad: string
  ui_browse_no_squads: string
  ui_browse_no_squads_filtered: string
  ui_browse_no_squads_description: string

  ui_chat: string
  ui_chat_players: string
}

debugData([
  {
    action: 'setLocale',
    data: {
      ui_container_title: 'Squad System',
      ui_container_label:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore',
      ui_toggle_active: 'ON',
      ui_toggle_disable: 'OFF',

      // Settings
      ui_settings: 'Settings',
      ui_hud_toggle: 'Show/Hide HUD',
      ui_hud_health: 'Health Color',
      ui_hud_armor: 'Armor Color',
      ui_tags: 'Show/Hide Nametags',
      ui_tags_label: 'Determine nametags visibility.',
      ui_blips: 'Show/Hide Blips',
      ui_blips_label: 'Determine blips visibility.',
      ui_blip_select_color: 'Select Color',
      ui_voicechat: 'Squad Voice Chat',
      ui_voicechat_label: 'Determine blips visibility.',
      ui_hud_position: 'Hud Position',
      ui_hud_position_label: "Determine Hud's location",
      ui_hud_minimized: 'HUD Minimized',
      ui_hud_minimized_label: 'Hide armor bars and reduce sizes for a compact view.',
      ui_hud_radio_icon: 'Show Radio Icon',
      ui_hud_radio_icon_label: 'Display talking indicator icon on squad HUD.',
      ui_notifications_chat: 'Squad Chat Notifications',
      ui_notifications_chat_label: 'Enable in-game alerts for new squad chat messages.',
      ui_hud_max_players: 'HUD Maximum Players',
      ui_hud_max_players_label: 'Choose whether to display an infinity sign or a number.',
      ui_hud_edit_indicator: 'HUD POSITION MODE',
      ui_settings_reset: 'Reset Settings',

      ui_create_squad_button: 'Create Squad',
      ui_create_squad_name: 'Squad Name',
      ui_create_squad_label: 'Enter a unique squad name.',
      ui_create_squad_placeholder: 'Your squad name...',
      ui_create_squad_photo: 'Squad Photo',
      ui_create_squad_photo_label: 'Upload a photo for your squad.',
      ui_create_squad_photo_placeholder: 'Enter a URL...',
      ui_create_squad_password: 'Squad Password',
      ui_create_squad_password_label: 'Enable password protection for your squad.',
      ui_create_squad_password_placeholder: 'Enter a password...',
      ui_create_squad_limit: 'Squad Limit',
      ui_create_squad_limit_label: 'Determine the maximum squad members.',
      ui_create_squad_create: 'Create Squad',

      ui_edit_squad: 'Edit Squad',
      ui_exit_squad: 'Exit the squad',
      ui_browse_create_squad: 'Create Squad',
      ui_browse_search_placeholder: 'Search...',
      ui_browse_join_squad: 'Join',
      ui_browse_password_placeholder: 'Enter a password...',
      ui_browse_login_password: 'Login',
      ui_browse_no_squads: 'No squads available right now',
      ui_browse_no_squads_filtered: 'No squads found matching your search',
      ui_browse_no_squads_description: 'Create your own squad and start playing with friends!',

      ui_chat: 'Chat',
      ui_chat_players: 'players',
    },
  },
])

interface LocaleContextValue {
  locale: Locale
  setLocale: (locales: Locale) => void
}

const LocaleCtx = createContext<LocaleContextValue | null>(null)

const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>({
    ui_container_title: 'Squad System',
    ui_container_label:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore',
    ui_toggle_active: 'ON',
    ui_toggle_disable: 'OFF',

    // Settings
    ui_settings: 'Settings',
    ui_hud_toggle: 'Show/Hide HUD',
    ui_hud_health: 'Health Color',
    ui_hud_armor: 'Armor Color',
    ui_tags: 'Show/Hide Nametags',
    ui_tags_label: 'Determine nametags visibility.',
    ui_blips: 'Show/Hide Blips',
    ui_blips_label: 'Determine blips visibility.',
    ui_blip_select_color: 'Select Color',
    ui_voicechat: 'Squad Voice Chat',
    ui_voicechat_label: 'Determine blips visibility.',
    ui_hud_position: 'Hud Position',
    ui_hud_position_label: "Determine Hud's location",
    ui_hud_minimized: 'HUD Minimized',
    ui_hud_minimized_label: 'Hide armor bars and reduce sizes for a compact view.',
    ui_hud_radio_icon: 'Show Radio Icon',
    ui_hud_radio_icon_label: 'Display talking indicator icon on squad HUD.',
    ui_notifications_chat: 'Squad Chat Notifications',
    ui_notifications_chat_label: 'Enable in-game alerts for new squad chat messages.',
    ui_hud_max_players: 'HUD Maximum Players',
    ui_hud_max_players_label: 'Choose whether to display an infinity sign or a number.',
    ui_hud_edit_indicator: 'HUD POSITION MODE',
    ui_settings_reset: 'Reset Settings',

    ui_create_squad_button: 'Create Squad',
    ui_create_squad_name: 'Squad Name',
    ui_create_squad_label: 'Enter a unique squad name.',
    ui_create_squad_placeholder: 'Your squad name...',
    ui_create_squad_photo: 'Squad Photo',
    ui_create_squad_photo_label: 'Upload a photo for your squad.',
    ui_create_squad_photo_placeholder: 'Enter a URL...',
    ui_create_squad_password: 'Squad Password',
    ui_create_squad_password_label: 'Enable password protection for your squad.',
    ui_create_squad_password_placeholder: 'Enter a password...',
    ui_create_squad_limit: 'Squad Limit',
    ui_create_squad_limit_label: 'Determine the maximum squad members.',
    ui_create_squad_create: 'Create Squad',

    ui_edit_squad: 'Edit Squad',
    ui_exit_squad: 'Exit the squad',
    ui_browse_create_squad: 'Create Squad',
    ui_browse_search_placeholder: 'Search...',
    ui_browse_join_squad: 'Join',
    ui_browse_password_placeholder: 'Enter a password...',
    ui_browse_login_password: 'Login',
    ui_browse_no_squads: 'No squads available right now',
    ui_browse_no_squads_filtered: 'No squads found matching your search',
    ui_browse_no_squads_description: 'Create your own squad and start playing with friends!',

    ui_chat: 'Chat',
    ui_chat_players: 'players',
  })

  useEffect(() => {
    fetchNui('loadLocale')
  }, [])

  useNuiEvent('setLocale', async (data: Locale) => setLocale(data))

  return <LocaleCtx.Provider value={{ locale, setLocale }}>{children}</LocaleCtx.Provider>
}

export default LocaleProvider

export const useLocales = () => useContext<LocaleContextValue>(LocaleCtx as Context<LocaleContextValue>)
