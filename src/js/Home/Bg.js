import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import '../../css/home.css';

function Container() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    useEffect(() => {
        const HomeContainer = document.getElementById('Body-container');
        const slogan = document.getElementById('slogan-name');
        let currentIndex = 0;

        const loggedIn = sessionStorage.getItem('isLoggedIn') 
        if(loggedIn === 'true'){
            document.getElementById('content-box-home').style.right='3%'
            setIsLoggedIn(loggedIn)
        }

        const images = [
            '/images/new8.jpg',
            '/images/_5.jpg',
            '/images/new3.jpg',
            '/images/trial10.jpeg'
        ];
        const imagesMobile = [
            '/images/trial2.jpeg',
            '/images/trial7.jpeg',
            '/images/phone4.jpeg',
            '/images/trial8.jpeg'
        ];

        const isMobile = () => window.innerWidth <= 720;


        const selectedImages = isMobile() ? imagesMobile : images;

        if (HomeContainer) {
            HomeContainer.style.backgroundImage = `url(${selectedImages[currentIndex]})`;
            slogan.textContent = "Where every slice tells a story with sweetness";
        }

        const changeImage = () => {
            currentIndex = (currentIndex + 1) % selectedImages.length;
            if (HomeContainer) {
                HomeContainer.style.backgroundImage = `url(${selectedImages[currentIndex]})`;
                HomeContainer.style.transition = 'background-image 1s ease-in-out';
            }


            if (currentIndex === 0) {
                slogan.textContent = "Where every slice tells a story with sweetness";
            } else if (currentIndex === 1) {
                slogan.textContent = "One Bite, Pure Delight...Dive Into a DONUT!";
            } else if (currentIndex === 2) {
                slogan.textContent = "And there's a lot more...so dive right in!";
            } else if (currentIndex === 3) {
                slogan.textContent = "All you need is love & these little tastes of heaven";
            }
        };

        const intervalID = setInterval(changeImage, 3000);
        const dash = document.getElementById("dash")
        const cross = document.getElementById("cross")
        const sidebar = document.getElementById("side-bar")

        if (dash && cross && sidebar) {
            dash.addEventListener('click', () => {
                sidebar.classList.toggle("active")
            })
            cross.addEventListener('click', () => {
                sidebar.classList.remove("active")
            })
        }
        return () => {
            clearInterval(intervalID);

            if (dash) dash.removeEventListener('click', () => { })
            if (cross) cross.removeEventListener('click', () => { })
        };
    }, []);



    return (
        <>
            <div id="side-bar">
                <div id="side-bar-header">
                    <header id="side-head">MAGICPLATE</header>
                    <img src="/images/letter-x.png" id="cross"></img>
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
                    <img src="/images/menu-bar.png" id="menu-bar"></img>
                </div>
                <div className="company" id="company">
                    <header className="company-name" id="company-name">MAGICPLATE</header>
                </div>
                <div className="content-box" id="content-box-home">
                    <ul className="nav-content" id="nav-content">
                        <Link className="content-list" to="/"><li className="content" id="content">HOME</li></Link>
                        <Link className="content-list" to="/about"><li className="content" id="content">ABOUT</li></Link>
                        <Link className="content-list" to="/contact"><li className="content" id="content">CONTACT</li></Link>
                        {isLoggedIn ? (
                            <div id="user-icons">
                                <img id="users" src="/images/user (1).png"></img>
                            </div>
                        ) : (
                            <Link className="content-list" to="/signup"><li className="content">SIGN UP</li></Link>
                        )}

                    </ul>
                </div>
            </nav>
            <div id="Body-container">
                <div id="Big-Box">
                    <div id="Center-Content">
                        <div id="magicplate">
                            <header id="Company-header">MAGICPLATE</header>
                        </div>
                        <div id="slogan">
                            <p id="slogan-name"></p>
                        </div>
                        <div id="menu">
                            <Link to="/menu"><button id="menu-button">View Menu</button></Link>
                        </div>
                    </div>
                </div>
            </div>
            <div id="featured-menu">
                <div id="featured-header">
                    <header id="featured-head">FEATURED MENU</header>
                </div>
                <div id="featured-slogan">
                    <header id="featured-line">Serving our best...A feast for your senses!</header>
                </div>
                <div id="menu-images">
                    <div id="doughnut-images">
                        <div id="images-doughnut">
                            <img id="doughnut" src="/images/Feature-3.png"></img>
                        </div>
                        <div id="doughnuts-header">
                            <header id="doughnuts-head">Doughnuts</header>
                        </div>
                    </div>
                    <div id="truffle-images">
                        <div id="images-truffle">
                            <img id="truffle" src="/images/Feature-2.png"></img>
                        </div>
                        <div id="truffle-header">
                            <header id="truffle-head-1">Chocolate Truffle Pastry</header>
                        </div>
                    </div>
                    <div id="macrons-images">
                        <div id="images-macrons">
                            <img id="macrons-1" src="/images/Feature-4.png"></img>
                        </div>
                        <div id="macrons-header-home">
                            <header id="macrons-head-1">Macarons</header>
                        </div>
                    </div>
                    <div id="cookies-images">
                        <div id="images-cookies">
                            <img id="cookies-1" src="/images/Feature-1.png"></img>
                        </div>
                        <div id="cookies-header-home">
                            <header id="cookies-head-1">Butter Chocolate Cookies</header>
                        </div>
                    </div>
                </div>
            </div>
            <div id="Outer-Box">
                <div id="About-box">
                    <div id="header-box">
                        <header id='head-box'>OUR STORY</header>
                    </div>
                    <div id='story-box'>
                        <p id="box-story">
                            MagicPlate is a locally female owned patisserie. Our menu boasts a variety of delectable treats, including hand-decorated doughnuts, flavorful coffees, and authentic French Quarter-style beignets.
                            Their vision has blossomed into a thriving business that now extends its offerings beyond doughnuts and beignets to include hand tossed pizzas and milkshakes. Giving guests the best of both worlds, sweet and savory. For a touch of couture in every bite, choose MagicPlate. Life is Better Couture!
                        </p>
                    </div>
                </div>
                <div id="Story-image-box"></div>
            </div>
            <div id="contact-us-box">
                <div id="contact-us-header">
                    <header id="contact-header">CONTACT US</header>
                </div>
                <div id="Info-Box">
                    <div id="Contact-Info">
                        <div id="Phone-Email">
                            <img src="/images/contact-us.png" id="contact-us-icon"></img>
                        </div>
                        <div id="Mobile-No-info">
                            <header id="Mobile-No-Header">Mobile No.: +91999999999</header>
                        </div>
                        <div id="Email-Id-Info">
                            <header id="Email-Id-Header">Email Id.: magicplate@gmail.com</header>
                        </div>
                        <div id="Address-Info">
                            <header id="Address-Info-Header">Address: Serene Meadows,<br />Gangapur Road , Nashik</header>
                        </div>
                    </div>
                    <div id="Social-Media">
                        <div id="Platforms">
                            <div id="Platforms-slogan">
                                <header id="head-platform">Find us on various social <br /> media platforms</header>
                            </div>
                            <div id="social-media-icons">
                                <img src="/images/social-media.png" id="icon-media"></img>
                            </div>
                        </div>
                        <div id="Instagram-media">
                            <div id="insta-icon">
                                <img src="/images/instagram (1).png" id="icon-insta"></img>
                            </div>
                            <div id="insta-header">
                                <header id="insta-head">@magicplate</header>
                            </div>
                        </div>
                        <div id="Facebook-media">
                            <div id="facebook-icon">
                                <img src="/images/facebook (1).png" id="icon-fb"></img>
                            </div>
                            <div id="fb-header">
                                <header id="fb-head">@magicplate</header>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Container;