import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("Conectando...");

    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          rol,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensaje(data.message || "Error al iniciar sesión");
        return;
      }

      // Guardamos token en el navegador
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.rol);

      // Redirigir según rol
      if (data.rol === "director") {
        window.location.href = "/director";
      } else if (data.rol === "profesor") {
        window.location.href = "/profesor";
      }

    } catch (error) {
      setMensaje("No se pudo conectar con el servidor");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-blue-600 to-sky-400">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          Sistema del Colegio
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Iniciar sesión
        </p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded mb-3"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded mb-3"
          required
        />

        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded mb-4"
          required
        >
          <option value="">Seleccione su rol</option>
          <option value="profesor">Profesor</option>
          <option value="director">Director</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Ingresar
        </button>

        {mensaje && (
          <p className="text-center mt-4 text-sm text-red-600">
            {mensaje}
          </p>
        )}
      </form>
    </div>
  );
}

export default Login;
