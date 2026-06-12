/* =========================================================================
   VAULT — Checkout (vault-checkout.html)
   Requiere vault-common.js cargado antes que este archivo.
   ========================================================================= */

let cart = getCart();
const content = document.getElementById('checkoutContent');

if (!cart.length) {
  content.innerHTML = `
    <div class="empty-checkout">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#2A2A2A" stroke-width="1.5">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      <p>Tu carrito está vacío.</p>
      <a href="index.html" class="go-shop">Ir a la tienda</a>
    </div>`;
} else {
  renderCheckout();
}

function renderCheckout() {
  const { subtotal, shipping, tax, total } = calculateTotals(cart);

  content.innerHTML = `
  <div class="checkout-layout">
    <!-- LEFT: form -->
    <div>
      <!-- Contact -->
      <div class="form-block">
        <div class="section-heading"><span class="num">1</span>Información de contacto</div>
        <div class="form-row">
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" id="fname" placeholder="Ana" />
            <span class="field-error" id="fnameErr">Nombre requerido</span>
          </div>
          <div class="form-group">
            <label>Apellido</label>
            <input type="text" id="lname" placeholder="García" />
            <span class="field-error" id="lnameErr">Apellido requerido</span>
          </div>
        </div>
        <div class="form-row full">
          <div class="form-group">
            <label>Correo electrónico</label>
            <input type="email" id="email" placeholder="ana@correo.com" />
            <span class="field-error" id="emailErr">Correo válido requerido</span>
          </div>
        </div>
        <div class="form-row full">
          <div class="form-group">
            <label>Teléfono</label>
            <input type="tel" id="phone" placeholder="+51 999 000 000" />
          </div>
        </div>
      </div>

      <!-- Shipping -->
      <div class="form-block">
        <div class="section-heading"><span class="num">2</span>Dirección de envío</div>
        <div class="form-row full">
          <div class="form-group">
            <label>Dirección</label>
            <input type="text" id="address" placeholder="Av. Larco 345" />
            <span class="field-error" id="addressErr">Dirección requerida</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Ciudad</label>
            <input type="text" id="city" placeholder="Lima" />
            <span class="field-error" id="cityErr">Ciudad requerida</span>
          </div>
          <div class="form-group">
            <label>Código postal</label>
            <input type="text" id="zip" placeholder="15046" />
          </div>
        </div>
        <div class="form-row full">
          <div class="form-group">
            <label>País</label>
            <select class="form-select" id="country">
              <option value="PE">Perú</option>
              <option value="MX">México</option>
              <option value="AR">Argentina</option>
              <option value="CO">Colombia</option>
              <option value="CL">Chile</option>
              <option value="US">Estados Unidos</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Payment -->
      <div class="form-block">
        <div class="section-heading"><span class="num">3</span>Método de pago</div>

        <div class="payment-methods" id="payMethods">
          <div class="pay-method active" data-method="card">
            <div class="pay-method-icon">💳</div>
            <div class="pay-method-label">Tarjeta</div>
          </div>
          <div class="pay-method" data-method="paypal">
            <div class="pay-method-icon">🅿️</div>
            <div class="pay-method-label">PayPal</div>
          </div>
          <div class="pay-method" data-method="bank">
            <div class="pay-method-icon">🏦</div>
            <div class="pay-method-label">Transferencia</div>
          </div>
        </div>

        <div id="cardSection">
          <!-- Card visual -->
          <div class="card-visual">
            <div class="card-brand">
              <div class="card-brand-circle"></div>
              <div class="card-brand-circle"></div>
            </div>
            <div class="card-chip"></div>
            <div class="card-number-display" id="cardNumDisplay">•••• •••• •••• ••••</div>
            <div class="card-bottom">
              <div class="card-holder-display">Titular<span id="cardNameDisplay">NOMBRE APELLIDO</span></div>
              <div class="card-expiry-display">Vence<span id="cardExpDisplay">MM / AA</span></div>
            </div>
          </div>

          <div class="form-row full" style="margin-bottom:1rem;">
            <div class="form-group">
              <label>Número de tarjeta</label>
              <div class="input-icon-wrap">
                <input type="text" id="cardNum" placeholder="1234 5678 9012 3456" maxlength="19" />
                <span class="input-icon">💳</span>
              </div>
              <span class="field-error" id="cardNumErr">Número de tarjeta inválido</span>
            </div>
          </div>
          <div class="form-row full" style="margin-bottom:1rem;">
            <div class="form-group">
              <label>Nombre en la tarjeta</label>
              <input type="text" id="cardName" placeholder="ANA GARCÍA" />
              <span class="field-error" id="cardNameErr">Nombre requerido</span>
            </div>
          </div>
          <div class="card-row">
            <div class="form-group">
              <label>Vencimiento</label>
              <input type="text" id="cardExp" placeholder="MM / AA" maxlength="7" />
              <span class="field-error" id="cardExpErr">Fecha inválida</span>
            </div>
            <div class="form-group">
              <label>CVV</label>
              <div class="input-icon-wrap">
                <input type="text" id="cardCvv" placeholder="•••" maxlength="4" />
                <span class="input-icon">🔒</span>
              </div>
              <span class="field-error" id="cardCvvErr">CVV inválido</span>
            </div>
          </div>
        </div>

        <div id="altSection" style="display:none; padding: 1.5rem 0; color: var(--muted); font-size:0.82rem; letter-spacing:0.06em; text-align:center; border-top: 1px solid var(--border); margin-top: 1rem;">
          Serás redirigido a completar el pago de forma segura.
        </div>
      </div>

      <button class="pay-btn" id="payBtn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Pagar $${total.toFixed(2)}
      </button>
    </div>

    <!-- RIGHT: summary -->
    <aside class="order-summary">
      <div class="summary-card">
        <div class="summary-header">Resumen del pedido</div>
        <div class="summary-items" id="summaryItems">
          ${cart.map(item => `
            <div class="summary-item">
              <img class="summary-item-img" src="${item.image}" alt="${escHtml(item.title)}" />
              <div class="summary-item-info">
                <div class="summary-item-name">${escHtml(item.title)}</div>
                <div class="summary-item-meta">Cant. ${item.qty}</div>
              </div>
              <div class="summary-item-price">$${(item.price * item.qty).toFixed(2)}</div>
            </div>
          `).join('')}
        </div>
        <div class="summary-divider"></div>
        <div class="coupon-row">
          <input class="coupon-input" type="text" placeholder="Código de descuento" id="couponInput" />
          <button class="coupon-btn" onclick="applyCoupon()">Aplicar</button>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-totals">
          <div class="summary-line">
            <span>Subtotal</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div class="summary-line">
            <span>Envío</span>
            <span>${shipping === 0 ? '<span style="color:var(--success)">Gratis</span>' : '$' + shipping.toFixed(2)}</span>
          </div>
          <div class="summary-line">
            <span>Impuestos (8%)</span>
            <span>$${tax.toFixed(2)}</span>
          </div>
          <div class="summary-line total">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>
        ${subtotal <= 50 ? `<div class="summary-shipping">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Agrega $${(50 - subtotal).toFixed(2)} más para envío gratis
        </div>` : `<div class="summary-shipping">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Envío gratuito aplicado
        </div>`}
        <div class="secure-badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Pago 100% seguro con encriptación SSL
        </div>
      </div>
    </aside>
  </div>`;

  bindEvents();
}

function applyCoupon() {
  const val = document.getElementById('couponInput').value.trim().toUpperCase();
  if (val === 'VAULT10') alert('¡Cupón aplicado! 10% de descuento (demo)');
  else alert('Cupón no válido');
}

function bindEvents() {
  // Payment method tabs
  document.querySelectorAll('.pay-method').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.pay-method').forEach(x => x.classList.remove('active'));
      el.classList.add('active');
      const method = el.dataset.method;
      document.getElementById('cardSection').style.display = method === 'card' ? 'block' : 'none';
      document.getElementById('altSection').style.display = method !== 'card' ? 'block' : 'none';
    });
  });

  // Card number formatting
  const cardNumInput = document.getElementById('cardNum');
  cardNumInput && cardNumInput.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 16);
    v = v.replace(/(.{4})/g, '$1 ').trim();
    e.target.value = v;
    document.getElementById('cardNumDisplay').textContent = v.length ? v.padEnd(19, ' •').slice(0,19).replace(/\s{2,}/g,' ') : '•••• •••• •••• ••••';
  });

  // Card name
  const cardNameInput = document.getElementById('cardName');
  cardNameInput && cardNameInput.addEventListener('input', e => {
    const v = e.target.value.toUpperCase();
    e.target.value = v;
    document.getElementById('cardNameDisplay').textContent = v || 'NOMBRE APELLIDO';
  });

  // Card expiry
  const cardExpInput = document.getElementById('cardExp');
  cardExpInput && cardExpInput.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0,2) + ' / ' + v.slice(2);
    e.target.value = v;
    document.getElementById('cardExpDisplay').textContent = v || 'MM / AA';
  });

  // Pay button
  document.getElementById('payBtn').addEventListener('click', validateAndPay);
}

function validateAndPay() {
  const method = document.querySelector('.pay-method.active').dataset.method;
  let valid = true;

  // Contact validation
  const fields = [
    { id: 'fname', errId: 'fnameErr', check: v => v.length >= 2 },
    { id: 'lname', errId: 'lnameErr', check: v => v.length >= 2 },
    { id: 'email', errId: 'emailErr', check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { id: 'address', errId: 'addressErr', check: v => v.length >= 5 },
    { id: 'city', errId: 'cityErr', check: v => v.length >= 2 },
  ];

  if (method === 'card') {
    fields.push(
      { id: 'cardNum', errId: 'cardNumErr', check: v => v.replace(/\s/g,'').length === 16 },
      { id: 'cardName', errId: 'cardNameErr', check: v => v.trim().length >= 3 },
      { id: 'cardExp', errId: 'cardExpErr', check: v => /^\d{2}\s\/\s\d{2}$/.test(v) },
      { id: 'cardCvv', errId: 'cardCvvErr', check: v => /^\d{3,4}$/.test(v) },
    );
  }

  fields.forEach(({ id, errId, check }) => {
    const el = document.getElementById(id);
    const errEl = document.getElementById(errId);
    if (!el) return;
    const ok = check(el.value.trim());
    el.classList.toggle('error', !ok);
    errEl && errEl.classList.toggle('show', !ok);
    if (!ok) valid = false;
  });

  if (!valid) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

  simulatePayment();
}

function simulatePayment() {
  const overlay = document.getElementById('processingOverlay');
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';

  const steps = ['ps1','ps2','ps3','ps4'];
  const delays = [600, 1500, 2600, 3600];

  steps.forEach((id, i) => {
    setTimeout(() => {
      if (i > 0) document.getElementById(steps[i-1]).classList.replace('active','done');
      document.getElementById(id).classList.add('active');
    }, delays[i]);
  });

  setTimeout(() => {
    document.getElementById('ps4').classList.replace('active','done');
    document.getElementById('procRing').style.animation = 'none';
    document.getElementById('procRing').style.borderColor = 'var(--success)';
    document.getElementById('procRing').style.borderTopColor = 'var(--success)';
    document.getElementById('procTitle').textContent = '¡Pago exitoso!';
    document.getElementById('procTitle').style.color = 'var(--success)';
    document.getElementById('procSub').textContent = 'Redirigiendo…';
  }, 4600);

  setTimeout(() => {
    // Save order to localStorage
    const order = {
      id: 'VAULT-' + Date.now().toString(36).toUpperCase(),
      date: new Date().toISOString(),
      items: [...cart],
      subtotal: calculateTotals(cart).subtotal,
      status: 'created',
      customer: {
        name: (document.getElementById('fname').value + ' ' + document.getElementById('lname').value).trim(),
        email: document.getElementById('email').value,
        address: document.getElementById('address').value + ', ' + document.getElementById('city').value
      }
    };
    const orders = getOrders();
    orders.unshift(order);
    saveOrders(orders);

    // Clear cart
    saveCart([]);

    // Navigate
    window.location.href = 'vault-confirmation.html?order=' + order.id;
  }, 5400);
}
