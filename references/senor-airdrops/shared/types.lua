---@class PointProperties
---@field coords vector3
---@field distance number
---@field onEnter? fun(self: CPoint)
---@field onExit? fun(self: CPoint)
---@field nearby? fun(self: CPoint)
---@field [string] any

---@class CPoint : PointProperties
---@field id number
---@field currentDistance number
---@field isClosest? boolean
---@field remove fun()

---@alias Point CPoint

---@class Vector3
---@field x number
---@field y number
---@field z number

---@class Prize
---@field id? number
---@field name string
---@field amount string

---@class Prizes
---@field prizes? Prize[]

---@class Airdrop
---@field id string
---@field playerId number
---@field coords vector3
---@field distance number
---@field lockTime number
---@field interaction Pickup
---@field weapons AirdropWeapons
---@field settings AirdropSettings
---@field prizes? Prize[]
---@field dropState number
---@field startTimer number
---@field timeLeft number
---@field startTime number
---@field client? table
---@field notified? boolean

---@class AirdropNuiRetval
---@field coords vector3
---@field lockTime number
---@field distance number
---@field prizes table
---@field weapons table
---@field settings table
---@field interaction string

---@class Coords
---@field id? number
---@field name string
---@field coords table
---@field taken? boolean