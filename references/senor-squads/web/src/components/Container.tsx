import React from 'react'
import { useLocales } from '../providers/LocaleProvider'
import useSettingsStore from '../stores/settingsSlice'

const Banner = () => {
  const { locale } = useLocales()
  return (
    <div
      className="basis-[14%] relative rounded-lg bg-cover bg-center bg-opacity-50 flex flex-col items-center justify-center text-center"
      style={{ backgroundImage: `url('./images/banner.png')` }}
    >
      <div className="w-[90%] flex items-center justify-center flex-col">
        <h1 className="text-primary text-[2vw] [text-shadow:_0_1px_30px_rgba(0,255,174,0.3)] uppercase font-gilroy font-semibold">
          {locale.ui_container_title}
        </h1>
        <span className="font-medium text-xs text-white text-opacity-20">{locale.ui_container_label}</span>
      </div>
      <div className="absolute w-[50%] h-1 bg-primary rounded-b top-0"></div>
    </div>
  )
}

interface ContainerProps {
  children: React.ReactNode
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  const { editHud } = useSettingsStore()

  return (
    <div
      className="w-[25%] rounded-lg flex flex-col h-[100%] transition-opacity duration-200"
      style={{
        background: 'var(--container-bg)',
        opacity: editHud ? 0.5 : 1,
      }}
    >
      <div className="p-5 pb-2">
        <Banner />
      </div>
      <div className="flex-1 flex flex-col min-h-0 px-5 pb-5">
        {children}
      </div>
    </div>
  )
}

export default Container
