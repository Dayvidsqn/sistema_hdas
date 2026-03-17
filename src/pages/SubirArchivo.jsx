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
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
      setNotificacion({ mostrar: false, tipo: "", texto: "" });
    }, 3000);
  };

  /* ===============================
     MANEJO DE ARCHIVOS
     =============================== */

  const handleArchivos = (e) => {
    const nuevos = Array.from(e.target.files);
    setArchivos((prev) => [...prev, ...nuevos]);
    e.target.value = null;
    
    // Notificación de archivos seleccionados
    if (nuevos.length > 0) {
      mostrarNotificacion("info", `${nuevos.length} archivo(s) seleccionado(s)`);
    }
  };

  const eliminarArchivo = (index) => {
    setArchivos(archivos.filter((_, i) => i !== index));
  };

  // Función para abrir el selector de archivos
  const abrirSelectorArchivos = () => {
    fileInputRef.current?.click();
  };

  /* ===============================
     SUBIR ARCHIVOS
     =============================== */

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

      // ✅ NOTIFICACIÓN DE ÉXITO
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

  /* ===============================
     HISTORIAL
     =============================== */

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

  /* ===============================
    DESCARGAR ARCHIVO
    =============================== */

  const descargarArchivo = async (archivoId, nombreArchivo) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        mostrarNotificacion("error", "No hay sesión activa. Inicie sesión nuevamente.");
        return;
      }

      console.log("🔍 Intentando descargar:", { archivoId, nombreArchivo });

      const url = `${API}/descargar/${archivoId}`;
      console.log("📡 URL completa:", url);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("📊 Status de respuesta:", res.status);

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

      const contentType = res.headers.get("content-type");
      console.log("📁 Content-Type:", contentType);

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
      <div className={`${isMobile ? 'p-4 pt-20' : 'ml-32 p-6'} flex justify-center items-center h-64`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'p-4 pt-5' : ''} ml-32 p-6 space-y-6 md:space-y-10 relative`}>
      
      {/* ============================================ */}
      {/* NOTIFICACIÓN FLOTANTE */}
      {/* ============================================ */}
      {notificacion.mostrar && (
        <div
          className={`fixed top-5 right-5 z-50 p-3 md:p-4 rounded-lg shadow-2xl border-l-4 transition-all duration-500 transform animate-slide-in ${
            notificacion.tipo === "exito"
              ? "bg-green-100 border-green-600 text-green-800"
              : notificacion.tipo === "error"
              ? "bg-red-100 border-red-600 text-red-800"
              : "bg-blue-100 border-blue-600 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-2 md:gap-3">
            <span className="material-symbols-outlined text-xl md:text-2xl">
              {notificacion.tipo === "exito" 
                ? "check_circle" 
                : notificacion.tipo === "error" 
                ? "error" 
                : "info"}
            </span>
            <p className="font-semibold text-sm md:text-base">{notificacion.texto}</p>
          </div>
        </div>
      )}

      {/* HEADER - Responsive */}
      <div className="bg-linear-to-r from-blue-700 to-blue-600 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-10 text-white">
        <h1 className="text-xl md:text-4xl font-bold flex items-center gap-2 md:gap-3">
          <span className="material-symbols-outlined text-2xl md:text-4xl">cloud_upload</span>
          Subir Trabajos
        </h1>
        <p className="mt-1 md:mt-3 text-blue-100 text-sm md:text-lg">
          Cargue archivos con una descripción clara.
        </p>
      </div>

      {/* FORMULARIO - Responsive */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-10 border border-gray-100">
        <form onSubmit={subirArchivos} className="space-y-4 md:space-y-8">

          {/* DESCRIPCIÓN */}
          <div>
            <label className="block mb-1 md:mb-2 font-semibold text-gray-800 text-base md:text-xl">
              Descripción del trabajo
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg md:rounded-xl p-3 md:p-4 focus:ring-2 focus:ring-blue-600 outline-none text-sm md:text-base"
              rows="3"
              placeholder="Ejemplo: Informe de avance del proyecto"
            />
          </div>

          {/* ARCHIVOS */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg md:rounded-xl p-4 md:p-8 text-center hover:bg-gray-50 transition">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={handleArchivos}
              className="hidden"
              id="file-upload"
            />
            <button
              type="button"
              onClick={abrirSelectorArchivos}
              className="bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold shadow hover:bg-blue-700 transition cursor-pointer text-sm md:text-base"
            >
              Seleccionar Archivos
            </button>
            <p className="mt-2 md:mt-3 text-xs md:text-sm text-gray-500">
              PDF, Word, Excel y PowerPoint (máx. 10MB).
            </p>
          </div>

          {/* LISTA ARCHIVOS */}
          {archivos.length > 0 && (
            <div className="bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-5 space-y-2 md:space-y-3 border border-gray-200">
              <h3 className="font-semibold text-gray-700 text-sm md:text-base">
                Archivos seleccionados:
              </h3>

              {archivos.map((archivo, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-white p-2 md:p-3 rounded-lg shadow-sm border"
                >
                  <span className="text-xs md:text-sm text-gray-700 truncate max-w-[150px] md:max-w-none">
                    {archivo.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => eliminarArchivo(i)}
                    className="text-red-600 hover:text-red-800 font-bold text-xs md:text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* BOTÓN SUBIR */}
          <button
            type="submit"
            disabled={cargando}
            className={`bg-blue-700 hover:bg-blue-800 text-white px-6 md:px-10 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold shadow transition text-sm md:text-base ${
              cargando ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {cargando ? "Subiendo..." : "Subir Archivos"}
          </button>

          {mensaje && (
            <p className="font-semibold text-gray-700 text-sm md:text-base">{mensaje}</p>
          )}
        </form>
      </div>

      {/* HISTORIAL - Responsive */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-10 border border-gray-100">
        <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-3 md:mb-6">
          Historial de Archivos
        </h2>

        <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0 rounded-lg md:rounded-xl border border-gray-300">
          <table className="min-w-[800px] md:min-w-full w-full border-collapse">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-2 md:p-4 text-left text-xs md:text-base">Archivo</th>
                <th className="p-2 md:p-4 text-left text-xs md:text-base">Descripción</th>
                <th className="p-2 md:p-4 text-center text-xs md:text-base">Fecha</th>
                <th className="p-2 md:p-4 text-center text-xs md:text-base">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h) => (
                <tr key={h.id} className="border-b hover:bg-blue-50">
                  <td className="p-2 md:p-4 text-xs md:text-base truncate max-w-[150px] md:max-w-none">
                    {h.nombre_original}
                  </td>
                  <td className="p-2 md:p-4 text-xs md:text-base truncate max-w-[150px] md:max-w-none">
                    {h.descripcion}
                  </td>
                  <td className="p-2 md:p-4 text-center text-xs md:text-base whitespace-nowrap">
                    {new Date(h.fecha_subida).toLocaleString()}
                  </td>
                  <td className="p-2 md:p-4 text-center">
                    <button
                      onClick={() => descargarArchivo(h.id, h.nombre_original)}
                      className="bg-green-600 hover:bg-green-700 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1 md:gap-2 mx-auto transition whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-sm md:text-base">download</span>
                      {isMobile ? "Desc" : "Descargar"}
                    </button>
                  </td>
                </tr>
              ))}

              {historial.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 md:p-8 text-center text-gray-500 text-sm md:text-base">
                    Aún no ha subido documentos.
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