import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configuración de iconos para evitar que desaparezcan
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Componente interno para mover la cámara del mapa
function ActualizarVistaMapa({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.lat && coords.lng) {
      map.flyTo([coords.lat, coords.lng], 16, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

const MapaFormulario = ({ setUbicacion, ubicacionActual }) => {
  const [posicion, setPosicion] = useState(null);
  const [nombreLugar, setNombreLugar] = useState("");
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  // Sincronizar posición local si cambia desde afuera (inputs manuales)
  useEffect(() => {
    if (ubicacionActual) {
      setPosicion(ubicacionActual);
    }
  }, [ubicacionActual]);

  const obtenerNombreLugar = async (lat, lng) => {
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await resp.json();
      const nombre = data.display_name || "Lugar seleccionado";
      setNombreLugar(nombre);
      return nombre;
    } catch (error) {
      console.error("Error obteniendo nombre:", error);
      return "Ubicación seleccionada";
    }
  };

  const manejarBusqueda = async (e) => {
    if (e) e.preventDefault();
    if (!terminoBusqueda) return;
    setCargando(true);

    try {
      const respuesta = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${terminoBusqueda}, El Salvador&addressdetails=1`
      );
      const datos = await respuesta.json();

      if (datos.length > 0) {
        const { lat, lon, display_name } = datos[0];
        const nuevasCoords = { lat: parseFloat(lat), lng: parseFloat(lon) };
        
        setPosicion(nuevasCoords);
        setNombreLugar(display_name);
        setUbicacion({ ...nuevasCoords, nombre: display_name });
      } else {
        alert("No se encontró el lugar. Intenta buscar por un punto de referencia cercano.");
      }
    } catch (error) {
      console.error("Error al buscar:", error);
    } finally {
      setCargando(false);
    }
  };

  function ClickMapa() {
    useMapEvents({
      async click(e) {
        const { lat, lng } = e.latlng;
        const coords = { lat, lng };
        setPosicion(coords);
        setCargando(true);
        const nombre = await obtenerNombreLugar(lat, lng);
        setUbicacion({ ...coords, nombre });
        setCargando(false);
      },
    });
    return posicion === null ? null : <Marker position={posicion} />;
  }

  return (
    <div className="espacio-mapa" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      {/* BARRA DE BÚSQUEDA PERSISTENTE */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text"
          placeholder="Busca un lugar o municipio en El Salvador..."
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 15px',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            outline: 'none',
            fontSize: '14px'
          }}
          onKeyDown={(e) => e.key === 'Enter' && manejarBusqueda(e)}
        />
        <button 
          type="button"
          onClick={manejarBusqueda}
          disabled={cargando}
          style={{
            backgroundColor: '#1e40af',
            color: 'white',
            padding: '0 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            cursor: cargando ? 'not-allowed' : 'pointer',
            border: 'none'
          }}
        >
          {cargando ? "..." : "🔍 Buscar"}
        </button>
      </div>

      <div className="mapa-contenedor" style={{ height: '350px', width: '100%', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <MapContainer 
          center={[13.7942, -88.8965]} 
          zoom={8} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickMapa />
          {/* Mueve la cámara cuando 'posicion' cambia (ya sea por clic, busqueda o input manual) */}
          <ActualizarVistaMapa coords={posicion} />
        </MapContainer>
      </div>

      {/* RESULTADO DE SELECCIÓN */}
      {posicion && (
        <div style={{ 
          backgroundColor: '#eff6ff', 
          padding: '15px', 
          borderRadius: '15px', 
          border: '1px solid #bfdbfe'
        }}>
          <p style={{ fontSize: '14px', color: '#1e40af', fontWeight: 'bold', margin: '0 0 5px 0' }}>
            📍 Punto Seleccionado:
          </p>
          <p style={{ fontSize: '13px', color: '#334155', margin: '0' }}>
            {nombreLugar || "Ubicación detectada por coordenadas"}
          </p>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '5px', fontWeight: 'bold' }}>
            {posicion.lat.toFixed(6)}, {posicion.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapaFormulario;