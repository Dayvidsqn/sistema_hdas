import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function CargarNotas() {
  const { asignacionId } = useParams();
  const [alumnos, setAlumnos] = useState([]);
  const [cursoInfo, setCursoInfo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [bimestreActivo, setBimestreActivo] = useState(1);
  
  const API = `${import.meta.env.VITE_API_URL}`;

  useEffect(() => {
    cargarAlumnosYNotas();
  }, [asignacionId, bimestreActivo]);

  const cargarAlumnosYNotas = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem("token");
      
      // Cargar información del curso y alumnos con notas
      const res = await fetch(
        `${API}/profesor/curso/${asignacionId}/alumnos?bimestre=${bimestreActivo}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!res.ok) {
        throw new Error("Error al cargar datos");
      }

      const data = await res.json();
      setCursoInfo(data.curso);
      setAlumnos(data.alumnos || []);
      
    } catch (error) {
      console.error("Error:", error);
      setMensaje("Error al cargar los datos");
    } finally {
      setCargando(false);
    }
  };

  const handleNotaChange = (alumnoId, valor) => {
    setAlumnos(prevAlumnos =>
      prevAlumnos.map(alumno =>
        alumno.id === alumnoId
          ? { ...alumno, nota_actual: valor }
          : alumno
      )
    );
  };

  const guardarNota = async (alumnoId) => {
    const alumno = alumnos.find(a => a.id === alumnoId);
    if (!alumno) return;

    try {
      setGuardando(true);
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API}/profesor/guardar-nota`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          alumno_id: alumnoId,
          asignacion_id: parseInt(asignacionId),
          bimestre: bimestreActivo,
          nota: alumno.nota_actual ? parseFloat(alumno.nota_actual) : null
        })
      });

      if (!res.ok) {
        throw new Error("Error al guardar nota");
      }

      setMensaje("✅ Nota guardada correctamente");
      setTimeout(() => setMensaje(""), 2000);
      
    } catch (error) {
      console.error("Error:", error);
      setMensaje("❌ Error al guardar la nota");
      setTimeout(() => setMensaje(""), 2000);
    } finally {
      setGuardando(false);
    }
  };

  const calcularPromedio = (alumno) => {
    const notas = [
      alumno.nota_1,
      alumno.nota_2,
      alumno.nota_3,
      alumno.nota_4
    ].filter(n => n !== null && n !== undefined);
    
    if (notas.length === 0) return "-";
    const suma = notas.reduce((acc, n) => acc + parseFloat(n), 0);
    return (suma / notas.length).toFixed(2);
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
        </div>
      )}

      {/* Selector de bimestre */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <label className="font-semibold text-gray-700">Bimestre:</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(b => (
              <button
                key={b}
                onClick={() => setBimestreActivo(b)}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  bimestreActivo === b
                    ? "bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {b}° Bimestre
              </button>
            ))}
          </div>
        </div>
      </div>

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
                  
                  {/* Notas de cada bimestre (solo para visualización) */}
                  <td className="p-4 text-center">
                    {alumno.nota_1 || "-"}
                  </td>
                  <td className="p-4 text-center">
                    {alumno.nota_2 || "-"}
                  </td>
                  <td className="p-4 text-center">
                    {alumno.nota_3 || "-"}
                  </td>
                  <td className="p-4 text-center">
                    {alumno.nota_4 || "-"}
                  </td>
                  
                  {/* Promedio */}
                  <td className="p-4 text-center font-bold">
                    {calcularPromedio(alumno)}
                  </td>
                  
                  {/* Campo para ingresar nota del bimestre activo */}
                  <td className="p-4 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={alumno.nota_actual || ""}
                        onChange={(e) => handleNotaChange(alumno.id, e.target.value)}
                        className="w-20 border border-gray-300 rounded-lg p-1 text-center"
                        placeholder="0-20"
                      />
                      <button
                        onClick={() => guardarNota(alumno.id)}
                        disabled={guardando}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50"
                      >
                        Guardar
                      </button>
                    </div>
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
    </div>
  );
}