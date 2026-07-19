const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'store.db'));

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image TEXT,
  stock INTEGER DEFAULT 100
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  total REAL NOT NULL,
  status TEXT DEFAULT 'placed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id),
  FOREIGN KEY(product_id) REFERENCES products(id)
);
`);

const count = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
if (count === 0) {
  const insert = db.prepare('INSERT INTO products (name, description, price, image, stock) VALUES (?, ?, ?, ?, ?)');
  const seed = [
    ['Wireless Headphones', 'Over-ear headphones with noise cancellation and 30hr battery life.', 2499, 'https://picsum.photos/seed/headphones/400/300', 40],
    ['Mechanical Keyboard', 'RGB backlit mechanical keyboard with blue switches.', 3299, 'https://picsum.photos/seed/keyboard/400/300', 25],
    ['Smart Watch', 'Fitness tracking smart watch with heart-rate monitor.', 4599, 'https://picsum.photos/seed/watch/400/300', 30],
    ['Backpack', 'Water-resistant laptop backpack, 25L capacity.', 1499, 'https://picsum.photos/seed/backpack/400/300', 60],
    ['Portable Speaker', 'Bluetooth speaker with 12 hour playtime.', 1899, 'https://picsum.photos/seed/speaker/400/300', 45],
    ['Desk Lamp', 'LED desk lamp with adjustable brightness.', 899, 'https://picsum.photos/seed/lamp/400/300', 70],
    ['Coffee Mug Set', 'Set of 4 ceramic coffee mugs.', 699, 'https://picsum.photos/seed/mug/400/300', 100],
    ['Running Shoes', 'Lightweight running shoes with cushioned sole.', 3199, 'https://picsum.photos/seed/shoes/400/300', 35],
  ];
  const insertMany = db.transaction((rows) => {
    for (const r of rows) insert.run(...r);
  });
  insertMany(seed);
}

module.exports = db;
