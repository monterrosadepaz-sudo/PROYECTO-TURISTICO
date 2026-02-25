import React, { useState } from 'react';

export default function GestorLoteImagenes({ idpublicacion, imagenesCargadas, alTerminar }) {
  
  // ==========================================
  // ESTADOS DEL WIZARD
  // ==========================================
  const [fase, setFase] = useState(1);
  const [cargandoEnvio, setCargandoEnvio] = useState(false);

  const [intenciones, setIntenciones] = useState({}); 
  const [listaEsperando, setListaEsperando] = useState([]); 
  
  // Guardamos: { "nombre.jpg": { file: File, preview: "blob:...", is360: false } }
  const [archivosFisicos, setArchivosFisicos] = useState({}); 

  // ==========================================
  // GENERADOR INTELIGENTE DE NOMBRES
  // ==========================================
  const extraerLote = (nombreAnterior) => {
      if (!nombreAnterior) return null;
      const partes = nombreAnterior.split('-');
      if (partes.length >= 2) {
          return partes[1]; // Rescatamos el lote intacto (ej: g3vq7n8s11)
      }
      return null;
  };

  const generarNombreValido = (index, originalFile, nombreAnterior, is360) => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const fechaStr = `${dd}${mm}${yyyy}`;
    
    // Intentamos rescatar el lote original, si falla por algo raro, creamos uno de emergencia
    let loteID = extraerLote(nombreAnterior);
    if (!loteID) {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        loteID = '';
        for (let i = 0; i < 10; i++) loteID += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    let ext = originalFile ? originalFile.name.split('.').pop().toLowerCase() : 'jpg';
    if (!['jpg', 'jpeg', 'png', 'ico', 'mp4'].includes(ext)) ext = 'jpg';
    
    const sufijo360 = is360 ? '-360' : '';

    // Ensamblamos manteniendo el formato sagrado
    return `0000${fechaStr}publicacion-${loteID}-${index}${sufijo360}.${ext}`;
  };

  // ==========================================
  // LÓGICA FASE 1
  // ==========================================
  const toggleIntencion = (nombreImagen, accion) => {
    setIntenciones(prev => {
      const copia = { ...prev };
      if (copia[nombreImagen] === accion) delete copia[nombreImagen]; 
      else copia[nombreImagen] = accion;
      return copia;
    });
  };

  const enviarPreparacion = async () => {
    const cambios = Object.keys(intenciones).map(nombre => ({
        accion: intenciones[nombre],
        nombre: nombre
    }));

    if (cambios.length === 0) {
        alert("No has seleccionado ninguna acción. Cierra esta ventana si no deseas editar imágenes.");
        return;
    }

    setCargandoEnvio(true);
    try {
        const payload = { cambios };
        const url = `http://100.123.6.123:8000/api/colaborador/publicaciones/lotes/editar/${idpublicacion}`;
        
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Fallo en la comunicación con el servidor al preparar los cambios.");
        
        const data = await res.json();
        
        if (data.esperando && data.esperando.length > 0) {
            setListaEsperando(data.esperando);
            setFase(2);
        } else {
            alert("Imágenes eliminadas correctamente de la base de datos.");
            alTerminar(); 
        }
    } catch (error) {
        alert(error.message);
    } finally {
        setCargandoEnvio(false);
    }
  };

  // ==========================================
  // LÓGICA FASE 2
  // ==========================================
  const handleArchivoSeleccionado = (nombreEsperado, e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setArchivosFisicos(prev => ({
          ...prev,
          [nombreEsperado]: {
              file: file,
              preview: URL.createObjectURL(file),
              is360: false // Por defecto no es 360
          }
      }));
  };

  const removerArchivo = (nombreEsperado) => {
      setArchivosFisicos(prev => {
          const copia = { ...prev };
          delete copia[nombreEsperado];
          return copia;
      });
  };

  const toggle360 = (nombreEsperado) => {
      setArchivosFisicos(prev => ({
          ...prev,
          [nombreEsperado]: {
              ...prev[nombreEsperado],
              is360: !prev[nombreEsperado].is360
          }
      }));
  };

  const enviarAplicacionFinal = async () => {
      const faltan = listaEsperando.filter(nombre => !archivosFisicos[nombre]);
      if (faltan.length > 0) {
          alert(`Te falta subir ${faltan.length} archivo(s) para completar la sustitución.`);
          return;
      }

      setCargandoEnvio(true);
      try {
          const form = new FormData();
          
          listaEsperando.forEach((nombreAnterior, index) => {
              // 1. Le devolvemos a Julio el nombre viejo
              form.append('esperando[]', nombreAnterior);
              
              // 2. Extraemos el archivo y estado 360
              const fileData = archivosFisicos[nombreAnterior];
              
              // 3. Rescatamos el lote original y armamos el nombre
              const nuevoNombreValidado = generarNombreValido(index + 1, fileData.file, nombreAnterior, fileData.is360);
              
              // 4. Renombramos y empaquetamos
              const archivoRenombrado = new File([fileData.file], nuevoNombreValidado, { type: fileData.file.type });
              form.append('archivos_nuevos[]', archivoRenombrado);
          });

          const url = `http://100.123.6.123:8000/api/colaborador/preformularios/lotes/editar/${idpublicacion}`;
          const res = await fetch(url, {
              method: 'POST',
              headers: { 'Accept': 'application/json' },
              body: form
          });

          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || "Error al aplicar las nuevas imágenes en el servidor.");
          }

          alert("¡Nuevas imágenes aplicadas correctamente!");
          alTerminar(); 

      } catch (error) {
          alert(error.message);
      } finally {
          setCargandoEnvio(false);
      }
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] font-sans italic w-full">
      
      <div className="mb-8 border-b border-slate-100 pb-6 flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                {fase === 1 ? '1. Intenciones de Edición' : '2. Subir Nuevos Archivos'}
            </h2>
            <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">
                {fase === 1 
                    ? 'Selecciona qué deseas eliminar o cambiar.' 
                    : 'Sube las imágenes correspondientes a los espacios que vas a sustituir.'}
            </p>
        </div>
        <div className="flex gap-2">
            <div className={`w-3 h-3 rounded-full transition-all ${fase === 1 ? 'bg-blue-600 animate-pulse scale-110' : 'bg-green-500'}`}></div>
            <div className={`w-3 h-3 rounded-full transition-all ${fase === 2 ? 'bg-blue-600 animate-pulse scale-110' : 'bg-slate-200'}`}></div>
        </div>
      </div>

      {fase === 1 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {imagenesCargadas.map((img) => {
                const estado = intenciones[img.nombreOriginal]; 
                const esVideo = img.url.match(/\.(mp4|mov|avi|wmv|webm)$/i); // 🚀 LA DETECCIÓN DE VIDEO
                
                return (
                    <div key={img.nombreOriginal} className={`relative aspect-video rounded-2xl overflow-hidden border-4 transition-all shadow-sm group
                        ${estado === 'eliminar' ? 'border-red-500 scale-95 opacity-80' : 
                        estado === 'sustituir' ? 'border-blue-500 scale-105 shadow-blue-200' : 'border-slate-50'}`}
                    >
                    
                    {/* 🚀 RENDERIZADO CONDICIONAL DE VIDEO O IMAGEN */}
                    {esVideo ? (
                        <>
                            <video src={`${img.url}#t=0.001`} className="w-full h-full object-cover bg-slate-900" preload="metadata" muted />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                                <div className="bg-white/30 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center text-white pl-1 shadow-lg border border-white/50 text-xl">▶</div>
                            </div>
                        </>
                    ) : (
                        <img src={img.url} alt="Miniatura" className="w-full h-full object-cover bg-slate-100" onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Error'; }}/>
                    )}

                    {estado && (
                        <div className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm transition-all z-10 ${estado === 'eliminar' ? 'bg-red-500/30' : 'bg-blue-600/30'}`}>
                            <span className={`text-4xl drop-shadow-md ${estado === 'eliminar' ? 'text-red-600' : 'text-blue-600'}`}>{estado === 'eliminar' ? '🗑️' : '🔄'}</span>
                            <span className="text-white font-black uppercase tracking-widest text-[10px] mt-2 bg-slate-900/60 px-3 py-1 rounded-full">{estado === 'eliminar' ? 'Se eliminará' : 'Se sustituirá'}</span>
                        </div>
                    )}
                    
                    <div className="absolute top-2 left-2 right-2 flex justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-slate-900/80 p-2 rounded-xl z-20">
                        <button onClick={() => toggleIntencion(img.nombreOriginal, 'eliminar')} className={`flex-1 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${estado === 'eliminar' ? 'bg-red-600 text-white' : 'bg-white text-slate-800 hover:bg-red-100'}`}>{estado === 'eliminar' ? 'Deshacer' : 'Borrar'}</button>
                        <button onClick={() => toggleIntencion(img.nombreOriginal, 'sustituir')} className={`flex-1 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${estado === 'sustituir' ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 hover:bg-blue-100'}`}>{estado === 'sustituir' ? 'Deshacer' : 'Sustituir'}</button>
                    </div>
                    </div>
                );
                })}
            </div>
            <div className="mt-8 flex justify-end">
                <button onClick={enviarPreparacion} disabled={cargandoEnvio || Object.keys(intenciones).length === 0} className="bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3">
                    {cargandoEnvio ? <span className="animate-pulse">Procesando Intenciones...</span> : 'Continuar al Paso 2 ❯'}
                </button>
            </div>
          </>
      )}

      {fase === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-2xl mb-6 flex items-start gap-4">
                  <span className="text-2xl mt-1">🔄</span>
                  <div>
                    <p className="text-blue-800 font-black text-[11px] uppercase tracking-widest italic">El servidor ha autorizado las sustituciones.</p>
                    <p className="text-blue-600/80 font-bold text-[10px] mt-1">Por favor, sube los archivos de reemplazo. Si subes fotos 360°, recuerda marcarlas.</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {listaEsperando.map((nombreEsperado, index) => {
                      const dataArchivo = archivosFisicos[nombreEsperado];
                      const esVideo = dataArchivo ? dataArchivo.file.type.startsWith('video/') : false;

                      return (
                          <div key={nombreEsperado} className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center text-center h-48 overflow-hidden group
                              ${dataArchivo ? 'border-green-500 border-solid bg-slate-900' : 'border-slate-300 border-dashed bg-slate-50 hover:bg-blue-50 hover:border-blue-300'}`}>
                              
                              {dataArchivo ? (
                                  <>
                                      {/* PREVIEW */}
                                      {esVideo ? (
                                          <video src={`${dataArchivo.preview}#t=0.001`} className="absolute inset-0 w-full h-full object-cover opacity-50" muted />
                                      ) : (
                                          <img src={dataArchivo.preview} className={`absolute inset-0 w-full h-full object-cover opacity-50 transition-transform ${dataArchivo.is360 ? 'scale-110 saturate-150' : ''}`} alt="preview" />
                                      )}

                                      {/* BOTÓN ELIMINAR SELECCIÓN */}
                                      <button 
                                        onClick={() => removerArchivo(nombreEsperado)} 
                                        className="absolute top-3 right-3 bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-full font-black text-xs z-30 shadow-lg hover:bg-red-600 transition-all"
                                        title="Quitar este archivo"
                                      >
                                        ✕
                                      </button>

                                      {/* BOTÓN MARCAR 360 (SOLO IMÁGENES) */}
                                      {!esVideo && (
                                          <button 
                                            onClick={() => toggle360(nombreEsperado)} 
                                            className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg transition-all border-2 z-30 
                                                ${dataArchivo.is360 ? 'bg-blue-600 text-white border-blue-400' : 'bg-white/90 backdrop-blur-sm text-slate-600 border-white hover:bg-white'}
                                            `}
                                          >
                                              {dataArchivo.is360 ? '✓ ES 360°' : 'MARCAR 360°'}
                                          </button>
                                      )}

                                      {/* ETIQUETA INFORMATIVA */}
                                      <div className="relative z-10 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg pointer-events-none">
                                          <p className="text-green-700 font-black text-[10px] uppercase tracking-widest">Archivo Listo</p>
                                          <p className="text-slate-600 font-bold text-[8px] mt-1 max-w-[150px] truncate">{dataArchivo.file.name}</p>
                                      </div>
                                  </>
                              ) : (
                                  <>
                                      <input 
                                          type="file" 
                                          accept="image/*,video/mp4" 
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                          onChange={(e) => handleArchivoSeleccionado(nombreEsperado, e)}
                                          title="Haz clic para subir un archivo de sustitución"
                                      />
                                      <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📤</span>
                                      <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest">Sustituto para hueco {index + 1}</p>
                                      <p className="text-blue-600 font-black text-[9px] mt-4 uppercase tracking-widest underline">Clic aquí para subir</p>
                                  </>
                              )}
                          </div>
                      );
                  })}
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                    onClick={enviarAplicacionFinal} 
                    disabled={cargandoEnvio}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-3"
                >
                    {cargandoEnvio ? <span className="animate-pulse">Subiendo archivos...</span> : '✔️ Aplicar Nuevas Fotos'}
                </button>
            </div>
          </div>
      )}

    </div>
  );
}