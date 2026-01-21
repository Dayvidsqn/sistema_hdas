import { useEffect, useRef, useState } from "react";

export default function SubirArchivo() {
  const [archivos, setArchivos] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);

  const fileInputRef = useRef(null);
  const API = `${import.meta.env.VITE_API_URL}/archivos`;

  /* ===============================
     MANEJO DE ARCHIVOS
     =============================== */

  const handleArchivos = (e) => {
    const nuevos = Array.from(e.target.files);
    setArchivos((prev) => [...prev, ...nuevos]);
    e.target.value = null;
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
      setMensaje("Debe ingresar una descripción");
      return;
    }

    if (archivos.length === 0) {
      setMensaje("Debe seleccionar al menos un archivo");
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
        setMensaje(data.message || "Error al subir archivos");
        setCargando(false);
        return;
      }

      setMensaje("Archivos subidos correctamente");
      setDescripcion("");
      setArchivos([]);
      if (fileInputRef.current) fileInputRef.current.value = null;

      cargarHistorial();

    } catch (error) {
      setMensaje("Error de conexión con el servidor");
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
      setHistorial(data || []);

    } catch {
      setHistorial([]);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  /* ===============================
     RENDER
     =============================== */

  return (
    <div className="space-y-10">

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
                </tr>
              ))}

              {historial.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-gray-500">
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
