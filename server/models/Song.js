const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

const SongSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        set: setName,
    },
    artist: {
        type: String,
        required: true,
        trim: true,
    },
    albumArt: {
        type: String,
        default: '',
    },
    duration: {
        type: String,
        default: '',
    },
    collectionId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Collection',
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account',
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    borderColor: {
        type: String,
        default: '#3b73ff', 
    },
});

SongSchema.statics.toAPI = (doc) => ({
    title: doc.title,
    artist: doc.artist,
    albumArt: doc.albumArt,
    duration: doc.duration,
    _id: doc._id,
    collectionId: doc.collectionId,
    borderColor: doc.borderColor, 
});

const SongModel = mongoose.model('Song', SongSchema);

module.exports = SongModel;
