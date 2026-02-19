import React, { useState, useEffect } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom';
import MapaFormulario from './MapaFormulario'; 

// --- BASE DE DATOS TERRITORIAL ---
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

const ModalExito = ({ visible, alCerrar, correo, esEdicion }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-900/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl border border-blue-100 italic">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm font-black">✓</div>
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">
            {esEdicion ? '¡Cambios Guardados!' : '¡Propuesta Enviada!'}
        </h2>
        <p className="text-slate-500 text-[11px] leading-relaxed mb-8 uppercase">
          {esEdicion ? 'Tu destino ha sido actualizado correctamente.' : 'Tu destino ha sido registrado correctamente.'} 
          <span className="block text-blue-600 font-black mt-2 underline decoration-blue-100 underline-offset-4">{correo}</span>
        </p>
        <button onClick={alCerrar} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 text-[10px] uppercase tracking-widest transition-all active:scale-95">
            {esEdicion ? 'VOLVER A MIS PROPUESTAS' : 'VOLVER AL MAPA'}
        </button>
      </div>
    </div>
  );
};

// --- NUEVO MODAL DE CONFIRMACIÓN ELEGANTE ---
const ModalConfirmacion = ({ visible, alCerrar, alConfirmar, cantidadFotos }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 text-center shadow-2xl border border-slate-100 relative">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm font-black">?</div>
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">¿Estás seguro?</h3>
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed mb-6">
          Estás a punto de enviar la información con <span className="text-blue-600 font-black">{cantidadFotos} archivos adjuntos</span>. 
          <br/>Por favor confirma que la información es correcta.
        </p>
        <div className="flex gap-3">
            <button onClick={alCerrar} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-400 font-black py-4 rounded-2xl text-[9px] uppercase tracking-widest transition-all">
                Revisar
            </button>
            <button onClick={alConfirmar} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 text-[9px] uppercase tracking-widest transition-all active:scale-95">
                Sí, Enviar
            </button>
        </div>
      </div>
    </div>
  );
};

export default function FormularioPublicar() {
  const navigate = useNavigate();
  const { id } = useParams();

  const sesionActiva = JSON.parse(localStorage.getItem('usuarioLogueado')) || {
    idusuario: "eec174fd-7093-4efe-82a6-a7828ccf1703", 
    nombre: "Miguel Sanchez",
    correo: "miguelpacas796@gmail.com",
    rol: "Colaborador",
    telefono: "00000000"
  };

  const [correoBD, setCorreoBD] = useState(sesionActiva.correo);
  const [mostrarExito, setMostrarExito] = useState(false); 
  // ESTADO NUEVO PARA EL MODAL DE CONFIRMACIÓN
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false); 
  
  const [archivosFotos, setArchivosFotos] = useState([]); 
  const [previews, setPreviews] = useState([]); 
  const [cargando, setCargando] = useState(false);
  const [coordManual, setCoordManual] = useState({ lat: '', lng: '' });

  const [formData, setFormData] = useState({
    nombreSitio: '', departamento: '', municipio: '', distrito: '',   
    ubicacion: null, categoria: '', descripcion: '',
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

  // Carga de datos para edición (se mantiene igual)
  useEffect(() => {
    const cargarDatosEdicion = async () => {
        if (!id) return; 
        try {
            setCargando(true);
            const res = await fetch(`http://100.123.6.123:8000/api/preformularios/detalles/${id}`);
            if (res.ok) {
                const data = await res.json();
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
                    permisos: {
                        comida: data.politicas_obj.traer_comida,
                        bebidasGaseosas: data.politicas_obj.gaseosas_agua,
                        bebidasAlcoholicas: data.politicas_obj.alcohol,
                        mascotas: data.politicas_obj.mascotas,
                        mesasSillas: data.politicas_obj.mesas_sillas,
                        hamacas: data.politicas_obj.hamacas,
                        parrillasCocinas: data.politicas_obj.parrillas_cocinas,
                        armasFuego: data.politicas_obj.armas_de_fuego
                    }
                });
                setCoordManual({ lat: data.latitud, lng: data.longitud });
                if (data.imagenes) {
                    setPreviews(data.imagenes.map(img => `http://100.123.6.123:8000/storage/preformularios/${img.url_imagen}`));
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
        const respuesta = await fetch(`http://100.123.6.123:8000/api/usuarios/${sesionActiva.idusuario}`);
        if (respuesta.ok) {
          const datos = await respuesta.json();
          if (datos.email) setCorreoBD(datos.email);
        }
      } catch (error) { console.error("Fallo de sincronización con el servidor."); }
    };
    obtenerCorreoOficial();
  }, [sesionActiva.idusuario]);

  // Handlers normales
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

  const generarNombreImagen = (archivo, objetivo, carpeta, loteID, indice) => {
    const hoy = new Date();
    const fechaCodificada = `${String(hoy.getDate()).padStart(2, '0')}${String(hoy.getMonth() + 1).padStart(2, '0')}${hoy.getFullYear()}`;
    const extension = archivo.name.split('.').pop();
    return `0000${fechaCodificada}${objetivo}${carpeta}-${loteID}-${indice}.${extension}`;
  };

  const manejarCambio = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const manejarCheck = (e) => setFormData({ ...formData, permisos: { ...formData.permisos, [e.target.name]: e.target.checked } });
  const manejarPrecio = (e) => setFormData({ ...formData, precios: { ...formData.precios, [e.target.name]: e.target.value } });
  
  const manejarHorario = (dia, campo, valor) => {
    setFormData({ ...formData, horarios: { ...formData.horarios, [dia]: { ...formData.horarios[dia], [campo]: valor } } });
  };

  const manejarArchivos = (e) => {
    const nuevosArchivos = Array.from(e.target.files);
    if (archivosFotos.length + nuevosArchivos.length > 10) return alert("Máximo 10 fotografías.");
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
    const l1 = parseFloat(coordManual.lat), l2 = parseFloat(coordManual.lng);
    if (!isNaN(l1) && !isNaN(l2)) setUbicacion({ lat: l1, lng: l2 });
    else alert("Ingresa coordenadas válidas.");
  };

  // --- PASO 1: ACTIVAR MODAL ---
  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!formData.ubicacion) return alert("Selecciona ubicación en el mapa.");
    if (archivosFotos.length === 0 && previews.length === 0) return alert("Sube al menos una fotografía.");
    
    // Abrimos el modal de confirmación en lugar de enviar directo
    setMostrarConfirmacion(true);
  };

  // --- PASO 2: PROCESO DE ENVÍO REAL (Se ejecuta al confirmar) ---
  const procesarEnvioConfirmado = async () => {
    setMostrarConfirmacion(false); // Cerramos el modal
    setCargando(true);
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

    const politicasJulio = {
      traer_comida: formData.permisos.comida,
      gaseosas_agua: formData.permisos.bebidasGaseosas,
      alcohol: formData.permisos.bebidasAlcoholicas,
      mascotas: formData.permisos.mascotas,
      mesas_sillas: formData.permisos.mesasSillas,
      hamacas: formData.permisos.hamacas,
      parrillas_cocinas: formData.permisos.parrillasCocinas,
      armas_de_fuego: formData.permisos.armasFuego
    };
    data.append('politicas', JSON.stringify(politicasJulio));

    const horariosJulio = {};
    Object.keys(formData.horarios).forEach(dia => {
      if(formData.horarios[dia].abierto) {
        horariosJulio[dia] = `${formData.horarios[dia].inicio}-${formData.horarios[dia].fin}`;
      }
    });
    data.append('horarios', JSON.stringify(horariosJulio));
    data.append('detalles', JSON.stringify({ tarifas_desglosadas: formData.precios }));
    data.append('usuario', sesionActiva.idusuario);

    // --- LÓGICA DE FOTOS POR LOTE ---
    const loteID = generarIDLote(); 

    archivosFotos.forEach((archivo, index) => {
      const nombreCodificado = generarNombreImagen(archivo, "preformulario", "preformularios", loteID, index + 1);
      const archivoBautizado = new File([archivo], nombreCodificado, { type: archivo.type });
      data.append(`imagenes[${index}]`, archivoBautizado);
    });

    try {
      const urlBase = 'http://100.123.6.123:8000/api/preformularios';
      const urlFinal = id ? `${urlBase}/actualizar/${id}` : `${urlBase}/crear`;
      
      const respuesta = await fetch(urlFinal, {
        method: 'POST', 
        headers: { 'Accept': 'application/json' },
        body: data,
      });

      if (respuesta.ok) setMostrarExito(true);
      else {
        const resErr = await respuesta.json();
        throw new Error(resErr.message || "Fallo en validación.");
      }
    } catch (error) {
      console.log("Error: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 flex justify-center items-start bg-slate-100/50 italic text-left">
      <ModalExito 
        visible={mostrarExito} 
        alCerrar={() => navigate(id ? "/mis-propuestas" : "/")} 
        correo={correoBD} 
        esEdicion={!!id} 
      />
      
      {/* MODAL DE CONFIRMACIÓN */}
      <ModalConfirmacion 
        visible={mostrarConfirmacion} 
        alCerrar={() => setMostrarConfirmacion(false)} 
        alConfirmar={procesarEnvioConfirmado} 
        cantidadFotos={archivosFotos.length} 
      />
      
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        <div className="bg-blue-800 p-10 text-white relative z-[50]">
          <h3 className="text-3xl font-black tracking-tight uppercase italic text-center leading-none">
            {id ? 'Editar Destino' : 'Publicar Nuevo Destino'}
          </h3>
          <p className="text-blue-100 text-[10px] mt-3 uppercase font-black tracking-[0.2em] text-center italic">Sesión Activa: {sesionActiva.rol}</p>
          <button onClick={() => navigate(-1)} className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all font-black">✕</button>
        </div>

        {/* NOTA: El onSubmit ahora llama a manejarEnvio, que solo abre el modal */}
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

          <div className="space-y-8">
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">03. Clasificación y Políticas</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Playa', 'Montaña', 'Pueblo', 'Ciudad', 'Balneario', 'Parque'].map(cat => (
                <label key={cat} className={`flex items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all font-bold text-xs ${formData.categoria === cat ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-slate-100 text-slate-500 bg-slate-50 hover:border-slate-300'}`}>
                  <input type="radio" name="categoria" value={cat} checked={formData.categoria === cat} onChange={manejarCambio} className="hidden" required />
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
            <h4 className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">06. Fotografía del Destino (MÁX. 10)</h4>
            <div className="space-y-4">
              {previews.length === 0 ? (
                <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-slate-300 rounded-[2.5rem] cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all group shadow-inner">
                  <div className="bg-blue-100 p-5 rounded-full mb-4 text-blue-600 font-black text-2xl shadow-sm group-hover:scale-110 transition-transform italic">↑</div>
                  <input type="file" accept="image/*" multiple onChange={manejarArchivos} className="hidden" />
                  <p className="mb-1 text-[11px] text-slate-700 font-black uppercase tracking-widest italic">Seleccionar Archivos</p>
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
                    <label className="flex items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all"><input type="file" accept="image/*" multiple onChange={manejarArchivos} className="hidden" /><span className="text-blue-600 font-black">+</span></label>
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
            <button type="button" onClick={() => navigate(-1)} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-200 font-black py-5 rounded-3xl transition-all text-[10px] uppercase tracking-widest italic uppercase">CANCELAR</button>
            <button type="submit" disabled={cargando} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-blue-200 transform active:scale-95 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50 italic">
                {cargando ? 'PROCESANDO...' : (id ? 'GUARDAR CAMBIOS' : 'ENVIAR PROPUESTA')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}