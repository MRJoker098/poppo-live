# Security Spec: Poppo Live

## Data Invariants
1. A user cannot modify another user's coin balance or level.
2. A user can only edit their own profile (displayName, bio, photoURL).
3. Only the host of a stream can end the stream.
4. Messages must be sent by the authenticated user.
5. Coins cannot be negative.
6. `createdAt` and `startedAt` are immutable.

## The Dirty Dozen Payloads

1. **Identity Spoofing**: Attempt to create a user profile with a `uid` that doesn't match `auth.uid`.
2. **Wealth Injection**: Attempt to update `coins` in the user's own profile without a server-side trigger (client-side update).
3. **Ghost Stream**: Attempt to create a stream where `hostId` is not the current user.
4. **Message Forgery**: Send a message with a `senderId` that doesn't match `auth.uid`.
5. **Session Hijacking**: Attempt to end a stream (change status to 'ended') as a viewer, not the host.
6. **Time Travel**: Attempt to set `createdAt` in the future or past, bypassing `request.time`.
7. **Negative Balance**: Attempt to set `coins` to -100.
8. **Field Poisoning**: Attempt to add a `role: 'admin'` field to a user profile.
9. **Orphaned Message**: Attempt to send a message to a stream that doesn't exist.
10. **Shadow Update**: Attempt to update a stream's `viewerCount` to a massive number from a client.
11. **PII Leak**: Authenticated user trying to read sensitive private fields of another user (if any).
12. **Recursive Cost Attack**: Flooding `get()` calls in a list query.

## The Test Runner
I will create `firestore.rules.test.ts` to verify these protections.
