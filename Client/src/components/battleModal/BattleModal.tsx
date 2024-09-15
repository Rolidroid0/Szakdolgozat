import React from "react";
import { Battle } from "../../types/Battle";
import Popup from "reactjs-popup";
import './BattleModal.css';

interface BattleModalProps {
    battle: Battle;
}

const BattleModal: React.FC<BattleModalProps> = ({ battle }) => {
    return (
        <Popup open={true} modal closeOnDocumentClick={false} lockScroll={true}>
          <div className="modal">
            <h2>Battle in Progress</h2>
            <p>Attacker: {battle.attacker_id}</p>
            <p>Defender: {battle.defender_id}</p>
            <p>Attacker Armies: {battle.current_attacker_armies}</p>
            <p>Defender Armies: {battle.current_defender_armies}</p>
          </div>
        </Popup>
    );
};

export default BattleModal;