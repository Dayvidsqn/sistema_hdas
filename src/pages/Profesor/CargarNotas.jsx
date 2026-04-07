import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CargarNotas() {
  const { asignacionId } = useParams();
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [cursoInfo, setCursoInfo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [notificacion, setNotificacion] = useState({ mostrar: false, tipo: "", texto: "" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hoveredRow, setHoveredRow] = useState(null);
  
  const API = `${import.meta.env.VITE_API_URL}`;

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    cargarAlumnosYNotas();
  }, [asignacionId]);

  // Función para mostrar notificación flotante
  const mostrarNotificacion = (tipo, texto) => {
    setNotificacion({ mostrar: true, tipo, texto });
    setTimeout(() => {
      setNotificacion({ mostrar: false, tipo: "", texto: "" });
    }, 3000);
  };

  const cargarAlumnosYNotas = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem("token");
      
      const res = await fetch(
        `${API}/profesor/mis-cursos/${asignacionId}/alumnos`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!res.ok) {
        throw new Error("Error al cargar datos");
      }

      const data = await res.json();
      setCursoInfo(data.curso);
      
      const alumnosConNotas = data.alumnos.map(alumno => ({
        ...alumno,
        notas: {
          1: alumno.nota_1 || "",
          2: alumno.nota_2 || "",
          3: alumno.nota_3 || "",
          4: alumno.nota_4 || ""
        }
      }));
      
      setAlumnos(alumnosConNotas);
      
    } catch (error) {
      console.error("Error:", error);
      mostrarNotificacion("error", "Error al cargar los datos");
    } finally {
      setCargando(false);
    }
  };

  const handleNotaChange = (alumnoId, bimestre, valor) => {
    setAlumnos(prevAlumnos =>
      prevAlumnos.map(alumno =>
        alumno.id === alumnoId
          ? {
              ...alumno,
              notas: {
                ...alumno.notas,
                [bimestre]: valor
              }
            }
          : alumno
      )
    );
  };

  const guardarNotasAlumno = async (alumnoId) => {
    const alumno = alumnos.find(a => a.id === alumnoId);
    if (!alumno) return;

    try {
      setGuardando(true);
      const token = localStorage.getItem("token");
      
      for (let bimestre = 1; bimestre <= 4; bimestre++) {
        const nota = alumno.notas[bimestre];
        
        await fetch(`${API}/profesor/guardar-nota`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            alumno_id: alumnoId,
            asignacion_id: parseInt(asignacionId),
            bimestre: bimestre,
            nota: nota ? parseFloat(nota) : null
          })
        });
      }

      mostrarNotificacion("exito", `Notas de ${alumno.apellidos} guardadas correctamente`);
      cargarAlumnosYNotas();
      
    } catch (error) {
      console.error("Error:", error);
      mostrarNotificacion("error", "Error al guardar las notas");
    } finally {
      setGuardando(false);
    }
  };

  const calcularPromedio = (notas) => {
    const valores = Object.values(notas).filter(n => n !== "");
    if (valores.length === 0) return "-";
    const suma = valores.reduce((acc, n) => acc + parseFloat(n), 0);
    return (suma / valores.length).toFixed(2);
  };

  const volverAMisCursos = () => {
    navigate("/profesor/mis-cursos");
  };

  // Obtener color según el promedio
  const getPromedioColor = (promedio) => {
    if (promedio === "-") return "text-gray-400";
    const nota = parseFloat(promedio);
    if (nota >= 14) return "text-green-600";
    if (nota >= 11) return "text-yellow-600";
    return "text-red-600";
  };

  // Obtener fondo según el promedio
  const getPromedioBg = (promedio) => {
    if (promedio === "-") return "bg-gray-100";
    const nota = parseFloat(promedio);
    if (nota >= 14) return "bg-green-100";
    if (nota >= 11) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-t-blue-600 border-r-blue-400 border-b-blue-300 border-l-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg animate-bounce shadow-lg"></div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-600 font-medium text-lg">Cargando alumnos...</p>
          <p className="text-gray-400 text-sm mt-1">Preparando la lista de estudiantes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn relative">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards;
        }
        .animate-slideOutRight {
          animation: slideOutRight 0.3s ease-out forwards;
        }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 0.5;
        }
        input[type="number"]:focus::-webkit-inner-spin-button,
        input[type="number"]:focus::-webkit-outer-spin-button {
          opacity: 1;
        }
      `}</style>

      {/* NOTIFICACIÓN FLOTANTE - Esquina superior derecha */}
      {notificacion.mostrar && (
        <div className="fixed top-5 right-5 z-50 animate-slideInRight">
          <div className={`relative overflow-hidden rounded-xl shadow-2xl border-l-4 min-w-[280px] max-w-md ${
            notificacion.tipo === "exito"
              ? "bg-gradient-to-r from-green-50 to-green-100 border-green-500"
              : "bg-gradient-to-r from-red-50 to-red-100 border-red-500"
          }`}>
            {/* Barra de progreso animada */}
            <div className={`absolute bottom-0 left-0 h-1 ${
              notificacion.tipo === "exito" ? "bg-green-500" : "bg-red-500"
            } animate-progress`}></div>
            
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 p-2 rounded-full ${
                  notificacion.tipo === "exito" ? "bg-green-200" : "bg-red-200"
                }`}>
                  <span className="material-symbols-outlined text-lg">
                    {notificacion.tipo === "exito" ? "check_circle" : "error"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${
                    notificacion.tipo === "exito" ? "text-green-800" : "text-red-800"
                  }`}>
                    {notificacion.tipo === "exito" ? "¡Éxito!" : "Error"}
                  </p>
                  <p className={`text-sm mt-0.5 ${
                    notificacion.tipo === "exito" ? "text-green-700" : "text-red-700"
                  }`}>
                    {notificacion.texto}
                  </p>
                </div>
                <button 
                  onClick={() => setNotificacion({ mostrar: false, tipo: "", texto: "" })}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          0% { width: 100%; }
          100% { width: 0%; }
        }
        .animate-progress {
          animation: progress 3s linear forwards;
        }
      `}</style>

      {/* Botón de retroceso mejorado */}
      <button
        onClick={volverAMisCursos}
        className="group mb-4 flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md"
      >
        <span className="material-symbols-outlined text-xl transition-transform duration-200 group-hover:-translate-x-1">arrow_back</span>
        <span className="text-sm font-medium">Volver a Mis Cursos</span>
      </button>

      {/* Header con información del curso - Diseño mejorado */}
      {cursoInfo && (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <span className="material-symbols-outlined text-3xl text-white">edit_note</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {cursoInfo.curso_nombre}
                  </h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg text-xs text-white">
                      <span className="material-symbols-outlined text-sm">school</span>
                      {cursoInfo.grado}° - Sección {cursoInfo.seccion}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg text-xs text-white">
                      <span className="material-symbols-outlined text-sm">group</span>
                      {alumnos.length} alumnos
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white/70">info</span>
                  <p className="text-white/90 text-sm">Notas: 0 - 20 (decimales permitidos)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de alumnos - Diseño mejorado */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">group</span>
              <h2 className="text-lg font-bold text-gray-800">Lista de Alumnos</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>Haga clic en "Guardar Notas" por cada alumno</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider w-16">N°</th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Alumno</th>
                <th className="px-2 py-4 text-center text-xs font-semibold uppercase tracking-wider w-20">1° B</th>
                <th className="px-2 py-4 text-center text-xs font-semibold uppercase tracking-wider w-20">2° B</th>
                <th className="px-2 py-4 text-center text-xs font-semibold uppercase tracking-wider w-20">3° B</th>
                <th className="px-2 py-4 text-center text-xs font-semibold uppercase tracking-wider w-20">4° B</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider w-24">Promedio</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider w-32">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alumnos.map((alumno, index) => {
                const promedio = calcularPromedio(alumno.notas);
                return (
                  <tr 
                    key={alumno.id} 
                    className={`transition-all duration-200 ${hoveredRow === alumno.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                    onMouseEnter={() => setHoveredRow(alumno.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-4 py-4 text-sm text-gray-500 font-medium">{index + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-blue-600 text-sm">person</span>
                        </div>
                        <span className="font-medium text-gray-800">
                          {isMobile 
                            ? `${alumno.apellidos.split(' ')[0]} ${alumno.nombres.split(' ')[0]}`
                            : `${alumno.apellidos}, ${alumno.nombres}`
                          }
                        </span>
                      </div>
                    </td>
                    
                    {/* Inputs para los 4 bimestres */}
                    {[1, 2, 3, 4].map(bimestre => (
                      <td key={bimestre} className="px-2 py-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          value={alumno.notas[bimestre]}
                          onChange={(e) => handleNotaChange(alumno.id, bimestre, e.target.value)}
                          className="w-16 md:w-20 px-2 py-2 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                          placeholder="-"
                        />
                      </td>
                    ))}
                    
                    {/* Promedio con color según rendimiento */}
                    <td className="px-4 py-4 text-center">
                      <div className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-sm ${getPromedioBg(promedio)} ${getPromedioColor(promedio)}`}>
                        {promedio === "-" ? "—" : promedio}
                      </div>
                    </td>
                    
                    {/* Botón Guardar mejorado */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => guardarNotasAlumno(alumno.id)}
                        disabled={guardando}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                      >
                        {guardando ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Guardando</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-base">save</span>
                            <span className={isMobile ? "hidden" : "inline"}>Guardar Notas</span>
                            {isMobile && <span>Guardar</span>}
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {alumnos.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <span className="material-symbols-outlined text-gray-400 text-4xl">person_off</span>
                      </div>
                      <p className="text-gray-500 font-medium">No hay alumnos en este curso</p>
                      <p className="text-gray-400 text-sm">Verifique la asignación del curso</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de la tabla */}
        {alumnos.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <span className="material-symbols-outlined text-sm">analytics</span>
                <span>Promedio general del curso</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-500">Total alumnos: <strong className="text-gray-800">{alumnos.length}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leyenda mejorada */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 rounded-full"></div>
            <span className="text-gray-600">≥14: Aprobado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-100 rounded-full"></div>
            <span className="text-gray-600">11-13: En proceso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 rounded-full"></div>
            <span className="text-gray-600">≤10: Desaprobado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400 text-sm">info</span>
            <span className="text-gray-500">Use punto para decimales (ej: 15.5)</span>
          </div>
        </div>
      </div>
    </div>
  );
}