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
    const navigate = useNavigate();

    // Get user info from localStorage (set during login/signup)
    const fullName = localStorage.getItem("welcomeName") || "Guest";
    const address = localStorage.getItem("welcomeAddress") || "No address available";

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
                const token = localStorage.getItem("authToken"); // or whatever your auth token key is
                const resp = await axios.get("https://d9umq22y9f.execute-api.ap-south-1.amazonaws.com/dev/checkSignin?service=getCustomerByPhone&phone=7760156565", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (resp.data && resp.data.fullName && resp.data.address) {
                    localStorage.setItem("welcomeName", resp.data.fullName);
                    localStorage.setItem("welcomeAddress", resp.data.address);
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
                    const [productId, size] = key.split("|");
                    const product = products.find(p => p.productId === productId);
                    if (!product) return null;
                    const inventory = product.inventory || {};
                    const name = inventory.Name || productId;
                    const price = Number(inventory.UnitPrice) || 0;
                    const imageName = (inventory.Name || productId || "").replace(/\s+/g, "");
                    const imagePath = `/images/products/${imageName}.jpg`;
                    return {
                        key,
                        name,
                        size,
                        price,
                        count: item.count,
                        imagePath
                    };
                }).filter(Boolean);
            setCartItems(items);
        }
    }, [loading, products]);

    // Helper to update inventory after order
    const updateInventory = async () => {
        try {
            for (const item of cartItems) {
                await axios.post(
                    "https://gdhfo6zldj.execute-api.ap-south-1.amazonaws.com/dev/updateInventory",
                    {
                        productId: item.key.split("|")[0],
                        size: item.size,
                        quantity: item.count,
                        operation: "decrement"
                    }
                );
            }
        } catch (err) {
            // Optionally handle error
        }
    };

    // Handler for order, clear session, and redirect to OrderSuccess page
    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        await updateInventory();
        sessionStorage.clear();
        setTimeout(() => {
            navigate("/ordersuccess");
        }, 1000);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

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
                    <div style={{ color: "#555", marginTop: "6px", fontSize: "1rem" }}>{address}</div>
                </div>
                <button
                    className="btn btn-outline-primary"
                    style={{ height: "36px", alignSelf: "flex-start" }}
                    onClick={() => window.location.href = "/customermanagement"}
                >
                    Change
                </button>
            </div>

            {/* --- Cart Products Table Section --- */}
            <div style={{ marginTop: "32px" }}>
                <h3>Products in Cart</h3>
                {cartItems.length > 0 ? (
                    <table style={{ width: "100%", borderCollapse: "collapse", background: "#fafbfc" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #ddd" }}>
                                {/* <th style={{ padding: "10px" }}>Image</th> */}
                                <th style={{ padding: "10px" }}>Product</th>
                                <th style={{ padding: "10px" }}>Size</th>
                                <th style={{ padding: "10px" }}>Qty</th>
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
                                    <td style={{ padding: "10px" }}>{item.size}</td>
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
                                <div className="col" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
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
                                <div className="col" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
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
                        <div style={{ fontWeight: 500, fontSize: "1.1rem", marginTop: "12px" }}>
                            Pay with cash when your order is delivered.
                        </div>
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
            - IFSC Code: Required, must match standard IFSC format (e.g., SBIN0123456).
            - Errors are shown below each field. Errors clear as user edits the field.
            - Form submission is blocked if any field is invalid.

            Both tabs use their own error state (`cardErrors`, `netbankingErrors`) and validation logic in their respective
            */}
        </div>
    );
}