import React, { useState } from 'react'
import usePlayerStore, { SquadPlayer } from '../../stores/playerSlice'
import Draggable, { DraggableData, DraggableEventHandler } from 'react-draggable'
import useSettingsStore from '../../stores/settingsSlice'
import { Speaker } from '../icons'
import { useNuiEvent } from '../../hooks/useNuiEvent'
import { useLocales } from '../../providers/LocaleProvider'

// const myId = 2

// interface PlayerHud extends BasePlayer {
//   talking: boolean
//   armor: number
//   health: number
// }

// const players: PlayerHud[] = [
//   {
//     name: 'Akira Autumn',
//     image: 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg',
//     serverId: 1,
//     armor: 49,
//     health: 100,
//     talking: false,
//   },
//   {
//     name: 'Senor senor',
//     image: 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg',
//     serverId: 2,
//     armor: 100,
//     health: 22,
//     talking: true,
//   },
//   {
//     name: 'Akira Autumn',
//     image: 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg',
//     serverId: 1,
//     armor: 49,
//     health: 100,
//     talking: false,
//   },
//   {
//     name: 'Akira Autumn',
//     image: 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg',
//     serverId: 1,
//     armor: 49,
//     health: 100,
//     talking: false,
//   },
//   {
//     name: 'Akira Autumn',
//     image: 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg',
//     serverId: 1,
//     armor: 49,
//     health: 100,
//     talking: false,
//   },
// ]

const ArmourBar = ({ currentArmour, color }: { currentArmour: number; color: string }) => {
  const maxArmour = 100
  const segmentValue = 25
  const numSegments = maxArmour / segmentValue

  const fullSegments = Math.floor(currentArmour / segmentValue)
  const partialSegmentWidth = ((currentArmour % segmentValue) / segmentValue) * 100

  return (
    <div className="flex gap-1 h-full">
      <div className="w-full h-1">
        <div className="flex gap-1 h-full w-full">
          {[...Array(numSegments)].map((_, index) => (
            <div key={index} className="w-1/4 h-1 relative">
              {index < fullSegments && (
                <div
                  className="w-full h-2 absolute transition-all duration-300"
                  style={{ backgroundColor: color }}
                ></div>
              )}
              {index === fullSegments && (
                <div
                  className="h-2 absolute transition-all duration-300"
                  style={{ width: `${partialSegmentWidth}%`, backgroundColor: color }}
                ></div>
              )}
              <div className="w-full h-2 bg-black bg-opacity-50 absolute"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const HealthBar = ({ health, color }: { health: number; color: string }) => {
  return (
    <div className="flex gap-1 h-full">
      <div className="relative w-full h-2">
        <div
          className="absolute h-2 z-10 transition-all duration-300"
          style={{ width: `${health}%`, backgroundColor: color }}
        ></div>
        <div
          className="absolute bg-opacity-15 h-2 w-full z-0"
          style={{ background: 'rgba(11, 11, 11, 0.5)' }}
        ></div>
      </div>
    </div>
  )
}

const Player = ({ player, playerId, minimized }: { player: SquadPlayer; playerId: number; minimized: boolean }) => {
  const isMe = player.serverId === playerId
  const isDead = player.isDead === true

  const { hudHealthColor, hudArmorColor, hudLtr, showRadioIcon } = useSettingsStore()

  return (
    <div className={`flex gap-2 ${hudLtr && 'flex-row-reverse'} items-end justify-center`}>
      <div className="bg-black bg-opacity-5 rounded-md flex items-center justify-center border-4" style={{ borderColor: 'rgba(11, 11, 11, 0.5)' }}>
        <img
          src={player.image}
          alt=""
          className={`${minimized ? 'w-6' : 'w-[2.3vw]'} object-contain border rounded-md ${isMe ? 'border-primary' : 'border-opacity-25'} ${isDead ? 'animate-dead-pulse' : ''}`}
        />
      </div>
      <div className="flex flex-col justify-start items-cneter w-full">
        <div className="flex gap-1 items-center justify-start">
          <span className={`text-xs font-semibold text-left ${isMe && !isDead ? 'text-primary' : isDead ? 'text-red-500' : 'text-white'}`}>{player.name}</span>
          {showRadioIcon && !isDead && <Speaker fill={player.talking === true ? '#00FF09' : 'rgba(255, 255, 255, 0.5)'} />}
        </div>

        <div className="flex flex-col gap-2">
          {!minimized && <ArmourBar currentArmour={isDead ? 0 : player.armor} color={hudArmorColor} />}
          <HealthBar health={isDead ? 0 : player.health} color={isDead ? '#ef4444' : hudHealthColor} />
        </div>
      </div>
    </div>
  )
}

const Hud = () => {
  const { mySquad, playerId, updatePlayersBulk } = usePlayerStore()
  const { editHud, hudPosition, setHudPosition, hudMaxDisplayMode, hudMaxDisplayValue, hudMinimized } = useSettingsStore()
  const [hudVisible, setHudVisible] = useState(true)
  const { locale } = useLocales()


  const handlePosition: DraggableEventHandler = (_, data: DraggableData) => {
    setHudPosition(data.x, data.y)
  }

  useNuiEvent('updatePlayers', (updates: Record<number, Partial<SquadPlayer>> | Array<Partial<SquadPlayer> | null>) => {
    let playersDict: Record<number, Partial<SquadPlayer>> = {}
    
    if (Array.isArray(updates)) {
      for (let i = 0; i < updates.length; i++) {
        const player = updates[i]
        if (player && typeof player === 'object' && 'serverId' in player && player.serverId) {
          playersDict[player.serverId] = player
        } else if (player && typeof player === 'object' && ('health' in player || 'armor' in player)) {
          const mySquad = usePlayerStore.getState().mySquad
          if (mySquad && mySquad.players) {
            for (const [existingServerId, existingPlayer] of Object.entries(mySquad.players)) {
              const playerData = player as Partial<SquadPlayer>
              if (existingPlayer && (existingPlayer.entity === playerData.entity || 
                  existingPlayer.network === playerData.network)) {
                playersDict[Number(existingServerId)] = player
                break
              }
            }
          }
        }
      }
    } else {
      playersDict = updates as Record<number, Partial<SquadPlayer>>
    }
    
    updatePlayersBulk(playersDict)
  })

  useNuiEvent('setHudVisible', setHudVisible)

  if (!mySquad || !hudVisible) return null

  const playersArray = Object.values(mySquad.players)
  const displayedPlayers =
    hudMaxDisplayMode === 'infinity' ? playersArray : playersArray.slice(0, hudMaxDisplayValue)

  return (
    <Draggable disabled={!editHud} defaultPosition={      hudPosition} position={hudPosition} onStop={handlePosition}>
      <div
        className="w-[13vw] h-[43vh] absolute bottom-[17%] right-[2%] flex flex-col-reverse gap-2"
        style={{ zIndex: editHud ? 999 : undefined }}
      >
        {editHud && (
          <div className="absolute -top-10 right-0 flex items-center gap-2">
            <div className="w-3 h-3 border border-primary rounded-sm animate-pulse"></div>
            <span className="text-xs font-semibold uppercase tracking-wide text-white text-opacity-70">
              {locale.ui_hud_edit_indicator}
            </span>
          </div>
        )}
        {displayedPlayers.map((player) => (
          <Player key={player.serverId} player={player} playerId={playerId} minimized={hudMinimized} />
        ))}   
        
      </div>
    </Draggable>
  )
}

export default Hud
