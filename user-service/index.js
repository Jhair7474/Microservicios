const express = require('express');
const pool = require('./db');
const app = express();
const cors = require('cors');
const PORT = 3001; 

app.use(cors());
app.use(express.json());

app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const [result] = await pool.execute(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email]
    );
    
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM users ORDER BY id ASC");
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    const [result] = await pool.execute(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
    res.status(200).json(rows[0]);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`--- Microservicio de USUARIOS (MySQL) ---`);
  console.log(`Corriendo en http://localhost:${PORT}`);
});