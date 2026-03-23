import React, { useEffect, useState } from 'react';
import useStateSlice from '../stores/stateSlice';
import usePlayerStore, { SquadPlayer } from '../stores/playerSlice';
import useSettingsStore from '../stores/settingsSlice';

const Dev = (props) => {
  const { setCurrentPage, toggleChat, chat } = useStateSlice();
  const { toggleHud, hudOpen } = useSettingsStore();

  const [updatePlayers, setUpdatePlayers] = useState<boolean>(false);
  const { mySquad, updatePlayersBulk, setMySquad } = usePlayerStore();

  const setPage = (e) => {
    setCurrentPage(e.target.getAttribute('page-id'));
  };

  useEffect(() => {
    if (!updatePlayers || !mySquad) return;

    const updatePlayersFn = () => {
      const updates: Record<number, Partial<SquadPlayer>> = {};

      Object.entries(mySquad.players).forEach(([serverId, player]) => {
        updates[Number(serverId)] = {
          talking: Math.random() < 0.5,
          health: Math.floor(Math.random() * 100),
          armor: Math.floor(Math.random() * 100),
          image: player.image,
          name: player.name,
          owner: player.owner,
          serverId: player.serverId,
        };
      });

      updatePlayersBulk(updates);
    };

    const interval = setInterval(updatePlayersFn, 3000);

    return () => clearInterval(interval);
  }, [updatePlayers, mySquad, updatePlayersBulk]);

  const createSquad = () => {
    setMySquad({
      players: {
        [1]: {
          name: 'senorrrrrrrrrrr rrrrrrrrrrrrrrrrr rrrrrrrrrrrrrrrrrr',
          serverId: 1,
          owner: true,
          image: 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg',
          talking: true,
          health: 100,
          armor: 45,
        },
      },
      name: 'Senor Squad',
      image: 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg',
      maxplayers: 4,
    });
  };

  const addPlayer = () => {
    if (!mySquad) {
      console.error("Squad not created yet.");
      return;
    }

    const newPlayerId = Object.keys(mySquad.players).length + 1;
    const newPlayer: SquadPlayer = {
      name: `Player ${newPlayerId}`,
      serverId: newPlayerId,
      owner: false,
      image: 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg',
      talking: false,
      health: 22,
      armor: 100,
    };

    setMySquad({
      ...mySquad,
      players: {
        ...mySquad.players,
        [newPlayerId]: newPlayer,
      },
    });
  };

  return (
    <div className="absolute top-4 left-[45%] bg-gradient-to-t from-[#0B0B0B] to-[#101A17] w-[25%] rounded-lg flex flex-col p-5 gap-2">
      <h1 className="text-white">Dev Settings</h1>
      <div className="flex flex-col gap-2 text-white items-start">
        <a page-id="Settings" onClick={setPage}>
          Page: Settings
        </a>
        <a page-id="Creation" onClick={setPage}>
          Page: Creation
        </a>
        <a page-id="Squad" onClick={setPage}>
          Page: Manage
        </a>
        <a page-id="Browse" onClick={setPage}>
          Page: Browse
        </a>
        <a onClick={() => toggleChat(!chat)}>Toggle Chat</a>
        <a onClick={() => toggleHud(!hudOpen)}>Toggle Hud</a>
        <a onClick={() => setUpdatePlayers(!updatePlayers)}>Update players</a>
        <a onClick={createSquad}>Create Squad</a>
        <a onClick={addPlayer}>Add Player</a>
      </div>
    </div>
  );
};

export default Dev;