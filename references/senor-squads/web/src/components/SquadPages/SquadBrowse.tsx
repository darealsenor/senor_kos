import React from 'react'
import Content from '../Content'
import { LockIcon, MessageIcon, PlusIcon, Search, SettingsIcon } from '../icons'
import useSquad, { Squad as SquadInterface } from '../../stores/squadSlice'
import useStateSlice from '../../stores/stateSlice'
import usePlayerStore, { PersonalSquad } from '../../stores/playerSlice'
import { fetchNui } from '../../utils/fetchNui'
import { debugData } from '../../utils/debugData'
import { useNuiEvent } from '../../hooks/useNuiEvent'
import { useLocales } from '../../providers/LocaleProvider'
import { motion } from 'framer-motion'
import Button from '../Button'

debugData([
  {
    action: 'setSquads',
    data: [
      {
        squadId: 1,
        name: 'Senor Squad',
        image:
          'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ae109ede-ab26-4864-b0c1-17df0735a693/dc3zalp-4dfadebc-d305-48ac-a9b8-02b0dacadc79.jpg/v1/fill/w_400,h_400,q_75,strp/random_draw_for_my_pfp_by_alexthetrain_dc3zalp-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NDAwIiwicGF0aCI6IlwvZlwvYWUxMDllZGUtYWIyNi00ODY0LWIwYzEtMTdkZjA3MzVhNjkzXC9kYzN6YWxwLTRkZmFkZWJjLWQzMDUtNDhhYy1hOWI4LTAyYjBkYWNhZGM3OS5qcGciLCJ3aWR0aCI6Ijw9NDAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.U2mb_MuSNjA3JGlM08AcBUcaxj-EYul5k-RdtYmoiiQ',
        maxplayers: 4,
        privacy: true,
        playersLength: 3,
      },
      {
        squadId: 2,
        name: 'Senor Squad',
        image:
          'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ae109ede-ab26-4864-b0c1-17df0735a693/dc3zalp-4dfadebc-d305-48ac-a9b8-02b0dacadc79.jpg/v1/fill/w_400,h_400,q_75,strp/random_draw_for_my_pfp_by_alexthetrain_dc3zalp-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NDAwIiwicGF0aCI6IlwvZlwvYWUxMDllZGUtYWIyNi00ODY0LWIwYzEtMTdkZjA3MzVhNjkzXC9kYzN6YWxwLTRkZmFkZWJjLWQzMDUtNDhhYy1hOWI4LTAyYjBkYWNhZGM3OS5qcGciLCJ3aWR0aCI6Ijw9NDAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.U2mb_MuSNjA3JGlM08AcBUcaxj-EYul5k-RdtYmoiiQ',
        maxplayers: 5,
        privacy: false,
        playersLength: 3,
      },
      {
        squadId: 3,
        name: 'Senor Squad',
        image:
          'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ae109ede-ab26-4864-b0c1-17df0735a693/dc3zalp-4dfadebc-d305-48ac-a9b8-02b0dacadc79.jpg/v1/fill/w_400,h_400,q_75,strp/random_draw_for_my_pfp_by_alexthetrain_dc3zalp-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NDAwIiwicGF0aCI6IlwvZlwvYWUxMDllZGUtYWIyNi00ODY0LWIwYzEtMTdkZjA3MzVhNjkzXC9kYzN6YWxwLTRkZmFkZWJjLWQzMDUtNDhhYy1hOWI4LTAyYjBkYWNhZGM3OS5qcGciLCJ3aWR0aCI6Ijw9NDAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.U2mb_MuSNjA3JGlM08AcBUcaxj-EYul5k-RdtYmoiiQ',
        maxplayers: 12,
        privacy: true,
        playersLength: 3,
      },
    ],
  },
])

const SquadPreviewHeader = () => {
  const { setCurrentPage } = useStateSlice()
  const { locale } = useLocales()

  return (
    <Content className="flex items-center gap-2 rounded-md justify-between">
      {/* Edit Squad */}
      <motion.div
        className="flex items-center justify-center p-[.4vw] bg-button rounded gap-2 hover:cursor-pointer"
        onClick={() => setCurrentPage('Creation')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <PlusIcon className="p-1 bg-white bg-opacity-25 rounded" fill="white" />
        <span className="text-white text-xs font-gilroy font-semibold">
          {locale.ui_browse_create_squad}
        </span>
      </motion.div>
      {/* Buttons: Chat, Settings */}
      <div className="flex gap-1 items-center justify-center">
        <motion.div
          className="p-2 bg-white bg-opacity-5 rounded hover:cursor-pointer"
          whileHover={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)'
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <MessageIcon fill="white" className="transition-all duration-300 ease-in-out hover:fill-[var(--primary-color)]" />
        </motion.div>

        <motion.div
          className="p-2 bg-white bg-opacity-5 rounded hover:cursor-pointer"
          onClick={() => setCurrentPage('Settings')}
          whileHover={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)'
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <SettingsIcon fill="white" className="transition-all duration-300 ease-in-out hover:fill-[var(--primary-color)]" />
        </motion.div>
      </div>
    </Content>
  )
}

const Input = () => {
  const { locale } = useLocales();
  const { squadFilter, setSquadFilter } = useSquad();

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSquadFilter(event.target.value);
  };

  return (
    <div className="w-full relative flex items-center border-white border-opacity-25 border rounded-md justify-center">
      <input
        type="text"
        min={3}
        max={12}
        className="p-3 bg-transparent w-[90%] rounded text-primary text-sm font-semibold"
        placeholder={locale.ui_browse_search_placeholder}
        value={squadFilter}
        onChange={handleFilterChange}
      />

      <div className="p-2 bg-white bg-opacity-5 rounded-md mr-1">
        <Search fill="var(--primary-color)" />
      </div>
    </div>
  );
};

const Squad = ({
  squad,
  selected,
  setSelectedSquad,
}: {
  squad: SquadInterface
  selected: boolean
  setSelectedSquad: (squad: SquadInterface | null) => void
}) => {
  const { squadPassword, setSquadPassword } = useSquad()
  const { setMySquad } = usePlayerStore()
  const { locale } = useLocales()

  const joinSquadAttempt = async () => {
    const retval: { success: boolean; data: PersonalSquad | null } = await fetchNui(
      'JoinSquad',
      { squad: squad, password: squadPassword },
      {
        success: true,
        data: {
          ...squad,
          players: {
            [1]: {
              name: 'senor',
              serverId: 1,
              owner: true,
              image: 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg',
              talking: true,
              health: 100,
              armor: 45,
            },
          },
        },
      },
    )
    if (retval.success && retval.data) {
      setMySquad(retval.data)
    }
  }

  return (
    <Content
      className={`flex flex-col gap-1 rounded-lg w-full items-start`}
      style={{
        background: selected ? 'var(--valid-gradient)' : undefined,
      }}
    >
      {/* Squad */}
      <div className="flex justify-between items-center w-full">
        {/* Image, Squad Name, Capacity, Locked/Public */}
        <div className="flex gap-2 items-center justify-center">
          {/* Image */}
          <div className="w-14 h-14 bg-white bg-opacity-5 rounded-md flex justify-center items-center">
            <img
              src={squad.image}
              alt="Squad Image"
              className={`w-12 h-12 border ${selected ? 'border-primary' : 'border-white'
                } border-opacity-15 rounded-md`}
            />
          </div>
          {/* Squad Name, Capacity, Locked/Public */}
          <div className="flex flex-col items-start justify-center">
            <span className={`text-base font-semibold ${selected ? 'text-primary' : 'text-white'} text-left`}>{squad.name}</span>

            <div className="flex gap-1 items-center justify-center">
              <div className="p-1 bg-white bg-opacity-5 rounded-sm flex gap-2 items-center justify-center">
                <img src="./icons/people.png" alt="" className="w-[7px] h-[9px] object-contain ml-1" />
                <p className="text-white text-opacity-20 font-gilroy text-xs font-semibold">
                  <span className={`${selected ? 'text-primary' : 'text-white'}`}>{squad.playersLength}</span>
                  <span>/</span>
                  {squad.maxplayers}
                </p>
              </div>

              {squad.privacy && (
                <div className="p-[0.41rem] bg-white bg-opacity-5 flex items-center justify-center rounded-sm">
                  <LockIcon />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Join Button */}
        <motion.button
          onClick={() => setSelectedSquad(squad)}
          className={`py-[0.15vw] px-[1.4vw] font-semibold rounded cursor-pointer`}
          initial={{
            backgroundColor: selected ? 'var(--join-button)' : 'rgba(255, 255, 255, 0.05)',
            color: selected ? 'var(--primary-color)' : 'white',
          }}
          animate={{
            backgroundColor: selected ? 'var(--join-button)' : 'rgba(255, 255, 255, 0.05)',
            color: selected ? 'var(--primary-color)' : 'white',
          }}
          whileHover={{
            backgroundColor: !selected ? 'rgba(255, 255, 255, 0.15)' : 'var(--join-button)',
            color: !selected ? 'rgba(255, 255, 255, 0.7)' : 'var(--primary-color)',
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {locale.ui_browse_join_squad}
        </motion.button>
      </div>

      {/* Password if Selected */}
      {selected && (
        <div className="bg-white bg-opacity-[5%] flex items-center w-full rounded-b-lg relative">
          <input
            type="password"
            placeholder={locale.ui_browse_password_placeholder}
            className="bg-transparent rounded text-primary text-xs font-medium p-2 w-[75%]"
            value={squadPassword}
            onChange={(e) => setSquadPassword(e.target.value)}
          />

          <motion.button
            className="absolute top-1/2 transform -translate-y-1/2 translate-x-2.5 right-4 text-xs text-white text-opacity-85 px-7 py-1 bg-white bg-opacity-5 rounded font-semibold cursor-pointer"
            onClick={joinSquadAttempt}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white' }}
            transition={{ duration: 0.2 }}
          >
            {locale.ui_browse_login_password}
          </motion.button>
        </div>
      )}
    </Content>
  )
}

const Squads = ({
  squads,
  selectedSquad,
  setSelectedSquad,
  hasFilter,
}: {
  squads: SquadInterface[]
  selectedSquad: SquadInterface | null
  setSelectedSquad: (squad: SquadInterface | null) => void
  hasFilter: boolean
}) => {
  const { locale } = useLocales()
  const { setCurrentPage } = useStateSlice()

  if (squads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-8 gap-3">
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-white text-opacity-60 font-gilroy font-semibold text-base text-center">
            {hasFilter ? locale.ui_browse_no_squads_filtered : locale.ui_browse_no_squads}
          </span>
          <span className="text-white text-opacity-40 font-gilroy font-medium text-sm text-center">
            {locale.ui_browse_no_squads_description}
          </span>
        </div>
        {!hasFilter && (
          <motion.div
            className="flex items-center justify-center p-2 bg-button rounded gap-2 hover:cursor-pointer mt-2"
            onClick={() => setCurrentPage('Creation')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <PlusIcon className="p-1 bg-white bg-opacity-25 rounded" fill="white" />
            <span className="text-white text-xs font-gilroy font-semibold">
              {locale.ui_browse_create_squad}
            </span>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 items-start justify-center w-full">
      {squads.map((squad: SquadInterface, index: number) => (
        <Squad
          squad={squad}
          key={index}
          selected={selectedSquad?.squadId === squad.squadId}
          setSelectedSquad={setSelectedSquad}
        />
      ))}
    </div>
  )
}

const SquadBrowse = () => {
  const { availableSquads, selectedSquad, setSelectedSquad, squadFilter } = useSquad()
  const { mySquad, setMySquad } = usePlayerStore()
  const { setCurrentPage } = useStateSlice()
  const { locale } = useLocales()

  const handleJoin = async (squad: SquadInterface | null) => {
    if (!squad) return

    if (squad.privacy) {
      setSelectedSquad(squad)
      return
    }

    const retval: { success: boolean; data: PersonalSquad | null } = await fetchNui(
      'JoinSquad',
      { squad: squad, password: null },
      {
        success: true,
        data: {
          players: {
            [1]: {
              name: 'senor',
              serverId: 1,
              owner: true,
              image: 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg',
              talking: true,
              health: 100,
              armor: 45,
            },
          },
        },
      },
    )
    if (retval.success && retval.data) {
      setMySquad(retval.data)
    }
  }

  const filteredSquads = availableSquads.filter((squad) =>
    squad.name.toLowerCase().includes(squadFilter.toLowerCase())
  )

  const hasFilter = squadFilter.trim().length > 0
  const hasNoSquads = availableSquads.length === 0
  const hasNoFilteredSquads = filteredSquads.length === 0 && !hasNoSquads

  // if (mySquad) return setCurrentPage('Squad')

  return (
    <div className="flex flex-col gap-2 h-full">
        <SquadPreviewHeader />
        <Input />
        <Squads
          squads={filteredSquads}
          selectedSquad={selectedSquad}
          setSelectedSquad={handleJoin}
          hasFilter={hasFilter || hasNoFilteredSquads}
        />
    </div>
  );
}

export default SquadBrowse
