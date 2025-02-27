export interface BillingAddress {
    // Additional fields exist, type as needed
    [key: string]: unknown;
    first_name: string;
    last_name: string;
    street_1: string;
    street_2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface ShippingAddress {
    [key: string]: unknown;
    first_name: string;
    last_name: string;
    street_1: string;
    street_2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface OrderProduct {
    [key: string]: unknown;
    id: number;
    name: string;
    quantity: number;
    order_address_id: number;
}

export interface Order {
    // Additional fields exist, type as needed
    [key: string]: unknown;
    billing_address: BillingAddress;
    currency_code: string;
    customer_locale: string;
    discount_amount: string;
    id: number;
    items_total: number;
    order_source: string;
    payment_status: string;
    status: string;
    subtotal_ex_tax: string;
    shipping_cost_ex_tax: string;
    total_inc_tax: string;
    total_tax: string;
}

export interface ShippingAndProductsInfo {
    shipping_addresses: ShippingAddress[];
    products: OrderProduct[];
}

export interface StoreInformation {
    id: string,
    domain: string,
    secure_url: string,
    status: string
}