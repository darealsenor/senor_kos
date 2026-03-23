import { IInput } from "@/types";
import { atom } from "jotai";

export const inputAtom = atom<IInput>({
    coords: { x: 100, y: 200, z: 300 },
    weapons: 'Regular',
    settings: {},
    interaction: "Keystroke",
    lockTime: 15,
    distance: 300,
    newDropName: '',
    newDropCoords: {x: 0, y: 0, z: 0}
  })