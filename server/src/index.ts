import { Socket } from "socket.io";
import http from "http";
import express from 'express';
import { Server } from 'socket.io';
import { UserManager } from "./manager/userManager";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*" // Allow all origins
    }
});

const userManager = new UserManager();

io.on('connection', (socket: Socket) => {
    userManager.addUser("randomName", socket);
    socket.on("disconnect", () => {
        userManager.removeUser(socket.id);
    });
});

server.listen(3000, () => {
    console.log('Listening on *:3000');
});

server.on('error', (error) => {
    console.error('Server error:', error);
});

io.on('error', (error) => {
    console.error('Socket.IO error:', error);
});
