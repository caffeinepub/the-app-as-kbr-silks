import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Customer {
    totalOrders: bigint;
    name: string;
    email?: string;
    address: string;
    phone: string;
}
export type Time = bigint;
export interface OrderedItem {
    sareeId: bigint;
    quantity: bigint;
}
export interface Order {
    id: bigint;
    customerName: string;
    status: OrderStatus;
    customerPhone: string;
    orderDate: Time;
    items: Array<OrderedItem>;
    totalPrice: bigint;
}
export interface Saree {
    id: bigint;
    fabricType: FabricType;
    name: string;
    color: string;
    description: string;
    stock: bigint;
    image: ExternalBlob;
    price: bigint;
}
export enum FabricType {
    Kanjivaram = "Kanjivaram",
    Banarasi = "Banarasi",
    Mysore = "Mysore"
}
export enum OrderStatus {
    Delivered = "Delivered",
    Confirmed = "Confirmed",
    Shipped = "Shipped",
    Pending = "Pending"
}
export interface backendInterface {
    addCustomer(name: string, phone: string, email: string | null, address: string): Promise<void>;
    addSaree(name: string, description: string, fabricType: FabricType, color: string, price: bigint, stock: bigint, image: ExternalBlob): Promise<bigint>;
    deleteSaree(id: bigint): Promise<void>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllSarees(): Promise<Array<Saree>>;
    getCustomer(phone: string): Promise<Customer>;
    getOrder(id: bigint): Promise<Order>;
    getSaree(id: bigint): Promise<Saree>;
    getSareesByPrice(): Promise<Array<Saree>>;
    placeOrder(customerName: string, customerPhone: string, items: Array<OrderedItem>): Promise<bigint>;
    updateCustomer(phone: string, name: string, email: string | null, address: string): Promise<void>;
    updateOrderStatus(id: bigint, status: OrderStatus): Promise<void>;
    updateSaree(id: bigint, name: string, description: string, fabricType: FabricType, color: string, price: bigint, stock: bigint, image: ExternalBlob): Promise<void>;
}
