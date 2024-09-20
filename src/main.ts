import './style.css';

const isIFrame = window.top !== window.self;

if (!isIFrame) {
  window.location.href = 'https://devtools.aruu.me';
}

console.log('I am in an iframe');

const COLORS = ['186 100% 33%', '230 48% 48%', '2 50% 45%', '123 41% 45%'];
const PATH = ['M 0 100 V 100 Q 50 100 100 100 V 100 z', 'M 0 100 V 50 Q 50 0 100 50 V 100 z', 'M 0 100 V 0 Q 50 0 100 0 V 100 z'];
const DURATIONS = [500, 300, 500];
const overlay = document.querySelector('.overlay__path') as SVGPathElement;

const script = document.querySelector('.code input') as HTMLInputElement;
const copyButton = document.querySelector('.code button') as HTMLButtonElement;
const colors = document.querySelector('.colors');
let timeout: number;
let isAnimating = false;
const cookies = document.cookie.split(';');
const colorCookie = cookies.find(cookie => cookie.trim().startsWith('__color='));
const color = colorCookie ? colorCookie.split('=')[1].trim() : null;
const hueRotateCookie = cookies.find(cookie => cookie.trim().startsWith('__hueRotate='));
const hueRotate = hueRotateCookie ? hueRotateCookie.split('=')[1].trim() : null;

const image = document.querySelector('main figure img') as HTMLImageElement;
const original = image.src;

const openConsole = document.querySelector('.open-console') as HTMLButtonElement;
const openProxy = document.querySelector('.open-proxy') as HTMLButtonElement;
const openDocs = document.querySelector('.open-docs') as HTMLButtonElement;
const tests = document.querySelector('.tests') as HTMLDivElement;

[openConsole, openProxy, openDocs].forEach(button => {
  button.addEventListener('click', () => {
    window.parent.postMessage({ type: button.classList.value.replace('.', '') }, '*');
  });
});

window.addEventListener('DOMContentLoaded', () => {
  if (color) {
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--hueRotate', `${hueRotate}deg`);
  }

  const log = document.querySelector('.log') as HTMLButtonElement;
  const error = document.querySelector('.error') as HTMLButtonElement;
  const warn = document.querySelector('.warn') as HTMLButtonElement;
  const unhandledError = document.querySelector('.unhandled-error') as HTMLButtonElement;
  const unhandledRejection = document.querySelector('.unhandled-rejection') as HTMLButtonElement;
  const fetch = document.querySelector('.fetch') as HTMLButtonElement;
  const cors = document.querySelector('.cors') as HTMLButtonElement;
  const cookie = document.querySelector('.cookie') as HTMLButtonElement;
  const storage = document.querySelector('.storage') as HTMLButtonElement;

  log.addEventListener('click', () => {
    console.log('test');
  });

  error.addEventListener('click', () => {
    console.error('test');
  });

  warn.addEventListener('click', () => {
    console.warn('test');
  });

  unhandledError.addEventListener('click', () => {
    throw new Error('test');
  });
  unhandledRejection.addEventListener('click', () => {
    Promise.reject(new Error('test'));
  });
  fetch.addEventListener('click', () => {
    window
      .fetch('https://httpbin.org/get')
      .then((res: Response) => res.json())
      .then(data => console.log(data));
  });
  cors.addEventListener('click', () => {
    window
      .fetch('https://httpbin.org/status/403')
      .then((res: Response) => res.json())
      .then(data => console.log(data));
  });
  cookie.addEventListener('click', () => {
    document.cookie = 'test=123; SameSite=None; Secure;path=/';
    console.log(document.cookie);
  });
  storage.addEventListener('click', () => {
    localStorage.setItem('test', '123');
    console.log(localStorage.getItem('test'));
    sessionStorage.setItem('test', '123');
    console.log(sessionStorage.getItem('test'));
    const db = window.indexedDB.open('test', 1);
    db.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const objectStore = db.createObjectStore('test', { keyPath: 'id', autoIncrement: true });
      objectStore.createIndex('name', 'name', { unique: false });
    };
    db.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(['test'], 'readwrite');
      const objectStore = transaction.objectStore('test');
      const addRequest = objectStore.add({ name: 'test' });
      addRequest.onsuccess = () => {
        const getAllRequest = objectStore.getAll();
        getAllRequest.onsuccess = (event: Event) => {
          const target = event.target as IDBRequest;
          const result = target.result;
          console.log(result);
        };
      };
    };
  });
});

const hueRotateGen = (color: string) => {
  switch (color) {
    case '186 100% 33%':
      return 0;
    case '230.85 48.36% 47.84%':
      return 60;
    case '2 50% 45%':
      return 190;
    case '123 41% 45%':
      return 270;
  }
};

const createColor = (color: string) => {
  const div = document.createElement('div');
  div.classList.add('color');
  div.style.backgroundColor = `hsl(${color})`;
  div.addEventListener('click', () => {
    if (isAnimating || color === document.documentElement.style.getPropertyValue('--primary')) return;
    console.log('Changing color to', color);
    isAnimating = true;
    animateOverlay(0, 2, { color: `hsl(${color})` }, () => {
      document.documentElement.style.setProperty('--primary', color);
      document.documentElement.style.setProperty('--hueRotate', `${hueRotateGen(color)}deg`);
      window.parent.postMessage({ type: 'color:change', color }, '*');
      document.cookie = `__color=${color}; SameSite=None; Secure;path=/`;
      document.cookie = `__hueRotate=${hueRotateGen(color)}; SameSite=None; Secure;path=/`;
      isAnimating = false;
    });
  });
  return div;
};

COLORS.forEach(color => {
  colors?.appendChild(createColor(color));
});

const copyToClipboard = async () => {
  await navigator.clipboard.writeText(script.value);
  copyButton.classList.add('copied');
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    copyButton.classList.remove('copied');
  }, 2000);
};

if (script) {
  script.addEventListener('click', () => {
    script.select();
    script.setSelectionRange(0, 99999);
    copyToClipboard();
  });
}
if (copyButton) {
  copyButton.addEventListener('click', copyToClipboard);
}

window.addEventListener('message', event => {
  const { type, data } = event.data;

  if (type === 'setting:toggle') {
    if (data) {
      document.body.style.filter = 'blur(2px)';
      image.src = '/1.png';
      image.style.filter = 'hue-rotate(0deg)';
    } else {
      document.body.style.filter = '';
      image.src = original;
      image.style.filter = 'hue-rotate(var(--hueRotate, 0deg))';
    }
  }
  if (type === 'color:change') {
    if (data !== document.documentElement.style.getPropertyValue('--primary') && !isAnimating && typeof data === 'string') {
      isAnimating = true;
      animateOverlay(0, 2, { color: `hsl(${data})` }, () => {
        isAnimating = false;
        console.log('Color changed to', data);
        document.documentElement.style.setProperty('--primary', data);
        document.documentElement.style.setProperty('--hueRotate', `${hueRotateGen(data)}deg`);
        document.cookie = `__color=${data}; SameSite=None; Secure;path=/`;
        document.cookie = `__hueRotate=${hueRotateGen(data)}; SameSite=None; Secure;path=/`;
      });
    }
  }
  if (type === 'devtools:toggle') {
    if (data) {
      tests.classList.add('animate-in');
      tests.style.opacity = '1';
      tests.style.pointerEvents = 'auto';
    } else {
      tests.classList.add('animate-out');
      tests.addEventListener('animationend', () => {
        tests.classList.remove('animate-out');
        tests.style.opacity = '0';
        tests.style.pointerEvents = 'none';
      });
    }
  }
});

const easeInOut = (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

const lerp = (start: string, end: string, t: number): string => {
  const startParts = start.match(/(-?\d+(\.\d+)?)|[A-Z]/g) || [];
  const endParts = end.match(/(-?\d+(\.\d+)?)|[A-Z]/g) || [];
  const result = startParts.map((part, index) => {
    if (isNaN(parseFloat(part))) return part;
    const startVal = parseFloat(part);
    const endVal = parseFloat(endParts[index]);
    return (startVal + (endVal - startVal) * t).toFixed(2);
  });
  return result.join(' ');
};

const animateOverlay = (fromIndex: number, toIndex: number, options?: { color?: string }, callback?: () => void) => {
  const initialPath = overlay.getAttribute('d');
  let startTime: number;
  const totalSteps = (toIndex - fromIndex + PATH.length) % PATH.length;
  const totalDuration = DURATIONS.slice(fromIndex, fromIndex + totalSteps).reduce((sum, duration) => sum + duration, 0);

  if (options?.color) {
    overlay.style.fill = options.color;
  }

  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    if (elapsed >= totalDuration) {
      overlay.setAttribute('d', PATH[toIndex]);
      setTimeout(() => {
        if (initialPath) {
          overlay.setAttribute('d', initialPath);
        }
      }, 200);

      setTimeout(() => {
        if (callback) callback();
      }, 0);
      return;
    }

    let currentDuration = 0;
    let currentIndex = fromIndex;

    for (let i = 0; i < totalSteps; i++) {
      const stepDuration = DURATIONS[(fromIndex + i) % PATH.length];
      if (elapsed < currentDuration + stepDuration) {
        currentIndex = (fromIndex + i) % PATH.length;
        const nextIndex = (currentIndex + 1) % PATH.length;
        const stepProgress = (elapsed - currentDuration) / stepDuration;
        const easedProgress = easeInOut(stepProgress);

        const startPath = PATH[currentIndex];
        const endPath = PATH[nextIndex];
        const currentPath = lerp(startPath, endPath, easedProgress);
        overlay.setAttribute('d', currentPath);
        break;
      }
      currentDuration += stepDuration;
    }

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
};

console.error(new Error('test'));
console.warn(new Error('test'));
console.info('test');
console.debug('test');
console.trace('test');
console.log('test');

Promise.reject(new Error('test'));
(function () {
  throw new Error('test');
})();
