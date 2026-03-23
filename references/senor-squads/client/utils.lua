--- A simple wrapper around SendNUIMessage that you can use to
--- dispatch actions to the React frame.
---
---@param action string The action you wish to target
---@param data any The data you wish to send along with this action
function SendReactMessage(action, data)
  SendNUIMessage({
    action = action,
    data = data
  })
end

function ToggleNuiFrame(shouldShow)
  SetNuiFocus(shouldShow, shouldShow)
  SendReactMessage('setVisible', shouldShow)
end

function CleanNils(t)
  local ans = {}
  for _, v in pairs(t) do
      ans[#ans + 1] = v
  end
  return ans
end

-- function RefreshSquadAttributes()
--   for k, v in pairs(Squad.mySquad.players) do
--       v.entity = DoesEntityExist(NetworkGetEntityFromNetworkId(v.network)) and NetworkGetEntityFromNetworkId(v.network) or
--       false
--       v.health = v.entity and GetEntityHealth(v.entity) / 2 or 100
--       v.armor = v.entity and GetPedArmour(v.entity) or 100
--   end
-- end