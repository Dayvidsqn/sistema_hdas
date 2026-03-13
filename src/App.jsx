import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Director from "./pages/Director";
import Alumnos from "./pages/Alumnos";
import Profesor from "./pages/Profesor";
import AsignarCursos from "./pages/AsignarCursos";
import DashboardLayout from "./layouts/DashboardLayout";
import MisCursos from "./pages/MisCursos";
import CargarNotas from "./pages/CargarNotas";
import LoginEstudiante from "./pages/LoginEstudiante";
import MisNotas from "./pages/MisNotas";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* LOGIN PARA ESTUDIANTES */}
        <Route path="/login-estudiante" element={<LoginEstudiante />} />

        {/* DIRECTOR */}
        <Route
          path="/director"
          element={
            <DashboardLayout>
              <Director />
            </DashboardLayout>
          }
        />

        <Route
          path="/asignar-cursos"
          element={
            <DashboardLayout>
              <AsignarCursos />
            </DashboardLayout>
          }
        />

        {/* ALUMNOS (acceso del director) */}
        <Route
          path="/alumnos"
          element={
            <DashboardLayout>
              <Alumnos />
            </DashboardLayout>
          }
        />

        {/* PROFESOR */}
        <Route
          path="/profesor"
          element={
            <DashboardLayout>
              <Profesor />
            </DashboardLayout>
          }
        />

        <Route
          path="/profesor/mis-cursos"
          element={
            <DashboardLayout>
              <MisCursos />
            </DashboardLayout>
          }
        />

        <Route
          path="/profesor/curso/:asignacionId"
          element={
            <DashboardLayout>
              <CargarNotas />
            </DashboardLayout>
          }
        />

        {/* ESTUDIANTE - Ver Mis Notas */}
        <Route
          path="/estudiante/mis-notas"
          element={<MisNotas />} // ✅ SIN DashboardLayout
        />

        {/* Ruta por defecto para cualquier otra URL no encontrada */}
        <Route path="*" element={<div className="p-8 text-center">404 - Página no encontrada</div>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
