import React, { useEffect, useState } from "react";
import { Battle } from "../../types/Battle";
import Popup from "reactjs-popup";
import './BattleModal.css';
import { WebSocketService } from "../../services/WebSocketService";
import { rollDice } from "../../services/battleService";
import { getPlayerDetails } from "../../services/playerService";
import { Player } from "../../types/Player";
import Spinner from "../spinner/Spinner";
import { houseColors } from "../../types/House";

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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  const [battleLog, setBattleLog] = useState<string[]>(battle.battle_log || []);

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
      if (player.house === battle.attacker_id && !battle.attackerHasRolled) {
        setCanRoll(true);
      } else if (player.house === battle.defender_id && !battle.defenderHasRolled) {
        setCanRoll(true);
      } else {
        setCanRoll(false);
      }

      if (!battle.defenderHasRolled && !battle.attackerHasRolled) {
        setAttackerRolls([]);
        setDefenderRolls([]);
        setBattleLog(battle.battle_log);
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
    const ws = wsService.getWebSocket();

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

      if (data.type === 'battleEnd' && data.data.battleId === battle._id) {
        console.log(`Battle has ended: ${data.data.winner} won`);
        setIsModalOpen(false);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [battle._id]);

  return (
        <Popup open={isModalOpen} modal closeOnDocumentClick={false} lockScroll={true}>
          <div className="modal">
            <h2>Battle in Progress</h2>

            <div className="battle-header">
              <div className="attacker">
                <h3 style={{ backgroundColor: houseColors[battle.attacker_id] }}>{battle.attacker_id}</h3>
                <p>Initial Armies: {battle.attacker_armies}</p>
                <p>Current Armies: {battle.current_attacker_armies}</p>
              </div>
              <div className="defender" style={{ backgroundColor: houseColors[battle.defender_id] }}>
                <h3>{battle.defender_id}</h3>
                <p>Initial Armies: {battle.defender_armies}</p>
                <p>Current Armies: {battle.current_defender_armies}</p>
              </div>
            </div>

            <div className="dice-rolls">
              <div>
                <h4>Attacker Rolls: {attackerRolls.join(", ")}</h4>
              </div>
              <div>
                <h4>Defender Rolls: {defenderRolls.join(", ")}</h4>
              </div>
            </div>

            <div className="battle-log">
              <h3>Battle Log</h3>
              <div className="log-entries">
                {battleLog.map((entry : any, index) => (
                  <div key={index}>
                    <p>Attacker Rolls: {entry.attackerRolls.join(', ')}</p>
                    <p>Defender Rolls: {entry.defenderRolls.join(', ')}</p>
                    <p>Attacker Losses: {entry.attackerLosses}</p>
                    <p>Defender Losses: {entry.defenderLosses}</p>
                    <p>Remaining Attacker Armies: {entry.remainingAttackerArmies}</p>
                    <p>Remaining Defender Armies: {entry.remainingDefenderArmies}</p>
                    <hr />
                </div>
                ))}
              </div>
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