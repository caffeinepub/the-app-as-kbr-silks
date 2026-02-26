import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { FabricType, OrderStatus, type Saree, type Order, type Customer, type UserProfile, type OrderedItem, type ProductDetail } from '../backend';
import { ExternalBlob } from '../backend';
import { retryWithBackoff } from '../utils/retryWithBackoff';

export const QUERY_KEYS = {
  sarees: ['sarees'] as const,
  orders: ['orders'] as const,
  customers: ['customers'] as const,
  currentUserProfile: ['currentUserProfile'] as const,
};

// ─── Saree Queries ───────────────────────────────────────────────────────────

export function useGetAllSarees() {
  const { actor, isFetching } = useActor();

  return useQuery<Saree[]>({
    queryKey: QUERY_KEYS.sarees,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.getAllSarees();
      return result;
    },
    enabled: !!actor && !isFetching,
    // staleTime: 0 ensures data is always considered stale and will refetch on mount/focus
    staleTime: 0,
    // Do NOT set gcTime: 0 — that causes the cache entry to be immediately garbage collected,
    // which breaks invalidateQueries/refetchQueries in mutation onSuccess callbacks.
    // Use the default gcTime (5 minutes) so the cache entry persists for refetching.
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useGetSareesByPrice() {
  const { actor, isFetching } = useActor();

  return useQuery<Saree[]>({
    queryKey: [...QUERY_KEYS.sarees, 'byPrice'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSareesByPrice();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
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
      image: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return retryWithBackoff(() =>
        actor.addSaree(
          params.name,
          params.description,
          params.fabricType,
          params.color,
          params.price,
          params.stock,
          params.image,
        )
      );
    },
    onSuccess: async () => {
      // Invalidate marks the cache as stale, then refetchQueries actively re-runs the query
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sarees });
      await queryClient.refetchQueries({ queryKey: QUERY_KEYS.sarees, type: 'active' });
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
      image: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return retryWithBackoff(() =>
        actor.updateSaree(
          params.id,
          params.name,
          params.description,
          params.fabricType,
          params.color,
          params.price,
          params.stock,
          params.image,
        )
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sarees });
      await queryClient.refetchQueries({ queryKey: QUERY_KEYS.sarees, type: 'active' });
    },
  });
}

export function useDeleteSaree() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSaree(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sarees });
      await queryClient.refetchQueries({ queryKey: QUERY_KEYS.sarees, type: 'active' });
    },
  });
}

// ─── Order Queries ────────────────────────────────────────────────────────────

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: QUERY_KEYS.orders,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
    staleTime: 0,
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
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(
        params.customerName,
        params.customerPhone,
        params.items,
        params.productDetails,
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
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(params.id, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
  });
}

export function useUpdatePaymentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; paymentStatus: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePaymentStatus(params.id, params.paymentStatus);
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
      if (!actor) throw new Error('Actor not available');
      return actor.getAllCustomers();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
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
      if (!actor) throw new Error('Actor not available');
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
      if (!actor) throw new Error('Actor not available');
      return actor.updateCustomer(params.phone, params.name, params.email, params.address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers });
    },
  });
}

// ─── User Profile Queries ─────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: QUERY_KEYS.currentUserProfile,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentUserProfile });
    },
  });
}
