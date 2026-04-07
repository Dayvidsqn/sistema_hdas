import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Sidebar({ rol }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
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

  // Header superior para móvil - BLANCO
  const MobileHeader = () => (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="relative flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <div className="flex-1 flex items-center">
          <img 
            src="/logo-das.png" 
            alt="Logo DAS" 
            className="h-12 w-auto object-contain"
          />
        </div>
        
        {/* Botón de menú */}
        <button
          onClick={toggleMobileMenu}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
          aria-label="Menú"
        >
          <span className="material-symbols-outlined text-2xl text-gray-700">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>
    </div>
  );

  // Overlay para móvil
  const MobileOverlay = () => (
    <div
      className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300 ${
        mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={toggleMobileMenu}
    />
  );

  // Clase base para los items del menú
  const getNavLinkClass = ({ isActive }) => `
    relative flex items-center gap-3 px-6 py-3.5 transition-all duration-200 w-full
    ${isActive 
      ? "text-white bg-gradient-to-r from-blue-700 to-blue-800 shadow-lg" 
      : "text-blue-100 hover:bg-white/5 hover:text-white"
    }
  `;

  // Indicador de activo (barra lateral izquierda)
  const ActiveIndicator = ({ isActive }) => (
    <div 
      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-all duration-200 ${
        isActive ? "bg-white shadow-sm" : "opacity-0"
      }`}
    />
  );

  return (
    <>
      <MobileHeader />
      <MobileOverlay />

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-blue-800 to-blue-900
          flex flex-col z-50 shadow-2xl w-72
          transition-transform duration-300 ease-out
          ${isMobile ? (mobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          md:translate-x-0
        `}
      >
        {/* LOGO - Desktop */}
        <div className="hidden md:block w-full border-b border-white/10 bg-white">
          <div className="w-full bg-white/5">
            <img
              src="/logo-das.png"
              alt="Logo DAS"
              className="w-full h-auto object-cover my-5"
            />
          </div>
        </div>

        {/* Título móvil dentro del sidebar */}
        {isMobile && (
          <div className="pt-20 pb-4 px-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              
              <div>
                <h2 className="text-lg font-bold text-white">Menú</h2>
                
              </div>
            </div>
          </div>
        )}

        {/* MENÚ */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <div className="space-y-1">
            {rol?.toLowerCase().trim() === "profesor" && (
              <>
                <NavLink
                  to="/profesor/subir-trabajos"
                  className={getNavLinkClass}
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      <ActiveIndicator isActive={isActive} />
                      <span className="material-symbols-outlined text-2xl">
                        cloud_upload
                      </span>
                      <span className="font-medium">Subir Trabajos</span>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to="/profesor/mis-cursos"
                  className={getNavLinkClass}
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      <ActiveIndicator isActive={isActive} />
                      <span className="material-symbols-outlined text-2xl">
                        school
                      </span>
                      <span className="font-medium">Mis Cursos</span>
                    </>
                  )}
                </NavLink>
              </>
            )}

            {rol?.toLowerCase().trim() === "director" && (
              <>
                <NavLink
                  to="/director"
                  className={getNavLinkClass}
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      <ActiveIndicator isActive={isActive} />
                      <span className="material-symbols-outlined text-2xl">
                        folder_open
                      </span>
                      <span className="font-medium">Trabajos Subidos</span>
                    </>
                  )}
                </NavLink>
                
                <NavLink
                  to="/asignar-cursos"
                  className={getNavLinkClass}
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      <ActiveIndicator isActive={isActive} />
                      <span className="material-symbols-outlined text-2xl">
                        assignment_ind
                      </span>
                      <span className="font-medium">Asignar Cursos</span>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to="/alumnos"
                  className={getNavLinkClass}
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      <ActiveIndicator isActive={isActive} />
                      <span className="material-symbols-outlined text-2xl">
                        group
                      </span>
                      <span className="font-medium">Registro Alumnos</span>
                    </>
                  )}
                </NavLink>
              </>
            )}
          </div>
        </nav>

        {/* BOTÓN SALIR */}
        <div className="p-4 border-t border-white/10 mt-auto">
          <button
            onClick={salir}
            className="w-full group flex items-center justify-center gap-3 px-4 py-3 rounded-xl
                       bg-red-500/10 hover:bg-red-500/20 border border-red-500/30
                       transition-all duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-red-300 text-2xl group-hover:scale-110 transition-transform">
              logout
            </span>
            <span className="text-red-300 font-semibold tracking-wide">CERRAR SESIÓN</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;