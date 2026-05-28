import Pusher from "pusher-js"; // 1
window.Pusher = Pusher;
import Echo from "laravel-echo";

let echoInstance = null;
let currentToken = null;

function createEcho(token) {
  return new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: "localhost",
    wsPort: 8080,
    forceTLS: false,
    encrypted: false,
    authEndpoint: `${import.meta.env.VITE_API_BASE_URL}/v1/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export function initEcho(token) {
  // 🔥 prevent duplicate instance with same token
  if (echoInstance && currentToken === token) {
    return echoInstance;
  }

  // 🔥 if token changed → recreate
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }

  currentToken = token;
  echoInstance = createEcho(token);

  return echoInstance;
}

export function getEcho() {
  return echoInstance;
}

export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    currentToken = null;
  }
}
