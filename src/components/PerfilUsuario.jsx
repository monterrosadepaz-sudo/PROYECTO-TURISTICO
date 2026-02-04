import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PerfilUsuario({ foto }) { 
  const navigate = useNavigate();
  
  // 1. LEER DATOS ACTUALES
  const [sesionActiva, setSesionActiva] = useState(
    JSON.parse(localStorage.getItem('usuarioLogueado')) || {}
  );
  
  const FOTO_DEFECTO = "http://100.123.6.123:8000/storage/usuarios/perfil.png";
  
  const [fotoPreview, setFotoPreview] = useState(null);
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Sincronizar el estado local si el storage cambia (por si actualizas desde otro lado)
  useEffect(() => {
    const datos = JSON.parse(localStorage.getItem('usuarioLogueado')) || {};
    setSesionActiva(datos);
  }, [foto]);

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoFoto(file);
      setFotoPreview(URL.createObjectURL(file)); 
    }
  };

  const guardarCambios = async () => {
    if (!archivoFoto) return alert("Por favor, selecciona una foto primero.");
    
    setCargando(true);
    const data = new FormData();
    
    data.append('_method', 'PUT'); 
    data.append('foto_perfil', archivoFoto);
    data.append('idusuario', sesionActiva.idusuario);

    try {
      const respuesta = await fetch(`http://100.123.6.123:8000/api/usuarios/foto`, {
        method: 'POST', 
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        alert("¡Foto de perfil actualizada con éxito!");
        
        // Extraemos la URL completa confirmada en Thunder Client
        const nuevaFotoUrl = resultado.usuario?.foto_perfil_url || 
                             resultado.foto_perfil_url || 
                             resultado.foto_url;

        // ACTUALIZACIÓN COMPLETA DEL STORAGE
        const sesionActualizada = { 
          ...sesionActiva, 
          foto: nuevaFotoUrl,
          foto_perfil_url: nuevaFotoUrl 
        };
        localStorage.setItem('usuarioLogueado', JSON.stringify(sesionActualizada));
        
        // Recarga para limpiar cualquier rastro de caché del navegador
        window.location.reload();
      } else {
        alert("Error del servidor al procesar la imagen.");
      }
    } catch (error) {
      alert("Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  // LÓGICA DE RENDERIZADO "ELIMINA-DEFAULT"
  const obtenerImagenAMostrar = () => {
    // 1. Si el usuario está previsualizando un cambio ahora mismo
    if (fotoPreview) return fotoPreview; 
    
    // 2. Si viene la prop 'foto' desde App.jsx (esta es la que ya tiene la lógica de prioridad)
    if (foto && foto !== FOTO_DEFECTO) return foto;

    // 3. Si en el storage tenemos la URL completa confirmada
    if (sesionActiva.foto_perfil_url) return sesionActiva.foto_perfil_url;
    
    // 4. Si tenemos la propiedad 'foto' en el storage (ya sea URL o nombre)
    if (sesionActiva.foto) {
      if (sesionActiva.foto.startsWith('http')) return sesionActiva.foto;
      return `http://100.123.6.123:8000/storage/usuarios/${sesionActiva.foto}`;
    }
    
    // 5. Solo si todo lo demás es nulo, mostramos la default
    return FOTO_DEFECTO; 
  };

  return (
    <div className="min-h-screen py-20 bg-slate-100/50 flex justify-center items-start italic">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-300">
        
        <div className="bg-blue-800 p-12 text-center text-white relative">
          <button onClick={() => navigate(-1)} className="absolute top-6 left-6 text-[10px] font-black uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity">← Volver</button>
          <h3 className="text-2xl font-black uppercase tracking-tighter italic">Mi Perfil</h3>
        </div>

        <div className="p-10 -mt-12">
          <div className="flex flex-col items-center space-y-8">
            
            <div className="relative group">
              <div className="w-44 h-44 rounded-full border-[10px] border-white shadow-2xl overflow-hidden bg-slate-100 transform transition-transform group-hover:scale-105">
                <img 
                  src={obtenerImagenAMostrar()} 
                  className="w-full h-full object-cover" 
                  alt="Perfil" 
                  onError={(e) => {
                    // Si la imagen bautizada falla (404), solo entonces ponemos la de perfil.png
                    if (e.target.src !== FOTO_DEFECTO) {
                        e.target.src = FOTO_DEFECTO;
                    }
                  }} 
                />
              </div>
              <label className="absolute bottom-2 right-2 bg-blue-600 p-4 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-all border-4 border-white transform hover:rotate-12 active:scale-90">
                <span className="text-white text-sm font-black">+</span>
                <input type="file" className="hidden" accept="image/*" onChange={manejarArchivo} />
              </label>
            </div>

            <div className="w-full space-y-4 text-center">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre del Colaborador</p>
                <h4 className="text-2xl font-black text-slate-800 uppercase italic leading-none">{sesionActiva.nombre}</h4>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Correo de contacto</p>
                <p className="text-blue-600 font-bold text-sm underline decoration-2 underline-offset-4 tracking-tighter">
                  {sesionActiva.correo || sesionActiva.email}
                </p>
              </div>
              <div className="inline-block bg-blue-50 px-6 py-2 rounded-full border border-blue-100">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{sesionActiva.rol || 'Colaborador'}</span>
              </div>
            </div>

            <button 
              onClick={guardarCambios}
              disabled={cargando || !archivoFoto}
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-blue-200 transition-all transform active:scale-95 text-[11px] uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? 'PROCESANDO CAMBIO...' : 'ACTUALIZAR FOTO DE PERFIL'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}