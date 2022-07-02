// IMPORTANT NOTE:
//     To make it work, we need to add the following line first to the HTML file:
//          <script type="text/javascript" src="third_party/js/sentry-x.y.z.min.js"></script>
//     So it do NOT work for the service_worker.mjs file.  Currently it works only for the
//     popup.html and options.html pages.

const PRODUCTION_SAMPLE_RATE = 0.01;

function isProductionExtension() {
  return chrome.runtime.id === 'pdnfnkhpgegpcingjbfihlkjeighnddk';
}

Sentry.init({
  dsn: 'https://16d8948a57c442beaeaa7083a40dd8cf@o1818.ingest.sentry.io/6544429',
  sampleRate: isProductionExtension() ? PRODUCTION_SAMPLE_RATE : 1.0,
  release: chrome.runtime.getManifest().version,
});
