// src/utils/sseClient.js
let eventSource = null;

export function startSSE(accessToken, handlers) {
  const url = `http://localhost:8080/api/v1/sse/subscribe?accessToken=${accessToken}`;

  if (eventSource) eventSource.close();
  eventSource = new EventSource(url);

  // CONNECT 이벤트
  eventSource.addEventListener("CONNECT", (e) => {
    handlers.onConnect?.(e.data);
  });

  // NOTIFICATION 이벤트
  eventSource.addEventListener("NOTIFICATION", (e) => {
    handlers.onNotification?.(JSON.parse(e.data));
  });

  eventSource.onerror = (error) => {
    handlers.onError?.(error);
  };

  return eventSource;
}

export function stopSSE() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
}
