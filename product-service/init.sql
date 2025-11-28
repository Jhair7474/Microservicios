CREATE DATABASE IF NOT EXISTS products_db;
USE products_db;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos de prueba opcionales
INSERT INTO products (name, price, stock) VALUES 
('Laptop X1', 1200.00, 15),
('Smartphone Z', 550.50, 22),
('Monitor Curvo', 300.00, 10);