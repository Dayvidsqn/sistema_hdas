import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MisNotas() {
  const [cursos, setCursos] = useState([]);
  const [estudiante, setEstudiante] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const API = `${import.meta.env.VITE_API_URL}`;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");
    const estudianteData = localStorage.getItem("estudiante");

    if (!token || rol !== "estudiante") {
      navigate("/login-estudiante");
      return;
    }

    setEstudiante(JSON.parse(estudianteData));
    cargarNotas();
  }, []);

  const cargarNotas = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/estudiantes/mis-notas`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Error al cargar notas");
      const data = await res.json();
      setCursos(data.cursos || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate("/login-estudiante");
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabecera simple (sin sidebar) */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Mis Notas</h1>
            {estudiante && (
              <p className="text-blue-100">
                {estudiante.nombres} {estudiante.apellidos} - {estudiante.grado} "{estudiante.seccion}"
              </p>
            )}
          </div>
          <button
            onClick={cerrarSesion}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {cursos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-400">school</span>
            <p className="text-gray-500 text-lg mt-4">No hay notas registradas</p>
          </div>
        ) : (
          <div className="space-y-6">
            {cursos.map((curso, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-4 text-white">
                  <h2 className="text-xl font-bold">{curso.curso_nombre}</h2>
                  <p className="text-sm opacity-90">Prof. {curso.profesor}</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-5 gap-4 text-center font-semibold text-gray-600 mb-3">
                    <div>1° Bim</div>
                    <div>2° Bim</div>
                    <div>3° Bim</div>
                    <div>4° Bim</div>
                    <div>Promedio</div>
                  </div>
                  <div className="grid grid-cols-5 gap-4 text-center">
                    {curso.notas.map((nota, i) => (
                      <div key={i} className={`p-3 rounded-lg ${
                        nota ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}>
                        <span className="text-lg font-bold">{nota || '-'}</span>
                      </div>
                    ))}
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-lg font-bold text-green-700">{curso.promedio}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}