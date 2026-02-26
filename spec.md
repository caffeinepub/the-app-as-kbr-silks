# Specification

## Summary
**Goal:** Fix the admin authorization mismatch so that users authenticated via the OwnerVerificationGate (password '9966' or authorized phone number) can successfully add sarees without receiving an "Unauthorized: Only admins can add sarees" error.

**Planned changes:**
- Update the backend `addSaree` function authorization logic to correctly recognize callers authenticated through the frontend's password/phone-based admin gate, not just Internet Identity principals.
- Update the frontend `AdminSarees` page to ensure the `addSaree` mutation passes the correct auth context or credentials that the backend expects from gate-verified admins.
- Ensure non-admin users are still blocked from adding sarees.

**User-visible outcome:** An admin who has logged in through the OwnerVerificationGate can fill out and submit the "Add New Saree" form successfully — no "Unauthorized" error banner appears, and the new saree is saved and shown in the admin saree list.
