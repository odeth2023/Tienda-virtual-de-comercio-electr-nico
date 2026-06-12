/* =========================================================================
   VAULT — Tienda (index.html)
   Requiere vault-common.js cargado antes que este archivo.
   ========================================================================= */

let allProducts = [], filteredProducts = [], activeCategory = 'all', currentProduct = null;
let cart = getCart();

const grid = document.getElementById('productsGrid');
const countLabel = document.getElementById('productsCount');
const heroCount = document.getElementById('productCountHero');
const filterTabs = document.getElementById('filterTabs');
const sortSelect = document.getElementById('sortSelect');
const searchInput = document.getElementById('searchInput');
const cartPanel = document.getElementById('cartPanel');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartItemsLbl = document.getElementById('cartItemsLabel');
const cartTotalEl = document.getElementById('cartTotal');
const cartEmptyEl = document.getElementById('cartEmpty');
const checkoutBtn = document.getElementById('checkoutBtn');
const modalOverlay = document.getElementById('modalOverlay');
const toastEl = document.getElementById('toast');

async function loadProducts() {
  try {
    const res = await fetch('https://fakestoreapi.com/products');
    const data = await res.json();
    allProducts = data;
    heroCount.textContent = allProducts.length;
    buildCategories();
    applyFilters();
  } catch (err) {
    grid.innerHTML = `<p style="color:var(--muted);grid-column:1/-1;padding:2rem 0">No se pudo cargar los productos. Verifica tu conexión.</p>`;
    countLabel.textContent = 'Error al cargar';
  }
}

function buildCategories() {
  const cats = [...new Set(allProducts.map(p => p.category))];
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-tab'; btn.dataset.cat = cat; btn.textContent = cat;
    btn.addEventListener('click', () => setCategory(cat));
    filterTabs.appendChild(btn);
  });
  filterTabs.querySelector('[data-cat="all"]').addEventListener('click', () => setCategory('all'));
}

function setCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  applyFilters();
}

function applyFilters() {
  const q = searchInput.value.toLowerCase().trim();
  let list = activeCategory === 'all' ? [...allProducts] : allProducts.filter(p => p.category === activeCategory);
  if (q) list = list.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  const sort = sortSelect.value;
  if (sort === 'price-asc') list.sort((a,b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);
  if (sort === 'rating') list.sort((a,b) => b.rating.rate - a.rating.rate);
  filteredProducts = list; renderProducts();
}

sortSelect.addEventListener('change', applyFilters);
searchInput.addEventListener('input', applyFilters);

function starsHTML(rate) {
  let html = '<div class="stars">';
  for (let i = 1; i <= 5; i++) {
    html += `<svg class="star ${i <= Math.round(rate) ? '' : 'empty'}" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  }
  return html + '</div>';
}

function renderProducts() {
  countLabel.textContent = `${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''}`;
  if (!filteredProducts.length) { grid.innerHTML = `<p style="color:var(--muted);grid-column:1/-1;padding:2rem 0">Sin resultados para tu búsqueda.</p>`; return; }
  grid.innerHTML = filteredProducts.map((p, i) => `
    <article class="product-card" data-id="${p.id}" style="animation-delay:${i*40}ms">
      <div class="card-img-wrap">
        ${p.rating.rate >= 4.5 ? '<span class="card-badge">Top</span>' : ''}
        <img src="${p.image}" alt="${escHtml(p.title)}" loading="lazy" />
      </div>
      <div class="card-body">
        <span class="card-category">${escHtml(p.category)}</span>
        <h3 class="card-title">${escHtml(p.title)}</h3>
        <div class="card-rating">${starsHTML(p.rating.rate)}<span class="rating-count">(${p.rating.count})</span></div>
        <div class="card-footer">
          <span class="card-price">$${p.price.toFixed(2)}</span>
          <button class="add-btn" data-id="${p.id}">+ Añadir</button>
        </div>
      </div>
    </article>
  `).join('');
  grid.querySelectorAll('.product-card').forEach(c => c.addEventListener('click', e => { if (!e.target.classList.contains('add-btn')) openModal(Number(c.dataset.id)); }));
  grid.querySelectorAll('.add-btn').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); addToCart(Number(b.dataset.id)); }));
}

function addToCart(id) {
  const p = allProducts.find(x => x.id === id); if (!p) return;
  const ex = cart.find(i => i.id === id);
  if (ex) ex.qty++; else cart.push({ id, qty: 1, title: p.title, price: p.price, image: p.image });
  saveCart(cart); updateCartUI();
  showToast(`"${p.title.slice(0, 32)}…" añadido al carrito`);
  cartCountEl.classList.remove('pulse'); void cartCountEl.offsetWidth; cartCountEl.classList.add('pulse');
}

function removeFromCart(id) { cart = cart.filter(i => i.id !== id); saveCart(cart); updateCartUI(); renderCartItems(); }

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id); if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id); else { saveCart(cart); updateCartUI(); renderCartItems(); }
}

function updateCartUI() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  if (total > 0) { cartCountEl.textContent = total > 9 ? '9+' : total; cartCountEl.classList.remove('hidden'); }
  else { cartCountEl.classList.add('hidden'); }
  cartItemsLbl.textContent = `${total} artículo${total !== 1 ? 's' : ''}`;
  cartTotalEl.textContent = `$${cart.reduce((s,i) => s + i.price * i.qty, 0).toFixed(2)}`;
  checkoutBtn.disabled = cart.length === 0;
}

function renderCartItems() {
  if (!cart.length) { cartItemsEl.innerHTML = ''; cartItemsEl.appendChild(cartEmptyEl); return; }
  cartEmptyEl.remove();
  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img class="cart-item-img" src="${item.image}" alt="${escHtml(item.title)}" />
      <div class="cart-item-info">
        <p class="cart-item-name">${escHtml(item.title)}</p>
        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
        <div class="cart-item-controls">
          <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
          <button class="remove-btn" data-id="${item.id}">Quitar</button>
        </div>
      </div>
    </div>
  `).join('');
  cartItemsEl.querySelectorAll('.qty-btn').forEach(b => b.addEventListener('click', () => changeQty(Number(b.dataset.id), Number(b.dataset.delta))));
  cartItemsEl.querySelectorAll('.remove-btn').forEach(b => b.addEventListener('click', () => removeFromCart(Number(b.dataset.id))));
}

function openCart() { cartPanel.classList.add('open'); cartOverlay.classList.add('open'); renderCartItems(); document.body.style.overflow = 'hidden'; }
function closeCart() { cartPanel.classList.remove('open'); cartOverlay.classList.remove('open'); document.body.style.overflow = ''; }

document.getElementById('openCart').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

checkoutBtn.addEventListener('click', () => { closeCart(); window.location.href = 'vault-checkout.html'; });

function openModal(id) {
  const p = allProducts.find(x => x.id === id); if (!p) return; currentProduct = p;
  document.getElementById('modalImg').src = p.image; document.getElementById('modalImg').alt = p.title;
  document.getElementById('modalCategory').textContent = p.category;
  document.getElementById('modalTitle').textContent = p.title;
  document.getElementById('modalDesc').textContent = p.description;
  document.getElementById('modalPrice').textContent = `$${p.price.toFixed(2)}`;
  document.getElementById('modalRating').innerHTML = starsHTML(p.rating.rate) + `<span class="rating-count">${p.rating.rate} · ${p.rating.count} reseñas</span>`;
  modalOverlay.classList.add('open'); document.body.style.overflow = 'hidden';
}

function closeModal() { modalOverlay.classList.remove('open'); document.body.style.overflow = ''; }
document.getElementById('modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.getElementById('modalAddBtn').addEventListener('click', () => { if (currentProduct) { addToCart(currentProduct.id); closeModal(); } });

let toastTimer;
function showToast(msg) { clearTimeout(toastTimer); toastEl.textContent = msg; toastEl.classList.add('show'); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800); }

document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeCart(); closeModal(); } });

updateCartUI(); loadProducts();
