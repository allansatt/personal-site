# Task 05: Implement `UploadForm` component

**Status**: done
**Spec**: [spec.md](./spec.md)
**Depends on**: none (`useUploadUrl` is already implemented)

## Objective

Create the `UploadForm` component that renders a file input + submit button, orchestrates the presigned upload flow, and notifies the parent to refresh the job list on success.

## Requirements addressed

FR-2, FR-9, FR-11, NFR-3, NFR-4, NFR-5

## Detailed description

Create `src/features/pokerhands/components/UploadForm.tsx`.

Props:
```ts
{ onUploadSuccess: () => void }
```

Upload flow:
1. User selects a `.txt` file (input `accept=".txt"`).
2. On submit: call `requestUploadUrl(file.name)` from `useUploadUrl()`.
3. On success: `PUT` the file bytes directly to `uploadUrl` with no `Authorization` header (presigned S3 URL). Do not send the file to any personal-site endpoint.
4. On PUT success: call `props.onUploadSuccess()` and show a confirmation message (e.g. "Upload queued successfully").
5. On any error (upload-url step or S3 PUT step): display an error message. On 401 from `/upload-url`, show a sign-in prompt. On 500, show a generic error.

Disable the submit button while `isLoading` is true or no file is selected.

Add `UploadForm.test.tsx` covering: renders correctly, submit disabled without file, successful upload flow (mock fetch for both calls), error display.

## Acceptance criteria

- [ ] File input only accepts `.txt` files
- [ ] Submit disabled when no file selected or while loading
- [ ] `POST /upload-url` called with Bearer token and filename
- [ ] File bytes PUT directly to the returned `uploadUrl` (no auth header on S3 PUT)
- [ ] `onUploadSuccess()` called after successful S3 PUT
- [ ] Confirmation message shown on success
- [ ] Error message shown on `/upload-url` failure or S3 PUT failure
- [ ] File never sent through the personal site's hosting layer
