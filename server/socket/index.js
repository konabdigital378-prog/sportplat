const Notification = require('../models/Notification');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connecté: ${socket.id}`);

    socket.on('join:tournament', (tournamentId) => {
      socket.join(`tournament:${tournamentId}`);
    });

    socket.on('leave:tournament', (tournamentId) => {
      socket.leave(`tournament:${tournamentId}`);
    });

    socket.on('join:match', (matchId) => {
      socket.join(`match:${matchId}`);
    });

    socket.on('leave:match', (matchId) => {
      socket.leave(`match:${matchId}`);
    });

    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on('match:live_update', (data) => {
      const { matchId, score1, score2, tournamentId } = data;
      io.to(`match:${matchId}`).emit('match:score_update', {
        matchId, score1, score2, timestamp: new Date()
      });
      io.to(`tournament:${tournamentId}`).emit('match:score_update', {
        matchId, score1, score2, timestamp: new Date()
      });
    });

    socket.on('notification:send', async (data) => {
      try {
        const notif = await Notification.create({
          user: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          link: data.link || '',
          tournament: data.tournament,
          match: data.match
        });
        io.to(`user:${data.userId}`).emit('notification:new', notif);
      } catch (err) {
        console.error('Erreur notification:', err.message);
      }
    });

    socket.on('typing:start', (data) => {
      socket.to(`tournament:${data.tournamentId}`).emit('typing:update', {
        userId: data.userId,
        username: data.username,
        isTyping: true
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(`tournament:${data.tournamentId}`).emit('typing:update', {
        userId: data.userId,
        isTyping: false
      });
    });

    socket.on('disconnect', () => {
      console.log(`Client déconnecté: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
