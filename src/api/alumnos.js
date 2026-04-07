// Usar variable de entorno de Vite para la URL base de la API
const API = `${import.meta.env.VITE_API_URL}/alumnos`;

// Función para obtener headers con token
function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

// Obtener todos los alumnos
export async function getAlumnos() {
  try {
    const res = await fetch(API, {
      headers: getHeaders()
    });
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error("Error obteniendo alumnos:", error);
    throw error;
  }
}

// Crear alumno
export async function crearAlumno(data) {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Error al crear alumno");
    }

    return await res.json();
  } catch (error) {
    console.error("Error creando alumno:", error);
    throw error;
  }
}

// Eliminar alumno
export async function eliminarAlumno(id) {
  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Error al eliminar alumno");
    }

    return await res.json();
  } catch (error) {
    console.error("Error eliminando alumno:", error);
    throw error;
  }
}

// Actualizar alumno
export const actualizarAlumno = async (id, alumnoData) => {
  try {
    console.log("📤 Actualizando alumno ID:", id, alumnoData);
    
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(alumnoData)
    });
    
    const data = await res.json();
    console.log("📥 Respuesta:", data);
    
    if (!res.ok) {
      throw new Error(data.message || "Error al actualizar alumno");
    }
    return data;
  } catch (error) {
    console.error("Error en actualizarAlumno:", error);
    throw error;
  }
};