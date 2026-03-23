import { IMap } from "@/types";
import { atom } from "jotai";

export const mapAtom = atom<IMap>({
    coords: [1100, 400]
})