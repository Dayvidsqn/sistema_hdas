import { useState, useEffect } from "react";

export default function AsignarCursos() {
  const [profesores, setProfesores] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [formData, setFormData] = useState({
    profesor_id: "",
    curso_id: "",
    grado: "",
    seccion: ""
  });

  const [mensaje, setMensaje] = useState("");
  const [notificacion, setNotificacion] = useState({ mostrar: false, tipo: "", texto: "" });
  const [cargando, setCargando] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  const API = `${import.meta.env.VITE_API_URL}`;

  // Grados actualizados
  const grados = ["3 años", "4 años", "5 años", "1ro", "2do", "3ro", "4to", "5to", "6to"];
  
  // Mapeo de grado a sección
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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    cargarProfesores();
    cargarCursos();
    cargarAsignaciones();
  }, []);

  const mostrarNotificacion = (tipo, texto) => {
    setNotificacion({ mostrar: true, tipo, texto });
    setTimeout(() => {
      setNotificacion({ mostrar: false, tipo: "", texto: "" });
    }, 3000);
  };

  const cargarProfesores = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token");
        setProfesores([]);
        return;
      }

      const res = await fetch(`${API}/director/profesores`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        console.error("Error HTTP:", res.status);
        setProfesores([]);
        return;
      }

      const data = await res.json();
      setProfesores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar profesores:", error);
      setProfesores([]);
    }
  };

  const cargarCursos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token");
        setCursos([]);
        return;
      }

      const res = await fetch(`${API}/director/cursos`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        console.error("Error HTTP:", res.status);
        setCursos([]);
        return;
      }

      const data = await res.json();
      setCursos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
      setCursos([]);
    }
  };

  const cargarAsignaciones = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token");
        setAsignaciones([]);
        return;
      }

      const res = await fetch(`${API}/director/asignaciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        console.error("Error HTTP:", res.status);
        setAsignaciones([]);
        return;
      }

      const data = await res.json();
      setAsignaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar asignaciones:", error);
      setAsignaciones([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si cambia el grado, actualizar automáticamente la sección
    if (name === "grado") {
      const nuevaSeccion = getSeccionPorGrado(value);
      setFormData({
        ...formData,
        grado: value,
        seccion: nuevaSeccion
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    if (!formData.profesor_id || !formData.curso_id || !formData.grado || !formData.seccion) {
      mostrarNotificacion("error", "Todos los campos son obligatorios");
      setCargando(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        mostrarNotificacion("error", "No hay sesión activa");
        setCargando(false);
        return;
      }

      const res = await fetch(`${API}/director/asignar-curso`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarNotificacion("error", data.message || "Error al asignar curso");
        setCargando(false);
        return;
      }

      mostrarNotificacion("exito", "✅ Curso asignado correctamente");
      
      setFormData({
        profesor_id: "",
        curso_id: "",
        grado: "",
        seccion: ""
      });

      cargarAsignaciones();

    } catch (error) {
      mostrarNotificacion("error", "Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  const eliminarAsignacion = async (id) => {
    if (!confirm("¿Está seguro de eliminar esta asignación?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        mostrarNotificacion("error", "No hay sesión activa");
        return;
      }

      const res = await fetch(`${API}/director/asignaciones/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        mostrarNotificacion("exito", "✅ Asignación eliminada");
        cargarAsignaciones();
      } else {
        const data = await res.json();
        mostrarNotificacion("error", data.message || "Error al eliminar");
      }
    } catch (error) {
      mostrarNotificacion("error", "Error de conexión");
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      profesor_id: "",
      curso_id: "",
      grado: "",
      seccion: ""
    });
  };

  if (cargando && asignaciones.length === 0) {
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
          <p className="text-gray-600 font-medium text-lg">Cargando datos...</p>
          <p className="text-gray-400 text-sm mt-1">Preparando el sistema de asignación</p>
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

      {/* ENCABEZADO */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <span className="material-symbols-outlined text-3xl text-white">assignment_ind</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Asignar Cursos</h1>
              <p className="text-blue-100 text-sm md:text-base mt-1">
                Asigne cursos a los profesores para cada grado y sección
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <span className="material-symbols-outlined text-white/70 text-sm">group</span>
              <span className="text-white text-sm">Profesores: {profesores.length}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <span className="material-symbols-outlined text-white/70 text-sm">menu_book</span>
              <span className="text-white text-sm">Cursos: {cursos.length}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <span className="material-symbols-outlined text-white/70 text-sm">assignment</span>
              <span className="text-white text-sm">Asignaciones: {asignaciones.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden card-hover">
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">add_circle</span>
            <h2 className="text-lg font-bold text-gray-800">Nueva Asignación</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Selector de Profesor */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <span className="material-symbols-outlined text-base">person</span>
                Profesor *
              </label>
              <select
                name="profesor_id"
                value={formData.profesor_id}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                required
              >
                <option value="">Seleccionar profesor</option>
                {profesores.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombres} {p.apellidos}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Curso */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <span className="material-symbols-outlined text-base">menu_book</span>
                Curso *
              </label>
              <select
                name="curso_id"
                value={formData.curso_id}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                required
              >
                <option value="">Seleccionar curso</option>
                {cursos.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Grado - Con todos los grados actualizados */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <span className="material-symbols-outlined text-base">school</span>
                Grado *
              </label>
              <select
                name="grado"
                value={formData.grado}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                required
              >
                <option value="">Seleccionar grado</option>
                {grados.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Sección - Automática y deshabilitada */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <span className="material-symbols-outlined text-base">group_work</span>
                Sección *
              </label>
              <input
                type="text"
                name="seccion"
                value={formData.seccion}
                readOnly
                disabled
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-100 text-gray-600 cursor-not-allowed transition-all duration-200"
                placeholder={formData.grado ? "Sección asignada automáticamente" : "Primero seleccione un grado"}
              />
              {formData.grado && (
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  Sección asignada automáticamente según el grado
                </p>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={cargando}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Asignando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Asignar Curso</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={limpiarFormulario}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all duration-200"
            >
              <span className="material-symbols-outlined text-base">clear</span>
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* LISTA DE ASIGNACIONES */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">assignment_turned_in</span>
              <h2 className="text-lg font-bold text-gray-800">Asignaciones Actuales</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>Total: {asignaciones.length} asignaciones</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Profesor</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Curso</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Grado</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Sección</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider w-24">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {asignaciones.map((a, index) => (
                <tr 
                  key={a.id}
                  className={`transition-all duration-200 ${hoveredRow === a.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                  onMouseEnter={() => setHoveredRow(a.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-indigo-600 text-sm">person</span>
                      </div>
                      <span className="font-medium text-gray-800">
                        {isMobile 
                          ? `${a.profesor_nombre?.split(' ')[0]} ${a.profesor_apellido?.split(' ')[0]}`
                          : `${a.profesor_nombre} ${a.profesor_apellido}`
                        }
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-600 text-xs">menu_book</span>
                      </div>
                      <span className="text-gray-700">{a.curso_nombre}</span>
                    </div>
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
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => eliminarAsignacion(a.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 text-sm font-medium"
                      title="Eliminar asignación"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                      {!isMobile && <span>Eliminar</span>}
                    </button>
                  </td>
                </tr>
              ))}

              {asignaciones.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <span className="material-symbols-outlined text-gray-400 text-4xl">assignment_late</span>
                      </div>
                      <p className="text-gray-500 font-medium">No hay asignaciones registradas</p>
                      <p className="text-gray-400 text-sm">Utilice el formulario para asignar un curso</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {asignaciones.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <span className="material-symbols-outlined text-sm">analytics</span>
                <span>Total de asignaciones registradas</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  Última actualización: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}