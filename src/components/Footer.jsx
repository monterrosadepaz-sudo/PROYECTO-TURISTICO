import React from 'react';
import logoItca from "../assets/ItcaFepade.png";

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#003366', // Azul institucional
      color: 'white',
      padding: '30px 20px',
      marginTop: '50px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
      borderTop: '4px solid #f0ad4e' // Detalle en dorado como el logo
    }}>
      {/* 1. Logo del ITCA */}
      <img 
        src={logoItca} 
        alt="ITCA-FEPADE" 
        style={{ width: '200px', filter: 'brightness(1.5)' }} 
      />

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* 2. Correo electrónico */}
        <a 
          href="mailto:megateczacatecoluca@itca.edu.sv" 
          style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          📧 megateczacatecoluca@itca.edu.sv
        </a>

        {/* 3. Pin de ubicación */}
        <a 
          href="https://maps.app.goo.gl/9ULaerNXReBAuSzw5" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
           Ver ubicación (ITCA Zacatecoluca)
        </a>
      </div>

      <p style={{ fontSize: '12px', opacity: '0.8', marginTop: '10px' }}>
        © 2026 Sistema Turístico SV - ITCA-FEPADE
      </p>
    </footer>
  );
};

export default Footer;