const models = require('../models');
const Song = models.Song;

// Create a new Song
const createSong = async (req, res) => {
    if (!req.body.title || !req.body.artist || !req.body.collectionId) {
        return res.status(400).json({ error: 'Title, artist, and collection ID are required' });
    }

    const songData = {
        title: req.body.title,
        artist: req.body.artist,
        collectionId: req.body.collectionId,
        owner: req.session.account._id,
    };

    try {
        const newSong = new Song(songData);
        await newSong.save();
        return res.status(201).json({
            title: newSong.title,
            artist: newSong.artist,
            _id: newSong._id,
            collectionId: newSong.collectionId,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'An error occurred creating the song!' });
    }
};

// Get all Songs for a given Collection
const getSongsForCollection = async (req, res) => {
    try {
        const collectionId = req.query.collectionId;
        if (!collectionId) {
            return res.status(400).json({ error: 'Collection ID is required' });
        }

        const query = {
            owner: req.session.account._id,
            collectionId: collectionId,
        };

        const docs = await Song.find(query).select('title artist collectionId').lean().exec();

        return res.json({ songs: docs });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving songs!' });
    }
};

// Delete a Song
const deleteSong = async (req, res) => {
    try {
        const songId = req.body.id;

        const deleted = await Song.deleteOne({ _id: songId, owner: req.session.account._id });

        if (deleted.deletedCount === 0) {
            return res.status(404).json({ error: 'Song not found or unauthorized' });
        }

        return res.status(200).json({ message: 'Song deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'An error occurred while deleting the song' });
    }
};

module.exports = {
    createSong,
    getSongsForCollection,
    deleteSong,
};
