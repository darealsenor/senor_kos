import { create } from 'zustand'

export interface InputInterface {
  squadName: string;
  squadImage: string;
  hasPassword: boolean;
  squadPassword: string;
  squadLimit: number;
  maximumSquadPlayers: number

  setSquadName: (name: string) => void;
  setSquadImage: (image: string) => void;
  setHasPassword: (hasPassword: boolean) => void;
  setSquadPassword: (password: string) => void;
  setSquadLimit: (limit: number) => void;
  setMaximumSquadPlayers: (setMaximumSquadPlayers: number) => void;
}

const useInput = create<InputInterface>((set) => ({
  squadName: '',
  squadImage: 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg',
  hasPassword: false,
  squadPassword: '',
  squadLimit: 4,
  maximumSquadPlayers: 5,

  setSquadName: (name: string) => set({ squadName: name }),
  setSquadImage: (image: string) => set({ squadImage: image }),
  setHasPassword: (hasPassword: boolean) => set({ hasPassword }),
  setSquadPassword: (password: string) => set({ squadPassword: password }),
  setSquadLimit: (limit: number) => set({ squadLimit: limit }),
  setMaximumSquadPlayers: (maximumSquadPlayers: number) => set({ maximumSquadPlayers }),


}));

export default useInput;
