import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// --- STYLES ---
// By embedding the styles directly, we avoid issues with CSS file resolution.test
const Style = () => (
    <style>{`
        /* --- FONT DEFINITIONS --- */
        @font-face {
            font-family: 'Nitti-Bold';
            src: url('/src/assets/fonts/Nitti-Bold.woff') format('woff');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }

        @font-face {
            font-family: 'Nitti-Normal';
            src: url('/src/assets/fonts/Nitti-Normal.woff') format('woff');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }

        /* General Body and App Container Styles */
        body {
            margin: 0;
            font-family: 'Nitti-Normal', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background-color: #000000;
        }

        .app-container {
            min-height: 100vh;
            background-color: #000000;
            color: #e5e7eb; /* gray-200 */
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem;
            box-sizing: border-box;
        }

        /* Main Quote Card */
        .quote-card {
            background-color: #111827; /* gray-900 */
            box-shadow: 0 0 15px rgba(6, 182, 212, 0.1), 0 0 30px rgba(6, 182, 212, 0.1);
            border-radius: 0.75rem; /* rounded-xl */
            padding: 2rem;
            max-width: 56rem; /* Tailwind's max-w-4xl is 56rem */
            width: 100%;
            margin: 2rem 0;
            border: 1px solid #374151; /* gray-700 */
        }

        h1 {
            font-family: 'Nitti-Bold', sans-serif;
            font-size: 2.25rem;
            font-weight: 700;
            text-align: center;
            color: #67e8f9; /* cyan-300 */
            margin-bottom: 1.5rem;
        }

        h2 {
            font-family: 'Nitti-Bold', sans-serif;
            font-size: 1.5rem;
            font-weight: 600;
            color: #67e8f9; /* cyan-300 */
            margin-bottom: 1rem;
        }

        .user-id-text {
            font-size: 0.875rem;
            text-align: center;
            color: #9ca3af; /* gray-400 */
            margin-bottom: 1rem;
            word-break: break-all;
        }

        .user-id-text span {
            font-weight: 600;
            color: #22d3ee; /* cyan-400 */
        }

        /* Message Box */
        .message-box {
            background-color: rgba(22, 163, 74, 0.2); /* bg-cyan-900/50 */
            border: 1px solid #047857; /* border-cyan-700 */
            color: #a7f3d0; /* text-cyan-200 */
            padding: 0.75rem 1rem;
            border-radius: 0.25rem;
            margin-bottom: 1rem;
        }

        /* Generic Section Container */
        .section-container {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background-color: #1f2937; /* gray-800 */
            border-radius: 0.5rem;
            box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
            border: 1px solid #374151; /* gray-700 */
        }


        /* --- Buttons --- */
        .btn {
            font-family: 'Nitti-Bold', sans-serif;
            font-weight: 700;
            padding: 0.5rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            transition: all 0.3s ease-in-out;
            outline: none;
            border: none;
            cursor: pointer;
        }

        .btn:disabled {
            background-color: #374151; /* gray-700 */
            color: #9ca3af; /* gray-400 */
            cursor: not-allowed;
            transform: none;
        }

        .add-sample-btn {
            background-color: #22c55e; /* green-500 */
            color: white;
        }
        .add-sample-btn:hover:not(:disabled) {
            background-color: #16a34a; /* green-600 */
        }
        .add-sample-btn:focus:not(:disabled) {
            box-shadow: 0 0 0 2px #4ade80; /* ring-green-400 */
        }
        .sample-data-section {
            margin-bottom: 1.5rem;
            text-align: center;
        }
        .sample-data-section p {
            font-size: 0.875rem;
            color: #6b7280; /* gray-500 */
            margin-top: 0.5rem;
        }

        .add-to-cart-btn {
            margin-top: 1rem;
            background-color: #0891b2; /* cyan-600 */
            color: white;
            width: 100%;
        }
        .add-to-cart-btn:hover {
            background-color: #0e7490; /* cyan-700 */
        }
        .add-to-cart-btn:focus {
            box-shadow: 0 0 0 2px #06b6d4; /* ring-cyan-500 */
        }

        .get-quote-btn {
            background-color: #06b6d4; /* cyan-500 */
            color: #000000;
            padding: 0.75rem 2rem;
            font-size: 1.125rem;
            box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.2), 0 4px 6px -2px rgba(6, 182, 212, 0.1);
        }
        .get-quote-btn:hover {
            background-color: #0891b2; /* cyan-600 */
            transform: scale(1.05);
        }
        .get-quote-section {
            text-align: center;
        }

        .remove-btn {
            background-color: #ef4444; /* red-500 */
            color: white;
            padding: 0.5rem;
            border-radius: 9999px; /* full */
        }
        .remove-btn:hover {
            background-color: #dc2626; /* red-600 */
        }
        .remove-btn svg {
            height: 1.25rem;
            width: 1.25rem;
        }

        /* Date Selector */
        .date-selector {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            align-items: center;
        }
        .date-input-group {
            flex: 1;
            width: 100%;
        }
        .date-input-group label {
            display: block;
            color: #d1d5db; /* gray-300 */
            font-size: 0.875rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        .date-input-group input {
            appearance: none;
            border: 1px solid #4b5563; /* gray-600 */
            background-color: #374151; /* gray-700 */
            border-radius: 0.5rem;
            width: 100%;
            padding: 0.5rem 0.75rem;
            color: #e5e7eb; /* gray-200 */
            line-height: 1.5;
        }
        .date-input-group input:focus {
            outline: none;
            border-color: transparent;
            box-shadow: 0 0 0 2px #22d3ee; /* ring-cyan-400 */
        }
        .rental-days-display {
            flex-shrink: 0;
            text-align: center;
            margin-top: 1rem;
        }
        .rental-days-display p {
            font-size: 1rem;
            font-weight: 500;
            color: #d1d5db; /* gray-300 */
        }
        .rental-days-display span {
            font-weight: 600;
            color: #22d3ee; /* cyan-400 */
            font-size: 1.125rem;
        }

        /* Equipment Catalog */
        .equipment-catalog {
            margin-bottom: 2rem;
        }
        .loading-text {
            color: #9ca3af; /* gray-400 */
        }
        .equipment-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
        .equipment-card {
            background-color: #1f2937; /* gray-800 */
            padding: 1.25rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.3);
            border: 1px solid #374151; /* gray-700 */
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: all 0.3s ease-in-out;
        }
        .equipment-card:hover {
            box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
        }
        .equipment-card img {
            width: 100%;
            height: auto;
            border-radius: 0.375rem;
            margin-bottom: 0.75rem;
            object-fit: cover;
        }
        .equipment-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #f9fafb; /* gray-100 */
            margin-bottom: 0.5rem;
        }
        .equipment-card .description {
            font-size: 0.875rem;
            color: #9ca3af; /* gray-400 */
            margin-bottom: 0.5rem;
            min-height: 40px;
        }
        .equipment-card .price {
            font-size: 1.125rem;
            font-weight: 500;
            color: #22d3ee; /* cyan-400 */
        }
        .equipment-card .replacement-cost {
            font-size: 0.75rem;
            color: #6b7280; /* gray-500 */
            margin-top: 0.25rem;
        }
        .package-includes {
            margin-top: 0.5rem;
            font-size: 0.875rem;
            color: #d1d5db; /* gray-300 */
        }
        .package-includes p {
            font-weight: 600;
        }
        .package-includes ul {
            list-style: disc;
            list-style-position: inside;
            color: #9ca3af; /* gray-400 */
            padding-left: 0;
            margin-top: 0.25rem;
        }

        /* Cart */
        .cart-items-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .cart-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #111827; /* gray-900 */
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid #374151; /* gray-700 */
        }
        .cart-item-details {
            flex: 1;
        }
        .cart-item-details h4 {
            font-weight: 600;
            color: #f9fafb; /* gray-100 */
        }
        .cart-item-details p {
            font-size: 0.875rem;
            color: #9ca3af; /* gray-400 */
        }
        .cart-item-controls {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .cart-item-controls input {
            width: 4rem;
            padding: 0.5rem;
            border: 1px solid #4b5563; /* gray-600 */
            background-color: #374151; /* gray-700 */
            border-radius: 0.375rem;
            text-align: center;
            color: white;
        }
        .total-quote {
            text-align: right;
            font-size: 1.5rem;
            font-weight: 700;
            color: #67e8f9; /* cyan-300 */
            margin-top: 1rem;
        }

        /* Responsive Grid Layout */
        @media (min-width: 768px) {
            .date-selector {
                flex-direction: row;
            }
            .rental-days-display {
                text-align: left;
                margin-top: 0;
            }
            .equipment-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (min-width: 1024px) {
            .equipment-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
    `}</style>
);


// Ensure these global variables are available from the Canvas environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Firebase Config Placeholder
const firebaseConfig = {
    apiKey: "AIzaSyCxuJctuyOzqsqLPq_tUT6Yf9EIRjl-1qA",
    authDomain: "my-camera-rental-app.firebaseapp.com",
    projectId: "my-camera-rental-app",
    storageBucket: "my-camera-rental-app.firebasestorage.app",
    messagingSenderId: "96039301173",
    appId: "1:96039301173:web:6f434044fb95c8985ec17c",
    measurementId: "G-1C883VZPLV"
};

// Safety check for firebaseConfig
if (!firebaseConfig.projectId || !firebaseConfig.apiKey || !firebaseConfig.authDomain) {
    console.error("Firebase configuration is incomplete.");
}

// Utility function to format dates
const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
};

// Main App Component
const App = () => {
    // Firebase states
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState('loading...');
    const [isAuthReady, setIsAuthReady] = useState(false);

    // Application states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [equipmentList, setEquipmentList] = useState([]);
    const [cart, setCart] = useState([]);
    const [message, setMessage] = useState('');

    // Calculate rental days
    const rentalDays = startDate && endDate
        ? Math.max(0, (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1)
        : 0;

    // Initialize Firebase and handle authentication
    useEffect(() => {
        try {
            const firebaseApp = initializeApp(firebaseConfig);
            const firestoreDb = getFirestore(firebaseApp);
            const firebaseAuth = getAuth(firebaseApp);

            setDb(firestoreDb);
            setAuth(firebaseAuth);

            const unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsAuthReady(true);
                } else {
                    if (initialAuthToken) {
                        try {
                            await signInWithCustomToken(firebaseAuth, initialAuthToken);
                        } catch (error) {
                            console.error("Error signing in with custom token:", error);
                            setMessage(`Error signing in with token: ${error.message}`);
                            setIsAuthReady(true);
                        }
                    } else {
                         try {
                            const anonUser = await signInAnonymously(firebaseAuth);
                            setUserId(anonUser.user.uid);
                        } catch (error) {
                            console.error("Error signing in anonymously:", error);
                            setMessage(`Error signing in: ${error.message}. Ensure Anonymous Auth is enabled.`);
                        } finally {
                            setIsAuthReady(true);
                        }
                    }
                }
            });

            return () => unsubscribeAuth();
        } catch (error) {
            console.error("Error initializing Firebase:", error);
            setMessage(`Firebase init error: ${error.message}.`);
            setIsAuthReady(true);
        }
    }, []);

    // Fetch equipment data from Firestore
    useEffect(() => {
        if (db && isAuthReady && userId !== 'loading...') {
            const equipmentColPath = `artifacts/${appId}/public/data/equipment`;
            const equipmentColRef = collection(db, equipmentColPath);
            
            const unsubscribe = onSnapshot(equipmentColRef, (snapshot) => {
                const equipmentData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setEquipmentList(equipmentData);
            }, (error) => {
                console.error("Error fetching equipment:", error);
                setMessage(`Error fetching equipment: ${error.message}.`);
            });

            return () => unsubscribe();
        }
    }, [db, isAuthReady, appId, userId]);

    // --- Handlers ---
    const handleAddToCart = (item) => {
        const existingItemIndex = cart.findIndex(cartItem => cartItem.item.id === item.id);
        if (existingItemIndex > -1) {
            const updatedCart = [...cart];
            updatedCart[existingItemIndex].quantity += 1;
            setCart(updatedCart);
        } else {
            setCart([...cart, { item: item, quantity: 1 }]);
        }
        setMessage(`${item.name} added to cart.`);
    };

    const handleRemoveFromCart = (itemId) => {
        setCart(cart.filter(cartItem => cartItem.item.id !== itemId));
        setMessage('Item removed from cart.');
    };

    const handleUpdateCartQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            handleRemoveFromCart(itemId);
            return;
        }
        setCart(cart.map(cartItem =>
            cartItem.item.id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem
        ));
    };

    const handleGetQuote = () => {
        if (!startDate || !endDate) {
            setMessage('Please select both start and end dates.');
            return;
        }
        if (cart.length === 0) {
            setMessage('Your cart is empty. Add some equipment first!');
            return;
        }
        console.log("Generating Quote for:", { rentalDays, cart });
        setMessage('Quote generated! (Check console for data - PDF download functionality to be added)');
    };

    const calculateCartTotal = () => {
        return cart.reduce((total, cartItem) => {
            const itemCost = cartItem.item.baseRentalRatePerDay * rentalDays * cartItem.quantity;
            return total + itemCost;
        }, 0);
    };

    const addSampleEquipmentData = async () => {
        if (!db || !userId || !isAuthReady) {
            setMessage('Firebase not fully initialized. Please wait a moment.');
            return;
        }
        setMessage('Adding sample data...');
        try {
            const equipmentColRef = collection(db, `artifacts/${appId}/public/data/equipment`);
            const sampleItems = [
				{ name: "Sony Alpha a7S III", type: "Camera Body", description: "Full-frame mirrorless camera, excellent in low light.", baseRentalRatePerDay: 50, partNumber: "SNY-A7S3", replacementCost: 3500, availableQuantity: 5, serialNumbers: ["SN12345", "SN12346", "SN12347", "SN12348", "SN12349"], imageUrl: "https://placehold.co/100x70/30CED1/000000?text=A7SIII", isSubrented: false },
				{ name: "Canon EF 24-70mm f/2.8L II USM Lens", type: "Lens", description: "Versatile zoom lens for professional use.", baseRentalRatePerDay: 30, partNumber: "CAN-2470L", replacementCost: 1800, availableQuantity: 3, serialNumbers: ["LN001", "LN002", "LN003"], imageUrl: "https://placehold.co/100x70/30CED1/000000?text=24-70mm", isSubrented: false },
				{ name: "Basic Filmmaker Kit", type: "Package", description: "Includes a camera, lens, tripod, and basic audio kit.", baseRentalRatePerDay: 150, replacementCost: 5000, availableQuantity: 2, itemsIncluded: [{ name: "Sony Alpha a7S III", quantity: 1, baseRentalRatePerDay: 50, partNumber: "SNY-A7S3", replacementCost: 3500 }, { name: "Canon EF 24-70mm f/2.8L II USM Lens", quantity: 1, baseRentalRatePerDay: 30, partNumber: "CAN-2470L", replacementCost: 1800 }, { name: "Manfrotto 502 Video Head with 546 Tripod Legs", quantity: 1, baseRentalRatePerDay: 20, partNumber: "MNF-502", replacementCost: 400 }, { name: "Rode NTG2 Shotgun Microphone", quantity: 1, baseRentalRatePerDay: 15, partNumber: "RDE-NTG2", replacementCost: 200 }], customizableOptions: [{ category: 'Lens', options: ["Canon EF 70-200mm f/2.8L IS III USM Lens"] }], imageUrl: "https://placehold.co/100x70/30CED1/000000?text=Kit", isSubrented: false },
				{ name: "DJI Mavic 3 Pro", type: "Drone", description: "Professional aerial camera with multi-directional obstacle sensing.", baseRentalRatePerDay: 120, partNumber: "DJI-Mavic3Pro", replacementCost: 2500, availableQuantity: 2, serialNumbers: ["MAV3PRO-001", "MAV3PRO-002"], imageUrl: "https://placehold.co/100x70/30CED1/000000?text=Mavic3Pro", isSubrented: false },
				{ name: "Godox VL300 LED Light", type: "Lighting", description: "Powerful daylight-balanced LED video light.", baseRentalRatePerDay: 40, partNumber: "GODOX-VL300", replacementCost: 700, availableQuantity: 3, serialNumbers: ["VL300-A", "VL300-B", "VL300-C"], imageUrl: "https://placehold.co/100x70/30CED1/000000?text=VL300", isSubrented: true },
				{ name: "Advanced Cinematography Package", type: "Package", description: "Comprehensive kit for professional film productions.", baseRentalRatePerDay: 450, replacementCost: 15000, availableQuantity: 1, itemsIncluded: [{ name: "RED Komodo 6K", quantity: 1, baseRentalRatePerDay: 250, partNumber: "RED-KMDO", replacementCost: 7000 }, { name: "Angenieux EZ-1 30-90mm T2.0 Zoom Lens", quantity: 1, baseRentalRatePerDay: 150, partNumber: "ANG-EZ1", replacementCost: 5000 }, { name: "Sachtler Flowtech 75 Tripod", quantity: 1, baseRentalRatePerDay: 50, partNumber: "SCT-FT75", replacementHost: 1000 }, { name: "SmallHD Indie 7 Monitor", quantity: 1, baseRentalRatePerDay: 30, partNumber: "SMHD-IN7", replacementCost: 800 }], customizableOptions: [{ category: 'Monitor', options: ["Atomos Ninja V+", "Convergent Design Odyssey7Q+"] }, { category: 'Lens', options: ["Zeiss CP.3 50mm T2.1", "Sigma Cine 18-35mm T2"] }], imageUrl: "https://placehold.co/100x70/30CED1/000000?text=CineKit", isSubrented: true }
			];
            for (const item of sampleItems) {
                const newDocRef = doc(equipmentColRef);
                await setDoc(newDocRef, { ...item, createdAt: serverTimestamp() });
            }
            setMessage('Sample equipment data added successfully!');
        } catch (error) {
            console.error("Error adding sample data:", error);
            setMessage(`Failed to add sample data: ${error.message}`);
        }
    };

    return (
        <>
            <Style />
            <div className="app-container">
                <div className="quote-card">
                    <h1>Camera Rental Quote</h1>
                    <p className="user-id-text">Logged in as: <span>{userId}</span></p>

                    {message && (
                        <div className="message-box" role="alert">
                            <span>{message}</span>
                        </div>
                    )}

                    <div className="sample-data-section">
                        <button
                            onClick={addSampleEquipmentData}
                            disabled={!isAuthReady || userId === 'loading...'}
                            className="btn add-sample-btn"
                        >
                            {isAuthReady && userId !== 'loading...' ? "Add Sample Equipment" : "Initializing..."}
                        </button>
                        <p>Click this once to populate your database for testing.</p>
                    </div>

                    <div className="section-container">
                        <h2>Select Rental Dates</h2>
                        <div className="date-selector">
                            <div className="date-input-group">
                                <label htmlFor="startDate">Start Date</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="date-input-group">
                                <label htmlFor="endDate">End Date</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate}
                                />
                            </div>
                            <div className="rental-days-display">
                                <p>Rental Days: <span>{rentalDays}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="equipment-catalog">
                        <h2>Available Equipment & Packages</h2>
                        {equipmentList.length === 0 && (
                            <p className="loading-text">Loading equipment or no equipment found.</p>
                        )}
                        <div className="equipment-grid">
                            {equipmentList.map((item) => (
                                <div key={item.id} className="equipment-card">
                                    <div>
                                        <img src={item.imageUrl} alt={item.name} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x70/111827/ffffff?text=Image+Error'; }}/>
                                        <h3>{item.name}</h3>
                                        <p className="description">{item.description}</p>
                                        <p className="price">${item.baseRentalRatePerDay} / day</p>
                                        <p className="replacement-cost">Replacement Cost: ${item.replacementCost}</p>
                                        {item.type === 'Package' && item.itemsIncluded && (
                                            <div className="package-includes">
                                                <p>Includes:</p>
                                                <ul>
                                                    {item.itemsIncluded.map((included, idx) => (
                                                        <li key={idx}>{included.quantity}x {included.name}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <button className="btn add-to-cart-btn" onClick={() => handleAddToCart(item)}>
                                        Add to Cart
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="section-container">
                        <h2>Your Cart</h2>
                        {cart.length === 0 ? (
                            <p className="loading-text">Your cart is empty.</p>
                        ) : (
                            <div className="cart-items-container">
                                {cart.map((cartItem) => (
                                    <div key={cartItem.item.id} className="cart-item">
                                        <div className="cart-item-details">
                                            <h4>{cartItem.item.name}</h4>
                                            <p>${cartItem.item.baseRentalRatePerDay} / day x {rentalDays} days = ${(cartItem.item.baseRentalRatePerDay * rentalDays).toFixed(2)}</p>
                                            <p>Replacement Cost: ${cartItem.item.replacementCost}</p>
                                        </div>
                                        <div className="cart-item-controls">
                                            <input
                                                type="number"
                                                aria-label="Quantity"
                                                min="1"
                                                value={cartItem.quantity}
                                                onChange={(e) => handleUpdateCartQuantity(cartItem.item.id, parseInt(e.target.value))}
                                            />
                                            <button className="btn remove-btn" onClick={() => handleRemoveFromCart(cartItem.item.id)} aria-label="Remove item">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="total-quote">
                                    Total Estimated Quote: ${calculateCartTotal().toFixed(2)}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="get-quote-section">
                        <button className="btn get-quote-btn" onClick={handleGetQuote}>
                            Get Quote (Download Invoice)
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
