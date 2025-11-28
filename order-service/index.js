const express = require('express');
const pool = require('./db');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3003;

const USER_SERVICE_URL = 'http://localhost:3001';
const PRODUCT_SERVICE_URL = 'http://localhost:3002';

app.use(cors());
app.use(express.json());

app.get('/orders/proxy/users', async (req, res) => {
  try {
    const { data } = await axios.get(`${USER_SERVICE_URL}/users`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al contactar servicio de usuarios' });
  }
});

app.get('/orders/proxy/products', async (req, res) => {
  try {
    const { data } = await axios.get(`${PRODUCT_SERVICE_URL}/products`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al contactar servicio de productos' });
  }
});

app.post('/orders', async (req, res) => {
  const { userId, products } = req.body; 
  
  if (!userId || !products || products.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos para la orden' });
  }

  let connection; 
  
  try {
    try {
      await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
    } catch (userError) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    let totalPrice = 0;
    const productDetails = [];

    for (const item of products) {
      try {
        const { data: product } = await axios.get(`${PRODUCT_SERVICE_URL}/products/${item.productId}`);
        if (product.stock < item.quantity) {
          return res.status(400).json({ error: `Stock insuficiente para ${product.name}` });
        }
        productDetails.push({ ...product, quantity: item.quantity });
        totalPrice += product.price * item.quantity;
      } catch (productError) {
        return res.status(404).json({ error: `Producto con ID ${item.productId} no encontrado` });
      }
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orderResult] = await connection.execute(
      "INSERT INTO orders (user_id, total_price) VALUES (?, ?)",
      [userId, totalPrice]
    );
    const orderId = orderResult.insertId;

    for (const detail of productDetails) {
    
      await connection.execute(
        "INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_purchase) VALUES (?, ?, ?, ?, ?)",
        [orderId, detail.id, detail.name, detail.quantity, detail.price]
      );
      
      await axios.put(`${PRODUCT_SERVICE_URL}/products/${detail.id}`, {
        name: detail.name,
        price: detail.price,
        stock: detail.stock - detail.quantity 
      });
    }

    await connection.commit();

    res.status(201).json({ message: 'Orden creada exitosamente', orderId, totalPrice });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error(error.message);
    res.status(500).json({ error: 'Error interno al crear la orden' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.get('/orders', async (req, res) => {
  try {
    const { userId } = req.query;
    
    let query = `
      SELECT o.id, o.user_id, o.total_price, o.status, o.created_at,
             CONCAT('[', GROUP_CONCAT(
                JSON_OBJECT(
                  'productId', oi.product_id,
                  'productName', oi.product_name, 
                  'quantity', oi.quantity, 
                  'price', oi.price_at_purchase
                )
             ), ']') as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
    `;
    const params = [];

    if (userId) {
      query += " WHERE o.user_id = ?";
      params.push(userId);
    }

    query += " GROUP BY o.id ORDER BY o.created_at DESC";

    const [rows] = await pool.execute(query, params);
    
    const orders = rows.map(order => {
      const itemsParsed = order.items ? JSON.parse(order.items) : [];
      return {
        ...order,
        items: itemsParsed
      };
    });
    
    res.status(200).json(orders);
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});


app.listen(PORT, () => {
  console.log(`--- Microservicio de ÓRDENES (MySQL) ---`);
  console.log(`Corriendo en http://localhost:${PORT}`);
});