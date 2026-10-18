import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type { Lang } from '../i18n/types';
import { boundsOf, labelField, toLngLat, type MapPin } from '../lib/map-helpers';
import { reducedMotion } from './motion';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
const INTERACTIONS = ['pointermove', 'pointerdown', 'wheel', 'scroll', 'keydown', 'touchstart'] as const;

// MapLibre blocks the main thread for about a second on phones, so the map waits until the visitor does something.
function firstInteraction(): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      for (const type of INTERACTIONS) window.removeEventListener(type, done, true);
      resolve();
    };
    for (const type of INTERACTIONS) window.addEventListener(type, done, { capture: true, passive: true });
  });
}

export function initPlaceMaps(): void {
  const interacted = firstInteraction();
  document.querySelectorAll<HTMLElement>('[data-place-map]').forEach((el) => {
    if (el.dataset.mapReady) return;
    el.dataset.mapReady = 'pending';
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      interacted
        .then(() => createMap(el))
        .catch(() => {
          el.dataset.mapReady = 'failed';
        });
    }, { rootMargin: '300px' });
    observer.observe(el);
  });
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

async function createMap(el: HTMLElement): Promise<void> {
  if (!supportsWebGL()) {
    el.dataset.mapReady = 'failed';
    return;
  }
  const pins = JSON.parse(el.dataset.pins ?? '[]') as MapPin[];
  const lang = (el.dataset.lang ?? 'en') as Lang;
  const { Map: MapLibreMap, Marker, NavigationControl, setWorkerUrl } = await import('maplibre-gl');
  setWorkerUrl(workerUrl);

  const smooth = !reducedMotion();
  const map = new MapLibreMap({
    container: el,
    style: STYLE_URL,
    center: [100.53, 13.73],
    zoom: 11,
    attributionControl: { compact: true },
    fadeDuration: smooth ? 300 : 0,
  });
  map.scrollZoom.disable();
  map.addControl(new NavigationControl({ showCompass: false }), 'top-left');
  map.on('error', () => {
    // Missing tiles or styles: the tips stay readable, nothing else to do.
  });

  const markers = new Map<string, { marker: InstanceType<typeof Marker>; button: HTMLButtonElement }>();
  for (const pin of pins) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tv-pin';
    button.setAttribute('aria-label', `${pin.label}: ${pin.title}`);
    const label = document.createElement('span');
    label.textContent = pin.label;
    button.append(label);
    button.addEventListener('click', () => {
      document.getElementById(pin.anchor)?.scrollIntoView({ block: 'center', behavior: smooth ? 'smooth' : 'auto' });
    });
    markers.set(pin.id, { marker: new Marker({ element: button }).setLngLat(toLngLat(pin.coords)).addTo(map), button });
  }

  let visible = new Set(pins.map((pin) => pin.id));
  const fit = (animate: boolean) => {
    const bounds = boundsOf(pins.filter((pin) => visible.has(pin.id)).map((pin) => toLngLat(pin.coords)));
    if (!bounds) return;
    map.fitBounds(bounds, { padding: window.innerWidth < 600 ? 36 : 70, maxZoom: 13.5, duration: animate && smooth ? 700 : 0 });
  };

  map.on('load', () => {
    for (const layer of map.getStyle().layers) {
      if (layer.type === 'symbol' && layer.layout && 'text-field' in layer.layout) {
        map.setLayoutProperty(layer.id, 'text-field', labelField(lang));
      }
    }
    map.resize();
    fit(false);
  });
  fit(false);

  document.addEventListener('tv:filter', (event) => {
    const key = (event as CustomEvent<{ key: string }>).detail.key;
    visible = new Set(pins.filter((pin) => key === 'all' || pin.category === key).map((pin) => pin.id));
    for (const [id, { marker }] of markers) {
      if (visible.has(id)) marker.addTo(map);
      else marker.remove();
    }
    fit(true);
  });
  document.addEventListener('tv:active', (event) => {
    const id = (event as CustomEvent<{ id: string | null }>).detail.id;
    for (const [pinId, { button }] of markers) button.classList.toggle('is-active', pinId === id);
  });

  el.dataset.mapReady = 'true';
}
