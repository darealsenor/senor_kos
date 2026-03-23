import React, { useEffect, useState } from 'react'
import BackButton from '../BackButton'
import { useLocales } from '../../providers/LocaleProvider'
import Content from '../Content'
import ToggleButton from '../ToggleButton'
import Button from '../Button'
import { CheckIcon, MinusIcon, PlusIcon } from '../icons'
import useInput from '../../stores/inputSlice'
import useDebounce from '../../hooks/useDebounce'
import { fetchNui } from '../../utils/fetchNui'
import usePlayerStore, { PersonalSquad } from '../../stores/playerSlice'
import useStateSlice from '../../stores/stateSlice'
import { useNuiEvent } from '../../hooks/useNuiEvent'

const Creation = ({ editMode = false }: { editMode?: boolean }) => {
  const { locale } = useLocales()

  const [validName, setValidName] = useState<boolean>(false)
  const [validImage, setValidImage] = useState<boolean>(true)
  const [validPassword, setValidPasswsord] = useState<boolean>(false)
  const { setMySquad, mySquad } = usePlayerStore()
  const { setCurrentPage } = useStateSlice()

  const {
    squadName,
    setSquadName,
    squadImage,
    setSquadImage,
    hasPassword,
    setHasPassword,
    squadPassword,
    setSquadPassword,
    squadLimit,
    setSquadLimit,
    maximumSquadPlayers,
  } = useInput()

  // Pre-fill form with existing squad data when in edit mode
  useEffect(() => {
    if (editMode && mySquad) {
      setSquadName(mySquad.name)
      setSquadImage(mySquad.image)
      setSquadLimit(mySquad.maxplayers)
      setHasPassword(!!mySquad.password)
      setSquadPassword(mySquad.password || '')
    }
  }, [editMode, setSquadName, setSquadImage, setSquadLimit, setHasPassword, mySquad, setSquadPassword])

  const debouncedSquadName = useDebounce(squadName, 500)

  useEffect(() => {
    if (!debouncedSquadName) {
      setValidName(false)
    } else {
      const trimmedName = debouncedSquadName.trim()
      if (trimmedName.length < 3 || trimmedName.length > 12) {
        setValidName(false)
      } else {
        const checkNameValidity = async () => {
          try {
            const retval: boolean = await fetchNui('isNameValid', debouncedSquadName, true)
            setValidName(retval)
          } catch (error) {
            setValidName(false)
          }
        }
        checkNameValidity()
      }
    }
  }, [debouncedSquadName])

  useEffect(() => {
    if (!squadImage) {
      setValidImage(false)
    } else {
      const img = new Image()
      img.src = squadImage
      img.onload = () => setValidImage(true)
      img.onerror = () => setValidImage(false)
    }
  }, [squadImage])

  useEffect(() => {
    if (!hasPassword) {
      setValidPasswsord(false)
    } else {
      setValidPasswsord(squadPassword.length >= 1 && squadPassword.length <= 5)
    }
  }, [squadPassword, hasPassword])

  const createSquad = async () => {
    if (!validName || (hasPassword && !validPassword)) {
      return
    }

    const data = {
      name: squadName,
      image: validImage && squadImage && squadImage.trim() ? squadImage.trim() : '',
      maxplayers: squadLimit,
      password: (hasPassword && squadPassword) || undefined,
    }

    const retval: { success: boolean; data: PersonalSquad | null } = await fetchNui('createSquad', data, {
      success: true,
      data: {
        players: [
          {
            name: 'senor',
            serverId: 1,
            owner: true,
            image: 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg',
            talking: true,
            health: 100,
            armor: 45,
            entity: 0,
            network: 0,
            coords: { x: 0, y: 0, z: 0 },
          },
          {
            name: 'senor alt',
            serverId: 2,
            owner: false,
            image: 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg',
            talking: false,
            health: 22,
            armor: 100,
            entity: 0,
            network: 0,
            coords: { x: 0, y: 0, z: 0 },
          },
        ],
        name: data.name,
        image: data.image,
        maxplayers: data.maxplayers,
        password: data.password,
      },
    })

    if (retval.success && retval.data) {
      setMySquad(retval.data)
      setSquadName('')
      setSquadPassword('')
      setCurrentPage('Squad')
    }
  }

  const editSquad = async () => {
    if (!validName || (hasPassword && !validPassword) || !mySquad) {
      return
    }

    const data = {
      name: squadName,
      image: validImage && squadImage && squadImage.trim() ? squadImage.trim() : '',
      maxplayers: squadLimit,
      password: (hasPassword && squadPassword) || undefined,
    }

    try {
      const retval = await fetchNui<{ success: boolean; data: PersonalSquad | null }>('squads:server:EditSquad', data)
      if (retval.success && retval.data) {
        setMySquad(retval.data)
        setCurrentPage('Squad')
      }
    } catch (error) {
      console.error('Failed to edit squad:', error)
    }
  }

  useNuiEvent('setMySquad', setMySquad)

  useEffect(() => {
    if (mySquad && !editMode) {
      setCurrentPage('Squad')
    }
  }, [mySquad, editMode, setCurrentPage])

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (editMode) {
        setSquadName('')
        setSquadImage('')
        setSquadPassword('')
        setSquadLimit(4)
        setHasPassword(false)
      }
    }
  }, [editMode, setSquadName, setSquadImage, setSquadPassword, setSquadLimit, setHasPassword])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-1">
          <BackButton title={editMode ? locale.ui_edit_squad : locale.ui_create_squad_button} />

          <Content
            className="flex justify-center rounded-md flex-col gap-1"
            style={{
              background: validName
                ? 'linear-gradient(90deg, rgba(0, 255, 174, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
                : undefined,
            }}
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-primary font-gilroy font-semibold text-base">{locale.ui_create_squad_name}</span>
              <span className="text-white text-opacity-40 font-medium text-xs">{locale.ui_create_squad_label}</span>
            </div>

            <div
              className="w-full relative bg-white bg-opacity-5 rounded border"
              style={{ borderColor: validName ? 'var(--primary-color)' : 'rgba(255, 0, 0, 0.15)' }}
            >
              <input
                type="text"
                minLength={3}
                maxLength={12}
                className="w-full p-[0.6rem] bg-transparent rounded text-primary text-xs font-medium"
                value={squadName}
                placeholder={locale.ui_create_squad_placeholder}
                onChange={(e) => setSquadName(e.target.value)}
              />
              {validName && (
                <CheckIcon
                  fill="var(--primary-color)"
                  className="absolute right-4 p-1 bg-accent top-1/2 transform -translate-y-1/2 translate-x-2.5 rounded w-5 h-5"
                />
              )}
            </div>
          </Content>

          <Content className="flex justify-between items-center rounded-md gap-2 flex-col sm:flex-row">
            <div className="flex flex-col items-start text-left flex-1 min-w-0">
              <span className="text-white font-gilroy font-semibold text-base">{locale.ui_create_squad_photo}</span>
              <span className="text-white text-opacity-40 font-medium text-xs">{locale.ui_create_squad_photo_label}</span>

              <div
                className="w-full relative bg-white bg-opacity-5 rounded border mt-1"
                style={{ borderColor: validImage ? 'var(--primary-color)' : 'rgba(255, 0, 0, 0.15)' }}
              >
                <input
                  type="text"
                  min={3}
                  max={12}
                  className="p-[0.6rem] bg-transparent rounded text-primary text-xs font-medium w-[85%]"
                  placeholder={locale.ui_create_squad_photo_placeholder}
                  value={squadImage}
                  onChange={(e) => setSquadImage(e.target.value)}
                />
                {validImage && (
                  <CheckIcon
                    fill="var(--primary-color)"
                    className="absolute right-4 p-1 bg-accent top-1/2 transform -translate-y-1/2 translate-x-2.5 rounded w-5 h-5"
                  />
                )}
              </div>
            </div>

            <div className="flex-shrink-0 w-16 h-16 bg-white bg-opacity-5 rounded-md flex items-center justify-center">
              <img
                src={
                  validImage
                    ? squadImage
                    : 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg'
                }
                alt=""
                className="w-16 object-contain border-primary border rounded-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg'
                }}
              />
            </div>
          </Content>

          <div className="w-full flex flex-col gap-1">
            <Content className="flex items-center justify-between rounded-t-md">
              <div className="flex flex-col items-start text-left">
                <span className="text-white font-gilroy font-semibold text-base">{locale.ui_create_squad_password}</span>
                <span className="text-white text-opacity-40 font-medium text-xs">{locale.ui_create_squad_password_label}</span>
              </div>
              <ToggleButton active={hasPassword} onClick={() => setHasPassword(!hasPassword)} />
            </Content>

            {hasPassword && (
              <div
                className="bg-white bg-opacity-[5%] flex items-center w-full rounded-b-lg relative border"
                style={{ borderColor: validPassword ? 'var(--primary-color)' : 'rgba(255, 0, 0, 0.15)' }}
              >
                <input
                  type="password"
                  placeholder={locale.ui_create_squad_password_label}
                  className="bg-white bg-opacity-5 rounded text-primary text-xs font-medium w-full p-2"
                  value={squadPassword}
                  maxLength={5}
                  minLength={1}
                  onChange={(e) => setSquadPassword(e.target.value)}
                />

                {validPassword && (
                  <CheckIcon
                    fill="var(--primary-color)"
                    className="absolute right-4 p-1 bg-accent top-1/2 transform -translate-y-1/2 translate-x-2.5 rounded w-5 h-5"
                  />
                )}
              </div>
            )}
          </div>

          <Content className="flex items-center justify-between rounded-md">
            <div className="flex flex-col items-start text-left">
              <span className="text-white font-gilroy font-semibold text-base">{locale.ui_create_squad_limit}</span>
              <span className="text-white text-opacity-40 font-medium text-xs">{locale.ui_create_squad_limit_label}</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <div
                className="bg-white bg-opacity-5 flex items-center justify-center rounded h-8 w-8"
                onClick={() => {
                  const newLimit = Math.max(squadLimit - 1, 2)
                  setSquadLimit(newLimit)
                }}
              >
                <MinusIcon />
              </div>

              <div
                className="py-[0.35rem] px-6 rounded font-gilroy font-semibold text-sm hover:cursor-pointer h-8 flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--bg-accent)',
                  color: 'var(--primary-color)',
                }}
              >
                {squadLimit}
              </div>

              <div
                className="bg-white bg-opacity-5 flex items-center justify-center rounded h-8 w-8"
                onClick={() => {
                  const newLimit = Math.min(squadLimit + 1, maximumSquadPlayers)
                  setSquadLimit(newLimit)
                }}
              >
                <PlusIcon />
              </div>
            </div>
          </Content>
        </div>
      </div>
      <div className="flex-shrink-0 pt-2">
        <Button
          bgColor="hsla(208.8, 88.7%, 45.1%, 0.05)"  // subtle blue background
          color="hsl(208.8, 88.7%, 45.1%)"           // primary blue color
          icon="plus"
          text={editMode ? locale.ui_edit_squad : locale.ui_create_squad_create}
          textColor="text-[hsl(208.8,88.7%,45.1%)]"  // matching text color
          onClick={editMode ? editSquad : createSquad}
        />
      </div>
    </div>
  )
}

export default Creation
