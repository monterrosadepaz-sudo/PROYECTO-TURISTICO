import React, { useState, useEffect } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom'; 
import MapaFormulario from './MapaFormulario'; 

// --- BASE DE DATOS TERRITORIAL ---
const divisionTerritorial = {
 /* ==========================================
  "Ahuachapán": {
    "Ahuachapán Norte": ["Atiquizaya", "El Refugio", "San Lorenzo", "Turín"],
    "Ahuachapán Centro": ["Ahuachapán", "Apaneca", "Concepción de Ataco", "Tacuba"],
    "Ahuachapán Sur": ["Guaymango", "Jujutla", "San Francisco Menendez", "San Pedro Puxtla"]
  },
  "San Salvador": {
    "San Salvador Norte": ["Aguilares", "El Paisnal", "Guazapa"],
    "San Salvador Oeste": ["Apopa", "Nejapa"],
    "San Salvador Este": ["llopango", "San Martín", "Soyapango", "Tonacatepeque"],
    "San Salvador Centro": ["Ayutuxtepeque", "Mejicanos", "San Salvador", "Cuscatancingo", "Ciudad Delgado"],
    "San Salvador Sur": ["Panchimalco", "Rosario de Mora", "San Marcos", "Santo Tomás", "Santiago Texacuangos"]
  },
  "La Libertad": {
    "La Libertad Norte": ["Quezaltepeque", "San Matías", "San Pablo Tacachico"],
    "La Libertad Centro": ["San Juan Opico", "Ciudad Arce"],
    "La Libertad Oeste": ["Colón", "Jayaque", "Sacacoyo", "Tepecoyo", "Talnique"],
    "La Libertad Este": ["Antiguo Cuscatlán", "Huizucar", "Nuevo Cuscatlán", "San José Villanueva", "Zaragoza"],
    "La Libertad Costa": ["Chiltuipán", "Jicalapa", "La Libertad", "Tamanique", "Teotepeque"],
    "La Libertad Sur": ["Comasagua", "Santa Tecla"]
  },
  "Chalatenango": {
    "Chalatenango Norte": ["La Palma", "Citalá", "San Ignacio"],
    "Chalatenango Centro": ["Nueva Concepción", "Tejutla", "La Reina", "Agua Caliente", "Dulce Nombre de María", "El Paraíso", "San Francisco Morazán", "San Rafael", "Santa Rita", "San Fernando"],
    "Chalatenango Sur": ["Chalatenango", "Arcatao", "Azacualpa", "Comalapa", "Concepción Quezaltepeque", "El Carrizal", "La Laguna", "Las Vueltas", "Nombre de Jesús", "Nueva Trinidad", "Ojos de Agua", "Potonico", "San Antonio de La Cruz", "San Antonio Los Ranchos", "San Francisco Lempa", "San Isidro Labrador", "San José Cancasque", "San Miguel de Mercedes", "San José Las Flores", "San Luis del Carmen"]
  },
  "Cuscatlán": {
    "Cuscatlán Norte": ["Suchitoto", "San José Guayabal", "Oratorio de Concepción", "San Bartolomé Perulapán", "San Pedro Perulapán"],
    "Cuscatlán Sur": ["Cojutepeque", "San Rafael Cedros", "Candelaria", "Monte San Juan", "El Carmen", "San Cristóbal", "Santa Cruz Michapa", "San Ramón", "El Rosario", "Santa Cruz Analquito", "Tenancingo"]
  },
  "Cabañas": {
    "Cabañas Este": ["Sensuntepeque", "Victoria", "Dolores", "Guacotecti", "San Isidro"],
    "Cabañas Oeste": ["llobasco", "Tejutepeque", "Jutiapa", "Cinquera"]
  },
  ========================================== */
  "La Paz": {
    "La Paz Oeste": ["Cuyultitán", "Olocuilta", "San Juan Talpa", "San Luis Talpa", "San Pedro Masahuat", "Tapalhuaca", "San Francisco Chinameca"],
    "La Paz Centro": ["El Rosario", "Jerusalén", "Mercedes La Ceiba", "Paraíso de Osorio", "San Antonio Masahuat", "San Emigdio", "San Juan Tepezontes", "San Luis La Herradura", "San Miguel Tepezontes", "San Pedro Nonualco", "Santa María Ostuma", "Santiago Nonualco"],
    "La Paz Este": ["San Juan Nonualco", "San Rafael Obrajuelo", "Zacatecoluca"]
  
  },
  /* ==========================================
  "La Unión": {
    "La Unión Norte": ["Anamorós", "Bolivar", "Concepción de Oriente", "El Sauce", "Lislique", "Nueva Esparta", "Pasaquina", "Polorós", "San José La Fuente", "Santa Rosa de Lima"],
    "La Unión Sur": ["Conchagua", "El Carmen", "lntipucá", "La Unión", "Meanguera del Golfo", "San Alejo", "Yayantique", "Yucuaiquín"]
  },
  "Usulután": {
    "Usulután Norte": ["Santiago de María", "Alegría", "Berlín", "Mercedes Umana", "Jucuapa", "El Triunfo", "Estanzuelas", "San Buenaventura", "Nueva Granada"],
    "Usulután Este": ["Usulután", "Jucuarán", "San Dionisio", "Concepción Batres", "Santa María", "Ozatlán", "Tecapán", "Santa Elena", "California", "Ereguayquín"],
    "Usulután Oeste": ["Jiquilisco", "Puerto El Triunfo", "San Agustín", "San Francisco Javier"]
  },
  "Sonsonate": {
    "Sonsonate Norte": ["Juayúa", "Nahuizalco", "Salcoatitán", "Santa Catarina Masahuat"],
    "Sonsonate Centro": ["Sonsonate", "Sonzacate", "Nahulingo", "San Antonio del Monte", "Santo Domingo de Guzmán"],
    "Sonsonate Este": ["Izalco", "Armenia", "Caluco", "San Julián", "Cuisnahuat", "Santa Isabel lshuatán"],
    "Sonsonate Oeste": ["Acajutla"]
  },
  "Santa Ana": {
    "Santa Ana Norte": ["Masahuat", "Metapán", "Santa Rosa Guachipilín", "Texistepeque"],
    "Santa Ana Centro": ["Santa Ana"],
    "Santa Ana Este": ["Coatepeque", "El Congo"],
    "Santa Ana Oeste": ["Candelaria de la Frontera", "Chalchuapa", "El Porvenir", "San Antonio Pajonal", "San Sebastián Salitrillo", "Santiago de La Frontera"]
  },
  "San Vicente": {
    "San Vicente Norte": ["Apastepeque", "Santa Clara", "San Ildefonso", "San Esteban Catarina", "San Sebastián", "San Lorenzo", "Santo Domingo"],
    "San Vicente Sur": ["San Vicente", "Guadalupe", "Verapaz", "Tepetitán", "Tecoluca", "San Cayetano lstepeque"]
  },
  "San Miguel": {
    "San Miguel Norte": ["Ciudad Barrios", "Sesori", "Nuevo Edén de San Juan", "San Gerardo", "San Luis de La Reina", "Carolina", "San Antonio del Mosco", "Chapeltique"],
    "San Miguel Centro": ["San Miguel", "Comacarán", "Uluazapa", "Moncagua", "Quelepa", "Chirilagua"],
    "San Miguel Oeste": ["Chinameca", "Nueva Guadalupe", "Lolotique", "San Jorge", "San Rafael Oriente", "El Tránsito"]
  },
  "Morazán": {
    "Morazán Norte": ["Arambala", "Cacaopera", "Corinto", "El Rosario", "Joateca", "Jocoaitique", "Meanguera", "Perquín", "San Fernando", "San Isidro", "Torola"],
    "Morazán Sur": ["Chilanga", "Delicias de Concepción", "El Divisadero", "Gualococti", "Guatajiagua", "Jocoro", "Lolotiquillo", "Osicala", "San Carlos", "San Francisco Gotera", "San Simón", "Sensembra", "Sociedad", "Yamabal", "Yoloaiquín"]
  }
    ========================================== */
};

// --- MODAL DE SOLICITUD (NUEVO) ---
const ModalSolicitud = ({ visible, tipo, alCerrar, alConfirmar, procesando }) => {
  const [comentario, setComentario] = useState("");

  if (!visible) return null;

  const esEliminar = tipo === 'eliminar';
  const titulo = esEliminar ? "Solicitar Eliminar Sitio" : "Solicitar Actualizar Sitio";
  const mensaje = esEliminar 
    ? "¿Estás seguro de solicitar eliminar el sitio? Esta acción pedirá borrar permanentemente este lugar."
    : "¿Deseas solicitar una actualización para este sitio? Esto notificará al administrador para revisar los cambios.";
  const colorBoton = esEliminar ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 italic relative">
        <button onClick={alCerrar} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 font-black">✕</button>
        
        <h2 className={`text-2xl font-black uppercase tracking-tighter mb-4 italic ${esEliminar ? 'text-red-600' : 'text-blue-800'}`}>
            {titulo}
        </h2>
        
        <p className="text-slate-500 text-xs font-bold mb-6 leading-relaxed uppercase">
          {mensaje}
        </p>

        <div className="space-y-2 mb-6">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">
                Motivo / Comentario
            </label>
            <textarea 
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none h-24 text-slate-700 font-bold italic text-xs shadow-inner resize-none"
                placeholder="Escribe aquí por qué deseas realizar esta acción..."
            />
        </div>

        <div className="flex gap-3">
            <button onClick={alCerrar} className="flex-1 bg-slate-100 text-slate-400 font-black py-4 rounded-2xl text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                Cancelar
            </button>
            <button 
                onClick={() => alConfirmar(comentario)} 
                disabled={procesando}
                className={`flex-[1.5] ${colorBoton} text-white font-black py-4 rounded-2xl shadow-lg text-[9px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50`}
            >
                {procesando ? 'Enviando...' : 'Confirmar Solicitud'}
            </button>
        </div>
      </div>
    </div>
  );
};

const etiquetasPrecios = {
    adultos: "Adultos",
    ninos: "Niños",
    terceraEdad: "Tercera Edad"
};

export default function FormularioEditar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const sesionActiva = JSON.parse(localStorage.getItem('usuarioLogueado')) || {};

  // Estados de control
  const [cargando, setCargando] = useState(true);
  const [previews, setPreviews] = useState([]); 
  
  // Estados para inputs (SOLO LECTURA)
  const [coordManual, setCoordManual] = useState({ lat: '', lng: '' });
  const [adminId, setAdminId] = useState(null); // ID del admin que aprobó

  // Estados para el Modal de Solicitud
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoAccion, setTipoAccion] = useState(null); // 'actualizar' o 'eliminar'
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
    permisos: {
      comida: false, bebidasGaseosas: false, bebidasAlcoholicas: false,
      mascotas: false, mesasSillas: false, hamacas: false,
      parrillasCocinas: false, armasFuego: false
    }
  });

  const safeParse = (data) => {
      if (!data || data === "null") return {};
      if (typeof data === 'object') return data;
      try {
          const parsed = JSON.parse(data);
          if (typeof parsed === 'string') return JSON.parse(parsed);
          return parsed;
      } catch (e) {
          return {};
      }
  };

  // --- CARGA DE DATOS (VISUALIZACIÓN) ---
  useEffect(() => {
    const cargarDatosRonald = async () => {
      if (!id || !sesionActiva.idusuario) return;

      try {
        let data = null;
        // Solo intentamos cargar datos oficiales o borradores para mostrar
        try {
            const urlOficial = `http://100.123.6.123:8000/api/colaborador/publicaciones/detalles/${id}`;
            const respOficial = await fetch(urlOficial, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ "colaborador_id": sesionActiva.idusuario, "idpublicacion": id })
            });
            if (respOficial.ok) data = await respOficial.json();
        } catch (e) { }

        if (!data) {
            const urlBorrador = `http://100.123.6.123:8000/api/colaborador/preformularios/${id}`;
            const respBorrador = await fetch(urlBorrador, {
              method: 'POST', 
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({ "colaborador_id": sesionActiva.idusuario, "idpreformulario": id })
            });
            if (respBorrador.ok) data = await respBorrador.json();
        }
        
        if (data) {
          if(data.aprobado_por) setAdminId(data.aprobado_por);

          const pol = safeParse(data.politicas);
          const det = safeParse(data.detalles);
          const clasif = safeParse(data.clasificacion);
          const horasRaw = safeParse(data.horarios);

          const horariosProcesados = { ...horarioBase };
          if (horasRaw && typeof horasRaw === 'object') {
              Object.keys(horasRaw).forEach(dia => {
                  if (horariosProcesados[dia] && horasRaw[dia] && horasRaw[dia].includes('-')) {
                      const [inicio, fin] = horasRaw[dia].split('-');
                      horariosProcesados[dia] = { abierto: true, inicio, fin };
                  }
              });
          }

          let catNormalizada = '';
          if (Array.isArray(clasif) && clasif.length > 0) {
              const rawCat = clasif[0].toLowerCase();
              catNormalizada = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
          } else if (typeof clasif === 'string') {
              const rawCat = clasif.toLowerCase();
              catNormalizada = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
          }

          const tarifas = det.tarifas_desglosadas || {};
          
          setFormData({
            nombreSitio: data.nombre || '',
            departamento: data.departamento || '',
            municipio: data.municipio || '',
            distrito: data.distrito || '',
            ubicacion: { lat: parseFloat(data.latitud), lng: parseFloat(data.longitud) },
            categoria: catNormalizada,
            descripcion: data.descripcion || '',
            precios: { 
              adultos: tarifas.adultos || data.costo_entrada || '0.00', 
              ninos: tarifas.ninos || '0.00', 
              terceraEdad: tarifas.terceraEdad || '0.00' 
            },
            horarios: horariosProcesados,
            permisos: {
              comida: pol.traer_comida || false,
              bebidasGaseosas: pol.gaseosas_agua || false,
              bebidasAlcoholicas: pol.alcohol || false,
              mascotas: pol.mascotas || false,
              mesasSillas: pol.mesas_sillas || false,
              hamacas: pol.hamacas || false,
              parrillasCocinas: pol.parrillas_cocinas || false,
              armasFuego: pol.armas_de_fuego || false
            }
          });

          setCoordManual({ 
              lat: data.latitud ? parseFloat(data.latitud).toFixed(6) : '', 
              lng: data.longitud ? parseFloat(data.longitud).toFixed(6) : '' 
          });

          if (data.imagen) {
            setPreviews([`http://100.123.6.123:8000/storage/preformularios/${data.imagen}`]);
          }
        }
      } catch (error) {
        console.error("Fallo crítico:", error);
      } finally {
        setCargando(false);
      }
    };
    
    cargarDatosRonald();
  }, [id, sesionActiva.idusuario]);

  // --- LOGICA DE BOTONES DE SOLICITUD ---
  const abrirModalSolicitud = (accion) => {
      setTipoAccion(accion); // 'actualizar' o 'eliminar'
      setModalVisible(true);
  };

  const confirmarSolicitud = async (comentarioUsuario) => {
      if (!comentarioUsuario.trim()) {
          alert("Por favor, ingresa un motivo para la solicitud.");
          return;
      }

      setProcesandoSolicitud(true);

      // AQUÍ OCURRE LA MAGIA QUE PEDISTE:
      // Enviamos el JSON específico para obtener el ID del Admin que aprobó
      try {
          // Nota: El endpoint exacto para *enviar* la solicitud no lo tenemos, 
          // pero aquí replicamos el payload que dijiste que devuelve el admin.
          // Podrías usar este admin_id recuperado para mandar una notificación.
          
          const payloadVerificacion = {
              "colaborador_id": sesionActiva.idusuario,
              "idpublicacion": id
          };

          console.log("Enviando payload de solicitud:", payloadVerificacion);
          console.log("Comentario del usuario:", comentarioUsuario);
          console.log("Acción solicitada:", tipoAccion);

          // Simulamos la espera de la red
          await new Promise(resolve => setTimeout(resolve, 1500));

          // ALERTA DE ÉXITO (Simulada, ya que falta el endpoint real de "Crear Solicitud")
          alert(`¡Solicitud enviada a Julio!\n\nAcción: ${tipoAccion.toUpperCase()}\nComentario: "${comentarioUsuario}"\nPayload Admin: Listo para enviar.`);
          
          setModalVisible(false);
          navigate("/mis-propuestas");

      } catch (error) {
          alert("Error al procesar la solicitud.");
      } finally {
          setProcesandoSolicitud(false);
      }
  };

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center italic font-black text-blue-800 uppercase tracking-widest animate-pulse">
        Cargando información del destino...
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4 flex justify-center items-start bg-slate-100/50 italic text-left">
      
      {/* MODAL NUEVO */}
      <ModalSolicitud 
        visible={modalVisible} 
        tipo={tipoAccion} 
        alCerrar={() => setModalVisible(false)} 
        alConfirmar={confirmarSolicitud}
        procesando={procesandoSolicitud}
      />

      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden text-slate-800 italic">
        <div className="bg-blue-800 p-10 text-white relative z-[50]">
          <h3 className="text-3xl font-black uppercase italic text-center leading-none tracking-tighter">Detalles del Destino</h3>
          <p className="text-blue-100 text-[10px] mt-3 uppercase font-black tracking-[0.2em] text-center italic tracking-widest">
             MODO VISUALIZACIÓN - NO EDITABLE
          </p>
          <button onClick={() => navigate(-1)} className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all font-black">✕</button>
        </div>

        {/* FORMULARIO BLOQUEADO (READONLY) */}
        <div className="p-10 space-y-12 pointer-events-none select-none grayscale-[0.1] opacity-90">
          
          {/* 01. Datos Generales */}
          <div className="space-y-6">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">01. Datos Generales</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1 md:col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Nombre del Destino</label>
                <input readOnly value={formData.nombreSitio} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 font-bold italic shadow-sm focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Departamento</label>
                <input readOnly value={formData.departamento} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 font-bold italic shadow-sm focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Municipio</label>
                <input readOnly value={formData.municipio} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 font-bold italic shadow-sm focus:outline-none" />
              </div>
            </div>
          </div>

          {/* 02. Ubicación */}
          <div className="space-y-6">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">02. Ubicación Cartográfica</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-inner italic">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-slate-400 ml-2 italic">Latitud</label>
                  <input readOnly value={coordManual.lat} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[10px] font-black outline-none bg-white text-slate-500 italic" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-slate-400 ml-2 italic">Longitud</label>
                  <input readOnly value={coordManual.lng} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[10px] font-black outline-none bg-white text-slate-500 italic" />
                </div>
            </div>
            <div className="rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl h-80 relative z-0 opacity-80">
                <MapaFormulario ubicacionActual={formData.ubicacion} />
            </div>
          </div>

          {/* 03. Clasificación */}
          <div className="space-y-8">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">03. Clasificación y Políticas</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 italic">
              {['Playa', 'Montaña', 'Pueblo', 'Ciudad', 'Balneario', 'Parque'].map(cat => (
                <div key={cat} className={`flex items-center justify-center p-4 border-2 rounded-2xl font-black text-[10px] uppercase ${formData.categoria === cat ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-100 text-slate-300 bg-slate-50'}`}>
                  {cat}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { n: 'comida', l: 'Traer comida' }, { n: 'bebidasGaseosas', l: 'Gaseosas / Agua' },
                { n: 'bebidasAlcoholicas', l: 'Alcohol' }, { n: 'mascotas', l: 'Mascotas' },
                { n: 'mesasSillas', l: 'Mesas y sillas' }, { n: 'hamacas', l: 'Hamacas' },
                { n: 'parrillasCocinas', l: 'Parrillas / Cocinas' }, { n: 'armasFuego', l: 'Armas de fuego' }
              ].map(item => (
                <div key={item.n} className={`flex items-center gap-3 p-4 border rounded-2xl ${formData.permisos[item.n] ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                  <div className={`w-5 h-5 rounded border ${formData.permisos[item.n] ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}></div>
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
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <div className={`w-5 h-5 rounded border ${formData.horarios[dia].abierto ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}></div>
                      <span className="text-[11px] font-black uppercase">{dia}</span>
                    </div>
                    {formData.horarios[dia].abierto ? (
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="text-xs font-bold">{formData.horarios[dia].inicio}</span>
                        <span className="text-slate-300 font-bold text-[10px]">A</span>
                        <span className="text-xs font-bold">{formData.horarios[dia].fin}</span>
                      </div>
                    ) : <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Cerrado</span>}
                  </div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                {['adultos', 'ninos', 'terceraEdad'].map(p => (
                  <div key={p} className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-2 italic">{etiquetasPrecios[p]}</label>
                    <input readOnly value={formData.precios[p]} className="w-full px-4 py-3 rounded-xl border border-slate-100 font-bold italic text-xs shadow-inner bg-white text-slate-500" />
                  </div>
                ))}
            </div>
          </div>

          {/* 05. Descripción */}
          <div className="space-y-4">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">05. Descripción del lugar</h4>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest block italic">Actividades y servicios</label>
              <textarea readOnly value={formData.descripcion} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 h-32 text-slate-500 font-bold italic shadow-sm focus:outline-none resize-none" />
            </div>
          </div>

          {/* 06. Foto */}
          <div className="space-y-4">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">06. Fotografía Actual</h4>
            <div className="grid grid-cols-1">
              {previews.map((url, index) => (
                <div key={index} className="relative h-64 w-full">
                  <img src={url} className="w-full h-full object-cover rounded-3xl border-2 border-white shadow-xl" alt="" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- NUEVA ZONA DE BOTONES DE ACCIÓN (FUERA DEL BLOQUEO) --- */}
        <div className="p-10 bg-slate-50 border-t border-slate-200">
            <p className="text-center text-[9px] text-slate-400 font-bold uppercase mb-6 tracking-widest">
                Para realizar cambios, debes enviar una solicitud al administrador
            </p>
            <div className="flex flex-col sm:flex-row gap-4 italic">
                <button 
                    onClick={() => abrirModalSolicitud('eliminar')} 
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 font-black py-6 rounded-[2rem] text-[10px] uppercase tracking-widest transition-all active:scale-95"
                >
                    Solicitar Eliminar Sitio
                </button>
                <button 
                    onClick={() => abrirModalSolicitud('actualizar')} 
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-200 transform active:scale-95 transition-all text-[10px] uppercase tracking-widest"
                >
                    Solicitar Actualizar Sitio
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}