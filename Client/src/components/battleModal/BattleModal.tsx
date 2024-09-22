import React, { useEffect, useState } from "react";
import { Battle } from "../../types/Battle";
import Popup from "reactjs-popup";
import './BattleModal.css';
import { WebSocketService } from "../../services/WebSocketService";
import { rollDice } from "../../services/battleService";
import { getPlayerDetails } from "../../services/playerService";
import { Player } from "../../types/Player";
import Spinner from "../spinner/Spinner";

interface BattleModalProps {
    wsService: WebSocketService;
    battle: Battle;
    playerId: string;
}

const BattleModal: React.FC<BattleModalProps> = ({ wsService, battle, playerId }) => {
  const [attackerRolls, setAttackerRolls] = useState<number[]>(battle.attackerRolls || []);
  const [defenderRolls, setDefenderRolls] = useState<number[]>(battle.defenderRolls || []);
  const [canRoll, setCanRoll] = useState<boolean>(false);
  const [player, setPlayer] = useState<Player>();
  const [loadingPlayer, setLodaingPlayer] = useState<boolean>(true);

  const ws = wsService.getWebSocket();

  useEffect(() => {
    const fetchPlayer = async () => {
      setLodaingPlayer(true);
      try {
        const result = await getPlayerDetails(playerId);
        setPlayer(result);
      } catch (error) {
        console.error("Error fetching player: ", error);
      } finally {
        setLodaingPlayer(false);
      }
    };

    fetchPlayer();
  }, [playerId]);

  useEffect(() => {
    if (player) {
      if (player.house === battle.attacker_id && !battle.hasAttackerRolled) {
        setCanRoll(true);
      } else if (player.house === battle.defender_id && !battle.hasDefenderRolled) {
        setCanRoll(true);
      } else {
        setCanRoll(false);
      }
    }
  }, [battle, player]);

  const handleRollDice = async () => {
    try {
      const result = await rollDice(playerId);
      console.log("Dice rolled: ", result);
      setCanRoll(false);
    } catch (error) {
      console.error("Error rolling dice: ", error);
    }
  };

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (message: MessageEvent) => {
      const data = JSON.parse(message.data);

      if (data.type === 'rollResult' && data.battleId === battle._id) {
        if (data.playerRole === 'attacker') {
          setAttackerRolls(data.rollResult);
        } else if (data.playerRole === 'defender') {
          setDefenderRolls(data.rollResult);
        }
      }

      if (data.type === 'battleUpdate' && data.battleId === battle._id) {
        console.log("Battle update: ", data.roundResult);
        setAttackerRolls(data.roundResult.attackerRolls);
        setDefenderRolls(data.roundResult.defenderRolls);
      }

      if (data.type === 'battleEnd' && data.battleId === battle._id) {
        console.log("Battle has ended: ", data.winner);
        //TODO: bezárni a modalt
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [ws, battle._id]);

  return (
        <Popup open={true} modal closeOnDocumentClick={false} lockScroll={true}>
          <div className="modal">
            <h2>Battle in Progress</h2>
            <p>Attacker: {battle.attacker_id}</p>
            <p>Defender: {battle.defender_id}</p>
            <p>Attacker Armies: {battle.current_attacker_armies}</p>
            <p>Defender Armies: {battle.current_defender_armies}</p>

            <div className="dice-rolls">
              <h3>Attacker Rolls: {attackerRolls.join(", ")}</h3>
              <h3>Defender Rolls: {defenderRolls.join(", ")}</h3>
            </div>

            {loadingPlayer ? (
              <Spinner />
            ) : (
              canRoll && (
                <button onClick={handleRollDice} className="roll-button">
                  Roll Dice
                </button>
              )
            )}
          </div>
        </Popup>
    );
};

export default BattleModal;