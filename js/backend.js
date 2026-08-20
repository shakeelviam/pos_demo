/*
  Shared data adapter.

  IMPORTANT:
  GitHub Pages + localStorage is suitable for a single-browser demo only.
  For a real showroom where salesperson and cashier use DIFFERENT devices,
  connect this adapter to a shared backend such as Supabase.

  The UI is deliberately written against this adapter so the backend can be
  swapped without rewriting the sales/cashier screens.
*/

import { Store } from "./storage.js";

export const Backend = {
  async listSalesOrders() {
    return Store.getSalesOrders();
  },

  async findSalesOrders(query) {
    const q = String(query || "").trim().toLowerCase();
    const orders = await this.listSalesOrders();
    if (!q) return orders;
    return orders.filter(o =>
      [o.number, o.customer?.name, o.customer?.phone, o.status]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    );
  },

  async getSalesOrder(id) {
    return (await this.listSalesOrders()).find(o => o.id === id);
  },

  async createSalesOrder(order) {
    Store.createSalesOrder(order);
    return order;
  },

  async updateSalesOrder(id, patch) {
    Store.updateSalesOrder(id, patch);
  },

  async createInvoice(invoice) {
    Store.createInvoice(invoice);
    return invoice;
  }
};
