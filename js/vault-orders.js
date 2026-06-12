/* =========================================================================
   VAULT — Mis Pedidos (vault-orders.html)
   Requiere vault-common.js cargado antes que este archivo.
   ========================================================================= */

let orders = getOrders();
let activeFilter = 'all';

const statusConfig = {
  created:   { label: 'Creado',    step: 0, class: 'created' },
  preparing: { label: 'Preparando', step: 1, class: 'created' },
  shipped:   { label: 'En camino', step: 2, class: 'shipped' },
  delivered: { label: 'Entregado', step: 3, class: 'delivered' },
  cancelled: { label: 'Cancelado', step: -1, class: 'cancelled' },
};

const trackSteps = [
  { id: 'created',   label: 'Creado',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>` },
  { id: 'preparing', label: 'Prep.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/></svg>` },
  { id: 'shipped',   label: 'Camino',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>` },
  { id: 'delivered', label: 'Listo',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
];

function renderOrders() {
  const container = document.getElementById('ordersContainer');
  const filtered = activeFilter === 'all' ? orders : orders.filter(o => o.status === activeFilter);

  document.getElementById('ordersCount').textContent = `${filtered.length} pedido${filtered.length !== 1 ? 's' : ''}`;

  if (!orders.length) {
    document.getElementById('demoBanner').style.display = 'none';
    container.innerHTML = `
      <div class="empty-orders">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <h3>Sin pedidos aún</h3>
        <p>Tus compras aparecerán aquí una vez realizadas.</p>
        <a href="index.html" class="btn-go">Ir a la tienda</a>
      </div>`;
    return;
  }

  if (!filtered.length) {
    container.innerHTML = `<p style="color:var(--muted);font-size:0.82rem;letter-spacing:0.06em;padding:2rem 0;text-align:center;">Sin pedidos con ese estado.</p>`;
    return;
  }

  container.innerHTML = filtered.map(order => {
    const cfg = statusConfig[order.status] || statusConfig.created;
    const { total } = calculateTotals(order.items);
    const previewImgs = order.items.slice(0, 4);
    const extra = order.items.length - 4;

    const miniTrack = order.status !== 'cancelled' ? `
      <div class="mini-track" style="max-width:320px;">
        ${trackSteps.map((step, i) => {
          const isDone = i < cfg.step;
          const isActive = i === cfg.step;
          return `
            <div class="mini-step">
              <div class="mini-dot ${isDone?'done':isActive?'active':''}">
                ${step.icon}
              </div>
              <div class="mini-label ${isDone?'done':isActive?'active':''}">${step.label}</div>
            </div>`;
        }).join('')}
      </div>` : `<span style="font-size:0.72rem;color:var(--danger);letter-spacing:0.08em;">Pedido cancelado</span>`;

    return `
      <div class="order-card" id="card-${escHtml(order.id)}">
        <div class="order-card-header">
          <div>
            <div class="order-id">${escHtml(order.id)}</div>
            <div class="order-date">${formatDate(order.date, { day:'2-digit', month:'short', year:'numeric' })}</div>
          </div>
          <div class="order-header-right">
            <span class="status-badge ${cfg.class}">
              <span class="status-dot"></span>
              ${cfg.label}
            </span>
            <span class="order-total-label">$${total.toFixed(2)}</span>
          </div>
        </div>
        <div class="order-card-body">
          <div class="order-items-preview">
            ${previewImgs.map(item => `<img class="preview-img" src="${item.image}" alt="${escHtml(item.title)}" title="${escHtml(item.title)}" />`).join('')}
            ${extra > 0 ? `<div class="preview-more">+${extra}</div>` : ''}
          </div>
          ${miniTrack}
        </div>
        <!-- Expanded detail -->
        <div class="order-detail" id="detail-${escHtml(order.id)}">
          <div class="detail-items">
            ${order.items.map(item => `
              <div class="detail-item">
                <img class="detail-item-img" src="${item.image}" alt="${escHtml(item.title)}" />
                <div class="detail-item-name">
                  <div>${escHtml(item.title)}</div>
                  <div class="detail-item-meta">Cant. ${item.qty}</div>
                </div>
                <div class="detail-item-price">$${(item.price * item.qty).toFixed(2)}</div>
              </div>
            `).join('')}
          </div>
          <div class="detail-info">
            <div class="detail-field"><label>Cliente</label><p>${escHtml(order.customer.name)}</p></div>
            <div class="detail-field"><label>Correo</label><p>${escHtml(order.customer.email)}</p></div>
            <div class="detail-field"><label>Dirección</label><p>${escHtml(order.customer.address)}</p></div>
          </div>
        </div>
        <div class="order-card-footer">
          <button class="btn-sm" onclick="toggleDetail('${escHtml(order.id)}', this)">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            Ver detalle
          </button>
          <a href="vault-confirmation.html?order=${encodeURIComponent(order.id)}" class="btn-sm primary">Ver seguimiento</a>
        </div>
      </div>`;
  }).join('');

  // Demo controls
  buildDemoControls();
}

function toggleDetail(orderId, btn) {
  const detail = document.getElementById('detail-' + orderId);
  const isOpen = detail.classList.toggle('open');
  btn.innerHTML = isOpen
    ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg> Ocultar`
    : `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg> Ver detalle`;
}

function buildDemoControls() {
  const ctrl = document.getElementById('demoControls');
  if (!orders.length) { ctrl.innerHTML = ''; return; }

  // Pick first non-delivered order to demo
  const demoOrder = orders.find(o => o.status !== 'delivered' && o.status !== 'cancelled') || orders[0];
  if (!demoOrder) return;

  const nextMap = { created: 'shipped', shipped: 'delivered' };
  const next = nextMap[demoOrder.status];

  ctrl.innerHTML = `
    <span style="font-size:0.68rem;letter-spacing:0.08em;color:var(--muted);">${escHtml(demoOrder.id)}:</span>
    ${next ? `<button class="demo-btn" onclick="advanceStatus('${escHtml(demoOrder.id)}')">→ ${statusConfig[next].label}</button>` : ''}
    <button class="demo-btn" onclick="resetOrders()" style="color:var(--danger);border-color:rgba(192,57,43,0.3)">Limpiar pedidos</button>
  `;
}

function advanceStatus(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  const nextMap = { created: 'shipped', shipped: 'delivered' };
  const next = nextMap[order.status];
  if (next) {
    order.status = next;
    saveOrders(orders);
    renderOrders();
  }
}

function resetOrders() {
  if (confirm('¿Limpiar todos los pedidos? (solo para demo)')) {
    saveOrders([]);
    orders = [];
    renderOrders();
  }
}

// Filter tabs
document.querySelectorAll('.status-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeFilter = tab.dataset.filter;
    renderOrders();
  });
});

renderOrders();
