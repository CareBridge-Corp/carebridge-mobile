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
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
      // Rejoin room if we reconnected
      if (this.currentChildRoom) {
        this.joinChildRoom(this.currentChildRoom);
      }
    });

    this.socket.on("chat:newMessage", (message: any) => {
      // Invalidate queries to refetch messages
      if (this.queryClient) {
        this.queryClient.invalidateQueries({
          queryKey: ["chat-messages", message.childId],
        });
        this.queryClient.invalidateQueries({
          queryKey: ["chat-conversations"],
        });
      }
    });

    this.socket.on("chat:error", () => {
      // Socket chat error occurred
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
  }

  leaveChildRoom(childId: string) {
    this.socket?.emit("chat:leaveChild", { childId });
    if (this.currentChildRoom === childId) {
      this.currentChildRoom = null;
    }
  }
}

export const socketService = new SocketService();
