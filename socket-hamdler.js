
const auth = require('../server/middlewhere/auth')
io = require('socket.io')();
const User = require('./models/user');
const Message = require('./models/message');
const users = {}
io.use(auth.socket)


io.on('connection', (socket) => {
    onSocketConnected(socket);
    socket.on("message", data => onMessage(socket, data))
    socket.on('typing', receiver => onTyping(socket, receiver))
    socket.on('seen', sender => onSeen(socket, sender));
    initiaData(socket)
    socket.on('disconnect', ()=> onSocketDisconnected(socket))
});


const onSocketConnected = (socket) =>{
    console.log('New clint Connection:  ' + socket.id)
    socket.join(socket.user.id);
    users[socket.user.id] = true
    let room  = io.sockets.adapter.rooms[socket.user.id]
    if(!room || room.length === 1){
        io.emit('user_status', {
            [socket.user.id]: true
        })
    }
};

const onSocketDisconnected = socket =>{
    let room = io.sockets.adapter.rooms[socket.user.id];
    if(!room || room.length < 1){
        let lastseen = new Date().getTime();
        users[socket.user.id] = lastseen;
        io.emit('user_status', {
            [socket.user.id]: lastseen
        })
    }
    console.log('Client Disconnected '+ socket.user.username)
}
const onMessage = (socket, data) =>
{
    let sender = socket.user.id;
    let receiver = data.receiver;
    let message = {
        sender: sender, receiver: receiver, content: data.content, date: new Date().getTime()
    };
    Message.create(message);
    socket.to(receiver).to(sender).emit('message', message)
}

const getMessages = userId => {
    let where = [{ sender: userId }, { receiver: userId }];
    return Message.find().or(where);
  };
const onTyping = (socket, receiver) => {
    let sender = socket.user._id
    socket.to(receiver).emit('typing', sender)
};

const onSeen = (socket, sender) => {
    let receiver = socket.user._id;
    Message.updateMany({sender, receiver, seen: false}, {seen: true}, {multi: true}).exec();
    
};
const getUsers = userId => {
    let where = {
        _id: {$ne: userId}
   }
   return User.find(where).select('-password')
};


const initiaData = socket => {
    let user = socket.user;
    let messages = [];
    getMessages(user.id)
    .then(data => {
        messages= data
        return getUsers(user.id);
    })
    .then(contacts => {
        socket.emit('data', user, contacts, messages, users)
    })
    .catch(()=> socket.disconnect());
}