const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

// 🎵 Handle creating a new Collection
const handleCollection = (e, onCollectionAdded) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#collectionName').value;
    const description = e.target.querySelector('#collectionDescription').value;

    if (!name) {
        helper.handleError('Collection name is required');
        return false;
    }

    helper.sendPost(e.target.action, { name, description }, onCollectionAdded);
    return false;
};

const handleSong = async (e, collectionId, onSongAdded) => {
    e.preventDefault();
    helper.hideError();

    const title = e.target.querySelector('#songTitle').value;
    const artist = e.target.querySelector('#songArtist').value;

    if (!title || !artist) {
        helper.handleError('Song title and artist are required');
        return false;
    }

    // Fetch album art and duration from iTunes
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

            // 🎵 Calculate duration (minutes:seconds)
            if (result.trackTimeMillis) {
                const minutes = Math.floor(result.trackTimeMillis / 60000);
                const seconds = Math.floor((result.trackTimeMillis % 60000) / 1000);
                duration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            }
        }
    } catch (err) {
        console.error('Error fetching album art or duration:', err);
    }

    // ✨ Set default placeholder if no album art found
    if (!albumArt) {
        albumArt = '/assets/img/placeholder.png'; // Local placeholder image
    }

    // Send song info including albumArt AND duration
    helper.sendPost('/createSong', { title, artist, albumArt, duration, collectionId }, onSongAdded);

    e.target.reset();
    return false;
};


const CollectionForm = (props) => {
    return (
        <div>
            <form id="collectionForm"
                onSubmit={(e) => handleCollection(e, props.triggerReload)}
                name="collectionForm"
                action="/createCollection"
                className="collectionForm"
            >
                <label htmlFor="name">Collection Name: </label>
                <input id="collectionName" type="text" name="name" placeholder="My 2025 Favorites" />
                <label htmlFor="description">Description: </label>
                <input id="collectionDescription" type="text" name="description" placeholder="Optional description" />
                <input className="makeCollectionSubmit" type="submit" value="Create Collection" />
            </form>

            {/* 🌟 New Error Display */}
            <p id="errorMessage" className="errorText hidden"></p>
        </div>
    );
};


const CollectionList = (props) => {
    const { collections, setCollections, reloadCollections, selectCollection, triggerReloadCollections } = props;

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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (response.ok) {
                triggerReloadCollections(); // Tell App to reload collections
            } else {
                console.error('Failed to delete collection');
            }
        } catch (error) {
            console.error('Error deleting collection:', error);
        }
    };

    if (collections.length === 0) {
        return (
            <div className="collectionList">
                <h3 className="emptyCollection">No Collections Yet</h3>
            </div>
        );
    }

    const collectionNodes = collections.map(collection => (
        <div key={collection._id} className="collection">
            <h3 className="collectionName" onClick={() => selectCollection(collection)}>{collection.name}</h3>
            <p className="collectionDescription">{collection.description}</p>
            <button className="deleteButton" onClick={() => handleDeleteCollection(collection._id)}>Delete Collection</button>
        </div>
    ));

    return (
        <div className="collectionList">
            {collectionNodes}
        </div>
    );
};


const SongForm = (props) => {
    const { collectionId, triggerReload } = props;

    return (
        <div>
            <form id="songForm"
                onSubmit={(e) => handleSong(e, collectionId, triggerReload)}
                name="songForm"
                className="songForm"
            >
                <label htmlFor="title">Song Title: </label>
                <input id="songTitle" type="text" name="title" placeholder="Blinding Lights" />
                <label htmlFor="artist">Artist: </label>
                <input id="songArtist" type="text" name="artist" placeholder="The Weeknd" />
                <input className="makeSongSubmit" type="submit" value="Add Song" />
            </form>

            {/* 🌟 New Error Display */}
            <p id="errorMessage" className="errorText hidden"></p>
        </div>
    );
};


// 🎶 SongList to display songs
const SongList = (props) => {
    const { collectionId, reloadSongs } = props;
    const [songs, setSongs] = useState([]);

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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (response.ok) {
                loadSongsFromServer(); // Refresh songs after delete
            } else {
                console.error('Failed to delete song');
            }
        } catch (error) {
            console.error('Error deleting song:', error);
        }
    };

    if (songs.length === 0) {
        return (
            <div className="songList">
                <h3 className="emptySong">No Songs Yet</h3>
            </div>
        );
    }

    const songNodes = songs.map((song) => (
        <div key={song._id} className="song">
            <div className="songContent">
                <img src={song.albumArt} alt={`${song.title} cover`} className="albumArt" />
                <div className="songText">
                    <h3 className="songTitle">{song.title}</h3>
                    <p className="songArtist">by {song.artist}</p>
                    {song.duration && (
                        <p className="songDuration">{song.duration}</p> // <-- Show duration
                    )}
                    <button className="deleteButton" onClick={() => handleDelete(song._id)}>Delete</button>
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

// 🛠️ Main App
const App = () => {
    const [collections, setCollections] = useState([]);
    const [reloadCollections, setReloadCollections] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [reloadSongs, setReloadSongs] = useState(false);
    const [username, setUsername] = useState(''); // 🌟 NEW: username state

    const getUsername = async () => {
        try {
            const response = await fetch('/getUsername'); // 🌟 NEW API endpoint
            const data = await response.json();
            setUsername(data.username);
        } catch (err) {
            console.error('Failed to fetch username:', err);
        }
    };

    useEffect(() => {
        getUsername(); // 🌟 On first load, grab username
    }, []);

    if (selectedCollection) {
        return (
            <div>
                <button id="backToCollectionsButton" onClick={() => setSelectedCollection(null)}>← Back to Collections</button>
                <h2>{selectedCollection.name}</h2>
                <p>{selectedCollection.description}</p>
                <SongForm
                    collectionId={selectedCollection._id}
                    triggerReload={() => setReloadSongs(!reloadSongs)}
                />
                <SongList
                    collectionId={selectedCollection._id}
                    reloadSongs={reloadSongs}
                />
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

// Initialize App
const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;
