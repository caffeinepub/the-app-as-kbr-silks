# Specification

## Summary
**Goal:** Fix the saree list not updating in real-time after add, edit, or delete operations in both the admin panel and the public catalog.

**Planned changes:**
- Audit and fix the `addSaree`, `updateSaree`, and `deleteSaree` mutation hooks in `useQueries.ts` to call `queryClient.invalidateQueries` with the correct sarees query key on success.
- Unify the sarees query key used across `AdminSarees` and the `Catalog` page, or ensure all relevant keys are invalidated after any mutation.
- Verify the `QueryClient` is not configured with an excessively long `staleTime` or `cacheTime` that prevents refetching after mutations.

**User-visible outcome:** After adding, editing, or deleting a saree in the admin panel, both the admin saree list and the public catalog immediately reflect the changes without requiring a manual page refresh.
