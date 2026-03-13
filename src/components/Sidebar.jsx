import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Sidebar({ rol }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false); // Cerrar menú en desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar menú al cambiar de ruta (en móvil)
  useEffect(() => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const salir = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    navigate("/");
  };

  console.log("ROL ACTUAL:", rol); // PARA DEPURACIÓN

  // Header superior SOLO para móvil
  const MobileHeader = () => (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 px-4 py-2 flex items-center justify-between shadow-md">
      <img src="/logo-das.png" alt="Logo DAS" style="width: 230px; height: 70px; transition: none;"/>
      <button
        onClick={toggleMobileMenu}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Menú"
      >
        <span className="material-symbols-outlined text-3xl">
          {mobileMenuOpen ? "close" : "menu"}
        </span>
      </button>
    </div>
  );

  // Overlay SOLO para móvil
  const MobileOverlay = () => (
    <div
      className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
        mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={toggleMobileMenu}
    />
  );

  return (
    <>
      {/* Elementos solo visibles en móvil */}
      <MobileHeader />
      <MobileOverlay />

      {/* Sidebar - se comporta diferente en móvil y desktop */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-blue-800 text-white flex flex-col z-50 shadow-2xl
          w-64 // Mismo ancho siempre
          transition-transform duration-300 ease-in-out
          // En móvil: se desliza
          md:translate-x-0 // En desktop: siempre visible
          ${isMobile ? (mobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        `}
      >
        {/* LOGO - igual que antes */}
        <div className="pt-10 pb-2 px-3 text-center border-b border-blue-600 flex flex-col items-center gap-2 bg-white shadow-2xl">
          <img
            src="/logo-das.png"
            alt="Logo DAS"
            className="w-full h-auto object-contain"
          />
          <h1 className="text-xl font-bold text-white">SISTEMA WEB</h1>
        </div>

        {/* MENÚ - igual que antes */}
        <nav className="flex-1 py-5 space-y-3">
          {rol?.toLowerCase().trim() === "profesor" && (
            <>
              <NavLink
                to="/profesor/subir-trabajos"
                className={({ isActive }) =>
                  `flex items-center gap-2 pl-[13px] py-4 rounded transition
                   ${isActive ? "border-l-4 border-white bg-white/10" : "hover:border-l-4 hover:bg-white/10"}`
                }
                onClick={() => isMobile && setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  cloud_upload
                </span>
                <span className="text-white font-extrabold">Subir Trabajos</span>
              </NavLink>

              <NavLink
                to="/profesor/mis-cursos"
                className={({ isActive }) =>
                  `flex items-center gap-2 pl-[13px] py-4 rounded transition
                  ${isActive ? "border-l-4 border-white bg-white/10" : "hover:border-l-4 hover:bg-white/10"}`
                }
                onClick={() => isMobile && setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  school
                </span>
                <span className="text-white font-extrabold">Mis Cursos</span>
              </NavLink>
            </>
          )}

          {rol?.toLowerCase().trim() === "director" && (
            <>
              <NavLink
                to="/director"
                className={({ isActive }) =>
                  `flex items-center gap-2 pl-[13px] py-4 rounded transition
                   ${isActive ? "border-l-4 border-white bg-white/10" : "hover:border-l-4 hover:bg-white/10"}`
                }
                onClick={() => isMobile && setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  cloud_upload
                </span>
                <span className="text-white font-extrabold">Trabajos subidos</span>
              </NavLink>
              
              <NavLink
                to="/asignar-cursos"
                className={({ isActive }) =>
                  `flex items-center gap-2 pl-[13px] py-4 rounded transition
                   ${isActive ? "border-l-4 border-white bg-white/10" : "hover:border-l-4 hover:bg-white/10"}`
                }
                onClick={() => isMobile && setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  school
                </span>
                <span className="text-white font-extrabold">Asignar Cursos</span>
              </NavLink>

              <NavLink
                to="/alumnos"
                className={({ isActive }) =>
                  `flex items-center gap-2 pl-[13px] py-4 rounded transition
                   ${isActive ? "border-l-4 border-white bg-white/10" : "hover:border-l-4 hover:bg-white/10"}`
                }
                onClick={() => isMobile && setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  person_text
                </span>
                <span className="text-white font-extrabold">Registro Alumnos</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* BOTÓN SALIR - igual que antes */}
        <div className="p-4 border-t border-blue-600">
          <button
            onClick={salir}
            className="w-4/5 ml-[10%] mb-10 bg-red-600/70 text-[#fca5a5] border border-red-600/50 px-5 py-1 rounded-md cursor-pointer text-sm font-semibold shadow-2xl transition-all duration-200 flex items-center justify-center gap-2 hover:bg-red-600/80 hover:text-white"
          >
            <span className="material-symbols-outlined text-4xl">logout</span>
            <span className="text-xl">SALIR</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;