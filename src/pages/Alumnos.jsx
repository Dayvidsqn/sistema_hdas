import { useEffect, useState } from "react";
import { getAlumnos, crearAlumno, eliminarAlumno } from "../api/alumnos";

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [alumnosFiltrados, setAlumnosFiltrados] = useState([]);
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

  // Estados para filtros
  const [ordenGrado, setOrdenGrado] = useState("asc"); // asc = menor a mayor, desc = mayor a menor
  const [ordenFecha, setOrdenFecha] = useState("desc"); // desc = más reciente primero

  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Opciones para selects
  const grados = ["1ro", "2do", "3ro", "4to", "5to", "6to"];
  const secciones = ["A", "B", "C"];

  useEffect(() => {
    cargarAlumnos();
  }, []);

  useEffect(() => {
    ordenarAlumnos();
  }, [alumnos, ordenGrado, ordenFecha]);

  const cargarAlumnos = async () => {
    const data = await getAlumnos();
    setAlumnos(data || []);
  };

  const ordenarAlumnos = () => {
    let lista = [...alumnos];

    // Ordenar por grado (extrayendo el número)
    lista.sort((a, b) => {
      const gradoA = parseInt(a.grado?.replace(/\D/g, '') || 0);
      const gradoB = parseInt(b.grado?.replace(/\D/g, '') || 0);
      
      if (ordenGrado === "asc") {
        return gradoA - gradoB;
      } else {
        return gradoB - gradoA;
      }
    });

    // Luego ordenar por fecha de registro (usando ID como referencia)
    if (ordenFecha === "desc") {
      lista.sort((a, b) => b.id - a.id); // Más recientes primero (ID mayor)
    } else {
      lista.sort((a, b) => a.id - b.id); // Más antiguos primero (ID menor)
    }

    setAlumnosFiltrados(lista);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    // Campos que deben ir siempre en mayúsculas
    const camposMayus = ["nombres", "apellidos"];

    setForm({
      ...form,
      [name]: camposMayus.includes(name) ? value.toUpperCase() : value
    });
  };

  const registrarAlumno = async (e) => {
    e.preventDefault();

    if (!form.nombres || !form.apellidos || !form.dni) {
      setMensaje("Los campos nombres, apellidos y DNI son obligatorios.");
      setTimeout(() => setMensaje(null), 2500);
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

      setMensaje("Alumno registrado correctamente.");

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
      setMensaje("Error al registrar alumno.");
    }

    setCargando(false);
    setTimeout(() => setMensaje(null), 2500);
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

  return (
    <div className="ml-32 p-3 min-h-screen space-y-8">

      {/* ENCABEZADO */}
      <div className="bg-linear-to-r from-blue-700 to-blue-600 p-10 rounded-2xl shadow-lg text-white">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl!">school</span>
          Gestión de Alumnos
        </h1>
        <p className="text-blue-100 text-lg mt-2">
          Registre nuevos alumnos y administre la lista existente.
        </p>
      </div>

      {/* FORMULARIO */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-700">
          <span className="material-symbols-outlined">person_add</span>
          Registrar Alumno
        </h2>

        {mensaje && (
          <div className="mb-5 p-4 bg-blue-100 text-blue-800 rounded-lg text-center font-semibold shadow">
            {mensaje}
          </div>
        )}

        <form onSubmit={registrarAlumno} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* Nombres */}
          <div>
            <label className="font-semibold text-gray-700">Nombres *</label>
            <input
              type="text"
              name="nombres"
              value={form.nombres}
              onChange={manejarCambio}
              className="w-full p-3 border rounded-xl mt-1"
              placeholder="Ej: Juan Carlos"
            />
          </div>

          {/* Apellidos */}
          <div>
            <label className="font-semibold text-gray-700">Apellidos *</label>
            <input
              type="text"
              name="apellidos"
              value={form.apellidos}
              onChange={manejarCambio}
              className="w-full p-3 border rounded-xl mt-1"
              placeholder="Ej: Pérez Gómez"
            />
          </div>

          {/* DNI */}
          <div>
            <label className="font-semibold text-gray-700">DNI *</label>
            <input
              type="text"
              name="dni"
              value={form.dni}
              onChange={manejarCambio}
              className="w-full p-3 border rounded-xl mt-1"
              placeholder="Ej: 74839201"
            />
          </div>

          {/* Grado - SELECTOR */}
          <div>
            <label className="font-semibold text-gray-700">Grado *</label>
            <select
              name="grado"
              value={form.grado}
              onChange={manejarCambio}
              className="w-full p-3 border rounded-xl mt-1 bg-white"
              required
            >
              <option value="">Seleccionar grado</option>
              {grados.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Sección - SELECTOR */}
          <div>
            <label className="font-semibold text-gray-700">Sección *</label>
            <select
              name="seccion"
              value={form.seccion}
              onChange={manejarCambio}
              className="w-full p-3 border rounded-xl mt-1 bg-white"
              required
            >
              <option value="">Seleccionar sección</option>
              {secciones.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label className="font-semibold text-gray-700">Fecha de nacimiento</label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={form.fecha_nacimiento}
              onChange={manejarCambio}
              className="w-full p-3 border rounded-xl mt-1"
            />
          </div>

          {/* Dirección */}
          <div className="md:col-span-2">
            <label className="font-semibold text-gray-700">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={form.direccion}
              onChange={manejarCambio}
              className="w-full p-3 border rounded-xl mt-1"
              placeholder="Ej: Av. Principal 123"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="font-semibold text-gray-700">Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={form.telefono}
              onChange={manejarCambio}
              className="w-full p-3 border rounded-xl mt-1"
              placeholder="Ej: 987654321"
            />
          </div>

          {/* Botón */}
          <div className="flex items-end">
            <button
              disabled={cargando}
              className={`w-full bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-xl font-semibold shadow transition ${
                cargando ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {cargando ? "Registrando..." : "Registrar"}
            </button>
          </div>

        </form>
      </div>

      {/* LISTA CON FILTROS */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-700">
            <span className="material-symbols-outlined">group</span>
            Lista de Alumnos
          </h2>

          {/* FILTROS DE ORDENAMIENTO */}
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 mr-2">Ordenar por grado:</label>
              <select
                value={ordenGrado}
                onChange={(e) => setOrdenGrado(e.target.value)}
                className="border rounded-lg p-2 bg-white"
              >
                <option value="asc">Menor a Mayor (1ro → 6to)</option>
                <option value="desc">Mayor a Menor (6to → 1ro)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 mr-2">Ordenar por fecha:</label>
              <select
                value={ordenFecha}
                onChange={(e) => setOrdenFecha(e.target.value)}
                className="border rounded-lg p-2 bg-white"
              >
                <option value="desc">Más recientes primero</option>
                <option value="asc">Más antiguos primero</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Nombre</th>
                <th className="p-4 font-semibold">DNI</th>
                <th className="p-4 font-semibold">Grado</th>
                <th className="p-4 font-semibold">Sección</th>
                <th className="p-4 font-semibold">Nacimiento</th>
                <th className="p-4 font-semibold">Dirección</th>
                <th className="p-4 font-semibold">Teléfono</th>
                <th className="p-4 font-semibold text-center">Eliminar</th>
              </tr>
            </thead>

            <tbody>
              {alumnosFiltrados.map((a) => (
                <tr key={a.id} className="border-b hover:bg-blue-50 transition">
                  <td className="p-4">{a.id}</td>
                  <td className="p-4">{a.nombres} {a.apellidos}</td>
                  <td className="p-4">{a.dni}</td>
                  <td className="p-4">{a.grado}</td>
                  <td className="p-4">{a.seccion}</td>
                  <td className="p-4">{formatDate(a.fecha_nacimiento)}</td>
                  <td className="p-4">{a.direccion}</td>
                  <td className="p-4">{a.telefono}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => borrar(a.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow font-semibold transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}

              {alumnosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500">
                    No hay alumnos registrados.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* Contador de alumnos */}
        <div className="mt-4 text-sm text-gray-500 text-right">
          Total de alumnos: {alumnosFiltrados.length}
        </div>
      </div>

    </div>
  );
}