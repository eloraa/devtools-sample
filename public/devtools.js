const isIFramePreview = window.top !== window.self;
if (isIFramePreview) {
  (function () {
    var script = document.createElement('script');
    script.src = 'https://devtools-cdn-static.vercel.app/lib/assets/protocol.js';

    script.onload = () => {
      // if (window.__originalMethods) {
      //   console.log = __originalMethods.log;
      //   console.error = __originalMethods.error;
      //   console.warn = __originalMethods.warn;
      //   console.info = __originalMethods.info;
      //   console.debug = __originalMethods.debug;
      //   console.trace = __originalMethods.trace;
      //   window.onerror = __originalMethods.onerror;
      //   window.onunhandledrejection = __originalMethods.onunhandledrejection;
      // }
      const devtoolProtocol = window.chobitsu;
      if (devtoolProtocol) {
        window.addEventListener('message', event => {
          const { type, data } = event.data;
          if (type === 'FROM_DEVTOOLS' && data && typeof data === 'string') {
            devtoolProtocol.sendRawMessage(data);
          }
        });

        devtoolProtocol.setOnMessage(data => {
          if (data.includes('"id":"tmp')) {
            return;
          }

          window.parent.postMessage({ type: 'TO_DEVTOOLS', data }, '*');
        });

        devtoolProtocol.sendRawMessage(`{"id":5,"method":"Runtime.enable","params":{}}`);
      }
    };

    (document.head || document.documentElement).prepend(script);
  })();
}

document.currentScript.remove();
