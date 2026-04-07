import { useEffect, useRef, useState } from "react";

export default function SubirArchivo() {
  const [archivos, setArchivos] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Estados para notificaciones
  const [notificacion, setNotificacion] = useState({ mostrar: false, tipo: "", texto: "" });

  const fileInputRef = useRef(null);
  
  const API = `${import.meta.env.VITE_API_URL}/archivos`;

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para mostrar notificaciones
  const mostrarNotificacion = (tipo, texto) => {
    setNotificacion({ mostrar: true, tipo, texto });
    
    setTimeout(() => {
      setNotificacion({ mostrar: false, tipo: "", texto: "" });
    }, 3000);
  };

  const handleArchivos = (e) => {
    const nuevos = Array.from(e.target.files);
    setArchivos((prev) => [...prev, ...nuevos]);
    e.target.value = null;
    
    if (nuevos.length > 0) {
      mostrarNotificacion("info", `${nuevos.length} archivo(s) seleccionado(s)`);
    }
  };

  const eliminarArchivo = (index) => {
    setArchivos(archivos.filter((_, i) => i !== index));
  };

  const abrirSelectorArchivos = () => {
    fileInputRef.current?.click();
  };

  const subirArchivos = async (e) => {
    e.preventDefault();

    if (!descripcion) {
      mostrarNotificacion("error", "Debe ingresar una descripción");
      return;
    }

    if (archivos.length === 0) {
      mostrarNotificacion("error", "Debe seleccionar al menos un archivo");
      return;
    }

    setCargando(true);
    setMensaje("");

    try {
      const formData = new FormData();
      formData.append("descripcion", descripcion);
      archivos.forEach((a) => formData.append("archivos", a));

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/subir`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarNotificacion("error", data.message || "Error al subir archivos");
        setCargando(false);
        return;
      }

      mostrarNotificacion("exito", `✅ ${archivos.length} archivo(s) subido(s) correctamente`);
      
      setDescripcion("");
      setArchivos([]);
      if (fileInputRef.current) fileInputRef.current.value = null;

      cargarHistorial();

    } catch (error) {
      mostrarNotificacion("error", "Error de conexión con el servidor");
    }

    setCargando(false);
  };

  const cargarHistorial = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/profesor/mis-archivos`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      
      setHistorial(Array.isArray(data) ? data : []);

    } catch {
      setHistorial([]);
    }
  };

  const descargarArchivo = async (archivoId, nombreArchivo) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        mostrarNotificacion("error", "No hay sesión activa. Inicie sesión nuevamente.");
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
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("rol");
          window.location.href = "/";
        }, 2000);
        return;
      }

      if (res.status === 403) {
        mostrarNotificacion("error", "No tiene permiso para descargar este archivo");
        return;
      }

      if (res.status === 404) {
        const errorData = await res.json().catch(() => ({}));
        mostrarNotificacion("error", errorData.message || "Archivo no encontrado");
        return;
      }

      if (!res.ok) {
        mostrarNotificacion("error", "Error al descargar el archivo");
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
      
      mostrarNotificacion("exito", "✅ Archivo descargado correctamente");
      
    } catch (error) {
      console.error("🔥 Error en descarga:", error);
      mostrarNotificacion("error", "Error de conexión al descargar");
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-blue-100 animate-pulse"></div>
          </div>
          <p className="mt-4 text-gray-500 font-medium">Subiendo archivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* NOTIFICACIÓN FLOTANTE MEJORADA */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slideInRight 0.3s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>

      {notificacion.mostrar && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-2xl border-l-4 transition-all duration-500 transform animate-slide-in ${
            notificacion.tipo === "exito"
              ? "bg-gradient-to-r from-green-50 to-green-100 border-green-500 text-green-800"
              : notificacion.tipo === "error"
              ? "bg-gradient-to-r from-red-50 to-red-100 border-red-500 text-red-800"
              : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-500 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              notificacion.tipo === "exito" ? "bg-green-200" :
              notificacion.tipo === "error" ? "bg-red-200" : "bg-blue-200"
            }`}>
              <span className="material-symbols-outlined text-xl">
                {notificacion.tipo === "exito" 
                  ? "check_circle" 
                  : notificacion.tipo === "error" 
                  ? "error" 
                  : "info"}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm">{notificacion.texto}</p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER - Diseño mejorado */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <span className="material-symbols-outlined text-3xl">cloud_upload</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Subir Trabajos</h1>
          </div>
          <p className="text-blue-100 text-lg mt-2 ml-1">
            Comparta sus archivos con una descripción clara y organizada
          </p>
          <div className="mt-4 flex gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">PDF</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">Word</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">Excel</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">PowerPoint</span>
          </div>
        </div>
      </div>

      {/* FORMULARIO - Tarjeta elegante */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
        <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-2xl">description</span>
            <h2 className="text-xl font-bold text-gray-800">Nuevo Trabajo</h2>
          </div>
          <p className="text-gray-500 text-sm mt-1">Complete los campos para subir su trabajo</p>
        </div>

        <form onSubmit={subirArchivos} className="p-8 space-y-6">

          {/* DESCRIPCIÓN */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-base">
              Descripción del trabajo
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
              rows="4"
              placeholder="Ejemplo: Informe de avance del proyecto - Unidad 1"
            />
            <p className="text-gray-400 text-xs mt-2">
              {descripcion.length} caracteres
            </p>
          </div>

          {/* ARCHIVOS - Área de drop mejorada */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-base">
              Archivos
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer group"
              onClick={abrirSelectorArchivos}
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={handleArchivos}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors duration-200">
                  <span className="material-symbols-outlined text-blue-600 text-4xl">cloud_upload</span>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Haga clic para seleccionar archivos</p>
                  <p className="text-gray-400 text-sm mt-1">PDF, Word, Excel y PowerPoint (máx. 10MB)</p>
                </div>
              </div>
            </div>
          </div>

          {/* LISTA ARCHIVOS - Tarjetas individuales */}
          {archivos.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 animate-fadeIn">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">attach_file</span>
                Archivos seleccionados ({archivos.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {archivos.map((archivo, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <span className="material-symbols-outlined text-blue-600 text-lg">insert_drive_file</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 font-medium truncate">{archivo.name}</p>
                        <p className="text-xs text-gray-400">{(archivo.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarArchivo(i)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOTÓN SUBIR */}
          <button
            type="submit"
            disabled={cargando}
            className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
              cargando ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span className="material-symbols-outlined">cloud_upload</span>
            {cargando ? "Subiendo archivos..." : "Subir Archivos"}
          </button>
        </form>
      </div>

      {/* HISTORIAL - Tarjeta mejorada */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-2xl">history</span>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Historial de Archivos</h2>
                <p className="text-gray-500 text-sm mt-1">Documentos subidos anteriormente</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Total: {historial.length} archivo(s)
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Archivo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {historial.map((h, index) => (
                <tr key={h.id} className="hover:bg-blue-50/30 transition-colors duration-200 group animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <span className="material-symbols-outlined text-blue-600 text-lg">description</span>
                      </div>
                      <span className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
                        {h.nombre_original}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-[250px] truncate">{h.descripcion}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-gray-400 text-sm">schedule</span>
                      <span className="text-sm text-gray-500">{new Date(h.fecha_subida).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => descargarArchivo(h.id, h.nombre_original)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105"
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                      Descargar
                    </button>
                  </td>
                </tr>
              ))}

              {historial.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <span className="material-symbols-outlined text-gray-400 text-4xl">inbox</span>
                      </div>
                      <p className="text-gray-500 text-sm">No hay archivos subidos aún</p>
                      <p className="text-gray-400 text-xs">Comience subiendo su primer trabajo</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}