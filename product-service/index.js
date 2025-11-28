
const express = require('express');
const pool = require('./db');
const app = express();
const PORT = 3002;

app.use(express.json());


app.post('/products', async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    
    const [result] = await pool.execute(
      "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
      [name, price, stock]
    );
    
    const [rows] = await pool.execute("SELECT * FROM products WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM products ORDER BY id ASC");
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute("SELECT * FROM products WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock } = req.body;

    const [result] = await pool.execute(
      "UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?",
      [name, price, stock, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const [rows] = await pool.execute("SELECT * FROM products WHERE id = ?", [id]);
    res.status(200).json(rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json({ message: 'Producto eliminado' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`--- Microservicio de PRODUCTOS (MySQL) ---`);
  console.log(`Corriendo en http://localhost:${PORT}`);
});