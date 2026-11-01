import { QueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../../app/(auth)/store/authStore";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";

type ConnectionListener = (connected: boolean) => void;

class SocketService {
  private socket: Socket | null = null;
  private currentChildRoom: string | null = null;
  private currentGroupRoom: string | null = null;
  private currentPeerRoom: string | null = null;
  private queryClient: QueryClient | null = null;
  private connectionListeners = new Set<ConnectionListener>();

  setQueryClient(client: QueryClient) {
    this.queryClient = client;
  }

  subscribeConnection(listener: ConnectionListener) {
    this.connectionListeners.add(listener);
    listener(this.isConnected());
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  private notifyConnection(connected: boolean) {
    this.connectionListeners.forEach((listener) => listener(connected));
  }

  private invalidateChatQueries(childId: string, channelType?: string) {
    if (!this.queryClient) return;
    this.queryClient.invalidateQueries({
      queryKey: ["chat-messages", childId],
    });
    if (channelType) {
      this.queryClient.invalidateQueries({
        queryKey: ["chat-messages", childId, channelType],
      });
    }
    this.queryClient.invalidateQueries({
      queryKey: ["chat-conversations", childId],
    });
    this.queryClient.invalidateQueries({
      queryKey: ["chat-conversations"],
    });
  }

  connect() {
    if (this.socket?.connected) return;

    const token = useAuthStore.getState().token;
    if (!token) return;

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
      this.notifyConnection(true);
      if (this.currentChildRoom) {
        this.joinChildRoom(this.currentChildRoom);
      }
      if (this.currentGroupRoom) {
        this.joinCliniciansGroupRoom(this.currentGroupRoom);
      }
      if (this.currentPeerRoom) {
        const [childId, clinicianId] = this.currentPeerRoom.split(":");
        if (childId && clinicianId) {
          this.joinPeerDmRoom(childId, clinicianId);
        }
      }
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.notifyConnection(false);
    });

    this.socket.on("connect_error", (error) => {
      console.log("Socket connect error:", error.message);
      this.notifyConnection(false);
    });

    this.socket.on("chat:newMessage", (message: { childId: string }) => {
      console.log("New message received:", message);
      this.invalidateChatQueries(message.childId, "ASSIGNED_DM");
    });

    this.socket.on(
      "chat:groupNewMessage",
      (message: { childId: string; channelType?: string }) => {
        console.log("New group message received:", message);
        this.invalidateChatQueries(
          message.childId,
          message.channelType || "CLINICIANS_GROUP",
        );
      },
    );

    this.socket.on(
      "chat:peerNewMessage",
      (message: { childId: string; clinicianId?: string }) => {
        console.log("New peer message received:", message);
        this.invalidateChatQueries(message.childId, "PEER_DM");
      },
    );

    this.socket.on("chat:error", (error: unknown) => {
      console.log("Socket chat error:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      if (this.currentChildRoom) {
        this.leaveChildRoom(this.currentChildRoom);
      }
      if (this.currentGroupRoom) {
        this.leaveCliniciansGroupRoom(this.currentGroupRoom);
      }
      if (this.currentPeerRoom) {
        const [childId, clinicianId] = this.currentPeerRoom.split(":");
        if (childId && clinicianId) {
          this.leavePeerDmRoom(childId, clinicianId);
        }
      }
      this.socket.disconnect();
      this.socket = null;
      this.notifyConnection(false);
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

  joinCliniciansGroupRoom(childId: string) {
    if (!this.socket) this.connect();
    if (this.currentGroupRoom === childId) return;

    if (this.currentGroupRoom) {
      this.leaveCliniciansGroupRoom(this.currentGroupRoom);
    }

    this.currentGroupRoom = childId;
    this.socket?.emit("chat:joinCliniciansGroup", { childId });
    console.log("Joined clinicians group room:", childId);
  }

  leaveCliniciansGroupRoom(childId: string) {
    this.socket?.emit("chat:leaveCliniciansGroup", { childId });
    console.log("Left clinicians group room:", childId);
    if (this.currentGroupRoom === childId) {
      this.currentGroupRoom = null;
    }
  }

  joinPeerDmRoom(childId: string, clinicianId: string) {
    if (!this.socket) this.connect();
    const key = `${childId}:${clinicianId}`;
    if (this.currentPeerRoom === key) return;

    if (this.currentPeerRoom) {
      const [prevChildId, prevClinicianId] = this.currentPeerRoom.split(":");
      if (prevChildId && prevClinicianId) {
        this.leavePeerDmRoom(prevChildId, prevClinicianId);
      }
    }

    this.currentPeerRoom = key;
    this.socket?.emit("chat:joinPeerDm", { childId, clinicianId });
    console.log("Joined peer DM room:", key);
  }

  leavePeerDmRoom(childId: string, clinicianId: string) {
    this.socket?.emit("chat:leavePeerDm", { childId, clinicianId });
    console.log("Left peer DM room:", `${childId}:${clinicianId}`);
    if (this.currentPeerRoom === `${childId}:${clinicianId}`) {
      this.currentPeerRoom = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
