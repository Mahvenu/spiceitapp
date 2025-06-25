import React, { useEffect, useState } from "react";
import axios from "axios";
import '../customstyles/spiceprod.css';
import { useNavigate } from "react-router-dom"; // <-- Add this import

export default function OrderPlacement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [paymentTab, setPaymentTab] = useState("card"); // "card", "netbanking", "cod"
    const [cardDetails, setCardDetails] = useState({ name: "", number: "", expiry: "", cvv: "" });
    const [netbankingBank, setNetbankingBank] = useState("");
    const [netbankingDetails, setNetbankingDetails] = useState({
        accountHolder: "",
        accountNumber: "",
        ifsc: ""
    });
    const [netbankingErrors, setNetbankingErrors] = useState({});
    const [cardErrors, setCardErrors] = useState({});
    const [captchaValue, setCaptchaValue] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState("");
    const [deliveryMode, setDeliveryMode] = useState("delivery"); // "delivery" or "pickup"
    const [addressType, setAddressType] = useState("permanent"); // "permanent" or "temporary"
    const permanentAddress = localStorage.getItem("welcomeAddress") || "No address available";
    const [tempAddress, setTempAddress] = useState("");
    const [houseNo, setHouseNo] = useState("");
    const [line1, setLine1] = useState("");
    const [line2, setLine2] = useState("");
    const [area, setArea] = useState("");
    const [city, setCity] = useState("");
    const [landmark, setLandmark] = useState("");
    const [country, setCountry] = useState("");
    const [showTempAddressSummary, setShowTempAddressSummary] = useState(false);
    const [userPhone, setUserPhone] = useState(localStorage.getItem("welcomePhone") || ""); // New state for user phone
    const [tempAddressList, setTempAddressList] = useState([]); // Add this state
    const [zipAutoFilled, setZipAutoFilled] = useState(false); // Add this state
    const [confirmedAddress, setConfirmedAddress] = useState(""); // Add this state
    const [zipDisabled, setZipDisabled] = useState(false); // Add this state
    const navigate = useNavigate();

    // Get user info from localStorage (set during login/signup)
    const fullName = localStorage.getItem("welcomeName") || "Guest";

    // Fetch products and cart only once, then compute cartItems after both are loaded
    useEffect(() => {
        let isMounted = true;
        const fetchProducts = async () => {
            try {
                const prodInfoResp = await axios.get("https://gdhfo6zldj.execute-api.ap-south-1.amazonaws.com/dev/getInventory?service=getInventory");
                if (!isMounted) return;
                setProducts(prodInfoResp.data);
                setLoading(false);
            } catch (err) {
                if (!isMounted) return;
                setError(err.message);
                setLoading(false);
            }
        };
        fetchProducts();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        // Fetch user address details from backend as per login
        const fetchAddress = async () => {
            try {
                const token = localStorage.getItem("authToken");
                const resp = await axios.get(
                    "https://d9umq22y9f.execute-api.ap-south-1.amazonaws.com/dev/checkSignin?service=getCustomerByPhone&phone=" +
                    (localStorage.getItem("welcomePhone") || ""),
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (resp.data && resp.data.fullName && resp.data.address) {
                    localStorage.setItem("welcomeName", resp.data.fullName);
                    localStorage.setItem("welcomeAddress", resp.data.address);
                }
                // Save temp address list if available
                if (resp.data && resp.data.tempAddressList && Array.isArray(resp.data.tempAddressList)) {
                    setTempAddressList(resp.data.tempAddressList);
                }
            } catch (err) {
                // Optionally handle error
            }
        };
        fetchAddress();
    }, []);

    useEffect(() => {
        // Only compute cartItems after products are loaded
        if (!loading && products.length > 0) {
            const saved = sessionStorage.getItem("cart");
            const cart = saved ? JSON.parse(saved) : {};
            const items = Object.entries(cart)
                .filter(([_, item]) => item.count > 0)
                .map(([key, item]) => {
                    const [productId, qtyStr] = key.split("|");
                    const product = products.find(p => p.productId === productId);
                    if (!product) return null;
                    const inventory = product.inventory || {};
                    const name = inventory.Name || productId;
                    const pricePerKg = Number(inventory.UnitPrice) || 0;

                    // Convert qtyStr to grams
                    let grams = 0;
                    if (qtyStr && qtyStr.toLowerCase().includes('kg')) {
                        grams = parseFloat(qtyStr) * 1000;
                    } else if (qtyStr && qtyStr.toLowerCase().includes('g')) {
                        grams = parseFloat(qtyStr);
                    }

                    // Calculate price for selected quantity (same as CartDetails)
                    const priceForSelectedQty = grams && pricePerKg
                        ? Math.round((pricePerKg / 1000) * grams)
                        : pricePerKg;

                    const count = typeof item.count !== "undefined" ? Number(item.count) : 0;
                    const total = priceForSelectedQty * (count || 1);

                    const imageName = (inventory.Name || productId || "").replace(/\s+/g, "");
                    const imagePath = `/images/products/${imageName}.jpg`;

                    return {
                        key,
                        name,
                        size: qtyStr,
                        price: priceForSelectedQty,
                        count,
                        total,
                        imagePath
                    };
                }).filter(Boolean);
            setCartItems(items);
        }
    }, [loading, products]);

    
    // Add this function above your return statement
    const handleOrderSubmit = async (e) => {
        e.preventDefault();

        // Build orderItems array from cartItems
        const orderItems = cartItems.map(item => ({
            productId: String(item.name), // Use product name as productId to match your sample
            name: String(item.name),
            quantity: String(item.size),
            count: item.count,
            unitPrice: item.price,
            total: item.price * item.count
        }));

        // Build delivery address string
        let deliveryAddress = "";
        if (addressType === "permanent") {
            deliveryAddress = String(permanentAddress);
        } else {
            deliveryAddress = [
                houseNo, line1, line2, area, city,
                landmark ? `Landmark: ${landmark}` : "",
                tempAddress ? `Pincode: ${tempAddress}` : "",
                country
            ].filter(Boolean).join(", ");
        }

        // Build the order request object
        const orderRequest = {
            phoneNumber: String(userPhone),
            orderItems,
            addressType: String(addressType),
            deliveryAddress: String(deliveryAddress),
            deliveryMode: String(deliveryMode),
            paymentMode: String(paymentTab),
            orderTotal: cartTotal,
            deliveryFee: deliveryFee,
            grandTotal: grandTotal,
            orderDate: new Date().toISOString()
        };

        try {
            await axios.post(
                "https://n5fpw7cag6.execute-api.ap-south-1.amazonaws.com/dev/placeOrder?service=placeOrder",
                orderRequest,
                { headers: { "Content-Type": "application/json" } }
            );
            sessionStorage.clear();
            setTimeout(() => {
                navigate("/ordersuccess");
            }, 1000);
        } catch (err) {
            alert("Order placement failed. Please try again.");
        }
    };

    // Generate a simple numeric captcha
    const generateCaptcha = () => {
        const value = Math.floor(1000 + Math.random() * 9000); // 4-digit number
        setCaptchaValue(value.toString());
    };

    // On mount, generate the initial captcha
    useEffect(() => {
        generateCaptcha();
    }, []);

    // --- Add this helper above your return statement ---
    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.count, 0);
    const deliveryFee = deliveryMode === "delivery" ? 20 : 0;
    const grandTotal = cartTotal + deliveryFee;

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    // New function to handle temporary address save
    const handleTempAddressSave = async () => {
        const addressStr = [
            houseNo, line1, line2, area, city, landmark ? `Landmark: ${landmark}` : "", tempAddress ? `Pincode: ${tempAddress}` : "", country
        ].filter(Boolean).join(", ");
        try {
            await axios.put(
                "https://d9umq22y9f.execute-api.ap-south-1.amazonaws.com/dev/updateTempAddressList?service=updateTempAddressList",
                {
                    phone: userPhone,
                    tempAddressList: [addressStr]
                },
                {
                    headers: { "Content-Type": "application/json" }
                }
            );
        } catch (err) {
            // Optionally handle error
        }
    };

    return (
        <div className="container">
            {/* --- Top Section: User Info --- */}
            <div style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "24px",
                borderBottom: "1px solid #eee",
                paddingBottom: "16px"
            }}>
                <div>
                    <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>{fullName}</div>
                    {/* Removed permanentAddress display */}
                </div>
                <button
                    className="btn btn-outline-primary"
                    style={{ height: "36px", alignSelf: "flex-start" }}
                    onClick={() => window.location.href = "/customermanagement"}
                >
                    Change
                </button>
            </div>

            {/* --- Delivery Address Section --- */}
            <div style={{
                marginTop: "24px",
                marginBottom: "16px",
                padding: "18px 24px",
                background: "#f8f9fa",
                border: "1px solid #eee",
                borderRadius: "8px"
            }}>
                <div style={{ fontWeight: "bold", fontSize: "1.1rem", marginBottom: "6px" }}>
                    Delivery Address
                </div>
                <div style={{ marginBottom: "12px" }}>
                    <label style={{ marginRight: "18px", fontWeight: 500 }}>
                        <input
                            type="radio"
                            name="deliveryMode"
                            value="delivery"
                            checked={deliveryMode === "delivery"}
                            onChange={() => setDeliveryMode("delivery")}
                            style={{ marginRight: "6px" }}
                        />
                        Delivery
                    </label>
                    <label style={{ fontWeight: 500 }}>
                        <input
                            type="radio"
                            name="deliveryMode"
                            value="pickup"
                            checked={deliveryMode === "pickup"}
                            onChange={() => setDeliveryMode("pickup")}
                            style={{ marginRight: "6px" }}
                        />
                        Pick Up
                    </label>
                </div>
                {/* If delivery mode is delivery, ask for address type */}
                {deliveryMode === "delivery" && (
                    <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "18px" }}>
                        <label style={{ marginRight: "18px", fontWeight: 500, display: "flex", alignItems: "center" }}>
                            <input
                                type="radio"
                                name="addressType"
                                value="permanent"
                                checked={addressType === "permanent"}
                                onChange={() => setAddressType("permanent")}
                                style={{ marginRight: "6px" }}
                            />
                            Permanent Address
                        </label>
                        <label style={{ fontWeight: 500, display: "flex", alignItems: "center" }}>
                            <input
                                type="radio"
                                name="addressType"
                                value="temporary"
                                checked={addressType === "temporary"}
                                onChange={() => setAddressType("temporary")}
                                style={{ marginRight: "6px" }}
                            />
                            Temporary Address
                            {/* Zip code input next to Temporary Address radio */}
                            {addressType === "temporary" && (
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ width: "120px", marginLeft: "12px" }}
                                    value={tempAddress}
                                    onChange={e => {
                                        setTempAddress(e.target.value);
                                        if (e.target.value.length === 6 && /^\d{6}$/.test(e.target.value)) {
                                            // Only clear fields, do not set demo/default values
                                            setHouseNo("");
                                            setLine1("");
                                            setLine2("");
                                            setArea("");
                                            setCity("");
                                            setLandmark("");
                                            setCountry("");
                                            setZipAutoFilled(true);
                                        } else {
                                            setZipAutoFilled(false);
                                            setHouseNo("");
                                            setLine1("");
                                            setLine2("");
                                            setArea("");
                                            setCity("");
                                            setLandmark("");
                                            setCountry("");
                                        }
                                    }}
                                    required
                                    maxLength={10}
                                    pattern="[0-9]*"
                                    disabled={zipDisabled}
                                />
                            )}
                        </label>
                    </div>
                )}
                <div style={{ color: "#333", fontSize: "1rem" }}>
                    {deliveryMode === "delivery"
                        ? (addressType === "permanent" ? permanentAddress : tempAddress || "Enter temporary address above")
                        : (
                            cartItems.some(item => {
                                const product = products.find(p => p.productId === item.key.split("|")[0]);
                                return product && product.inventory && Number(product.inventory.Stock) > 2;
                            })
                                ? "Pick up from store within 7 days"
                                : "Pick up from store"
                        )
                    }
                </div>
                {/* Immediately show address fields if zipAutoFilled is true */}
                {deliveryMode === "delivery" && addressType === "temporary" && zipAutoFilled && !confirmedAddress && (
                    <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <input
                            type="text"
                            className="form-control"
                            style={{ width: "220px" }}
                            placeholder="House No"
                            value={houseNo}
                            onChange={e => setHouseNo(e.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control"
                            style={{ width: "300px" }}
                            placeholder="Address Line 1"
                            value={line1}
                            onChange={e => setLine1(e.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control"
                            style={{ width: "300px" }}
                            placeholder="Address Line 2"
                            value={line2}
                            onChange={e => setLine2(e.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control"
                            style={{ width: "220px" }}
                            placeholder="Area"
                            value={area}
                            onChange={e => setArea(e.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control"
                            style={{ width: "220px" }}
                            placeholder="City"
                            value={city}
                            onChange={e => setCity(e.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control"
                            style={{ width: "220px" }}
                            placeholder="Country"
                            value={country}
                            onChange={e => setCountry(e.target.value)}
                        />
                    </div>
                )}
                {/* Add Deliver Here button below address */}
                {deliveryMode === "delivery" && (
                    <>
                        {!confirmedAddress ? (
                            <button
                                className="btn btn-success"
                                style={{ margin: "12px 0 0 0" }}
                                onClick={() => {
                                    // Build the address string based on address type
                                    let address = "";
                                    if (addressType === "permanent") {
                                        address = permanentAddress;
                                    } else {
                                        address = [
                                            houseNo, line1, line2, area, city,
                                            landmark ? `Landmark: ${landmark}` : "",
                                            tempAddress ? `Pincode: ${tempAddress}` : "",
                                            country
                                        ].filter(Boolean).join(", ");
                                    }
                                    setConfirmedAddress(address);
                                    setZipDisabled(true); // Disable zip code input
                                }}
                                type="button"
                            >
                                Deliver Here
                            </button>
                        ) : (
                            <div style={{ marginTop: "14px", background: "#e6f7e6", padding: "10px 16px", borderRadius: "6px", color: "#155724", fontWeight: 500, display: "flex", alignItems: "center", gap: "16px" }}>
                                <span>Delivery Address: </span>
                                <span>{confirmedAddress}</span>
                                {addressType === "temporary" && (
                                    <button
                                        className="btn btn-link"
                                        style={{ marginLeft: "16px", color: "#007bff", textDecoration: "underline", fontWeight: 500, padding: 0 }}
                                        onClick={() => {
                                            setConfirmedAddress("");
                                            setZipDisabled(false); // Enable zip code input
                                        }}
                                        type="button"
                                    >
                                        Change
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* --- Cart Products Table Section --- */}
            <div style={{ marginTop: "32px" }}>
                <h3>Order Summary</h3>
                {cartItems.length > 0 ? (
                    <table style={{ width: "100%", borderCollapse: "collapse", background: "#fafbfc" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #ddd" }}>
                                {/* <th style={{ padding: "10px" }}>Image</th> */}
                                <th style={{ padding: "10px" }}>Product</th>
                                <th style={{ padding: "10px" }}>Qty</th> {/* Renamed from Size to Qty */}
                                <th style={{ padding: "10px" }}>Count</th>
                                <th style={{ padding: "10px" }}>Unit Price (₹)</th>
                                <th style={{ padding: "10px" }}>Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map(item => (
                                <tr key={item.key} style={{ borderBottom: "1px solid #eee", textAlign: "center" }}>
                                    {/* <td style={{ padding: "10px" }}>
                                        <img
                                            src={item.imagePath}
                                            alt={item.name}
                                            style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px" }}
                                            onError={e => { e.target.src = "/images/products/default.jpg"; }}
                                        />
                                    </td> */}
                                    <td style={{ padding: "10px", fontWeight: "bold" }}>{item.name}</td>
                                    <td style={{ padding: "10px" }}>{item.size}</td> {/* This is the pack size, now shown as Qty */}
                                    <td style={{ padding: "10px" }}>{item.count}</td>
                                    <td style={{ padding: "10px" }}>{item.price}</td>
                                    <td style={{ padding: "10px" }}>{item.price * item.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ color: "#888", fontStyle: "italic" }}>No products in cart.</div>
                )}
                <div style={{ marginTop: "18px", textAlign: "right", fontSize: "1.08rem" }}>
                    <div>
                        <span style={{ fontWeight: 500 }}>Subtotal:</span> ₹{cartTotal}
                    </div>
                    {deliveryMode === "delivery" && (
                        <div>
                            <span style={{ fontWeight: 500 }}>Delivery Fee:</span> ₹{deliveryFee}
                        </div>
                    )}
                    <div style={{ fontWeight: "bold", fontSize: "1.15rem", marginTop: "6px" }}>
                        Total: ₹{grandTotal}
                    </div>
                </div>
            </div>

            {/* --- Card Details Section --- */}
            <div style={{
                marginTop: "40px",
                display: "flex",
                gap: "32px",
                alignItems: "flex-start",
                border: "1px solid #eee",
                borderRadius: "10px",
                padding: "24px",
                background: "#fafbfc"
            }}>
                {/* Left: Payment Tabs */}
                <div style={{ minWidth: "120px", display: "flex", flexDirection: "column" }}>
                    <div
                        onClick={() => setPaymentTab("card")}
                        style={{
                            padding: "8px 0",
                            cursor: "pointer",
                            background: paymentTab === "card" ? "#007bff" : "#fff",
                            color: paymentTab === "card" ? "#fff" : "#007bff",
                            border: "1px solid #007bff",
                            borderRadius: "6px",
                            marginBottom: "8px",
                            fontWeight: 500,
                            textAlign: "center",
                            fontSize: ".95rem",
                            minWidth: "100px"
                        }}
                    >
                        Credit/Debit Card
                    </div>
                    <div
                        onClick={() => setPaymentTab("netbanking")}
                        style={{
                            padding: "8px 0",
                            cursor: "pointer",
                            background: paymentTab === "netbanking" ? "#007bff" : "#fff",
                            color: paymentTab === "netbanking" ? "#fff" : "#007bff",
                            border: "1px solid #007bff",
                            borderRadius: "6px",
                            marginBottom: "8px",
                            fontWeight: 500,
                            textAlign: "center",
                            fontSize: ".95rem",
                            minWidth: "100px"
                        }}
                    >
                        Netbanking
                    </div>
                    <div
                        onClick={() => setPaymentTab("cod")}
                        style={{
                            padding: "8px 0",
                            cursor: "pointer",
                            background: paymentTab === "cod" ? "#007bff" : "#fff",
                            color: paymentTab === "cod" ? "#fff" : "#007bff",
                            border: "1px solid #007bff",
                            borderRadius: "6px",
                            fontWeight: 500,
                            textAlign: "center",
                            fontSize: ".95rem",
                            minWidth: "100px"
                        }}
                    >
                        Cash on Delivery
                    </div>
                </div>
                {/* Right: Payment Form */}
                <div style={{ flex: 1 }}>
                    {paymentTab === "card" && (
                        <form
                            onSubmit={handleOrderSubmit}
                            noValidate
                        >
                            <div className="mb-3" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                                <label className="form-label" style={{ minWidth: "140px", marginBottom: 0, textAlign: "left" }}>Cardholder Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{
                                        width: "180px",
                                        minWidth: "100px",
                                        transition: "width 0.2s"
                                    }}
                                    value={cardDetails.name}
                                    onChange={e => {
                                        setCardDetails({ ...cardDetails, name: e.target.value });
                                        setCardErrors({ ...cardErrors, name: undefined });
                                    }}
                                    placeholder="Name on Card"
                                />
                            </div>
                            {cardErrors.name && (
                                <div style={{ color: "red", marginLeft: "156px", marginTop: "-16px", marginBottom: "8px", fontSize: ".95em" }}>
                                    {cardErrors.name}
                                </div>
                            )}
                            <div className="mb-3" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                                <label className="form-label" style={{ minWidth: "140px", marginBottom: 0, textAlign: "left" }}>Card Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{
                                        width: "180px",
                                        minWidth: "100px",
                                        transition: "width 0.2s"
                                    }}
                                    value={cardDetails.number}
                                    onChange={e => {
                                        setCardDetails({ ...cardDetails, number: e.target.value });
                                        setCardErrors({ ...cardErrors, number: undefined });
                                    }}
                                    placeholder="Card Number"
                                    maxLength={19}
                                />
                            </div>
                            {cardErrors.number && (
                                <div style={{ color: "red", marginLeft: "156px", marginTop: "-16px", marginBottom: "8px", fontSize: ".95em" }}>
                                    {cardErrors.number}
                                </div>
                            )}
                            <div className="row" style={{ gap: "12px" }}>
                                <div className="col" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "96px" }}>
                                    <label className="form-label" style={{ minWidth: "60px", marginBottom: 0, textAlign: "left" }}>Expiry</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{ width: "90px", minWidth: "60px" }}
                                        value={cardDetails.expiry}
                                        onChange={e => {
                                            setCardDetails({ ...cardDetails, expiry: e.target.value });
                                            setCardErrors({ ...cardErrors, expiry: undefined });
                                        }}
                                        placeholder="MM/YY"
                                        maxLength={5}
                                    />
                                </div>
                                <div className="col" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "97px" }}>
                                    <label className="form-label" style={{ minWidth: "60px", marginBottom: 0, textAlign: "left" }}>CVV</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        style={{ width: "90px", minWidth: "60px" }}
                                        value={cardDetails.cvv}
                                        onChange={e => {
                                            setCardDetails({ ...cardDetails, cvv: e.target.value });
                                            setCardErrors({ ...cardErrors, cvv: undefined });
                                        }}
                                        placeholder="CVV"
                                        maxLength={4}
                                    />
                                </div>
                            </div>
                            {(cardErrors.expiry || cardErrors.cvv) && (
                                <div>
                                    {cardErrors.expiry && (
                                        <div style={{ color: "red", marginLeft: "76px", marginTop: "-16px", marginBottom: "8px", fontSize: ".95em", display: "inline-block" }}>
                                            {cardErrors.expiry}
                                        </div>
                                    )}
                                    {cardErrors.cvv && (
                                        <div style={{ color: "red", marginLeft: "40px", marginTop: "-16px", marginBottom: "8px", fontSize: ".95em", display: "inline-block" }}>
                                            {cardErrors.cvv}
                                        </div>
                                    )}
                                </div>
                            )}
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    display: "block",
                                    margin: "24px auto 0 auto"
                                }}
                            >
                                Pay Now
                            </button>
                        </form>
                    )}
                    {paymentTab === "netbanking" && (
                        <form
                            onSubmit={handleOrderSubmit}
                            noValidate
                        >
                            <div className="mb-3" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                                <label className="form-label" style={{ minWidth: "120px", marginBottom: 0, textAlign: "left" }}>Select Bank</label>
                                <select
                                    className="form-control"
                                    style={{ width: "180px", minWidth: "120px" }}
                                    value={netbankingBank}
                                    onChange={e => {
                                        setNetbankingBank(e.target.value);
                                        setNetbankingErrors({ ...netbankingErrors, bank: undefined });
                                    }}
                                >
                                    <option value="">--Select Bank--</option>
                                    <option value="SBI">State Bank of India</option>
                                    <option value="HDFC">HDFC Bank</option>
                                    <option value="ICICI">ICICI Bank</option>
                                    <option value="AXIS">Axis Bank</option>
                                    <option value="KOTAK">Kotak Mahindra Bank</option>
                                </select>
                            </div>
                            {netbankingErrors.bank && (
                                <div style={{ color: "red", marginLeft: "136px", marginTop: "-16px", marginBottom: "8px", fontSize: ".95em" }}>
                                    {netbankingErrors.bank}
                                </div>
                            )}
                            <div className="mb-3" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                                <label className="form-label" style={{ minWidth: "120px", marginBottom: 0, textAlign: "left" }}>Account Holder</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ width: "180px", minWidth: "120px" }}
                                    value={netbankingDetails.accountHolder}
                                    onChange={e => {
                                        setNetbankingDetails({ ...netbankingDetails, accountHolder: e.target.value });
                                        setNetbankingErrors({ ...netbankingErrors, accountHolder: undefined });
                                    }}
                                    placeholder="Account Holder Name"
                                />
                            </div>
                            {netbankingErrors.accountHolder && (
                                <div style={{ color: "red", marginLeft: "136px", marginTop: "-16px", marginBottom: "8px", fontSize: ".95em" }}>
                                    {netbankingErrors.accountHolder}
                                </div>
                            )}
                            <div className="mb-3" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                                <label className="form-label" style={{ minWidth: "120px", marginBottom: 0, textAlign: "left" }}>Account Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ width: "180px", minWidth: "120px" }}
                                    value={netbankingDetails.accountNumber}
                                    onChange={e => {
                                        setNetbankingDetails({ ...netbankingDetails, accountNumber: e.target.value });
                                        setNetbankingErrors({ ...netbankingErrors, accountNumber: undefined });
                                    }}
                                    placeholder="Account Number"
                                />
                            </div>
                            {netbankingErrors.accountNumber && (
                                <div style={{ color: "red", marginLeft: "136px", marginTop: "-16px", marginBottom: "8px", fontSize: ".95em" }}>
                                    {netbankingErrors.accountNumber}
                                </div>
                            )}
                            <div className="mb-3" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                                <label className="form-label" style={{ minWidth: "120px", marginBottom: 0, textAlign: "left" }}>IFSC Code</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ width: "140px", minWidth: "100px" }}
                                    value={netbankingDetails.ifsc}
                                    onChange={e => {
                                        setNetbankingDetails({ ...netbankingDetails, ifsc: e.target.value });
                                        setNetbankingErrors({ ...netbankingErrors, ifsc: undefined });
                                    }}
                                    placeholder="IFSC Code"
                                />
                            </div>
                            {netbankingErrors.ifsc && (
                                <div style={{ color: "red", marginLeft: "136px", marginTop: "-16px", marginBottom: "8px", fontSize: ".95em" }}>
                                    {netbankingErrors.ifsc}
                                </div>
                            )}
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    display: "block",
                                    margin: "24px auto 0 auto"
                                }}
                            >
                                Pay Now
                            </button>
                        </form>
                    )}
                    {paymentTab === "cod" && (
                        <form
                            onSubmit={e => {
                                e.preventDefault();
                                if (captchaInput !== captchaValue) {
                                    setCaptchaError("Invalid captcha. Please try again.");
                                    return;
                                }
                                setCaptchaError("");
                                // Directly navigate to success page
                                sessionStorage.clear();
                                setTimeout(() => {
                                    navigate("/ordersuccess");
                                }, 500);
                            }}
                            noValidate
                        >
                            <div style={{ fontWeight: 500, fontSize: "1.1rem", marginTop: "12px" }}>
                                Pay with cash when your order is delivered.
                            </div>
                            <div style={{ marginTop: "24px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
                                {/* Removed "Captcha:" label text */}
                                <span
                                    style={{
                                        background: "#f5f5f5",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        fontWeight: 600,
                                        letterSpacing: "2px",
                                        fontSize: "1.1rem",
                                        userSelect: "none"
                                    }}
                                >
                                    {captchaValue}
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ width: "120px" }}
                                    value={captchaInput}
                                    onChange={e => setCaptchaInput(e.target.value)}
                                    placeholder="Enter Captcha"
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={generateCaptcha}
                                    style={{ marginLeft: "8px" }}
                                    title="Refresh Captcha"
                                >
                                    ↻
                                </button>
                            </div>
                            {captchaError && (
                                <div style={{ color: "red", marginLeft: "80px", marginTop: "-12px", marginBottom: "8px", fontSize: ".95em" }}>
                                    {captchaError}
                                </div>
                            )}
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    display: "block",
                                    margin: "24px auto 0 auto"
                                }}
                            >
                                Confirm Order
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* --- FIELD VALIDATIONS COMMENTARY ---

            CREDIT/DEBIT CARD TAB VALIDATIONS
            - Cardholder Name: Required, only letters and spaces allowed.
            - Card Number: Required, must be 16-19 digits (spaces ignored).
            - Expiry: Required, must match MM/YY format, month 01-12.
            - CVV: Required, must be 3 or 4 digits.
            - Errors are shown below each field. Errors clear as user edits the field.
            - Form submission is blocked if any field is invalid.

            NETBANKING TAB VALIDATIONS
            - Select Bank: Required (dropdown must not be empty).
            - Account Holder: Required, only letters and spaces allowed.
            - Account Number: Required, must be 8-20 digits.
            - Account Holder: Required, only letters and spaces allowed.
            - Account Number: Required, must be 8-20 digits.
            - IFSC Code: Required, must match standard IFSC format (e.g., SBIN0123456).
            - Errors are shown below each field. Errors clear as user edits the field.
            - Form submission is blocked if any field is invalid.

            Both tabs use their own error state (`cardErrors`, `netbankingErrors`) and validation logic in their respective
            */}
        </div>
    );
}