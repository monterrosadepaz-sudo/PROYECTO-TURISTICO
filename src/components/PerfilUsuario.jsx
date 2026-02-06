import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PerfilUsuario({ foto }) { 
  const navigate = useNavigate();
  
  const [sesionActiva, setSesionActiva] = useState(
    JSON.parse(localStorage.getItem('usuarioLogueado')) || {}
  );
  
  const [fotoPreview, setFotoPreview] = useState(null);
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const datosActualizados = JSON.parse(localStorage.getItem('usuarioLogueado')) || {};
    setSesionActiva(datosActualizados);
    setFotoPreview(null);
  }, [foto]);

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoFoto(file);
      setFotoPreview(URL.createObjectURL(file)); 
    }
  };

  const generarArchivoMiguelito = (archivo) => {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    const fechaCodificada = `${dia}${mes}${anio}`; 
    const extension = archivo.name.split('.').pop();
    const nuevoNombre = `0000${fechaCodificada}perfilusuarios.${extension}`;
    return new File([archivo], nuevoNombre, { type: archivo.type });
  };

  const guardarCambios = async () => {
    if (!archivoFoto) return alert("Por favor, selecciona una foto primero.");
    
    setCargando(true);
    const data = new FormData();
    
    // 1. Generamos el archivo con la fórmula y guardamos el nombre en una variable
    const archivoParaSubir = generarArchivoMiguelito(archivoFoto);
    const nombreDeLaFoto = archivoParaSubir.name; 

    data.append('foto_perfil', archivoParaSubir);
    data.append('_method', 'PUT'); 
    data.append('nombre', sesionActiva.nombre); 

    try {
      const respuesta = await fetch(`http://100.123.6.123:8000/api/usuarios/${sesionActiva.idusuario}`, {
        method: 'POST', 
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        // 2. SOLUCIÓN AL UNDEFINED: Usamos 'nombreDeLaFoto' que ya tenemos seguro
        const urlCompleta = `http://100.123.6.123:8000/storage/usuarios/${nombreDeLaFoto}`;

        const sesionActualizada = { 
          ...sesionActiva, 
          foto_perfil: nombreDeLaFoto,
          foto_perfil_url: urlCompleta, 
          foto: urlCompleta 
        };

        // 3. Guardamos en el storage y refrescamos
        localStorage.setItem('usuarioLogueado', JSON.stringify(sesionActualizada));
        
        alert("¡Perfil actualizado con éxito!");
        window.location.reload();
      } else {
        alert(resultado.error || "Error al actualizar.");
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const obtenerImagenAMostrar = () => {
    if (fotoPreview) return fotoPreview; 
    if (foto) return foto;
    if (sesionActiva.foto_perfil) {
        return `http://100.123.6.123:8000/storage/usuarios/${sesionActiva.foto_perfil}`;
    }
    return "http://100.123.6.123:8000/storage/usuarios/perfil.png";
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
            
            <div className="relative group z-10">
              <div className="w-44 h-44 rounded-full border-[10px] border-white shadow-2xl overflow-hidden bg-white transform transition-transform group-hover:scale-105 relative">
                <img 
                  src={obtenerImagenAMostrar()} 
                  className="w-full h-full object-cover relative z-20" 
                  alt="Perfil" 
                />
                <div className="absolute inset-0 bg-slate-100 z-10"></div>
              </div>

              <label className="absolute bottom-2 right-2 bg-blue-600 p-4 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-all border-4 border-white transform hover:rotate-12 active:scale-90 z-30">
                <span className="text-white text-sm font-black">+</span>
                <input type="file" className="hidden" accept="image/*" onChange={manejarArchivo} />
              </label>
            </div>

            <div className="w-full space-y-4 text-center">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre del Colaborador</p>
                <h4 className="text-2xl font-black text-slate-800 uppercase italic leading-none">
                  {sesionActiva.nombre || "Usuario"}
                </h4>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Correo de contacto</p>
                <p className="text-blue-600 font-bold text-sm underline decoration-2 underline-offset-4 tracking-tighter">
                  {sesionActiva.email || sesionActiva.correo || "Sin correo"}
                </p>
              </div>
              <div className="inline-block bg-blue-50 px-6 py-2 rounded-full border border-blue-100">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  {sesionActiva.rol || 'Colaborador'}
                </span>
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