import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";

export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [lastKey, setLastKey] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const API_URL = "https://n5fpw7cag6.execute-api.ap-south-1.amazonaws.com/dev/getAllOrdersPaged";

    // Fetch orders (initial and paged)
    const fetchOrders = (reset = false) => {
        setLoading(true);
        let url = `${API_URL}?service=getAllOrdersPaged&pageSize=${pageSize}`;
        if (!reset && lastKey) {
            // lastKey is now an object: { orderId, phoneNumber }
            if (lastKey.orderId && lastKey.phoneNumber) {
                url += `&lastKey=${encodeURIComponent(lastKey.orderId)}&lastOrderId=${encodeURIComponent(lastKey.orderId)}&lastPhoneNumber=${encodeURIComponent(lastKey.phoneNumber)}`;
            }
        }
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch orders");
                return res.json();
            })
            .then(data => {
                const newOrders = Array.isArray(data.orders) ? data.orders : data;
                setOrders(reset ? newOrders : [...orders, ...newOrders]);
                if (data.lastKey) {
                    // If API returns lastKey as object with orderId and phoneNumber
                    setLastKey(data.lastKey);
                    setHasMore(true);
                } else if (newOrders.length > 0) {
                    // Use last order's orderId and phoneNumber for next page
                    const lastOrder = newOrders[newOrders.length - 1];
                    if (lastOrder.orderId && lastOrder.phoneNumber) {
                        setLastKey({
                            orderId: lastOrder.orderId,
                            phoneNumber: lastOrder.phoneNumber
                        });
                    } else {
                        setLastKey(null);
                    }
                    setHasMore(true);
                } else {
                    setHasMore(false);
                }
                setLoading(false);
            })
            .catch(err => {
                setError("Could not load orders.");
                setLoading(false);
            });
    };

    useEffect(() => {
        setOrders([]);
        setLastKey(null);
        setHasMore(true);
        fetchOrders(true);
        // eslint-disable-next-line
    }, [pageSize]);

    const handleLoadMore = () => {
        fetchOrders();
    };

    // --- Order statistics by status ---
    const statusCounts = orders.reduce((acc, order) => {
        const status = order.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const pieData = {
        labels: Object.keys(statusCounts),
        datasets: [
            {
                data: Object.values(statusCounts),
                backgroundColor: [
                    "#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#8BC34A"
                ],
            },
        ],
    };

    return (
        <div className="container my-4" style={{ maxWidth: 1200 }}>
            <h2>All Orders (Admin View)</h2>
            <div style={{ marginBottom: 16 }}>
                <label>
                    Page Size:&nbsp;
                    <select
                        value={pageSize}
                        onChange={e => setPageSize(Number(e.target.value))}
                        style={{ width: 80, padding: 4 }}
                    >
                        {[...Array(10)].map((_, i) => {
                            const size = (i + 1) * 5;
                            return (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            );
                        })}
                    </select>
                </label>
            </div>
            {/* Order Statistics */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <h5>Order Status Statistics</h5>
                    <ul>
                        {Object.entries(statusCounts).map(([status, count]) => (
                            <li key={status}>
                                <strong>{status}:</strong> {count}
                            </li>
                        ))}
                        <li>
                            <strong>Total Orders:</strong> {orders.length}
                        </li>
                    </ul>
                </div>
                <div className="col-md-6 d-flex flex-column align-items-center justify-content-center">
                    <h5>Order Status Snapshot</h5>
                    <div style={{ width: 180, height: 180 }}>
                        <Pie data={pieData} options={{
                            plugins: {
                                legend: { position: "bottom", labels: { boxWidth: 14, font: { size: 12 } } }
                            },
                            maintainAspectRatio: false
                        }} />
                    </div>
                </div>
            </div>
            {loading && orders.length === 0 && <div>Loading all orders...</div>}
            {error && <div style={{ color: "red" }}>{error}</div>}
            {orders.length === 0 && !loading ? (
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
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, idx) => (
                            <tr key={order.orderId || order.id || idx}>
                                <td>{order.userName || "-"}</td>
                                <td>{order.phoneNumber || "-"}</td>
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
                                <td>{order.status || "Unknown"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {hasMore && !loading && orders.length > 0 && (
                <div className="text-center my-3">
                    <button className="btn btn-primary" onClick={handleLoadMore}>
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
}