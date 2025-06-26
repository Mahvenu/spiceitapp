import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UserInfo() {
    const [activeTab, setActiveTab] = useState("details");
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        pincode: ""
    });
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [editField, setEditField] = useState(""); // which field is being edited
    const [editValue, setEditValue] = useState(""); // value being edited
    const navigate = useNavigate();

    // Fetch user info when "User Details" tab is clicked or on initial mount
    const fetchUserInfo = async () => {
        setError("");
        setSuccess("");
        // Get phone number from sessionStorage (set during sign in)
        const phone = sessionStorage.getItem("welcomePhone") || "";
        if (!phone) {
            setError("No user is logged in.");
            setShowForm(false);
            return;
        }
        try {
            const res = await fetch(
                `https://d9umq22y9f.execute-api.ap-south-1.amazonaws.com/dev/getCustomerDetails?service=getCustomerByPhone&phone=${encodeURIComponent(phone)}`
            );
            if (res.ok) {
                const data = await res.json();
                let user;
                if (Array.isArray(data)) {
                    user = data.find(u => u.phone === phone) || data[0];
                } else if (data.customer) {
                    user = data.customer;
                } else {
                    user = data;
                }
                if (user) {
                    setForm({
                        firstName: user.firstName || "",
                        lastName: user.lastName || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        address: user.address || "",
                        pincode: user.pincode || ""
                    });
                    setShowForm(true);
                } else {
                    setError("User details not found.");
                    setShowForm(false);
                }
            } else {
                setError("Failed to fetch user details.");
                setShowForm(false);
            }
        } catch {
            setError("Failed to fetch user details.");
            setShowForm(false);
        }
    };

    // Fetch order history
    const fetchOrderHistory = async () => {
        setError("");
        setSuccess("");
        setShowOrders(false);
        // Get phone number from sessionStorage (set during sign in)
        const phone = sessionStorage.getItem("welcomePhone") || "";
        if (!phone) {
            setError("No user is logged in.");
            return;
        }
        try {
            const res = await fetch(
                `https://n5fpw7cag6.execute-api.ap-south-1.amazonaws.com/dev/getOrderHistory?service=getOrders&phoneNumber=${encodeURIComponent(phone)}`
            );
            if (res.ok) {
                const data = await res.json();
                setOrders(Array.isArray(data) ? data : []);
                setShowOrders(true);
            } else {
                setError("Failed to fetch order history.");
            }
        } catch {
            setError("Failed to fetch order history.");
        }
    };

    // Fetch user info on mount (so details show by default)
    useEffect(() => {
        if (activeTab === "details") {
            fetchUserInfo();
        }
        // eslint-disable-next-line
    }, [activeTab]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setError("");
        setSuccess("");
        if (tab === "details") {
            fetchUserInfo();
            setShowOrders(false);
        } else if (tab === "orders") {
            fetchOrderHistory();
            setShowForm(false);
        }
    };

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Add this edit icon SVG (or use any icon library if available)
    const EditIcon = ({ onClick }) => (
        <span
            onClick={onClick}
            style={{
                cursor: "pointer",
                marginLeft: 8,
                color: "#007bff",
                fontSize: "1.1em",
                verticalAlign: "middle"
            }}
            title="Edit"
        >
            <svg width="16" height="16" fill="currentColor" style={{marginBottom: 2}} viewBox="0 0 16 16">
                <path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-9.439 9.439a.5.5 0 0 1-.168.11l-4 1.5a.5.5 0 0 1-.65-.65l1.5-4a.5.5 0 0 1 .11-.168l9.439-9.439zm.708-.708a1.5 1.5 0 0 0-2.121 0l-9.439 9.439a1.5 1.5 0 0 0-.329.504l-1.5 4a1.5 1.5 0 0 0 1.95 1.95l4-1.5a1.5 1.5 0 0 0 .504-.329l9.439-9.439a1.5 1.5 0 0 0 0-2.121l-2.292-2.292z"/>
            </svg>
        </span>
    );

    const handleSaveEdit = (field) => {
        if (field === "name") {
            const [firstName, ...lastNameArr] = editValue.split(" ");
            setForm({ ...form, firstName, lastName: lastNameArr.join(" ") });
        } else {
            setForm({ ...form, [field]: editValue });
        }
        setEditField("");
    };

    return (
        <div className="container my-4" style={{ maxWidth: 1000 }}>
            <div style={{ display: "flex", gap: "32px" }}>
                {/* Left side tabs */}
                <div style={{
                    minWidth: "220px",
                    background: "#f8f9fa",
                    border: "1px solid #eee",
                    borderRadius: "8px",
                    padding: "24px 0",
                    height: "fit-content"
                }}>
                    <div
                        style={{
                            padding: "12px 24px",
                            cursor: "pointer",
                            background: activeTab === "details" ? "#e9ecef" : "transparent",
                            fontWeight: activeTab === "details" ? 600 : 500,
                            color: "#007bff"
                        }}
                        onClick={() => handleTabClick("details")}
                    >
                        User Details
                    </div>
                    <div
                        style={{
                            padding: "12px 24px",
                            cursor: "pointer",
                            background: activeTab === "orders" ? "#e9ecef" : "transparent",
                            fontWeight: activeTab === "orders" ? 600 : 500,
                            color: "#007bff"
                        }}
                        onClick={() => handleTabClick("orders")}
                    >
                        Order History
                    </div>
                </div>
                {/* Right side content */}
                <div style={{ flex: 1 }}>
                    <h2 className="mb-3">Welcome to Paaka Butti</h2>
                    {activeTab === "details" && showForm && (
                        <div style={{ marginBottom: "24px", background: "#f8f9fa", border: "1px solid #eee", borderRadius: "8px", padding: "18px 24px" }}>
                            {/* Name */}
                            <div style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "8px" }}>
                                {editField === "name" ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            style={{ width: 180, marginRight: 8 }}
                                        />
                                        <button className="btn btn-sm btn-success" onClick={() => handleSaveEdit("name")}>Save</button>
                                        <button className="btn btn-sm btn-secondary" style={{ marginLeft: 4 }} onClick={() => setEditField("")}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                {form.firstName} {form.lastName}
                                        <EditIcon onClick={() => {
                                            setEditField("name");
                                            setEditValue(`${form.firstName} ${form.lastName}`);
                                        }} />
                                    </>
                                )}
                            </div>
                            {/* Phone */}
                            <div style={{ marginBottom: "4px" }}>
                                <strong>Phone:</strong>{" "}
                                {editField === "phone" ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            style={{ width: 140, marginRight: 8 }}
                                        />
                                        <button className="btn btn-sm btn-success" onClick={() => handleSaveEdit("phone")}>Save</button>
                                        <button className="btn btn-sm btn-secondary" style={{ marginLeft: 4 }} onClick={() => setEditField("")}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        {form.phone}
                                        <EditIcon onClick={() => {
                                            setEditField("phone");
                                            setEditValue(form.phone);
                                        }} />
                                    </>
                                )}
                            </div>
                            {/* Email */}
                            <div style={{ marginBottom: "4px" }}>
                                <strong>Email:</strong>{" "}
                                {editField === "email" ? (
                                    <>
                                        <input
                                            type="email"
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            style={{ width: 180, marginRight: 8 }}
                                        />
                                        <button className="btn btn-sm btn-success" onClick={() => handleSaveEdit("email")}>Save</button>
                                        <button className="btn btn-sm btn-secondary" style={{ marginLeft: 4 }} onClick={() => setEditField("")}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        {form.email}
                                        <EditIcon onClick={() => {
                                            setEditField("email");
                                            setEditValue(form.email);
                                        }} />
                                    </>
                                )}
                            </div>
                            {/* Address */}
                            <div>
                                <strong>Address:</strong>{" "}
                                {editField === "address" ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            style={{ width: 220, marginRight: 8 }}
                                        />
                                        <button className="btn btn-sm btn-success" onClick={() => handleSaveEdit("address")}>Save</button>
                                        <button className="btn btn-sm btn-secondary" style={{ marginLeft: 4 }} onClick={() => setEditField("")}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        {(form.address || "-") + (form.pincode ? `, ${form.pincode}` : "")}
                                        <EditIcon onClick={() => {
                                            setEditField("address");
                                            setEditValue(form.address);
                                        }} />
                                    </>
                                )}
                            </div>
                            <div>
                                <strong>Pincode:</strong> {form.pincode || "-"}
                            </div>
                        </div>
                    )}
                    
                    {activeTab === "orders" && showOrders && (
                        <div>
                            <h4>Order History</h4>
                            {orders.length === 0 ? (
                                <div style={{ color: "#888" }}>No orders found.</div>
                            ) : (
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Date</th>
                                            <th>Total</th>
                                            <th>Order Items</th>
                                            <th>Delivery Mode</th>
                                            <th>Delivery Address</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order, idx) => (
                                            <tr key={idx}>
                                                <td>{order.orderId || order.id || idx + 1}</td>
                                                <td>
                                                    {order.orderDate
                                                        ? new Date(order.orderDate).toLocaleDateString("en-GB")
                                                        : ""}
                                                </td>
                                                <td>
                                                    ₹{order.grandTotal}
                                                </td>
                                                <td>
                                                    {Array.isArray(order.orderItems) && order.orderItems.length > 0 ? (
                                                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                                                            {order.orderItems.map((item, i) => (
                                                                <li key={i}>
                                                                    {item.name} ({item.size || item.quantity || item.qty || "-"}) x {item.count}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <span style={{ color: "#888" }}>-</span>
                                                    )}
                                                </td>
                                                <td>{order.deliveryMode || "-"}</td>
                                                <td>{order.deliveryAddress || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                    {error && !showForm && !showOrders && (
                        <div className="alert alert-danger py-1 my-1">{error}</div>
                    )}
                </div>
            </div>
        </div>
    );
}