import { useEffect, useState } from "react";
import { getAlumnos, crearAlumno, eliminarAlumno, actualizarAlumno } from "../../api/alumnos";
import * as XLSX from 'xlsx';

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [alumnosFiltrados, setAlumnosFiltrados] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    dni: "",
    grado: "",
    seccion: "",
    fecha_nacimiento: "",
    direccion: "",
    telefono: ""
  });

  const [ordenGrado, setOrdenGrado] = useState("asc");
  const [ordenFecha, setOrdenFecha] = useState("desc");
  const [filtroGrado, setFiltroGrado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [notificacion, setNotificacion] = useState({ mostrar: false, tipo: "", texto: "" });
  
  // Estado para el modal de descarga
  const [mostrarModalDescarga, setMostrarModalDescarga] = useState(false);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  
  // Estado para el modal de edición
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [alumnoEditando, setAlumnoEditando] = useState(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const grados = ["3 años", "4 años", "5 años", "1ro", "2do", "3ro", "4to", "5to", "6to"];
  
  const getSeccionPorGrado = (grado) => {
    const mapeo = {
      "3 años": "Happy dolphins",
      "4 años": "Little lions",
      "5 años": "Brave tigers",
      "1ro": "The stars",
      "2do": "The dreamers",
      "3ro": "The explorers",
      "4to": "The thinkers",
      "5to": "The leaders",
      "6to": "The leaders"
    };
    return mapeo[grado] || "";
  };

  const mostrarNotificacion = (tipo, texto) => {
    setNotificacion({ mostrar: true, tipo, texto });
    setTimeout(() => {
      setNotificacion({ mostrar: false, tipo: "", texto: "" });
    }, 3000);
  };

  useEffect(() => {
    cargarAlumnos();
  }, []);

  useEffect(() => {
    aplicarFiltrosYOrden();
  }, [alumnos, ordenGrado, ordenFecha, filtroGrado, busqueda]);

  const cargarAlumnos = async () => {
    const data = await getAlumnos();
    setAlumnos(data || []);
  };

  const aplicarFiltrosYOrden = () => {
    let lista = [...alumnos];

    if (filtroGrado) {
      lista = lista.filter(alumno => alumno.grado === filtroGrado);
    }

    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase().trim();
      lista = lista.filter(alumno => 
        alumno.nombres?.toLowerCase().includes(busquedaLower) ||
        alumno.apellidos?.toLowerCase().includes(busquedaLower) ||
        alumno.dni?.includes(busqueda)
      );
    }

    lista.sort((a, b) => {
      const gradoA = parseInt(a.grado?.replace(/\D/g, '') || 0);
      const gradoB = parseInt(b.grado?.replace(/\D/g, '') || 0);
      
      let comparacionGrado;
      if (ordenGrado === "asc") {
        comparacionGrado = gradoA - gradoB;
      } else {
        comparacionGrado = gradoB - gradoA;
      }
      
      if (comparacionGrado === 0) {
        if (ordenFecha === "desc") {
          return b.id - a.id;
        } else {
          return a.id - b.id;
        }
      }
      
      return comparacionGrado;
    });

    setAlumnosFiltrados(lista);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    const camposMayus = ["nombres", "apellidos"];

    if (name === "grado") {
      const nuevaSeccion = getSeccionPorGrado(value);
      setForm({
        ...form,
        grado: value,
        seccion: nuevaSeccion
      });
    } else {
      setForm({
        ...form,
        [name]: camposMayus.includes(name) ? value.toUpperCase() : value
      });
    }
  };

  const manejarCambioEdicion = (e) => {
    const { name, value } = e.target;
    const camposMayus = ["nombres", "apellidos"];

    if (name === "grado") {
      const nuevaSeccion = getSeccionPorGrado(value);
      setAlumnoEditando({
        ...alumnoEditando,
        grado: value,
        seccion: nuevaSeccion
      });
    } else {
      setAlumnoEditando({
        ...alumnoEditando,
        [name]: camposMayus.includes(name) ? value.toUpperCase() : value
      });
    }
  };

  const registrarAlumno = async (e) => {
    e.preventDefault();

    if (!form.nombres || !form.apellidos || !form.dni) {
      mostrarNotificacion("error", "Los campos nombres, apellidos y DNI son obligatorios.");
      return;
    }

    setCargando(true);

    try {
      await crearAlumno({
        nombres: form.nombres,
        apellidos: form.apellidos,
        dni: form.dni,
        grado: form.grado,
        seccion: form.seccion,
        fecha_nacimiento: form.fecha_nacimiento,
        direccion: form.direccion,
        telefono: form.telefono
      });

      mostrarNotificacion("exito", "Alumno registrado correctamente.");

      setForm({
        nombres: "",
        apellidos: "",
        dni: "",
        grado: "",
        seccion: "",
        fecha_nacimiento: "",
        direccion: "",
        telefono: ""
      });

      cargarAlumnos();
    } catch (error) {
      console.error(error);
      mostrarNotificacion("error", "Error al registrar alumno.");
    }

    setCargando(false);
  };

  const abrirModalEdicion = (alumno) => {
    setAlumnoEditando({ ...alumno });
    setMostrarModalEdicion(true);
  };

  const guardarEdicion = async () => {
    if (!alumnoEditando.nombres || !alumnoEditando.apellidos || !alumnoEditando.dni) {
      mostrarNotificacion("error", "Los campos nombres, apellidos y DNI son obligatorios.");
      return;
    }

    setEditando(true);

    try {
      await actualizarAlumno(alumnoEditando.id, {
        nombres: alumnoEditando.nombres,
        apellidos: alumnoEditando.apellidos,
        dni: alumnoEditando.dni,
        grado: alumnoEditando.grado,
        seccion: alumnoEditando.seccion,
        fecha_nacimiento: alumnoEditando.fecha_nacimiento,
        direccion: alumnoEditando.direccion,
        telefono: alumnoEditando.telefono
      });

      mostrarNotificacion("exito", "Alumno actualizado correctamente.");
      setMostrarModalEdicion(false);
      setAlumnoEditando(null);
      cargarAlumnos();
    } catch (error) {
      console.error(error);
      mostrarNotificacion("error", "Error al actualizar alumno.");
    }

    setEditando(false);
  };

  const borrar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este alumno?")) return;
    await eliminarAlumno(id);
    cargarAlumnos();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const limpiarFiltros = () => {
    setFiltroGrado("");
    setBusqueda("");
  };

  const descargarExcel = () => {
    let alumnosADescargar = [];
    
    if (gradoSeleccionado === "todos") {
      alumnosADescargar = alumnos;
    } else {
      alumnosADescargar = alumnos.filter(alumno => alumno.grado === gradoSeleccionado);
    }

    if (alumnosADescargar.length === 0) {
      mostrarNotificacion("error", `No hay alumnos en el grado seleccionado`);
      setMostrarModalDescarga(false);
      return;
    }

    const datosExcel = alumnosADescargar.map(alumno => ({
      "Nombre": `${alumno.nombres} ${alumno.apellidos}`,
      "DNI": alumno.dni,
      "Grado": alumno.grado,
      "Sección": alumno.seccion,
      "Nacimiento": formatDate(alumno.fecha_nacimiento),
      "Dirección": alumno.direccion || "—",
      "Teléfono": alumno.telefono || "—"
    }));

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const colWidths = [
      { wch: 35 }, // Nombre
      { wch: 12 }, // DNI
      { wch: 10 }, // Grado
      { wch: 15 }, // Sección
      { wch: 12 }, // Nacimiento
      { wch: 30 }, // Dirección
      { wch: 12 }  // Teléfono
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    const tituloHoja = gradoSeleccionado === "todos" 
      ? "Todos los alumnos" 
      : `Alumnos de ${gradoSeleccionado}`;
    XLSX.utils.book_append_sheet(wb, ws, tituloHoja);

    const fechaActual = new Date().toISOString().slice(0, 10);
    const nombreArchivo = gradoSeleccionado === "todos"
      ? `lista_alumnos_${fechaActual}.xlsx`
      : `alumnos_${gradoSeleccionado}_${fechaActual}.xlsx`;

    XLSX.writeFile(wb, nombreArchivo);
    
    mostrarNotificacion("exito", `Archivo Excel generado correctamente con ${alumnosADescargar.length} alumnos`);
    setMostrarModalDescarga(false);
    setGradoSeleccionado("");
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-t-blue-600 border-r-blue-400 border-b-blue-300 border-l-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg animate-bounce shadow-lg"></div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-600 font-medium text-lg">Cargando alumnos...</p>
          <p className="text-gray-400 text-sm mt-1">Preparando la lista de estudiantes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes progress {
          0% { width: 100%; }
          100% { width: 0%; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards;
        }
        .animate-progress {
          animation: progress 3s linear forwards;
        }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      {/* NOTIFICACIÓN FLOTANTE */}
      {notificacion.mostrar && (
        <div className="fixed top-5 right-5 z-50 animate-slideInRight">
          <div className={`relative overflow-hidden rounded-xl shadow-2xl border-l-4 min-w-[280px] max-w-md ${
            notificacion.tipo === "exito"
              ? "bg-gradient-to-r from-green-50 to-green-100 border-green-500"
              : "bg-gradient-to-r from-red-50 to-red-100 border-red-500"
          }`}>
            <div className={`absolute bottom-0 left-0 h-1 ${
              notificacion.tipo === "exito" ? "bg-green-500" : "bg-red-500"
            } animate-progress`}></div>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 p-2 rounded-full ${
                  notificacion.tipo === "exito" ? "bg-green-200" : "bg-red-200"
                }`}>
                  <span className="material-symbols-outlined text-lg">
                    {notificacion.tipo === "exito" ? "check_circle" : "error"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${
                    notificacion.tipo === "exito" ? "text-green-800" : "text-red-800"
                  }`}>
                    {notificacion.tipo === "exito" ? "¡Éxito!" : "Error"}
                  </p>
                  <p className={`text-sm mt-0.5 ${
                    notificacion.tipo === "exito" ? "text-green-700" : "text-red-700"
                  }`}>
                    {notificacion.texto}
                  </p>
                </div>
                <button 
                  onClick={() => setNotificacion({ mostrar: false, tipo: "", texto: "" })}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA SELECCIONAR GRADO (DESCARGA) */}
      {mostrarModalDescarga && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white text-2xl">download</span>
                  <h3 className="text-xl font-bold text-white">Descargar Lista de Alumnos</h3>
                </div>
                <button
                  onClick={() => {
                    setMostrarModalDescarga(false);
                    setGradoSeleccionado("");
                  }}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">Seleccione el grado que desea descargar:</p>
              
              <select
                value={gradoSeleccionado}
                onChange={(e) => setGradoSeleccionado(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white mb-6"
              >
                <option value="">Seleccionar grado</option>
                <option value="todos">Todos los grados</option>
                {grados.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              
              <div className="flex gap-3">
                <button
                  onClick={descargarExcel}
                  disabled={!gradoSeleccionado}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  Descargar Excel
                </button>
                <button
                  onClick={() => {
                    setMostrarModalDescarga(false);
                    setGradoSeleccionado("");
                  }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA EDITAR ALUMNO */}
      {mostrarModalEdicion && alumnoEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white text-2xl">edit</span>
                  <h3 className="text-xl font-bold text-white">Editar Alumno</h3>
                </div>
                <button
                  onClick={() => {
                    setMostrarModalEdicion(false);
                    setAlumnoEditando(null);
                  }}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <span className="material-symbols-outlined text-base">badge</span>
                    Nombres *
                  </label>
                  <input
                    type="text"
                    name="nombres"
                    value={alumnoEditando.nombres || ""}
                    onChange={manejarCambioEdicion}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <span className="material-symbols-outlined text-base">badge</span>
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    value={alumnoEditando.apellidos || ""}
                    onChange={manejarCambioEdicion}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <span className="material-symbols-outlined text-base">badge</span>
                    DNI *
                  </label>
                  <input
                    type="text"
                    name="dni"
                    value={alumnoEditando.dni || ""}
                    onChange={manejarCambioEdicion}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <span className="material-symbols-outlined text-base">school</span>
                    Grado *
                  </label>
                  <select
                    name="grado"
                    value={alumnoEditando.grado || ""}
                    onChange={manejarCambioEdicion}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="">Seleccionar grado</option>
                    {grados.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <span className="material-symbols-outlined text-base">group_work</span>
                    Sección
                  </label>
                  <input
                    type="text"
                    name="seccion"
                    value={alumnoEditando.seccion || ""}
                    readOnly
                    disabled
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-100 text-gray-600 cursor-not-allowed transition-all duration-200"
                  />
                  {alumnoEditando.grado && (
                    <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">auto_awesome</span>
                      Sección asignada automáticamente según el grado
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <span className="material-symbols-outlined text-base">cake</span>
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={alumnoEditando.fecha_nacimiento?.split('T')[0] || ""}
                    onChange={manejarCambioEdicion}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <span className="material-symbols-outlined text-base">home</span>
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={alumnoEditando.direccion || ""}
                    onChange={manejarCambioEdicion}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <span className="material-symbols-outlined text-base">call</span>
                    Teléfono
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    value={alumnoEditando.telefono || ""}
                    onChange={manejarCambioEdicion}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={guardarEdicion}
                  disabled={editando}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">save</span>
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setMostrarModalEdicion(false);
                    setAlumnoEditando(null);
                  }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ENCABEZADO */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <span className="material-symbols-outlined text-3xl text-white">school</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Gestión de Alumnos</h1>
                <p className="text-blue-100 text-sm md:text-base mt-1">
                  Registre nuevos alumnos y administre la lista existente
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setMostrarModalDescarga(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-semibold text-sm transition-all duration-200 border border-white/30"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Descargar lista
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <span className="material-symbols-outlined text-white/70 text-sm">group</span>
              <span className="text-white text-sm">Total: {alumnos.length} alumnos</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <span className="material-symbols-outlined text-white/70 text-sm">menu_book</span>
              <span className="text-white text-sm">Grados: {grados.length}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <span className="material-symbols-outlined text-white/70 text-sm">filter_alt</span>
              <span className="text-white text-sm">{alumnosFiltrados.length} mostrados</span>
            </div>
          </div>
        </div>
      </div>

      {/* FORMULARIO DE REGISTRO */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden card-hover">
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">person_add</span>
            <h2 className="text-lg font-bold text-gray-800">Registrar Alumno</h2>
          </div>
        </div>

        <form onSubmit={registrarAlumno} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <span className="material-symbols-outlined text-base">badge</span>
                Nombres *
              </label>
              <input
                type="text"
                name="nombres"
                value={form.nombres}
                onChange={manejarCambio}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Ej: Juan Carlos"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <span className="material-symbols-outlined text-base">badge</span>
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                value={form.apellidos}
                onChange={manejarCambio}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Ej: Pérez Gómez"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <span className="material-symbols-outlined text-base">badge</span>
                DNI *
              </label>
              <input
                type="text"
                name="dni"
                value={form.dni}
                onChange={manejarCambio}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Ej: 74839201"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <span className="material-symbols-outlined text-base">school</span>
                Grado *
              </label>
              <select
                name="grado"
                value={form.grado}
                onChange={manejarCambio}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                required
              >
                <option value="">Seleccionar grado</option>
                {grados.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <span className="material-symbols-outlined text-base">group_work</span>
                Sección *
              </label>
              <input
                type="text"
                name="seccion"
                value={form.seccion}
                readOnly
                disabled
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-100 text-gray-600 cursor-not-allowed transition-all duration-200"
                placeholder={form.grado ? "Sección asignada automáticamente" : "Primero seleccione un grado"}
              />
              {form.grado && (
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  Sección asignada automáticamente
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <span className="material-symbols-outlined text-base">cake</span>
                Fecha de nacimiento
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={form.fecha_nacimiento}
                onChange={manejarCambio}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <span className="material-symbols-outlined text-base">home</span>
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={manejarCambio}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Ej: Av. Principal 123"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <span className="material-symbols-outlined text-base">call</span>
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={manejarCambio}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Ej: 987654321"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={cargando}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">save</span>
                    <span>Registrar Alumno</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* LISTA CON FILTROS */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">group</span>
              <h2 className="text-lg font-bold text-gray-800">Lista de Alumnos</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>Total: {alumnos.length} alumnos registrados</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex-1">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-symbols-outlined text-gray-400 text-xl">search</span>
                </span>
                <input
                  type="text"
                  id="buscador-alumnos"
                  name="buscador"
                  placeholder="Buscar por nombre, apellido o DNI..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <select
                value={filtroGrado}
                onChange={(e) => setFiltroGrado(e.target.value)}
                className="w-full py-2.5 px-4 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Todos los grados</option>
                {grados.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {(filtroGrado || busqueda) && (
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">clear_all</span>
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-600">Ordenar por grado:</label>
              <select
                value={ordenGrado}
                onChange={(e) => setOrdenGrado(e.target.value)}
                className="border border-gray-200 rounded-lg p-2 bg-white text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">Menor a Mayor</option>
                <option value="desc">Mayor a Menor</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-600">Ordenar por fecha:</label>
              <select
                value={ordenFecha}
                onChange={(e) => setOrdenFecha(e.target.value)}
                className="border border-gray-200 rounded-lg p-2 bg-white text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Más recientes</option>
                <option value="asc">Más antiguos</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider w-16">ID</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">DNI</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Grado</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Sección</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Nacimiento</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Dirección</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Teléfono</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider w-32">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alumnosFiltrados.map((a, index) => (
                  <tr 
                    key={a.id}
                    className={`transition-all duration-200 ${hoveredRow === a.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                    onMouseEnter={() => setHoveredRow(a.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-4 py-4 text-sm text-gray-500 font-medium">#{a.id}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-blue-600 text-sm">person</span>
                        </div>
                        <span className="font-medium text-gray-800">
                          {isMobile 
                            ? `${a.nombres?.split(' ')[0]} ${a.apellidos?.split(' ')[0]}`
                            : `${a.nombres} ${a.apellidos}`
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-lg text-sm font-mono">
                        {a.dni}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                        {a.grado}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                        {a.seccion}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(a.fecha_nacimiento)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 truncate max-w-[150px] hidden md:table-cell">
                      {a.direccion || "—"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">
                      {a.telefono || "—"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirModalEdicion(a)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 text-sm font-medium"
                          title="Editar alumno"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                          {!isMobile && "Editar"}
                        </button>
                        <button
                          onClick={() => borrar(a.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 text-sm font-medium"
                          title="Eliminar alumno"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                          {!isMobile && "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {alumnosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <span className="material-symbols-outlined text-gray-400 text-4xl">person_off</span>
                        </div>
                        <p className="text-gray-500 font-medium">
                          {busqueda || filtroGrado ? "No se encontraron alumnos con los filtros aplicados" : "No hay alumnos registrados"}
                        </p>
                        {(busqueda || filtroGrado) && (
                          <button
                            onClick={limpiarFiltros}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">clear_all</span>
                            Limpiar filtros
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
            <span>Mostrando {alumnosFiltrados.length} de {alumnos.length} alumnos</span>
            <span>Última actualización: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}