import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

if ("serviceWorker" in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Falha ao registrar service worker:", error);
      });
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().catch((error) => {
          console.error("Falha ao remover service worker em desenvolvimento:", error);
        });
      });
    });

    if ("caches" in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          if (cacheName.includes("ideciclo")) {
            caches.delete(cacheName).catch((error) => {
              console.error("Falha ao limpar cache em desenvolvimento:", error);
            });
          }
        });
      });
    }
  }
}
