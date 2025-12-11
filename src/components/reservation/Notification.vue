import { ElNotification } from 'element-plus';

eventSource.addEventListener("NOTIFICATION", (event) => {
  const data = JSON.parse(event.data);

  ElNotification({
    title: "알림",
    message: data.message,
    type: "success",
  });
});
