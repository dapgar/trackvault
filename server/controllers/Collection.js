const models = require('../models');
const Collection = models.Collection;

// create a new Collection
const createCollection = async (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({ error: 'Collection name is required' });
    }

    const collectionData = {
        name: req.body.name,
        description: req.body.description || '',
        bgColor: req.body.bgColor || '#1f2a48',     // Default if not provided
        borderColor: req.body.borderColor || '#3b73ff', // Default if not provided
        owner: req.session.account._id,
    };

    try {
        const newCollection = new Collection(collectionData);
        await newCollection.save();
        return res.status(201).json({
            name: newCollection.name,
            description: newCollection.description,
            bgColor: newCollection.bgColor,
            borderColor: newCollection.borderColor,
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

// load all Collections for the logged-in user
const getCollections = async (req, res) => {
    try {
        const query = { owner: req.session.account._id };
        const docs = await Collection.find(query).select('name description bgColor borderColor').lean().exec();

        return res.json({ collections: docs });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving collections!' });
    }
};

// delete a Collection
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

// edit a Collection
const editCollection = async (req, res) => {
    try {
        const { id, name, description, bgColor, borderColor } = req.body;

        if (!id || !name) {
            return res.status(400).json({ error: 'Collection ID and new name are required!' });
        }

        const updated = await Collection.updateOne(
            { _id: id, owner: req.session.account._id },
            { $set: { name, description, bgColor, borderColor } }
        );

        if (updated.matchedCount === 0) {
            return res.status(404).json({ error: 'Collection not found or unauthorized' });
        }

        return res.status(200).json({ message: 'Collection updated successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'An error occurred while editing the collection' });
    }
};



const makerPage = async (req, res) => {
    return res.render('app');
};


module.exports = {
    makerPage,
    createCollection,
    getCollections,
    deleteCollection,
    editCollection,
};
