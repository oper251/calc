// PWA регистрация
if ("serviceWorker" in navigator) {
  const version = document.documentElement.dataset.version;
  navigator.serviceWorker
    .register(`/sw.js?v=${version}`)
    .then((registration) => {
      console.log("✅ Service Worker зарегистрирован");

      // Проверка обновлений
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            console.log("🔄 Доступна новая версия!");
            location.reload();
          }
        });
      });
    })
    .catch((error) => console.log("❌ Ошибка Service Worker:", error));
}

// Проверка PWA поддержки
if ("serviceWorker" in navigator && "BeforeInstallPromptEvent" in window) {
  console.log("✅ PWA поддерживается");
}
