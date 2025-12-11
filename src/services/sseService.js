let eventSource = null;

export function connectSSE(onMessage) {
  const token = localStorage.getItem("accessToken");
  const url = `http://localhost:8080/api/v1/sse/subscribe?accessToken=${token}`;

  if (eventSource) eventSource.close();

  eventSource = new EventSource(url);

  eventSource.addEventListener("CONNECT", (event) => {
    console.log("🟢 SSE CONNECT EVENT:", event.data);
  });

  eventSource.addEventListener("NOTIFICATION", (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("🔔 SSE NOTIFICATION EVENT:", data);
      onMessage(data);
    } catch (e) {
      console.error("📛 NOTIFICATION parse error:", e);
    }
  });

  eventSource.onerror = (err) => {
    console.error("🔴 SSE ERROR:", err);
  };

  return eventSource;
}

export function disconnectSSE() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
}
