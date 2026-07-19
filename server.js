const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'ecommerce-demo-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  next();
}

// ---------- Auth ----------
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(400).json({ error: 'Email already registered' });
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hash);
  req.session.userId = info.lastInsertRowid;
  req.session.userName = name;
  res.json({ id: info.lastInsertRowid, name, email });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }
  req.session.userId = user.id;
  req.session.userName = user.name;
  res.json({ id: user.id, name: user.name, email: user.email });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.json(null);
  res.json({ id: req.session.userId, name: req.session.userName });
});

// ---------- Products ----------
app.get('/api/products', (req, res) => {
  res.json(db.prepare('SELECT * FROM products').all());
});

app.get('/api/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

// ---------- Cart ----------
app.get('/api/cart', requireAuth, (req, res) => {
  const items = db.prepare(`
    SELECT c.id as cart_id, c.quantity, p.*
    FROM cart_items c JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `).all(req.session.userId);
  res.json(items);
});

app.post('/api/cart', requireAuth, (req, res) => {
  const { product_id, quantity } = req.body;
  const qty = quantity && quantity > 0 ? quantity : 1;
  const existing = db.prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?')
    .get(req.session.userId, product_id);
  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?').run(qty, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)')
      .run(req.session.userId, product_id, qty);
  }
  res.json({ ok: true });
});

app.put('/api/cart/:cartId', requireAuth, (req, res) => {
  const { quantity } = req.body;
  if (quantity <= 0) {
    db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(req.params.cartId, req.session.userId);
  } else {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?')
      .run(quantity, req.params.cartId, req.session.userId);
  }
  res.json({ ok: true });
});

app.delete('/api/cart/:cartId', requireAuth, (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(req.params.cartId, req.session.userId);
  res.json({ ok: true });
});

// ---------- Orders / Checkout ----------
app.post('/api/checkout', requireAuth, (req, res) => {
  const items = db.prepare(`
    SELECT c.id as cart_id, c.quantity, p.id as product_id, p.price
    FROM cart_items c JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `).all(req.session.userId);

  if (items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const result = db.transaction(() => {
    const orderInfo = db.prepare('INSERT INTO orders (user_id, total) VALUES (?, ?)')
      .run(req.session.userId, total);
    const orderId = orderInfo.lastInsertRowid;
    const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
    for (const item of items) {
      insertItem.run(orderId, item.product_id, item.quantity, item.price);
    }
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.session.userId);
    return orderId;
  })();

  res.json({ orderId: result, total });
});

app.get('/api/orders', requireAuth, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.session.userId);
  const withItems = orders.map(o => ({
    ...o,
    items: db.prepare(`
      SELECT oi.quantity, oi.price, p.name, p.image
      FROM order_items oi JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(o.id)
  }));
  res.json(withItems);
});

app.listen(PORT, () => {
  console.log(`E-commerce store running at http://localhost:${PORT}`);
});
