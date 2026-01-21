import { NavLink, useNavigate } from "react-router-dom";

function Sidebar({ rol }) {
  const navigate = useNavigate();

  const salir = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    navigate("/");
  };

  console.log("ROL ACTUAL:", rol); // PARA DEPURACIÓN

  return (
    <div className="fixed top-0 left-0 w-64 h-screen bg-blue-800 text-white flex flex-col z-50 shadow-2xl">
      
      {/* LOGO */}
      <div className="pt-10 pb-2 px-3 text-center border-b border-blue-600 flex flex-col items-center gap-2 bg-white shadow-2xl">
        <img
          src="/logo-das.png"
          alt="Logo DAS"
          className="w-full h-auto object-contain"
        />
        <h1 className="text-xl font-bold text-white">SISTEMA WEB</h1>
      </div>

      {/* MENÚ */}
      <nav className="flex-1 py-5 space-y-3">
        {rol?.toLowerCase().trim() === "profesor" && (
          <NavLink
            to="/profesor"
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
        )}

        {rol?.toLowerCase().trim() === "director" && (
          <>
            <NavLink
              to="/director"
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
              to="/alumnos"
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
  );
}

export default Sidebar;
