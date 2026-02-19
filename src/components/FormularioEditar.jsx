import React, { useState, useEffect } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom'; 
import MapaFormulario from './MapaFormulario'; 

// --- 1. NUEVO MODAL DE SOLICITUD ---
const ModalSolicitud = ({ visible, tipo, alCerrar, alConfirmar, procesando }) => {
  const [comentario, setComentario] = useState("");
  if (!visible) return null;
  
  const esEliminar = tipo === 'eliminar';
  const titulo = esEliminar ? "Solicitar Baja Temporal" : "Solicitar Actualización";
  const mensaje = esEliminar 
    ? "Estás solicitando desactivar este sitio. Si el administrador aprueba, el sitio dejará de ser visible al público hasta que decidas activarlo nuevamente."
    : "Se enviará una notificación al administrador. Si aprueba la solicitud, el sitio pasará a estado 'Inactivo' para que puedas editarlo.";
  const colorBoton = esEliminar ? "bg-slate-800 hover:bg-black" : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 text-center shadow-2xl border border-slate-100 italic relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 ${esEliminar ? 'bg-red-500' : 'bg-blue-500'}`}></div>
        <h2 className={`text-2xl font-black uppercase tracking-tighter mb-4 italic ${esEliminar ? 'text-slate-800' : 'text-blue-800'}`}>{titulo}</h2>
        <p className="text-slate-500 text-[10px] font-bold mb-6 leading-relaxed uppercase tracking-wide">{mensaje}</p>
        <div className="space-y-2 mb-6 text-left">
            <label className="text-[8px] font-black uppercase text-slate-400 ml-4 tracking-widest block italic">Motivo de la solicitud</label>
            <textarea 
                value={comentario} 
                onChange={(e) => setComentario(e.target.value)} 
                className="w-full px-5 py-4 rounded-3xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none h-28 text-slate-700 font-bold italic text-xs shadow-inner resize-none transition-all" 
                placeholder="Explica brevemente por qué deseas realizar esta acción..." 
            />
        </div>
        <div className="flex gap-3">
            <button onClick={alCerrar} className="flex-1 bg-slate-100 text-slate-400 font-black py-4 rounded-2xl text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
            <button onClick={() => alConfirmar(comentario)} disabled={procesando} className={`flex-[1.5] ${colorBoton} text-white font-black py-4 rounded-2xl shadow-lg text-[9px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2`}>
                {procesando ? <span>Enviando...</span> : <span>Confirmar Solicitud</span>}
            </button>
        </div>
      </div>
    </div>
  );
};

// --- DATOS TERRITORIALES ---
const divisionTerritorial = {
  "Ahuachapán": { "Ahuachapán Norte": ["Atiquizaya", "El Refugio", "San Lorenzo", "Turín"], "Ahuachapán Centro": ["Ahuachapán", "Apaneca", "Concepción de Ataco", "Tacuba"], "Ahuachapán Sur": ["Guaymango", "Jujutla", "San Francisco Menendez", "San Pedro Puxtla"] },
  "San Salvador": { "San Salvador Norte": ["Aguilares", "El Paisnal", "Guazapa"], "San Salvador Oeste": ["Apopa", "Nejapa"], "San Salvador Este": ["llopango", "San Martín", "Soyapango", "Tonacatepeque"], "San Salvador Centro": ["Ayutuxtepeque", "Mejicanos", "San Salvador", "Cuscatancingo", "Ciudad Delgado"], "San Salvador Sur": ["Panchimalco", "Rosario de Mora", "San Marcos", "Santo Tomás", "Santiago Texacuangos"] },
  "La Libertad": { "La Libertad Norte": ["Quezaltepeque", "San Matías", "San Pablo Tacachico"], "La Libertad Centro": ["San Juan Opico", "Ciudad Arce"], "La Libertad Oeste": ["Colón", "Jayaque", "Sacacoyo", "Tepecoyo", "Talnique"], "La Libertad Este": ["Antiguo Cuscatlán", "Huizucar", "Nuevo Cuscatlán", "San José Villanueva", "Zaragoza"], "La Libertad Costa": ["Chiltuipán", "Jicalapa", "La Libertad", "Tamanique", "Teotepeque"], "La Libertad Sur": ["Comasagua", "Santa Tecla"] },
  "Chalatenango": { "Chalatenango Norte": ["La Palma", "Citalá", "San Ignacio"], "Chalatenango Centro": ["Nueva Concepción", "Tejutla", "La Reina", "Agua Caliente", "Dulce Nombre de María", "El Paraíso", "San Francisco Morazán", "San Rafael", "Santa Rita", "San Fernando"], "Chalatenango Sur": ["Chalatenango", "Arcatao", "Azacualpa", "Comalapa", "Concepción Quezaltepeque", "El Carrizal", "La Laguna", "Las Vueltas", "Nombre de Jesús", "Nueva Trinidad", "Ojos de Agua", "Potonico", "San Antonio de La Cruz", "San Antonio Los Ranchos", "San Francisco Lempa", "San Isidro Labrador", "San José Cancasque", "San Miguel de Mercedes", "San José Las Flores", "San Luis del Carmen"] },
  "Cuscatlán": { "Cuscatlán Norte": ["Suchitoto", "San José Guayabal", "Oratorio de Concepción", "San Bartolomé Perulapán", "San Pedro Perulapán"], "Cuscatlán Sur": ["Cojutepeque", "San Rafael Cedros", "Candelaria", "Monte San Juan", "El Carmen", "San Cristóbal", "Santa Cruz Michapa", "San Ramón", "El Rosario", "Santa Cruz Analquito", "Tenancingo"] },
  "Cabañas": { "Cabañas Este": ["Sensuntepeque", "Victoria", "Dolores", "Guacotecti", "San Isidro"], "Cabañas Oeste": ["llobasco", "Tejutepeque", "Jutiapa", "Cinquera"] },
  "La Paz": { "La Paz Oeste": ["Cuyultitán", "Olocuilta", "San Juan Talpa", "San Luis Talpa", "San Pedro Masahuat", "Tapalhuaca", "San Francisco Chinameca"], "La Paz Centro": ["El Rosario", "Jerusalén", "Mercedes La Ceiba", "Paraíso de Osorio", "San Antonio Masahuat", "San Emigdio", "San Juan Tepezontes", "San Luis La Herradura", "San Miguel Tepezontes", "San Pedro Nonualco", "Santa María Ostuma", "Santiago Nonualco"], "La Paz Este": ["San Juan Nonualco", "San Rafael Obrajuelo", "Zacatecoluca"] },
  "La Unión": { "La Unión Norte": ["Anamorós", "Bolivar", "Concepción de Oriente", "El Sauce", "Lislique", "Nueva Esparta", "Pasaquina", "Polorós", "San José La Fuente", "Santa Rosa de Lima"], "La Unión Sur": ["Conchagua", "El Carmen", "lntipucá", "La Unión", "Meanguera del Golfo", "San Alejo", "Yayantique", "Yucuaiquín"] },
  "Usulután": { "Usulután Norte": ["Santiago de María", "Alegría", "Berlín", "Mercedes Umana", "Jucuapa", "El Triunfo", "Estanzuelas", "San Buenaventura", "Nueva Granada"], "Usulután Este": ["Usulután", "Jucuarán", "San Dionisio", "Concepción Batres", "Santa María", "Ozatlán", "Tecapán", "Santa Elena", "California", "Ereguayquín"], "Usulután Oeste": ["Jiquilisco", "Puerto El Triunfo", "San Agustín", "San Francisco Javier"] },
  "Sonsonate": { "Sonsonate Norte": ["Juayúa", "Nahuizalco", "Salcoatitán", "Santa Catarina Masahuat"], "Sonsonate Centro": ["Sonsonate", "Sonzacate", "Nahulingo", "San Antonio del Monte", "Santo Domingo de Guzmán"], "Sonsonate Este": ["Izalco", "Armenia", "Caluco", "San Julián", "Cuisnahuat", "Santa Isabel lshuatán"], "Sonsonate Oeste": ["Acajutla"] },
  "Santa Ana": { "Santa Ana Norte": ["Masahuat", "Metapán", "Santa Rosa Guachipilín", "Texistepeque"], "Santa Ana Centro": ["Santa Ana"], "Santa Ana Este": ["Coatepeque", "El Congo"], "Santa Ana Oeste": ["Candelaria de la Frontera", "Chalchuapa", "El Porvenir", "San Antonio Pajonal", "San Sebastián Salitrillo", "Santiago de La Frontera"] },
  "San Vicente": { "San Vicente Norte": ["Apastepeque", "Santa Clara", "San Ildefonso", "San Esteban Catarina", "San Sebastián", "San Lorenzo", "Santo Domingo"], "San Vicente Sur": ["San Vicente", "Guadalupe", "Verapaz", "Tepetitán", "Tecoluca", "San Cayetano lstepeque"] },
  "San Miguel": { "San Miguel Norte": ["Ciudad Barrios", "Sesori", "Nuevo Edén de San Juan", "San Gerardo", "San Luis de La Reina", "Carolina", "San Antonio del Mosco", "Chapeltique"], "San Miguel Centro": ["San Miguel", "Comacarán", "Uluazapa", "Moncagua", "Quelepa", "Chirilagua"], "San Miguel Oeste": ["Chinameca", "Nueva Guadalupe", "Lolotique", "San Jorge", "San Rafael Oriente", "El Tránsito"] },
  "Morazán": { "Morazán Norte": ["Arambala", "Cacaopera", "Corinto", "El Rosario", "Joateca", "Jocoaitique", "Meanguera", "Perquín", "San Fernando", "San Isidro", "Torola"], "Morazán Sur": ["Chilanga", "Delicias de Concepción", "El Divisadero", "Gualococti", "Guatajiagua", "Jocoro", "Lolotiquillo", "Osicala", "San Carlos", "San Francisco Gotera", "San Simón", "Sensembra", "Sociedad", "Yamabal", "Yoloaiquín"] }
};

const etiquetasPrecios = { adultos: "Adultos", ninos: "Niños", terceraEdad: "Tercera Edad" };

export default function FormularioEditar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const sesionActiva = JSON.parse(localStorage.getItem('usuarioLogueado')) || {};

  const [cargando, setCargando] = useState(true);
  const [previews, setPreviews] = useState([]); 
  const [coordManual, setCoordManual] = useState({ lat: '', lng: '' });
  const [adminId, setAdminId] = useState(null);
  const [imagenRaw, setImagenRaw] = useState('');
  
  const [extraData, setExtraData] = useState({ fecha: '', personas: 1 });

  // Estados de Control
  const [modoEdicion, setModoEdicion] = useState(false); 
  const [estadoSitio, setEstadoSitio] = useState(''); 
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoAccion, setTipoAccion] = useState(null); 
  const [procesandoSolicitud, setProcesandoSolicitud] = useState(false);

  const horarioBase = {
      lunes: { abierto: false, inicio: '08:00', fin: '17:00' },
      martes: { abierto: false, inicio: '08:00', fin: '17:00' },
      miercoles: { abierto: false, inicio: '08:00', fin: '17:00' },
      jueves: { abierto: false, inicio: '08:00', fin: '17:00' },
      viernes: { abierto: false, inicio: '08:00', fin: '17:00' },
      sabado: { abierto: false, inicio: '08:00', fin: '17:00' },
      domingo: { abierto: false, inicio: '08:00', fin: '17:00' },
  };

  const [formData, setFormData] = useState({
    nombreSitio: '', departamento: '', municipio: '', distrito: '',   
    ubicacion: null, categoria: '', descripcion: '',
    precios: { adultos: '', ninos: '', terceraEdad: '' },
    horarios: horarioBase,
    permisos: { comida: false, bebidasGaseosas: false, bebidasAlcoholicas: false, mascotas: false, mesasSillas: false, hamacas: false, parrillasCocinas: false, armasFuego: false }
  });

  // --- HANDLERS ---
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

  const safeParse = (data) => {
      if (!data || data === "null") return {};
      if (typeof data === 'object') return data;
      try {
          let parsed = JSON.parse(data);
          if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed); } catch (e2) {} }
          return parsed;
      } catch (e) { return {}; }
  };

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const cargarDatos = async () => {
      if (!id || !sesionActiva.idusuario) return;
      try {
        let data = null;
        try {
            const resp = await fetch(`http://100.123.6.123:8000/api/colaborador/publicaciones/detalles/${id}`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ "colaborador_id": sesionActiva.idusuario, "idpublicacion": id })
            });
            if (resp.ok) data = await resp.json();
        } catch (e) { }

        if (!data) {
            const resp = await fetch(`http://100.123.6.123:8000/api/preformularios/detalles/${id}`, { headers: { 'Accept': 'application/json' } });
            if (resp.ok) data = await resp.json();
        }
        
        if (data) {
          // --- AQUÍ GUARDAMOS EL ID DEL ADMIN QUE APROBÓ ---
          if(data.aprobado_por) setAdminId(data.aprobado_por);
          else if (data.idadmin) setAdminId(data.idadmin);
          
          setEstadoSitio(data.estado); 
          if (data.estado === 'inactivo') setModoEdicion(true); 
          else setModoEdicion(false);
          
          setImagenRaw(data.imagen || ''); 
          setExtraData({ 
              fecha: data.fecha || new Date().toISOString().split('T')[0], 
              personas: data.personas || 1 
          });

          const pol = safeParse(data.politicas || data.politicas_obj);
          const det = safeParse(data.detalles);
          const clasif = safeParse(data.clasificacion);
          const horasRaw = safeParse(data.horarios);
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
              try {
                  const cleaned = clasif.replace(/\\"/g, '"');
                  const arr = JSON.parse(cleaned);
                  if (Array.isArray(arr)) catNormalizada = arr[0];
                  else catNormalizada = clasif;
              } catch(e) { catNormalizada = clasif; }
          }
          catNormalizada = catNormalizada ? catNormalizada.charAt(0).toUpperCase() + catNormalizada.slice(1).toLowerCase() : '';

          const mapaPoliticas = {
              comida: pol.traer_comida || pol.TRAER_COMIDA || pol.comida || false,
              bebidasGaseosas: pol.gaseosas_agua || pol.GASEOSAS_AGUA || pol.bebidasGaseosas || false,
              bebidasAlcoholicas: pol.alcohol || pol.ALCOHOL || pol.bebidasAlcoholicas || false,
              mascotas: pol.mascotas || pol.MASCOTAS || false,
              mesasSillas: pol.mesas_sillas || pol.MESAS_SILLAS || pol.mesasSillas || false,
              hamacas: pol.hamacas || pol.HAMACAS || false,
              parrillasCocinas: pol.parrillas_cocinas || pol.PARRILLAS_COCINAS || pol.parrillasCocinas || false,
              armasFuego: pol.armas_de_fuego || pol.ARMAS_DE_FUEGO || pol.armasFuego || false
          };

          setFormData({
            nombreSitio: data.nombre || '',
            departamento: data.departamento || '',
            municipio: data.municipio || '', 
            distrito: data.distrito || '', 
            ubicacion: { lat: parseFloat(data.latitud), lng: parseFloat(data.longitud) },
            categoria: catNormalizada,
            descripcion: data.descripcion || '',
            precios: { 
                adultos: tarifas.adultos || tarifas.ADULTOS || data.costo_entrada || '0.00', 
                ninos: tarifas.ninos || tarifas.NINOS || '0.00', 
                terceraEdad: tarifas.terceraEdad || tarifas.TERCERAEDAD || '0.00' 
            },
            horarios: horariosProcesados,
            permisos: mapaPoliticas
          });

          setCoordManual({ 
              lat: data.latitud ? parseFloat(data.latitud).toFixed(6) : '', 
              lng: data.longitud ? parseFloat(data.longitud).toFixed(6) : '' 
          });

          let imagenesArray = [];
          const loteRaw = safeParse(data.lote_imagenes);
          if (Array.isArray(loteRaw) && loteRaw.length > 0) imagenesArray = loteRaw;
          else if (data.imagen) imagenesArray = [data.imagen];

          if (imagenesArray.length > 0) {
              const urls = imagenesArray.map(img => img.startsWith('http') ? img : `http://100.123.6.123:8000/storage/preformularios/${img}`);
              setPreviews(urls);
          }
        }
      } catch (error) { console.error("Error:", error); } finally { setCargando(false); }
    };
    cargarDatos();
  }, [id, sesionActiva.idusuario]);

  // --- FUNCIÓN DE GUARDADO CORREGIDA ---
  const guardarCambios = async () => {
     if(!window.confirm("¿Confirmar cambios y enviar a revisión del Administrador?")) return;
     
     setProcesandoSolicitud(true);
     try {
         const horariosEnvio = {};
         Object.keys(formData.horarios).forEach(dia => {
             const h = formData.horarios[dia];
             if(h.abierto) horariosEnvio[dia] = `${h.inicio}-${h.fin}`;
         });

         const politicasEnvio = {
             traer_comida: formData.permisos.comida,
             gaseosas_agua: formData.permisos.bebidasGaseosas,
             alcohol: formData.permisos.bebidasAlcoholicas,
             mascotas: formData.permisos.mascotas,
             mesas_sillas: formData.permisos.mesasSillas,
             hamacas: formData.permisos.hamacas,
             parrillas_cocinas: formData.permisos.parrillasCocinas,
             armas_de_fuego: formData.permisos.armasFuego
         };

         const payload = {
             idusuario: sesionActiva.idusuario,
             idpublicacion: id,
             nombre: formData.nombreSitio,
             departamento: formData.departamento,
             municipio: formData.municipio,
             distrito: formData.distrito,
             latitud: formData.ubicacion.lat,
             longitud: formData.ubicacion.lng,
             clasificacion: JSON.stringify([formData.categoria.toUpperCase(), "TURISMO"]),
             politicas: JSON.stringify(politicasEnvio),
             horarios: JSON.stringify(horariosEnvio),
             costo_entrada: formData.precios.adultos || 0,
             descripcion: formData.descripcion,
             detalles: JSON.stringify({ tarifas_desglosadas: formData.precios }),
             imagen: imagenRaw,
             estado: "pendiente", 
             // --- AQUÍ ESTÁ EL CAMBIO CLAVE ---
             // Enviamos el ID del admin para que Julio no pierda la relación
             aprobado_por: adminId, 
             idadmin: adminId,
             // --------------------------------
             tarifas_desglosadas: JSON.stringify(formData.precios),
             fecha: extraData.fecha,
             personas: extraData.personas
         };

         const url = `http://100.123.6.123:8000/api/colaborador/publicaciones/actualizar/${id}`;
         const response = await fetch(url, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
             body: JSON.stringify(payload)
         });

         if (response.ok) {
             alert("¡Actualización enviada a revisión correctamente!");
             navigate("/mis-propuestas");
         } else {
             const errorData = await response.json();
             alert("Error al guardar: " + (errorData.message || JSON.stringify(errorData)));
         }

     } catch (e) { 
         console.error(e);
         alert("Error de conexión al guardar."); 
     } finally { 
         setProcesandoSolicitud(false); 
     }
  };

  const abrirModalSolicitud = (accion) => { setTipoAccion(accion); setModalVisible(true); };
  const confirmarSolicitud = async (comentario) => {
      if (!comentario.trim()) { alert("Ingresa un motivo."); return; }
      setProcesandoSolicitud(true);
      let accionEnviar = tipoAccion.toLowerCase() === 'actualizar' ? 'editar' : tipoAccion.toLowerCase();
      try {
          const payload = {
              "idpublicacion": id,
              "remitente_id": sesionActiva.idusuario,
              "destinatario_id": adminId || "641699ed-c755-43e3-bed8-c698f8096992", 
              "accion": accionEnviar,
              "comentarios": comentario
          };
          const respuesta = await fetch('http://100.123.6.123:8000/api/colaborador/solicitud/enviar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify(payload)
          });
          if (respuesta.ok) {
              alert(`Solicitud enviada.`);
              setModalVisible(false);
              navigate("/mis-propuestas");
          } else { alert("Error al enviar."); }
      } catch (error) { alert("Error de conexión."); } finally { setProcesandoSolicitud(false); }
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center italic font-black text-blue-800 uppercase tracking-widest animate-pulse">Cargando...</div>;

  return (
    <div className="min-h-screen py-12 px-4 flex justify-center items-start bg-slate-100/50 italic text-left">
      <ModalSolicitud visible={modalVisible} tipo={tipoAccion} alCerrar={() => setModalVisible(false)} alConfirmar={confirmarSolicitud} procesando={procesandoSolicitud} />
      
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden text-slate-800 italic">
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
          {/* 01. Datos Generales */}
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

          {/* 02. Ubicación Cartográfica */}
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

          {/* 03. Clasificación y Políticas */}
          <div className="space-y-8">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">03. Clasificación y Políticas</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 italic">
              {['Playa', 'Montaña', 'Pueblo', 'Ciudad', 'Balneario', 'Parque'].map(cat => (
                <button key={cat} onClick={() => toggleCategoria(cat)} disabled={!modoEdicion} className={`flex items-center justify-center p-4 border-2 rounded-2xl font-black text-[10px] uppercase transition-all ${formData.categoria === cat ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-100 text-slate-300 bg-slate-50'} ${modoEdicion && formData.categoria !== cat ? 'hover:border-blue-300 hover:text-blue-400 cursor-pointer' : ''}`}>{cat}</button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { n: 'comida', l: 'Traer comida' }, { n: 'bebidasGaseosas', l: 'Gaseosas / Agua' },
                { n: 'bebidasAlcoholicas', l: 'Alcohol' }, { n: 'mascotas', l: 'Mascotas' },
                { n: 'mesasSillas', l: 'Mesas y sillas' }, { n: 'hamacas', l: 'Hamacas' },
                { n: 'parrillasCocinas', l: 'Parrillas / Cocinas' }, { n: 'armasFuego', l: 'Armas de fuego' }
              ].map(item => (
                <div key={item.n} onClick={() => togglePermiso(item.n)} className={`flex items-center gap-3 p-4 border rounded-2xl transition-all select-none ${formData.permisos[item.n] ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100 opacity-50'} ${modoEdicion ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}`}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.permisos[item.n] ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>{formData.permisos[item.n] && <span className="text-white text-[8px]">✓</span>}</div>
                  <span className="text-[9px] font-black uppercase text-slate-700 italic">{item.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 04. Horarios y Costos */}
          <div className="space-y-6">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">04. Horarios y Costos</h4>
            <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-4">
                {Object.keys(formData.horarios).map((dia) => (
                  <div key={dia} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 gap-4 shadow-sm italic">
                    <div className="flex items-center gap-3 min-w-[120px] cursor-pointer" onClick={() => toggleDiaAbierto(dia)}>
                      <div className={`w-5 h-5 rounded border ${formData.horarios[dia].abierto ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}></div>
                      <span className="text-[11px] font-black uppercase">{dia}</span>
                    </div>
                    {formData.horarios[dia].abierto ? (
                      <div className="flex items-center gap-2 text-slate-500">
                        <input type="time" disabled={!modoEdicion} value={formData.horarios[dia].inicio} onChange={(e) => handleHorarioChange(dia, 'inicio', e.target.value)} className={`text-xs font-bold border rounded px-2 py-1 ${modoEdicion ? 'bg-white border-blue-200' : 'bg-slate-100 border-transparent'}`} />
                        <span className="text-slate-300 font-bold text-[10px]">A</span>
                        <input type="time" disabled={!modoEdicion} value={formData.horarios[dia].fin} onChange={(e) => handleHorarioChange(dia, 'fin', e.target.value)} className={`text-xs font-bold border rounded px-2 py-1 ${modoEdicion ? 'bg-white border-blue-200' : 'bg-slate-100 border-transparent'}`} />
                      </div>
                    ) : <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Cerrado</span>}
                  </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                {['adultos', 'ninos', 'terceraEdad'].map(p => (
                  <div key={p} className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-2 italic">{etiquetasPrecios[p]}</label>
                    <input name={p} readOnly={!modoEdicion} value={formData.precios[p]} onChange={handlePrecioChange} className={`w-full px-4 py-3 rounded-xl border font-bold italic text-xs shadow-inner ${modoEdicion ? 'bg-white border-blue-300 text-slate-700' : 'bg-slate-100 border-slate-100 text-slate-400'}`} />
                  </div>
                ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">05. Descripción</h4>
            <textarea name="descripcion" readOnly={!modoEdicion} value={formData.descripcion} onChange={handleChange} className={`w-full px-5 py-4 rounded-2xl border bg-slate-50 h-32 font-bold italic shadow-sm focus:outline-none resize-none ${modoEdicion ? 'border-blue-300 text-slate-800 focus:bg-white' : 'border-slate-100 text-slate-500'}`} />
          </div>

          <div className="space-y-4">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">06. Fotografía Actual</h4>
            {previews.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previews.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-3xl overflow-hidden shadow-lg border-4 border-white bg-slate-200">
                      <img src={url} className="w-full h-full object-cover" alt="" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  ))}
                </div>
            ) : (
                <div className="p-8 text-center bg-slate-100 rounded-3xl text-slate-400 font-bold uppercase italic text-xs">Sin fotos disponibles</div>
            )}
          </div>

        </div>

        {/* ZONA DE BOTONES */}
        <div className="p-10 bg-slate-50 border-t border-slate-200">
            {!modoEdicion ? (
                <>
                    <p className="text-center text-[9px] text-slate-400 font-bold uppercase mb-6 tracking-widest">
                        {estadoSitio === 'pendiente' 
                            ? 'Este sitio está en revisión por el administrador.' 
                            : 'Para realizar cambios, debes enviar una solicitud.'}
                    </p>
                    <div className="flex gap-4 italic">
                        <button onClick={() => abrirModalSolicitud('eliminar')} className="flex-1 bg-red-100 text-red-600 border border-red-200 font-black py-4 rounded-[2rem] text-[10px] uppercase tracking-widest">Solicitar Eliminar</button>
                        <button onClick={() => abrirModalSolicitud('actualizar')} className="flex-[2] bg-blue-600 text-white font-black py-4 rounded-[2rem] shadow-lg text-[10px] uppercase tracking-widest">Solicitar Actualizar</button>
                    </div>
                </>
            ) : (
                <>
                    <p className="text-center text-[9px] text-green-600 font-bold uppercase mb-6 tracking-widest animate-pulse">¡Permiso concedido! Puedes editar la información ahora.</p>
                    <button onClick={guardarCambios} className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-[2rem] shadow-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
                        <span>💾</span> Guardar Cambios y Enviar
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
}