import React, { useState, useEffect } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import MapaFormulario from './MapaFormulario'; 
import ModalProgreso from './ModalProgreso'; 
import ModalExito from './ModalExito'; 
import ModalConfirmacion from './ModalConfirmacion';
import { divisionTerritorial } from '../data/DatosElSalvador'; 
import { categoriasDestino, reglasPermisos, serviciosAmenidades, actividadesDestacadas } from '../data/OpcionesDestino';
import { API_URL } from "../config";
export default function FormularioPublicar() {
  const navigate = useNavigate();
  const { id } = useParams();

  const sesionActiva = JSON.parse(localStorage.getItem('usuarioLogueado')) || {
    idusuario: "eec174fd-7093-4efe-82a6-a7828ccf1703", 
    nombre: "Miguel Sanchez", correo: "miguelpacas796@gmail.com", rol: "Colaborador", telefono: "00000000"
  };

  const [correoBD, setCorreoBD] = useState(sesionActiva.correo);
  const [mostrarExito, setMostrarExito] = useState(false); 
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false); 
  
  const [isSubiendo, setIsSubiendo] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState(0);
  
  const [fotosVista, setFotosVista] = useState([]); 
  const [cargando, setCargando] = useState(false);
  const [coordManual, setCoordManual] = useState({ lat: '', lng: '' });

  // Inicializamos todas las opciones en false dinámicamente
  const estadoInicialPermisos = {};
  [...reglasPermisos, ...serviciosAmenidades, ...actividadesDestacadas].forEach(item => {
      estadoInicialPermisos[item.id] = false;
  });

  const [formData, setFormData] = useState({
    nombreSitio: '', departamento: '', municipio: '', distrito: '',   
    ubicacion: null, categoria: '', descripcion: '',
    precios: { adultos: '', ninos: '', terceraEdad: '' },
    horarios: {
      lunes: { abierto: false, inicio: '08:00', fin: '17:00' }, martes: { abierto: false, inicio: '08:00', fin: '17:00' },
      miercoles: { abierto: false, inicio: '08:00', fin: '17:00' }, jueves: { abierto: false, inicio: '08:00', fin: '17:00' },
      viernes: { abierto: false, inicio: '08:00', fin: '17:00' }, sabado: { abierto: false, inicio: '08:00', fin: '17:00' },
      domingo: { abierto: false, inicio: '08:00', fin: '17:00' },
    },
    permisos: estadoInicialPermisos
  });

  const pesoTotalMB = (fotosVista.reduce((acc, foto) => acc + (foto.file ? foto.file.size : 0), 0) / (1024 * 1024)).toFixed(2);
  const esUnVideo = (foto) => foto.file ? foto.file.type.startsWith('video/') : foto.url.match(/\.(mp4|mov|avi|wmv|webm)$/i);

  useEffect(() => {
    const cargarDatosEdicion = async () => {
        if (!id) return; 
        try {
            setCargando(true);
            const res = await fetch(`${API_URL}/api/preformularios/detalles/${id}`);
            if (res.ok) {
                const data = await res.json();
                
                // Mapeamos lo que traiga Julio y si falta algo lo ponemos en false
                const permisosCargados = { ...estadoInicialPermisos, ...data.politicas_obj };

                setFormData({
                    nombreSitio: data.nombre,
                    departamento: data.departamento,
                    municipio: data.municipio,
                    distrito: data.distrito,
                    ubicacion: { lat: parseFloat(data.latitud), lng: parseFloat(data.longitud) },
                    categoria: JSON.parse(data.clasificacion)[0].charAt(0).toUpperCase() + JSON.parse(data.clasificacion)[0].slice(1).toLowerCase(),
                    descripcion: data.descripcion,
                    precios: JSON.parse(data.detalles).tarifas_desglosadas,
                    horarios: procesarHorariosDesdeAPI(JSON.parse(data.horarios)),
                    permisos: permisosCargados // Magia pura
                });
                setCoordManual({ lat: data.latitud, lng: data.longitud });
                
                if (data.imagenes) {
                    const fotosPrevias = data.imagenes.map(img => ({
                        url: `${API_URL}/storage/preformularios/${img.url_imagen}`,
                        is360: img.url_imagen.includes('-360'), 
                        isNew: false, file: null
                    }));
                    setFotosVista(fotosPrevias);
                }
            }
        } catch (error) { console.error("Error al cargar datos:", error); } finally { setCargando(false); }
    };
    cargarDatosEdicion();
  }, [id]);

  const procesarHorariosDesdeAPI = (horariosAPI) => {
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const nuevoHorario = {};
    dias.forEach(dia => {
        if (horariosAPI[dia]) {
            const [inicio, fin] = horariosAPI[dia].split('-');
            nuevoHorario[dia] = { abierto: true, inicio, fin };
        } else { nuevoHorario[dia] = { abierto: false, inicio: '08:00', fin: '17:00' }; }
    });
    return nuevoHorario;
  };

  useEffect(() => {
    const obtenerCorreoOficial = async () => {
      if (!sesionActiva.idusuario) return;
      try {
        const respuesta = await fetch(`${API_URL}/api/usuarios/${sesionActiva.idusuario}`);
        if (respuesta.ok) {
          const datos = await respuesta.json();
          if (datos.email) setCorreoBD(datos.email);
        }
      } catch (error) {}
    };
    obtenerCorreoOficial();
  }, [sesionActiva.idusuario]);

  const manejarCambioUbicacion = (e) => {
    const { name, value } = e.target;
    if (name === 'departamento') setFormData({ ...formData, departamento: value, municipio: '', distrito: '' });
    else if (name === 'municipio') setFormData({ ...formData, municipio: value, distrito: '' });
    else setFormData({ ...formData, [name]: value });
  };

  const generarIDLote = () => {
      const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let resultado = '';
      for (let i = 0; i < 10; i++) resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      return resultado;
  };

  const generarNombreImagen = (archivo, loteID, indice) => {
    const hoy = new Date();
    const fechaCodificada = `${String(hoy.getDate()).padStart(2, '0')}${String(hoy.getMonth() + 1).padStart(2, '0')}${hoy.getFullYear()}`;
    const extension = archivo.name.split('.').pop().toLowerCase(); 
    return `0000${fechaCodificada}preformulario-${loteID}-${indice}.${extension}`;
  };

  const manejarCambio = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const manejarCheck = (e) => setFormData({ ...formData, permisos: { ...formData.permisos, [e.target.name]: e.target.checked } });
  const manejarPrecio = (e) => setFormData({ ...formData, precios: { ...formData.precios, [e.target.name]: e.target.value } });
  
  const manejarHorario = (dia, campo, valor) => {
    setFormData({ ...formData, horarios: { ...formData.horarios, [dia]: { ...formData.horarios[dia], [campo]: valor } } });
  };

  const manejarArchivos = (e) => {
    const nuevosArchivos = Array.from(e.target.files);
    if (fotosVista.length + nuevosArchivos.length > 20) return alert("Máximo 20 archivos permitidos.");
    
    const nuevasFotosConfig = nuevosArchivos.map(file => ({
        url: URL.createObjectURL(file), is360: false, isNew: true, file: file
    }));
    setFotosVista(prev => [...prev, ...nuevasFotosConfig]);
  };

  const eliminarFoto = (index) => setFotosVista(prev => prev.filter((_, i) => i !== index));
  const toggle360 = (index) => setFotosVista(prev => prev.map((foto, i) => i === index ? { ...foto, is360: !foto.is360 } : foto));

  const setUbicacion = (coords) => {
    setFormData({ ...formData, ubicacion: coords });
    setCoordManual({ lat: coords.lat.toFixed(6), lng: coords.lng.toFixed(6) });
  };

  const ubicarManual = () => {
    const l1 = parseFloat(coordManual.lat), l2 = parseFloat(coordManual.lng);
    if (!isNaN(l1) && !isNaN(l2)) setUbicacion({ lat: l1, lng: l2 });
    else alert("Ingresa coordenadas válidas.");
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!formData.ubicacion) return alert("Selecciona ubicación en el mapa.");
    if (fotosVista.length === 0) return alert("Sube al menos un archivo.");
    setMostrarConfirmacion(true);
  };

  const procesarEnvioConfirmado = async () => {
    setMostrarConfirmacion(false); 
    setIsSubiendo(true); 
    setProgresoSubida(0); 

    const data = new FormData();
    if (id) data.append('_method', 'PUT');

    data.append('nombre', formData.nombreSitio); 
    data.append('departamento', formData.departamento);
    data.append('municipio', formData.municipio);
    data.append('distrito', formData.distrito);
    data.append('descripcion', formData.descripcion);
    data.append('latitud', formData.ubicacion.lat);
    data.append('longitud', formData.ubicacion.lng);
    data.append('clasificacion', JSON.stringify([formData.categoria.toUpperCase(), "TURISMO"]));
    data.append('costo_entrada', parseFloat(formData.precios.adultos) || 0);
    data.append('fecha', new Date().toISOString().split('T')[0]); 
    data.append('personas', 1); 

    // Enviamos el objeto de permisos completo, Julio lo guardará tal cual en su JSON
    data.append('politicas', JSON.stringify(formData.permisos));

    const horariosJulio = {};
    Object.keys(formData.horarios).forEach(dia => {
      if(formData.horarios[dia].abierto) {
        horariosJulio[dia] = `${formData.horarios[dia].inicio}-${formData.horarios[dia].fin}`;
      }
    });
    data.append('horarios', JSON.stringify(horariosJulio));
    data.append('detalles', JSON.stringify({ tarifas_desglosadas: formData.precios }));
    data.append('usuario', sesionActiva.idusuario);

    const loteID = generarIDLote(); 
    let indiceArchivosNuevos = 0; 

    fotosVista.forEach((foto) => {
        if (foto.isNew && foto.file) {
            const archivo = foto.file;
            let nombreCodificado = generarNombreImagen(archivo, loteID, indiceArchivosNuevos + 1);
            if (foto.is360) {
                const partes = nombreCodificado.split('.');
                const extension = partes.pop();
                nombreCodificado = `${partes.join('.')}-360.${extension}`;
            }
            data.append(`imagenes[${indiceArchivosNuevos}]`, new File([archivo], nombreCodificado, { type: archivo.type }));
            indiceArchivosNuevos++;
        }
    });

    try {
      const urlBase = `${API_URL}/api/preformularios`;
      const urlFinal = id ? `${urlBase}/actualizar/${id}` : `${urlBase}/crear`;
      
      const respuesta = await axios.post(urlFinal, data, {
        headers: { 'Accept': 'application/json' },
        onUploadProgress: (progressEvent) => {
            const porcentaje = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgresoSubida(porcentaje);
        }
      });

      if (respuesta.status === 200 || respuesta.status === 201) {
          setTimeout(() => {
              setIsSubiendo(false);
              setMostrarExito(true);
          }, 500); 
      }
    } catch (error) {
      setIsSubiendo(false);
      alert("Error al subir: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 flex justify-center items-start bg-slate-100/50 italic text-left">
      <ModalExito visible={mostrarExito} alCerrar={() => navigate(id ? "/mis-propuestas" : "/")} correo={correoBD} esEdicion={!!id} />
      <ModalConfirmacion visible={mostrarConfirmacion} alCerrar={() => setMostrarConfirmacion(false)} alConfirmar={procesarEnvioConfirmado} cantidadFotos={fotosVista.filter(f => f.isNew).length} pesoTotal={pesoTotalMB} />
      <ModalProgreso visible={isSubiendo} porcentaje={progresoSubida} mensaje="Subiendo archivos al servidor..." />
      
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        <div className="bg-blue-800 p-10 text-white relative z-[50]">
          <h3 className="text-3xl font-black tracking-tight uppercase italic text-center leading-none">
            {id ? 'Editar Destino' : 'Publicar Nuevo Destino'}
          </h3>
          <p className="text-blue-100 text-[10px] mt-3 uppercase font-black tracking-[0.2em] text-center italic">Sesión Activa: {sesionActiva.rol}</p>
          <button type="button" onClick={() => navigate(-1)} className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all font-black">✕</button>
        </div>

        <form onSubmit={manejarEnvio} className="p-10 space-y-12">
          
          <div className="space-y-6">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">01. Datos Generales</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1 md:col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Nombre del Destino</label>
                <input name="nombreSitio" value={formData.nombreSitio} onChange={manejarCambio} required className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none text-slate-700 font-bold italic shadow-sm" placeholder="Ej: Playa El Tunco" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Departamento</label>
                <select name="departamento" value={formData.departamento} onChange={manejarCambioUbicacion} required className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none text-slate-700 font-bold italic shadow-sm">
                  <option value="">Selecciona uno...</option>
                  {Object.keys(divisionTerritorial).map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Municipio</label>
                <select name="municipio" value={formData.municipio} onChange={manejarCambioUbicacion} disabled={!formData.departamento} required className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none text-slate-700 font-bold italic shadow-sm disabled:opacity-30">
                  <option value="">Selecciona municipio...</option>
                  {formData.departamento && Object.keys(divisionTerritorial[formData.departamento]).map(mun => <option key={mun} value={mun}>{mun}</option>)}
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Distrito</label>
                <select name="distrito" value={formData.distrito} onChange={manejarCambioUbicacion} disabled={!formData.municipio} required className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none text-slate-700 font-bold italic shadow-sm disabled:opacity-30">
                  <option value="">Selecciona distrito...</option>
                  {formData.municipio && divisionTerritorial[formData.departamento][formData.municipio].map(dist => <option key={dist} value={dist}>{dist}</option>)}
                </select>
              </div>
            </div>
          </div>

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
              <div className="bg-blue-800 p-5 rounded-2xl text-white shadow-lg text-[9px] leading-relaxed font-black uppercase tracking-widest text-center italic">Haz clic en el mapa o ingresa coordenadas arriba.</div>
              <div className="rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl h-80 bg-white relative z-0">
                <MapaFormulario setUbicacion={setUbicacion} ubicacionActual={formData.ubicacion} />
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 pb-4">03. Clasificación del Destino</h4>
            
            {/* NUEVO BLOQUE: CLASIFICACIÓN */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categoriasDestino.map(cat => (
                <label key={cat} className={`flex items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all font-bold text-[10px] text-center uppercase tracking-widest ${formData.categoria === cat ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-slate-100 text-slate-500 bg-slate-50 hover:border-slate-300'}`}>
                  <input type="radio" name="categoria" value={cat} checked={formData.categoria === cat} onChange={manejarCambio} className="hidden" required />
                  {cat}
                </label>
              ))}
            </div>

            {/* NUEVO BLOQUE: REGLAS Y PERMISOS */}
            <div className="space-y-4 pt-6">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic ml-2">A. Reglas y Permisos</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {reglasPermisos.map(item => (
                    <label key={item.id} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-white transition-all shadow-sm">
                    <input type="checkbox" name={item.id} checked={formData.permisos[item.id]} onChange={manejarCheck} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                    <span className="text-[9px] font-black uppercase text-slate-700">{item.label}</span>
                    </label>
                ))}
                </div>
            </div>

            {/* NUEVO BLOQUE: AMENIDADES */}
            <div className="space-y-4 pt-6">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic ml-2">B. Servicios y Amenidades</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {serviciosAmenidades.map(item => (
                    <label key={item.id} className="flex items-center gap-3 p-4 bg-blue-50/30 border border-blue-100/50 rounded-2xl cursor-pointer hover:bg-white transition-all shadow-sm">
                    <input type="checkbox" name={item.id} checked={formData.permisos[item.id]} onChange={manejarCheck} className="w-5 h-5 rounded border-blue-300 text-blue-600" />
                    <span className="text-[9px] font-black uppercase text-blue-900">{item.label}</span>
                    </label>
                ))}
                </div>
            </div>

            {/* NUEVO BLOQUE: ACTIVIDADES */}
            <div className="space-y-4 pt-6">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic ml-2">C. Actividades Destacadas</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {actividadesDestacadas.map(item => (
                    <label key={item.id} className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl cursor-pointer hover:bg-white transition-all shadow-sm">
                    <input type="checkbox" name={item.id} checked={formData.permisos[item.id]} onChange={manejarCheck} className="w-5 h-5 rounded border-emerald-300 text-emerald-600" />
                    <span className="text-[9px] font-black uppercase text-emerald-900">{item.label}</span>
                    </label>
                ))}
                </div>
            </div>
          </div>

          <div className="space-y-6 border-t border-slate-100 pt-10">
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

              <div className="mt-8 pt-8 border-t border-slate-200 space-y-6">
                <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest text-center italic">Tarifas de Entrada ($)</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-2 italic">Adultos</label>
                    <input type="number" name="adultos" value={formData.precios.adultos} onChange={manejarPrecio} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold focus:border-blue-500 outline-none shadow-sm" placeholder="0.00" />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-2 italic">Niños</label>
                    <input type="number" name="ninos" value={formData.precios.ninos} onChange={manejarPrecio} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold focus:border-blue-500 outline-none shadow-sm" placeholder="0.00" />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-2 italic">Tercera Edad</label>
                    <input type="number" name="terceraEdad" value={formData.precios.terceraEdad} onChange={manejarPrecio} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold focus:border-blue-500 outline-none shadow-sm" placeholder="0.00" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">05. Descripción del lugar</h4>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Actividades y servicios</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={manejarCambio} required className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none h-32 text-slate-700 font-bold italic shadow-sm" placeholder="Describe el lugar..." />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">06. Multimedia del Destino (MÁX. 20)</h4>
            
            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 flex items-start gap-5 shadow-inner relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0 z-10 italic">360°</div>
                <div className="z-10">
                    <h5 className="text-blue-800 font-black uppercase text-[11px] tracking-widest mb-1 italic">Tecnología Inmersiva</h5>
                    <p className="text-blue-600/80 text-[10px] font-bold leading-relaxed">
                        Si has subido fotografías panorámicas 360°, por favor <span className="font-black underline decoration-2 underline-offset-4">márcalas utilizando el botón "ES 360°"</span> que aparece sobre cada imagen.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
              {fotosVista.length === 0 ? (
                
                <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-slate-300 rounded-[2.5rem] cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all group shadow-inner">
                  <div className="bg-blue-100 p-5 rounded-full mb-4 text-blue-600 font-black text-2xl shadow-sm group-hover:scale-110 transition-transform italic">↑</div>
                  <input type="file" accept="image/*,video/*" multiple onChange={manejarArchivos} className="hidden" />
                  <p className="mb-1 text-[11px] text-slate-700 font-black uppercase tracking-widest italic">Seleccionar Fotos o Videos</p>
                </label>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {fotosVista.map((foto, index) => {
                    const esVideo = esUnVideo(foto);

                    return (
                      <div key={index} className="relative h-40 animate-in zoom-in-95 group rounded-2xl overflow-hidden shadow-md bg-black">
                        {esVideo ? (
                          <>
                            <video src={`${foto.url}#t=0.001`} className="w-full h-full object-cover opacity-80" preload="metadata" muted />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="bg-white/30 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center text-white pl-1 shadow-lg border border-white/50">▶</div>
                            </div>
                          </>
                        ) : (
                          <img src={foto.url} className={`w-full h-full object-cover transition-all ${foto.is360 ? 'scale-105 saturate-110' : ''}`} alt="" />
                        )}
                        
                        <button type="button" onClick={() => eliminarFoto(index)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px] shadow-lg transition-colors z-20">✕</button>
                        
                        {!esVideo && (
                          <button 
                            type="button" 
                            onClick={() => toggle360(index)} 
                            className={`absolute bottom-2 left-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg transition-all border-2 z-20
                                ${foto.is360 ? 'bg-blue-600 text-white border-blue-400 shadow-blue-500/50' : 'bg-white/90 backdrop-blur-sm text-slate-600 border-white hover:bg-white'}
                            `}
                          >
                            {foto.is360 ? '✓ ES 360°' : 'MARCAR 360°'}
                          </button>
                        )}

                        {foto.is360 && <div className="absolute inset-0 border-4 border-blue-600 rounded-2xl pointer-events-none z-10"></div>}
                      </div>
                    );
                  })}
                  
                  {fotosVista.length < 20 && (
                    <label className="flex items-center justify-center h-40 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                        <input type="file" accept="image/*,video/*" multiple onChange={manejarArchivos} className="hidden" />
                        <span className="text-blue-600 font-black text-2xl">+</span>
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-10 border-t border-slate-200 space-y-6">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">07. Identificación del Colaborador</h4>
            <div className="bg-blue-50/50 p-10 rounded-[2.5rem] border border-blue-100 space-y-8 relative overflow-hidden group">
              <div className="flex flex-col gap-2 relative z-10">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 italic">Emisor de la propuesta</p>
                <h4 className="text-slate-800 font-black uppercase italic text-lg leading-tight">Enviada bajo el nombre de: <span className="text-blue-600">{sesionActiva.nombre}</span></h4>
              </div>
              <div className="flex items-start gap-4 p-5 bg-white/50 rounded-2xl border border-blue-100/50 shadow-sm relative z-10">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black italic shadow-lg">!</div>
                <div className="space-y-1 text-left">
                   <p className="text-slate-500 text-[10px] font-bold uppercase italic">Correo de contacto:</p>
                   <p className="text-blue-600 font-black text-xs underline decoration-blue-200 underline-offset-4 italic">{correoBD}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-8">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-200 font-black py-5 rounded-3xl transition-all text-[10px] uppercase tracking-widest italic">CANCELAR</button>
            <button type="submit" disabled={isSubiendo || cargando} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-blue-200 transform active:scale-95 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50 italic">
                {isSubiendo ? 'ENVIANDO...' : (id ? 'GUARDAR CAMBIOS' : 'ENVIAR PROPUESTA')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}