const mongooes = require('mongoose');

const ModelSchema = new mongooes.Schema({
    sender: {
        type: mongooes.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver:{
        type: mongooes.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    seen: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Model = mongooes.model('Message', ModelSchema);
module.exports = Model;