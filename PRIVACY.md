# Privacy Policy — Immich Photos for Proton Mail

**Immich Photos for Proton Mail** is a browser extension (Firefox and Chrome / Edge). It does not have any backend servers and does not collect any data about you.

## What data the extension accesses

- **To `mail.proton.me`**: the extension injects a button into Proton Mail's compose UI and reads the compose dialog's DOM in order to add the selected files as attachments via synthetic drag-and-drop events. No email content is sent anywhere outside your browser.
- **To your self-hosted Immich instance**: the extension sends HTTP requests with your API key to browse your photo library and download selected photos. These requests go directly from your browser to your Immich server.
- Any address other than the Immich URL you configured and `mail.proton.me`

## Where data is stored

| Data | Storage | Sent to |
|------|---------|---------|
| Immich base URL | `browser.storage.local` | Nowhere |
| Immich API key | `browser.storage.local` | Your Immich server only |
| Downloaded photo bytes | Memory only (during attach) | Nowhere |

## Permissions breakdown

| Permission / Origin | Purpose |
|---|---|
| `storage` | Save your Immich URL + API key locally |
| `https://mail.proton.me/*` (host) | Inject the **Immich** button into the Proton Mail composer toolbar and dispatch drop events with selected files into the composer. |
| `https://<your-immich>/*` (optional, granted on setup) | Fetch photos, thumbnails, albums, and search results from your Immich instance. |

## Third-party code

None. The extension contains no analytics, tracking, advertising, or CDN-loaded scripts.

## Source code

Full source available at: https://github.com/immich-photos-for-proton/immich-photos-for-proton

For questions or concerns, open an issue at <https://github.com/immich-photos-for-proton/immich-photos-for-proton/issues>.
