-- Insertar usuario director (contraseña: admin123)
INSERT INTO usuarios (nombre, email, password, rol) VALUES 
('Administrador', 'admin@colegio.edu', '$2a$10$XQ6q3qQ6q3qQ6q3qQ6q3qO', 'director');

-- Insertar usuario profesor (contraseña: profesor123)
INSERT INTO usuarios (nombre, email, password, rol) VALUES 
('Profesor Demo', 'profesor@colegio.edu', '$2a$10$YQ7r4rYQ7r4rYQ7r4rYQ7r', 'profesor')
RETURNING id;

-- Usar el ID retornado (ejemplo: 2)
INSERT INTO profesores (usuario_id, nombres, apellidos, dni, telefono, especialidad) 
VALUES (2, 'Carlos', 'García', '87654321', '987654321', 'Matemáticas');

-- Insertar algunos alumnos de ejemplo
INSERT INTO alumnos (nombres, apellidos, dni, grado, seccion, fecha_nacimiento, direccion, telefono) VALUES
('Juan', 'Pérez', '12345678', '5to', 'A', '2010-05-15', 'Av. Principal 123', '999888777'),
('María', 'López', '23456789', '4to', 'B', '2011-08-22', 'Calle Secundaria 456', '999888666');