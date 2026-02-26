import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type Saree, type Order, type Customer, type OrderedItem, type ProductDetail, FabricType, OrderStatus, ExternalBlob } from '../backend';
import { retryWithBackoff, parseBackendError } from '../utils/retryWithBackoff';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  sarees: ['sarees'] as const,
  orders: ['orders'] as const,
  customers: ['customers'] as const,
};

// ─── Saree Queries ────────────────────────────────────────────────────────────
export function useGetAllSarees() {
  const { actor, isFetching } = useActor();
  return useQuery<Saree[]>({
    queryKey: QUERY_KEYS.sarees,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSarees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSaree() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      description: string;
      fabricType: FabricType;
      color: string;
      price: bigint;
      stock: bigint;
      image: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return retryWithBackoff(
        () =>
          actor.addSaree(
            params.name,
            params.description,
            params.fabricType,
            params.color,
            params.price,
            params.stock,
            params.image
          ),
        { maxAttempts: 3, baseDelayMs: 1000 }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sarees });
    },
    onError: (err) => {
      // Error message is parsed and surfaced in the UI via mutation.error
      const _ = parseBackendError(err);
    },
  });
}

export function useUpdateSaree() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      name: string;
      description: string;
      fabricType: FabricType;
      color: string;
      price: bigint;
      stock: bigint;
      image: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return retryWithBackoff(
        () =>
          actor.updateSaree(
            params.id,
            params.name,
            params.description,
            params.fabricType,
            params.color,
            params.price,
            params.stock,
            params.image
          ),
        { maxAttempts: 3, baseDelayMs: 1000 }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sarees });
    },
    onError: (err) => {
      const _ = parseBackendError(err);
    },
  });
}

export function useDeleteSaree() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteSaree(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sarees });
    },
  });
}

// ─── Order Queries ────────────────────────────────────────────────────────────
export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: QUERY_KEYS.orders,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000, // Auto-refresh every 15 seconds for real-time order visibility
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      customerName: string;
      customerPhone: string;
      items: OrderedItem[];
      productDetails: ProductDetail[];
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.placeOrder(
        params.customerName,
        params.customerPhone,
        params.items,
        params.productDetails
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateOrderStatus(params.id, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
  });
}

// ─── Customer Queries ─────────────────────────────────────────────────────────
export function useGetAllCustomers() {
  const { actor, isFetching } = useActor();
  return useQuery<Customer[]>({
    queryKey: QUERY_KEYS.customers,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      phone: string;
      email: string | null;
      address: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addCustomer(params.name, params.phone, params.email, params.address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers });
    },
  });
}

export function useUpdateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      phone: string;
      name: string;
      email: string | null;
      address: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateCustomer(params.phone, params.name, params.email, params.address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers });
    },
  });
}
