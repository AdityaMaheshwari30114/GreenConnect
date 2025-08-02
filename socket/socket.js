const users = {};
const activeNicknames = new Set();
const socketToRoom = {};
const roomIdToUsers = {};  // track users per community

function setupSocket(io) {

    const broadcastGlobalUserList = () => {
        const globalSockets = Array.from(io.sockets.sockets.values()).filter(s => {
            const rooms = Array.from(s.rooms);
            return !rooms.some(r => r !== s.id); // not in any room
        });

        const nicknames = globalSockets.map(s => users[s.id]).filter(Boolean);
        globalSockets.forEach(s => {
            s.emit('users-list', { nicknames, count: nicknames.length });
        });
    };

    io.on('connection', (socket) => {
        console.log("A user Connected:", socket.id);

        socket.on('check-nickname', nickname => {
            nickname = nickname?.trim();

            const validChars = /^[a-zA-Z0-9_]+$/;
            if (!nickname || nickname.length > 15 || !validChars.test(nickname) || nickname.toLowerCase() === "server" || activeNicknames.has(nickname)) {
                socket.emit('nickname-status', { success: false, reason: 'Invalid or taken nickname.' });
                return;
            }

            users[socket.id] = nickname;
            activeNicknames.add(nickname);

            socket.emit('nickname-status', { success: true, nickname });

            // Only emit join message to users NOT in any room
            const globalSockets = Array.from(io.sockets.sockets.values()).filter(s => {
                const rooms = Array.from(s.rooms);
                return !rooms.some(r => r !== s.id);
            });

            globalSockets.forEach(s => {
                if (s.id !== socket.id) {
                    s.emit('message', {
                        nickname: "Server",
                        message: `${nickname} joined the chat`,
                        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    });
                }
            });

            broadcastGlobalUserList();
        });

// Global chat message
socket.on('user-message', message => {
    const nickname = users[socket.id] || 'Anonymous';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Only emit to users NOT in any community room
    const globalSockets = Array.from(io.sockets.sockets.values()).filter(s => {
        const rooms = Array.from(s.rooms);
        return !rooms.some(r => r !== s.id);
    });

    globalSockets.forEach(s => {
        s.emit('message', { nickname, message, time });
    });
});

// Global chat file/image
socket.on('file-upload', ({ fileType, fileName, fileData, time }) => {
    const nickname = users[socket.id] || 'Anonymous';

    const globalSockets = Array.from(io.sockets.sockets.values()).filter(s => {
        const rooms = Array.from(s.rooms);
        return !rooms.some(r => r !== s.id);
    });

    globalSockets.forEach(s => {
        s.emit('file-message', {
            nickname, fileType, fileName, fileData, time
        });
    });
});

        socket.on("join-room", ({ roomId, user }) => {
            socket.join(roomId);
            socket.data.roomId = roomId;
            socket.data.user = user;
            socketToRoom[socket.id] = roomId;

            if (!roomIdToUsers[roomId]) roomIdToUsers[roomId] = new Set();
            roomIdToUsers[roomId].add(user.name);

            socket.to(roomId).emit("message", {
                nickname: "Server",
                message: `${user.name} joined the room`,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            });

            io.to(roomId).emit("users-list", {
                nicknames: Array.from(roomIdToUsers[roomId]),
                count: roomIdToUsers[roomId].size
            });
        });

        socket.on("room-message", ({ message }) => {
            const { roomId, user } = socket.data;
            if (!roomId || !user) return;
            io.to(roomId).emit("message", {
                nickname: user.name,
                message,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            });
        });

        socket.on("room-file-upload", ({ fileType, fileName, fileData }) => {
            const { roomId, user } = socket.data;
            if (!roomId || !user) return;
            io.to(roomId).emit("file-message", {
                nickname: user.name,
                fileType,
                fileName,
                fileData,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            });
        });

        socket.on("disconnect", () => {
            const nickname = users[socket.id];
            const roomId = socketToRoom[socket.id];
            const user = socket.data?.user;

            // Global disconnect
            if (nickname) {
                delete users[socket.id];
                activeNicknames.delete(nickname);

                const globalSockets = Array.from(io.sockets.sockets.values()).filter(s => {
                    const rooms = Array.from(s.rooms);
                    return !rooms.some(r => r !== s.id);
                });

                globalSockets.forEach(s => {
                    s.emit("message", {
                        nickname: "Server",
                        message: `${nickname} left the chat`,
                        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    });
                });

                broadcastGlobalUserList();
            }

            // Community disconnect
            if (roomId && user) {
                socket.leave(roomId);
                roomIdToUsers[roomId]?.delete(user.name);

                io.to(roomId).emit("message", {
                    nickname: "Server",
                    message: `${user.name} left the room`,
                    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                });

                io.to(roomId).emit("users-list", {
                    nicknames: Array.from(roomIdToUsers[roomId] || []),
                    count: roomIdToUsers[roomId]?.size || 0
                });

                delete socketToRoom[socket.id];
            }
        });
    });
}

module.exports = setupSocket;
