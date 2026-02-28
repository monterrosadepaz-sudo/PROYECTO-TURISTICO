import React, { useState, useEffect, useRef } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom'; 
import MapaFormulario from './MapaFormulario'; 
import GestorLoteImagenes from './GestorLoteImagenes'; 
import ModalSolicitud from './ModalSolicitud'; 
import { divisionTerritorial } from '../data/DatosElSalvador';
import { categoriasDestino, reglasPermisos, serviciosAmenidades, actividadesDestacadas } from '../data/OpcionesDestino';
import { API_URL } from "../config";
const etiquetasPrecios = { adultos: "Adultos", ninos: "Niños", terceraEdad: "Tercera Edad" };

export default function FormularioEditar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const sesionActiva = JSON.parse(localStorage.getItem('usuarioLogueado')) || {};

  const [cargando, setCargando] = useState(true);
  
  const [coordManual, setCoordManual] = useState({ lat: '', lng: '' });
  const [adminId, setAdminId] = useState(null);
  const [imagenRaw, setImagenRaw] = useState(''); 
  const [extraData, setExtraData] = useState({ fecha: '', personas: 1, esOficial: false }); 

  const [modoEdicion, setModoEdicion] = useState(false); 
  const [estadoSitio, setEstadoSitio] = useState(''); 
  const [previews, setPreviews] = useState({ planas: [], tres60: [], videos: [], youtubeUrl: null }); 
  
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoAccion, setTipoAccion] = useState(null); 
  const [modalGestorImagenesAbierto, setModalGestorImagenesAbierto] = useState(false);

  const [procesandoSolicitud, setProcesandoSolicitud] = useState(false);
  const [mensajeProgreso, setMensajeProgreso] = useState("");

  const horarioBase = {
      lunes: { abierto: false, inicio: '08:00', fin: '17:00' }, martes: { abierto: false, inicio: '08:00', fin: '17:00' },
      miercoles: { abierto: false, inicio: '08:00', fin: '17:00' }, jueves: { abierto: false, inicio: '08:00', fin: '17:00' },
      viernes: { abierto: false, inicio: '08:00', fin: '17:00' }, sabado: { abierto: false, inicio: '08:00', fin: '17:00' },
      domingo: { abierto: false, inicio: '08:00', fin: '17:00' },
  };

  const estadoInicialPermisos = {};
  [...reglasPermisos, ...serviciosAmenidades, ...actividadesDestacadas].forEach(item => {
      estadoInicialPermisos[item.id] = false;
  });

  const [formData, setFormData] = useState({
    nombreSitio: '', departamento: '', municipio: '', distrito: '',   
    ubicacion: null, categoria: '', descripcion: '',
    youtubeVideo: '', 
    precios: { adultos: '', ninos: '', terceraEdad: '' }, horarios: horarioBase,
    permisos: estadoInicialPermisos
  });

  const handleDepartamentoChange = (e) => { if (modoEdicion) setFormData(prev => ({ ...prev, departamento: e.target.value, municipio: '', distrito: '' })); };
  const handleMunicipioChange = (e) => { if (modoEdicion) setFormData(prev => ({ ...prev, municipio: e.target.value, distrito: '' })); };
  const handleDistritoChange = (e) => { if (modoEdicion) setFormData(prev => ({ ...prev, distrito: e.target.value })); };
  const handleChange = (e) => { if (modoEdicion) setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleCoordChange = (e) => {
      if (!modoEdicion) return;
      const { name, value } = e.target;
      setCoordManual(prev => ({...prev, [name]: value}));
      setFormData(prev => ({ ...prev, ubicacion: { lat: name === 'lat' ? parseFloat(value) : prev.ubicacion.lat, lng: name === 'lng' ? parseFloat(value) : prev.ubicacion.lng } }));
  };
  const handleMapUpdate = (coords) => {
      if (!modoEdicion) return;
      setFormData(prev => ({ ...prev, ubicacion: coords }));
      setCoordManual({ lat: coords.lat, lng: coords.lng });
  };
  const toggleCategoria = (cat) => { if (modoEdicion) setFormData(prev => ({ ...prev, categoria: cat })); };
  const togglePermiso = (key) => { if (modoEdicion) setFormData(prev => ({ ...prev, permisos: { ...prev.permisos, [key]: !prev.permisos[key] } })); };
  const handlePrecioChange = (e) => { if (modoEdicion) setFormData(prev => ({ ...prev, precios: { ...prev.precios, [e.target.name]: e.target.value } })); };
  const handleHorarioChange = (dia, campo, valor) => { if (modoEdicion) setFormData(prev => ({ ...prev, horarios: { ...prev.horarios, [dia]: { ...prev.horarios[dia], [campo]: valor } } })); };
  const toggleDiaAbierto = (dia) => { if (modoEdicion) setFormData(prev => ({ ...prev, horarios: { ...prev.horarios, [dia]: { ...prev.horarios[dia], abierto: !prev.horarios[dia].abierto } } })); };

  const normalizar = (texto) => texto ? texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
  
  const limpiarJSONHorarios = (data) => {
    if (!data || data === "null") return {};
    if (typeof data === 'object') return data;
    try {
        let cleaned = data;
        cleaned = cleaned.replace(/\\+"/g, '"').replace(/\\"/g, '"');
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
            cleaned = cleaned.substring(1, cleaned.length - 1);
        }
        if (cleaned.startsWith('"')) {
             cleaned = cleaned.substring(1, cleaned.length - 1).replace(/\\"/g, '"');
        }
        return JSON.parse(cleaned);
    } catch (e) { return {}; }
  };

  const safeParse = (data) => {
      if (!data || data === "null") return {};
      if (typeof data === 'object') return data;
      try {
          let cleaned = data;
          if (typeof cleaned === 'string') {
              cleaned = cleaned.replace(/\\"/g, '"');
              if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
                  cleaned = cleaned.substring(1, cleaned.length - 1);
              }
          }
          return JSON.parse(cleaned);
      } catch (e) { return {}; }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      if (!id || !sesionActiva.idusuario) return;
      try {
        let rawData = null;
        let esOficial = false; 

        try {
            const resp = await fetch(`${API_URL}/api/colaborador/publicaciones/detalles/${id}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ "colaborador_id": sesionActiva.idusuario, "idpublicacion": id })
            });
            if (resp.ok) { rawData = await resp.json(); }
        } catch (e) { }

        if (!rawData) {
            const resp = await fetch(`${API_URL}/api/preformularios/detalles/${id}`, { headers: { 'Accept': 'application/json' } });
            if (resp.ok) { rawData = await resp.json(); }
        }
        
        if (rawData) {
          const data = Array.isArray(rawData) ? rawData[0] : rawData;
          esOficial = !!data.idpublicacion;

          if(data.aprobado_por) setAdminId(data.aprobado_por);
          else if (data.idadmin) setAdminId(data.idadmin);
          
          setEstadoSitio(data.estado); 
          if (data.estado === 'inactivo') setModoEdicion(true); 
          else setModoEdicion(false);
          
          setExtraData({ 
              fecha: data.fecha || new Date().toISOString().split('T')[0], 
              personas: data.personas || 1,
              esOficial: esOficial 
          });

          const pol = safeParse(data.politicas || data.politicas_obj);
          const det = safeParse(data.detalles);
          const clasif = safeParse(data.clasificacion);
          
          const horasRaw = limpiarJSONHorarios(data.horarios);
          const tarifas = det.tarifas_desglosadas || {};
          
          const horariosProcesados = { ...horarioBase };
          if (horasRaw && typeof horasRaw === 'object') {
              Object.keys(horasRaw).forEach(key => {
                  const diaNorm = normalizar(key); 
                  const diaBase = Object.keys(horarioBase).find(d => normalizar(d) === diaNorm);
                  if (diaBase && horasRaw[key] && horasRaw[key].includes('-')) {
                      const [inicio, fin] = horasRaw[key].split('-');
                      horariosProcesados[diaBase] = { abierto: true, inicio, fin };
                  }
              });
          }

          let catNormalizada = '';
          if (Array.isArray(clasif) && clasif.length > 0) catNormalizada = clasif[0];
          else if (typeof clasif === 'string') {
              try { const arr = JSON.parse(clasif.replace(/\\"/g, '"')); if (Array.isArray(arr)) catNormalizada = arr[0]; else catNormalizada = clasif; } 
              catch(e) { catNormalizada = clasif; }
          }
          catNormalizada = catNormalizada ? catNormalizada.charAt(0).toUpperCase() + catNormalizada.slice(1).toLowerCase() : '';

          const permisosCargados = { ...estadoInicialPermisos, ...pol };
          
          if(pol.comida || pol.TRAER_COMIDA) permisosCargados.traer_comida = true;
          if(pol.bebidasGaseosas || pol.GASEOSAS_AGUA) permisosCargados.gaseosas_agua = true;
          if(pol.bebidasAlcoholicas || pol.ALCOHOL) permisosCargados.alcohol = true;
          if(pol.mesasSillas || pol.MESAS_SILLAS) permisosCargados.mesas_sillas = true;
          if(pol.parrillasCocinas || pol.PARRILLAS_COCINAS) permisosCargados.parrillas_cocinas = true;
          if(pol.armasFuego || pol.ARMAS_DE_FUEGO) permisosCargados.armas_de_fuego = true;

          const jsonImagenes = data.imagenes || data.lote_imagenes;
          const loteRaw = safeParse(jsonImagenes);

          let urlYoutubeExtraida = data.video_link || ''; 
          let orgPreview = { planas: [], tres60: [], videos: [], youtubeUrl: null };

          const obtenerRutaReal = (nombreImg) => {
              if (!nombreImg) return '';
              if (nombreImg.startsWith('http')) return nombreImg;
              if (nombreImg.includes('preformulario')) return `${API_URL}/storage/preformularios/${nombreImg}`;
              return `${API_URL}/storage/publicaciones/${nombreImg}`;
          };

          if (loteRaw && typeof loteRaw === 'object' && !Array.isArray(loteRaw)) {
              if (loteRaw.plana && Array.isArray(loteRaw.plana)) {
                  loteRaw.plana.forEach(img => orgPreview.planas.push({ url: obtenerRutaReal(img), nombreOriginal: img }));
              }
              if (loteRaw['360'] && Array.isArray(loteRaw['360'])) {
                  loteRaw['360'].forEach(img => {
                      if(img !== "YouTube Video") orgPreview.tres60.push({ url: obtenerRutaReal(img), nombreOriginal: img });
                  });
              }
              if (loteRaw.video && Array.isArray(loteRaw.video)) {
                  loteRaw.video.forEach(vid => orgPreview.videos.push({ url: obtenerRutaReal(vid), nombreOriginal: vid }));
              }
              if (loteRaw.youtube && loteRaw.youtube.length > 0) {
                  const ytUrl = Array.isArray(loteRaw.youtube) ? loteRaw.youtube[0] : loteRaw.youtube;
                  if(ytUrl && ytUrl !== "YouTube Video") {
                      urlYoutubeExtraida = ytUrl;
                  }
              }
          } else if (Array.isArray(loteRaw)) {
              loteRaw.forEach(img => {
                  if(img !== "YouTube Video") {
                      if(img.includes('.mp4')) orgPreview.videos.push({ url: obtenerRutaReal(img), nombreOriginal: img });
                      else if(img.includes('-360')) orgPreview.tres60.push({ url: obtenerRutaReal(img), nombreOriginal: img });
                      else orgPreview.planas.push({ url: obtenerRutaReal(img), nombreOriginal: img });
                  }
              });
          }

          orgPreview.youtubeUrl = urlYoutubeExtraida;
          
          setFormData({
            nombreSitio: data.nombre || '', departamento: data.departamento || '', municipio: data.municipio || '', distrito: data.distrito || '', 
            ubicacion: { lat: parseFloat(data.latitud), lng: parseFloat(data.longitud) }, categoria: catNormalizada, descripcion: data.descripcion || '',
            youtubeVideo: urlYoutubeExtraida, 
            precios: { adultos: tarifas.adultos || data.costo_entrada || '0.00', ninos: tarifas.ninos || '0.00', terceraEdad: tarifas.terceraEdad || '0.00' },
            horarios: horariosProcesados, permisos: permisosCargados
          });

          setCoordManual({ lat: data.latitud ? parseFloat(data.latitud).toFixed(6) : '', lng: data.longitud ? parseFloat(data.longitud).toFixed(6) : '' });
          setImagenRaw(data.imagen || ''); 
          setPreviews(orgPreview);
        }
      } catch (error) { console.error("Error:", error); } finally { setCargando(false); }
    };
    cargarDatos();
  }, [id, sesionActiva.idusuario, estadoSitio, modalGestorImagenesAbierto]); 


  const guardarCambios = async () => {
     if(!window.confirm("¿Confirmar cambios de texto y enviar publicación a revisión definitiva? \n\nRecuerda: Si quieres cambiar imágenes, debes hacerlo antes en el panel 'Actualizar Imágenes'.")) return;
     
     setProcesandoSolicitud(true);
     
     try {
         setMensajeProgreso("Guardando información de texto...");
         
         const horariosEnvio = {};
         Object.keys(formData.horarios).forEach(dia => {
             const h = formData.horarios[dia];
             if(h.abierto) horariosEnvio[dia] = `${h.inicio}-${h.fin}`;
         });

         const payloadTexto = {
             idusuario: sesionActiva.idusuario, idpublicacion: id, nombre: formData.nombreSitio, departamento: formData.departamento, municipio: formData.municipio, distrito: formData.distrito, latitud: formData.ubicacion.lat, longitud: formData.ubicacion.lng, 
             clasificacion: JSON.stringify([formData.categoria.toUpperCase(), "TURISMO"]), 
             politicas: JSON.stringify(formData.permisos),
             video_link: formData.youtubeVideo,
             horarios: JSON.stringify(horariosEnvio), costo_entrada: formData.precios.adultos || 0, descripcion: formData.descripcion, detalles: JSON.stringify({ tarifas_desglosadas: formData.precios }), 
             imagen: imagenRaw, estado: "inactivo", aprobado_por: adminId, idadmin: adminId, tarifas_desglosadas: JSON.stringify(formData.precios), fecha: extraData.fecha, personas: extraData.personas
         };

         const urlTexto = extraData.esOficial 
            ? `${API_URL}/api/colaborador/publicaciones/actualizar/${id}`
            : `${API_URL}/api/preformularios/actualizar/${id}`;
            
         const respTexto = await fetch(urlTexto, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payloadTexto) });

         if (!respTexto.ok) throw new Error(`Falló el guardado de texto`);

         setMensajeProgreso("Cerrando edición y enviando a revisión final...");
         const urlGuardarFinal = `${API_URL}/api/colaborador/publicaciones/guardar/${id}/${sesionActiva.idusuario}`;
         const respFinal = await fetch(urlGuardarFinal, { method: 'PUT', headers: { 'Accept': 'application/json' } });

         if (!respFinal.ok) throw new Error("El texto se guardó, pero falló el envío final a revisión.");

         alert("¡Actualización completada y enviada a revisión correctamente!");
         navigate("/mis-propuestas");

     } catch (e) { 
         alert(e.message); 
     } finally { 
         setProcesandoSolicitud(false); 
         setMensajeProgreso("");
     }
  };

  const abrirModalSolicitud = (accion) => { setTipoAccion(accion); setModalVisible(true); };
  const confirmarSolicitud = async (comentario) => {
      if (!comentario.trim()) { alert("Ingresa un motivo."); return; }
      setProcesandoSolicitud(true);
      let accionEnviar = tipoAccion.toLowerCase() === 'actualizar' ? 'editar' : tipoAccion.toLowerCase();
      try {
          const payload = { "idpublicacion": id, "remitente_id": sesionActiva.idusuario, "destinatario_id": adminId || "641699ed-c755-43e3-bed8-c698f8096992", "accion": accionEnviar, "comentarios": comentario };
          const respuesta = await fetch(`${API_URL}/api/colaborador/solicitud/enviar`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) });
          if (respuesta.ok) { alert(`Solicitud enviada.`); setModalVisible(false); navigate("/mis-propuestas"); } else { alert("Error al enviar."); }
      } catch (error) { alert("Error de conexión."); } finally { setProcesandoSolicitud(false); }
  };

  const RenderMiniaturas = ({ items, icon, tag }) => {
      if(items.length === 0) return null;
      return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((item, idx) => (
                  <div key={idx} className="relative aspect-square rounded-[2rem] overflow-hidden shadow-md border-4 border-white bg-slate-900 group">
                      {item.url.includes('.mp4') ? (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                              <span className="text-white text-3xl opacity-50">▶</span>
                          </div>
                      ) : (
                          <img src={item.url} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${tag === '360°' ? 'saturate-110' : ''}`} alt="Vista previa" 
                             onError={(e) => { e.target.onerror = null; e.target.src = '/default.jpg'; }}
                          />
                      )}
                      <div className={`absolute bottom-3 left-3 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-md uppercase tracking-widest ${tag === '360°' ? 'bg-blue-600' : 'bg-slate-800/80'}`}>
                          {icon} {tag}
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center italic font-black text-blue-800 uppercase tracking-widest animate-pulse">Cargando...</div>;

  return (
    <div className="min-h-screen py-12 px-4 flex justify-center items-start bg-slate-100/50 italic text-left">
      <ModalSolicitud visible={modalVisible} tipo={tipoAccion} alCerrar={() => setModalVisible(false)} alConfirmar={confirmarSolicitud} procesando={procesandoSolicitud} />
      
      {/* 🔥 INYECCIÓN DE DATOS AL GESTOR DE IMÁGENES 🔥 */}
      {modalGestorImagenesAbierto && modoEdicion && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-[3rem] shadow-2xl relative">
                <button onClick={() => setModalGestorImagenesAbierto(false)} className="absolute top-6 right-6 z-50 bg-slate-100 hover:bg-red-500 hover:text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-black transition-all shadow-md">✕</button>
                <GestorLoteImagenes 
                    idpublicacion={id} 
                    idusuario={sesionActiva.idusuario} 
                    imagenesCargadas={[...previews.planas, ...previews.tres60, ...previews.videos]} 
                    youtubeActual={previews.youtubeUrl}  // <- El enlace fluye hacia el Gestor
                    alTerminar={() => setModalGestorImagenesAbierto(false)}
                />
            </div>
        </div>
      )}

      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden text-slate-800 italic relative">
        
        {procesandoSolicitud && mensajeProgreso && (
            <div className="absolute inset-0 z-[6000] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <h3 className="text-blue-800 font-black uppercase tracking-widest italic text-center px-4">{mensajeProgreso}</h3>
            </div>
        )}

        <div className={`p-10 text-white relative z-[50] ${modoEdicion ? 'bg-slate-800' : 'bg-blue-800'}`}>
          <h3 className="text-3xl font-black uppercase italic text-center leading-none tracking-tighter">
              {modoEdicion ? 'Editando Destino' : 'Detalles del Destino'}
          </h3>
          <p className={`text-[10px] mt-3 uppercase font-black tracking-[0.2em] text-center italic tracking-widest ${modoEdicion ? 'text-green-400 animate-pulse' : 'text-blue-100'}`}>
             {modoEdicion ? '● MODO EDICIÓN HABILITADO' : `MODO VISUALIZACIÓN - ESTADO: ${estadoSitio?.toUpperCase()}`}
          </p>
          <button onClick={() => navigate(-1)} className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all font-black">✕</button>
        </div>

        <div className="p-10 space-y-12"> 
          
          <div className="space-y-6">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">01. Datos Generales</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1 md:col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Nombre del Destino</label>
                <input name="nombreSitio" readOnly={!modoEdicion} value={formData.nombreSitio} onChange={handleChange} className={`w-full px-5 py-4 rounded-2xl border bg-slate-50 font-bold italic shadow-sm focus:outline-none ${modoEdicion ? 'border-blue-300 text-slate-800 focus:bg-white' : 'border-slate-100 text-slate-500'}`} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Departamento</label>
                {!modoEdicion ? ( 
                    <input readOnly value={formData.departamento} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 font-bold italic shadow-sm focus:outline-none" /> 
                ) : ( 
                    <select name="departamento" value={formData.departamento} onChange={handleDepartamentoChange} className="w-full px-5 py-4 rounded-2xl border border-blue-300 bg-white text-slate-800 font-bold italic shadow-sm focus:outline-none appearance-none"> 
                        <option value="">Seleccione...</option> 
                        {Object.keys(divisionTerritorial).map(d => <option key={d} value={d}>{d}</option>)} 
                    </select> 
                )}
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Municipio (Zona)</label>
                {!modoEdicion ? ( 
                    <input readOnly value={formData.municipio} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 font-bold italic shadow-sm focus:outline-none" /> 
                ) : ( 
                    <select name="municipio" value={formData.municipio} onChange={handleMunicipioChange} disabled={!formData.departamento} className="w-full px-5 py-4 rounded-2xl border border-blue-300 bg-white text-slate-800 font-bold italic shadow-sm focus:outline-none appearance-none disabled:bg-slate-100 disabled:border-slate-200"> 
                        <option value="">Seleccione...</option> 
                        {formData.departamento && divisionTerritorial[formData.departamento] ? Object.keys(divisionTerritorial[formData.departamento]).map(mun => <option key={mun} value={mun}>{mun}</option>) : null} 
                    </select> 
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Distrito (Lugar)</label>
                {!modoEdicion ? ( 
                    <input readOnly value={formData.distrito} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 font-bold italic shadow-sm focus:outline-none" /> 
                ) : ( 
                    <select name="distrito" value={formData.distrito} onChange={handleDistritoChange} disabled={!formData.municipio} className="w-full px-5 py-4 rounded-2xl border border-blue-300 bg-white text-slate-800 font-bold italic shadow-sm focus:outline-none appearance-none disabled:bg-slate-100 disabled:border-slate-200"> 
                        <option value="">Seleccione...</option> 
                        {formData.departamento && formData.municipio && divisionTerritorial[formData.departamento]?.[formData.municipio] ? divisionTerritorial[formData.departamento][formData.municipio].map(dist => <option key={dist} value={dist}>{dist}</option>) : null} 
                    </select> 
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">02. Ubicación Cartográfica</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-inner italic">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-slate-400 ml-2 italic">Latitud</label>
                  <input name="lat" readOnly={!modoEdicion} onChange={handleCoordChange} value={coordManual.lat} className={`w-full px-4 py-3 rounded-xl border text-[10px] font-black outline-none italic ${modoEdicion ? 'bg-white border-blue-300 text-blue-600' : 'bg-white border-slate-200 text-slate-500'}`} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-slate-400 ml-2 italic">Longitud</label>
                  <input name="lng" readOnly={!modoEdicion} onChange={handleCoordChange} value={coordManual.lng} className={`w-full px-4 py-3 rounded-xl border text-[10px] font-black outline-none italic ${modoEdicion ? 'bg-white border-blue-300 text-blue-600' : 'bg-white border-slate-200 text-slate-500'}`} />
                </div>
            </div>
            <div className={`rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl h-80 relative z-0 ${!modoEdicion ? 'pointer-events-none grayscale-[0.2] opacity-90' : 'opacity-100'}`}>
                {formData.ubicacion && !isNaN(parseFloat(formData.ubicacion.lat)) ? (
                    <MapaFormulario ubicacionActual={formData.ubicacion} setUbicacion={handleMapUpdate} />
                ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">Ubicación no disponible</div>
                )}
            </div>
          </div>

          <div className="space-y-12">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 pb-4">03. Clasificación del Destino</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 italic">
              {categoriasDestino.map(cat => (
                <button key={cat} onClick={() => toggleCategoria(cat)} disabled={!modoEdicion} className={`flex items-center justify-center p-4 border-2 rounded-2xl font-black text-[10px] uppercase transition-all ${formData.categoria === cat ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'} ${modoEdicion && formData.categoria !== cat ? 'cursor-pointer' : ''}`}>
                    {cat}
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-6">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic ml-2">A. Reglas y Permisos</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {reglasPermisos.map(item => (
                    <div key={item.id} onClick={() => togglePermiso(item.id)} className={`flex items-center gap-3 p-4 border rounded-2xl transition-all select-none ${formData.permisos[item.id] ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'} ${modoEdicion ? 'cursor-pointer' : 'cursor-default'}`}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.permisos[item.id] ? 'bg-blue-600 border-blue-600' : 'bg-slate-100 border-slate-300'}`}>{formData.permisos[item.id] && <span className="text-white text-[8px]">✓</span>}</div>
                      <span className={`text-[9px] font-black uppercase italic ${formData.permisos[item.id] ? 'text-blue-900' : 'text-slate-500'}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
            </div>

            <div className="space-y-4 pt-6">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic ml-2">B. Servicios y Amenidades</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {serviciosAmenidades.map(item => (
                    <div key={item.id} onClick={() => togglePermiso(item.id)} className={`flex items-center gap-3 p-4 border rounded-2xl transition-all select-none ${formData.permisos[item.id] ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'} ${modoEdicion ? 'cursor-pointer' : 'cursor-default'}`}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.permisos[item.id] ? 'bg-blue-600 border-blue-600' : 'bg-slate-100 border-slate-300'}`}>{formData.permisos[item.id] && <span className="text-white text-[8px]">✓</span>}</div>
                      <span className={`text-[9px] font-black uppercase italic ${formData.permisos[item.id] ? 'text-blue-900' : 'text-slate-500'}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
            </div>

            <div className="space-y-4 pt-6">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic ml-2">C. Actividades Destacadas</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {actividadesDestacadas.map(item => (
                    <div key={item.id} onClick={() => togglePermiso(item.id)} className={`flex items-center gap-3 p-4 border rounded-2xl transition-all select-none ${formData.permisos[item.id] ? 'bg-emerald-50 border-emerald-300 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'} ${modoEdicion ? 'cursor-pointer' : 'cursor-default'}`}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.permisos[item.id] ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-100 border-slate-300'}`}>{formData.permisos[item.id] && <span className="text-white text-[8px]">✓</span>}</div>
                      <span className={`text-[9px] font-black uppercase italic ${formData.permisos[item.id] ? 'text-emerald-900' : 'text-slate-500'}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">04. Horarios y Costos</h4>
            <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-4">
                {Object.keys(formData.horarios).map((dia) => (
                  <div key={dia} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 gap-4 shadow-sm italic">
                    <div className={`flex items-center gap-3 min-w-[120px] ${modoEdicion ? 'cursor-pointer' : ''}`} onClick={() => toggleDiaAbierto(dia)}>
                      <div className={`w-5 h-5 rounded border ${formData.horarios[dia].abierto ? 'bg-blue-600 border-blue-600' : 'bg-slate-100 border-slate-300'}`}></div>
                      <span className="text-[11px] font-black uppercase text-slate-700">{dia}</span>
                    </div>
                    {formData.horarios[dia].abierto ? (
                      <div className="flex items-center gap-2 text-slate-500">
                        <input type="time" disabled={!modoEdicion} value={formData.horarios[dia].inicio} onChange={(e) => handleHorarioChange(dia, 'inicio', e.target.value)} className={`text-xs font-bold border rounded px-2 py-1 ${modoEdicion ? 'bg-white border-blue-200 focus:outline-none' : 'bg-slate-100 border-transparent'}`} />
                        <span className="text-slate-300 font-bold text-[10px]">A</span>
                        <input type="time" disabled={!modoEdicion} value={formData.horarios[dia].fin} onChange={(e) => handleHorarioChange(dia, 'fin', e.target.value)} className={`text-xs font-bold border rounded px-2 py-1 ${modoEdicion ? 'bg-white border-blue-200 focus:outline-none' : 'bg-slate-100 border-transparent'}`} />
                      </div>
                    ) : <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cerrado</span>}
                  </div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                {['adultos', 'ninos', 'terceraEdad'].map(p => (
                  <div key={p} className="space-y-1 text-left">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-2 italic">{etiquetasPrecios[p]}</label>
                    <div className={`flex items-center rounded-xl border shadow-inner overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all ${modoEdicion ? 'bg-white border-blue-200' : 'bg-slate-100 border-slate-100'}`}>
                        <span className="px-3 text-slate-400 font-black text-sm italic">$</span>
                        <input 
                            name={p} 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()} 
                            readOnly={!modoEdicion} 
                            value={formData.precios[p]} 
                            onChange={handlePrecioChange} 
                            className="w-full py-3 pr-4 font-bold italic text-xs outline-none bg-transparent text-slate-700" 
                            placeholder="0.00" 
                        />
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">05. Descripción</h4>
            <textarea name="descripcion" readOnly={!modoEdicion} value={formData.descripcion} onChange={handleChange} className={`w-full px-5 py-4 rounded-2xl border bg-slate-50 h-32 font-bold italic shadow-sm focus:outline-none resize-none ${modoEdicion ? 'border-blue-300 text-slate-800 focus:bg-white' : 'border-slate-100 text-slate-500'}`} />
          </div>

          <div className="space-y-4 bg-slate-50 p-8 rounded-[3rem] border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6 border-b border-slate-200 pb-6">
                <div>
                    <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">06. Galería de Imágenes</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Archivos actuales</p>
                </div>
                
                {modoEdicion && (
                    <button 
                        onClick={() => setModalGestorImagenesAbierto(true)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span>🖼️</span> Actualizar Imágenes
                    </button>
                )}
            </div>

            {/* 🔥 SECCIÓN YOUTUBE LECTURA (El input de edición desapareció para evitar conflictos) */}
            {formData.youtubeVideo && (
               <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3">
                   <div className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-lg shrink-0 shadow-sm">▶</div>
                   <div className="overflow-hidden">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enlace de Video Adjunto</p>
                       <a href={formData.youtubeVideo} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline italic truncate block w-full">
                           {formData.youtubeVideo}
                       </a>
                   </div>
               </div>
            )}
            
            {modoEdicion && (
                <div className="mb-6">
                    <p className="text-[9px] text-slate-500 font-bold uppercase p-4 border-2 border-dashed border-slate-200 bg-white rounded-xl text-center">
                        Para agregar o modificar un video de YouTube, haz clic en el botón azul "Actualizar Imágenes".
                    </p>
                </div>
            )}

            {/* GALERÍA SEPARADA POR TIPOS */}
            <div className="space-y-6">
                {previews.tres60.length > 0 && (
                    <div>
                        <h5 className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1 inline-block">Esferas 360°</h5>
                        <RenderMiniaturas items={previews.tres60} icon="🌐" tag="360°" />
                    </div>
                )}
                {previews.videos.length > 0 && (
                    <div>
                        <h5 className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1 inline-block">Videos MP4</h5>
                        <RenderMiniaturas items={previews.videos} icon="🎬" tag="VIDEO" />
                    </div>
                )}
                {previews.planas.length > 0 && (
                    <div>
                        <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1 inline-block">Fotos Normales</h5>
                        <RenderMiniaturas items={previews.planas} icon="📷" tag="FOTO" />
                    </div>
                )}
                
                {previews.tres60.length === 0 && previews.videos.length === 0 && previews.planas.length === 0 && !formData.youtubeVideo && (
                    <div className="p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400">
                        <span className="text-3xl block mb-2 opacity-50">📂</span>
                        <p className="font-black text-[10px] uppercase tracking-widest">Sin archivos multimedia</p>
                    </div>
                )}
            </div>

          </div>

        </div>

        <div className="p-10 bg-slate-50 border-t border-slate-200">
            {!modoEdicion ? (
                <>
                    <p className="text-center text-[9px] text-slate-400 font-bold uppercase mb-6 tracking-widest">
                        {estadoSitio === 'pendiente' ? 'Este sitio está en revisión por el administrador.' : 'Para realizar cambios, debes enviar una solicitud.'}
                    </p>
                    <div className="flex gap-4 italic">
                        <button onClick={() => abrirModalSolicitud('eliminar')} className="flex-1 bg-red-100 text-red-600 border border-red-200 font-black py-4 rounded-[2rem] text-[10px] uppercase tracking-widest hover:bg-red-200 transition-all">Solicitar Eliminar</button>
                        <button onClick={() => abrirModalSolicitud('actualizar')} className="flex-[2] bg-blue-600 text-white font-black py-4 rounded-[2rem] shadow-lg text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all">Solicitar Actualizar</button>
                    </div>
                </>
            ) : (
                <>
                    <p className="text-center text-[9px] text-green-600 font-bold uppercase mb-6 tracking-widest animate-pulse">
                        ¡Permiso concedido! Edita los textos arriba. Al finalizar, guarda todo aquí.
                    </p>
                    <button onClick={guardarCambios} disabled={procesandoSolicitud} className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-[2rem] shadow-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50">
                        {procesandoSolicitud ? 'PROCESANDO...' : '💾 GUARDAR CAMBIOS DE TEXTO Y ENVIAR A REVISIÓN FINAL'}
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
}