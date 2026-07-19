// ---------- Shared helpers ----------
async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

function money(n) {
  return '₹' + Number(n).toFixed(2);
}

async function loadNav() {
  const nav = document.getElementById('nav');
  const me = await api('/api/me');
  let cartCount = 0;
  if (me) {
    try {
      const cart = await api('/api/cart');
      cartCount = cart.reduce((s, i) => s + i.quantity, 0);
    } catch (e) {}
  }
  nav.innerHTML = `
    <a href="/" class="brand">Store<span>.</span></a>
    <div class="nav-links">
      <a href="/">Shop</a>
      ${me ? `<a href="/orders.html">Orders</a>` : ''}
      <a href="/cart.html">Cart${cartCount ? `<span class="cart-badge">${cartCount}</span>` : ''}</a>
      ${me
        ? `<span>Hi, ${me.name}</span><a href="#" id="logoutLink">Logout</a>`
        : `<a href="/login.html">Login</a><a href="/register.html" class="btn">Sign up</a>`
      }
    </div>
  `;
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await api('/api/logout', { method: 'POST' });
      window.location.href = '/';
    });
  }
  return me;
}
