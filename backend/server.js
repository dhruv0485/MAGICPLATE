require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'build')));

const email = process.env.EMAIL;
const emailPassword = process.env.EMAIL_PASSWORD;
const mongodbPassword = process.env.MONGODB_PASSWORD;

mongoose.connect(`${mongodbPassword}/MagicPlate`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("MongoDB is successfully connected");
})
.catch((error) => {
    console.log("Error connecting MongoDB", error);
    process.exit(1);
});

// Schemas
const newLoginSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Email: { type: String, required: true },
    Password: { type: String, required: true }
});

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } 
});

// Add index explicitly
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

// Models
const OTP = mongoose.model('OTP', otpSchema);
const newLoginCustomer = mongoose.model('newLoginCustomer', newLoginSchema);


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: `${email}`,
        pass: `${emailPassword}`
    }
});


function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateOrderId() {
    return 'MP' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 5).toUpperCase();
}

function generateReceiptHTML(orderData) {
    const itemsHTML = orderData.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹${item.price}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹${item.price * item.quantity}</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb;">MagicPlate</h1>
                <h2>Order Receipt</h2>
            </div>

            <div style="margin-bottom: 30px;">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div style="margin-bottom: 30px;">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> ${orderData.customerDetails.fullName}</p>
                <p><strong>Email:</strong> ${orderData.customerDetails.email}</p>
                <p><strong>Address:</strong> ${orderData.customerDetails.address}</p>
                <p><strong>Contact:</strong> ${orderData.customerDetails.contactNumber}</p>
                <p><strong>City:</strong> ${orderData.customerDetails.city}</p>
                <p><strong>State:</strong> ${orderData.customerDetails.state}</p>
                <p><strong>Pincode:</strong> ${orderData.customerDetails.pincode}</p>
            </div>

            <div style="margin-bottom: 30px;">
                <h3>Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="padding: 10px; text-align: left;">Item</th>
                            <th style="padding: 10px; text-align: left;">Price</th>
                            <th style="padding: 10px; text-align: left;">Quantity</th>
                            <th style="padding: 10px; text-align: left;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
            </div>

            <div style="margin-top: 20px; border-top: 2px solid #ddd; padding-top: 20px;">
                <p style="text-align: right;"><strong>Subtotal:</strong> ₹${orderData.subtotal}</p>
                <p style="text-align: right;"><strong>Delivery Charge:</strong> ₹${orderData.deliveryCharge}</p>
                ${orderData.discount ? `<p style="text-align: right;"><strong>Discount:</strong> -₹${orderData.discount}</p>` : ''}
                <p style="text-align: right; font-size: 1.2em;"><strong>Total Amount:</strong> ₹${orderData.total}</p>
            </div>

            <div style="margin-top: 30px; text-align: center; color: #666;">
                <p>Thank you for ordering with MagicPlate!</p>
                <p>For any queries, please contact us at support@magicplate.com</p>
            </div>
        </div>
    `;
}


app.post('/newLoginCustomer', async (req, res) => {
    console.log("Received data:", req.body);
    try {
        const newLogin = new newLoginCustomer(req.body);
        await newLogin.save();
        console.log("Data saved:", newLogin);
        res.status(201).json({
            message: "Customer login was successful",
            data: newLogin
        });
    } catch (error) {
        res.status(500).json({
            message: "Customer login was unsuccessful",
            error: error.message
        });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login request received:', { email, password });
    try {
        const user = await newLoginCustomer.findOne({ Email: email });
        console.log('User found in database:', user);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        console.log('Comparing passwords:', { enteredPassword: password, storedPassword: user.Password });
        if (user.Password != password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        return res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
});

app.post('/api/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const otp = generateOTP();
        await OTP.deleteMany({ email });

        const newOTP = new OTP({
            email,
            otp,
            createdAt: new Date()
        });

        await newOTP.save();
        console.log('OTP saved successfully:', { email, otp });

        const mailOptions = {
            from: `${email}`,
            to: email,
            subject: 'Your MagicPlate Order Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">MagicPlate Order Verification</h2>
                    <p>Your OTP for order verification is:</p>
                    <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 5px; margin: 20px 0;">${otp}</h1>
                    <p>This OTP will expire in 5 minutes.</p>
                    <p>If you didn't request this OTP, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Error in send-otp:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    try {
        const { email, otp, orderDetails } = req.body;

        if (!email || !otp) {
            console.log('Missing required fields:', { email: !!email, otp: !!otp });
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        if (!orderDetails || !orderDetails.cartItems || !orderDetails.customerDetails) {
            console.log('Invalid order details:', orderDetails);
            return res.status(400).json({ error: 'Invalid order details provided' });
        }

        console.log('Attempting OTP verification for:', email);

        const otpDoc = await OTP.findOne({ email, otp });
        if (!otpDoc) {
            console.log('Invalid OTP for email:', email);
            return res.status(400).json({ error: 'Invalid OTP or OTP expired' });
        }

        const orderId = generateOrderId();
        console.log('Generated order ID:', orderId);

        const receiptData = {
            orderId,
            customerDetails: {
                fullName: orderDetails.customerDetails.fullName || 'N/A',
                email: orderDetails.customerDetails.email || email,
                address: orderDetails.customerDetails.address || 'N/A',
                contactNumber: orderDetails.customerDetails.contactNumber || 'N/A',
                city: orderDetails.customerDetails.city || 'N/A',
                state: orderDetails.customerDetails.state || 'N/A',
                pincode: orderDetails.customerDetails.pincode || 'N/A'
            },
            items: orderDetails.cartItems.map(item => ({
                name: item.name || 'Unknown Item',
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1
            })),
            subtotal: parseFloat(orderDetails.subtotal) || 0,
            deliveryCharge: parseFloat(orderDetails.deliveryCharge) || 0,
            discount: parseFloat(orderDetails.discount) || 0,
            total: parseFloat(orderDetails.total) || 0
        };

        console.log('Prepared receipt data:', receiptData);

        const receiptHTML = generateReceiptHTML(receiptData);
        console.log('Generated receipt HTML length:', receiptHTML.length);

        const mailOptions = {
            from: `${email}`,
            to: email,
            subject: `MagicPlate Order Confirmation - ${orderId}`,
            html: receiptHTML
        };

        try {
            console.log('Attempting to send receipt email to:', email);
            const info = await transporter.sendMail(mailOptions);
            console.log('Receipt email sent successfully:', info.messageId);
        } catch (emailError) {
            console.error('Error sending receipt email:', emailError);
        }

        await OTP.deleteOne({ email });
        console.log('Deleted OTP document for:', email);

        res.json({
            message: 'OTP verified successfully and receipt sent',
            orderId,
            success: true
        });

    } catch (error) {
        console.error('Error in OTP verification process:', error);
        res.status(500).json({
            error: 'Failed to process order',
            details: error.message,
            success: false
        });
    }
});

app.post('/api/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const existingOTP = await OTP.findOne({ email });
        if (existingOTP) {
            const timeDiff = Date.now() - existingOTP.createdAt.getTime();
            if (timeDiff < 60000) {
                return res.status(429).json({
                    error: 'Please wait 1 minute before requesting another OTP'
                });
            }
            await OTP.deleteOne({ email });
        }

        const otp = generateOTP();
        const newOTP = new OTP({
            email,
            otp,
            createdAt: new Date()
        });

        await newOTP.save();
        console.log('New OTP saved successfully:', { email, otp });

        const mailOptions = {
            from: `${email}`,
            to: email,
            subject: 'Your New MagicPlate Order Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">New MagicPlate Order Verification OTP</h2>
                    <p>Your new OTP for order verification is:</p>
                    <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 5px; margin: 20px 0;">${otp}</h1>
                    <p>This OTP will expire in 5 minutes.</p>
                    <p>If you didn't request this OTP, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'New OTP sent successfully' });

    } catch (error) {
        console.error('Error in resend-otp:', error);
        res.status(500).json({ error: 'Failed to resend OTP' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})