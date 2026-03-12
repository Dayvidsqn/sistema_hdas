import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Director from "./pages/Director";
import Alumnos from "./pages/Alumnos";
import Profesor from "./pages/Profesor";
import AsignarCursos from "./pages/AsignarCursos";
import DashboardLayout from "./layouts/DashboardLayout";
import MisCursos from "./pages/MisCursos";
import CargarNotas from "./pages/CargarNotas";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

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
          path="/mis-cursos"
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

      </Routes>
    </BrowserRouter>
  );
}

export default App;
