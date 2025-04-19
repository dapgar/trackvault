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
    borderColor: {
        type: String,
        default: '#3b73ff', // blue accent
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

CollectionSchema.statics.toAPI = (doc) => ({
    name: doc.name,
    description: doc.description,
    bgColor: doc.bgColor,
    borderColor: doc.borderColor,
    _id: doc._id,
});

const CollectionModel = mongoose.model('Collection', CollectionSchema);
module.exports = CollectionModel;
