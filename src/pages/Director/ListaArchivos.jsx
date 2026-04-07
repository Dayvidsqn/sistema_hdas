import { useEffect, useState } from "react";

function ListaArchivos() {
  const [archivos, setArchivos] = useState([]);
  const [filtroProfesor, setFiltroProfesor] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [ordenFecha, setOrdenFecha] = useState("desc");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [notificacion, setNotificacion] = useState({ mostrar: false, tipo: "", texto: "" });

  const API = `${import.meta.env.VITE_API_URL}/archivos`;

  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => setArchivos(data))
      .catch((error) => console.error("Error al cargar archivos", error));
  }, []);

  const mostrarNotificacion = (tipo, texto) => {
    setNotificacion({ mostrar: true, tipo, texto });
    setTimeout(() => {
      setNotificacion({ mostrar: false, tipo: "", texto: "" });
    }, 3000);
  };

  const descargarArchivo = async (archivoId, nombreArchivo, nombreServidor) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        mostrarNotificacion("error", "No hay sesión activa. Inicie sesión nuevamente.");
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("rol");
          window.location.href = "/";
        }, 2000);
        return;
      }

      const url = `${API}/descargar/${archivoId}`;
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        mostrarNotificacion("error", "Sesión expirada. Inicie sesión nuevamente.");
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
        return;
      }

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        mostrarNotificacion("error", error.message || "Error al descargar el archivo");
        return;
      }

      const blob = await res.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(urlBlob);
      document.body.removeChild(a);
      
      mostrarNotificacion("exito", `Archivo "${nombreArchivo}" descargado correctamente`);
      
    } catch (error) {
      console.error("Error en descarga:", error);
      mostrarNotificacion("error", "Error de conexión al descargar");
    }
  };

  const archivosFiltrados = archivos
    .filter((a) =>
      filtroProfesor ? a.profesor_nombre === filtroProfesor : true
    )
    .filter((a) =>
      filtroFecha
        ? new Date(a.fecha_subida).toISOString().slice(0, 10) === filtroFecha
        : true
    )
    .sort((a, b) => {
      const fechaA = new Date(a.fecha_subida);
      const fechaB = new Date(b.fecha_subida);
      return ordenFecha === "asc" ? fechaA - fechaB : fechaB - fechaA;
    });

  const profesoresUnicos = [
    ...new Set(archivos.map((a) => a.profesor_nombre)),
  ];

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroProfesor("");
    setFiltroFecha("");
    setOrdenFecha("desc");
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
                    {notificacion.tipo === "exito" ? "¡Descarga completada!" : "Error"}
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

      {/* HEADER - Diseño mejorado */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <span className="material-symbols-outlined text-3xl text-white">folder</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Trabajos Subidos</h1>
              <p className="text-blue-100 text-sm md:text-base mt-1">
                Revise y gestione todos los documentos enviados por los profesores
              </p>
            </div>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <span className="material-symbols-outlined text-white/70 text-sm">inventory_2</span>
              <span className="text-white text-sm">Total: {archivos.length} archivos</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <span className="material-symbols-outlined text-white/70 text-sm">group</span>
              <span className="text-white text-sm">Profesores: {profesoresUnicos.length}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <span className="material-symbols-outlined text-white/70 text-sm">schedule</span>
              <span className="text-white text-sm">
                {archivosFiltrados.length} mostrados
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTROS - Diseño mejorado */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden card-hover">
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">filter_alt</span>
              <h2 className="text-lg font-bold text-gray-800">Filtros de búsqueda</h2>
            </div>
            {(filtroProfesor || filtroFecha || ordenFecha !== "desc") && (
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-base">clear_all</span>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* FILTRAR POR PROFESOR */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <span className="material-symbols-outlined text-base">person</span>
                Profesor
              </label>
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                value={filtroProfesor}
                onChange={(e) => setFiltroProfesor(e.target.value)}
              >
                <option value="">Todos los profesores</option>
                {profesoresUnicos.map((p, i) => (
                  <option key={i} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* FILTRAR POR FECHA */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <span className="material-symbols-outlined text-base">calendar_today</span>
                Fecha específica
              </label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
              />
            </div>

            {/* ORDENAR POR FECHA */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <span className="material-symbols-outlined text-base">sort</span>
                Ordenar por fecha
              </label>
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                value={ordenFecha}
                onChange={(e) => setOrdenFecha(e.target.value)}
              >
                <option value="desc">📅 Más recientes primero</option>
                <option value="asc">📅 Más antiguos primero</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA - Diseño mejorado */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">inventory_2</span>
            <h2 className="text-lg font-bold text-gray-800">Listado de Archivos</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider w-16">ID</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Nombre del Archivo</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Profesor</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider">Fecha de Subida</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider w-32">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {archivosFiltrados.map((archivo, index) => (
                <tr 
                  key={archivo.id}
                  className={`transition-all duration-200 ${hoveredRow === archivo.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                  onMouseEnter={() => setHoveredRow(archivo.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="px-4 py-4 text-sm text-gray-500 font-medium">
                    #{archivo.id}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-600 text-sm">description</span>
                      </div>
                      <span className="font-medium text-gray-800 truncate max-w-[300px]">
                        {archivo.nombre_original}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-indigo-600 text-xs">person</span>
                      </div>
                      <span className="text-gray-700">{archivo.profesor_nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-lg">
                      <span className="material-symbols-outlined text-gray-500 text-sm">schedule</span>
                      <span className="text-sm text-gray-600">
                        {formatearFecha(archivo.fecha_subida)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => descargarArchivo(archivo.id, archivo.nombre_original, archivo.nombre_servidor)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                      Descargar
                    </button>
                  </td>
                </tr>
              ))}

              {archivosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <span className="material-symbols-outlined text-gray-400 text-4xl">folder_empty</span>
                      </div>
                      <p className="text-gray-500 font-medium">No hay archivos con los filtros aplicados</p>
                      <p className="text-gray-400 text-sm">Intente con otros criterios de búsqueda</p>
                      {(filtroProfesor || filtroFecha) && (
                        <button
                          onClick={limpiarFiltros}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
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

        {/* Footer de la tabla */}
        {archivosFiltrados.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <span className="material-symbols-outlined text-sm">analytics</span>
                <span>Mostrando {archivosFiltrados.length} de {archivos.length} archivos</span>
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

export default ListaArchivos;