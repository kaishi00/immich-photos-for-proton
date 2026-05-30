# Changelog

## [0.1.3] - 2026-05-30

### Added
- Dark mode support — auto-detects Proton Mail's theme (OS preference + actual background color) and passes it to the picker iframe
- Full dark color palette using CSS custom properties

### Fixed
- Composer detection — Proton's editor lives in an iframe, not a direct `contenteditable`. Now detects via `footer.composer-actions`
- Button placement — inserts into `composer-attachments-button-wrapper` next to the paperclip instead of appending to footer
- Picker click handler — added `mousedown` event blocker to prevent Proton's LABEL from hijacking the click inside the wrapper
- Attachment injection — switched from synthetic drag/drop to Proton's native file input via `HTMLInputElement.files` setter + `change` event
- Variable scoping bug — `openPicker(compose)` → `openPicker(composer)`
- GitHub URLs — corrected to `kaishi00/immich-photos-for-proton`
- ResizeObserver console warning — moved suppressor to external file for Firefox CSP compliance
- Removed dead `page-bridge.js` from build output

## [0.1.0] - 2026-05-29 — Initial Release (Proton Mail Fork)

### Added
- Forked from [immich-photos-for-gmail v0.2.20](https://github.com/richard1912/immich-photos-for-gmail) by richard1912
- Rebranded for **Proton Mail** (`mail.proton.me`)
- Updated all manifest files (Firefox + Chrome) with Proton permissions and URLs
- Restyled options page and toolbar button for Proton's design language
- Updated privacy policy for Proton Mail's architecture
