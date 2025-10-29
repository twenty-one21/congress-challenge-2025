// In public/service-worker.js

self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push Received.");

  try {
    const data = event.data.json();

    const title = data.title || "New Notification";
    const options = {
      body: data.body || "Something new happened!",
      // icon: data.icon || "/images/icon-192x192.png", // Temporarily disabled for testing
      // badge: data.badge || "/images/badge-72x72.png", // Temporarily disabled for testing
      data: {
        url: (data.data && data.data.url) ? data.data.url : "/"
      }
    };

    console.log("Showing notification with options:", options);
    event.waitUntil(self.registration.showNotification(title, options));

  } catch (e) {
    console.warn("Push data was not JSON.", e);
    const title = "Test Notification";
    const options = {
      body: event.data.text()
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener("notificationclick", (event) => { 
  console.log("[Service Worker] Notification click Received.");
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || "/")
  );
});