# Existing Guide DB Quote Flow

Future work: create a quote flow for an existing Guides DB record.

Why:

- Backend can update `quote` on a guide DB record.
- Frontend must make the user re-quote before sending updated quote data.
- This is needed when the original quote expired or when quote data must change before retrying provider guide creation.

Scope to research later:

- Launch re-quote from an existing failed guide DB record.
- Prefill quote inputs from the existing guide's origin, destination, and parcel data where possible.
- Let the user pick a new quote.
- Submit the new `quote` through the existing guide DB PATCH flow.
- Decide how this connects to the edit guide modal when PATCH returns another failure caused by quote expiration.

Out of scope for the current edit UI story:

- Adding `quote` to `UpdateGuideDbPayload` usage.
- Building new quote screens/routes.
- Changing backend contracts.
