import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function MisCursos() {
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hoveredCard, setHoveredCard] = useState(null);

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

  // Función para obtener el color del grado
  const getGradoColor = (grado) => {
    const colores = {
      '1': 'from-emerald-500 to-emerald-600',
      '2': 'from-blue-500 to-blue-600',
      '3': 'from-purple-500 to-purple-600',
      '4': 'from-orange-500 to-orange-600',
      '5': 'from-red-500 to-red-600',
      '6': 'from-indigo-500 to-indigo-600',
      'default': 'from-gray-500 to-gray-600'
    };
    const numero = grado?.match(/\d+/)?.[0] || 'default';
    return colores[numero] || colores.default;
  };

  // Función para obtener el ícono del grado
  const getGradoIcono = (grado) => {
    const numero = grado?.match(/\d+/)?.[0];
    switch(numero) {
      case '1': return 'looks_one';
      case '2': return 'looks_two';
      case '3': return 'looks_3';
      case '4': return 'looks_4';
      case '5': return 'looks_5';
      case '6': return 'looks_6';
      default: return 'school';
    }
  };

  // Calcular estadísticas
  const totalAlumnos = cursos.reduce((sum, curso) => {
    const alumnos = Number(curso.total_alumnos) || 0;
    return sum + alumnos;
  }, 0);
  const totalNotas = cursos.reduce((sum, curso) => {
    const notas = Number(curso.notas_ingresadas) || 0;
    return sum + notas;
  }, 0);
  const promedioProgreso = cursos.length > 0 
  ? Math.round(cursos.reduce((sum, curso) => {
      const progreso = Number(curso.progreso) || 0;  // ✅ Convertir a número
      return sum + progreso;
    }, 0) / cursos.length)
  : 0;

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          {/* Círculo exterior giratorio */}
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse"></div>
          
          {/* Círculo medio giratorio */}
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-t-blue-600 border-r-blue-400 border-b-blue-300 border-l-transparent rounded-full animate-spin"></div>
          
          {/* Círculo interior con efecto de rebote */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg animate-bounce shadow-lg"></div>
          </div>
          
          {/* Partículas flotantes */}
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-blue-500 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 -right-3 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Texto con animación de puntos suspensivos */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 font-medium text-lg flex items-center gap-1">
            Cargando cursos
            <span className="inline-flex gap-1">
              <span className="animate-bounce" style={{ animationDelay: '0s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
            </span>
          </p>
          <p className="text-gray-400 text-sm mt-2">Preparando tu contenido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fadeIn space-y-5">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out;
        }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25);
        }
        .progress-bar {
          transition: width 0.5s ease-out;
        }
      `}</style>

      {/* Header con estadísticas */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <span className="material-symbols-outlined text-3xl text-white">school</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Mis Cursos Asignados</h1>
              <p className="text-blue-100 text-sm md:text-base mt-1">Gestione las notas y calificaciones de sus alumnos</p>
            </div>
          </div>

          {/* Tarjetas de estadísticas */}
          {cursos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 pt-4 border-t border-white/20">
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white/70 text-lg">menu_book</span>
                  <span className="text-2xl font-bold text-white">{cursos.length}</span>
                </div>
                <p className="text-white/70 text-xs mt-1">Cursos</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white/70 text-lg">group</span>
                  <span className="text-2xl font-bold text-white">{totalAlumnos}</span>
                </div>
                <p className="text-white/70 text-xs mt-1">Alumnos</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white/70 text-lg">edit_note</span>
                  <span className="text-2xl font-bold text-white">{totalNotas}</span>
                </div>
                <p className="text-white/70 text-xs mt-1">Notas registradas</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white/70 text-lg">trending_up</span>
                  <span className="text-2xl font-bold text-white">{promedioProgreso}%</span>
                </div>
                <p className="text-white/70 text-xs mt-1">Progreso promedio</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mostrar errores */}
      {error && cursos.length === 0 && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl p-4 mb-6 animate-slideInLeft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-200 rounded-full">
              <span className="material-symbols-outlined text-red-600">error</span>
            </div>
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursos.length > 0 ? (
          cursos.map((curso, index) => (
            <Link
              key={curso.id}
              to={`/profesor/mis-cursos/${curso.id}`}
              className="group block"
              onMouseEnter={() => setHoveredCard(curso.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`bg-white rounded-2xl shadow-lg overflow-hidden card-hover animate-fadeIn`}>
                {/* Cabecera de la tarjeta con gradiente dinámico */}
                <div className={`relative overflow-hidden bg-gradient-to-r ${getGradoColor(curso.grado)} p-5 text-white`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-2xl">{getGradoIcono(curso.grado)}</span>
                          <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                            {curso.grado}° - Sección {curso.seccion}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold truncate">{curso.curso_nombre}</h3>
                      </div>
                      <div className={`transition-all duration-300 ${hoveredCard === curso.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                        <span className="material-symbols-outlined text-3xl">arrow_forward_ios</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cuerpo de la tarjeta */}
                <div className="p-5">
                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <span className="material-symbols-outlined text-blue-600 text-lg">group</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Alumnos</p>
                        <p className="text-lg font-bold text-gray-800">{curso.total_alumnos || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <span className="material-symbols-outlined text-green-600 text-lg">edit_note</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Notas</p>
                        <p className="text-lg font-bold text-gray-800">{curso.notas_ingresadas || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progreso de calificación</span>
                      <span className="font-semibold text-blue-600">{curso.progreso || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full progress-bar`}
                        style={{ width: `${curso.progreso || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-gray-400 text-sm">schedule</span>
                      <span className="text-xs text-gray-400">Actualizado recientemente</span>
                    </div>
                    <div className={`flex items-center gap-1 text-blue-600 font-semibold text-sm transition-all duration-300 ${hoveredCard === curso.id ? 'gap-2' : ''}`}>
                      <span>Gestionar notas</span>
                      <span className="material-symbols-outlined text-base transition-transform duration-300" style={{ transform: hoveredCard === curso.id ? 'translateX(4px)' : 'translateX(0)' }}>
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          /* MENSAJE CUANDO NO HAY CURSOS */
          <div className="col-span-full">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 text-center animate-fadeIn">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
                <div className="relative p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full">
                  <span className="material-symbols-outlined text-6xl text-blue-400">school</span>
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                Aún no tienes cursos asignados
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                El administrador aún no te ha asignado ningún curso. Cuando te asignen cursos, aparecerán aquí para que puedas gestionar las notas.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 max-w-lg mx-auto">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <span className="material-symbols-outlined">info</span>
                  <p className="text-sm">Si crees que esto es un error, contacta al administrador</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer con resumen */}
      {cursos.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">info</span>
              Seleccione un curso para comenzar a gestionar las notas
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">© {new Date().getFullYear()} Sistema DAS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}