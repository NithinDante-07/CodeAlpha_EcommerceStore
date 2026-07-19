# 🛒 Store — Full-Stack E-commerce App

A full-stack e-commerce store where users can browse products, manage a shopping cart, check out, and view their order history — built from scratch to practice end-to-end web development, from database schema to UI.

`Node.js` `Express` `SQLite` `bcrypt` `Sessions` `Vanilla JS`

## Why I built this

This was Task 1 of a full-stack development challenge: build a working e-commerce site with real authentication, a real database, and a real checkout flow — not just static mockups. The goal was to understand how the pieces of a full-stack app actually connect: frontend fetch calls → Express routes → SQL queries → back to the browser.

## Features

- 🛍️ Product catalog with images, descriptions, and pricing
- 🔍 Product detail pages
- 🛒 Shopping cart — add, update quantity, remove items
- 🔐 User registration & login with hashed passwords (bcrypt) and session-based auth
- 💳 Checkout flow that creates a real order in the database
- 📦 Order history page

## Tech stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express |
| Database | SQLite (via `better-sqlite3`) |
| Auth | bcrypt password hashing, `express-session` |
| Frontend | Vanilla HTML, CSS, JavaScript (fetch API) |

## Getting started

```bash
npm install
npm start
```

Then open **http://localhost:3000**. The database is created and seeded automatically on first run — 8 sample products, no setup required.

## API overview

```
POST   /api/register        Create an account
POST   /api/login            Log in
POST   /api/logout           Log out
GET    /api/products         List all products
GET    /api/products/:id     Product detail
GET    /api/cart             View cart (auth required)
POST   /api/cart             Add item to cart
PUT    /api/cart/:cartId     Update quantity
DELETE /api/cart/:cartId     Remove item
POST   /api/checkout         Place order
GET    /api/orders           Order history
```

## What I'd add next

- Product search & category filters
- Admin panel for managing inventory
- Real payment integration (Stripe test mode)

---
Part of a 3-project full-stack series — see also the [Social Media Platform](../social-platform) and [Project Management Tool](../project-tool).
