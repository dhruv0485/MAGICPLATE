import React, { useState, useEffect } from "react";
import '../../css/Ordercart.css';
import { ShoppingBag, Mail, User, Home, Phone, MapPin, CreditCard, Wallet, BanknoteIcon, Tag } from "lucide-react";

const OTPVerification = ({ email, orderDetails, onVerify, onClose }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    setError('');

    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const sendOTP = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://192.168.1.8:5000/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setSuccess('OTP sent successfully!');
      setResendCooldown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://192.168.1.8:5000/api/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setSuccess('New OTP sent successfully!');
      setResendCooldown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
const verifyOTP = async () => {
  const otpValue = otp.join('');
  if (otpValue.length !== 6) {
    setError('Please enter complete OTP');
    return;
  }

  try {
    setLoading(true);
    setError('');
    
    
    const response = await fetch('http://192.168.1.8:5000/api/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email,
        otp: otpValue,
        orderDetails 
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify OTP');
    }

    setSuccess('OTP verified successfully!');
    setTimeout(() => {
      onVerify(otpValue, data.orderId); 
    }, 1000);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    sendOTP();
  }, []);

  return (
    <div className="otp-container show">
      <h2 className="otp-title">Enter Verification Code</h2>
      <p className="otp-subtitle">We've sent an OTP to {email}</p>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="otp-input-container">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={digit}
            className="otp-input"
            onChange={e => handleChange(e.target, index)}
            onFocus={e => e.target.select()}
          />
        ))}
      </div>

      <button 
        className="verify-button" 
        onClick={verifyOTP}
        disabled={loading}
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>

      <p className="resend-text">
        Didn't receive the code? 
        <button
          className={`resend-link ${resendCooldown > 0 ? 'disabled' : ''}`}
          onClick={handleResendOTP}
          disabled={resendCooldown > 0 || loading}
        >
          {resendCooldown > 0 
            ? `Resend in ${resendCooldown}s` 
            : 'Resend OTP'}
        </button>
      </p>
    </div>
  );
};

function OrderCart() {
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    contactNumber: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: ''
  });
  const [orderStatus, setOrderStatus] = useState('');

  useEffect(() => {
    const storedCart = sessionStorage.getItem('cartItems');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'email') {
      setEmail(value);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const deliveryCharge = 25;
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + deliveryCharge - (discountApplied ? 50 : 0);
  };

  const handleApplyCoupon = () => {
    setDiscountApplied(true);
  };

  const validateForm = () => {
    const requiredFields = ['fullName', 'email', 'address', 'contactNumber', 'city', 'state', 'pincode'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    if (!formData.paymentMethod) {
      alert('Please select a payment method');
      return false;
    }
    return true;
  };

  const handleProceedToPay = () => {
    if (validateForm()) {
      setShowOtp(true);
      document.getElementById('Left-Bar').classList.add('blur-background');
      document.getElementById('Right-Bar').classList.add('blur-background');
    }
  };

  const handlePaymentMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: method
    }));
  };

  const handleVerifyOtp = async (otpValue) => {
    try {
      setOrderStatus('Processing order...');
      
      const orderDetails = {
        customerDetails: formData,
        cartItems,
        subtotal: calculateSubtotal(),
        deliveryCharge,
        discount: discountApplied ? 50 : 0,
        total: calculateTotal()
      };
  
      const response = await fetch('http://192.168.1.8:5000/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          otp: otpValue,
          orderDetails
        }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }
  
      setOrderStatus('Order placed successfully!');
      sessionStorage.removeItem('cartItems');
      setCartItems([]);
      
      setShowOtp(false);
      document.getElementById('Left-Bar').classList.remove('blur-background');
      document.getElementById('Right-Bar').classList.remove('blur-background');
  
      alert(`Order placed successfully! Your order ID is: ${data.orderId}\nA receipt has been sent to your email.`);
    } catch (error) {
      setOrderStatus('Failed to place order. Please try again.');
      console.error('Order processing error:', error);
    }
  };

  return (
    <>
      <div id="Left-Bar">
        <div className="form-container">
          <h2 className="section-title">Customer Details</h2>
          <div className="customer-form">
            <div className="form-group">
              <label className="form-label">
                <User size={18} />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <Mail size={18} />
                <span>Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <Home size={18} />
                <span>Address</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your address"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <Phone size={18} />
                <span>Contact Number</span>
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="Enter your contact number"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <MapPin size={18} />
                <span>City</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter your city"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <MapPin size={18} />
                <span>State</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Enter your state"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <MapPin size={18} />
                <span>Pincode</span>
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="Enter your pincode"
                className="form-input"
              />
            </div>
          </div>

          <div className="payment-section">
            <h3 className="section-title">Payment Method</h3>
            <div className="payment-options">
              <div className="payment-card">
                <label className="payment-label">
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="payment-radio"
                    onChange={() => handlePaymentMethodChange('card')}
                    checked={formData.paymentMethod === 'card'}
                  />
                  <CreditCard size={20} />
                  <span>Card Payment</span>
                </label>
              </div>
              <div className="payment-card">
                <label className="payment-label">
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="payment-radio"
                    onChange={() => handlePaymentMethodChange('upi')}
                    checked={formData.paymentMethod === 'upi'}
                  />
                  <Wallet size={20} />
                  <span>UPI Payment</span>
                </label>
              </div>
              <div className="payment-card">
                <label className="payment-label">
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="payment-radio"
                    onChange={() => handlePaymentMethodChange('cod')}
                    checked={formData.paymentMethod === 'cod'}
                  />
                  <BanknoteIcon size={20} />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="Right-Bar">
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="cart-items-1">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-item-1">
                <div className="item-image">
                  <img
                    src={`http://192.168.1.8:3000/uploads/${item.image}`}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.png';
                    }}
                  />
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">₹{item.price}</p>
                  <p className="item-quantity">Quantity: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="coupon-section">
            <div className="coupon-input">
              <Tag size={18} />
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="coupon-input-field"
              />
              <button 
                onClick={handleApplyCoupon}
                className="coupon-button"
                disabled={!couponCode || discountApplied}
              >
                {discountApplied ? 'Applied' : 'Apply'}
              </button>
            </div>
            {discountApplied && (
              <p className="coupon-success">Coupon applied successfully!</p>
            )}
          </div>

          <div className="price-summary">
            <div className="price-row">
              <span>Subtotal</span>
              <span>₹{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Delivery Charge</span>
              <span>₹{deliveryCharge.toFixed(2)}</span>
            </div>
            {discountApplied && (
              <div className="price-row discount">
                <span>Discount Applied</span>
                <span>-₹50.00</span>
              </div>
            )}
            <div className="price-row total">
              <span>Total Amount</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <button
            className="proceed-to-pay"
            onClick={handleProceedToPay}
            disabled={cartItems.length === 0}
          >
            <ShoppingBag size={18} />
            <span>Proceed to Pay</span>
          </button>
        </div>
      </div>

      {showOtp && (
        <OTPVerification 
          email={email}
          orderDetails={{
            customerDetails: formData,
            cartItems,
            subtotal: calculateSubtotal(),
            deliveryCharge,
            discount: discountApplied ? 50 : 0,
            total: calculateTotal()
          }}
          onVerify={handleVerifyOtp}
          onClose={() => {
            setShowOtp(false);
            document.getElementById('Left-Bar').classList.remove('blur-background');
            document.getElementById('Right-Bar').classList.remove('blur-background');
          }}
        />
      )}

      {orderStatus && (
        <div className="order-status-overlay">
          <div className="order-status-message">
            {orderStatus}
          </div>
        </div>
      )}
    </>
  );
}

export default OrderCart;