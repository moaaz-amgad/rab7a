export interface InventoryItem {
  id: number;
  branch_id: number;
  category_id: number;
  uom_id: number;
  sku: string;
  barcode?: string;
  name_ar: string;
  name_en: string;
  type: 'raw_material' | 'prepared' | 'packaging' | 'cleaning';
  current_stock: number;
  reorder_level: number;
  wac_unit_cost: number; // in piasters
  wac_unit_cost_egp?: number;
  total_valuation_egp?: number;
  last_purchase_price: number;
  is_active: boolean;
  category?: { id: number; name_ar: string };
  uom?: { id: number; name_ar: string; symbol: string };
}

export interface StockMovement {
  id: number;
  branch_id: number;
  warehouse_id: number;
  item_id: number;
  item?: InventoryItem;
  movement_date: string;
  movement_type: string;
  reference_number: string;
  quantity: number;
  unit_cost: number; // in piasters
  total_cost: number; // in piasters
  stock_after: number;
  created_by?: number;
  notes?: string;
}

export interface Supplier {
  id: number;
  branch_id: number;
  code: string;
  name_ar: string;
  name_en: string;
  company_name?: string;
  tax_number?: string;
  phone: string;
  email?: string;
  payment_terms_days: number;
  credit_limit: number; // piasters
  current_balance: number; // piasters
  status: 'active' | 'suspended' | 'blacklisted';
}

export interface SupplierLedgerEntry {
  id: number;
  supplier_id: number;
  transaction_date: string;
  reference_number: string;
  transaction_type: string;
  description: string;
  debit: number; // piasters (payments made)
  credit: number; // piasters (invoices owed)
  running_balance: number; // piasters
  created_by?: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: number;
  branch_id: number;
  supplier_id: number;
  supplier_name?: string;
  po_number: string;
  order_date: string;
  expected_delivery_date?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number; // piasters
  status: 'draft' | 'approved' | 'partially_received' | 'received' | 'cancelled';
}
