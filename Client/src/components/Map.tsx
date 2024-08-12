import React, { useState } from 'react';

const Map: React.FC = () => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const handleMouseEnter = (regionId: string) => {
    setHoveredRegion(regionId);
  };

  const handleMouseLeave = () => {
    setHoveredRegion(null);
  };

  return (
    <div>
      <svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
        <path
          id="region1"
          d="M10 10 L100 10 L100 100 L10 100 Z"
          fill={hoveredRegion === 'region1' ? '#ffcc00' : '#ccc'}
          onMouseEnter={() => handleMouseEnter('region1')}
          onMouseLeave={handleMouseLeave}
        />
        <path
          id="region2"
          d="M110 10 L200 10 L200 100 L110 100 Z"
          fill={hoveredRegion === 'region2' ? '#ffcc00' : '#aaa'}
          onMouseEnter={() => handleMouseEnter('region2')}
          onMouseLeave={handleMouseLeave}
        />
        <path
          id="region3"
          d="M210 10 L300 10 L300 100 L210 100 Z"
          fill={hoveredRegion === 'region3' ? '#ffcc00' : '#888'}
          onMouseEnter={() => handleMouseEnter('region3')}
          onMouseLeave={handleMouseLeave}
        />
      </svg>
    </div>
  );
};

export default Map;
