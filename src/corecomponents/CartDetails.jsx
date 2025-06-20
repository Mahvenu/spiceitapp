import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function CartDetails({ cart, products, onBack, handleRemoveFromCart }) {
    const [orderPlaced, setOrderPlaced] = useState(false);
    const navigate = useNavigate();

    const cartItems = Object.entries(cart)
        .map(([key, { qtyStr, count }]) => {
            const [productId, qty] = key.split('|');
            const product = products.find(p => p.productId === productId);
            if (!product) return null;
            const inventory = product.inventory || {};
            const name = inventory.Name || productId;
            const pricePerKg = Number(inventory.UnitPrice) || 0;

            // Convert qtyStr to grams
            let grams = 0;
            if (qty && qty.toLowerCase().includes('kg')) {
                grams = parseFloat(qty) * 1000;
            } else if (qty && qty.toLowerCase().includes('g')) {
                grams = parseFloat(qty);
            }

            // Calculate price for selected quantity
            const priceForSelectedQty = grams && pricePerKg
                ? Math.round((pricePerKg / 1000) * grams)
                : pricePerKg;

            const total = priceForSelectedQty * (count || 1);

            return {
                key,
                productId,
                name,
                qtyStr: qty,
                count,
                priceForSelectedQty,
                total
            };
        })
        .filter(Boolean);

    const grandTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

    const handlePlaceOrder = () => {
        // You can add your order placement logic here (API call, etc.)
        setOrderPlaced(true);
        setTimeout(() => {
            navigate("/orderplacement");
        }, 1000);
    };

    return (
        <div className="container my-4">
            <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center bg-warning" style={{ background: "#FFD600" }}>
                    <h3 className="mb-0">🛒 Cart Details</h3>
                    <button className="btn btn-light btn-sm" onClick={onBack}>
                        &larr; Back to Products
                    </button>
                </div>
                <div className="card-body">
                    {cartItems.length === 0 ? (
                        <div className="alert alert-info text-center">
                            Your cart is empty.
                        </div>
                    ) : (
                        <>
                        <div className="table-responsive">
                            <table className="table table-striped align-middle text-center" style={{ verticalAlign: "middle" }}>
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: "30%" }}>Product</th>
                                        <th style={{ width: "15%" }}>Pack Size</th>
                                        <th style={{ width: "20%" }}>No. of Items</th>
                                        <th style={{ width: "15%" }}>Unit Price (₹)</th>
                                        <th style={{ width: "20%" }}>Total (₹)</th>
                                        <th style={{ width: "10%" }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map(item => (
                                        <tr key={item.key}>
                                            <td style={{ verticalAlign: "middle" }}>{item.name}</td>
                                            <td style={{ verticalAlign: "middle" }}>
                                                <span className="badge bg-secondary">{item.qtyStr}</span>
                                            </td>
                                            <td style={{ verticalAlign: "middle" }}>
                                                <span className="badge bg-info text-dark" style={{ fontSize: "1rem", padding: "8px 16px" }}>{item.count}</span>
                                            </td>
                                            <td style={{ verticalAlign: "middle" }}>₹{item.priceForSelectedQty}</td>
                                            <td style={{ verticalAlign: "middle" }}>
                                                <strong>₹{item.total}</strong>
                                            </td>
                                            <td style={{ verticalAlign: "middle" }}>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleRemoveFromCart(item.key)}
                                                    title={item.count > 1 ? "Reduce by 1" : "Remove from cart"}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan={4} className="text-end"><strong>Grand Total</strong></td>
                                        <td><strong>₹{grandTotal}</strong></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="text-end mt-3">
                            <button
                                className="btn btn-success"
                                onClick={handlePlaceOrder}
                                disabled={orderPlaced}
                            >
                                {orderPlaced ? "Placing Order..." : "Place Order"}
                            </button>
                        </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}