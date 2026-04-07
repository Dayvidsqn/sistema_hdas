import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Alumnos from "./pages/Director/Alumnos";
import AsignarCursos from "./pages/Director/AsignarCursos";
import DashboardLayout from "./layouts/DashboardLayout";
import MisCursos from "./pages/Profesor/MisCursos";
import CargarNotas from "./pages/Profesor/CargarNotas";
import LoginEstudiante from "./pages/Login/LoginEstudiante";
import MisNotas from "./pages/MisNotas";
import SubirArchivo from "./pages/Profesor/SubirArchivo";
import ListaArchivos from "./pages/Director/ListaArchivos";

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
              <ListaArchivos />
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
          path="/profesor/subir-trabajos"
          element={
            <DashboardLayout>
              <SubirArchivo/>
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
          path="/profesor/mis-cursos/:asignacionId"
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
