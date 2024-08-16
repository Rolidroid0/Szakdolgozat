import { ReactSVG } from 'react-svg';
import essosSvg from '../../assets/svg/essos.svg'
import './Map.css'

const Map = () => {
  return (
    <div className="svg-container">
    <ReactSVG
      src={essosSvg}
    /></div>
  );
};

export default Map;