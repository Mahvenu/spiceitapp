import React from "react";

export default function CartDetails({ cart, products, onBack }) {
    // cart: { [productId]: { qtyStr, count } }
    const cartItems = Object.entries(cart)
        .map(([productId, { qtyStr, count }]) => {
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

            // Calculate price for selected quantity
            const priceForSelectedQty = grams && pricePerKg
                ? Math.round((pricePerKg / 1000) * grams)
                : pricePerKg;

            const total = priceForSelectedQty * (count || 1);

            return {
                productId,
                name,
                qtyStr,
                count,
                priceForSelectedQty,
                total
            };
        })
        .filter(Boolean);

    const grandTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

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
                        <div className="table-responsive">
                            <table className="table table-striped align-middle text-center" style={{ verticalAlign: "middle" }}>
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: "30%" }}>Product</th>
                                        <th style={{ width: "15%" }}>Pack Size</th>
                                        <th style={{ width: "20%" }}>No. of Items</th>
                                        <th style={{ width: "15%" }}>Unit Price (₹)</th>
                                        <th style={{ width: "20%" }}>Total (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map(item => (
                                        <tr key={item.productId}>
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
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan={4} className="text-end"><strong>Grand Total</strong></td>
                                        <td><strong>₹{grandTotal}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}