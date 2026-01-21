import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Director from "./pages/Director";
import Alumnos from "./pages/Alumnos";
import Profesor from "./pages/Profesor";
import DashboardLayout from "./layouts/DashboardLayout";

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

      </Routes>
    </BrowserRouter>
  );
}

export default App;
