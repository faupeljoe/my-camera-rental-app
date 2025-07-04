
// -----------------------------------------------------------
// Imports & Setup
// -----------------------------------------------------------
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
// Note: jsPDF and jspdf-autotable are now loaded from a CDN via a script loader effect.

// --- STYLES ---------------------------------------------------------------------
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
            max-width: 56rem; 
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
            background-color: rgba(22, 163, 74, 0.2); 
            border: 1px solid #047857; 
            color: #a7f3d0; 
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
        
        /* Client Info & Input Styling */
        .client-info-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
        }
        @media (min-width: 768px) {
            .client-info-grid {
                grid-template-columns: 1fr 1fr;
            }
        }
        .input-group {
            display: flex;
            flex-direction: column;
        }
        .input-group.full-width {
            grid-column: 1 / -1;
        }
        .input-group label {
            display: block;
            color: #d1d5db;
            font-size: 0.875rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        .input-group input {
            appearance: none;
            border: 1px solid #4b5563;
            background-color: #374151;
            border-radius: 0.5rem;
            width: 100%;
            padding: 0.5rem 0.75rem;
            color: #e5e7eb;
            line-height: 1.5;
            box-sizing: border-box;
        }
        .input-group input:focus {
            outline: none;
            border-color: transparent;
            box-shadow: 0 0 0 2px #22d3ee;
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
            background-color: #374151;
            color: #9ca3af;
            cursor: not-allowed;
            transform: none;
        }

        .add-sample-btn {
            background-color: #22c55e;
            color: white;
        }
        .add-sample-btn:hover:not(:disabled) {
            background-color: #16a34a;
        }
        .add-sample-btn:focus:not(:disabled) {
            box-shadow: 0 0 0 2px #4ade80;
        }
        .sample-data-section {
            margin-bottom: 1.5rem;
            text-align: center;
        }
        .sample-data-section p {
            font-size: 0.875rem;
            color: #6b7280;
            margin-top: 0.5rem;
        }

        .add-to-cart-btn {
            margin-top: 1rem;
            background-color: #0891b2;
            color: white;
            width: 100%;
        }
        .add-to-cart-btn:hover {
            background-color: #0e7490;
        }
        .add-to-cart-btn:focus {
            box-shadow: 0 0 0 2px #06b6d4;
        }

        .get-quote-btn {
            background-color: #06b6d4;
            color: #000000;
            padding: 0.75rem 2rem;
            font-size: 1.125rem;
            box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.2), 0 4px 6px -2px rgba(6, 182, 212, 0.1);
        }
        .get-quote-btn:hover {
            background-color: #0891b2;
            transform: scale(1.05);
        }
        .get-quote-section {
            text-align: center;
        }

        .remove-btn {
            background-color: #ef4444;
            color: white;
            padding: 0.5rem;
            border-radius: 9999px;
        }
        .remove-btn:hover {
            background-color: #dc2626;
        }
        .remove-btn svg {
            height: 1.25rem;
            width: 1.25rem;
        }

        /* Date Selector */
        .date-selector {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: flex-end;
        }
        .date-input-group, .time-input-group {
            flex: 1 1 150px;
        }
        .date-input-group label, .time-input-group label {
            display: block;
            color: #d1d5db;
            font-size: 0.875rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        .date-input-group input, .time-input-group input {
            appearance: none;
            border: 1px solid #4b5563;
            background-color: #374151;
            border-radius: 0.5rem;
            width: 100%;
            padding: 0.5rem 0.75rem;
            color: #e5e7eb;
            line-height: 1.5;
            box-sizing: border-box;
        }
        .date-input-group input:focus, .time-input-group input:focus {
            outline: none;
            border-color: transparent;
            box-shadow: 0 0 0 2px #22d3ee;
        }
        .rental-days-display {
            flex: 1 1 100%;
            text-align: center;
            margin-top: 1rem;
        }
        .rental-days-display p, .billing-explanation {
            font-size: 1rem;
            font-weight: 500;
            color: #d1d5db; /* gray-300 */
        }
        .rental-days-display span {
            font-weight: 600;
            color: #22d3ee; /* cyan-400 */
            font-size: 1.125rem;
        }
        .billing-explanation {
            font-style: italic;
            font-size: 0.875rem;
            color: #9ca3af;
            margin-top: 0.5rem;
        }

        /* Equipment Catalog */
        .equipment-catalog {
            margin-bottom: 2rem;
        }
        .loading-text {
            color: #9ca3af;
        }
        .equipment-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
        .equipment-card {
            background-color: #1f2937;
            padding: 1.25rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.3);
            border: 1px solid #374151;
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
            color: #f9fafb;
            margin-bottom: 0.5rem;
        }
        .equipment-card .description {
            font-size: 0.875rem;
            color: #9ca3af;
            margin-bottom: 0.5rem;
            min-height: 40px;
        }
        .equipment-card .price {
            font-size: 1.125rem;
            font-weight: 500;
            color: #22d3ee;
        }
        .equipment-card .replacement-cost {
            font-size: 0.75rem;
            color: #6b7280;
            margin-top: 0.25rem;
        }
        .package-includes {
            margin-top: 0.5rem;
            font-size: 0.875rem;
            color: #d1d5db;
        }
        .package-includes p {
            font-weight: 600;
        }
        .package-includes ul {
            list-style: disc;
            list-style-position: inside;
            color: #9ca3af;
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
            background-color: #111827;
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid #374151;
        }
        .cart-item-details {
            flex: 1;
        }
        .cart-item-details h4 {
            font-weight: 600;
            color: #f9fafb;
        }
        .cart-item-details p {
            font-size: 0.875rem;
            color: #9ca3af;
        }
        .cart-item-controls {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .cart-item-controls input {
            width: 4rem;
            padding: 0.5rem;
            border: 1px solid #4b5563;
            background-color: #374151;
            border-radius: 0.375rem;
            text-align: center;
            color: white;
        }
        .total-quote {
            text-align: right;
            font-size: 1.5rem;
            font-weight: 700;
            color: #67e8f9;
            margin-top: 1rem;
        }

        /* Responsive Grid Layout */
        @media (min-width: 768px) {
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

// --- Pricing Logic --------------------------------------------
// Calculates how many days to bill based on rental period,
// applying 1-day, weekly, monthly, and weekend-discount rules.
const calculateBilledDays = (start, end) => {
    if (!start || !end) return { billedDays: 0, explanation: 'Please select a rental period.' };

    const startDate = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T00:00:00');

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
        return { billedDays: 0, explanation: 'Invalid date range.' };
    }

    // Inclusive day count
    const totalPossessionDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // 1-day same-day rate
    if (totalPossessionDays <= 1) {
        return { billedDays: 1, explanation: '1 Day Rate: Pickup and return on the same day.' };
    }

    // Monthly rate (22–31 days billed as 12)
    if (totalPossessionDays >= 22 && totalPossessionDays <= 31) {
        return { billedDays: 12, explanation: `Monthly Rate Applied: Billed for 12 days on a ${totalPossessionDays}-day rental.` };
    }
    
    // Weekly rate (6–7 days billed as 4)
    if (totalPossessionDays >= 6 && totalPossessionDays <= 7) {
        return { billedDays: 4, explanation: `Weekly Rate Applied: Billed for 4 days on a ${totalPossessionDays}-day rental.` };
    }
    
    // Standard: subtract 2 (travel/setup days)
    let billableDays = Math.max(0, totalPossessionDays - 2);
    
    let explanation = `Standard Rate: Billed for ${billableDays} shoot day(s) on a ${totalPossessionDays}-day rental.`;
    
    // Identify full weekend days inside rental for discount
    const shootDays = [];
    if (totalPossessionDays > 2) {
        for (let d = new Date(startDate.getTime() + 86400000); d < endDate; d.setDate(d.getDate() + 1)) {
            shootDays.push(new Date(d));
        }
    }

    const weekends = new Set();
    shootDays.forEach(day => {
        if (day.getDay() === 6) { // Saturday
             const sunday = new Date(day);
             sunday.setDate(sunday.getDate() + 1);
             const sundayInShootDays = shootDays.some(d => d.getTime() === sunday.getTime());
             if(sundayInShootDays){
                  weekends.add(day.toDateString());
             }
        }
    });
    
    if (weekends.size > 0) {
        billableDays -= weekends.size;
        explanation = `Weekend Discount Applied: Billed for ${billableDays} shoot day(s) on a ${totalPossessionDays}-day rental.`;
    }

    // Ensure at least one day billed
    if(totalPossessionDays > 1 && billableDays < 1){
        billableDays = 1;
        explanation = `Standard Rate: Billed for 1 shoot day on a ${totalPossessionDays}-day rental.`
    }

    return { billedDays: billableDays, explanation };
};


// -----Main App Component-------------------------------------
const App = () => {
    // Firebase states
    const [db, setDb] = useState(null);
    const [userId, setUserId] = useState('loading...');
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [scriptsLoaded, setScriptsLoaded] = useState(false);

    // ------------ User / Client Info States -------------
    const [companyName, setCompanyName] = useState('');
    const [userName, setUserName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');

    // ------------ Rental Period States ---------------
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [pickupTime, setPickupTime] = useState('10:00');
    const [dropoffTime, setDropoffTime] = useState('17:00');

    // ------------ Equipment & Cart States -------------
    const [equipmentList, setEquipmentList] = useState([]);
    const [cart, setCart] = useState([]);

    // UI feedback message
    const [message, setMessage] = useState('');

    // Derived values: billed days + explanation text
    const { billedDays, explanation } = calculateBilledDays(startDate, endDate);


    // --- Script Loader for PDF Libraries ---
    useEffect(() => {
        const loadScript = (src, id) => {
            return new Promise((resolve, reject) => {
                if (document.getElementById(id)) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.id = id;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Script load error for ${src}`));
                document.body.appendChild(script);
            });
        };

        // Load jsPDF then plugin
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "jspdf-script")
            .then(() => {
                return loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js", "jspdf-autotable-script");
            })
            .then(() => {
                setScriptsLoaded(true);
            })
            .catch(error => console.error("Could not load PDF scripts", error));
        
    }, []);


    // Initialize Firebase and handle authentication
    useEffect(() => {
        try {
            const firebaseApp = initializeApp(firebaseConfig);
            const firestoreDb = getFirestore(firebaseApp);
            const firebaseAuth = getAuth(firebaseApp);

            setDb(firestoreDb);

            // Listen for auth state
            const unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsAuthReady(true);
                } else {
                    // Try custom token, else anonymous
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

    // --- HANDLERS: Cart management -------------------------------------

    // Add an item to the cart or increment quantity if it already exists
    const handleAddToCart = (item) => {
        // Find existing item index
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

    // Remove an item entirely from the cart
    const handleRemoveFromCart = (itemId) => {
        setCart(cart.filter(cartItem => cartItem.item.id !== itemId));
        setMessage('Item removed from cart.');
    };

    // Update quantity or remove if set to zero or below
    const handleUpdateCartQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            handleRemoveFromCart(itemId);
            return;
        }
        setCart(cart.map(cartItem =>
            cartItem.item.id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem
        ));
    };

    // --- HANDLER: Generate PDF Quote ----------------------------------
    const handleGetQuote = async () => {
       // Ensure PDF scripts are loaded
        if (!scriptsLoaded) {
            setMessage("PDF generation library is still loading. Please try again in a moment.");
            return;
        }
        // Validate form & cart
        if (!companyName || !userName || !address || !email) {
            setMessage('Please fill out all client information fields.');
            return;
        }
        if (!startDate || !endDate) {
            setMessage('Please select both pickup and dropoff dates.');
            return;
        }
        if (cart.length === 0) {
            setMessage('Your cart is empty. Add some equipment first!');
            return;
        }
        
        // jsPDF initialization
        const { jsPDF } = window.jspdf; // This is the beginning of the PDF quote configuration.
        const doc = new jsPDF();

        // Draw dark background
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.get('height');
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.get('width');
        doc.setFillColor(17, 24, 39); // RGB color for PDF background
        doc.rect(0, 0, pageWidth, pageHeight, 'F'); // 'F' stands for fill
       
       
        // Header: Company name & address
        doc.setTextColor(255, 255, 255); // white text for pdf document

        doc.setFont('Nitti-Normal', 'normal');
        doc.setFontSize(20);
        doc.text("Lefty's Camera Rental", pageWidth - 15, 20, { align: 'right' });
        
        doc.setFont('Nitti-Normal', 'normal');
        doc.setFontSize(10);
        doc.text("123 Film Row, Suite 100", pageWidth - 15, 26, { align: 'right' });
        doc.text("Hollywood, CA 90028", pageWidth - 15, 31, { align: 'right' });
        doc.text("Phone: (310) 555-1234", pageWidth - 15, 36, { align: 'right' });
        doc.text("contact@leftyscamera.com", pageWidth - 15, 41, { align: 'right' });

        // Client "INVOICE TO"
        doc.setFontSize(14);
        doc.setFont('Nitti-Normal', 'bold');
        doc.text("INVOICE TO:", 15, 55);
        
        doc.setFont('Nitti-Normal', 'normal');
        doc.setFontSize(11);
        doc.text(companyName, 15, 62);
        doc.text(`Attn: ${userName}`, 15, 67);
        doc.text(address, 15, 72);
        doc.text(email, 15, 77);

        // Rental dates table
        doc.autoTable({
            startY: 85,
            head: [['Pickup', 'Return', 'Billed Days']],
            body: [[ `${startDate} @ ${pickupTime}`, `${endDate} @ ${dropoffTime}`, `${billedDays} Days` ]],
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 2 },
            headStyles: { fillColor: [55, 65, 81] },
        });

        // Equipment items table
        const tableColumn = ["Qty", "Description", "Serial(s)", "Rate/Day", "Replace", "Total"];
        const tableRows = [];
        let subtotal = 0;

        cart.forEach(cartItem => {
            const item = cartItem.item;
            const lineTotal = item.baseRentalRatePerDay * billedDays * cartItem.quantity;
            subtotal += lineTotal;
            const rowData = [ cartItem.quantity, item.name, item.serialNumbers ? item.serialNumbers.join(', ') : 'N/A', `$${item.baseRentalRatePerDay.toFixed(2)}`, `$${item.replacementCost.toFixed(2)}`, `$${lineTotal.toFixed(2)}`];
            tableRows.push(rowData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: doc.autoTable.previous.finalY + 10,
            theme: 'striped',
            headStyles: { fillColor: [55, 65, 81] },
            styles: { fontSize: 9 },
        });

        let finalY = doc.autoTable.previous.finalY;

        // Pricing note (weekend/discount explanation)
        if (explanation) {
            doc.setFontSize(9);
            doc.setFont('Nitti-Normal', 'italic');
            doc.text(`Pricing Note: ${explanation}`, 15, finalY + 10);
            finalY += 5;
        }

        // Subtotal, tax, total
        const tax = subtotal * 0.0825;
        const total = subtotal + tax;
        
        doc.setFontSize(10);
        doc.setFont('Nitti-Normal', 'normal');
        doc.text("Subtotal:", 150, finalY + 10, { align: 'right' });
        doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 15, finalY + 10, { align: 'right' });
        
        doc.text("Tax (8.25%):", 150, finalY + 15, { align: 'right' });
        doc.text(`$${tax.toFixed(2)}`, pageWidth - 15, finalY + 15, { align: 'right' });
        
        doc.setFont('Nitti-Normal', 'bold');
        doc.text("TOTAL:", 150, finalY + 20, { align: 'right' });
        doc.text(`$${total.toFixed(2)}`, pageWidth - 15, finalY + 20, { align: 'right' });
        
        // Footer note
        doc.setFontSize(8);
        doc.text("Thank you for your business! Please make all checks payable to Lefty's Camera Rental.", 15, pageHeight - 10);
        
        // Trigger download
        doc.save('Lefty_Rental_Quote.pdf');
        
        setMessage('Quote PDF has been downloaded.');
}; // End of quote of configuration

    // --- UTILITY: Cart total calculation -------------------------------
    const calculateCartTotal = () => {
        return cart.reduce((total, cartItem) => {
            const itemCost = cartItem.item.baseRentalRatePerDay * billedDays * cartItem.quantity;
            return total + itemCost;
        }, 0);
    };

    // --- SAMPLE DATA SEEDING: For testing -----------------------------
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

    // --- RENDER: JSX Layout --------------------------------------------
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
                        <h2>Client Information</h2>
                        <div className="client-info-grid">
                            <div className="input-group">
                                <label htmlFor="companyName">Company Name</label>
                                <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                            </div>
                             <div className="input-group">
                                <label htmlFor="userName">Your Name</label>
                                <input type="text" id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} />
                            </div>
                             <div className="input-group full-width">
                                <label htmlFor="address">Address</label>
                                <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                             <div className="input-group full-width">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>
                    </div>


                    <div className="section-container">
                        <h2>Rental Period</h2>
                        <div className="date-selector">
                            <div className="date-input-group">
                                <label htmlFor="pickupDate">Pickup Date</label>
                                <input type="date" id="pickupDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                             <div className="time-input-group">
                                <label htmlFor="pickupTime">Pickup Time</label>
                                <input type="time" id="pickupTime" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
                            </div>
                            <div className="date-input-group">
                                <label htmlFor="dropoffDate">Dropoff Date</label>
                                <input type="date" id="dropoffDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate}/>
                            </div>
                             <div className="time-input-group">
                                <label htmlFor="dropoffTime">Dropoff Time</label>
                                <input type="time" id="dropoffTime" value={dropoffTime} onChange={(e) => setDropoffTime(e.target.value)} />
                            </div>
                            <div className="rental-days-display">
                                <p>Billed Days: <span>{billedDays}</span></p>
                                {explanation && <p className="billing-explanation">{explanation}</p>}
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
                                            <p>${cartItem.item.baseRentalRatePerDay} / day x {billedDays} days = ${(cartItem.item.baseRentalRatePerDay * billedDays).toFixed(2)}</p>
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
                        <button className="btn get-quote-btn" onClick={handleGetQuote} disabled={!scriptsLoaded}>
                            {scriptsLoaded ? 'Get Quote (Download Invoice)' : 'Loading PDF Tools...'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
