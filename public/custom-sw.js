self.addEventListener('push', function(event) {
    const data = event.data.json();
    const { title, body, icon, url } = data;
  
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon,
        data: { url }
      })
    );
  });
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  });
  