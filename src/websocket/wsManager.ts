import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_URL } from '@/config/env';

class WebSocketManager {
  private client: Client | null = null;
  private onConnectCallbacks: Set<() => void> = new Set();

  getClient() {
    if (!this.client) {
      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        reconnectDelay: 3000,
        onConnect: () => {
          this.onConnectCallbacks.forEach((cb) => cb());
        },
      });
    }
    return this.client;
  }

  activate(onConnect?: () => void) {
    if (onConnect) this.onConnectCallbacks.add(onConnect);
    
    const client = this.getClient();
    if (!client.active) {
      client.activate();
    } else if (client.connected && onConnect) {
      onConnect();
    }

    return () => {
      if (onConnect) this.onConnectCallbacks.delete(onConnect);
    };
  }

  deactivate() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.onConnectCallbacks.clear();
    }
  }
}

export const wsManager = new WebSocketManager();
