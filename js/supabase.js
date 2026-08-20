/*
  OPTIONAL REAL SHARED BACKEND

  If salesperson and cashier are on separate devices, localStorage cannot
  synchronize sales orders. This file is a placeholder adapter for Supabase.

  To enable a real shared backend:
  1. Create a Supabase project.
  2. Create tables for sales_orders and invoices.
  3. Put the public project URL and anon key here.
  4. Change APP_CONFIG.sharedBackend to "supabase".
  5. Implement the queries below.

  Never put a Supabase service_role key in this frontend.
  Only the public anon key belongs in a browser application.
*/

export const SUPABASE_CONFIG = {
  url: "",
  anonKey: ""
};

export const SupabaseBackend = {
  configured() {
    return Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
  },

  async listSalesOrders() {
    throw new Error("Supabase adapter not configured.");
  },

  async findSalesOrders() {
    throw new Error("Supabase adapter not configured.");
  },

  async getSalesOrder() {
    throw new Error("Supabase adapter not configured.");
  },

  async createSalesOrder() {
    throw new Error("Supabase adapter not configured.");
  },

  async updateSalesOrder() {
    throw new Error("Supabase adapter not configured.");
  },

  async createInvoice() {
    throw new Error("Supabase adapter not configured.");
  }
};
