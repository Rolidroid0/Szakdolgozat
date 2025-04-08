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
  const [attackerRolls, setAttackerRolls] = useState<number[]>(battle.attacker_rolls || []);
  const [defenderRolls, setDefenderRolls] = useState<number[]>(battle.defender_rolls || []);
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
      if (player.house === battle.attacker_id && !battle.attacker_has_rolled) {
        setCanRoll(true);
      } else if (player.house === battle.defender_id && !battle.defender_has_rolled) {
        setCanRoll(true);
      } else {
        setCanRoll(false);
      }

      if (!battle.defender_has_rolled && !battle.attacker_has_rolled) {
        setAttackerRolls([]);
        setDefenderRolls([]);
        setBattleLog(battle.battle_log);
      }

      if(battle != null) {
        setIsModalOpen(true);
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
    const battleModalHandler = (message: any) => {
      if (message.action === 'roll-result' && message.battleId === battle._id) {
        if (message.playerRole === 'attacker') {
          setAttackerRolls(message.rollResult);
        } else if (message.playerRole === 'defender') {
          setDefenderRolls(message.rollResult);
        }
      }

      if (message.action === 'battle-end' && message.data.battleId === battle._id) {
        console.log(`Battle has ended: ${message.data.winner} won`);
        setIsModalOpen(false);
      }
    };

    wsService.registerHandler('roll-result', battleModalHandler);
    wsService.registerHandler('battle-end', battleModalHandler);
    return () => {
      wsService.unregisterHandler('roll-result', battleModalHandler);
      wsService.unregisterHandler('battle-end', battleModalHandler);
    };
  }, [battle._id]);

  return (
        <Popup open={isModalOpen} modal closeOnDocumentClick={false} lockScroll={true}>
          <div className="modal">
            <h2>Battle in Progress</h2>

            <div className="battle-header">
              <div className="attacker">
                <h3 style={{ backgroundColor: houseColors[battle.attacker_id] }}>⚔️ {battle.attacker_id}</h3>
                <p>Initial Armies: {battle.attacker_armies}</p>
                <p>Current Armies: {battle.current_attacker_armies}</p>
              </div>

              <div className="battle-center">
                <div className="dice-rolls">
                  <div>
                    <h4>⚔️ Attacker Rolls: {attackerRolls.join(" 🎲, ")}</h4>
                  </div>
                  <div>
                    <h4>🛡️ Defender Rolls: {defenderRolls.join(" 🎲, ")}</h4>
                  </div>
                </div>

                <div className="battle-log">
                  <h3>Battle Log</h3>
                  <div className="log-entries">
                    {battleLog.map((entry, index) => {
                      const parsedEntry = JSON.parse(entry);
                      return (
                        <div key={index}>
                          <p>Attacker Rolls: {parsedEntry.attackerRolls.join(", ")}</p>
                          <p>Defender Rolls: {parsedEntry.defenderRolls.join(", ")}</p>
                          <p>Attacker Losses: {parsedEntry.attackerLosses}</p>
                          <p>Defender Losses: {parsedEntry.defenderLosses}</p>
                          <p>Remaining Attacker Armies: {parsedEntry.remainingAttackerArmies}</p>
                          <p>Remaining Defender Armies: {parsedEntry.remainingDefenderArmies}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {canRoll && !loadingPlayer && (
                  <button onClick={handleRollDice} className="roll-button">
                    Roll Dice
                  </button>
                )}
              </div>

              <div className="defender">
                <h3 style={{ backgroundColor: houseColors[battle.defender_id] }}>🛡️ {battle.defender_id}</h3>
                <p>Initial Armies: {battle.defender_armies}</p>
                <p>Current Armies: {battle.current_defender_armies}</p>
              </div>
            </div>
          </div>
        </Popup>
    );
};

export default BattleModal;