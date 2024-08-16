import { IServerMessage } from "../interfaces";

type WebSocketServiceCallback = (message: IServerMessage) => void;

interface WebSocketService {
  connect: (param: string, onMessage: WebSocketServiceCallback) => void;
  send: (payload: object) => void;
  disconnect: () => void;
}

export const createWebSocketService = (
  onOpen: (identifier:string) => void,
  onClose: () => void
): WebSocketService => {
  let socket: WebSocket | null = null;
  let onMessageCallback: WebSocketServiceCallback = () => {};

  const connect = (param: string, onMessage: WebSocketServiceCallback) => {
    const generateRandomString = (length: number) => {
      let text = "";
      const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };
    const sessionId = generateRandomString(5);

    const url = `ws://localhost:8080/connect?name=${param}_${sessionId}`;
    console.log("Attempting to connect to WebSocket at", url);
    socket = new WebSocket(url);
    onMessageCallback = onMessage;

    socket.onopen = () => {
      console.log("WebSocket connection established");
      onOpen(`_${sessionId}`);
    };

    socket.onmessage = (event: MessageEvent) => {
      console.log(`Message from server: ${event.data}`);
      onMessageCallback(JSON.parse(event.data));
    };

    socket.onerror = (error: Event) => {
      console.error("WebSocket error:", error);
      onClose();
    };

    socket.onclose = (event: CloseEvent) => {
      console.log("Disconnected. Please try again.", event);
      onClose();
    };
  };

  const send = (payload: object) => {
    try {
      if (socket && socket.readyState === WebSocket.OPEN) {
        let randomBytes: (size: number) => string;

        if (typeof window === "undefined") {
          const crypto = require("crypto") as typeof import("crypto");
          randomBytes = (size: number) =>
            crypto.randomBytes(size).toString("base64");
        } else {
          if (window.crypto && window.crypto.getRandomValues) {
            randomBytes = (size: number) => {
              const buffer = new Uint8Array(size);
              window.crypto.getRandomValues(buffer);
              return btoa(String.fromCharCode(...buffer));
            };
          } else {
            throw new Error(
              "Error in send"
            );
          }
        }

        const base64String = randomBytes(16);

        socket.send(JSON.stringify({ ...payload, nonce: base64String }));
      } else {
        throw new Error("WebSocket is not open. Cannot send message.");
      }
    } catch (error) {
      console.error("Send message error:", error);
      onClose();
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.close();
    }
  };

  return { connect, send, disconnect };
};
