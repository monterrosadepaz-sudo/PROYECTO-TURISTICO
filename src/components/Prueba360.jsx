import React from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';

export default function Prueba360() {
  // Esta es una URL pública con una foto 360 real para hacer pruebas
  const imagen360Prueba = "https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-8 font-sans italic">
      
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 uppercase tracking-tighter">
          Test Inmersivo <span className="text-blue-600">360°</span>
        </h1>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
          Bypass Front-end / Datos Hardcodeados
        </p>
      </div>

      {/* CONTENEDOR DEL VISOR 360 */}
      {/* Le damos un tamaño fijo y bordes redondeados para que luzca pro */}
      <div className="w-full max-w-5xl h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/20 border-8 border-white relative cursor-move">
        
        <ReactPhotoSphereViewer 
          src={imagen360Prueba} 
          height="100%" 
          width="100%" 
          // Estas son opciones extra geniales:
          littlePlanet={false} // Cámbialo a true si quieres un efecto loco de inicio
          hideNavbarButton={true} // Oculta botones por defecto para un look más limpio
        />

        {/* Etiqueta flotante para UX */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-full pointer-events-none z-10">
           <p className="text-[10px] font-black uppercase tracking-widest">
             👆 Arrastra para explorar
           </p>
        </div>

      </div>
      
    </div>
  );
}