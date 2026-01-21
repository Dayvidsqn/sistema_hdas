import { useEffect, useState } from "react";

function ListaArchivos() {
  const [archivos, setArchivos] = useState([]);
  const [filtroProfesor, setFiltroProfesor] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [ordenFecha, setOrdenFecha] = useState("desc"); // desc = reciente → antiguo

  const API = `${import.meta.env.VITE_API_URL}/archivos`;

  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => setArchivos(data))
      .catch((error) => console.error("Error al cargar archivos", error));
  }, []);

  const descargarArchivo = (nombreServidor) => {
    window.open(
      `${API}/descargar/${nombreServidor}`,
      "_blank"
    );
  };


  // FILTRADO + ORDENAMIENTO
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

  // LISTA DE PROFESORES ÚNICOS
  const profesoresUnicos = [
    ...new Set(archivos.map((a) => a.profesor_nombre)),
  ];

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="bg-linear-to-r from-blue-700 to-blue-600 rounded-2xl shadow-xl p-10 text-white">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl!">folder</span>
          Trabajos Subidos
        </h1>
        <p className="mt-3 text-blue-100 text-lg">
          Aquí puede revisar todos los documentos enviados por los profesores.
        </p>
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 space-y-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined">filter_alt</span>
          Filtros
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* FILTRAR POR PROFESOR */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-700">Profesor</label>
            <select
              className="border p-3 rounded-xl"
              value={filtroProfesor}
              onChange={(e) => setFiltroProfesor(e.target.value)}
            >
              <option value="">Todos</option>
              {profesoresUnicos.map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* FILTRAR POR FECHA */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-700">Fecha</label>
            <input
              type="date"
              className="border p-3 rounded-xl"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            />
          </div>

          {/* ORDENAR POR FECHA */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-700">Orden</label>
            <select
              className="border p-3 rounded-xl"
              value={ordenFecha}
              onChange={(e) => setOrdenFecha(e.target.value)}
            >
              <option value="desc">Más recientes primero</option>
              <option value="asc">Más antiguos primero</option>
            </select>
          </div>

        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl!">inventory_2</span>
          Listado de Archivos
        </h2>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full border-collapse text-left">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Nombre</th>
                {/* <th className="p-4 font-semibold">Tipo</th> */}
                <th className="p-4 font-semibold">Profesor</th>
                <th className="p-4 font-semibold text-center">Fecha Subido</th>
                <th className="p-4 font-semibold text-center">Acción</th>
              </tr>
            </thead>

            <tbody>
              {archivosFiltrados.map((archivo) => (
                <tr
                  key={archivo.id}
                  className="border-b hover:bg-blue-50 transition"
                >
                  <td className="p-4">{archivo.id}</td>
                  <td className="p-4">{archivo.nombre_original}</td>
                  {/* <td className="p-4">{archivo.tipo}</td> */}
                  <td className="p-4">{archivo.profesor_nombre}</td>
                  <td className="p-4 text-center">
                    {new Date(archivo.fecha_subida).toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => descargarArchivo(archivo.nombre_servidor)}
                      className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-xl font-semibold transition shadow"
                    >
                      Descargar
                    </button>
                  </td>
                </tr>
              ))}

              {archivosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No hay archivos con los filtros aplicados.
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

export default ListaArchivos;
