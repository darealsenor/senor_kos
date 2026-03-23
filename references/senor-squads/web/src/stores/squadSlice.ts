import { create } from 'zustand'

export interface Squad {
  squadId: number
  name: string
  image: string
  maxplayers: number
  privacy: boolean
  playersLength: number
}

const initialSquads: Squad[] = [
  {
    squadId: 1,
    name: 'Senor Squad',
    image:
      'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ae109ede-ab26-4864-b0c1-17df0735a693/dc3zalp-4dfadebc-d305-48ac-a9b8-02b0dacadc79.jpg/v1/fill/w_400,h_400,q_75,strp/random_draw_for_my_pfp_by_alexthetrain_dc3zalp-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NDAwIiwicGF0aCI6IlwvZlwvYWUxMDllZGUtYWIyNi00ODY0LWIwYzEtMTdkZjA3MzVhNjkzXC9kYzN6YWxwLTRkZmFkZWJjLWQzMDUtNDhhYy1hOWI4LTAyYjBkYWNhZGM3OS5qcGciLCJ3aWR0aCI6Ijw9NDAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.U2mb_MuSNjA3JGlM08AcBUcaxj-EYul5k-RdtYmoiiQ',
    maxplayers: 4,
    privacy: true,
    playersLength: 2,
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
    playersLength: 4,

  },
  {
    squadId: 4,
    name: 'Senor Squad',
    image:
      'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ae109ede-ab26-4864-b0c1-17df0735a693/dc3zalp-4dfadebc-d305-48ac-a9b8-02b0dacadc79.jpg/v1/fill/w_400,h_400,q_75,strp/random_draw_for_my_pfp_by_alexthetrain_dc3zalp-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NDAwIiwicGF0aCI6IlwvZlwvYWUxMDllZGUtYWIyNi00ODY0LWIwYzEtMTdkZjA3MzVhNjkzXC9kYzN6YWxwLTRkZmFkZWJjLWQzMDUtNDhhYy1hOWI4LTAyYjBkYWNhZGM3OS5qcGciLCJ3aWR0aCI6Ijw9NDAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.U2mb_MuSNjA3JGlM08AcBUcaxj-EYul5k-RdtYmoiiQ',
    maxplayers: 2,
    privacy: true,
    playersLength: 5,

  },
  {
    squadId: 5,
    name: 'Senor Squad',
    image:
      'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ae109ede-ab26-4864-b0c1-17df0735a693/dc3zalp-4dfadebc-d305-48ac-a9b8-02b0dacadc79.jpg/v1/fill/w_400,h_400,q_75,strp/random_draw_for_my_pfp_by_alexthetrain_dc3zalp-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NDAwIiwicGF0aCI6IlwvZlwvYWUxMDllZGUtYWIyNi00ODY0LWIwYzEtMTdkZjA3MzVhNjkzXC9kYzN6YWxwLTRkZmFkZWJjLWQzMDUtNDhhYy1hOWI4LTAyYjBkYWNhZGM3OS5qcGciLCJ3aWR0aCI6Ijw9NDAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.U2mb_MuSNjA3JGlM08AcBUcaxj-EYul5k-RdtYmoiiQ',
    maxplayers: 2,
    privacy: true,
    playersLength: 1
  },
  {
    squadId: 6,
    name: 'Senor Squad',
    image:
      'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ae109ede-ab26-4864-b0c1-17df0735a693/dc3zalp-4dfadebc-d305-48ac-a9b8-02b0dacadc79.jpg/v1/fill/w_400,h_400,q_75,strp/random_draw_for_my_pfp_by_alexthetrain_dc3zalp-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NDAwIiwicGF0aCI6IlwvZlwvYWUxMDllZGUtYWIyNi00ODY0LWIwYzEtMTdkZjA3MzVhNjkzXC9kYzN6YWxwLTRkZmFkZWJjLWQzMDUtNDhhYy1hOWI4LTAyYjBkYWNhZGM3OS5qcGciLCJ3aWR0aCI6Ijw9NDAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.U2mb_MuSNjA3JGlM08AcBUcaxj-EYul5k-RdtYmoiiQ',
    maxplayers: 2,
    privacy: true,
    playersLength: 6,

  },
  {
    squadId: 7,
    name: 'Senor Squad',
    image:
      'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ae109ede-ab26-4864-b0c1-17df0735a693/dc3zalp-4dfadebc-d305-48ac-a9b8-02b0dacadc79.jpg/v1/fill/w_400,h_400,q_75,strp/random_draw_for_my_pfp_by_alexthetrain_dc3zalp-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NDAwIiwicGF0aCI6IlwvZlwvYWUxMDllZGUtYWIyNi00ODY0LWIwYzEtMTdkZjA3MzVhNjkzXC9kYzN6YWxwLTRkZmFkZWJjLWQzMDUtNDhhYy1hOWI4LTAyYjBkYWNhZGM3OS5qcGciLCJ3aWR0aCI6Ijw9NDAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.U2mb_MuSNjA3JGlM08AcBUcaxj-EYul5k-RdtYmoiiQ',
    maxplayers: 2,
    privacy: true,
    playersLength: 7,

  },
  {
    squadId: 8,
    name: 'Senor Squad',
    image:
      'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ae109ede-ab26-4864-b0c1-17df0735a693/dc3zalp-4dfadebc-d305-48ac-a9b8-02b0dacadc79.jpg/v1/fill/w_400,h_400,q_75,strp/random_draw_for_my_pfp_by_alexthetrain_dc3zalp-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NDAwIiwicGF0aCI6IlwvZlwvYWUxMDllZGUtYWIyNi00ODY0LWIwYzEtMTdkZjA3MzVhNjkzXC9kYzN6YWxwLTRkZmFkZWJjLWQzMDUtNDhhYy1hOWI4LTAyYjBkYWNhZGM3OS5qcGciLCJ3aWR0aCI6Ijw9NDAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.U2mb_MuSNjA3JGlM08AcBUcaxj-EYul5k-RdtYmoiiQ',
    maxplayers: 2,
    privacy: true,
    playersLength: 8,

  },
]

export interface squadInterface {
  availableSquads: Squad[]
  setAvailableSquads: (Squads: Squad[]) => void

  selectedSquad: Squad | null
  setSelectedSquad: (Squad: Squad) => void

  squadPassword: string
  setSquadPassword: (string: string) => void;

  squadFilter: string;
  setSquadFilter: (filter: string) => void;
}

const useSquad = create<squadInterface>((set, get) => ({
  availableSquads: initialSquads,
  setAvailableSquads: (Squads: Squad[]) => set({ availableSquads: Squads, selectedSquad: null }),

  selectedSquad: initialSquads[1],
  setSelectedSquad: (Squad: Squad) => set({ selectedSquad: Squad, squadPassword: '' }),

  squadPassword: '',
  setSquadPassword: (string: string) => set({ squadPassword: string }),

  squadFilter: '',
  setSquadFilter: (filter: string) => set({ squadFilter: filter }),
}))

export default useSquad
