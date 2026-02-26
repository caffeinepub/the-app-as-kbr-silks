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
export interface ProductDetail {
    fabricType: FabricType;
    name: string;
    color: string;
    quantity: bigint;
    unitPrice: bigint;
}
export type Time = bigint;
export interface Customer {
    totalOrders: bigint;
    name: string;
    email?: string;
    address: string;
    phone: string;
}
export interface OrderedItem {
    sareeId: bigint;
    quantity: bigint;
}
export interface Order {
    id: bigint;
    customerName: string;
    status: OrderStatus;
    paymentStatus: string;
    customerPhone: string;
    orderDate: Time;
    items: Array<OrderedItem>;
    totalPrice: bigint;
    productDetails: Array<ProductDetail>;
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
export interface UserProfile {
    name: string;
}
export enum FabricType {
    Kanjivaram = "Kanjivaram",
    Banarasi = "Banarasi",
    Mysore = "Mysore"
}
export enum OrderStatus {
    Delivered = "Delivered",
    Confirmed = "Confirmed",
    Cancelled = "Cancelled",
    Shipped = "Shipped",
    Pending = "Pending"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCustomer(name: string, phone: string, email: string | null, address: string): Promise<void>;
    addSaree(name: string, description: string, fabricType: FabricType, color: string, price: bigint, stock: bigint, image: ExternalBlob): Promise<{
        __kind__: "StorageError";
        StorageError: string;
    }>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteSaree(id: bigint): Promise<void>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllSarees(): Promise<Array<Saree>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomer(phone: string): Promise<Customer>;
    getOrder(id: bigint): Promise<Order>;
    getSaree(id: bigint): Promise<Saree>;
    getSareesByPrice(): Promise<Array<Saree>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(customerName: string, customerPhone: string, items: Array<OrderedItem>, productDetails: Array<ProductDetail>): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCustomer(phone: string, name: string, email: string | null, address: string): Promise<void>;
    updateOrderStatus(id: bigint, status: OrderStatus): Promise<void>;
    updatePaymentStatus(id: bigint, paymentStatus: string): Promise<void>;
    updateSaree(id: bigint, name: string, description: string, fabricType: FabricType, color: string, price: bigint, stock: bigint, image: ExternalBlob): Promise<{
        __kind__: "StorageError";
        StorageError: string;
    }>;
}
