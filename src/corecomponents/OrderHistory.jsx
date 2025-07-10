import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReviewProduct from "./ReviewProduct";

export default function OrderHistory() {
    
    const [activeTab, setActiveTab] = useState("orders");
    
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
    const [reviewOrder, setReviewOrder] = useState(null); // <-- state to track the order being reviewed
    const [showCancelPrompt, setShowCancelPrompt] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null); // Track expanded order
    const navigate = useNavigate();

    // Fetch user info when "User Details" tab is clicked or on initial mount
    

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
            const phoneFromSession = sessionStorage.getItem("welcomePhone") || "";
            const params = new URLSearchParams({
                service: "cancelOrder",
                orderId: cancelOrderId,
                reason: cancelReason,
                phoneNumber: phoneFromSession
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

    // Fetch order history when component mounts or when activeTab changes to "orders"
    useEffect(() => {
        if (activeTab === "orders") {
            fetchOrderHistory();
        }
    }, [activeTab]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setShowForm(tab === "details");
        setShowOrders(tab === "orders");
        if (tab === "review") setShowOrders(false);
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
                    {activeTab === "orders" && showOrders && (
                        <div>
                            <h4>Order History</h4>
                            {orders.length === 0 ? (
                                <div style={{ color: "#888" }}>No orders found.</div>
                            ) : (
                                <table className="table table-bordered" style={{ font: "small-caption" }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: 40 }}></th>
                                            <th>Order ID</th>
                                            <th>Date</th>
                                            <th>Total</th>
                                            <th>Order Items</th>
                                            <th></th>
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
    const isExpanded = expandedOrder === (order.orderId || order.id || idx + 1);

    return (
      <React.Fragment key={idx}>
        {/* Parent order line */}
        <tr>
          <td>
            <button
              className="btn btn-link"
              style={{ padding: 0, fontSize: 16 }}
              onClick={() =>
                setExpandedOrder(isExpanded ? null : (order.orderId || order.id || idx + 1))
              }
            >
              {isExpanded ? "▲" : "▼"}
            </button>
          </td>
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
              <div style={{ marginTop: 20 }}>
                {order.orderItems.map((item, i) => (
                  <div key={i} style={{ padding: 2,textAlign: "left" }}>
                    {item.count} {item.name} ({item.size || item.quantity || item.qty || "-"}) 
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ color: "#888" }}>-</span>
            )}
          </td>
          <div style={{ marginTop: 20 }}>
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
              
            </div>
        </tr>
        {/* Expanded details */}
        {isExpanded && (
          <tr>
            <td colSpan={5} style={{ background: "#f8f9fa" }}>
              <div style={{ padding: "2px 2px" }}>
                <div style={{ padding: "6px", marginLeft: 100, textAlign: "left" }}>
                  <strong style={{ padding: "6px"}}>Delivery Mode:</strong> {order.deliveryMode || "-"}
                </div>
                <div style={{ padding: "6px", marginLeft: 100, textAlign: "left" }}>
                  <strong style={{ padding: "6px"}}>Delivery Address:</strong> {order.deliveryAddress || "-"}
                </div>
                <div style={{ padding: "6px", marginLeft: 100, textAlign: "left" }}>
                  <strong style={{ padding: "6px"}}>Order Status:</strong> {order.status || "-"}
                </div>
                {/* Price and Qty Breakup */}
                <div style={{ marginTop: 12 }}>
                  <table className="table table-sm" style={{ marginTop: 6, minWidth: 620 }}>
                    <thead>
                      <tr>
                        <th style={{ fontWeight: 500 }}>Product</th>
                        <th style={{ fontWeight: 500 }}>Image</th>
                        <th style={{ fontWeight: 500 }}>Qty</th>
                        <th style={{ fontWeight: 500 }}>Unit Price</th>
                        <th style={{ fontWeight: 500 }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItems && order.orderItems.map((item, i) => (
                        <tr key={i}>
                          <td>{item.name} {item.size ? `(${item.size})` : ""}</td>
                          <td>
                            to be added
                          </td>
                          <td>{item.count}</td>
                          <td>₹{item.unitPrice || item.price || "-"}</td>
                          <td>₹{(item.unitPrice || item.price) && item.count ? (item.unitPrice || item.price) * item.count : "-"}</td>
                          {canRate && (
                <a
                  href="#"
                      style={{ color: "#007bff", textDecoration: "bold", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                  onClick={e => {
                    e.preventDefault();
                    setReviewOrder(order);
                    setActiveTab("review");
                  }}
                >
                  <span style={{ color: "#ffc107", fontSize: "1.2em", marginRight: 4 }}>★</span> & Review
                </a>
              )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
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