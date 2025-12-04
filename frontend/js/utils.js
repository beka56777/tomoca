// frontend/js/utils.js
// Lightweight helper functions used across pages.

(function (global) {
  function el(sel, ctx = document) { return ctx.querySelector(sel); }
  function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

  function setLoading(container, on = true) {
    if (!container) return;
    container.style.display = on ? (container.dataset.flex === "true" ? "flex" : "block") : "none";
  }

  function showMessage(container, type, html) {
    if (!container) return;
    container.className = 'response-message ' + (type || '');
    container.innerHTML = html;
    container.style.display = 'block';
    // auto-hide for non-admin pages
    if (type !== 'error') {
      setTimeout(() => { container.style.display = 'none'; }, 8000);
    }
  }

  function copyToClipboard(text) {
    if (!text) return Promise.reject('No text');
    if (navigator.clipboard) return navigator.clipboard.writeText(text);
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      ta.remove();
      return Promise.resolve();
    } catch (e) {
      ta.remove();
      return Promise.reject(e);
    }
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return iso;
    }
  }

  function getAdminSecretFromUrl() {
    const p = new URLSearchParams(location.search);
    return p.get('admin') || '';
  }

  global._utils = {
    el, qsa, setLoading, showMessage, copyToClipboard, formatDate, getAdminSecretFromUrl
  };
})(window);
