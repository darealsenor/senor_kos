import React, { useEffect, useState } from 'react'
import Content from '../Content'
import Button from '../Button'
import ConfirmModal from '../ConfirmModal'
import { BannerSVG, CrownIcon, EditIcon, MessageIcon, PeopleIcon, SettingsIcon, XIcon } from '../icons'
import usePlayerStore, { OfflineMember, PersonalSquad, SquadPlayer } from '../../stores/playerSlice'
import useStateSlice from '../../stores/stateSlice'
import { fetchNui } from '../../utils/fetchNui'
import { useLocales } from '../../providers/LocaleProvider'
import { motion } from 'framer-motion'

const SquadPreviewHeader = ({ toggleChatFn, goToSettings }: { toggleChatFn: () => void; goToSettings: () => void }) => {
  const { locale } = useLocales()

  const squadEdit = usePlayerStore((state) => state.squadEdit)
  const setSquadEdit = usePlayerStore((state) => state.setSquadEdit)
  const { setCurrentPage } = useStateSlice()

  const toggleEdit = () => {
    setSquadEdit(true)
    setCurrentPage('Creation')
  }

  return (
    <Content className="flex items-center gap-2 rounded-md justify-between">
      <div className="flex items-center justify-center p-2 bg-white bg-opacity-5 rounded gap-2" onClick={toggleEdit}>
        <EditIcon className="w-3 h-3" />
        <span className="text-white text-xs font-gilroy font-semibold">{locale.ui_edit_squad}</span>
      </div>
      <div className="flex gap-1 items-center justify-center">
        <motion.div
          className="p-2 bg-white bg-opacity-5 rounded hover:cursor-pointer"
          onClick={toggleChatFn}
          whileHover={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <MessageIcon
            fill="white"
            className="transition-all duration-300 ease-in-out hover:fill-[var(--primary-color)]"
          />
        </motion.div>
        <motion.div
          className="p-2 bg-white bg-opacity-5 rounded hover:cursor-pointer"
          onClick={goToSettings}
          whileHover={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <SettingsIcon
            fill="white"
            className="transition-all duration-300 ease-in-out hover:fill-[var(--primary-color)]"
          />
        </motion.div>
      </div>
    </Content>
  )
}

const SquadBanner = ({
  name,
  squadPlayers,
  maximumPlayers,
}: {
  name: string
  squadPlayers: number
  maximumPlayers: number
}) => {
  return (
    <div className="w-full h-auto relative">
      {/* <img className="w-full h-auto block" src="./images/squad_name_banner.png" /> */}
      <BannerSVG className={'w-full h-full block'} />
      <div className="absolute top-2 left-2 p-1 bg-white bg-opacity-5 rounded-sm flex gap-2 items-center justify-center">
        <img src="./icons/people.png" alt="" className="w-2 h-2 object-cover" />
        <p className="text-white text-opacity-50 font-gilroy text-xs font-semibold">
          <span className="text-primary">{squadPlayers}</span>/{maximumPlayers}
        </p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-white text-opacity-50 font-semibold">
          <span className="text-primary" style={{ textShadow: '0px 0px 30px rgba(0, 255, 174, 0.25)' }}>
            {name}
          </span>{' '}
          SQUAD
        </p>
      </div>
    </div>
  )
}

const SquadMember = ({
  owner,
  name,
  myself,
  isOwner,
  id,
  handleRemovePlayer,
  handleTransferOwnership,
  image,
}: {
  owner: boolean
  name: string
  myself: boolean
  isOwner: boolean
  id: number
  image: string
  handleRemovePlayer: (Player: SquadPlayer['serverId']) => void
  handleTransferOwnership: (Player: SquadPlayer['serverId']) => void
}) => {
  return (
    <div
      className="h-20 w-full flex items-center justify-start rounded-md p-2 gap-3 relative"
      style={{
        background: owner
          ? 'linear-gradient(90deg, rgba(255, 217, 0, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
          : myself
          ? 'var(--valid-gradient)'
          : 'rgba(255, 255, 255, 0.02)',
      }}
    >
      <div className="bg-white bg-opacity-5 rounded-md flex items-center justify-center p-1">
        <img
          src={image}
          alt=""
          className="w-12 object-contain border rounded-md"
          style={{
            borderColor: owner ? '#FFD900' : myself ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.25)',
          }}
        />
      </div>

      <div className="flex flex-col gap-1 items-start">
        <span
          style={{
            color: owner ? '#FFD900' : myself ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.25)',
          }}
          className="font-semibold text-base"
        >
          {name}
        </span>

        <div className="flex gap-1 items-center justify-center">
          <div className=" p-1 bg-white bg-opacity-5 rounded">
            {owner ? <CrownIcon className="object-center w-2 h-2" /> : <PeopleIcon className="object-center w-2 h-2" />}
          </div>
          <span className="text-white text-opacity-50 text-xs font-semibold">{owner ? 'Owner' : 'Member'}</span>
        </div>

        {isOwner && !myself && (
          <div className="absolute flex items-center justify-center gap-1 p-1 right-2 top-0">
            <div
              className="bg-white bg-opacity-15 hover:bg-[#FFD900] hover:bg-opacity-15 p-2 rounded transition-all duration-200 cursor-pointer group"
              onClick={() => handleTransferOwnership(id)}
            >
              <CrownIcon className="object-center w-2 h-2 group-hover:fill-[#FFD900] transition-all duration-200" fill="white" opacity="0.5" />
            </div>
            <div
              className="bg-white bg-opacity-15 hover:bg-[#FF0000] hover:bg-opacity-15 p-2 rounded transition-all duration-200 cursor-pointer group"
              onClick={() => handleRemovePlayer(id)}
            >
              <XIcon className="fill-white stroke-white group-hover:stroke-[#FF0000] transition-all duration-200" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const OfflineMemberRow = ({
  member,
  identifier,
  isOwner,
  onRemove,
}: {
  member: OfflineMember
  identifier: string
  isOwner: boolean
  onRemove: (identifier: string) => void
}) => {
  return (
    <div
      className="h-20 w-full flex items-center justify-start rounded-md p-2 gap-3 relative opacity-50"
      style={{ background: 'rgba(255, 255, 255, 0.02)' }}
    >
      <div className="bg-white bg-opacity-5 rounded-md flex items-center justify-center p-1">
        <img
          src={member.image || './images/fallback.png'}
          alt=""
          className="w-12 object-contain border rounded-md"
          style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}
        />
      </div>
      <div className="flex flex-col gap-1 items-start">
        <span className="font-semibold text-base text-white text-opacity-40">{member.name}</span>
        <div className="flex gap-1 items-center justify-center">
          <div className="p-1 bg-white bg-opacity-5 rounded">
            {member.isOwner
              ? <CrownIcon className="object-center w-2 h-2" />
              : <PeopleIcon className="object-center w-2 h-2" />}
          </div>
          <span className="text-white text-opacity-30 text-xs font-semibold">Offline</span>
        </div>
      </div>
      {isOwner && (
        <div className="absolute flex items-center justify-center gap-1 p-1 right-2 top-0">
          <div
            className="bg-white bg-opacity-15 hover:bg-[#FF0000] hover:bg-opacity-15 p-2 rounded transition-all duration-200 cursor-pointer group"
            onClick={() => onRemove(identifier)}
          >
            <XIcon className="fill-white stroke-white group-hover:stroke-[#FF0000] transition-all duration-200" />
          </div>
        </div>
      )}
    </div>
  )
}

const SquadMembers = ({
  players,
  pendingMembers,
  playerId,
  isOwner,
  handleRemovePlayer,
  handleRemoveOfflineMember,
  handleTransferOwnership,
}: {
  players: PersonalSquad['players']
  pendingMembers: PersonalSquad['pendingMembers']
  playerId: number
  isOwner: boolean
  handleRemovePlayer: (PlayerId: SquadPlayer['serverId']) => void
  handleRemoveOfflineMember: (identifier: string) => void
  handleTransferOwnership: (PlayerId: SquadPlayer['serverId']) => void
}) => {
  const offlineEntries = Object.entries(pendingMembers ?? {})
  return (
    <div className="w-full flex flex-col gap-1">
      {Object.values(players).map((player: SquadPlayer, index: number) => (
        <SquadMember
          id={player.serverId}
          name={player.name}
          myself={playerId === player.serverId}
          handleRemovePlayer={handleRemovePlayer}
          handleTransferOwnership={handleTransferOwnership}
          owner={player.owner}
          isOwner={isOwner}
          key={index}
          image={player.image}
        />
      ))}
      {offlineEntries.length > 0 && (
        <>
          <div className="w-full h-px bg-white opacity-5 my-1" />
          {offlineEntries.map(([identifier, member]) => (
            <OfflineMemberRow
              key={identifier}
              member={member}
              identifier={identifier}
              isOwner={isOwner}
              onRemove={handleRemoveOfflineMember}
            />
          ))}
        </>
      )}
    </div>
  )
}

const SquadPreviewContent = () => {
  const { mySquad, playerId, removePlayer, removePendingMember, isOwner, setMySquad } = usePlayerStore()
  const { setCurrentPage, toggleChat, chat } = useStateSlice()

  const { locale } = useLocales()

  const toggleChatFn = () => {
    if (!mySquad) return
    toggleChat(!chat)
  }

  const goToSettings = () => setCurrentPage('Settings')

  const handleRemovePlayer = async (serverId: SquadPlayer['serverId']) => {
    const retval: { success: boolean; message: string } = await fetchNui('RemovePlayer', serverId, {
      success: true,
      message: 'player removed',
    })
    if (retval.success) {
      removePlayer(serverId)
    }
  }

  const handleRemoveOfflineMember = async (identifier: string) => {
    const retval: { success: boolean; message: string } = await fetchNui('RemovePlayer', identifier, {
      success: true,
      message: 'member removed',
    })
    if (retval.success) {
      removePendingMember(identifier)
    }
  }

  const handleTransferOwnership = async (serverId: SquadPlayer['serverId']) => {
    const retval: { success: boolean; message: string } = await fetchNui('TransferOwnership', serverId, {
      success: true,
      message: 'ownership transferred',
    })
    if (retval.success && mySquad) {
      const updatedPlayers = { ...mySquad.players }
      for (const pid in updatedPlayers) {
        updatedPlayers[pid] = { ...updatedPlayers[pid], owner: Number(pid) === serverId }
      }
      setMySquad({ ...mySquad, players: updatedPlayers })
    }
  }

  if (!mySquad) return null

  return (
    <div className="flex flex-col gap-1">
      <SquadPreviewHeader toggleChatFn={toggleChatFn} goToSettings={goToSettings} />
      <SquadBanner
        name={mySquad.name}
        squadPlayers={Object.keys(mySquad.players).length + Object.keys(mySquad.pendingMembers ?? {}).length}
        maximumPlayers={mySquad.maxplayers}
      />
      <SquadMembers
        players={mySquad.players}
        pendingMembers={mySquad.pendingMembers}
        playerId={playerId}
        isOwner={isOwner}
        handleRemovePlayer={handleRemovePlayer}
        handleRemoveOfflineMember={handleRemoveOfflineMember}
        handleTransferOwnership={handleTransferOwnership}
      />
    </div>
  )
}

const SquadPreview = () => {
  const { setMySquad, mySquad, isOwner } = usePlayerStore()
  const { setCurrentPage } = useStateSlice()
  const { locale } = useLocales()
  const [forceCloseModalOpen, setForceCloseModalOpen] = useState(false)

  useEffect(() => {
    if (!mySquad) {
      setCurrentPage('Creation')
    }
  }, [mySquad, setCurrentPage])

  const handleSquadLeave = async () => {
    const retval = await fetchNui('LeaveSquad', null, true)

    if (retval) {
      setMySquad(null)
    }
  }

  const handleForceCloseSquadClick = () => {
    setForceCloseModalOpen(true)
  }

  const handleForceCloseSquadConfirm = async () => {
    setForceCloseModalOpen(false)
    const retval = await fetchNui<{ success: boolean; message?: string }>('ForceCloseSquad', null, { success: true })
    if (retval?.success) {
      setMySquad(null)
    }
  }

  if (!mySquad) return null

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <SquadPreviewContent />
      </div>
      <div className="flex-shrink-0 pt-2 flex flex-col gap-2">
        {isOwner && (
          <Button
            bgColor="rgba(255, 0, 0, 0.05)"
            color="#FF0000"
            icon="exit"
            text={locale.ui_force_close_squad}
            textColor="text-[#FF0000]"
            onClick={handleForceCloseSquadClick}
          />
        )}
        <Button
          bgColor="rgba(255, 0, 0, 0.05)"
          color="#FF0000"
          icon="exit"
          text={locale.ui_exit_squad}
          textColor="text-[#FF0000]"
          onClick={handleSquadLeave}
        />
      </div>
      <ConfirmModal
        open={forceCloseModalOpen}
        title={locale.ui_force_close_squad}
        message={locale.ui_force_close_squad_confirm}
        confirmLabel={locale.ui_confirm}
        cancelLabel={locale.ui_cancel}
        onConfirm={handleForceCloseSquadConfirm}
        onCancel={() => setForceCloseModalOpen(false)}
        confirmVariant="destructive"
      />
    </div>
  )
}

export default SquadPreview
