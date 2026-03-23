function toggleNuiFrame(shouldShow)
  SetNuiFocus(shouldShow, shouldShow)
  SendReactMessage('setVisible', shouldShow)
end

function setNuiFocusOnly(hasFocus)
  SetNuiFocus(hasFocus, hasFocus)
end

RegisterNUICallback('hideFrame', function(_, cb)
  toggleNuiFrame(false)
  cb({})
end)