const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

const handleDomo = (e, onDomoAdded) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#domoName').value;
    const age = e.target.querySelector('#domoAge').value;
    const color = e.target.querySelector('#domoColor').value;

    if (!name || !age || !color) {
        helper.handleError('All fields are required');
        return false;
    }

    helper.sendPost(e.target.action, { name, age, color }, onDomoAdded);
    return false;
}


const DomoForm = (props) => {
    return (
        <form id="domoForm"
            onSubmit={(e) => handleDomo(e, props.triggerReload)}
            name="domoForm"
            action="/maker"
            className="domoForm"
        >
            <label htmlFor="name">Name: </label>
            <input id="domoName" type="text" name="name" placeholder="Domo Name" />
            <label htmlFor="age">Age: </label>
            <input id="domoAge" type="number" min="0" name="age" />
            <label htmlFor="color">Color: </label>
            <input id="domoColor" type="text" name="color" placeholder="Domo Color" />
            <input className="makeDomoSubmit" type="submit" value="Make Domo" />
        </form>
    );
};

const DomoList = (props) => {
    const [domos, setDomos] = useState(props.domos);

    const loadDomosFromServer = async () => {
        const response = await fetch('/getDomos');
        const data = await response.json();
        setDomos(data.domos);
    };

    useEffect(() => {
        loadDomosFromServer();
    }, [props.reloadDomos]);

    // Function to handle deleting a Domo
    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/deleteDomo`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (response.ok) {
                loadDomosFromServer();
            } else {
                console.error('Failed to delete domo');
            }
        } catch (error) {
            console.error('Error deleting domo:', error);
        }
    };

    if (domos.length === 0) {
        return (
            <div className="domoList">
                <h3 className="emptyDomo">No Domos Yet</h3>
            </div>
        );
    }

    const domoNodes = domos.map(domo => (
        <div key={domo._id} className="domo">
            <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace" />
            <h3 className="domoName">Name: {domo.name}</h3>
            <h3 className="domoAge">Age: {domo.age}</h3>
            <h3 className="domoColor">Color: {domo.color}</h3>
            <button className="deleteButton" onClick={() => handleDelete(domo._id)}>Delete</button>
        </div>
    ));

    return (
        <div className="domoList">
            {domoNodes}
        </div>
    );
};


const App = () => {
    const [domos, setDomos] = useState([]);
    const [reloadDomos, setReloadDomos] = useState(false);

    return (
        <div>
            <div id="makeDomo">
                <DomoForm triggerReload={() => setReloadDomos(!reloadDomos)} />
            </div>
            <div id="domos">
                { }
                <DomoList
                    domos={domos}
                    reloadDomos={reloadDomos}
                    setDomos={setDomos}
                />
            </div>
        </div>
    );
};


const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;