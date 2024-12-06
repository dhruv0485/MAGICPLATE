import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, X } from 'lucide-react';
import '../../css/menu.css';

function Menu() {
    const [cookies, setCookies] = useState([]);
    const [pastries, setPastries] = useState([]);
    const [cakes, setCakes] = useState([]);
    const [macrons, setMacrons] = useState([]);
    const [donuts, setDonuts] = useState([]);
    const [imageErrors, setImageErrors] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showOrderCard, setShowOrderCard] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showPopUp, setShowPopUp] = useState(false);
    const [quantities, setQuantities] = useState({});
    const [isCartVisible, setIsCartVisible] = useState(false);

    useEffect(() => {
        const fetchData = async (endpoint, setterFunction) => {
            try {
                const response = await fetch(`http://192.168.1.8:3000/api/${endpoint}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setterFunction(data);
            } catch (error) {
                console.error(`Error fetching ${endpoint}:`, error);
            }
        };
        
        const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
            document.getElementById('content-box-menu').style.right = '3%';
        }

        fetchData('cookies', setCookies);
        fetchData('pastries', setPastries);
        fetchData('cakes', setCakes);
        fetchData('macrons', setMacrons);
        fetchData('donuts', setDonuts);

        const handleClickOutside = (event) => {
            const popup = document.getElementById('pop-up-user');
            const userIcon = document.getElementById('user-icons-1');
            
            if (popup && !popup.contains(event.target) && !userIcon.contains(event.target)) {
                setShowPopUp(false);
                popup.style.display = 'none';
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleUserIconClick = () => {
        const popup = document.getElementById('pop-up-user');
        setShowPopUp(!showPopUp);
        popup.style.display = showPopUp ? 'none' : 'block';
    };

    const handleAddClick = (item, category) => {
        const itemKey = `${category}-${item._id}`;
        setQuantities(prev => ({
            ...prev,
            [itemKey]: 1
        }));
        setIsCartVisible(true);
    };

    const handleIncrement = (itemKey) => {
        setQuantities(prev => ({
            ...prev,
            [itemKey]: (prev[itemKey] || 0) + 1
        }));
    };

    const handleDecrement = (itemKey) => {
        setQuantities(prev => {
            const newQuantity = (prev[itemKey] || 0) - 1;
            if (newQuantity <= 0) {
                const newQuantities = { ...prev };
                delete newQuantities[itemKey];
                return newQuantities;
            }
            return {
                ...prev,
                [itemKey]: newQuantity
            };
        });
    };

    const handleInfoClick = (item, category) => {
        setSelectedProduct({ ...item, category });
        setShowOrderCard(true);
    };

    const closeOrderCard = () => {
        setShowOrderCard(false);
        setSelectedProduct(null);
    };

    const calculateTotalItems = () => {
        return Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
    };
    
    const toggleCart = () => {
        setIsCartVisible(!isCartVisible);
    };

    const handleImageError = (id, category) => {
        console.error(`Error loading image for ${category} ${id}`);
        setImageErrors(prev => ({ ...prev, [id]: true }));
    };

    const renderQuantityControls = (itemKey) => {
        const quantity = quantities[itemKey];
        if (!quantity) {
            return (
                <button 
                    className="add-button"
                    onClick={() => handleAddClick(itemKey)}
                >
                    ADD +
                </button>
            );
        }
        return (
            <div className="quantity-wrapper">
                <button 
                    className="quantity-btn"
                    onClick={() => handleDecrement(itemKey)}
                >
                    -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                    className="quantity-btn"
                    onClick={() => handleIncrement(itemKey)}
                >
                    +
                </button>
            </div>
        );
    };

    const renderItem = (item, index, category) => {
        const itemKey = `${category}-${item._id}`;
        return (
            <div id={`${category}-menu-${index + 1}`} key={item._id} className={`${category}-item`}>
                <div id={`${category}-image-${index + 1}`} className={`${category}-image`}>
                    {imageErrors[item._id] ? (
                        <div className="image-placeholder">
                            Image not available
                        </div>
                    ) : (
                        <img 
                            src={`http://192.168.1.8:3000/uploads/${item.image}`}
                            alt={item.name}
                            onError={() => handleImageError(item._id, category)}
                        />
                    )}
                </div>
                <div id="veg-info-bar">
                    <div id="veg-icons">
                        <img id="icons-veg" src="/images/veg.jpg" alt="Vegetarian" />
                    </div>
                    <div 
                        id={`info-icons-${category}`} 
                        onClick={() => handleInfoClick(item, category)}
                        style={{ cursor: 'pointer' }}
                    >
                        <img id="icons-info" src="/images/info.png" alt="Info" />
                    </div>
                </div>
                <div id={`${category}-menu-header-${index + 1}`} className={`${category}-header`}>
                    <header>{item.name}</header>
                </div>
                <div id={`price-menu-button-${category}`}>
                    <div id={`price-${category}`}>
                        <header id={`${category}-price`}>₹ {item.price}</header>
                    </div>
                    <div id={`${category}-menu-button-${index + 1}`} className={`${category}-button`}>
                        {quantities[itemKey] ? (
                            <div className="quantity-controls">
                                <button onClick={() => handleDecrement(itemKey)} className="quantity-control-btn">-</button>
                                <span className="quantity-display">{quantities[itemKey]}</span>
                                <button onClick={() => handleIncrement(itemKey)} className="quantity-control-btn">+</button>
                            </div>
                        ) : (
                            <button onClick={() => handleAddClick(item, category)}>ADD +</button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderRows = (items, category) => {
        const rows = [];
        for (let i = 0; i < items.length; i += 2) {
            rows.push(
                <div className={`${category}-row`} key={i}>
                    {renderItem(items[i], i, category)}
                    {items[i + 1] && renderItem(items[i + 1], i + 1, category)}
                </div>
            );
        }
        return rows;
    };

    const calculateTotal = () => {
        return Object.entries(quantities).reduce((total, [itemKey, quantity]) => {
            const [category, id] = itemKey.split('-');
            let product;
            switch(category) {
                case 'cookies':
                    product = cookies.find(item => item._id === id);
                    break;
                case 'pastries':
                    product = pastries.find(item => item._id === id);
                    break;
                case 'cakes':
                    product = cakes.find(item => item._id === id);
                    break;
                case 'macrons':
                    product = macrons.find(item => item._id === id);
                    break;
                case 'donuts':
                    product = donuts.find(item => item._id === id);
                    break;
                default:
                    product = null;
            }
            return total + (product?.price || 0) * quantity;
        }, 0);
    };

    const getProductDetails = (itemKey) => {
        const [category, id] = itemKey.split('-');
        let product;
        switch(category) {
            case 'cookies':
                product = cookies.find(item => item._id === id);
                break;
            case 'pastries':
                product = pastries.find(item => item._id === id);
                break;
            case 'cakes':
                product = cakes.find(item => item._id === id);
                break;
            case 'macrons':
                product = macrons.find(item => item._id === id);
                break;
            case 'donuts':
                product = donuts.find(item => item._id === id);
                break;
            default:
                product = null;
        }
        return product;
    };

    // Add handleCheckout function
    const handleCheckout = () => {
        const cartItems = Object.entries(quantities).map(([itemKey, quantity]) => {
            const product = getProductDetails(itemKey);
            return {
                ...product,
                quantity
            };
        });
        sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
    };

    return (
        <>
            <nav id="Content-bar">
                <div id="dash">
                    <img src="/images/menu-bar.png" id="menu-bar" alt="Menu Bar" />
                </div>
                <div className="company" id="company">
                    <header className="company-name" id="company-name">MAGICPLATE</header>
                </div>
                <div className="content-box" id="content-box-menu">
                    <ul className="nav-content" id="nav-content">
                        <Link className="content-list" to="/"><li className="content">HOME</li></Link>
                        <Link className="content-list" to="/about"><li className="content">ABOUT</li></Link>
                        <Link className="content-list" to="/contact"><li className="content">CONTACT</li></Link>
                        {isLoggedIn ? (
                            <div id="user-icons-1" onClick={handleUserIconClick}>
                                <img id="users-1" src="/images/user (1).png" alt="User Icon" />
                            </div>
                        ) : (
                            <Link className="content-list" to="/signup"><li className="content">SIGN UP</li></Link>
                        )}
                    </ul>
                </div>
            </nav>

            <div id="Upper-Box">
                <header id="Upper-Box-Slogan">Discover our products online</header>
            </div>

            <div id="Body-menu-content">
                <div id="menu-side-bar">
                    <div id="menu-side-cookies">
                        <header id="menu-cookies">COOKIES</header>
                    </div>
                    <div id="menu-side-pastries">
                        <header id="menu-pastries">PASTRIES</header>
                    </div>
                    <div id="menu-side-macaroons">
                        <header id="menu-macaroons">MACAROONS</header>
                    </div>
                    <div id="menu-side-cakes">
                        <header id="menu-cakes">CAKES</header>
                    </div>
                    <div id="menu-side-donuts">
                        <header id="menu-donuts">DONUTS</header>
                    </div>
                </div>

                <div id="menu-body">
                    <div id="cookies-category">
                        <div id="cookies-header">
                            <header id="header-cookies">COOKIES</header>
                        </div>
                        <div className="cookies-grid">
                            {renderRows(cookies, 'cookies')}
                        </div>
                    </div>

                    <div id="pastries-category">
                        <div id="pastries-header">
                            <header id="header-pastries">PASTRIES</header>
                        </div>
                        <div className="pastries-grid">
                            {renderRows(pastries, 'pastries')}
                        </div>
                    </div>

                    <div id="macrons-category">
                        <div id="macrons-header">
                            <header id="header-macrons">MACAROONS</header>
                        </div>
                        <div className="macrons-grid">
                            {renderRows(macrons, 'macrons')}
                        </div>
                    </div>

                    <div id="cakes-category">
                        <div id="cakes-header">
                            <header id="header-cakes">CAKES</header>
                        </div>
                        <div className="cakes-grid">
                            {renderRows(cakes, 'cakes')}
                        </div>
                    </div>

                    <div id="donuts-category">
                        <div id="donuts-header">
                            <header id="header-donuts">DOUGHNUTS</header>
                        </div>
                        <div className="donuts-grid">
                            {renderRows(donuts, 'donuts')}
                        </div>
                    </div>
                </div>
            </div>

            {showOrderCard && (
                <div id="Cards-body-menu" className="overlay">
                    <div id="menu-cards">
                        <button className="close-button" onClick={closeOrderCard}>×</button>
                        <div id="menu-cards-image">
                            {selectedProduct && (
                                <img 
                                    src={`http://192.168.1.8:3000/uploads/${selectedProduct.image}`}
                                    alt={selectedProduct.name}
                                    onError={(e) => {
                                        e.target.src = '/images/placeholder.png';
                                    }}
                                />
                            )}
                        </div>
                        <div id="menu-cards-content">
                            {selectedProduct && (
                                <>
                                    <div id="menu-cards-name">
                                        <h2>{selectedProduct.name}</h2>
                                    </div>
                                    <div id="menu-cards-description">
                                        <p>{selectedProduct.description}</p>
                                    </div>
                                    <div id="menu-cards-price">
                                        <h3>₹ {selectedProduct.price}</h3>
                                    </div>
                                    <div id="menu-cards-actions">
                                        <button className="add-to-cart-button">Add to Cart</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div id="pop-up-user">
                <div id="User-Hello">
                    <header id="Hello-User">Hello User!</header>
                </div>
                <div id="personal-details">
                    <div id="personal-icon">
                        <img id="person-icons" src="/images/user (1).png" alt="Personal Details" />
                    </div>
                    <div id="personal-slogan">
                        <header id="slogan">Personal Details</header>
                    </div>
                </div>
                <div id="order-details">
                    <div id="orders-icon">
                        <img id="order-icons" src="/images/choices.png" alt="Order History" />
                    </div>
                    <div id="orders-slogan">
                        <header id="slogan">Order History</header>
                    </div>
                </div>
                <div id="wish-list-details">
                    <div id="wishlist-icon">
                        <img id="icon-wishlist" src="/images/wishlist.png" alt="Wishlist" />
                    </div>
                    <div id="wishlist-slogan">
                        <header id="slogan">Wish-list</header>
                    </div>
                </div>
                <div id="buy-again-details">
                    <div id="buyagain-icon">
                        <img id="icon-buyagain" src="/images/repeat-order.png" alt="Buy Again" />
                    </div>
                    <div id="buyagain-slogan">
                        <header id="slogan">Buy-Again</header>
                    </div>
                </div>
                <div id="switch-account-details">
                    <div id="switchacc-icon">
                        <img id="icon-switchacc" src="/images/user-account.png" alt="Switch Account" />
                    </div>
                    <div id="switchacc-slogan">
                        <header id="slogan">Switch Account</header>
                    </div>
                </div>
                <div id="logout-details">
                    <div id="logout-icon">
                        <img id="icon-logout" src="/images/power-button.png" alt="Logout" />
                    </div>
                    <div id="logout-slogan">
                        <header id="slogan">
                            <button 
                                onClick={() => {
                                    sessionStorage.removeItem('isLoggedIn');
                                    sessionStorage.removeItem('userId');
                                    setIsLoggedIn(false);
                                    window.location.reload();
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'inherit',
                                    font: 'inherit',
                                    cursor: 'pointer',
                                    padding: 0
                                }}
                            >
                                Logout
                            </button>
                        </header>
                    </div>
                </div>
            </div>
            {!isCartVisible && (
                <button className="cart-toggle" onClick={toggleCart}>
                    <ShoppingCart size={24} color="white" />
                    {calculateTotalItems() > 0 && (
                        <span className="cart-badge">{calculateTotalItems()}</span>
                    )}
                </button>
            )}

            {/* Cart Sidebar */}
            {isCartVisible && (
                <div id="cart-side-bar" className="cart-sidebar">
                    <button className="cart-close" onClick={() => setIsCartVisible(false)}>
                        <X size={24} />
                    </button>
                    <h2 className="cart-title">YOUR CART</h2>
                    
                    {Object.keys(quantities).length === 0 ? (
                        <p className="cart-empty">Your cart is empty</p>
                    ) : (
                        <>
                            <div className="cart-items">
                                {Object.entries(quantities).map(([itemKey, quantity]) => {
                                    const product = getProductDetails(itemKey);
                                    if (!product) return null;

                                    return (
                                        <div key={itemKey} className="cart-item">
                                            <div className="cart-item-details">
                                                <h3 className="cart-item-name">{product.name}</h3>
                                                <p className="cart-item-price">₹{product.price}</p>
                                            </div>
                                            <div className="cart-item-controls">
                                                <button 
                                                    onClick={() => handleDecrement(itemKey)}
                                                    className="cart-quantity-btn"
                                                >
                                                    -
                                                </button>
                                                <span className="cart-quantity">{quantity}</span>
                                                <button 
                                                    onClick={() => handleIncrement(itemKey)}
                                                    className="cart-quantity-btn"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="cart-footer">
                                <div className="cart-total">
                                    <span>Total:</span>
                                    <span>₹{calculateTotal()}</span>
                                </div>
                                <Link to="/order"><button 
                                    className="cart-checkout"
                                    onClick={handleCheckout}
                                >
                                    Checkout
                                </button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};


export default Menu;