import React from 'react';
import logoItca from "../assets/ItcaFepade.png";
import logoAln from "../assets/ALN-logo.svg"; 
//los logos se pueden cambiar, claro deben de estar en la carpeta assets y usar el mismo nombe o simplemente...
//...actualizar el nombre
const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#003366',
      color: 'white',
      padding: '40px 20px',
      marginTop: '50px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '25px',
      borderTop: '4px solid #f0ad4e' 
    }}>
      
      {/* Contenedor de Logos */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '30px', 
        flexWrap: 'wrap' 
      }}>
        {/* Logo ITCA */}
        <img 
          src={logoItca} 
          alt="ITCA-FEPADE" 
          style={{ width: '250px', height: 'auto', filter: 'brightness(1.2)' }} 
        />
        <div style={{ width: '1px', height: '45px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'none' }} className="hidden md:block" />

        {/* Logo ALN */}
        <img 
          src={logoAln} 
          alt="ALN Logo" 
          style={{ width: '250px', height: 'auto' }} 
        />
      </div>

      {/* Enlaces de contacto y ubicación */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        fontSize: '14px'
      }}>
        <a 
          href="mailto:megateczacatecoluca@itca.edu.sv" 
          style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
          className="hover:text-amber-400 transition-colors"
        >
          📧 megateczacatecoluca@itca.edu.sv
        </a>

        <a 
          href="https://www.google.com/maps?q=ITCA+Zacatecoluca" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
          className="hover:text-amber-400 transition-colors"
        >
           
           Ver ubicación (ITCA Zacatecoluca)
        </a>
      </div>

      {/* Copyright */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '12px', opacity: '0.7', margin: '0' }}>
          © 2026 Sistema Turístico SV - ITCA-FEPADE
        </p>
        <p style={{ fontSize: '10px', opacity: '0.5', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Departamento de La Paz
        </p>
      </div>
    </footer>
  );
};

export default Footer;