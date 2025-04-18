const helper = require('./helper.js');
const React = require('react');
const { createRoot } = require('react-dom/client');

const handleLogin = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if (!username || !pass) {
        helper.handleError('Username or password is empty!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass });
    return false;
};

const handleSignup = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if (!username || !pass || !pass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if (pass !== pass2) {
        helper.handleError('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass, pass2 });
    return false;
};

const LoginWindow = (props) => {
    return (
        <div>
            <form id="loginForm"
                name="loginForm"
                onSubmit={handleLogin}
                action="/login"
                method="POST"
                className="mainForm"
            >
                <label htmlFor="username">Username:</label>
                <input id="user" type="text" name="username" placeholder="Username" />
                <label htmlFor="pass">Password:</label>
                <input id="pass" type="password" name="pass" placeholder="Password" />
                <input className="formSubmit" type="submit" value="Sign In" />
            </form>

            {/* 🔥 Error message under Login Form */}
            <p id="errorMessage" className="errorText hidden"></p>
        </div>
    );
};

const SignupWindow = (props) => {
    return (
        <div>
            <form id="signupForm"
                name="signupForm"
                onSubmit={handleSignup}
                action="/signup"
                method="POST"
                className="mainForm"
            >
                <label htmlFor="username">Username:</label>
                <input id="user" type="text" name="username" placeholder="Username" />
                <label htmlFor="pass">Password:</label>
                <input id="pass" type="password" name="pass" placeholder="Password" />
                <label htmlFor="pass2">Confirm Password:</label>
                <input id="pass2" type="password" name="pass2" placeholder="Retype Password" />
                <input className="formSubmit" type="submit" value="Sign Up" />
            </form>

            {/* 🔥 Error message under Signup Form */}
            <p id="errorMessage" className="errorText hidden"></p>
        </div>
    );
};

const init = () => {
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');

    const root = createRoot(document.getElementById('content'));

    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<LoginWindow />);
        return false;
    });

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<SignupWindow />);
        return false;
    });

    root.render(<LoginWindow />);
};

window.onload = init;
