# Immich Photos for Proton Mail 🔐📸

> Attach photos from your self-hosted [Immich](https://immich.app/) library directly into **Proton Mail** compose windows.

A browser extension (Firefox / Chrome / Edge) that injects an Immich button into Proton Mail's composer, letting you browse your photo library, search, pick albums, and attach — all without leaving your email draft.

![Screenshot placeholder](assets/upload-screen.png)

## Why?

You self-host your photos on Immich for privacy. You use Proton Mail for encrypted email. But when you want to share photos via email, the workflow is:

1. Open Immich → find photo → download
2. Switch to Proton Mail → compose → attach downloaded file
3. Repeat for every photo

This extension eliminates that round-trip. Pick photos from Immich directly inside Proton Mail's compose window.

## Features

- 🎨 **Full Immich picker** — Recent timeline, smart search, album browser
- 📎 **Native attachments** — Photos appear as real Proton Mail encrypted attachments
- ✂️ **Optional resize & strip metadata** — Downscale to 1920px, drop EXIF/GPS
- 🔒 **Local-only credentials** — Your Immich URL & API key stay in `browser.storage.local`
- 🌐 **Cross-browser** — Firefox, Chrome, Edge (Manifest V3)

## Installation

### Firefox

1. Download the latest `.xpi` from [Releases](https://github.com/immich-photos-for-proton/immich-photos-for-proton/releases)
2. Open `about:addons` → drag the `.xpi` onto the page
3. Approve permission prompt for `mail.proton.me`

### Chrome / Edge

1. Download `immich-photos-for-proton-chrome.zip` from [Releases](https://github.com/immich-photos-for-proton/immich-photos-for-proton/releases)
2. Unzip it
3. Open `chrome://extensions` (or `edge://extensions`) → enable **Developer mode**
4. Click **Load unpacked** → select the unzipped folder
5. Approve permission prompt

## Setup

1. In your Immich instance: **Account Settings** → **API Keys** → **New API Key**
2. Grant permissions: `asset.read`, `asset.download`, `asset.view`, `album.read`, `albumAsset.read`, `search.read`
3. In extension settings:
   - **Immich base URL**: e.g. `https://immich.example.com` (no trailing slash)
   - **API key**: Paste the generated key
4. Click **Save & Connect**

Open any Proton Mail compose window — the **Immich** button appears in the action bar.

## How It Works

Based on the excellent [immich-photos-for-gmail](https://github.com/richard1912/immich-photos-for-gmail) by [richard1912](https://github.com/richard1912), adapted for Proton Mail's composer architecture.

Key differences from the Gmail version:

| | Gmail Version | Proton Version |
|---|---|---|
| **Attachment method** | File input manipulation via MAIN world script bridge | Synthetic drag-and-drop events on composer Dropzone |
| **Target domain** | `mail.google.com` | `mail.proton.me` |
| **Encryption** | Gmail handles TLS in transit | Proton encrypts attachments client-side before upload |
| **Content script world** | ISOLATED + MAIN (for file input access) | ISOLATED only (drop events don't require MAIN world) |

Proton Mail's composer uses a React-based Dropzone component that accepts file drops. The extension creates `File` objects from fetched Immich data, builds a `DataTransfer`, and dispatches synthetic `dragenter`/`dragover`/`drop` events. Proton's handler picks them up, encrypts client-side with OpenPGP, and uploads normally.

## Privacy

- Your Immich URL and API key are stored exclusively in `browser.storage.local`
- Only transmitted to your self-hosted Immich server
- No telemetry, analytics, or third-party data transmission
- Extension only runs on `https://mail.proton.me/*` and your configured Immich origin

## Development

```bash
git clone https://github.com/immich-photos-for-proton/immich-photos-for-proton.git
cd immich-photos-for-proton
# Firefox dev build (unsigned):
zip -r immich-photos-for-proton.xpi . -x "*.git*" "icons/source/*" "*.md" "LICENSE"
# Load unsigned XPI in Firefox Developer Edition / Nightly
```

## Acknowledgments

- Forked from [richard1912/immich-photos-for-gmail](https://github.com/richard1912/immich-photos-for-gmail) — the original Gmail extension, MIT licensed
- [Immich](https://immich.app/) — incredible self-hosted photo management
- [Proton Mail](https://proton.me/mail) — open-source encrypted email ([WebClients repo](https://github.com/ProtonMail/WebClients))

## License

MIT — see [LICENSE](LICENSE).
