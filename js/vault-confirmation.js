/* =========================================================================
   VAULT — Confirmación (vault-confirmation.html)
   Requiere vault-common.js cargado antes que este archivo.
   ========================================================================= */

function statusLabel(s) {
  const map = { created:'Creado', shipped:'En camino', delivered:'Entregado', cancelled:'Cancelado' };
  return map[s] || s;
}

const params = new URLSearchParams(window.location.search);
const orderId = params.get('order');
const orders = getOrders();
const order = orders.find(o => o.id === orderId) || orders[0];

const page = document.getElementById('pageContent');

if (!order) {
  page.innerHTML = `<p style="color:var(--muted);text-align:center;padding:4rem 0;font-size:0.82rem;letter-spacing:0.1em;">No se encontró la orden. <a href="vault-store.html" style="color:var(--gold)">Volver a la tienda</a></p>`;
} else {
  const { total } = calculateTotals(order.items);

  const trackSteps = [
    { id: 'created', label: 'Creado', sub: 'Orden registrada',
      icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>` },
    { id: 'preparing', label: 'Preparando', sub: 'En bodega',
      icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>` },
    { id: 'shipped', label: 'En camino', sub: 'Con courier',
      icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></svg>` },
    { id: 'delivered', label: 'Entregado', sub: 'En tu puerta',
      icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
  ];

  // Determine step states
  const statusMap = { created: 0, preparing: 1, shipped: 2, delivered: 3 };
  const currentStep = statusMap[order.status] || 0;

  page.innerHTML = `
    <div class="success-circle">
      <svg width="36" height="36" viewBox="0 0 52 52" fill="none">
        <polyline class="checkmark" points="14,27 22,35 38,19" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="confirmation-header">
      <h1>¡Tu compra fue<br /><em>exitosa!</em></h1>
      <p>Recibirás un correo de confirmación pronto.</p>
      <div class="order-id-badge">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
        Pedido ${escHtml(order.id)}
      </div>
    </div>

    <!-- Status track -->
    <div class="conf-card">
      <div class="conf-card-header">
        <span>Estado del pedido</span>
        <span style="color:var(--gold);font-size:0.72rem;letter-spacing:0.1em;">${statusLabel(order.status)}</span>
      </div>
      <div class="conf-card-body">
        <div class="status-track">
          ${trackSteps.map((step, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            return `
              <div class="track-step">
                <div class="track-dot ${isDone ? 'done' : isActive ? 'active' : ''}">
                  ${step.icon}
                </div>
                <div class="track-label ${isDone ? 'done' : isActive ? 'active' : ''}">${step.label}</div>
                <div class="track-sublabel ${isActive ? 'active' : ''}">${step.sub}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Order items -->
    <div class="conf-card">
      <div class="conf-card-header">
        <span>Artículos</span>
        <span>${order.items.reduce((s,i)=>s+i.qty,0)} productos</span>
      </div>
      <div class="conf-card-body">
        <div class="order-items">
          ${order.items.map(item => `
            <div class="order-item">
              <img class="order-item-img" src="${item.image}" alt="${escHtml(item.title)}" />
              <div class="order-item-info">
                <div class="order-item-name">${escHtml(item.title)}</div>
                <div class="order-item-meta">Cant. ${item.qty} · $${item.price.toFixed(2)} c/u</div>
              </div>
              <div class="order-item-price">$${(item.price * item.qty).toFixed(2)}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="total-line">
        <span>Total pagado</span>
        <strong>$${total.toFixed(2)}</strong>
      </div>
    </div>

    <!-- Info -->
    <div class="conf-card">
      <div class="conf-card-header"><span>Detalles del pedido</span></div>
      <div class="conf-card-body">
        <div class="info-grid">
          <div class="info-block">
            <label>Fecha</label>
            <p>${formatDate(order.date)}</p>
          </div>
          <div class="info-block">
            <label>Cliente</label>
            <p>${escHtml(order.customer.name)}</p>
          </div>
          <div class="info-block">
            <label>Correo</label>
            <p>${escHtml(order.customer.email)}</p>
          </div>
          <div class="info-block">
            <label>Dirección de envío</label>
            <p>${escHtml(order.customer.address)}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <a href="vault-orders.html" class="btn-secondary">Ver mis pedidos</a>
      <a href="vault-store.html" class="btn-primary">Seguir comprando</a>
    </div>
  `;
}
