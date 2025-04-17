const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

const CollectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        set: setName,
    },
    description: {
        type: String,
        trim: true,
        default: '',
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

// For sending clean Collection data to front-end
CollectionSchema.statics.toAPI = (doc) => ({
    name: doc.name,
    description: doc.description,
    _id: doc._id,
});

const CollectionModel = mongoose.model('Collection', CollectionSchema);
module.exports = CollectionModel;
