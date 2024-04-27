import { Socket } from "socket.io";
import { RoomManager } from "./roomManager";

export interface User {
    socket: Socket;
    name: string;
}

export class UserManager {
    private users: User[];
    private queue: string[];
    private roomManager: RoomManager;
    
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager();
    }

    addUser(name: string, socket: Socket) {
        this.users.push({ name, socket });
        this.queue.push(socket.id);
        socket.emit("lobby");
        this.clearQueue();
        this.initHandlers(socket);
    }

    removeUser(socketId: string) {
        const index = this.users.findIndex(x => x.socket.id === socketId);
        if (index !== -1) {
            this.users.splice(index, 1);
        }
        
        const queueIndex = this.queue.indexOf(socketId);
        if (queueIndex !== -1) {
            this.queue.splice(queueIndex, 1);
        }
    }

    clearQueue() {
        while (this.queue.length >= 2) {
            const id1 = this.queue.pop();
            const id2 = this.queue.pop();
            const user1 = this.users.find(x => x.socket.id === id1);
            const user2 = this.users.find(x => x.socket.id === id2);

            if (user1 && user2) {
                const room = this.roomManager.createRoom(user1, user2);
            }
        }
    }

    initHandlers(socket: Socket) {
        const offerHandler = ({ sdp, roomId }: { sdp: string, roomId: string }) => {
            this.roomManager.onOffer(roomId, sdp, socket.id);
        };

        const answerHandler = ({ sdp, roomId }: { sdp: string, roomId: string }) => {
            this.roomManager.onAnswer(roomId, sdp, socket.id);
        };

        const iceCandidateHandler = ({ candidate, roomId, type }: { candidate: any, roomId: string, type: "sender" | "receiver" }) => {
            this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
        };
        

        socket.on("offer", offerHandler);
        socket.on("answer", answerHandler);
        socket.on("add-ice-candidate", iceCandidateHandler);
    }
}
