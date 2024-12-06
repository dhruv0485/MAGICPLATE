import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../../css/signup.css';

async function submitSignUpData(SignUpData) {
    try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.8:5000'
        const response = await fetch(`${API_URL}/newLoginCustomer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(SignUpData)
        });

        if (response.ok) {
            return { success: true };
        } else {
            const error = await response.json();
            return { success: false, message: error.message || "Unknown error" };
        }
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function SubmitLogInData(LogInData) {
    try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.8:5000'
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify(LogInData),
        })
        if (response.ok) {
            const data = await response.json()
            return { success: true, message: data.message }
        } else {
            const error = await response.json()
            return { success: false, message: error.message || "Login Failed" }
        }
    } catch (error) {
        return { success: false, message: error.message }
    }
}

function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [activeButton, setActiveButton] = useState('login');
    const [error, setError] = useState('');
    const [orLinePosition, setOrLinePosition] = useState('11%');
    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()
        const SignUpData = { Name: name, Email: email, Password: password }
        const result = await submitSignUpData(SignUpData);
        if (result.success) {
            alert("Signup Data stored successfully");
            navigate('/menu')
            sessionStorage.setItem('isLoggedIn',true)
            sessionStorage.setItem('UserName',name)
            sessionStorage.setItem('email', email);
        } else {
            alert("Error signing up: " + result.message);
        }
    }

    const handleLogin = async (event) => {
        event.preventDefault()
        console.log("Login button clicked");
        const LogInData = {email,password}
        console.log("Data to send:", LogInData);
        const result = await SubmitLogInData(LogInData)
        console.log("Result from server:", result);
        if (result.success) {
            alert(result.message)
            navigate('/menu')
            sessionStorage.setItem('isLoggedIn',true)
            sessionStorage.setItem('email', email);
        } else {
            setError(result.message)
        }
    }

    const handleButtonClick = (button) => {
        setActiveButton(button);
        setOrLinePosition(button === 'login' ? '11%' : '12.5%');
    };

    useEffect(() => {
        const dash = document.getElementById('dash');
        const cross = document.getElementById('cross');
        const sidebar = document.getElementById('side-bar');
        const loginBox = document.getElementById('logins-boxs');
        const signupBox = document.getElementById('signups-boxs');

        if (loginBox && signupBox) {
            loginBox.style.display = activeButton === 'login' ? "block" : "none";
            signupBox.style.display = activeButton === 'signup' ? "block" : "none";
        }

        const toggleSidebar = () => sidebar.classList.toggle('active');
        const closeSidebar = () => sidebar.classList.remove('active');

        dash?.addEventListener('click', toggleSidebar);
        cross?.addEventListener('click', closeSidebar);

        return () => {
            dash?.removeEventListener('click', toggleSidebar);
            cross?.removeEventListener('click', closeSidebar);
        }
    }, [activeButton]);


    return (
        <>
            <div id="side-bar">
                <div id="side-bar-header">
                    <header id="side-head">MAGICPLATE</header>
                    <img src="/images/letter-x.png" id="cross" alt="Close sidebar" />
                </div>
                <Link to="/" className="home-side">
                    <div id="side-bar-home">
                        <header id="side-home">HOME</header>
                    </div>
                </Link>
                <Link to="/about" className="about-side">
                    <div id="side-bar-about">
                        <header id="side-about">ABOUT</header>
                    </div>
                </Link>
                <Link to="/contact" className="contact-side">
                    <div id="side-bar-contact">
                        <header id="side-contact">CONTACT</header>
                    </div>
                </Link>
                <Link to="/signup" className="signup-side">
                    <div id="side-bar-signup">
                        <header id="side-signup">SIGN UP</header>
                    </div>
                </Link>
            </div>
            <nav id="Content-bar">
                <div id="dash">
                    <img src="/images/menu-bar.png" id="menu-bar" alt="Menu" />
                </div>
                <div className="company" id="company">
                    <header className="company-name" id="company-name">MAGICPLATE</header>
                </div>
                <div className="content-box" id="content-box">
                    <ul className="nav-content" id="nav-content">
                        <Link className="content-list" to="/"><li className="content" id="content">HOME</li></Link>
                        <Link className="content-list" to="/about"><li className="content" id="content">ABOUT</li></Link>
                        <Link className="content-list" to="/contact"><li className="content" id="content">CONTACT</li></Link>
                        <Link className="content-list" to="/signup"><li className="content" id="content">SIGN UP</li></Link>
                    </ul>
                </div>
            </nav>
            <div id="Cover-box">
                <div id="Main-Box">
                    <div id="half-image-box"></div>
                    <div id="second-half-box">
                        <div id="welcome-header">
                            <header id="welcome-head">Welcome Back!</header>
                        </div>
                        <div id="buttons">
                            <div id="logins-buttons">
                                <button type="button" id="logins" className={activeButton === 'login' ? 'active' : ''} onClick={() => handleButtonClick('login')}>Login</button>
                            </div>
                            <div id="sign-ups-buttons">
                                <button type="button" id="sign-ups" className={activeButton === 'signup' ? 'active' : ''} onClick={() => handleButtonClick('signup')}>SignUp</button>
                            </div>
                        </div>
                        <form id="logins-boxs" onSubmit={handleLogin}>
                            <div id="input-emails">
                                <input id="emails-input-box" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div id="input-passwords">
                                <input id="passwords-input-box" type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div id="login-menu">
                                <button id="logins-menus" type="submit">Login</button>
                            </div>
                        </form>
                        <form id="signups-boxs" onSubmit={handleSubmit}>
                            <div id="input-names">
                                <input id="names-input-box" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div id="input-emails-2">
                                <input id="emails-input-box-2" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div id="input-passwords-2">
                                <input id="passwords-input-box-2" type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div id="signup-menu">
                                <button id="Signups-menus" type="submit">Sign Up</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SignUp;