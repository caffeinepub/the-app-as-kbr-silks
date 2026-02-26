# Specification

## Summary
**Goal:** Fix the admin panel saree upload flow with image compression, retry logic, better loading feedback, and improved backend error handling.

**Planned changes:**
- Add client-side image compression in the AdminSarees upload form before submission, keeping images under 1.5MB, and display the compressed file size to the user
- Show a progress bar or spinner during saree submission and disable the submit button while the upload is in progress
- Add automatic retry logic (up to 3 attempts with exponential backoff) to saree add/update mutations, with descriptive error messages on failure distinguishing between image-too-large and network errors
- Update `addSaree` and `updateSaree` in `backend/main.mo` to return a `Result` type with descriptive error variants instead of trapping on failure

**User-visible outcome:** Admin users can upload saree images reliably with visual feedback during upload, automatic retries on failure, and clear error messages explaining what went wrong if the upload ultimately fails.
