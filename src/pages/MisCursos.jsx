import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function MisCursos() {
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const API = `${import.meta.env.VITE_API_URL}`;

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensaje("No hay sesión activa");
        setCargando(false);
        return;
      }

      const res = await fetch(`${API}/profesor/mis-cursos`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error("Error al cargar cursos");
      }

      const data = await res.json();
      setCursos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
      setMensaje("Error al cargar los cursos");
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="ml-32 p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-32 p-6 min-h-screen">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-700 to-blue-600 rounded-2xl shadow-xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl!">school</span>
          Mis Cursos Asignados
        </h1>
        <p className="text-blue-100 mt-2">
          Seleccione un curso para gestionar las notas de los alumnos
        </p>
      </div>

      {mensaje && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
          <p>{mensaje}</p>
        </div>
      )}

      {/* Grid de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursos.length > 0 ? (
          cursos.map((curso) => (
            <Link
              key={curso.id}
              to={`/profesor/mis-cursos/${curso.id}`}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-200"
            >
              {/* Cabecera de la tarjeta con color según el grado */}
              <div className={`p-4 ${
                curso.grado?.includes('1') ? 'bg-green-600' :
                curso.grado?.includes('2') ? 'bg-blue-600' :
                curso.grado?.includes('3') ? 'bg-purple-600' :
                curso.grado?.includes('4') ? 'bg-orange-600' :
                curso.grado?.includes('5') ? 'bg-red-600' :
                'bg-indigo-600'
              } text-white`}>
                <h3 className="text-xl font-bold">{curso.curso_nombre}</h3>
                <p className="text-sm opacity-90 mt-1">
                  {curso.grado} - Sección {curso.seccion}
                </p>
              </div>

              {/* Cuerpo de la tarjeta */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">group</span>
                    {curso.total_alumnos || 0} alumnos
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">edit_note</span>
                    {curso.notas_ingresadas || 0} notas
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${curso.progreso || 0}%` }}
                  ></div>
                </div>

                {/* Botón de acción */}
                <div className="flex justify-end">
                  <span className="text-blue-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                    Ver detalles
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </span>
                </div>
              </div>

              {/* PIE DE TARJETA */}
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Curso activo
                </p>
              </div>
            </Link>
          ))
        ) : (
          /* ✅ MENSAJE CUANDO NO HAY CURSOS */
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <span className="material-symbols-outlined text-7xl text-gray-300 mb-4">
              school
            </span>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              Aún no tienes cursos asignados
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              El administrador aún no te ha asignado ningún curso. 
              Cuando te asignen cursos, aparecerán aquí para que puedas gestionar las notas.
            </p>
            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">info</span>
                Si crees que esto es un error, contacta al administrador
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}