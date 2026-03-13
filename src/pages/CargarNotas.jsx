import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function CargarNotas() {
  const { asignacionId } = useParams();
  const [alumnos, setAlumnos] = useState([]);
  const [cursoInfo, setCursoInfo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  
  const API = `${import.meta.env.VITE_API_URL}`;

  useEffect(() => {
    cargarAlumnosYNotas();
  }, [asignacionId]);

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
      
      // Inicializar cada alumno con un objeto de notas
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
      setMensaje("Error al cargar los datos");
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
      
      // Guardar cada bimestre por separado
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

      setMensaje(`✅ Notas de ${alumno.apellidos} guardadas correctamente`);
      setTimeout(() => setMensaje(""), 2000);
      
      // Recargar para mostrar los valores guardados
      cargarAlumnosYNotas();
      
    } catch (error) {
      console.error("Error:", error);
      setMensaje("❌ Error al guardar las notas");
      setTimeout(() => setMensaje(""), 2000);
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

  if (cargando) {
    return (
      <div className="ml-32 p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando alumnos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-32 p-6 min-h-screen">
      {/* Header con información del curso */}
      {cursoInfo && (
        <div className="bg-linear-to-r from-blue-700 to-blue-600 rounded-2xl shadow-xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl!">edit_note</span>
            {cursoInfo.curso_nombre}
          </h1>
          <p className="text-blue-100 text-lg mt-2">
            {cursoInfo.grado} - Sección {cursoInfo.seccion} | {alumnos.length} alumnos
          </p>
          <p className="text-blue-100 text-sm mt-1">
            Ingrese las notas de los 4 bimestres (0 - 20)
          </p>
        </div>
      )}

      {/* Mensaje de notificación */}
      {mensaje && (
        <div className={`mb-6 p-4 rounded-lg ${
          mensaje.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {mensaje}
        </div>
      )}

      {/* Tabla de alumnos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-4 text-left">N°</th>
                <th className="p-4 text-left">Apellidos y Nombres</th>
                <th className="p-4 text-center">1° Bim</th>
                <th className="p-4 text-center">2° Bim</th>
                <th className="p-4 text-center">3° Bim</th>
                <th className="p-4 text-center">4° Bim</th>
                <th className="p-4 text-center">Promedio</th>
                <th className="p-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno, index) => (
                <tr key={alumno.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{index + 1}</td>
                  <td className="p-4 font-medium">
                    {alumno.apellidos}, {alumno.nombres}
                  </td>
                  
                  {/* Inputs para los 4 bimestres */}
                  {[1, 2, 3, 4].map(bimestre => (
                    <td key={bimestre} className="p-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={alumno.notas[bimestre]}
                        onChange={(e) => handleNotaChange(alumno.id, bimestre, e.target.value)}
                        className="w-16 border border-gray-300 rounded-lg p-1 text-center"
                        placeholder="0-20"
                      />
                    </td>
                  ))}
                  
                  {/* Promedio */}
                  <td className="p-4 text-center font-bold">
                    {calcularPromedio(alumno.notas)}
                  </td>
                  
                  {/* Botón Guardar (uno por alumno) */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => guardarNotasAlumno(alumno.id)}
                      disabled={guardando}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 transition"
                    >
                      {guardando ? "Guardando..." : "Guardar Notas"}
                    </button>
                  </td>
                </tr>
              ))}

              {alumnos.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    No hay alumnos en este curso
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        * Las notas deben estar entre 0 y 20. Use punto para decimales (ej: 15.5)
      </div>
    </div>
  );
}