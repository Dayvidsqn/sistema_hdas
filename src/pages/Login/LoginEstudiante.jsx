import { useState } from "react";
import { useNavigate } from "react-router-dom";
import fondoLogin from "../../assets/fondo-estudiante-login.png";

export default function LoginEstudiante() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const API = `${import.meta.env.VITE_API_URL}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    try {
      const res = await fetch(`${API}/estudiantes/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.message || "Error al iniciar sesión");
        setCargando(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.rol);
      localStorage.setItem("estudiante", JSON.stringify({
        nombres: data.nombres,
        apellidos: data.apellidos,
        dni: data.dni,
        grado: data.grado,
        seccion: data.seccion
      }));

      navigate("/estudiante/mis-notas");

    } catch (error) {
      setMensaje("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex h-screen">

      {/* LADO IZQUIERDO IMAGEN */}
      <div
        className="hidden md:flex flex-1 bg-cover bg-center"
        style={{ backgroundImage: `url(${fondoLogin})` }}
      />

      {/* SIDEBAR LOGIN */}
      <div className="w-full max-w-[500px] bg-white shadow-2xl flex flex-col justify-center px-10">

        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo_das.png"
            alt="Logo del colegio"
            className="w-28 h-28 mb-3"
          />
          <h2 className="text-2xl font-bold text-gray-800">
            Portal Estudiante HDAS
          </h2>
          <p className="text-gray-500">
            Iniciar sesión
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="mb-4">
            <label className="text-sm text-gray-600">DNI del estudiante</label>
            <input
              type="text"
              placeholder="Ingrese su DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="mb-5">
            <label className="text-sm text-gray-600">Contraseña</label>
            <input
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition ${
              cargando ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {cargando ? "Ingresando..." : "Ingresar al Portal"}
          </button>

          {mensaje && (
            <p className="text-center mt-4 text-sm text-red-600">
              {mensaje}
            </p>
          )}

          <p className="text-center mt-6 text-sm text-gray-500">
            <a href="/" className="text-blue-600 hover:underline">
              ¿Eres profesor o director? Inicia sesión aquí
            </a>
          </p>

        </form>
      </div>
    </div>
  );
}