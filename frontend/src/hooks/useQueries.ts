import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { FabricType, OrderStatus, type Saree, type Order, type Customer, type UserProfile } from '../backend';
import { ExternalBlob } from '../backend';

// ─── Sarees ──────────────────────────────────────────────────────────────────

export function useGetAllSarees() {
  const { actor, isFetching } = useActor();

  return useQuery<Saree[]>({
    queryKey: ['sarees'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllSarees();
      return result;
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
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
      const result = await actor.addSaree(
        params.name,
        params.description,
        params.fabricType,
        params.color,
        params.price,
        params.stock,
        params.image,
      );
      if (result.__kind__ === 'Err') {
        throw new Error(result.Err);
      }
      return result.Ok;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sarees'] });
      await queryClient.refetchQueries({ queryKey: ['sarees'], type: 'active' });
    },
    onError: (error) => {
      console.error('addSaree mutation error:', error);
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
      const result = await actor.updateSaree(
        params.id,
        params.name,
        params.description,
        params.fabricType,
        params.color,
        params.price,
        params.stock,
        params.image,
      );
      if (result.__kind__ === 'Err') {
        throw new Error(result.Err);
      }
      return result.Ok;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sarees'] });
      await queryClient.refetchQueries({ queryKey: ['sarees'], type: 'active' });
    },
    onError: (error) => {
      console.error('updateSaree mutation error:', error);
    },
  });
}

export function useDeleteSaree() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.deleteSaree(id);
      if (result.__kind__ === 'Err') {
        throw new Error(result.Err);
      }
      return result.Ok;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sarees'] });
      await queryClient.refetchQueries({ queryKey: ['sarees'], type: 'active' });
    },
    onError: (error) => {
      console.error('deleteSaree mutation error:', error);
    },
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export interface PlaceOrderParams {
  sareeId: bigint;
  quantity: bigint;
  productName: string;
  fabricType: FabricType;
  color: string;
  unitPrice: bigint;
  customerName: string;
  customerPhone: string;
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: PlaceOrderParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(
        params.customerName,
        params.customerPhone,
        [{ sareeId: params.sareeId, quantity: params.quantity }],
        [{
          name: params.productName,
          fabricType: params.fabricType,
          color: params.color,
          unitPrice: params.unitPrice,
          quantity: params.quantity,
        }],
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateOrderStatus(id, status);
      if (result.__kind__ === 'Err') throw new Error(result.Err);
      return result.Ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: bigint; paymentStatus: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updatePaymentStatus(id, paymentStatus);
      if (result.__kind__ === 'Err') throw new Error(result.Err);
      return result.Ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// ─── Customers ────────────────────────────────────────────────────────────────

export function useGetAllCustomers() {
  const { actor, isFetching } = useActor();

  return useQuery<Customer[]>({
    queryKey: ['customers'],
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
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addCustomer(params.name, params.phone, params.email, params.address);
      if (result.__kind__ === 'Err') throw new Error(result.Err);
      return result.Ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
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
      const result = await actor.updateCustomer(params.phone, params.name, params.email, params.address);
      if (result.__kind__ === 'Err') throw new Error(result.Err);
      return result.Ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
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
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
