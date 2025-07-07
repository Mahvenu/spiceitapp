import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReviewProduct from "./ReviewProduct";

export default function UserInfo() {
    const location = useLocation();
    // Check for navigation state to set initial tab
    const initialTab = location.state?.tab || "details";
    const [activeTab, setActiveTab] = useState(initialTab);
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
    const [showForm, setShowForm] = useState(initialTab === "details");
    const [showOrders, setShowOrders] = useState(initialTab === "orders");
    const [editField, setEditField] = useState("");
    const [editValue, setEditValue] = useState("");
    const [reviewOrder, setReviewOrder] = useState(null);
    const [showCancelPrompt, setShowCancelPrompt] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelOrderId, setCancelOrderId] = useState(null);

    // Fetch user info
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
                        tempAddress: user.tempAddressList || "",
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

    // Fetch data on mount and when activeTab changes
    useEffect(() => {
        if (activeTab === "details") {
            fetchUserInfo();
            setShowForm(true);
            setShowOrders(false);
        } else if (activeTab === "orders") {
            fetchOrderHistory();
            setShowForm(false);
            setShowOrders(true);
        } else if (activeTab === "review") {
            setShowForm(false);
            setShowOrders(false);
        }
        // eslint-disable-next-line
    }, [activeTab]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setError("");
        setSuccess("");
        if (tab === "details") {
            setShowForm(true);
            setShowOrders(false);
        } else if (tab === "orders") {
            setShowForm(false);
            setShowOrders(true);
        } else if (tab === "review") {
            setShowForm(false);
            setShowOrders(false);
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

    const handleConfirmCancel = async () => {
        if (!cancelOrderId || !cancelReason) return;
        try {
            // Pass service, orderId, and reason as query parameters
            const params = new URLSearchParams({
                service: "cancelOrder",
                orderId: cancelOrderId,
                reason: cancelReason,
                phoneNumber: form.phone
            });
            const url = `https://n5fpw7cag6.execute-api.ap-south-1.amazonaws.com/dev/cancelOrder?${params.toString()}`;
            const response = await fetch(url, {
                method: "PUT"
            });
            if (!response.ok) throw new Error("Failed to cancel order");
            setShowCancelPrompt(false);
            setCancelReason("");
            setCancelOrderId(null);
            setSuccess("Order cancelled successfully.");
            // Optionally, refresh order list here
        } catch (err) {
            setError("Failed to cancel order. Please try again.");
        }
    };

    return (
        <div className="container my-4" style={{ maxWidth: 1000 }}>
            <div style={{ display: "flex", gap: "32px" ,color: "#007bfg"}}>
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
                            color: "#333"
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
                            color: "#333"
                        }}
                        onClick={() => handleTabClick("orders")}
                    >
                        My Orders
                    </div>
                    <div
                        style={{
                            padding: "12px 24px",
                            cursor: "pointer",
                            background: activeTab === "review" ? "#e9ecef" : "transparent",
                            fontWeight: activeTab === "review" ? 600 : 500,
                            color: "#333"
                        }}
                        onClick={() => handleTabClick("review")}
                    >
                        Review Order
                    </div>
                </div>
                {/* Right side content */}
                <div style={{ flex: 1 }}>
                    {/* Only show heading on details and orders tab */}
                    {(activeTab === "details" || activeTab === "orders") && (
                        <h2 className="mb-3">Welcome to Paaka Butti</h2>
                    )}
                    {activeTab === "details" && showForm && (
                        <div
                            style={{
                                marginBottom: "24px",
                                background: "#f8f9fa",
                                border: "1px solid #eee",
                                borderRadius: "8px",
                                padding: "18px 24px",
                                textAlign: "left"
                            }}
                        >
                            {/* Name */}
                            <div style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "8px" }}>
                                {editField === "name" ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            style={{ width: 180, marginRight: 8, alignItems: "Left" }}
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
                            {/* Address (without pincode) */}
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
                                        {form.address || "-"}
                                        <EditIcon onClick={() => {
                                            setEditField("address");
                                            setEditValue(form.address);
                                        }} />
                                    </>
                                )}
                            </div>
                            {/* Temp Address (with edit option) */}
                            <div style={{ marginTop: "8px" }}>
                                <strong>Temporary Address:</strong>{" "}
                                {editField === "tempAddress" ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            style={{ width: 220, marginRight: 8 }}
                                        />
                                        <button className="btn btn-sm btn-success" onClick={() => handleSaveEdit("tempAddress")}>Save</button>
                                        <button className="btn btn-sm btn-secondary" style={{ marginLeft: 4 }} onClick={() => setEditField("")}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        {form.tempAddress || "-"}
                                        <EditIcon onClick={() => {
                                            setEditField("tempAddress");
                                            setEditValue(form.tempAddress || "");
                                        }} />
                                    </>
                                )}
                            </div>
                            {/* Pincode */}
                            <div style={{ marginTop: "8px" }}>
                                <strong>Pincode:</strong>{" "}
                                {editField === "pincode" ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            style={{ width: 220, marginRight: 8 }}
                                        />
                                        <button className="btn btn-sm btn-success" onClick={() => handleSaveEdit("pincode")}>Save</button>
                                        <button className="btn btn-sm btn-secondary" style={{ marginLeft: 4 }} onClick={() => setEditField("")}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        {form.pincode || "-"}
                                        <EditIcon onClick={() => {
                                            setEditField("pincode");
                                            setEditValue(form.tempAddressList || "");
                                        }} />
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {activeTab === "orders" && showOrders && (
                        <div>
                            <h4>Order History</h4>
                            {orders.length === 0 ? (
                                <div style={{ color: "#888" }}>No orders found.</div>
                            ) : (
                                <table className="table table-bordered" style={{font: "small-caption"}}>

                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Date</th>
                                            <th>Total</th>
                                            <th>Order Items</th>
                                            <th>Delivery Mode</th>
                                            <th>Delivery Address</th>
                                            <th>Order Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order, idx) => {
    const orderDate = new Date(order.orderDate);
    const now = new Date();
    const diffHrs = (now - orderDate) / (1000 * 60 * 60);
    const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
    const canCancel = diffHrs <= 24;
    const canRate = diffDays <= 31; // 1 month ≈ 31 days

    return (
      <tr key={idx}>
        <td>{order.orderId || order.id || idx + 1}</td>
        <td>
          {order.orderDate
            ? orderDate.toLocaleDateString("en-GB")
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
        <td>
          {order.status || "-"}
         </td>
        <td>
          {canCancel && order.status !== "cancelled" && (
            <a
              href="#"
              style={{ color: "#dc3545", textDecoration: "underline", cursor: "pointer", marginRight: 8 }}
              onClick={e => {
                e.preventDefault();
                setCancelOrderId(order.orderId || order.id);
                setShowCancelPrompt(true);
              }}
            >
              Cancel Order
            </a>
          )}
          {canRate && (
            <a
              href="#"
              style={{ color: "#007bff", textDecoration: "underline", cursor: "pointer" }}
              onClick={e => {
                e.preventDefault();
                setReviewOrder(order); // <-- set the order being reviewed
                setActiveTab("review");
              }}
            >
              Rate &amp; Review
            </a>
          )}
        </td>
      </tr>
    );
  })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                    {activeTab === "review" && (
                        <div>
                            <ReviewProduct order={reviewOrder} />
                        </div>
                    )}
                    {error && !showForm && !showOrders && (
                        <div className="alert alert-danger py-1 my-1">{error}</div>
                    )}
                </div>
            </div>
            {showCancelPrompt && (
  <div style={{
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.3)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}>
    <div style={{
      background: "#fff",
      padding: 24,
      borderRadius: 8,
      minWidth: 320,
      boxShadow: "0 2px 12px rgba(0,0,0,0.15)"
    }}>
      <h5 style={{ marginBottom: 12 }}>Cancel Order</h5>
      <div style={{ marginBottom: 10 }}>
        <label>
          Reason for cancellation:
          <select
            className="form-control"
            style={{ marginTop: 8 }}
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
          >
            <option value="">Select a reason...</option>
            <option value="Ordered by mistake">Ordered by mistake</option>
            <option value="Found a better price elsewhere">Found a better price elsewhere</option>
            <option value="Need to change address or details">Need to change address or details</option>
            <option value="Item will not arrive on time">Item will not arrive on time</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setShowCancelPrompt(false);
            setCancelReason("");
            setCancelOrderId(null);
          }}
        >
          Close
        </button>
        <button
          className="btn btn-danger"
          disabled={!cancelReason.trim()}
          onClick={handleConfirmCancel}
        >
          Confirm Cancel
        </button>
      </div>
    </div>
  </div>
)}
        </div>
    );
}