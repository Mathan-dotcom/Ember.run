import { useEffect } from 'react';

/**
 * useScrollFade
 * Applies dynamic dual-directional fade-in and fade-out effects to cards
 * on the website (both Mission Control and Landing Page) as the user scrolls.
 *
 * Sticky header offset compensation:
 * - Header height is ~72px.
 * - As cards scroll UP toward the sticky header, they smoothly fade out (1.0 -> 0.08)
 *   and slide up slightly into the frosted edge.
 * - When scrolling back DOWN, cards re-entering from the top boundary smoothly fade in
 *   (0.08 -> 1.0) and settle into place.
 * - Cards entering from the BOTTOM boundary smoothly fade in (0.08 -> 1.0) and glide up.
 * - Cards exiting the BOTTOM boundary smoothly fade out (1.0 -> 0.08) and glide down.
 * - Cards in the active reading zone maintain 1.0 solid opacity and full interactivity.
 */
export function useScrollFade(activeView?: string) {
  useEffect(() => {
    let animationFrameId: number | null = null;

    const handleScroll = () => {
      if (animationFrameId) return;

      animationFrameId = requestAnimationFrame(() => {
        const cards = document.querySelectorAll<HTMLElement>(
          '.scroll-fade-card:not(.modal-box-fade *), article.sk-panel:not(.modal-box-fade *), .sk-panel.card-hover:not(.modal-box-fade *)'
        );
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const headerOffset = 76; // Height of sticky console header
        const topFadeZone = 140; // Distance below sticky header where exit fade occurs
        const bottomFadeZone = 190; // Distance above bottom edge where entry fade occurs

        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();

          // 1. Card completely above visible area (past the sticky header)
          if (rect.bottom <= headerOffset) {
            card.style.setProperty('opacity', '0.08', 'important');
            card.style.setProperty('transform', 'translateY(-16px)', 'important');
            card.style.setProperty('pointer-events', 'none');
            return;
          }

          // 2. Card completely below visible viewport
          if (rect.top >= viewportHeight) {
            card.style.setProperty('opacity', '0.08', 'important');
            card.style.setProperty('transform', 'translateY(22px)', 'important');
            card.style.setProperty('pointer-events', 'none');
            return;
          }

          let opacity = 1;
          let translateY = 0;

          // 3. Approaching or exiting via the TOP sticky header boundary
          // Only apply top exit fade if the user has scrolled down (scrollY > 30)
          // so initial page top is never dimmed.
          if (scrollY > 30 && rect.top < headerOffset + topFadeZone) {
            const visibleHeight = rect.bottom - headerOffset;
            const progress = Math.min(1, Math.max(0, visibleHeight / (topFadeZone + 60)));
            opacity = 0.08 + 0.92 * Math.pow(progress, 1.15);
            translateY = (1 - progress) * -16;
          }
          // 4. Entering or exiting via the BOTTOM viewport boundary
          else if (rect.top > viewportHeight - bottomFadeZone) {
            const distanceIntoView = viewportHeight - rect.top;
            const progress = Math.min(1, Math.max(0, distanceIntoView / bottomFadeZone));
            opacity = 0.08 + 0.92 * Math.pow(progress, 1.15);
            translateY = (1 - progress) * 22;
          }

          const clampedOpacity = Math.max(0.08, Math.min(1, opacity));
          card.style.setProperty('opacity', clampedOpacity.toFixed(3), 'important');
          card.style.setProperty('transform', `translateY(${translateY.toFixed(1)}px)`, 'important');
          card.style.setProperty('pointer-events', clampedOpacity > 0.4 ? 'auto' : 'none');
        });

        animationFrameId = null;
      });
    };

    // Run immediately and after a short render delay
    handleScroll();
    const initTimer1 = setTimeout(handleScroll, 60);
    const initTimer2 = setTimeout(handleScroll, 250);

    // Listen to window scroll & resize events
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Periodic sweep to sync with live feed updates and tab switches
    const interval = setInterval(handleScroll, 350);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      clearTimeout(initTimer1);
      clearTimeout(initTimer2);
      clearInterval(interval);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [activeView]);
}
