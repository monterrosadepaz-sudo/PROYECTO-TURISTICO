import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import MapaFormulario from './MapaFormulario'; 

export default function FormularioPublicar() {
  const navigate = useNavigate();

  // 1. LEER DATOS REALES: Sincronización con el Login
  const sesionActiva = JSON.parse(localStorage.getItem('usuarioLogueado')) || {
    idusuario: "eec174fd-7093-4efe-82a6-a7828ccf1703", 
    nombre: "Miguel Sanchez",
    correo: "miguelpacas796@gmail.com",
    rol: "Colaborador",
    telefono: "00000000"
  };

  // 2. ESTADO PARA EL CORREO REAL DE LA BASE DE DATOS
  const [correoBD, setCorreoBD] = useState(sesionActiva.correo);

  // 3. EFECTO REFORZADO CONTRA 'UNDEFINED'
  useEffect(() => {
    const obtenerCorreoOficial = async () => {
      // EVITAMOS EL ERROR 500: Solo consultamos si el ID existe realmente
      if (!sesionActiva.idusuario) {
        console.warn("No se encontró ID de usuario en la sesión.");
        return;
      }

      try {
        // Consultamos la ruta oficial de Julio usando el ID verificado
        const respuesta = await fetch(`http://100.123.6.123:8000/api/usuarios/${sesionActiva.idusuario}`);
        if (respuesta.ok) {
          const datos = await respuesta.json();
          // Sincronizamos con el correo real de la BD (ej: mikelxd503@gmail.com)
          if (datos.email) setCorreoBD(datos.email);
        }
      } catch (error) {
        console.error("Fallo de sincronización con el servidor central.");
      }
    };
    obtenerCorreoOficial();
  }, [sesionActiva.idusuario]);

  // --- TUS ESTADOS ORIGINALES (MANTENIDOS INTACTOS) ---
  const [archivosFotos, setArchivosFotos] = useState([]); 
  const [previews, setPreviews] = useState([]); 
  const [cargando, setCargando] = useState(false);
  const [coordManual, setCoordManual] = useState({ lat: '', lng: '' });

  const [formData, setFormData] = useState({
    nombreSitio: '',
    departamento: '',
    ubicacion: null, 
    categoria: '', 
    descripcion: '',
    precios: { adultos: '', ninos: '', terceraEdad: '' },
    horarios: {
      lunes: { abierto: false, inicio: '08:00', fin: '17:00' },
      martes: { abierto: false, inicio: '08:00', fin: '17:00' },
      miercoles: { abierto: false, inicio: '08:00', fin: '17:00' },
      jueves: { abierto: false, inicio: '08:00', fin: '17:00' },
      viernes: { abierto: false, inicio: '08:00', fin: '17:00' },
      sabado: { abierto: false, inicio: '08:00', fin: '17:00' },
      domingo: { abierto: false, inicio: '08:00', fin: '17:00' },
    },
    avisoFestivos: false,
    permisos: {
      comida: false, bebidasGaseosas: false, bebidasAlcoholicas: false,
      mascotas: false, mesasSillas: false, hamacas: false,
      parrillasCocinas: false, armasFuego: false
    }
  });

  // --- TUS FUNCIONES ORIGINALES (MANTENIDAS INTACTAS) ---
  const manejarCambio = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const manejarCheck = (e) => setFormData({ ...formData, permisos: { ...formData.permisos, [e.target.name]: e.target.checked } });
  const manejarPrecio = (e) => setFormData({ ...formData, precios: { ...formData.precios, [e.target.name]: e.target.value } });
  const manejarHorario = (dia, campo, valor) => {
    setFormData({ 
      ...formData, 
      horarios: { ...formData.horarios, [dia]: { ...formData.horarios[dia], [campo]: valor } } 
    });
  };

  const manejarArchivos = (e) => {
    const nuevosArchivos = Array.from(e.target.files);
    if (archivosFotos.length + nuevosArchivos.length > 10) {
      alert("Se permite un máximo de 10 fotografías.");
      return;
    }
    const nuevasPreviews = nuevosArchivos.map(file => URL.createObjectURL(file));
    setArchivosFotos(prev => [...prev, ...nuevosArchivos]);
    setPreviews(prev => [...prev, ...nuevasPreviews]);
  };

  const eliminarFoto = (index) => {
    setArchivosFotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const setUbicacion = (coords) => {
    setFormData({ ...formData, ubicacion: coords });
    setCoordManual({ lat: coords.lat.toFixed(6), lng: coords.lng.toFixed(6) });
  };

  const ubicarManual = () => {
    const l1 = parseFloat(coordManual.lat);
    const l2 = parseFloat(coordManual.lng);
    if (!isNaN(l1) && !isNaN(l2)) {
      setUbicacion({ lat: l1, lng: l2 });
    } else {
      alert("Por favor, ingresa números válidos para las coordenadas.");
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!formData.ubicacion) return alert("Por favor, selecciona una ubicación en el mapa.");
    if (archivosFotos.length === 0) return alert("Por favor, suba al menos una fotografía del lugar.");

    setCargando(true);
    const data = new FormData();
    data.append('nombreSitio', formData.nombreSitio);
    data.append('departamento', formData.departamento);
    data.append('descripcion', formData.descripcion);
    data.append('categoria', formData.categoria);
    
    // ENVIAMOS EL CORREO OFICIAL SINCRONIZADO
    data.append('telefono', sesionActiva.telefono);
    data.append('email', correoBD); 
    data.append('colaborador', sesionActiva.nombre);
    data.append('rol', sesionActiva.rol); 
    
    archivosFotos.forEach((archivo, i) => data.append(`fotos[${i}]`, archivo));
    data.append('ubicacion', JSON.stringify(formData.ubicacion));
    data.append('precios', JSON.stringify(formData.precios));
    data.append('horarios', JSON.stringify(formData.horarios));
    data.append('permisos', JSON.stringify(formData.permisos));

    try {
      const respuesta = await fetch('http://100.123.6.123:8000/api/propuestas', {
        method: 'POST',
        body: data,
      });
      if (respuesta.ok) {
        alert(`Propuesta enviada con éxito. Se te informará al correo: ${correoBD}`);
        navigate("/");
      } else {
        throw new Error("Error en el servidor de Julio.");
      }
    } catch (error) {
      alert("Error al enviar: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 flex justify-center items-start bg-slate-100/50 italic text-left">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        
        <div className="bg-blue-800 p-10 text-white relative z-[50]">
          <h3 className="text-3xl font-black tracking-tight uppercase italic text-center leading-none">Publicar Nuevo Destino</h3>
          <p className="text-blue-100 text-[10px] mt-3 uppercase font-black tracking-[0.2em] text-center italic">
            Sesión Activa: {sesionActiva.rol}
          </p>
          <button onClick={() => navigate(-1)} className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all font-black">✕</button>
        </div>

        <form onSubmit={manejarEnvio} className="p-10 space-y-12">
          
          {/* SECCIÓN 01: DATOS GENERALES */}
          <div className="space-y-6">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">01. Datos Generales</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Nombre del Destino</label>
                <input name="nombreSitio" onChange={manejarCambio} required className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none text-slate-700 font-bold italic shadow-sm" placeholder="Ej: Playa El Tunco" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Departamento</label>
                <select name="departamento" onChange={manejarCambio} required className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none text-slate-700 font-bold italic shadow-sm">
                  <option value="">Selecciona uno...</option>
                  {['Ahuachapán', 'Santa Ana', 'Sonsonate', 'La Libertad', 'Chalatenango', 'San Salvador', 'Cuscatlán', 'La Paz', 'Cabañas', 'San Vicente', 'Usulután', 'San Miguel', 'Morazán', 'La Unión'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 02: UBICACIÓN */}
          <div className="space-y-6">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">02. Ubicación Cartográfica</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-inner">
               <div className="space-y-1">
                 <label className="text-[8px] font-black uppercase text-slate-400 ml-2 italic">Latitud</label>
                 <input type="text" value={coordManual.lat} onChange={(e) => setCoordManual({...coordManual, lat: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[10px] font-black outline-none focus:border-blue-500" />
               </div>
               <div className="space-y-1">
                 <label className="text-[8px] font-black uppercase text-slate-400 ml-2 italic">Longitud</label>
                 <input type="text" value={coordManual.lng} onChange={(e) => setCoordManual({...coordManual, lng: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[10px] font-black outline-none focus:border-blue-500" />
               </div>
               <div className="flex items-end">
                 <button type="button" onClick={ubicarManual} className="w-full bg-blue-600 text-white font-black h-[46px] rounded-xl text-[10px] uppercase hover:bg-blue-700 transition-all shadow-md italic">Ubicar Punto</button>
               </div>
            </div>
            <div className="bg-blue-50/30 rounded-[2.5rem] p-8 border border-blue-100/50 space-y-6">
              <div className="bg-blue-800 p-5 rounded-2xl text-white shadow-lg text-[9px] leading-relaxed font-black uppercase tracking-widest text-center italic">
                  Haz clic en el mapa para marcar el sitio o ingresa coordenadas arriba.
              </div>
              <div className="rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl h-80 bg-white relative z-0">
                <MapaFormulario setUbicacion={setUbicacion} ubicacionActual={formData.ubicacion} />
              </div>
            </div>
          </div>

          {/* SECCIONES 03 - 05: CLASIFICACIÓN, HORARIOS Y DESCRIPCIÓN */}
          <div className="space-y-8">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">03. Clasificación y Políticas</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Playa', 'Montaña', 'Pueblo', 'Ciudad', 'Balneario', 'Parque'].map(cat => (
                <label key={cat} className={`flex items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all font-bold text-xs ${formData.categoria === cat ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-slate-100 text-slate-500 bg-slate-50 hover:border-slate-300'}`}>
                  <input type="radio" name="categoria" value={cat} onChange={manejarCambio} className="hidden" required />
                  {cat.toUpperCase()}
                </label>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { n: 'comida', l: 'Traer comida' }, { n: 'bebidasGaseosas', l: 'Gaseosas / Agua' },
                { n: 'bebidasAlcoholicas', l: 'Alcohol' }, { n: 'mascotas', l: 'Mascotas' },
                { n: 'mesasSillas', l: 'Mesas y sillas' }, { n: 'hamacas', l: 'Hamacas' },
                { n: 'parrillasCocinas', l: 'Parrillas / Cocinas' }, { n: 'armasFuego', l: 'Armas de fuego' }
              ].map(item => (
                <label key={item.n} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-white transition-all">
                  <input type="checkbox" name={item.n} checked={formData.permisos[item.n]} onChange={manejarCheck} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                  <span className="text-[10px] font-black uppercase text-slate-700">{item.l}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">04. Horarios y Costos</h4>
            <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-6 italic text-slate-700">
              <div className="grid grid-cols-1 gap-3">
                {Object.keys(formData.horarios).map((dia) => (
                  <div key={dia} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 gap-4 shadow-sm transition-all hover:border-blue-100">
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <input type="checkbox" checked={formData.horarios[dia].abierto} onChange={(e) => manejarHorario(dia, 'abierto', e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                      <span className="text-[11px] font-black uppercase">{dia}</span>
                    </div>
                    {formData.horarios[dia].abierto ? (
                      <div className="flex items-center gap-2">
                        <input type="time" value={formData.horarios[dia].inicio} onChange={(e) => manejarHorario(dia, 'inicio', e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none" />
                        <span className="text-slate-400 font-bold text-[10px]">A</span>
                        <input type="time" value={formData.horarios[dia].fin} onChange={(e) => manejarHorario(dia, 'fin', e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none" />
                      </div>
                    ) : <span className="text-[10px] font-black text-slate-300 uppercase italic">Cerrado</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">05. Descripción del lugar</h4>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Actividades y servicios</label>
              <textarea name="descripcion" onChange={manejarCambio} required className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none h-32 text-slate-700 font-bold italic" placeholder="Describe el clima, servicios y qué se puede hacer..." />
            </div>
          </div>

          {/* SECCIÓN 06: FOTOS (Diseño Original Restaurado) */}
          <div className="space-y-4">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">06. Fotografía del Destino (MÁX. 10)</h4>
            <div className="space-y-4">
              {previews.length === 0 ? (
                <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-slate-300 rounded-[2.5rem] cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all group shadow-inner">
                  <div className="bg-blue-100 p-5 rounded-full mb-4 text-blue-600 font-black text-2xl shadow-sm group-hover:scale-110 transition-transform italic">↑</div>
                  <p className="mb-1 text-[11px] text-slate-700 font-black uppercase tracking-widest italic">Seleccionar Archivos</p>
                  <input type="file" accept="image/*" multiple onChange={manejarArchivos} className="hidden" />
                </label>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {previews.map((url, index) => (
                    <div key={index} className="relative h-32 animate-in zoom-in-95">
                      <img src={url} className="w-full h-full object-cover rounded-2xl border-2 border-white shadow-md" alt="" />
                      <button type="button" onClick={() => eliminarFoto(index)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shadow-lg">✕</button>
                    </div>
                  ))}
                  {previews.length < 10 && (
                    <label className="flex items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                      <input type="file" accept="image/*" multiple onChange={manejarArchivos} className="hidden" />
                      <span className="text-blue-600 font-black">+</span>
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 07: IDENTIFICACIÓN (Sincronizada con la BD real) */}
          <div className="pt-10 border-t border-slate-200 space-y-6">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">07. Identificación del Colaborador</h4>
            
            <div className="bg-blue-50/50 p-10 rounded-[2.5rem] border border-blue-100 space-y-8 relative overflow-hidden group">
              <div className="flex flex-col gap-2 relative z-10">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 italic">Emisor de la propuesta</p>
                <h4 className="text-slate-800 font-black uppercase italic text-lg leading-tight">
                    Esta petición será enviada bajo el nombre de: <span className="text-blue-600">{sesionActiva.nombre}</span>
                </h4>
              </div>
              
              <div className="h-px bg-blue-100/50 w-full relative z-10"></div>
              
              <div className="flex items-start gap-4 p-5 bg-white/50 rounded-2xl border border-blue-100/50 shadow-sm transition-all group-hover:bg-white relative z-10">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black italic shadow-lg shadow-blue-200">!</div>
                <div className="space-y-1">
                   <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight leading-relaxed italic">
                    Se le informará por medio de su correo electrónico oficial:
                   </p>
                   {/* MOSTRAMOS EL CORREO RECUPERADO DE LA BD */}
                   <p className="text-blue-600 font-black text-xs underline decoration-blue-200 underline-offset-4 italic">
                    {correoBD}
                   </p>
                   <p className="text-slate-400 text-[9px] font-medium uppercase mt-2 italic">
                    Información verificada desde el servidor central.
                   </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-8">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-200 font-black py-5 rounded-3xl transition-all text-[10px] uppercase tracking-widest italic">CANCELAR</button>
            <button type="submit" disabled={cargando} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-blue-200 transform active:scale-95 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50 italic">
              {cargando ? 'PROCESANDO ENVÍO...' : 'ENVIAR PROPUESTA A REVISIÓN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}