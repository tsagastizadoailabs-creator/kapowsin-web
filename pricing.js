/**
 * Kapowsin Pricing Tiers — Vanilla JS
 * Minimal interactions for the web component.
 * - CTA clicks: configurable (default scrolls to #contact or logs)
 * - Tier selection visual feedback (demo)
 * - Easy to extend: listen for 'kapowsin:cta-click' events
 *
 * Usage (embed):
 *   <link rel="stylesheet" href="/pricing-tiers/styles.css">
 *   <div id="pricing-root"></div>
 *   <script src="/pricing-tiers/pricing.js"></script>
 *   <script>initKapowsinPricing('#pricing-root', { contactUrl: '/contact' })</script>
 */

(function () {
  'use strict';

  function initKapowsinPricing(rootSelector = '.kapowsin-pricing', options = {}) {
    const root = document.querySelector(rootSelector);
    if (!root) {
      console.warn('[Kapowsin Pricing] Root not found:', rootSelector);
      return;
    }

    const contactUrl = options.contactUrl || '#contact';
    const onCta = options.onCta || defaultCtaHandler;

    // Wire all Get Started + entry CTAs
    const ctas = root.querySelectorAll('a[data-action], button[data-action]');
    ctas.forEach((el) => {
      el.addEventListener('click', (e) => {
        const action = el.dataset.action;
        const tier = el.dataset.tier;
        const entry = el.dataset.entry;

        // Prevent default only if we are handling internally for demo
        // In production you may want real links
        if (contactUrl === '#contact' || contactUrl.startsWith('#')) {
          // Demo mode — allow hash or custom
        } else {
          // If real URL provided, let it navigate unless prevented
        }

        const payload = {
          action,
          tier: tier || null,
          entry: entry || null,
          element: el,
          timestamp: Date.now()
        };

        // Dispatch custom event for host page to listen
        const event = new CustomEvent('kapowsin:cta-click', { detail: payload, bubbles: true });
        root.dispatchEvent(event);

        // Call handler
        onCta(payload, e);
      });
    });

    // Optional: keyboard accessibility hint on cards
    const cards = root.querySelectorAll('.tier-card');
    cards.forEach((card) => {
      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const btn = card.querySelector('a[data-action="get-started"]');
          if (btn) btn.click();
        }
      });
    });

    console.log('[Kapowsin Pricing] Initialized on', rootSelector);
  }

  function defaultCtaHandler(payload, event) {
    const { tier, entry, action } = payload;

    // Demo behavior: visual selection + helpful console
    if (tier) {
      // Deselect others
      document.querySelectorAll('.tier-card').forEach(c => c.classList.remove('selected'));
      const card = payload.element.closest('.tier-card');
      if (card) card.classList.add('selected');

      // Temporary visual confirmation
      const originalText = payload.element.textContent;
      payload.element.textContent = '✓ Selected — opening contact...';
      setTimeout(() => {
        if (payload.element && payload.element.textContent.includes('Selected')) {
          payload.element.textContent = originalText;
        }
      }, 1400);
    }

    // Scroll to contact area if hash target exists on page
    const contact = document.querySelector('#contact, [id*="contact"], .contact-form, footer');
    if (contact && (action === 'get-started' || action === 'entry')) {
      setTimeout(() => {
        contact.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 180);
    }

    // Log for developers / analytics hook
    console.log('[Kapowsin Pricing] CTA clicked:', { tier, entry, action });

    // Example: you can replace this with real form open / analytics
    // e.g. if (window.gtag) gtag('event', 'select_tier', { tier });
  }

  // Auto-init on full demo pages (when script is included directly)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.querySelector('.kapowsin-pricing')) {
        initKapowsinPricing('.kapowsin-pricing');
      }
    });
  } else if (document.querySelector('.kapowsin-pricing')) {
    initKapowsinPricing('.kapowsin-pricing');
  }

  // Expose for manual / embed use
  window.initKapowsinPricing = initKapowsinPricing;

  // Optional: add a tiny selected style (in case host doesn't have it)
  const style = document.createElement('style');
  style.textContent = `
    .kapowsin-pricing .tier-card.selected {
      outline: 2px solid #10b981;
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
})();
