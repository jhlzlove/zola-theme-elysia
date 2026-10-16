/* Elysia lightbox — click-to-zoom for article images (ES module, no deps).
 * Vendor: PhotoSwipe 5.4.4 (CDN, ESM). Loaded by base.html only when
 * [extra.features].lightbox_enable is true (default). This file only wires it:
 * - scope: `.article__content img` (covers gallery + image component + markdown)
 * - images already wrapped in an image-link keep it (PhotoSwipe hijacks click;
 *   plain open-in-new-tab remains the no-CDN fallback)
 * - bare images get wrapped in an anchor to their own src (same fallback)
 * - images inside non-image links (e.g. [![alt](img)](https://…)) are skipped
 *   so navigation links keep working
 * - grouping: one PhotoSwipe instance per `.gallery`, the rest of the article
 *   shares one article-level instance; no captions by design
 * - dimensions: local gallery thumbs carry build-time data-pswp-width/height
 *   (original size); anything missing is measured from the loaded thumbnail
 *   at open time (ratio is what matters), 1600x1200 placeholder as last resort
 * If the CDN fails, nothing breaks: links behave as before.
 */
var PSWP_LIGHTBOX = 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe-lightbox.esm.min.js';
var PSWP_CORE = 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.esm.min.js';
var RASTER = /\.(jpg|jpeg|png|webp|avif|gif|bmp)(\?.*)?$/i;

function isImageUrl(u) {
  if (!u) return false;
  u = String(u).trim();
  if (u.charAt(0) === '/' && u.charAt(1) !== '/') return RASTER.test(u);
  return /^https?:\/\//i.test(u) && RASTER.test(u);
}

function num(v) {
  v = parseInt(v, 10);
  return isFinite(v) && v > 0 ? v : 0;
}

/* Fill missing dimensions from the loaded thumbnail (same ratio as the full
   image); PhotoSwipe needs predefined dimensions to fit the slide. */
function fillSize(itemData) {
  if (itemData.width > 0 && itemData.height > 0) return itemData;
  var el = itemData.element;
  var img = el && el.querySelector ? el.querySelector('img') : null;
  if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
    itemData.width = img.naturalWidth;
    itemData.height = img.naturalHeight;
    el.setAttribute('data-pswp-width', String(img.naturalWidth));
    el.setAttribute('data-pswp-height', String(img.naturalHeight));
  } else {
    itemData.width = 1600;
    itemData.height = 1200;
  }
  return itemData;
}

function prepare(box) {
  var counts = { g: 0, a: 0 };
  var imgs = box.querySelectorAll('img');
  for (var i = 0; i < imgs.length; i++) {
    var img = imgs[i];
    var anchor = img.closest ? img.closest('a') : null;
    var href = img.currentSrc || img.src;
    var gal = img.closest ? img.closest('.gallery') : null;
    if (anchor) {
      var ah = anchor.getAttribute('href') || '';
      if (!ah) anchor.setAttribute('href', href);
      else if (ah !== href && !isImageUrl(ah)) continue; /* keep nav links */
      else if (isImageUrl(ah)) href = ah;
    } else {
      anchor = document.createElement('a');
      anchor.setAttribute('href', href);
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener');
      img.parentNode.insertBefore(anchor, img);
      anchor.appendChild(img);
    }
    if (gal) {
      anchor.classList.add('pswp-g');
      if (gal.getAttribute('data-style') === 'grid') anchor.setAttribute('data-cropped', 'true');
      counts.g += 1;
    } else {
      anchor.classList.add('pswp-a');
      counts.a += 1;
    }
  }
  return counts;
}

function create(root, children, PhotoSwipeLightbox) {
  var lb = new PhotoSwipeLightbox({
    gallery: root,
    children: children,
    /* Double-tap/click target: default is min(1, fit*3), which equals the
       initial level for images smaller than the viewport (double-tap no-op).
       Keep the default for large images, allow 2x for small ones. */
    secondaryZoomLevel: function (zoomLevels) {
      var dflt = Math.min(1, zoomLevels.fit * 3);
      return zoomLevels.fit >= 1 ? 2 : dflt;
    },
    pswpModule: function () { return import(PSWP_CORE); }
  });
  lb.addFilter('itemData', fillSize);
  lb.init();
  return lb;
}

function wire(PhotoSwipeLightbox) {
  var boxes = document.querySelectorAll('.article__content');
  for (var b = 0; b < boxes.length; b++) {
    prepare(boxes[b]);
    var gals = boxes[b].querySelectorAll('.gallery');
    for (var g = 0; g < gals.length; g++) {
      if (gals[g].querySelector('a.pswp-g')) create(gals[g], 'a.pswp-g', PhotoSwipeLightbox);
    }
    if (boxes[b].querySelector('a.pswp-a')) create(boxes[b], 'a.pswp-a', PhotoSwipeLightbox);
  }
}

function ready(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

ready(function () {
  import(PSWP_LIGHTBOX).then(function (m) {
    if (m && m.default) wire(m.default);
  }).catch(function () { /* CDN failed: plain links remain */ });
});
