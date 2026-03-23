local manager = require 'server.services.manager_service'

local locations = {}
locations.data = {}

local function GetCoordsAndSet()
    local result = MySQL.query.await('SELECT * FROM `airdrop_locations`')

    if result then
        for i = 1, #result do
            local row = result[i]
            if row.coords then
                row.coords = json.decode(row.coords)
                row.taken = false
            end
            table.insert(locations.data, row)
        end
    end
end

CreateThread(GetCoordsAndSet)

function locations:Get()
    if next(self.data) then return self.data end

    GetCoordsAndSet()
    return self.data
end

function locations:GetRandom()
    if not next(self.data) then
        return {
            success = false,
            message = locale('message_no_locations'),
            coords = Config.Defaults.FallbackLocation
        }
    end

    local available = {}
    for i = 1, #self.data do
        local location = self.data[i]
        if not location.taken then
            local intersectResult = manager.isDropIntersecting(location.coords, Config.LocationCheckIntersectionDistance)
            if not intersectResult.success then
                table.insert(available, location)
            end
        end
    end

    if #available == 0 then
        return {
            success = false,
            message = locale('message_no_locations')
        }
    end

    local randomIndex = math.random(1, #available)
    local selected = available[randomIndex]

    for i = 1, #self.data do
        if self.data[i].id == selected.id then
            self.data[i].taken = true
            break
        end
    end

    return {
        success = true,
        message = locale('success_location_selected'),
        coords = vector3(selected.coords.x, selected.coords.y, selected.coords.z),
        locationId = selected.id,
        name = selected.name
    }
end

function locations:Add(data)
    local encodedCoords = json.encode(data.coords)
    local id = MySQL.insert.await('INSERT INTO `airdrop_locations` (name, coords) VALUES (?, ?)', {
        data.name, encodedCoords
    })

    if not id then
        return { success = false, message = locale('error_something_wrong') }
    end

    local loc = {
        id = id,
        name = data.name,
        coords = data.coords,
        taken = false
    }

    table.insert(self.data, loc)

    return {
        success = true,
        message = locale('success_location_added', encodedCoords, data.name, id),
        data = loc,
        locations = self.data
    }
end

function locations:Remove(coordsId)
    coordsId = tonumber(coordsId)

    if not coordsId then
        return { success = false, message = locale('error_invalid_id') }
    end

    local rowsChanged = MySQL.update.await('DELETE FROM `airdrop_locations` WHERE id = ?', { coordsId })

    if rowsChanged == 0 then
        return { success = false, message = locale('error_location_not_found') }
    end

    for i = 1, #self.data do
        if tonumber(self.data[i].id) == coordsId then
            table.remove(self.data, i)
            break
        end
    end

    return { success = true, message = locale('success_location_removed', coordsId), locations = self.data }
end

function locations:Update(coordsId, newData)
    coordsId = tonumber(coordsId)

    if not coordsId or not newData then
        return { success = false, message = locale('error_invalid_id_or_coords') }
    end

    local idx
    for i = 1, #self.data do
        if tonumber(self.data[i].id) == coordsId then
            idx = i
            break
        end
    end

    if not idx then
        return { success = false, message = locale('error_location_not_found') }
    end

    local encodedCoords = json.encode(newData.coords)

    local rowsChanged = MySQL.update.await(
        'UPDATE `airdrop_locations` SET coords = ?, name = ? WHERE id = ?',
        { encodedCoords, newData.name, coordsId }
    )

    if rowsChanged == 0 then
        return { success = false, message = locale('error_no_changes_made') }
    end

    self.data[idx].coords = newData.coords
    self.data[idx].name = newData.name

    return {
        success = true,
        message = locale('success_location_updated', newData.name),
        data = self.data[idx],
        locations = self.data,
    }
end

function locations:SetTaken(coordsId, isTaken)
    coordsId = tonumber(coordsId)

    if not coordsId then
        return { success = false, message = locale('error_invalid_id') }
    end

    for i = 1, #self.data do
        if tonumber(self.data[i].id) == coordsId then
            self.data[i].taken = isTaken
            return {
                success = true,
                message = locale('success_location_set_taken', coordsId, tostring(isTaken)),
                data = self.data[i]
            }
        end
    end

    return { success = false, message = locale('error_location_not_found') }
end

function locations:FindByCoords(coords)
    for i = 1, #self.data do
        local loc = self.data[i]
        if loc.coords.x == coords.x and loc.coords.y == coords.y and loc.coords.z == coords.z then
            return loc
        end
    end
    return nil
end

return locations
