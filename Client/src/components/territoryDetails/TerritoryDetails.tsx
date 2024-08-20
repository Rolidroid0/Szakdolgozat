import React from 'react';
import { Territory } from '../../types/Territory';
import './TerritoryDetails.css';

interface TerritoryDetailsProps {
    territory: Territory;
    onClose: () => void;
}

const TerritoryDetails: React.FC<TerritoryDetailsProps> = ({ territory, onClose }) => {
    return (
        <div className="territory-details-panel">
            <div className="header">
                <h2>{territory.name}</h2>
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
            </div>
            <div className="details">
                <p>Fortress: {territory.fortress}</p>
                <p>Port: {territory.port}</p>
                <p>Region: {territory.region}</p>
            </div>
        </div>
    );
};

export default TerritoryDetails;