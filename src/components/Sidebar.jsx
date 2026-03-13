import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Sidebar({ rol }) {
  const navigate = useNavigate();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarAbierto(false); // Cerrar sidebar en desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarAbierto(!sidebarAbierto);
  };

  const cerrarSidebar = () => {
    setSidebarAbierto(false);
  };

  const salir = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    navigate("/");
    cerrarSidebar();
  };

  console.log("ROL ACTUAL:", rol); // PARA DEPURACIÓN

  return (
    <>
      {/* ============================================ */}
      {/* BARRA SUPERIOR (solo visible en móvil) */}
      {/* ============================================ */}
      <div className="fixed top-0 left-0 right-0 bg-blue-800 text-white h-16 z-50 shadow-lg md:hidden flex items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center h-full py-2">
          <img 
            src="/logo-das.png" 
            alt="Logo DAS" 
            className="h-10 w-auto object-contain bg-white rounded-lg p-1"
          />
          <span className="ml-2 font-bold text-sm text-white">SISTEMA WEB</span>
        </div>

        {/* Botón hamburguesa con animación */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none"
          aria-label="Menú"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span 
              className={`w-full h-0.5 bg-white transform transition-all duration-300 origin-left ${
                sidebarAbierto ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span 
              className={`w-full h-0.5 bg-white transition-all duration-300 ${
                sidebarAbierto ? 'opacity-0' : ''
              }`}
            />
            <span 
              className={`w-full h-0.5 bg-white transform transition-all duration-300 origin-left ${
                sidebarAbierto ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {/* ============================================ */}
      {/* OVERLAY (fondo oscuro cuando sidebar está abierto en móvil) */}
      {/* ============================================ */}
      {sidebarAbierto && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={cerrarSidebar}
        />
      )}

      {/* ============================================ */}
      {/* SIDEBAR (con animación de deslizamiento) */}
      {/* ============================================ */}
      <div className={`
        fixed top-0 left-0 w-64 h-screen bg-blue-800 text-white flex flex-col z-50 shadow-2xl
        transition-transform duration-300 ease-in-out
        ${sidebarAbierto || !isMobile ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        
        {/* LOGO (visible en desktop, oculto en móvil porque ya está en la barra) */}
        <div className="hidden md:block pt-10 pb-2 px-3 text-center border-b border-blue-600">
          <img
            src="/logo-das.png"
            alt="Logo DAS"
            className="w-full h-auto object-contain"
          />
          <h1 className="text-xl font-bold text-white mt-2">SISTEMA WEB</h1>
        </div>

        {/* Espaciado para móvil (para que no quede debajo de la barra superior) */}
        {isMobile && <div className="h-16"></div>}

        {/* MENÚ */}
        <nav className="flex-1 py-5 space-y-3 overflow-y-auto">
          {rol?.toLowerCase().trim() === "profesor" && (
            <>
              <NavLink
                to="/profesor/subir-trabajos"
                onClick={cerrarSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-2 pl-[13px] py-4 rounded transition
                   ${isActive ? "border-l-4 border-white bg-white/10" : "hover:border-l-4 hover:bg-white/10"}`
                }
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  cloud_upload
                </span>
                <span className="text-white font-extrabold">Subir Trabajos</span>
              </NavLink>

              <NavLink
                to="/profesor/mis-cursos"
                onClick={cerrarSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-2 pl-[13px] py-4 rounded transition
                  ${isActive ? "border-l-4 border-white bg-white/10" : "hover:border-l-4 hover:bg-white/10"}`
                }
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
                onClick={cerrarSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-2 pl-[13px] py-4 rounded transition
                   ${isActive ? "border-l-4 border-white bg-white/10" : "hover:border-l-4 hover:bg-white/10"}`
                }
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  cloud_upload
                </span>
                <span className="text-white font-extrabold">Trabajos subidos</span>
              </NavLink>
              
              <NavLink
                to="/asignar-cursos"
                onClick={cerrarSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-2 pl-[13px] py-4 rounded transition
                   ${isActive ? "border-l-4 border-white bg-white/10" : "hover:border-l-4 hover:bg-white/10"}`
                }
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  school
                </span>
                <span className="text-white font-extrabold">Asignar Cursos</span>
              </NavLink>

              <NavLink
                to="/alumnos"
                onClick={cerrarSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-2 pl-[13px] py-4 rounded transition
                   ${isActive ? "border-l-4 border-white bg-white/10" : "hover:border-l-4 hover:bg-white/10"}`
                }
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  person_text
                </span>
                <span className="text-white font-extrabold">Registro Alumnos</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* BOTÓN SALIR */}
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