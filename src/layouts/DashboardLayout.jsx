import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import FondoAnimado from "../components/FondoAnimado";

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const [rol, setRol] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Escuchar cuando se abre/cierra el sidebar desde el header
  useEffect(() => {
    const handleSidebarToggle = (e) => {
      setMobileMenuOpen(e.detail.open);
    };
    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

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

        {/* El main se adapta: en desktop margen izquierdo fijo, en móvil margen 0 */}
        <main 
          className={`
            min-h-screen transition-all duration-300
            ${isMobile ? 'pt-16 p-3' : 'ml-32 p-3'} // En móvil: padding-top para el header
          `}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;