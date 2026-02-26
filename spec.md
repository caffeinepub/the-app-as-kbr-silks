# Specification

## Summary
**Goal:** Fix the saree catalog sync issue so that sarees added or updated in the admin panel immediately appear in the user-facing catalog without a page refresh.

**Planned changes:**
- Introduce a shared React Query key constant for the saree list query, referenced by both `AdminSarees.tsx` and `Catalog.tsx`.
- Invalidate the saree list query cache upon successful add/update mutations in the admin panel so the catalog re-fetches automatically.
- Audit `useQueries.ts` to remove any `staleTime`/`cacheTime` settings that would prevent re-fetching after invalidation.
- Ensure newly added saree images (stored as blobs) are correctly converted to displayable URLs in the catalog page so no broken image icons appear.

**User-visible outcome:** After an admin adds or edits a saree, it immediately appears with its correct image in the user-facing catalog without requiring a manual page refresh.
