--- A simple wrapper around SendNUIMessage that you can use to
--- dispatch actions to the React frame.
---
---@param action string The action you wish to target
---@param data any The data you wish to send along with this action
function SendReactMessage(action, data)
  repeat
    Wait(0)
  until IsNuiLoaded
  SendNUIMessage({
    action = action,
    data = data
  })
end

function ToggleNuiFrame(box, input, focus)
  SetNuiFocus(focus, focus)
  SendReactMessage('setVisible', {box = box, input = input})
end