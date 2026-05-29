# Changelog

## [0.1.0] - 2025-05-29 — Initial Release (Proton Mail Fork)

### Added
- Forked from [immich-photos-for-gmail v0.2.20](https://github.com/richard1912/immich-photos-for-gmail) by richard1912
- Rebranded for **Proton Mail** (`mail.proton.me`)
- Replaced Gmail file-input bridge with **synthetic drag-and-drop** attachment injection targeting Proton's Dropzone component
- Removed MAIN world `page-bridge.js` dependency — Proton version runs entirely in ISOLATED world
- Updated all manifest files (Firefox + Chrome) with Proton permissions and URLs
- Restyled options page and toolbar button for Proton's design language
- Updated privacy policy for Proton Mail's architecture

### Technical Notes
- Attachment method: Creates `File` objects from Immich API responses, builds a `DataTransfer`, dispatches synthetic `dragenter`/`dragover`/`drop` event sequence on the composer content area
- No `isTrusted` check in Proton's Dropzone handler — synthetic events work natively
- Client-side encryption handled transparently by Proton's existing pipeline after drop
- Composer detection uses resilient class-based selectors with MutationObserver + delayed retry for SPA timing
