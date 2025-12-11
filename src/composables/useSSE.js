// src/composables/useSSE.js
import { ElNotification } from "element-plus";
import { useNotificationStore } from "@/stores/notificationStore";
import { startSSE } from "@/utils/sseClient";

export function useSSE(accessToken) {
  const store = useNotificationStore();

  startSSE(accessToken, {
    onConnect: () => {
      console.log("🔗 SSE 연결 성공");
    },

    onNotification: (notification) => {
      // 1) Pinia 스토어에 저장
      store.add(notification);

      // 2) 토스트 띄우기
      ElNotification({
        title: "알림",
        message: notification.message,
        type: "success",
        duration: 5000
      });
    }
  });
}
