const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

// handle creating a new Collection
const handleCollection = (e, onCollectionAdded) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#collectionName').value;
    const description = e.target.querySelector('#collectionDescription').value;
    const borderColor = e.target.querySelector('#borderColor').value || '#3b73ff';

    if (!name) {
        helper.handleError('Collection name is required');
        return false;
    }

    helper.sendPost(e.target.action, { name, description, borderColor }, onCollectionAdded);
    return false;
};

// handles creating a new song 
const handleSong = async (e, collectionId, onSongAdded) => {
    e.preventDefault();
    helper.hideError();

    const title = e.target.querySelector('#songTitle').value;
    const artist = e.target.querySelector('#songArtist').value;
    const borderColor = e.target.querySelector('#songBorderColor')?.value || '#3b73ff';

    if (!title || !artist) {
        helper.handleError('Song title and artist are required');
        return false;
    }

    // gets cover art based on title 
    const searchTerm = encodeURIComponent(`${title} ${artist}`);
    const url = `https://itunes.apple.com/search?term=${searchTerm}&entity=song&limit=1`;

    let albumArt = '';
    let duration = '';

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            albumArt = result.artworkUrl100.replace('100x100', '600x600');

            if (result.trackTimeMillis) {
                const minutes = Math.floor(result.trackTimeMillis / 60000);
                const seconds = Math.floor((result.trackTimeMillis % 60000) / 1000);
                duration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            }
        }
    } catch (err) {
        console.error('Error fetching album art or duration:', err);
    }

    if (!albumArt) {
        albumArt = '/assets/img/placeholder.png';
    }

    helper.sendPost('/createSong', { title, artist, albumArt, duration, collectionId, borderColor }, onSongAdded);
    e.target.reset();
    return false;
};

// Collection form
const CollectionForm = (props) => (
    <div>
        <form id="collectionForm" onSubmit={(e) => handleCollection(e, props.triggerReload)} name="collectionForm" action="/createCollection" className="collectionForm">
            <label htmlFor="name">Name:</label>
            <input id="collectionName" type="text" name="name" placeholder="My 2025 Favorites" />

            <label htmlFor="description">Description:</label>
            <input id="collectionDescription" type="text" name="description" placeholder="Optional description" />

            <label htmlFor="borderColor">Border Color:</label>
            <input id="borderColor" type="color" name="borderColor" defaultValue="#3b73ff" />

            <input className="makeCollectionSubmit" type="submit" value="Create Collection" />
        </form>
        <p id="errorMessage" className="errorText hidden"></p>
    </div>
);

// Collection list 
const CollectionList = ({ collections, setCollections, reloadCollections, selectCollection, triggerReloadCollections }) => {
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editBorderColor, setEditBorderColor] = useState('#3b73ff');

    const loadCollectionsFromServer = async () => {
        const response = await fetch('/getCollections');
        const data = await response.json();
        setCollections(data.collections);
    };

    useEffect(() => {
        loadCollectionsFromServer();
    }, [reloadCollections]);

    const handleDeleteCollection = async (id) => {
        try {
            const response = await fetch('/deleteCollection', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (response.ok) {
                triggerReloadCollections();
            }
        } catch (error) {
            console.error('Error deleting collection:', error);
        }
    };

    const handleEditCollection = (collection) => {
        setEditId(collection._id);
        setEditName(collection.name);
        setEditDescription(collection.description || '');
        setEditBorderColor(collection.borderColor || '#3b73ff');
    };

    const handleSaveEdit = async (id) => {
        try {
            const response = await fetch('/editCollection', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name: editName, description: editDescription, borderColor: editBorderColor }),
            });
            if (response.ok) {
                setEditId(null);
                triggerReloadCollections();
            }
        } catch (error) {
            console.error('Error editing collection:', error);
        }
    };

    if (collections.length === 0) {
        return <div className="collectionList"><h3 className="emptyCollection">No Collections Yet</h3></div>;
    }

    // collection nodes here 
    const collectionNodes = collections.map((collection) => (
        <div key={collection._id} className="collection" style={{
            borderColor: collection.borderColor || '#3b73ff'
        }}>
            {editId === collection._id ? (
                <>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="editInput" />
                    <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="editInput" />
                    <div className="colorPickers">
                        <label>Border:</label>
                        <input type="color" value={editBorderColor} onChange={(e) => setEditBorderColor(e.target.value)} />
                    </div>
                    <button className="saveButton" onClick={() => handleSaveEdit(collection._id)}>Save</button>
                    <button className="cancelButton" onClick={() => setEditId(null)}>Cancel</button>
                </>
            ) : (
                <>
                    <h3 className="collectionName" onClick={() => selectCollection(collection)}>{collection.name}</h3>
                    <p className="collectionDescription">{collection.description}</p>
                    <button className="editButton" onClick={() => handleEditCollection(collection)}>Edit</button>
                    <button className="deleteButton" onClick={() => handleDeleteCollection(collection._id)}>Delete</button>
                </>
            )}
        </div>
    ));

    return <div className="collectionList">{collectionNodes}</div>;
};

// Song form
const SongForm = (props) => {
    const { collectionId, triggerReload } = props;
    return (
        <div>
            <form id="songForm" onSubmit={(e) => handleSong(e, collectionId, triggerReload)} name="songForm" className="songForm">
                <label htmlFor="title">Song Title:</label>
                <input id="songTitle" type="text" name="title" placeholder="Blinding Lights" />
                <label htmlFor="artist">Artist:</label>
                <input id="songArtist" type="text" name="artist" placeholder="The Weeknd" />
                <input className="makeSongSubmit" type="submit" value="Add Song" />
                <label htmlFor="songBorderColor">Border Color:</label>
                <input id="songBorderColor" type="color" name="borderColor" defaultValue="#3b73ff" />
            </form>
            <p id="errorMessage" className="errorText hidden"></p>
        </div>
    );
};

// Song list
const SongList = (props) => {
    const { collectionId, reloadSongs } = props;
    const [songs, setSongs] = useState([]);
    const [editSongId, setEditSongId] = useState(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedArtist, setEditedArtist] = useState('');
    const [editedBorderColor, setEditedBorderColor] = useState('#3b73ff');

    const loadSongsFromServer = async () => {
        const response = await fetch(`/getSongs?collectionId=${collectionId}`);
        const data = await response.json();
        setSongs(data.songs);
    };

    useEffect(() => {
        if (collectionId) {
            loadSongsFromServer();
        }
    }, [collectionId, reloadSongs]);

    const handleDelete = async (id) => {
        try {
            const response = await fetch('/deleteSong', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (response.ok) {
                loadSongsFromServer();
            }
        } catch (error) {
            console.error('Error deleting song:', error);
        }
    };

    const startEditing = (song) => {
        setEditSongId(song._id);
        setEditedTitle(song.title);
        setEditedArtist(song.artist);
        setEditedBorderColor(song.borderColor || '#3b73ff');
    };


    const cancelEditing = () => {
        setEditSongId(null);
        setEditedTitle('');
        setEditedArtist('');
    };

    const handleSaveEdit = async (songId) => {
        try {
            const searchTerm = encodeURIComponent(`${editedTitle} ${editedArtist}`);
            const url = `https://itunes.apple.com/search?term=${searchTerm}&entity=song&limit=1`;

            let albumArt = '';
            let duration = '';

            const response = await fetch(url);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                albumArt = result.artworkUrl100.replace('100x100', '600x600');

                if (result.trackTimeMillis) {
                    const minutes = Math.floor(result.trackTimeMillis / 60000);
                    const seconds = Math.floor((result.trackTimeMillis % 60000) / 1000);
                    duration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                }
            }

            await fetch('/editSong', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: songId, title: editedTitle, artist: editedArtist, albumArt, duration, borderColor: editedBorderColor }),
            });

            setEditSongId(null);
            loadSongsFromServer();
        } catch (err) {
            console.error('Error saving edits:', err);
        }
    };

    if (songs.length === 0) {
        return <div className="songList"><h3 className="emptySong">No Songs Yet</h3></div>;
    }


    // song nodes here
    const songNodes = songs.map((song) => (
        <div key={song._id} className="song" style={{
            borderColor: song.borderColor || '#3b73ff'
        }}>
            <div className="songContent">
                <img src={song.albumArt} alt={`${song.title} cover`} className="albumArt" />
                <div className="songText">
                    {editSongId === song._id ? (
                        <>
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="editInput"
                            />
                            <input
                                type="text"
                                value={editedArtist}
                                onChange={(e) => setEditedArtist(e.target.value)}
                                className="editInput"
                            />
                            <div className="colorPickers">
                                <label>Border:</label>
                                <input
                                    type="color"
                                    value={editedBorderColor}
                                    onChange={(e) => setEditedBorderColor(e.target.value)}
                                />
                            </div>
                            <button className="saveButton" onClick={() => handleSaveEdit(song._id)}>Save</button>
                            <button className="cancelButton" onClick={cancelEditing}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <h3 className="songTitle">{song.title}</h3>
                            <p className="songArtist">by {song.artist}</p>
                            {song.duration && <p className="songDuration">{song.duration}</p>}
                            <button className="editButton" onClick={() => startEditing(song)}>Edit</button>
                            <button className="deleteButton" onClick={() => handleDelete(song._id)}>Delete</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    ));

    return (
        <div className="songList">
            <div className="songGrid">
                {songNodes}
            </div>
        </div>
    );
};

// app
const App = () => {
    const [collections, setCollections] = useState([]);
    const [reloadCollections, setReloadCollections] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [reloadSongs, setReloadSongs] = useState(false);
    const [username, setUsername] = useState('');

    const getUsername = async () => {
        const response = await fetch('/getUsername');
        const data = await response.json();
        setUsername(data.username);
    };

    useEffect(() => {
        getUsername();
    }, []);

    if (selectedCollection) {
        return (
            <div>
                <button id="backToCollectionsButton" onClick={() => setSelectedCollection(null)}>← Back to Collections</button>
                <h2>{selectedCollection.name}</h2>
                <p>{selectedCollection.description}</p>
                <SongForm collectionId={selectedCollection._id} triggerReload={() => setReloadSongs(!reloadSongs)} />
                <SongList collectionId={selectedCollection._id} reloadSongs={reloadSongs} />
            </div>
        );
    }

    return (
        <div>
            <div id="welcomeSection">
                {username && <h1 className="welcomeMessage">Welcome, {username}!</h1>}
            </div>
            <div id="makeCollection">
                <CollectionForm triggerReload={() => setReloadCollections(!reloadCollections)} />
            </div>
            <div id="collections">
                <CollectionList
                    collections={collections}
                    setCollections={setCollections}
                    reloadCollections={reloadCollections}
                    triggerReloadCollections={() => setReloadCollections(!reloadCollections)}
                    selectCollection={(collection) => setSelectedCollection(collection)}
                />
            </div>
        </div>
    );
};

// init app
const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;
