/* =========================================================================
   VAULT — Utilidades compartidas
   =========================================================================
   Funciones y helpers usados por más de una página. Debe cargarse
   ANTES del script específico de cada página:

     <script src="vault-common.js"></script>
     <script src="vault-store.js"></script>
   ========================================================================= */

const CART_KEY = 'vault_cart';
const ORDERS_KEY = 'vault_orders';

/* ── Escapar HTML (usado al insertar texto dinámico con innerHTML) ── */
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Formatear fecha ISO a formato legible en español ──
   options sigue el formato de Intl.DateTimeFormat / toLocaleDateString.
   Por defecto: "12 de junio de 2026" (usado en confirmación).
   Pasar { day:'2-digit', month:'short', year:'numeric' } para "12 jun. 2026" (pedidos). */
function formatDate(iso, options = { day: '2-digit', month: 'long', year: 'numeric' }) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', options);
}

/* ── Cálculo de totales (subtotal, envío, impuestos, total) ──
   Regla de envío: gratis si el subtotal supera $50, si no $9.99.
   Impuestos: 8% del subtotal. Usado en checkout, pedidos y confirmación. */
function calculateTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
}

/* ── Acceso al carrito en localStorage ── */
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* ── Acceso a los pedidos en localStorage ── */
function getOrders() {
  return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}
