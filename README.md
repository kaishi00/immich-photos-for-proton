# Immich Photos for Proton Mail 🔐📸

> Attach photos from your self-hosted [Immich](https://immich.app/) library directly into **Proton Mail** compose windows.

A browser extension (Firefox / Chrome / Edge) that injects an Immich button into Proton Mail's composer, letting you browse your photo library, search, pick albums, and attach — all without leaving your email draft.

## Features

- 🎨 **Full Immich picker** — Recent timeline, smart search, album browser
- 📎 **Native attachments** — Photos appear as real Proton Mail encrypted attachments
- ✂️ **Optional resize & strip metadata** — Downscale to 1920px, drop EXIF/GPS
- 🌙 **Dark mode** — Auto-detects Proton Mail's theme (light or dark)
- 🔒 **Local-only credentials** — Your Immich URL & API key stay in `browser.storage.local`
- 🌐 **Cross-browser** — Firefox, Chrome, Edge (Manifest V3)

## Installation

### Firefox

Install from [Mozilla Add-ons](https://addons.mozilla.org/addon/immich-photos-for-proton/) (coming soon).

### Chrome / Edge

Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/immich-photos-for-proton/jbehpdblndffpmlhbileeffljpniobcc).

## Setup

1. In your Immich instance: **Account Settings** → **API Keys** → **New APIKey**
2. Grant permissions: `asset.read`, `asset.download`, `asset.view`, `album.read`, `albumAsset.read`, `search.read`
3. In extension settings:
   - **Immich base URL**: e.g. `https://immich.example.com` (no trailing slash)
   - **API key**: Paste the generated key
4. Click **Save & Connect**

Open any Proton Mail compose window — the **Immich** button appears in the action bar.

## How It Works

Based on the excellent [immich-photos-for-gmail](https://github.com/richard1912/immich-photos-for-gmail) by [richard1912](https://github.com/richard1912), adapted for Proton Mail's composer architecture.

Proton Mail's composer is a React SPA with an iframe-based editor and a native file input for attachments. The extension injects an Immich button next to the paperclip in `footer.composer-actions`, opens a picker iframe, and when photos are selected, sets `HTMLInputElement.files` via the native setter and dispatches a `change` event — triggering Proton's own upload path, which encrypts attachments client-side with OpenPGP before upload.

## Privacy

- Your Immich URL and API key are stored exclusively in `browser.storage.local`
- Only transmitted to your self-hosted Immich server
- No telemetry, analytics, or third-party data transmission
- Extension only runs on `https://mail.proton.me/*` and your configured Immich origin

## Development

```bash
git clone https://github.com/kaishi00/immich-photos-for-proton.git
cd immich-photos-for-proton
# Chrome build:
python3 scripts/build_chrome.py
# Firefox build (no build step — manifest.json is Firefox-native):
zip -r immich-photos-for-proton.xpi manifest.json background.js content/ picker/ options/ icons/ -x "*.git*"
```

## Acknowledgments

- Forked from [richard1912/immich-photos-for-gmail](https://github.com/richard1912/immich-photos-for-gmail) — the original Gmail extension, MIT licensed
- [Immich](https://immich.app/) — incredible self-hosted photo management
- [Proton Mail](https://proton.me/mail) — open-source encrypted email

## License

MIT — see [LICENSE](LICENSE).
