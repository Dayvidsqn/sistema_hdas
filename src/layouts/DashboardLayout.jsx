import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import FondoAnimado from "../components/FondoAnimado";

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const rolStorage = localStorage.getItem("rol");
    const token = localStorage.getItem("token");

    if (!rolStorage || !token) {
      navigate("/");
    } else {
      setRol(rolStorage);
    }
  }, []);

  if (!rol) return null; // evita render mientras valida sesión

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FondoAnimado />

      <div className="relative z-10 min-h-screen">
        <Sidebar rol={rol} />

        <main className="ml-32 p-3 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
