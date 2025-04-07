import { ReactSVG } from 'react-svg';
import essosSvg from '../../assets/svg/essos.svg';
import './Map.css';
import React, { useEffect, useState } from 'react';
import { Territory } from '../../types/Territory';
import { API_BASE_URL } from '../../config/config';
import { WebSocketService } from '../../services/WebSocketService';
import TerritoryDetails from '../territoryDetails/TerritoryDetails';
import { houseColors } from '../../types/House';

interface MapProps {
  playerId: string;
}

const Map: React.FC<MapProps> = ({ playerId }) => {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/territories`)
      .then(response => response.json())
      .then(data => setTerritories(data))
      .catch(error => console.error('Error fetching territories:', error));

    const wsService = WebSocketService.getInstance();

    const mapHandler = (message: any) => {
      const updatedTerritory = message.data.territory as Territory;
      setTerritories(prevTerritories =>
        prevTerritories.map(territory =>
          territory._id === updatedTerritory._id ? updatedTerritory : territory
        )
      );
    };

    wsService.registerHandler('territory-updated', mapHandler);

    return () => {
      wsService.unregisterHandler('territory-updated', mapHandler);
      //wsService.disconnect();
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

        document.querySelectorAll('.selected-territory').forEach(el => el.classList.remove('selected-territory'));

        target.classList.add('selected-territory');
      } else {
        console.log('Territory not found');
      }
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedTerritory(null);

    document.querySelectorAll('.selected-territory').forEach(el => el.classList.remove('selected-territory'));
  };

  return (
    <div className="map-container">
      <div className="svg-container">
        <ReactSVG
          src={essosSvg}
          beforeInjection={(svg) => {
            svg.querySelectorAll('[id]').forEach((element) => {
              const territoryId = element.getAttribute('id');
              const territoryData = territories.find(t => t.name === territoryId);
              
              if (territoryData){
                const x = parseFloat(element.getAttribute('x') || '0');
                const y = parseFloat(element.getAttribute('y') || '0');
                const width = parseFloat(element.getAttribute('width') || '0');
                const height = parseFloat(element.getAttribute('height') || '0');

                const centerX = x + width / 2;
                const centerY = y + height / 2;

                const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                textElement.setAttribute('x', centerX.toString());
                textElement.setAttribute('y', centerY.toString());
                textElement.setAttribute('font-size', '12');
                textElement.setAttribute('text-anchor', 'middle');
                textElement.setAttribute('dominant-baseline', 'middle');

                const ownerColor = houseColors[territoryData.owner_id] || 'black';
                textElement.setAttribute('fill', 'white');

                textElement.setAttribute('stroke', ownerColor);
                textElement.setAttribute('stroke-width', '2'); // minél nagyobb, annál vastagabb a háttér
                textElement.setAttribute('paint-order', 'stroke');
                textElement.setAttribute('style', 'paint-order: stroke;'); // extra biztosíték

                textElement.textContent = territoryData.number_of_armies.toString();

                element.parentNode?.appendChild(textElement);
              }

              element.addEventListener('click', (event) => handleTerritoryClick(event as MouseEvent));
            });
          }}
        />
      </div>
      {showDetails && selectedTerritory && (
        <TerritoryDetails
          territoryId={selectedTerritory._id}
          onClose={handleCloseDetails}
          playerId={playerId}
        />
      )}
    </div>
  );
};

export default Map;