import { useState, useEffect } from "react";

export default function AsignarCursos() {
  const [profesores, setProfesores] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    profesor_id: "",
    curso_id: "",
    grado: "",
    seccion: ""
  });

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const API = `${import.meta.env.VITE_API_URL}`;

  // Cargar profesores, cursos y asignaciones al iniciar
  useEffect(() => {
    cargarProfesores();
    cargarCursos();
    cargarAsignaciones();
  }, []);

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

      // ✅ Ruta CORREGIDA: ahora es /director/cursos
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    // Validar que todos los campos estén llenos
    if (!formData.profesor_id || !formData.curso_id || !formData.grado || !formData.seccion) {
      setMensaje("Todos los campos son obligatorios");
      setCargando(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensaje("No hay sesión activa");
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
        setMensaje(data.message || "Error al asignar curso");
        setCargando(false);
        return;
      }

      setMensaje("✅ Curso asignado correctamente");
      
      // Limpiar formulario
      setFormData({
        profesor_id: "",
        curso_id: "",
        grado: "",
        seccion: ""
      });

      // Recargar lista de asignaciones
      cargarAsignaciones();

    } catch (error) {
      setMensaje("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  const eliminarAsignacion = async (id) => {
    if (!confirm("¿Está seguro de eliminar esta asignación?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensaje("No hay sesión activa");
        return;
      }

      const res = await fetch(`${API}/director/asignaciones/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setMensaje("✅ Asignación eliminada");
        cargarAsignaciones();
      } else {
        const data = await res.json();
        setMensaje(data.message || "Error al eliminar");
      }
    } catch (error) {
      setMensaje("Error de conexión");
    }
  };

  return (
    <div className="ml-32 p-3 min-h-screen space-y-8">
      {/* ENCABEZADO */}
      <div className="bg-linear-to-r from-blue-700 to-blue-600 p-10 rounded-2xl shadow-lg text-white">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl!">note</span>
          Asignar Cursos
        </h1>
        <p className="text-blue-100 text-lg mt-2">
          Asigne cursos a los profesores para cada grado y sección. Aquí puede gestionar las asignaciones actuales.
        </p>
      </div>

      {/* FORMULARIO */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Nueva Asignación</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Selector de Profesor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profesor *
              </label>
              <select
                name="profesor_id"
                value={formData.profesor_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-600"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curso *
              </label>
              <select
                name="curso_id"
                value={formData.curso_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-600"
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

            {/* Grado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grado *
              </label>
              <select
                name="grado"
                value={formData.grado}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Seleccionar grado</option>
                <option value="1ro">1ro</option>
                <option value="2do">2do</option>
                <option value="3ro">3ro</option>
                <option value="4to">4to</option>
                <option value="5to">5to</option>
                <option value="6to">6to</option>
              </select>
            </div>

            {/* Sección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sección *
              </label>
              <select
                name="seccion"
                value={formData.seccion}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Seleccionar sección</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={`bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-semibold ${
              cargando ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {cargando ? "Asignando..." : "Asignar Curso"}
          </button>

          {mensaje && (
            <p className={`text-sm ${mensaje.includes("✅") ? "text-green-600" : "text-red-600"}`}>
              {mensaje}
            </p>
          )}
        </form>
      </div>

      {/* LISTA DE ASIGNACIONES */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Asignaciones Actuales</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-3 text-left">Profesor</th>
                <th className="p-3 text-left">Curso</th>
                <th className="p-3 text-left">Grado</th>
                <th className="p-3 text-left">Sección</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignaciones.map((a) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{a.profesor_nombre} {a.profesor_apellido}</td>
                  <td className="p-3">{a.curso_nombre}</td>
                  <td className="p-3">{a.grado}</td>
                  <td className="p-3">{a.seccion}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => eliminarAsignacion(a.id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                      title="Eliminar asignación"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}

              {asignaciones.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No hay asignaciones registradas
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