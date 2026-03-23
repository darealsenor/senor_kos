local prizes = {}

prizes.data = {}

CreateThread(function()
    local result = MySQL.query.await('SELECT * FROM `airdrop_prizes`')

    if result then
        for i = 1, #result do
            local row = result[i]
            table.insert(prizes.data, row)
        end
    end
end)

function prizes:Get()
    if next(self.data) then return self.data end

    local result = MySQL.query.await('SELECT * FROM `airdrop_prizes`')

    if result then
        for i = 1, #result do
            local row = result[i]
            table.insert(self.data, row)
        end
    end

    return self.data
end

function prizes:Add(data)
    if self.data then
        for i = 1, #self.data do
            local prize = self.data[i]
            if prize.name == data.name then
                return { success = false, message = locale('error_name_exists', prize.id), prizes = self.data }
            end
        end
    end

    local id = MySQL.insert.await('INSERT INTO `airdrop_prizes` (name, amount) VALUES (?, ?)', {
        data.name, data.amount
    })

    if not id then return { success = false, message = locale('error_something_wrong') } end

    local prize = {
        id = id,
        name = data.name,
        amount = data.amount
    }
    table.insert(self.data, prize)

    return {
        success = true,
        message = locale('success_prize_added', data.name, data.amount, id),
        data = prize,
        prizes = self.data
    }
end

function prizes:Remove(prizeId)
    prizeId = tonumber(prizeId)

    if not prizeId then
        return { success = false, message = locale('error_invalid_id'), prizes = self.data}
    end

    local rowsChanged = MySQL.update.await('DELETE FROM `airdrop_prizes` WHERE id = ?', { prizeId })

    if rowsChanged == 0 then
        return { success = false, message = locale('error_prize_not_found'), prizes = self.data}
    end

    for i = 1, #self.data do
        if tonumber(self.data[i].id) == prizeId then
            table.remove(self.data, i)
            break
        end
    end

    return { success = true, message = locale('success_prize_removed', prizeId), prizes = self.data}
end

function prizes:Update(prizeId, newCount)
    if not prizeId or not newCount then
        return { success = false, message = locale('error_invalid_id_or_amount'), prizes = self.data}
    end

    local idx = nil
    for i = 1, #self.data do
        if tonumber(self.data[i].id) == prizeId then
            idx = i
            break
        end
    end

    if not idx then
        return { success = false, message = locale('error_prize_not_found'), prizes = self.data}
    end

    local rowsChanged = MySQL.update.await(
        'UPDATE `airdrop_prizes` SET amount = ? WHERE id = ?',
        { newCount, prizeId }
    )

    if rowsChanged == 0 then
        return { success = false, message = locale('error_no_changes_made'), prizes = self.data}
    end

    self.data[idx].amount = newCount

    return {
        success = true,
        message = locale('success_prize_updated', self.data[idx].name, newCount),
        data = self.data[idx],
        prizes = self.data
    }
end

return prizes
