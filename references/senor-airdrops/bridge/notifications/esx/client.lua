local notifications = {}
local ESX = exports["es_extended"]:getSharedObject()

function notifications.Notify(data)
    assert(data.description or data.title, "Invalid Arguments passed for Notify function. Either 'description' or 'title' must be provided.")
    if data.type == "inform" then
        data.type = "info"
    end

    ESX.ShowNotification(data.description or data.title, data.type or "info", data.duration or 5000)
end

return notifications