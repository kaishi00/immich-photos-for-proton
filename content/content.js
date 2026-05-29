(() => {
  // Cross-browser shim: see background.js.
  globalThis.browser ||= globalThis.chrome;

  // Guard against double-injection on extension reload.
  if (window.__IMMICH_CONTENT_LOADED__) return;
  window.__IMMICH_CONTENT_LOADED__ = true;

  const debug = () => !!window.__IMMICH_DEBUG__;
  const log = (...a) => { if (debug()) console.log("[immich-proton]", ...a); };
  const warn = (...a) => console.warn("[immich-proton]", ...a);

  const BUTTON_MARK = "data-immich-proton-injected";
  const PICKER_SOURCE = "immich-picker";

  let pickerFrame = null;
  let pickerOverlay = null;
  let pickerTargetCompose = null;

  // ── Proton Mail Composer Detection ──────────────────────────────
  //
  // Proton's web client is a React SPA. The composer is a floating
  // panel (ComposerFrame) that contains:
  //   - An action bar with buttons (send, attach, formatting, etc.)
  //   - A content/editable area wrapped in a Dropzone
  //
  // We use resilient attribute/class selectors that match Proton's
  // current DOM structure. These can be refined after testing against
  // the live site.

  // Find all composer containers currently in the DOM.
  // Proton composers are prominent elements — we look for the
  // composer frame/panel by its structural role.
  function findComposers() {
    // Strategy: find elements that contain both an attachment-like
    // button area and a contenteditable editor. Proton's composer
    // is typically a top-level floating element.
    const candidates = [];

    // Primary: look for Proton's composer container class patterns
    const byClass = document.querySelectorAll(
      '[class*="composer"], [class*="Composer"]'
    );
    for (const el of byClass) {
      // Must have a contenteditable area (the email body editor)
      if (el.querySelector('[contenteditable="true"]')) {
        candidates.push(el);
      }
    }

    // Fallback: any element containing a proton-style compose editor
    // that isn't already captured
    if (candidates.length === 0) {
      const editors = document.querySelectorAll(
        '.proton-editor [contenteditable="true"], ' +
        '[data-testid*="composer"] [contenteditable="true"]'
      );
      for (const ed of editors) {
        // Walk up to find the composer container
        let container = ed.closest('[class*="composer"]') || ed.parentElement;
        if (container && !candidates.includes(container)) {
          candidates.push(container);
        }
      }
    }

    return candidates;
  }

  // Find the action bar within a composer (where we inject our button).
  // This is typically where the Attach, Send, and other action buttons live.
  function findActionBar(composer) {
    // Look for the toolbar/action area inside the composer
    // Proton usually has a button row at the bottom or top of the composer
    return (
      composer.querySelector('[class*="toolbar"], [class*="Toolbar"]') ||
      composer.querySelector('[class*="composer-actions"], [class*="composerFooter"]') ||
      composer.querySelector('footer, [role="toolbar"]') ||
      // Very fallback: insert near the end of the composer
      composer
    );
  }

  // Check if we've already injected into this composer
  function alreadyInjected(composer) {
    return composer.hasAttribute(BUTTON_MARK);
  }

  // ── Button Injection ────────────────────────────────────────────

  function injectButton(composer) {
    if (alreadyInjected(composer)) return;

    const actionBar = findActionBar(composer);
    if (!actionBar) {
      warn("found composer but no action bar", composer);
      return;
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "immich-attach-btn";
    btn.title = "Attach from Immich";
    btn.setAttribute("aria-label", "Attach from Immich");
    btn.innerHTML = `<svg class="immich-attach-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 792 792" aria-hidden="true"><path fill="#FA2921" d="M375.48 267.63c38.64 34.21 69.78 70.87 89.82 105.42 34.42-61.56 57.42-134.71 57.71-181.3 0-.33 0-.63 0-.91 0-68.94-68.77-95.77-128.01-95.77s-128.01 26.83-128.01 95.77c0 .94 0 2.2 0 3.72 33.02 14.68 72.16 40.91 108.49 73.07z"/><path fill="#ED79B5" d="M164.7 455.63c24.15-26.87 61.2-55.99 103.01-80.61 44.48-26.18 88.97-44.47 128.02-52.84-47.91-51.76-110.37-96.24-154.6-110.91-.31-.1-.6-.19-.86-.28-65.57-21.3-112.34 35.81-130.64 92.15-18.3 56.34-14.04 130.04 51.53 151.34 1.89.49 3.09.88 4.54 1.35z"/><path fill="#FFB400" d="M681.07 302.19c-18.3-56.34-65.07-113.45-130.64-92.15-.9.29-2.1.68-3.54 1.15-3.75 35.93-16.6 81.27-35.96 125.76-20.59 47.32-45.84 88.27-72.51 118 69.18 13.72 145.86 12.98 190.26-1.14.31-.1.6-.2.86-.28 65.57-21.31 69.83-95.01 51.53-151.34z"/><path fill="#1E83F7" d="M336.54 510.71c-11.15-50.39-14.8-98.36-10.7-138.08-64.03 29.57-125.63 75.23-153.26 112.76-.19.26-.37.51-.53.73-40.52 55.78-.66 117.91 47.27 152.72 47.92 34.82 119.33 53.54 159.86-2.24.56-.76 1.3-1.78 2.19-3.01-17.81-31.27-34.07-75.51-44.56-122.88z"/><path fill="#18C249" d="M617.57 482.52c-35.33 7.54-82.42 9.33-130.72 4.66-51.37-4.96-98.11-16.32-134.63-32.5 8.33 70.03 32.73 142.73 59.88 180.6.19.26.37.51.53.73 40.52 55.78 111.93 37.06 159.86 2.24 47.92-34.82 87.79-96.95 47.27-152.72-1.65-2.05-2.39-3.07-3.28-4.3z"/></svg><span class="immich-attach-label">Immich</span>`;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openPicker(compose);
    });

    // Append to the action bar
    actionBar.appendChild(btn);
    composer.setAttribute(BUTTON_MARK, "1");
    log("injected button into composer");
  }

  function scanComposers() {
    for (const c of findComposers()) injectButton(c);
  }

  // ── Picker UI ───────────────────────────────────────────────────

  function openPicker(compose) {
    pickerTargetCompose = compose;
    if (pickerFrame) closePicker();

    pickerOverlay = document.createElement("div");
    pickerOverlay.className = "immich-picker-overlay";
    pickerOverlay.addEventListener("click", (e) => {
      if (e.target === pickerOverlay) closePicker();
    });

    pickerFrame = document.createElement("iframe");
    pickerFrame.className = "immich-picker-frame";
    pickerFrame.src = browser.runtime.getURL("picker/picker.html");
    pickerFrame.allow = "fullscreen";

    pickerOverlay.appendChild(pickerFrame);
    document.body.appendChild(pickerOverlay);
  }

  function closePicker() {
    if (pickerOverlay && pickerOverlay.parentNode) {
      pickerOverlay.parentNode.removeChild(pickerOverlay);
    }
    pickerFrame = null;
    pickerOverlay = null;
    pickerTargetCompose = null;
  }

  // ── Message Handling (from picker iframe) ─────────────────────

  window.addEventListener("message", async (event) => {
    if (!event.data || event.data.source !== PICKER_SOURCE) return;
    if (event.data.type === "close") {
      closePicker();
      return;
    }
    if (event.data.type === "attach") {
      const ids = event.data.assetIds || [];
      const options = event.data.options || {};
      const compose = pickerTargetCompose;
      closePicker();
      if (!compose || ids.length === 0) return;
      await attachAssetsToCompose(compose, ids, options);
    }
  });

  // ── Image Processing ───────────────────────────────────────────

  async function processImage(buffer, mime, filename, opts) {
    if (!opts.shrink) return null;
    let bitmap;
    try {
      bitmap = await createImageBitmap(new Blob([buffer], { type: mime }));
    } catch (e) {
      warn("decode failed, sending original:", filename, e.message || e);
      return null;
    }
    let { width: w, height: h } = bitmap;
    const MAX = 1920;
    if (w > MAX || h > MAX) {
      const scale = Math.min(MAX / w, MAX / h);
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));
    }
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const outBlob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 });
    const outBuffer = await outBlob.arrayBuffer();
    const newName = filename.replace(/\.[^./\\]+$/, "") + ".jpg";
    return { buffer: outBuffer, mime: "image/jpeg", filename: newName };
  }

  function base64ToBuffer(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }

  // ── Attachment Injection via Synthetic Drop Event ──────────────
  //
  // Proton Mail's composer uses a Dropzone component that listens
  // for drag-and-drop events on the content area. It checks:
  //   event.dataTransfer?.types?.includes('Files')
  // It does NOT check event.isTrusted, so synthetic events work.
  //
  // We create File objects from fetched Immich data, build a
  // DataTransfer, and dispatch a drop event sequence.

  async function attachAssetsToCompose(compose, assetIds, options) {
    log("attaching", assetIds.length, "asset(s), opts:", options);
    const files = [];
    for (const id of assetIds) {
      const resp = await browser.runtime.sendMessage({
        type: "fetchOriginal",
        payload: { assetId: id },
      });
      if (!resp || !resp.ok) {
        warn("fetchOriginal failed", id, resp && resp.error);
        continue;
      }
      let { data, mime, filename } = resp.data;
      let buffer = base64ToBuffer(data);
      log("fetched", filename, buffer.byteLength, "bytes,", mime);
      const processed = await processImage(buffer, mime, filename, options);
      if (processed) {
        log("processed", filename, "→", processed.filename,
            buffer.byteLength, "→", processed.buffer.byteLength, "bytes");
        buffer = processed.buffer;
        mime = processed.mime;
        filename = processed.filename;
      }
      files.push({ buffer, mime, filename });
    }
    if (files.length === 0) {
      warn("no files fetched, aborting");
      return;
    }

    // Build File objects from the fetched data
    const fileObjects = files.map((f) =>
      new File([f.buffer], f.filename, { type: f.mime || "application/octet-stream" })
    );

    // Find the drop target — the composer's content/editable area
    // where Proton's Dropzone listener is attached
    const dropTarget =
      compose.querySelector('[contenteditable="true"]') ||
      compose.querySelector('[class*="dropzone"], [class*="Dropzone"]') ||
      compose;

    log("dispatching drop on", dropTarget.className || dropTarget.tagName,
        "with", fileObjects.length, "file(s)");

    // Create DataTransfer with our files
    const dt = new DataTransfer();
    for (const f of fileObjects) dt.items.add(f);

    // Dispatch the full drag event sequence that Proton's Dropzone expects
    const dragEnterEvt = new DragEvent("dragenter", {
      dataTransfer: dt,
      bubbles: true,
      cancelable: true,
    });
    const dragOverEvt = new DragEvent("dragover", {
      dataTransfer: dt,
      bubbles: true,
      cancelable: true,
    });
    const dropEvt = new DragEvent("drop", {
      dataTransfer: dt,
      bubbles: true,
      cancelable: true,
    });

    dropTarget.dispatchEvent(dragEnterEvt);
    dropTarget.dispatchEvent(dragOverEvt);
    dropTarget.dispatchEvent(dropEvt);

    log("drop dispatched successfully");
  }

  // ── DOM Observation ────────────────────────────────────────────

  const obs = new MutationObserver(() => scanComposers());
  obs.observe(document.body, { childList: true, subtree: true });

  // Initial scan + delayed retry (Proton's SPA may load composers late)
  scanComposers();
  setTimeout(scanComposers, 2000);
  setTimeout(scanComposers, 5000);
})();
