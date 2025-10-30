// In public/app.js

// This is your VAPID public key from server.js
const VAPID_PUBLIC_KEY = "BLHnva4GDqBqCDdkiNcZUajoqr6YSTLlvPXPenw9DYeb7plO22I5iwrn40JFp26eMf_oNmI9TI26Bx4-dka--9E";

// This helper function converts the VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Main function to run everything
async function runPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push messaging is not supported by this browser.");
    return;
  }

  try {
    console.log("Registering service worker...");
    const swReg = await navigator.serviceWorker.register("/service-worker.js");
    console.log("Service Worker registered.", swReg);

    // --- Create the "Enable Notifications" button ---
    const permissionButton = document.createElement("button");
    permissionButton.id = "notify-button";
    permissionButton.textContent = "Enable Notifications";
    document.body.prepend(permissionButton); // Add to top of page

    // --- Add click listener to the "Enable" button ---
    permissionButton.addEventListener("click", async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.warn("Notification permission denied.");
          return;
        }
        
        console.log("Notification permission granted.");
        
        // --- Subscribe User ---
        console.log("Subscribing user...");
        const subscription = await swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        console.log("User is subscribed:", subscription);

        // --- Send Subscription to Server ---
        await fetch("/api/subscribe", {
          method: "POST",
          body: JSON.stringify(subscription),
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Subscription sent to server.");

        // Hide the "Enable" button
        permissionButton.style.display = "none";

        // --- Create the "Send Test Push" button ---
        const testButton = document.createElement("button");
        testButton.id = "test-push-button";
        testButton.textContent = "Send Me a Test Notification";
        document.body.prepend(testButton); // Add to top of page

        // Add click listener to the "Test Push" button
        testButton.addEventListener("click", async () => {
          console.log("Sending test push...");
          try {
            const response = await fetch("/api/send-push"); 
            const data = await response.json();
            console.log("Test push sent:", data.message);
          } catch (err) {
            console.error("Error sending test push:", err);
          }
        });
        // --- End of new test button block ---

      } catch (error) {
        console.error("Error during subscription or permission: ", error);
      }
    });

  } catch (error) {
    console.error("Service Worker registration failed: ", error);
  }
}

// Run the main function
runPushNotifications();