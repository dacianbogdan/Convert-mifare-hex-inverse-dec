import { convertUID } from './converter.js';

const $ = id => document.getElementById(id);
let current = null;
let installPrompt = null;
let offlineReady = false;

function clearResult() {
  current = null;
  $('decimal').textContent = '—';
  $('byte-order').textContent = 'Rezultatul apare aici după conversie.';
  $('result-state').textContent = 'Rezultatul tău';
  $('copy').disabled = true;
  $('copy-status').textContent = '';
}
function convert() {
  clearResult();
  try {
    current = convertUID($('uid').value);
    $('input-error').hidden = true;
    $('uid').removeAttribute('aria-invalid');
    $('decimal').textContent = current.decimal;
    $('byte-order').textContent = `${current.hex} → ${current.reversed} → DEC`;
    $('result-state').textContent = 'Conversie reușită';
    $('copy').disabled = false;
  } catch (error) {
    $('input-error').textContent = error.message;
    $('input-error').hidden = false;
    $('uid').setAttribute('aria-invalid', 'true');
    $('uid').focus();
  }
}
$('converter-form').addEventListener('submit', event => { event.preventDefault(); convert(); });
$('example').addEventListener('click', () => { $('uid').value = '5D:B0:F6:D2'; convert(); });
$('uid').addEventListener('input', () => {
  clearResult();
  $('input-error').hidden = true;
  $('uid').removeAttribute('aria-invalid');
});
$('copy').addEventListener('click', async () => {
  if (!current) return;
  const decimal = current.decimal;
  try {
    await navigator.clipboard.writeText(decimal);
    if (current?.decimal === decimal) $('copy-status').textContent = 'Numărul a fost copiat.';
  } catch {
    if (current?.decimal !== decimal) return;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents($('decimal'));
    selection.removeAllRanges();
    selection.addRange(range);
    $('copy-status').textContent = 'Copierea automată nu este disponibilă. Ține apăsat pe numărul selectat și alege „Copiază”.';
  }
});
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; });
$('install').addEventListener('click', async () => {
  if (installPrompt) {
    const prompt = installPrompt;
    installPrompt = null;
    await prompt.prompt();
    await prompt.userChoice;
  } else {
    $('install-help').open = true;
    $('install-help').scrollIntoView({ behavior: 'auto', block: 'nearest' });
  }
});
function markInstalled() { $('install').hidden = true; }
window.addEventListener('appinstalled', markInstalled);
if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) markInstalled();
function showOfflineState() {
  $('offline-status').textContent = offlineReady
    ? (navigator.onLine ? 'Pregătită pentru utilizare offline.' : 'Fără conexiune · conversia funcționează offline.')
    : 'Offline indisponibil. Deschide aplicația prin HTTPS și reîncarcă având internet.';
}
window.addEventListener('online', showOfflineState);
window.addEventListener('offline', showOfflineState);
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('./sw.js').then(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    }
    offlineReady = true;
    showOfflineState();
  }).catch(showOfflineState);
} else showOfflineState();
