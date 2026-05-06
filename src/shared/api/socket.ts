import { QueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../../app/(auth)/store/authStore";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";

class SocketService {
  private socket: Socket | null = null;
  private currentChildRoom: string | null = null;
  private queryClient: QueryClient | null = null;

  setQueryClient(client: QueryClient) {
    this.queryClient = client;
  }

  connect() {
    if (this.socket?.connected) return;

    const token = useAuthStore.getState().token;
    if (!token) return;

    // Use URL parser if BASE_URL includes /api
    const url = new URL(BASE_URL);
    const origin = url.origin;

    this.socket = io(origin, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
      // Rejoin room if we reconnected
      if (this.currentChildRoom) {
        this.joinChildRoom(this.currentChildRoom);
      }
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("chat:newMessage", (message: any) => {
      console.log("New message received:", message);
      // Invalidate queries to refetch messages immediately
      if (this.queryClient) {
        this.queryClient.invalidateQueries({
          queryKey: ["chat-messages", message.childId],
        });
        this.queryClient.invalidateQueries({
          queryKey: ["chat-conversations", message.childId],
        });
        this.queryClient.invalidateQueries({
          queryKey: ["chat-conversations"],
        });
      }
    });

    this.socket.on("chat:error", (error: any) => {
      console.log("Socket chat error:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      if (this.currentChildRoom) {
        this.leaveChildRoom(this.currentChildRoom);
      }
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChildRoom(childId: string) {
    if (!this.socket) this.connect();
    if (this.currentChildRoom === childId) return;

    if (this.currentChildRoom) {
      this.leaveChildRoom(this.currentChildRoom);
    }

    this.currentChildRoom = childId;
    this.socket?.emit("chat:joinChild", { childId });
    console.log("Joined child room:", childId);
  }

  leaveChildRoom(childId: string) {
    this.socket?.emit("chat:leaveChild", { childId });
    console.log("Left child room:", childId);
    if (this.currentChildRoom === childId) {
      this.currentChildRoom = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
