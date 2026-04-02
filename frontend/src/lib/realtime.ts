import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export function subscribeToNotifications(email: string, onMessage: (payload: unknown) => void) {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_ROOT ?? "http://localhost:8080/api"}/ws`) as WebSocket,
    reconnectDelay: 5000
  });

  client.onConnect = () => {
    client.subscribe(`/topic/notifications/${email}`, (message) => onMessage(JSON.parse(message.body)));
  };

  client.activate();
  return () => client.deactivate();
}
