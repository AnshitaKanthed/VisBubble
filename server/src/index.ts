import { Socket } from 'socket.io';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { UserManager } from './manager/userManager';

const app = express();
const server = http.createServer(http);

const io = new Server(server, {
    cors: {
        origin: "*", // allowing all origins
    }
});

const userManager = new UserManager()

io.on('connection', (socket: Socket) => {
    console.log('a user connected');
    userManager.addUser("someone", socket);
    socket.on('disconnect', () => {
        userManager.removeUser(socket.id);
    })
});

server.listen(3000, () => {
    console.log('listening on localhost:3000');
})
