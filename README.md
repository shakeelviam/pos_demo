# TIMEHOUSE Watch Wholesale POS

A static, modern watch-wholesale workflow for GitHub Pages.

## What it does

### Sales person
The salesperson can:

1. Log in as Sales.
2. Browse watch brands.
3. Add products from CASIO, then CITIZEN, then SEIKO, etc.
4. All selected products stay in one global order.
5. Enter the customer's name and **mobile number**.
6. Create a Sales Order.
7. Tell the customer to go to the cashier and provide the same mobile number.

### Cashier
The cashier can:

1. Log in as Cashier.
2. Search Sales Orders by mobile number, customer, or order number.
3. Fetch the order.
4. Review every brand/product in the order.
5. Click **Make Invoice**.
6. Choose payment method.
7. View the combined invoice.
8. Print the invoice.

## Demo accounts

- Sales: `sales` / `sales123`
- Cashier: `cashier` / `cashier123`
- Admin: `admin` / `admin123`

## Critical architecture note

The included default storage is `localStorage`.

That means it is excellent for a demo or for testing on a single browser, but it **does not synchronize data between two different computers/phones**.

Your real showroom workflow requires shared storage:

Salesperson device
→ shared database
→ cashier device

For production, connect `js/backend.js` to a shared backend such as Supabase, a custom API, or another database service.

The UI and data model are already separated behind a `Backend` adapter so this can be added without rebuilding the entire interface.

## GitHub Pages

1. Create a GitHub repository.
2. Upload the project files.
3. Go to **Settings → Pages**.
4. Choose the branch containing the project.
5. Choose the repository root (`/`) as the folder.
6. Save.
7. Open the GitHub Pages URL.

Because this project uses relative paths, it is compatible with repository URLs such as:

`https://username.github.io/repository-name/`

## Customize

Edit `js/config.js` for:

- Company name
- Company address
- Phone
- Email
- Currency
- Tax
- Invoice prefix
- Sales-order prefix
- Demo users

Edit `js/data.js` for:

- Brands
- Products
- SKUs
- Wholesale prices
- Stock
- Categories

## Recommended next production step

Implement the Supabase adapter so a salesperson on one device can create an order and a cashier on another device can immediately find it by mobile number.

Do not put a Supabase `service_role` key in the frontend. Only the public anon key is appropriate for a browser app, with database Row Level Security configured correctly.
