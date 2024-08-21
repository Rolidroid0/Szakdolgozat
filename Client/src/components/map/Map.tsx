import { ReactSVG } from 'react-svg';
import essosSvg from '../../assets/svg/essos.svg';
import './Map.css';
import { useEffect, useState } from 'react';
import { Territory } from '../../types/Territory';
import { API_BASE_URL } from '../../config/config';
import { WebSocketService } from '../../services/WebSocketService';
import TerritoryDetails from '../territoryDetails/TerritoryDetails';

const Map = () => {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/territories`)
      .then(response => response.json())
      .then(data => setTerritories(data))
      .catch(error => console.error('Error fetching territories:', error));

    const wsService = WebSocketService.getInstance();

    wsService.registerHandler('territory-updated', (data) => {
      const updatedTerritory = data.territory as Territory;
      setTerritories(prevTerritories =>
        prevTerritories.map(territory =>
          territory._id === updatedTerritory._id ? updatedTerritory : territory
        )
      );
    });

    return () => {
      wsService.disconnect();
    };
  }, []);

  const handleTerritoryClick = (event: MouseEvent) => {
    event.stopPropagation();

    const target = event.target as HTMLElement;
    const territoryName = target.getAttribute('id');

    if (territoryName) {
      const territory = territories.find(t => t.name === territoryName);
      if (territory) {
        setSelectedTerritory(territory);
        setShowDetails(true);
      } else {
        console.log('Territory not found');
      }
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedTerritory(null);
  };

  return (
    <div className="map-container">
      <div className="svg-container">
        <ReactSVG
          src={essosSvg}
          beforeInjection={(svg) => {
            svg.querySelectorAll('[id]').forEach((element) => {
              element.addEventListener('click', (event) => handleTerritoryClick(event as MouseEvent));
            });
          }}
        />
      </div>
      {showDetails && selectedTerritory && (
        <TerritoryDetails
          territory={selectedTerritory}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default Map;