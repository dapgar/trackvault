const mongoose = require('mongoose');
const _ = require('underscore');

const setTitle = (title) => _.escape(title).trim();
const setArtist = (artist) => _.escape(artist).trim();

const SongSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        set: setTitle,
    },
    artist: {
        type: String,
        required: true,
        trim: true,
        set: setArtist,
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
});

// For sending clean Song data to front-end
SongSchema.statics.toAPI = (doc) => ({
    title: doc.title,
    artist: doc.artist,
    _id: doc._id,
    collectionId: doc.collectionId,
});

const SongModel = mongoose.model('Song', SongSchema);
module.exports = SongModel;
