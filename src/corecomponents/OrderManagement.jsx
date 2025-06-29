import React, { useEffect, useState } from "react";


export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [customers, setCustomers] = useState([]);
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "", pincode: "" });
    const [editIdx, setEditIdx] = useState(null);
    const [editCustomer, setEditCustomer] = useState({});

    useEffect(() => {
        // Replace the URL below with your actual API endpoint for fetching all orders
        fetch("/api/getAllOrders")
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch orders");
                return res.json();
            })
            .then(data => {
                setOrders(data);
                setLoading(false);
            })
            .catch(err => {
                setError("Could not load orders.");
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading all orders...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <div className="container my-4" style={{ maxWidth: 1200 }}>
            <h2>All Orders (Admin View)</h2>
            {orders.length === 0 ? (
                <div>No orders found.</div>
            ) : (
                <table className="table table-bordered" style={{ font: "small-caption" }}>
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>User Phone</th>
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
                            <tr key={order.orderId || order.id || idx}>
                                <td>{order.userName || "-"}</td>
                                <td>{order.userPhone || "-"}</td>
                                <td>{order.orderId || order.id || "-"}</td>
                                <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString("en-GB") : "-"}</td>
                                <td>₹{order.grandTotal}</td>
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
    );
}