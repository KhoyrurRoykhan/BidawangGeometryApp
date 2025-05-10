import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import papuyu from './assets/papuyu.png';
import targetIconImg from './assets/finish.png';
import swal from 'sweetalert';
import './assets/barito.css';
import L from 'leaflet';
import * as turf from '@turf/turf';

const DisableMapInteractions = () => {
  const map = useMap();

  useEffect(() => {
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.touchZoom.disable();
  }, [map]);

  return null;
};

const RotatedMarker = ({ position, angle }) => {
  const correctedAngle = angle + 270;

  const iconHTML = L.divIcon({
    html: `<div style="transform: rotate(${correctedAngle}deg); width: 30px; height: 30px; background-image: url(${papuyu}); background-size: contain; background-repeat: no-repeat; transform-origin: center center; position: relative;"></div>`,
    className: '',
  });

  return (
    <Marker position={position} icon={iconHTML}>
      <Popup>
        <div>
          <strong>Koordinat:</strong> <br />
          Lat: {position[0].toFixed(6)} <br />
          Lng: {position[1].toFixed(6)}
        </div>
      </Popup>
    </Marker>
  );
};

const geojsonData = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [114.56840896603234, -3.266576290567997],
            [114.56857615158953, -3.268317336134089],
            [114.56988318491688, -3.268070461724122],
            [114.57126086869494, -3.2686347459998046],
            [114.5733097317488, -3.269199029957008],
            [114.57458143985195, -3.269199029957008],
            [114.57606509930696, -3.270327596920069],
            [114.57638302633165, -3.2715266979259496],
            [114.57631237588112, -3.272937403155666],
            [114.57620640020616, -3.2747007818997105],
            [114.57659497768151, -3.2762525526255644],
            [114.57797266145957, -3.277028437086372],
            [114.57920904433848, -3.276675762405773],
            [114.58048075244159, -3.27593514517271],
            [114.58150518396849, -3.275194527390667],
            [114.582247013695, -3.2744891766139546],
            [114.5830594938721, -3.27357221986108],
            [114.58380132359855, -3.27357221986108],
            [114.58468445768614, -3.273572220236659],
            [114.58532031722058, -3.2741012340649718],
            [114.58588552082153, -3.2748771201931532],
            [114.58645072442243, -3.2753708655971536],
            [114.58952401900535, -3.2775221820198936],
            [114.58991259648076, -3.2767815654122074],
            [114.5895946694539, -3.276640495520283],
            [114.58821698567584, -3.2757235407375447],
            [114.58659202532374, -3.2742775718732275],
            [114.58556759379468, -3.2732195445526884],
            [114.58440186136863, -3.2726552628584358],
            [114.58295352713992, -3.272796333311817],
            [114.58207039651211, -3.2736427556158247],
            [114.58030413525876, -3.2750887253957472],
            [114.57878514939267, -3.2761467503001285],
            [114.57761941942192, -3.275864613650924],
            [114.57712486626951, -3.2751592633452447],
            [114.57712486626951, -3.2740659693903353],
            [114.57726616717082, -3.2725494628968193],
            [114.57737214284566, -3.271279827787936],
            [114.57701889059456, -3.2697985847958506],
            [114.5748993770901, -3.268458410678633],
            [114.57278929655587, -3.268057540159049],
            [114.57148226322852, -3.267775397899115],
            [114.5698219766075, -3.2666468272904154],
            [114.56840896603234, -3.266576290567997]
          ]
        ]
      }
    }
  ]
};

const Baritoriver = () => {
  const [turtleCommands, setTurtleCommands] = useState('');
  const [papuyuPosition, setPapuyuPosition] = useState([-3.267347, 114.569077]);
  const [currentAngle, setCurrentAngle] = useState(90);
  const [path, setPath] = useState([]);
  const targetPosition = [-3.268129, 114.571304]; 

  const targetIcon = L.divIcon({
    html: `
      <div style=" 
        width: 50px; 
        height: 50px; 
        background-image: url(${targetIconImg}); 
        background-size: contain; 
        background-repeat: no-repeat; 
        transform-origin: center center;">
      </div>`,
    className: '',
  });

  const handleCommandChange = (event) => {
    setTurtleCommands(event.target.value);
  };

  const executeCommands = () => {
    let currentX = papuyuPosition[0];
    let currentY = papuyuPosition[1];
    const newPath = [...path, { x: currentX, y: currentY }];
    let angle = currentAngle;

    const commands = turtleCommands.split('\n');
    commands.forEach((command) => {
      const parts = command.trim().split(' ');
      const instruction = parts[0].toLowerCase();
      const value = parseFloat(parts[1]);

      switch (instruction) {
        case 'forward':
        case 'fd':
          currentX += value * Math.cos(angle * Math.PI / 180) / 100000;
          currentY += value * Math.sin(angle * Math.PI / 180) / 100000;
          break;
        case 'backward':
        case 'bk':
          currentX -= value * Math.cos(angle * Math.PI / 180) / 100000;
          currentY -= value * Math.sin(angle * Math.PI / 180) / 100000;
          break;
        case 'right':
        case 'rt':
          angle += value;
          break;
        case 'left':
        case 'lt':
          angle -= value;
          break;
        case 'goto':
          if (parts.length === 3) {
            currentX = parseFloat(parts[1]);
            currentY = parseFloat(parts[2]);
          }
          break;
        case 'setheading':
        case 'seth':
          angle = value;
          break;
        default:
          console.warn('Invalid command:', command);
      }
      newPath.push({ x: currentX, y: currentY });
    });

    setPapuyuPosition([currentX, currentY]);
    setPath(newPath);
    setCurrentAngle(angle);

    // Memeriksa apakah marker keluar dari poligon
    const polygonCoordinates = geojsonData.features[0].geometry.coordinates[0].map(([lng, lat]) => [lng, lat]);
    const point = turf.point([currentY, currentX]); // GeoJSON point (lng, lat)
    const polygon = turf.polygon([polygonCoordinates]); // GeoJSON polygon

    if (!turf.booleanPointInPolygon(point, polygon)) {
    swal("Peringatan!", "Anda melewati batas sungai!", "warning");
    }


    const tolerance = 0.0003; 
    if (
      Math.abs(currentX - targetPosition[0]) <= tolerance &&
      Math.abs(currentY - targetPosition[1]) <= tolerance
    ) {
      swal("Horee!", "Ikan Papuyu telah sampai di tujuan!", "success");
    }
  };

  return (
    <div style={{ marginTop: 50 }} className="baritoriver-container">
      <h1 className="header-title">SUNGAI ALALAK</h1>
      <MapContainer center={[-3.27286, 114.57985]} zoom={15} style={{ height: "500px", width: "600px" }}>

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polygon
          positions={geojsonData.features[0].geometry.coordinates[0].map(([lng, lat]) => [lat, lng])}
          color="blue"
          weight={2}
          opacity={0.6}
          fillColor="blue"
          fillOpacity={0.3}
        />
        <DisableMapInteractions />
        <RotatedMarker position={papuyuPosition} angle={currentAngle} />
        <Marker position={targetPosition} icon={targetIcon}>
          <Popup>
            <div>
              <strong>Koordinat Target:</strong> <br />
              Lat: {targetPosition[0].toFixed(6)} <br />
              Lng: {targetPosition[1].toFixed(6)}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      <div className="command-section">
        <textarea
          value={turtleCommands}
          onChange={handleCommandChange}
          placeholder="Masukkan perintah di sini..."
        />
        <button className='execute-button' onClick={executeCommands}>Execute</button>
      </div>
    </div>
  );
};

export default Baritoriver;
