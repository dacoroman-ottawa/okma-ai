# Inventory Section - Test Instructions

## Products Tab

### View Product List
- [ ] Products display in a table on desktop with columns: Product, Type, Supplier, Price, Stock
- [ ] Products display in a card-style list on mobile
- [ ] Each product shows name, model (if available), and type icon
- [ ] Selling price displays prominently; rental price shows below if available
- [ ] Stock quantity displays with appropriate status badge

### Low Stock Alerts
- [ ] Products at or below reorder level show amber "Low" badge
- [ ] Products with zero stock show red "Out" badge
- [ ] Alert buttons at top show count of low stock and out of stock items
- [ ] Clicking alert button filters to show only those products
- [ ] Clicking active filter again clears the filter

### Product Filters
- [ ] Search filters products by name or model (case-insensitive)
- [ ] Type dropdown filters by product type (instrument, book, accessory, etc.)
- [ ] Supplier dropdown shows only active suppliers
- [ ] Multiple filters can be combined
- [ ] "Showing X of Y products" text displays when filters are active
- [ ] Clear filter link removes stock filter

### Product CRUD
- [ ] "Add Product" button triggers `onAddProduct` callback
- [ ] Clicking a product row triggers `onViewProduct` callback with product ID
- [ ] Product form should include: type dropdown, name, model, serial number, supplier dropdown, cost, selling price, rental price, stock quantity, reorder level, active toggle

### Empty State
- [ ] When no products exist, shows empty state with icon and message
- [ ] When filters return no results, shows "Try adjusting your filters" message

---

## Rentals Tab

### View Rental List
- [ ] Rentals display in a table on desktop with columns: Product, Customer, Period, Due Date, Status, Fee
- [ ] Rentals display in a card-style list on mobile
- [ ] Status badges show: Active (indigo), Overdue (red), Returned (gray)
- [ ] Overdue due dates display in red text
- [ ] Returned rentals show return date instead of due date
- [ ] Late fees display in red below rental fee when applicable

### Rental Status Filters
- [ ] "All" button shows count and toggles all rentals
- [ ] "Active" button shows count and filters to active rentals
- [ ] "Overdue" button appears only when overdue rentals exist
- [ ] Overdue button shows alert icon and count
- [ ] Rentals sort: overdue first, then active, then returned

### Rental Actions
- [ ] "New Rental" button triggers `onCreateRental` callback
- [ ] Clicking a rental row triggers `onViewRental` callback
- [ ] Return button (rotate icon) appears for active/overdue rentals
- [ ] Return button triggers `onReturnRental` callback with rental ID
- [ ] Return button click does not trigger row click (stopPropagation)

### Create Rental Flow
- [ ] Select product from available products
- [ ] Select customer from customer list
- [ ] Set rental period (weekly or monthly)
- [ ] Set due date based on period
- [ ] Enter deposit amount
- [ ] Calculate rental fee based on product rental price

### Return Rental Flow
- [ ] Mark rental as returned
- [ ] Record return date
- [ ] Add condition notes
- [ ] Calculate late fee if overdue

### Empty State
- [ ] When no rentals exist, shows empty state with icon and "Create a rental to get started"
- [ ] When filter returns no results, shows "No rentals match this filter"

---

## Sales Tab

### View Sales List
- [ ] Sales display in a table on desktop with columns: Date, Product, Customer, Qty, Payment, Amount
- [ ] Sales display in a card-style list on mobile
- [ ] Sales sorted by date (newest first)
- [ ] Payment method displays as a pill badge
- [ ] Quantity only shows on mobile when greater than 1

### Sales Summary
- [ ] Total sales count displays at top
- [ ] Total revenue displays at top with proper currency formatting (CAD)

### Sales Actions
- [ ] "Record Sale" button triggers `onRecordSale` callback
- [ ] Clicking a sale row triggers `onViewSale` callback

### Record Sale Flow
- [ ] Select product from available products
- [ ] Select customer from customer list
- [ ] Enter quantity
- [ ] Unit price auto-populates from product selling price
- [ ] Total amount calculates automatically
- [ ] Select payment method (Credit Card, Debit, Cash, E-Transfer)
- [ ] Stock quantity decrements after sale

### Empty State
- [ ] When no sales exist, shows empty state with shopping bag icon
- [ ] Shows "Sales will appear here when products are sold"

---

## Suppliers Tab

### View Supplier List
- [ ] Suppliers display in a responsive grid (1 column mobile, 2 tablet, 3 desktop)
- [ ] Each card shows: name, contact person, email, phone, address
- [ ] Product count displays at bottom of each card
- [ ] Active suppliers sort before inactive suppliers
- [ ] Inactive suppliers show "Inactive" badge and reduced opacity

### Supplier Actions
- [ ] "Add Supplier" button triggers `onAddSupplier` callback
- [ ] Clicking a supplier card triggers `onViewSupplier` callback

### Supplier CRUD
- [ ] Supplier form includes: name, contact person, email, phone, address, active toggle
- [ ] Deactivating a supplier does not remove their products
- [ ] Product count updates when products are added/removed

### Empty State
- [ ] When no suppliers exist, shows truck icon
- [ ] Shows "Add your first supplier to track where products come from"

---

## Customers Tab

### View Customer List
- [ ] Customers display in a responsive grid (1 column mobile, 2 tablet, 3 desktop)
- [ ] Each card shows: initials avatar, name, notes, email, phone, address
- [ ] Initials avatar uses first letter of first and last name
- [ ] Active rentals count displays as badge when customer has active/overdue rentals
- [ ] Customers sort alphabetically by name

### Customer Actions
- [ ] "Add Customer" button triggers `onAddCustomer` callback
- [ ] Clicking a customer card triggers `onViewCustomer` callback

### Customer CRUD
- [ ] Customer form includes: name, email, phone, address, notes
- [ ] Notes field is optional (can be null)
- [ ] Deleting a customer should warn if they have active rentals

### Empty State
- [ ] When no customers exist, shows users icon
- [ ] Shows "Add your first customer to track rentals and purchases"

---

## Tab Navigation

### Tab Switching
- [ ] Five tabs display: Products, Rentals, Sales, Suppliers, Customers
- [ ] Each tab shows appropriate icon
- [ ] Active tab has indigo border and text color
- [ ] Tabs are scrollable on mobile

### Tab Badges
- [ ] Products tab shows amber badge with low stock count (when > 0)
- [ ] Rentals tab shows red badge with overdue count (when > 0)

---

## Responsive Behavior

### Desktop (lg+)
- [ ] Products and Rentals show as full tables
- [ ] Suppliers and Customers show in 3-column grid

### Tablet (md-lg)
- [ ] Products show as table, others as cards
- [ ] Suppliers and Customers show in 2-column grid

### Mobile (< md)
- [ ] All lists display as stacked cards
- [ ] Suppliers and Customers show in single column
- [ ] Tab bar scrolls horizontally

---

## Dark Mode

- [ ] All text has appropriate light/dark color variants
- [ ] Background colors switch appropriately
- [ ] Borders and dividers use slate-700 in dark mode
- [ ] Status badges maintain visibility in both modes
- [ ] Form inputs have dark mode styling

---

## Currency Formatting

- [ ] All prices format as CAD (e.g., $45.00)
- [ ] Use `Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })`

---

## Date Formatting

- [ ] All dates display in short format (e.g., "Jan 15, 2025")
- [ ] Use `toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })`
