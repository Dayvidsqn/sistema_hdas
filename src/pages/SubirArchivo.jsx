import { useEffect, useRef, useState } from "react";

export default function SubirArchivo() {
  const [archivos, setArchivos] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);
  
  // Estados para notificaciones
  const [notificacion, setNotificacion] = useState({ mostrar: false, tipo: "", texto: "" });

  const fileInputRef = useRef(null);
  
  const API = `${import.meta.env.VITE_API_URL}/archivos`;

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
     DESCARGAR ARCHIVO (CORREGIDO)
     =============================== */

/* ===============================
   DESCARGAR ARCHIVO (CORREGIDO)
   =============================== */

  const descargarArchivo = async (archivoId, nombreArchivo) => {
    try {
      const token = localStorage.getItem("token");
      
      // VERIFICACIÓN 1: ¿Existe el token?
      if (!token) {
        mostrarNotificacion("error", "No hay sesión activa. Inicie sesión nuevamente.");
        return;
      }

      console.log("Token encontrado, intentando descargar:", { archivoId, nombreArchivo });

      // VERIFICACIÓN 2: Asegurar el formato correcto del header
      const res = await fetch(`${API}/descargar/${archivoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,  // ¡Importante! Debe ser exactamente así
          'Content-Type': 'application/json'
        }
      });

      console.log("Respuesta del servidor - Status:", res.status);

      // VERIFICACIÓN 3: Manejar diferentes códigos de respuesta
      if (res.status === 401) {
        mostrarNotificacion("error", "Su sesión ha expirado. Por favor, inicie sesión nuevamente.");
        // Opcional: Redirigir al login después de 2 segundos
        setTimeout(() => {
          localStorage.removeItem("token");
          window.location.href = '/login';
        }, 2000);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        mostrarNotificacion("error", errorData.message || "Error al descargar el archivo");
        return;
      }

      // VERIFICACIÓN 4: Verificar que la respuesta es un archivo
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/octet-stream")) {
        console.warn("Tipo de contenido inesperado:", contentType);
      }

      // Obtener el blob del archivo
      const blob = await res.blob();
      
      // Crear URL del blob
      const url = window.URL.createObjectURL(blob);
      
      // Crear elemento <a> para descargar
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      mostrarNotificacion("exito", "Archivo descargado correctamente");
      
    } catch (error) {
      console.error("Error completo en descarga:", error);
      mostrarNotificacion("error", "Error de conexión al descargar");
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  /* ===============================
     RENDER
     =============================== */

  return (
    <div className="space-y-10 relative">
      
      {/* ============================================ */}
      {/* NOTIFICACIÓN FLOTANTE (TOAST) */}
      {/* ============================================ */}
      {notificacion.mostrar && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-2xl border-l-4 transition-all duration-500 transform animate-slide-in ${
            notificacion.tipo === "exito"
              ? "bg-green-100 border-green-600 text-green-800"
              : notificacion.tipo === "error"
              ? "bg-red-100 border-red-600 text-red-800"
              : "bg-blue-100 border-blue-600 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Icono según tipo */}
            <span className="material-symbols-outlined text-2xl">
              {notificacion.tipo === "exito" 
                ? "check_circle" 
                : notificacion.tipo === "error" 
                ? "error" 
                : "info"}
            </span>
            <p className="font-semibold">{notificacion.texto}</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-linear-to-r from-blue-700 to-blue-600 rounded-2xl shadow-xl p-10 text-white">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl">cloud_upload</span>
          Subir Trabajos
        </h1>
        <p className="mt-3 text-blue-100 text-lg">
          Cargue archivos con una descripción clara.
        </p>
      </div>

      {/* FORMULARIO */}
      <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
        <form onSubmit={subirArchivos} className="space-y-8">

          {/* DESCRIPCIÓN */}
          <div>
            <label className="block mb-2 font-semibold text-gray-800 text-xl">
              Descripción del trabajo
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-600 outline-none"
              rows="3"
              placeholder="Ejemplo: Informe de avance del proyecto"
            />
          </div>

          {/* ARCHIVOS */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={handleArchivos}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-blue-700 transition"
            >
              Seleccionar Archivos
            </label>
            <p className="mt-3 text-sm text-gray-500">
              PDF, Word, Excel y PowerPoint (máx. 10MB).
            </p>
          </div>

          {/* LISTA ARCHIVOS */}
          {archivos.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-200">
              <h3 className="font-semibold text-gray-700">
                Archivos seleccionados:
              </h3>

              {archivos.map((archivo, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border"
                >
                  <span className="text-sm text-gray-700">
                    {archivo.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => eliminarArchivo(i)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={cargando}
            className={`bg-blue-700 hover:bg-blue-800 text-white px-10 py-3 rounded-xl font-semibold shadow transition ${
              cargando ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {cargando ? "Subiendo..." : "Subir Archivos"}
          </button>

          {/* Mensaje adicional (opcional) */}
          {mensaje && (
            <p className="font-semibold text-gray-700">{mensaje}</p>
          )}
        </form>
      </div>

      {/* HISTORIAL */}
      <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Historial de Archivos
        </h2>

        <div className="overflow-x-auto rounded-xl border border-gray-300">
          <table className="w-full border-collapse">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-4 text-left">Archivo</th>
                <th className="p-4 text-left">Descripción</th>
                <th className="p-4 text-center">Fecha</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h) => (
                <tr key={h.id} className="border-b hover:bg-blue-50">
                  <td className="p-4">{h.nombre_original}</td>
                  <td className="p-4">{h.descripcion}</td>
                  <td className="p-4 text-center">
                    {new Date(h.fecha_subida).toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => descargarArchivo(h.id, h.nombre_original)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 mx-auto transition"
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                      Descargar
                    </button>
                  </td>
                </tr>
              ))}

              {historial.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
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