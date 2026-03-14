import { useEffect, useState } from "react";
import { getAlumnos, crearAlumno, eliminarAlumno } from "../api/alumnos";

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

  // Estados para filtros
  const [ordenGrado, setOrdenGrado] = useState("asc");
  const [ordenFecha, setOrdenFecha] = useState("desc");

  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      lista.sort((a, b) => b.id - a.id);
    } else {
      lista.sort((a, b) => a.id - b.id);
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
    <div className={`${isMobile ? 'p-4 pt-20' : 'ml-32 p-3'} min-h-screen space-y-4 md:space-y-8`}>

      {/* ENCABEZADO - Responsive */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-4 md:p-10 rounded-xl md:rounded-2xl shadow-lg text-white">
        <h1 className="text-xl md:text-4xl font-bold flex items-center gap-2 md:gap-3">
          <span className="material-symbols-outlined text-2xl md:text-4xl">school</span>
          Gestión de Alumnos
        </h1>
        <p className="text-blue-100 text-sm md:text-lg mt-1 md:mt-2">
          Registre nuevos alumnos y administre la lista existente.
        </p>
      </div>

      {/* FORMULARIO - Responsive */}
      <div className="bg-white p-4 md:p-8 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-gray-100">
        <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 text-gray-700">
          <span className="material-symbols-outlined text-xl md:text-2xl">person_add</span>
          Registrar Alumno
        </h2>

        {mensaje && (
          <div className="mb-4 md:mb-5 p-3 md:p-4 bg-blue-100 text-blue-800 rounded-lg text-sm md:text-base text-center font-semibold shadow">
            {mensaje}
          </div>
        )}

        <form onSubmit={registrarAlumno} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">

          {/* Nombres */}
          <div>
            <label className="font-semibold text-gray-700 text-sm md:text-base">Nombres *</label>
            <input
              type="text"
              name="nombres"
              value={form.nombres}
              onChange={manejarCambio}
              className="w-full p-2 md:p-3 border rounded-lg md:rounded-xl mt-1 text-sm md:text-base"
              placeholder="Ej: Juan Carlos"
            />
          </div>

          {/* Apellidos */}
          <div>
            <label className="font-semibold text-gray-700 text-sm md:text-base">Apellidos *</label>
            <input
              type="text"
              name="apellidos"
              value={form.apellidos}
              onChange={manejarCambio}
              className="w-full p-2 md:p-3 border rounded-lg md:rounded-xl mt-1 text-sm md:text-base"
              placeholder="Ej: Pérez Gómez"
            />
          </div>

          {/* DNI */}
          <div>
            <label className="font-semibold text-gray-700 text-sm md:text-base">DNI *</label>
            <input
              type="text"
              name="dni"
              value={form.dni}
              onChange={manejarCambio}
              className="w-full p-2 md:p-3 border rounded-lg md:rounded-xl mt-1 text-sm md:text-base"
              placeholder="Ej: 74839201"
            />
          </div>

          {/* Grado - SELECTOR */}
          <div>
            <label className="font-semibold text-gray-700 text-sm md:text-base">Grado *</label>
            <select
              name="grado"
              value={form.grado}
              onChange={manejarCambio}
              className="w-full p-2 md:p-3 border rounded-lg md:rounded-xl mt-1 bg-white text-sm md:text-base"
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
            <label className="font-semibold text-gray-700 text-sm md:text-base">Sección *</label>
            <select
              name="seccion"
              value={form.seccion}
              onChange={manejarCambio}
              className="w-full p-2 md:p-3 border rounded-lg md:rounded-xl mt-1 bg-white text-sm md:text-base"
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
            <label className="font-semibold text-gray-700 text-sm md:text-base">Fecha de nacimiento</label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={form.fecha_nacimiento}
              onChange={manejarCambio}
              className="w-full p-2 md:p-3 border rounded-lg md:rounded-xl mt-1 text-sm md:text-base"
            />
          </div>

          {/* Dirección */}
          <div className="md:col-span-2">
            <label className="font-semibold text-gray-700 text-sm md:text-base">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={form.direccion}
              onChange={manejarCambio}
              className="w-full p-2 md:p-3 border rounded-lg md:rounded-xl mt-1 text-sm md:text-base"
              placeholder="Ej: Av. Principal 123"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="font-semibold text-gray-700 text-sm md:text-base">Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={form.telefono}
              onChange={manejarCambio}
              className="w-full p-2 md:p-3 border rounded-lg md:rounded-xl mt-1 text-sm md:text-base"
              placeholder="Ej: 987654321"
            />
          </div>

          {/* Botón */}
          <div className="flex items-end">
            <button
              disabled={cargando}
              className={`w-full bg-blue-700 hover:bg-blue-800 text-white p-2 md:p-3 rounded-lg md:rounded-xl font-semibold shadow transition text-sm md:text-base ${
                cargando ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {cargando ? "Registrando..." : "Registrar"}
            </button>
          </div>

        </form>
      </div>

      {/* LISTA CON FILTROS - Responsive */}
      <div className="bg-white p-4 md:p-8 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-gray-100">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold flex items-center gap-2 text-gray-700">
            <span className="material-symbols-outlined text-xl md:text-2xl">group</span>
            Lista de Alumnos
          </h2>

          {/* FILTROS DE ORDENAMIENTO - Responsive */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <label className="text-xs md:text-sm font-semibold text-gray-600">Grado:</label>
              <select
                value={ordenGrado}
                onChange={(e) => setOrdenGrado(e.target.value)}
                className="border rounded-lg p-1.5 md:p-2 bg-white text-xs md:text-sm"
              >
                <option value="asc">Menor a Mayor</option>
                <option value="desc">Mayor a Menor</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <label className="text-xs md:text-sm font-semibold text-gray-600">Fecha:</label>
              <select
                value={ordenFecha}
                onChange={(e) => setOrdenFecha(e.target.value)}
                className="border rounded-lg p-1.5 md:p-2 bg-white text-xs md:text-sm"
              >
                <option value="desc">Más recientes</option>
                <option value="asc">Más antiguos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla con scroll horizontal */}
        <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
          <table className="min-w-[800px] md:min-w-full w-full text-left border-collapse">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-2 md:p-4 font-semibold text-xs md:text-base">ID</th>
                <th className="p-2 md:p-4 font-semibold text-xs md:text-base">Nombre</th>
                <th className="p-2 md:p-4 font-semibold text-xs md:text-base">DNI</th>
                <th className="p-2 md:p-4 font-semibold text-xs md:text-base">Grado</th>
                <th className="p-2 md:p-4 font-semibold text-xs md:text-base">Sección</th>
                <th className="p-2 md:p-4 font-semibold text-xs md:text-base">Nacimiento</th>
                <th className="p-2 md:p-4 font-semibold text-xs md:text-base">Dirección</th>
                <th className="p-2 md:p-4 font-semibold text-xs md:text-base">Teléfono</th>
                <th className="p-2 md:p-4 font-semibold text-xs md:text-base text-center">Eliminar</th>
              </tr>
            </thead>

            <tbody>
              {alumnosFiltrados.map((a) => (
                <tr key={a.id} className="border-b hover:bg-blue-50 transition">
                  <td className="p-2 md:p-4 text-xs md:text-base">{a.id}</td>
                  <td className="p-2 md:p-4 text-xs md:text-base whitespace-nowrap">
                    {isMobile 
                      ? `${a.nombres?.split(' ')[0]} ${a.apellidos?.split(' ')[0]}`
                      : `${a.nombres} ${a.apellidos}`
                    }
                  </td>
                  <td className="p-2 md:p-4 text-xs md:text-base">{a.dni}</td>
                  <td className="p-2 md:p-4 text-xs md:text-base">{a.grado}</td>
                  <td className="p-2 md:p-4 text-xs md:text-base">{a.seccion}</td>
                  <td className="p-2 md:p-4 text-xs md:text-base whitespace-nowrap">{formatDate(a.fecha_nacimiento)}</td>
                  <td className="p-2 md:p-4 text-xs md:text-base truncate max-w-[100px] md:max-w-none">
                    {a.direccion}
                  </td>
                  <td className="p-2 md:p-4 text-xs md:text-base">{a.telefono}</td>
                  <td className="p-2 md:p-4 text-center">
                    <button
                      onClick={() => borrar(a.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg shadow font-semibold text-xs md:text-sm transition"
                    >
                      {isMobile ? "X" : "Eliminar"}
                    </button>
                  </td>
                </tr>
              ))}

              {alumnosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-4 md:p-8 text-center text-gray-500 text-sm md:text-base">
                    No hay alumnos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Contador de alumnos */}
        <div className="mt-3 md:mt-4 text-xs md:text-sm text-gray-500 text-right">
          Total de alumnos: {alumnosFiltrados.length}
        </div>
      </div>

    </div>
  );
}