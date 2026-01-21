const API = "http://localhost:3001/api/alumnos";

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

    return await res.json();
  } catch (error) {
    console.error("Error eliminando alumno:", error);
    throw error;
  }
}