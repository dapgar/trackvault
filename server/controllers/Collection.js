const models = require('../models');
const Collection = models.Collection;

// Create a new Collection
const createCollection = async (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({ error: 'Collection name is required' });
    }

    const collectionData = {
        name: req.body.name,
        description: req.body.description || '',
        owner: req.session.account._id,
    };

    try {
        const newCollection = new Collection(collectionData);
        await newCollection.save();
        return res.status(201).json({
            name: newCollection.name,
            description: newCollection.description,
            _id: newCollection._id,
        });
    } catch (err) {
        console.log(err);
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Collection already exists!' });
        }
        return res.status(500).json({ error: 'An error occurred creating the collection!' });
    }
};

// Load all Collections for the logged-in user
const getCollections = async (req, res) => {
    try {
        const query = { owner: req.session.account._id };
        const docs = await Collection.find(query).select('name description').lean().exec();

        return res.json({ collections: docs });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving collections!' });
    }
};

// Delete a Collection
const deleteCollection = async (req, res) => {
    try {
        const collectionId = req.body.id;

        const deleted = await Collection.deleteOne({ _id: collectionId, owner: req.session.account._id });

        if (deleted.deletedCount === 0) {
            return res.status(404).json({ error: 'Collection not found or unauthorized' });
        }

        return res.status(200).json({ message: 'Collection deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'An error occurred while deleting the collection' });
    }
};

// Just renders app (for now, frontend handles logic)
const makerPage = async (req, res) => {
    return res.render('app');
};

module.exports = {
    makerPage,
    createCollection,
    getCollections,
    deleteCollection,
};
