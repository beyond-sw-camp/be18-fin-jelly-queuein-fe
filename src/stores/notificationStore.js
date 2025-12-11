// src/stores/notificationStore.js
import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    items: [],
    unread: 0,
  }),

  actions: {
    add(notification) {
      this.items.unshift(notification);
      this.unread++;
    },
    markAllRead() {
      this.unread = 0;
    }
  }
});
