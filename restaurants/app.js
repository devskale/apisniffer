// ===== DATA =====
const D = window.RESTAURANT_DATA;

// ===== HELPERS =====
function pr(r) { return parseFloat(r.replace(',', '.')) }
function pv(r) { return parseInt(r.replace('.', ''), 10) }
function rc(r) { const v = pr(r); return v >= 4.6 ? 'rh' : v >= 4.2 ? 'rm' : 'rl' }
function ec(v) { return v.replace(/</g, '&lt;').replace(/>/g, '&gt;') }

// ===== STATE =====
let sc = 'rating', sd = -1, fl = '', curTab = 'table';
let map, markersLayer, mapInit = false;

// ===== INIT =====
function init() {
  // Populate type filter
  const types = [...new Set(D.filter(d => d.type).map(d => d.type))].sort();
  types.forEach(t => {
    const o = document.createElement('option');
    o.value = t;
    o.textContent = t;
    document.getElementById('ft').appendChild(o);
  });

  // Sort headers
  document.querySelectorAll('th[data-c]').forEach(th => {
    th.addEventListener('click', () => {
      const c = th.dataset.c;
      if (!c) return;
      if (sc === c) { sd *= -1 } else { sc = c; sd = (c === 'rating' || c === 'reviews') ? -1 : 1 }
      document.querySelectorAll('th').forEach(t => t.classList.remove('srt'));
      th.classList.add('srt');
      render();
    });
  });
  document.querySelector('th[data-c="rating"]').classList.add('srt');

  // Search
  document.getElementById('q').addEventListener('input', e => { fl = e.target.value; render() });

  render();
}

// ===== RENDER TABLE =====
function render() {
  const q = fl.toLowerCase();
  const ft = document.getElementById('ft').value;
  const fb = document.getElementById('fb').value;

  let rows = D.filter(d => {
    if (q && !d.name.toLowerCase().includes(q) && !d.plz.includes(q) &&
        !(d.cuisine || '').toLowerCase().includes(q) && !d.stadt.toLowerCase().includes(q)) return false;
    if (ft && d.type !== ft) return false;
    if (fb === '1' && !d.hasBreakfast) return false;
    if (fb === '0' && d.hasBreakfast) return false;
    return true;
  });

  // Sort
  if (sc) {
    rows.sort((a, b) => {
      let va, vb;
      if (sc === 'rating') { va = pr(a.rating); vb = pr(b.rating) }
      else if (sc === 'reviews') { va = pv(a.reviews); vb = pv(b.reviews) }
      else if (sc === 'nr') { va = a.nr; vb = b.nr }
      else { va = (a[sc] || '').toLowerCase(); vb = (b[sc] || '').toLowerCase() }
      if (va < vb) return sd;
      if (va > vb) return -sd;
      return 0;
    });
  }

  // Table body
  document.getElementById('tb').innerHTML = rows.map(d => {
    const typ = d.type ? ('<span class="typ">' + ec(d.type) + '</span>') : '';
    const kue = d.cuisine ? ('<span class="kue" title="' + ec(d.cuisine) + '">' + ec(d.cuisine) + '</span>') : '';
    const br = d.hasBreakfast ? '<span class="br">🍳</span>' : '';
    const gl = d.gmapsUrl ? '<a href="' + d.gmapsUrl + '" target="_blank">GMaps</a>' : '';
    const gu = d.gutscheinUrl ? '<a href="' + d.gutscheinUrl + '" target="_blank">💵</a>' : '';
    const wb = d.website ? '<a href="' + d.website + '" target="_blank">🌐</a>' : '';
    return '<tr>' +
      '<td class="nr">' + d.nr + '</td>' +
      '<td class="nm">' + ec(d.name) + br + '</td>' +
      '<td>' + typ + '</td>' +
      '<td>' + kue + '</td>' +
      '<td class="loc">' + (d.plz ? d.plz + ' ' + d.stadt : d.stadt) + '</td>' +
      '<td class="rt ' + rc(d.rating) + '"><span class="st">★</span>' + d.rating + '</td>' +
      '<td class="rv">(' + d.reviews + ')</td>' +
      '<td>' + gl + ' ' + gu + ' ' + wb + '</td></tr>';
  }).join('');

  // Stats
  const rt = D.map(d => pr(d.rating));
  document.getElementById('sa').textContent = (rt.reduce((a, b) => a + b, 0) / rt.length).toFixed(2);
  document.getElementById('sr').textContent = D.reduce((s, d) => s + pv(d.reviews), 0).toLocaleString('de-DE');
  document.getElementById('sb').textContent = Math.max(...rt).toFixed(1) + '★';
  document.getElementById('sbr').textContent = D.filter(d => d.hasBreakfast).length;

  // Update map
  if (window.updateMapMarkers) updateMapMarkers(rows);
}

// ===== TABS =====
function switchTab(t) {
  curTab = t;
  document.querySelectorAll('.tab').forEach((x, i) =>
    x.classList.toggle('active', (t === 'table' && i === 0) || (t === 'map' && i === 1)));
  document.querySelectorAll('.panel').forEach((p, i) =>
    p.classList.toggle('active', (t === 'table' && i === 0) || (t === 'map' && i === 1)));

  if (t === 'map') {
    if (!mapInit) { initMap(); mapInit = true }
    setTimeout(() => map && map.invalidateSize?.(), 300);
  }
}
window.switchTab = switchTab;

// ===== LEAFLET MAP =====
function initMap() {
  map = L.map('map').setView([48.2082, 16.3738], 12);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);
  markersLayer = L.featureGroup().addTo(map);

  window.updateMapMarkers = function (rows) {
    markersLayer.clearLayers();

    const plzCoords = {
      '1010': [48.2082, 16.3738], '1020': [48.2180, 16.4040], '1030': [48.1950, 16.3960],
      '1050': [48.1860, 16.3530], '1060': [48.1960, 16.3370], '1070': [48.1990, 16.3450],
      '1080': [48.2100, 16.3400], '1090': [48.2150, 16.3400], '1100': [48.1600, 16.3800],
      '1130': [48.1780, 16.2700], '1160': [48.1880, 16.2800], '1170': [48.2300, 16.3300],
      '1180': [48.2250, 16.2300], '1190': [48.2400, 16.2500], '1200': [48.1800, 16.4200],
      '2500': [48.0050, 16.2500]
    };

    rows.forEach((d, i) => {
      // Use real geocoded coordinates, fallback to PLZ center
      if (!d.lat || !d.lng) return;
      let latlon = [d.lat, d.lng];
      const v = pr(d.rating);
      const color = v >= 4.6 ? '#34d399' : v >= 4.2 ? '#fbbf24' : '#f87171';

      const icon = L.divIcon({
        className: '',
        html: '<div style="background:' + color + ';width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);' +
          (d.hasBreakfast ? 'box-shadow:0 0 0 3px #a78bfa,0 2px 6px rgba(0,0,0,.4);' : '') + '"></div>',
        iconSize: [14, 14], iconAnchor: [7, 7]
      });

      const popup = '<div class="map-popup"><h3>' + ec(d.name) + (d.hasBreakfast ? ' 🍳' : '') + '</h3>' +
        '<div class="mp-rating ' + rc(d.rating) + '">★ ' + d.rating + ' (' + d.reviews + ')</div>' +
        '<div style="font-size:.72rem;color:#94a3b8;margin-top:4px">' + ec(d.type || '') +
        (d.cuisine ? ' · ' + ec(d.cuisine.substring(0, 40)) : '') + '</div>' +
        (d.gmapsUrl ? '<a class="mp-link" href="' + d.gmapsUrl + '" target="_blank">Google Maps →</a>' : '') +
        (d.gutscheinUrl ? '<a class="mp-link" href="' + d.gutscheinUrl + '" target="_blank">Gutschein →</a>' : '') +
        '</div>';

      L.marker(latlon, { icon }).bindPopup(popup).addTo(markersLayer);
    });

    if (rows.length > 0) {
      const bounds = markersLayer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });
    }
  };

  updateMapMarkers(D);
}

// ===== GO =====
document.addEventListener('DOMContentLoaded', init);
