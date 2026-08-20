import { APP_CONFIG, formatCurrency } from "./config.js";
import { BRANDS, PRODUCTS, getBrand, getProduct } from "./data.js";
import { Store, makeId } from "./storage.js";
import { addQuantity, setQuantity, removeProduct, clearCart, cartEntries, totals, groupByBrand, snapshotCart } from "./cart.js";
import { Backend } from "./backend.js";

const app = document.querySelector("#app");
let view = "login";
let currentBrandId = null;
let catalogSearch = "";
let catalogFilter = "all";
let discount = 0;
let orderDraft = { customer: {} };

const esc = (v="") => String(v).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));

function toast(message, type="success") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  document.querySelector("#toast-root").appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function icon(name) {
  const paths = {
    home:`<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/>`,
    cart:`<circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L21 8H6"/>`,
    search:`<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>`,
    arrow:`<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>`,
    back:`<path d="m15 18-6-6 6-6"/><path d="M9 12h10"/>`,
    logout:`<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 3v18"/>`,
    plus:`<path d="M12 5v14M5 12h14"/>`,
    minus:`<path d="M5 12h14"/>`,
    check:`<path d="m5 12 4 4L19 6"/>`,
    invoice:`<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h4"/>`,
    user:`<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`,
    refresh:`<path d="M20 11a8 8 0 1 0 2 5"/><path d="M20 4v7h-7"/>`
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ""}</svg>`;
}

function cartCount() {
  const t = totals();
  return `${t.totalQuantity} ${t.totalQuantity === 1 ? "item" : "items"}`;
}

function shell(content, active="brands") {
  const session = Store.get().session;
  const t = totals();
  return `
  <div class="app-shell">
    <header class="topbar">
      <button class="brand-logo" data-action="home" aria-label="TimeHouse home">
        <span class="logo-orbit"></span>
        <span><strong>${APP_CONFIG.companyName}</strong><small>${APP_CONFIG.companySubtitle}</small></span>
      </button>
      <nav class="topnav">
        <button class="${active==="brands"?"active":""}" data-action="brands">${icon("home")} Brands</button>
        <button class="${active==="order"?"active":""}" data-action="order">${icon("cart")} Order</button>
        ${session?.role === "cashier" || session?.role === "admin" ? `<button class="${active==="cashier"?"active":""}" data-action="cashier">${icon("invoice")} Cashier</button>` : ""}
      </nav>
      <div class="top-actions">
        <button class="cart-pill" data-action="order">${icon("cart")}<span>${cartCount()}</span><b>${formatCurrency(t.grandTotal)}</b></button>
        <div class="user-chip"><span class="avatar">${esc((session?.name||"U").slice(0,1))}</span><span><strong>${esc(session?.name||"User")}</strong><small>${esc(session?.role||"")}</small></span></div>
        <button class="icon-button" data-action="logout" title="Logout">${icon("logout")}</button>
      </div>
    </header>
    <main class="page">${content}</main>
  </div>`;
}

function loginView() {
  app.innerHTML = `
  <div class="login-page">
    <section class="login-visual">
      <div class="orb orb-a"></div><div class="orb orb-b"></div>
      <div class="dial-art"><span>12</span><i></i><span>3</span><span>6</span><span>9</span></div>
      <div class="login-brand"><span class="logo-orbit big"></span><div><strong>${APP_CONFIG.companyName}</strong><small>${APP_CONFIG.companySubtitle}</small></div></div>
      <div class="login-copy">
        <div class="eyebrow">WHOLESALE CONTROL CENTER</div>
        <h1>Sell beautifully.<br><span>Move faster.</span></h1>
        <p>A modern showroom sales-order workflow and cashier POS built for watch wholesale.</p>
      </div>
      <div class="login-foot">Sales Orders • Cashier • Invoices</div>
    </section>
    <section class="login-panel">
      <form id="login-form" class="login-card">
        <div class="mobile-logo">${APP_CONFIG.companyName}</div>
        <div class="eyebrow">WELCOME BACK</div>
        <h2>Sign in to TimeHouse</h2>
        <p class="muted">Choose your workspace and continue.</p>
        <label>Username<input name="username" autocomplete="username" placeholder="sales or cashier" required></label>
        <label>Password<input name="password" type="password" autocomplete="current-password" placeholder="••••••••" required></label>
        <label class="checkline"><input type="checkbox" name="remember"> Remember me</label>
        <button class="primary-button full" type="submit">Sign In ${icon("arrow")}</button>
        <div id="login-error" class="form-error"></div>
        <div class="demo-hint">
          <strong>Demo access</strong>
          <span>Sales: <code>sales / sales123</code></span>
          <span>Cashier: <code>cashier / cashier123</code></span>
        </div>
      </form>
    </section>
  </div>`;
  document.querySelector("#login-form").addEventListener("submit", e => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const user = APP_CONFIG.demoUsers.find(u => u.username === fd.get("username") && u.password === fd.get("password"));
    if (!user) {
      document.querySelector("#login-error").textContent = "Invalid username or password.";
      return;
    }
    Store.setSession({ username:user.username, name:user.name, role:user.role });
    view = user.role === "cashier" ? "cashier" : "brands";
    render();
  });
}

function brandDashboard() {
  const q = catalogSearch.toLowerCase();
  const brands = BRANDS.filter(b => !q || b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
  const t = totals();
  return shell(`
    <section class="hero-panel">
      <div>
        <div class="eyebrow light">SHOWROOM SALES</div>
        <h1>Choose a brand<span>.</span></h1>
        <p>Build a customer order across multiple brands, then send it to the cashier.</p>
      </div>
      <div class="hero-stats">
        <div><strong>${BRANDS.length}</strong><span>Brands</span></div>
        <div><strong>${PRODUCTS.length}</strong><span>Products</span></div>
        <div><strong>${t.totalQuantity}</strong><span>Selected</span></div>
      </div>
      <div class="hero-dial"></div>
    </section>
    <div class="section-head">
      <div><div class="eyebrow">COLLECTIONS</div><h2>Browse brands</h2></div>
      <div class="search-box">${icon("search")}<input id="brand-search" value="${esc(catalogSearch)}" placeholder="Search brands..."></div>
    </div>
    <div class="brand-grid">
      ${brands.map(b => `
        <button class="brand-card ${b.accent}" data-brand="${b.id}">
          <div class="brand-decoration">${esc(b.name.slice(0,1))}</div>
          <div class="brand-card-top"><span class="brand-dot"></span><span>${b.products.length} products</span></div>
          <div class="brand-name">${esc(b.name)}</div>
          <div class="brand-description">${esc(b.description)}</div>
          <div class="brand-card-bottom"><span>Explore collection</span>${icon("arrow")}</div>
        </button>`).join("")}
    </div>
    ${t.totalQuantity ? `<button class="floating-cart" data-action="order">${icon("cart")} <strong>Current Order</strong><span>${cartCount()}</span><b>${formatCurrency(t.grandTotal)}</b>${icon("arrow")}</button>` : ""}
  `, "brands");
}

function productCatalog() {
  const brand = getBrand(currentBrandId);
  const cart = Store.getCart();
  const products = brand.products.filter(p => {
    const q = catalogSearch.toLowerCase();
    const matchesQ = !q || [p.model,p.name,p.sku,p.category].some(v => v.toLowerCase().includes(q));
    const selected = Number(cart[p.id]?.quantity || 0) > 0;
    const matchesFilter = catalogFilter === "all" || (catalogFilter === "selected" && selected) || (catalogFilter === "stock" && p.stock > 0);
    return matchesQ && matchesFilter;
  });
  const t = totals();
  return shell(`
    <div class="breadcrumb"><button data-action="brands">${icon("back")} Brands</button><span>/</span><strong>${esc(brand.name)}</strong></div>
    <section class="catalog-head">
      <div>
        <div class="eyebrow">COLLECTION</div>
        <h1>${esc(brand.name)}</h1>
        <p>${esc(brand.description)} • ${brand.products.length} products</p>
      </div>
      <div class="catalog-actions">
        <div class="search-box">${icon("search")}<input id="product-search" value="${esc(catalogSearch)}" placeholder="Search model, SKU, category..."></div>
        <select id="catalog-filter"><option value="all" ${catalogFilter==="all"?"selected":""}>All products</option><option value="selected" ${catalogFilter==="selected"?"selected":""}>Selected only</option><option value="stock" ${catalogFilter==="stock"?"selected":""}>In stock</option></select>
      </div>
    </section>
    <div class="catalog-layout">
      <section class="product-list">
        ${products.length ? products.map(p => {
          const qty = Number(cart[p.id]?.quantity || 0);
          const status = p.stock === 0 ? "out" : p.stock < 10 ? "low" : "in";
          return `<article class="product-row ${qty ? "selected":""}">
            <div class="product-image ${brand.accent}"><span>${esc(p.model.slice(0,2))}</span><i></i></div>
            <div class="product-info"><div class="product-title">${esc(p.model)}</div><div class="product-name">${esc(p.name)}</div><div class="product-meta"><span>${esc(p.sku)}</span><span>${esc(p.category)}</span><span class="stock ${status}">${p.stock === 0 ? "Out of stock" : p.stock < 10 ? `Low stock • ${p.stock}` : `In stock • ${p.stock}`}</span></div></div>
            <div class="product-price">${formatCurrency(p.price)}<small>wholesale</small></div>
            <div class="qty-control"><button data-qty="${p.id}" data-delta="-1" aria-label="Decrease">${icon("minus")}</button><input data-qty-input="${p.id}" value="${qty}" inputmode="numeric" aria-label="Quantity for ${esc(p.model)}"><button data-qty="${p.id}" data-delta="1" aria-label="Increase">${icon("plus")}</button></div>
          </article>`;
        }).join("") : `<div class="empty-state"><div class="empty-icon">${icon("search")}</div><h3>No products found</h3><p>Try another model, SKU or filter.</p></div>`}
      </section>
      <aside class="order-mini">
        <div class="mini-head"><div><span class="eyebrow">GLOBAL ORDER</span><h3>Current order</h3></div><span class="count-badge">${cartEntries().length}</span></div>
        ${groupByBrand().map(g => `<div class="mini-brand"><strong>${esc(g.brand.name)}</strong><span>${g.items.reduce((s,x)=>s+x.quantity,0)} pcs</span></div>`).join("") || `<p class="muted">Nothing selected yet.</p>`}
        <div class="mini-total"><span>Order total</span><strong>${formatCurrency(t.grandTotal)}</strong></div>
        <button class="primary-button full" data-action="order">Review Order ${icon("arrow")}</button>
        <button class="secondary-button full" data-action="brands">＋ Add Another Brand</button>
      </aside>
    </div>
  `, "brands");
}

function orderView() {
  const groups = groupByBrand();
  const t = totals(discount);
  return shell(`
    <div class="breadcrumb"><button data-action="brands">${icon("back")} Brands</button><span>/</span><strong>Current Order</strong></div>
    <section class="catalog-head">
      <div><div class="eyebrow">GLOBAL CART</div><h1>Sales order</h1><p>Products from every selected brand are combined into one customer order.</p></div>
      <button class="secondary-button" data-action="brands">＋ Add More Products</button>
    </section>
    ${groups.length ? `<div class="order-layout"><section class="order-groups">
      ${groups.map(g => `<div class="order-brand-block">
        <div class="order-brand-head"><div><span class="eyebrow">BRAND</span><h3>${esc(g.brand.name)}</h3></div><strong>${formatCurrency(g.subtotal)}</strong></div>
        ${g.items.map(x => `<div class="order-item">
          <div class="product-image small ${g.brand.accent}"><span>${esc(x.product.model.slice(0,2))}</span></div>
          <div class="order-item-info"><strong>${esc(x.product.model)}</strong><span>${esc(x.product.name)} • ${esc(x.product.sku)}</span></div>
          <div class="unit-price">${formatCurrency(x.product.price)}</div>
          <div class="qty-control compact"><button data-qty="${x.product.id}" data-delta="-1">${icon("minus")}</button><input data-qty-input="${x.product.id}" value="${x.quantity}"><button data-qty="${x.product.id}" data-delta="1">${icon("plus")}</button></div>
          <strong class="line-total">${formatCurrency(x.product.price*x.quantity)}</strong>
          <button class="remove-button" data-remove="${x.product.id}" title="Remove">×</button>
        </div>`).join("")}
      </div>`).join("")}
    </section>
    <aside class="checkout-card">
      <div class="eyebrow">ORDER SUMMARY</div><h2>${t.totalQuantity} watches</h2>
      <div class="summary-line"><span>Subtotal</span><strong>${formatCurrency(t.subtotal)}</strong></div>
      <label>Discount<input id="discount-input" type="number" min="0" step="0.001" value="${discount.toFixed(3)}" placeholder="0.000"></label>
      <div class="summary-line"><span>Tax</span><strong>${formatCurrency(t.tax)}</strong></div>
      <div class="grand-total"><span>Total</span><strong>${formatCurrency(t.grandTotal)}</strong></div>
      <button class="primary-button full big" data-action="sales-order">Create Sales Order ${icon("arrow")}</button>
      <button class="danger-button full" data-action="clear-order">Clear Entire Order</button>
    </aside></div>` : `<div class="empty-state large"><div class="empty-icon">${icon("cart")}</div><h2>Your order is empty</h2><p>Browse brands and add the watches your customer chooses.</p><button class="primary-button" data-action="brands">Browse Brands ${icon("arrow")}</button></div>`}
  `, "order");
}

function salesOrderForm() {
  const t = totals(discount);
  const customer = orderDraft.customer || {};
  return shell(`
    <div class="breadcrumb"><button data-action="order">${icon("back")} Order</button><span>/</span><strong>Customer details</strong></div>
    <section class="form-layout">
      <form id="sales-order-form" class="form-card">
        <div class="eyebrow">SALES ORDER</div><h1>Customer details</h1><p class="muted">The sales person creates this order in the showroom. The cashier will later fetch it using the customer's mobile number.</p>
        <div class="form-grid">
          <label>Customer name *<input name="name" value="${esc(customer.name||"")}" required placeholder="Customer name"></label>
          <label>Mobile number *<input name="phone" value="${esc(customer.phone||"")}" required placeholder="+965 ..."></label>
          <label>Company name<input name="company" value="${esc(customer.company||"")}" placeholder="Company (optional)"></label>
          <label>Email<input name="email" value="${esc(customer.email||"")}" placeholder="customer@example.com"></label>
          <label class="span-2">Address<textarea name="address" rows="3" placeholder="Address">${esc(customer.address||"")}</textarea></label>
          <label class="span-2">Sales notes<textarea name="notes" rows="3" placeholder="Special instructions...">${esc(customer.notes||"")}</textarea></label>
        </div>
        <div class="form-actions"><button type="button" class="secondary-button" data-action="order">${icon("back")} Back</button><button class="primary-button" type="submit">Create Sales Order ${icon("check")}</button></div>
      </form>
      <aside class="checkout-card sticky">
        <div class="eyebrow">ORDER READY</div><h2>${t.totalQuantity} watches</h2>
        <div class="brand-summary">${groupByBrand().map(g=>`<div><span>${esc(g.brand.name)}</span><strong>${g.items.reduce((s,x)=>s+x.quantity,0)}</strong></div>`).join("")}</div>
        <div class="grand-total"><span>Total</span><strong>${formatCurrency(t.grandTotal)}</strong></div>
      </aside>
    </section>
  `, "order");
}

function salesOrderSuccess(order) {
  return shell(`
    <div class="success-page">
      <div class="success-icon">${icon("check")}</div>
      <div class="eyebrow">SALES ORDER CREATED</div>
      <h1>${esc(order.number)}</h1>
      <p>Tell the customer to go to the cashier and provide their mobile number.</p>
      <div class="handoff-card">
        <div><span>Customer</span><strong>${esc(order.customer.name)}</strong></div>
        <div><span>Mobile</span><strong>${esc(order.customer.phone)}</strong></div>
        <div><span>Order total</span><strong>${formatCurrency(order.total.grandTotal)}</strong></div>
      </div>
      <div class="success-actions"><button class="primary-button" data-action="new-order">Start New Customer ${icon("arrow")}</button><button class="secondary-button" data-action="brands">Browse Brands</button></div>
    </div>
  `, "order");
}

async function cashierView() {
  const orders = await Backend.listSalesOrders();
  const q = catalogSearch.toLowerCase();
  const visible = orders.filter(o => {
    if (!q) return true;
    return [o.number, o.customer?.name, o.customer?.phone, o.status].filter(Boolean).some(v => String(v).toLowerCase().includes(q));
  });
  return shell(`
    <section class="hero-panel cashier-hero">
      <div><div class="eyebrow light">CASHIER WORKSPACE</div><h1>Sales orders<span>.</span></h1><p>Find the showroom order, verify the customer, then turn it into an invoice.</p></div>
      <div class="cashier-badge">${icon("invoice")} <span>READY TO INVOICE</span></div>
    </section>
    <div class="section-head"><div><div class="eyebrow">INCOMING ORDERS</div><h2>Find a sales order</h2></div><div class="search-box wide">${icon("search")}<input id="cashier-search" value="${esc(catalogSearch)}" placeholder="Search mobile number, customer or sales order..."></div></div>
    <div class="order-table">
      <div class="table-head"><span>Sales Order</span><span>Customer</span><span>Mobile</span><span>Items</span><span>Total</span><span>Status</span><span></span></div>
      ${visible.length ? visible.map(o => `<div class="table-row">
        <div><strong>${esc(o.number)}</strong><small>${new Date(o.createdAt).toLocaleString()}</small></div>
        <div><strong>${esc(o.customer.name)}</strong><small>${esc(o.customer.company||"")}</small></div>
        <div>${esc(o.customer.phone)}</div>
        <div>${o.total.totalQuantity}</div>
        <div><strong>${formatCurrency(o.total.grandTotal)}</strong></div>
        <div><span class="status-pill ${o.status.toLowerCase()}">${esc(o.status)}</span></div>
        <div><button class="primary-button small" data-fetch-order="${o.id}">Fetch & Review ${icon("arrow")}</button></div>
      </div>`).join("") : `<div class="empty-state"><div class="empty-icon">${icon("search")}</div><h3>No sales orders found</h3><p>Ask the customer for the mobile number they gave the salesperson.</p></div>`}
    </div>
  `, "cashier");
}

function cashierOrderView(order) {
  const groups = groupSnapshotByBrand(order.items);
  return shell(`
    <div class="breadcrumb"><button data-action="cashier">${icon("back")} Cashier</button><span>/</span><strong>${esc(order.number)}</strong></div>
    <section class="catalog-head"><div><div class="eyebrow">SALES ORDER</div><h1>${esc(order.number)}</h1><p>Created by ${esc(order.createdBy?.name||"Sales Person")} • ${new Date(order.createdAt).toLocaleString()}</p></div><span class="status-pill pending">${esc(order.status)}</span></section>
    <div class="cashier-order-layout">
      <section class="order-groups">
        <div class="customer-card"><div><span>Customer</span><strong>${esc(order.customer.name)}</strong></div><div><span>Mobile</span><strong>${esc(order.customer.phone)}</strong></div><div><span>Company</span><strong>${esc(order.customer.company||"—")}</strong></div></div>
        ${groups.map(g => `<div class="order-brand-block"><div class="order-brand-head"><div><span class="eyebrow">BRAND</span><h3>${esc(g.name)}</h3></div><strong>${formatCurrency(g.subtotal)}</strong></div>
        ${g.items.map(x=>`<div class="order-item readonly"><div class="product-image small ${g.accent}"><span>${esc(x.model.slice(0,2))}</span></div><div class="order-item-info"><strong>${esc(x.model)}</strong><span>${esc(x.name)} • ${esc(x.sku)}</span></div><div class="unit-price">${formatCurrency(x.unitPrice)}</div><strong>× ${x.quantity}</strong><strong class="line-total">${formatCurrency(x.lineTotal)}</strong></div>`).join("")}</div>`).join("")}
      </section>
      <aside class="checkout-card sticky"><div class="eyebrow">CHECKOUT</div><h2>${order.total.totalQuantity} watches</h2><div class="summary-line"><span>Subtotal</span><strong>${formatCurrency(order.total.subtotal)}</strong></div><div class="summary-line"><span>Discount</span><strong>${formatCurrency(order.total.discount)}</strong></div><div class="summary-line"><span>Tax</span><strong>${formatCurrency(order.total.tax)}</strong></div><div class="grand-total"><span>Total</span><strong>${formatCurrency(order.total.grandTotal)}</strong></div><button class="primary-button full big" data-make-invoice="${order.id}">${icon("invoice")} Make Invoice</button><button class="secondary-button full" data-action="cashier">Back to Orders</button></aside>
    </div>
  `, "cashier");
}

function groupSnapshotByBrand(items) {
  const map = {};
  for (const x of items) {
    const b = getBrand(x.brandId);
    if (!map[x.brandId]) map[x.brandId] = { name:b?.name || x.brandId, accent:b?.accent || "blue", items:[], subtotal:0 };
    map[x.brandId].items.push(x);
    map[x.brandId].subtotal += x.lineTotal;
  }
  return Object.values(map);
}

function invoiceView(invoice) {
  return shell(`
    <div class="invoice-toolbar"><button class="secondary-button" data-action="${Store.get().session?.role==="cashier"?"cashier":"brands"}">${icon("back")} Back</button><div><button class="secondary-button" data-print>${icon("invoice")} Print Invoice</button><button class="primary-button" data-action="new-order">Start New Order ${icon("arrow")}</button></div></div>
    <article class="invoice-paper" id="print-invoice">
      <header class="invoice-header"><div class="invoice-company"><div class="invoice-logo">${APP_CONFIG.companyName}</div><div>${APP_CONFIG.companySubtitle}</div><small>${APP_CONFIG.companyAddress} • ${APP_CONFIG.companyPhone} • ${APP_CONFIG.companyEmail}</small></div><div class="invoice-title"><div>INVOICE</div><strong>${esc(invoice.number)}</strong><span>${new Date(invoice.createdAt).toLocaleDateString()}</span></div></header>
      <div class="invoice-accent"></div>
      <section class="bill-grid"><div><span>BILL TO</span><strong>${esc(invoice.customer.name)}</strong><p>${esc(invoice.customer.company||"")}<br>${esc(invoice.customer.phone)}<br>${esc(invoice.customer.address||"")}</p></div><div><span>PAYMENT</span><strong>${esc(invoice.paymentMethod||"Cash")}</strong><p>Sales Order: ${esc(invoice.salesOrderNumber||"—")}</p></div></section>
      ${groupSnapshotByBrand(invoice.items).map(g=>`<section class="invoice-brand"><h3>${esc(g.name)}</h3><table><thead><tr><th>Model</th><th>SKU</th><th>Category</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${g.items.map(x=>`<tr><td><strong>${esc(x.model)}</strong><small>${esc(x.name)}</small></td><td>${esc(x.sku)}</td><td>${esc(x.category)}</td><td>${x.quantity}</td><td>${formatCurrency(x.unitPrice)}</td><td>${formatCurrency(x.lineTotal)}</td></tr>`).join("")}</tbody></table></section>`).join("")}
      <section class="invoice-bottom"><div class="invoice-note"><span>NOTE</span><p>${esc(invoice.customer.notes||"Thank you for your business.")}</p></div><div class="invoice-total"><div><span>Subtotal</span><strong>${formatCurrency(invoice.total.subtotal)}</strong></div><div><span>Discount</span><strong>${formatCurrency(invoice.total.discount)}</strong></div><div><span>Tax</span><strong>${formatCurrency(invoice.total.tax)}</strong></div><div class="final"><span>Total</span><strong>${formatCurrency(invoice.total.grandTotal)}</strong></div></div></section>
      <footer class="invoice-footer">Thank you for your business • ${APP_CONFIG.companyName}</footer>
    </article>
  `, "order");
}

function render() {
  const session = Store.get().session;
  if (!session) return loginView();
  if (view === "brands") app.innerHTML = brandDashboard();
  else if (view === "catalog") app.innerHTML = productCatalog();
  else if (view === "order") app.innerHTML = orderView();
  else if (view === "sales-order") app.innerHTML = salesOrderForm();
  else if (view === "sales-success") app.innerHTML = salesOrderSuccess(orderDraft);
  else if (view === "cashier") cashierView().then(html => app.innerHTML = html);
  else if (view === "cashier-order") app.innerHTML = cashierOrderView(orderDraft);
  else if (view === "invoice") app.innerHTML = invoiceView(orderDraft);
  bind();
}

function bind() {
  document.querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", () => {
    const a = el.dataset.action;
    if (a === "logout") { Store.clearSession(); view="login"; currentBrandId=null; render(); }
    if (a === "home" || a === "brands") { view="brands"; catalogSearch=""; catalogFilter="all"; render(); }
    if (a === "order") { view="order"; render(); }
    if (a === "cashier") { view="cashier"; catalogSearch=""; render(); }
    if (a === "sales-order") { if (!cartEntries().length) return toast("Add products before creating a sales order","error"); view="sales-order"; render(); }
    if (a === "clear-order") { if(confirm("Clear the entire order? This removes products from every brand.")){ clearCart(); discount=0; render(); toast("Order cleared"); } }
    if (a === "new-order") { clearCart(); discount=0; orderDraft={customer:{}}; view="brands"; render(); toast("Ready for a new order"); }
  }));

  document.querySelectorAll("[data-brand]").forEach(el => el.addEventListener("click", () => {
    currentBrandId = el.dataset.brand; catalogSearch=""; catalogFilter="all"; view="catalog"; render();
  }));

  document.querySelectorAll("[data-qty]").forEach(el => el.addEventListener("click", () => {
    addQuantity(el.dataset.qty, Number(el.dataset.delta)); render();
  }));

  document.querySelectorAll("[data-qty-input]").forEach(el => el.addEventListener("change", () => {
    setQuantity(el.dataset.qtyInput, el.value); render();
  }));

  document.querySelectorAll("[data-remove]").forEach(el => el.addEventListener("click", () => {
    removeProduct(el.dataset.remove); render(); toast("Product removed");
  }));

  const bs = document.querySelector("#brand-search");
  if (bs) bs.addEventListener("input", e => { catalogSearch=e.target.value; render(); requestAnimationFrame(()=>document.querySelector("#brand-search")?.focus()); });

  const ps = document.querySelector("#product-search");
  if (ps) ps.addEventListener("input", e => { catalogSearch=e.target.value; render(); requestAnimationFrame(()=>{ const x=document.querySelector("#product-search"); x?.focus(); x?.setSelectionRange(x.value.length,x.value.length); }); });

  const cf = document.querySelector("#catalog-filter");
  if (cf) cf.addEventListener("change", e => { catalogFilter=e.target.value; render(); });

  const di = document.querySelector("#discount-input");
  if (di) di.addEventListener("change", e => { discount=Math.max(0,Number(e.target.value||0)); render(); });

  const so = document.querySelector("#sales-order-form");
  if (so) so.addEventListener("submit", async e => {
    e.preventDefault();
    const fd = new FormData(so);
    const customer = Object.fromEntries(fd.entries());
    orderDraft.customer = customer;
    const session = Store.get().session;
    const order = {
      id: makeId("so"),
      number: Store.nextSalesOrderNumber(),
      status: "PENDING",
      customer,
      items: snapshotCart(),
      total: totals(discount),
      discount,
      createdBy: session,
      createdAt: new Date().toISOString()
    };
    await Backend.createSalesOrder(order);
    clearCart(); discount=0; orderDraft=order; view="sales-success"; render();
  });

  const cs = document.querySelector("#cashier-search");
  if (cs) cs.addEventListener("input", e => { catalogSearch=e.target.value; render(); requestAnimationFrame(()=>{const x=document.querySelector("#cashier-search");x?.focus();x?.setSelectionRange(x.value.length,x.value.length);}); });

  document.querySelectorAll("[data-fetch-order]").forEach(el => el.addEventListener("click", async () => {
    const order = await Backend.getSalesOrder(el.dataset.fetchOrder);
    if (order) { orderDraft=order; view="cashier-order"; render(); }
  }));

  document.querySelectorAll("[data-make-invoice]").forEach(el => el.addEventListener("click", async () => {
    const order = await Backend.getSalesOrder(el.dataset.makeInvoice);
    if (!order) return toast("Sales order not found","error");
    const paymentMethod = prompt("Payment method: Cash, Card, Bank Transfer, or Credit", "Cash") || "Cash";
    const invoice = {
      id: makeId("inv"),
      number: Store.nextInvoiceNumber(),
      salesOrderId: order.id,
      salesOrderNumber: order.number,
      customer: order.customer,
      items: order.items,
      total: order.total,
      paymentMethod,
      createdAt: new Date().toISOString(),
      createdBy: Store.get().session
    };
    await Backend.createInvoice(invoice);
    await Backend.updateSalesOrder(order.id, { status:"INVOICED", invoiceNumber:invoice.number, invoicedAt:invoice.createdAt });
    orderDraft=invoice; view="invoice"; render();
  }));

  const print = document.querySelector("[data-print]");
  if (print) print.addEventListener("click", () => window.print());
}

render();
