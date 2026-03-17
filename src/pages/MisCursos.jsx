import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function MisCursos() {
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const API = `${import.meta.env.VITE_API_URL}`;

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No hay sesión activa");
        setCargando(false);
        return;
      }

      const res = await fetch(`${API}/profesor/mis-cursos`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404 || data.message?.toLowerCase().includes("no hay cursos")) {
          setCursos([]);
          setError("");
        } else {
          setError(data.message || "Error al cargar los cursos");
        }
        setCargando(false);
        return;
      }

      if (!data || data.length === 0) {
        setCursos([]);
        setError("");
      } else {
        setCursos(Array.isArray(data) ? data : []);
        setError("");
      }

    } catch (error) {
      console.error("Error:", error);
      setError("Error de conexión con el servidor");
      setCursos([]);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className={`${isMobile ? 'p-4 pt-20' : 'ml-32 p-6'} flex justify-center items-center h-64`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'p-4 pt-5' : 'ml-32 p-6'} min-h-screen`}>
      {/* Header - Responsive */}
      <div className="bg-linear-to-r from-blue-700 to-blue-600 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-8 text-white mb-4 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
          <span className="material-symbols-outlined text-2xl md:text-4xl">school</span>
          Mis Cursos Asignados
        </h1>
        <p className="text-blue-100 mt-1 md:mt-2 text-xs md:text-base">
          Seleccione un curso para gestionar las notas de los alumnos
        </p>
      </div>

      {/* Mostrar errores */}
      {error && cursos.length === 0 && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 md:p-4 mb-4 md:mb-6 rounded text-sm md:text-base">
          <p className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base md:text-xl">error</span>
            {error}
          </p>
        </div>
      )}

      {/* Grid de cursos - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {cursos.length > 0 ? (
          cursos.map((curso) => (
            <Link
              key={curso.id}
              to={`/profesor/mis-cursos/${curso.id}`}
              className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
            >
              {/* Cabecera de la tarjeta - Responsive */}
              <div className={`p-3 md:p-4 ${
                curso.grado?.includes('1') ? 'bg-green-600' :
                curso.grado?.includes('2') ? 'bg-blue-600' :
                curso.grado?.includes('3') ? 'bg-purple-600' :
                curso.grado?.includes('4') ? 'bg-orange-600' :
                curso.grado?.includes('5') ? 'bg-red-600' :
                'bg-indigo-600'
              } text-white`}>
                <h3 className="text-base md:text-xl font-bold truncate">{curso.curso_nombre}</h3>
                <p className="text-xs md:text-sm opacity-90 mt-0.5 md:mt-1">
                  {curso.grado} - Sección {curso.seccion}
                </p>
              </div>

              {/* Cuerpo de la tarjeta - Responsive */}
              <div className="p-3 md:p-5">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <span className="text-xs md:text-sm text-gray-500 flex items-center gap-0.5 md:gap-1">
                    <span className="material-symbols-outlined text-sm md:text-base">group</span>
                    <span className="truncate">{curso.total_alumnos || 0} alumnos</span>
                  </span>
                  <span className="text-xs md:text-sm text-gray-500 flex items-center gap-0.5 md:gap-1">
                    <span className="material-symbols-outlined text-sm md:text-base">edit_note</span>
                    <span className="truncate">{curso.notas_ingresadas || 0} notas</span>
                  </span>
                </div>

                {/* Barra de progreso - Responsive */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2.5 mb-2 md:mb-4">
                  <div 
                    className="bg-blue-600 h-1.5 md:h-2.5 rounded-full" 
                    style={{ width: `${curso.progreso || 0}%` }}
                  ></div>
                </div>

                {/* Botón de acción - Responsive */}
                <div className="flex justify-end">
                  <span className="text-blue-700 font-semibold flex items-center gap-0.5 md:gap-1 hover:gap-1 md:hover:gap-2 transition-all text-xs md:text-base">
                    Ver detalles
                    <span className="material-symbols-outlined text-sm md:text-lg">arrow_forward</span>
                  </span>
                </div>
              </div>

              {/* PIE DE TARJETA - Responsive */}
              <div className="bg-gray-50 px-3 md:px-5 py-2 md:py-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Curso activo
                </p>
              </div>
            </Link>
          ))
        ) : (
          /* MENSAJE CUANDO NO HAY CURSOS - Responsive */
          <div className="col-span-full flex flex-col items-center justify-center py-8 md:py-16 bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 px-4">
            <span className="material-symbols-outlined text-5xl md:text-7xl text-gray-300 mb-2 md:mb-4">
              school
            </span>
            <h3 className="text-lg md:text-2xl font-semibold text-gray-700 mb-1 md:mb-2 text-center">
              Aún no tienes cursos asignados
            </h3>
            <p className="text-gray-500 text-center text-xs md:text-base max-w-md">
              El administrador aún no te ha asignado ningún curso. 
              Cuando te asignen cursos, aparecerán aquí para que puedas gestionar las notas.
            </p>
            <div className="mt-4 md:mt-6 bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-200">
              <p className="text-xs md:text-sm text-blue-700 flex items-center gap-1 md:gap-2">
                <span className="material-symbols-outlined text-sm md:text-base">info</span>
                Si crees que esto es un error, contacta al administrador
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}