/*import { ReactSVG } from 'react-svg';
import essosSvg from '../../assets/svg/essos.svg'
import './Map.css'
import { useEffect, useState } from 'react';
import { Territory } from '../../types/Territory';
import { API_BASE_URL } from '../../config/config';

const Map = () => {
  const [territories, setTerritories] = useState<Territory[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/territories`)
      .then(response => response.json())
      .then(data => setTerritories(data))
      .catch(error => console.error('Error fetching territories:', error));
  }, []);

  const handleTerritoryClick = (territoryName: string) => {
    const territory = territories.find(t => t.name === territoryName);
      if (territory) {
        console.log('Territory data:', territory);
      } else {
        console.log('Territory not found');
      }
  };
    
  return (
    <div className="svg-container">
    <ReactSVG
      src={essosSvg}
      beforeInjection={(svg) => {
        svg.querySelectorAll('[id]').forEach((element) => {
          const territoryName = element.getAttribute('id');
          if (territoryName) {
            element.addEventListener('click', () => handleTerritoryClick(territoryName));
          }
        });
      }}
    /></div>
  );
};

export default Map;*/

import { ReactSVG } from 'react-svg';
import essosSvg from '../../assets/svg/essos.svg';
import './Map.css';
import { useEffect, useState } from 'react';
import { Territory } from '../../types/Territory';
import { API_BASE_URL } from '../../config/config';

const Map = () => {
  const [territories, setTerritories] = useState<Territory[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/territories`)
      .then(response => response.json())
      .then(data => setTerritories(data))
      .catch(error => console.error('Error fetching territories:', error));
  }, []);

  const handleTerritoryClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const territoryName = target.getAttribute('id');
    if (territoryName) {
      const territory = territories.find(t => t.name === territoryName);
      if (territory) {
        console.log('Territory data:', territory);
      } else {
        console.log('Territory not found');
      }
    }
  };

  useEffect(() => {
    const svgElement = document.querySelector('svg');
    
    if (svgElement) {
      svgElement.querySelectorAll('[id]').forEach((element) => {
        const handleClick = (event: Event) => handleTerritoryClick(event as MouseEvent);
        element.addEventListener('click', handleClick);
        
        // Cleanup function to remove event listeners
        return () => {
          element.removeEventListener('click', handleClick);
        };
      });
    }
  }, [territories]);

  return (
    <div className="svg-container">
      <ReactSVG
        src={essosSvg}
        beforeInjection={(svg) => {
          svg.querySelectorAll('[id]').forEach((element) => {
            const handleClick = (event: Event) => handleTerritoryClick(event as MouseEvent);
            element.addEventListener('click', handleClick);
          });
        }}
      />
    </div>
  );
};

export default Map;
