import axios from "axios";
import React, { useState } from "react";
import '../customstyles/spiceprod.css';

export default function Home({
    cart,
    products,
    handleAddToCart,
    handleRemoveFromCart,
}) {
    const imageBasePath = 'images/';
    const getImagePath = (product) => `${imageBasePath}${product.productName}.jpg`;
    const [selectedQty, setSelectedQty] = useState({});
    const [itemCount, setItemCount] = useState({});
    const [showPrompt, setShowPrompt] = useState(false);
    const [promptMsg, setPromptMsg] = useState("");

    // Show prompt on add to cart
    const handleAdd = (productId, qtyStr) => {
        const key = `${productId}|${qtyStr}`;
        const count = Number(itemCount[key]) || 1;
        handleAddToCart(productId, qtyStr, count);
        const product = products.find(p => p.productId === productId);
        const name = product?.inventory?.Name || productId;
        setPromptMsg(`Added ${count} item${count > 1 ? "s" : ""} of ${name} (${qtyStr}) to cart!`);
        setShowPrompt(true);
        setTimeout(() => setShowPrompt(false), 1500);
    };

    return (
        <div className="container">
            {/* Soft prompt */}
            {showPrompt && (
                <div
                    style={{
                        position: "fixed",
                        top: 20,
                        right: 20,
                        background: "#28a745",
                        color: "white",
                        padding: "12px 24px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        zIndex: 9999,
                        fontWeight: "bold",
                        fontSize: "1rem"
                    }}
                >
                    {promptMsg}
                </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h1 className="my-4">Paaka Butti</h1>
                {/* Cart icon and summary are now in the header (App.jsx) */}
            </div>
            <div className="card-container">
                {products.map((product) => {
                    const inventory = product.inventory || {};
                    const name = inventory.Name || product.productId;
                    const price = inventory.UnitPrice || 'N/A';
                    const imageName = name.replace(/\s+/g, '') || product.productId;
                    const availableQty = inventory.availableQty
                        ? inventory.availableQty.split(',').map(q => q.trim())
                        : ['50g', '100g', '250g', '500g', '1kg'];
                    const selectedKey = `${product.productId}|${selectedQty[product.productId] || availableQty[0]}`;
                    return (
                        <div key={product.productId} className="card">
                            <img
                                src={getImagePath({ productName: imageName })}
                                alt={name}
                                className="card-image"
                            />
                            <div className="card-body">
                                <h3>{name}</h3>
                                <label>
                                    <select
                                        value={selectedQty[product.productId] || availableQty[0]}
                                        onChange={e =>
                                            setSelectedQty({
                                                ...selectedQty,
                                                [product.productId]: e.target.value
                                            })
                                        }
                                        style={{ marginRight: "10px" }}
                                    >
                                        {availableQty.map(q => (
                                            <option key={q} value={q}>
                                                {q}
                                            </option>
                                        ))}
                                    </select>
                                    <span style={{ fontWeight: "bold", marginLeft: "8px" }}>
                                        ₹{
                                            (() => {
                                                const qtyStr = selectedQty[product.productId] || availableQty[0];
                                                const pricePerKg = Number(inventory.UnitPrice) || 0;
                                                let grams = 0;
                                                if (qtyStr.toLowerCase().includes('kg')) {
                                                    grams = parseFloat(qtyStr) * 1000;
                                                } else if (qtyStr.toLowerCase().includes('g')) {
                                                    grams = parseFloat(qtyStr);
                                                }
                                                return grams && pricePerKg
                                                    ? Math.round((pricePerKg / 1000) * grams)
                                                    : pricePerKg;
                                            })()
                                        }
                                    </span>
                                </label>
                                <label style={{ marginLeft: "10px", width: "100%" }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "100%"
                                    }}>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            style={{ minWidth: 32 }}
                                            onClick={() =>
                                                setItemCount({
                                                    ...itemCount,
                                                    [selectedKey]: Math.max(1, (Number(itemCount[selectedKey]) || 1) - 1)
                                                })
                                            }
                                            disabled={(Number(itemCount[selectedKey]) || 1) <= 1}
                                        >-</button>
                                        <span style={{ margin: "0 10px", minWidth: 20, textAlign: "center" }}>
                                            {itemCount[selectedKey] || 1}
                                        </span>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            style={{ minWidth: 32 }}
                                            onClick={() =>
                                                setItemCount({
                                                    ...itemCount,
                                                    [selectedKey]: (Number(itemCount[selectedKey]) || 1) + 1
                                                })
                                            }
                                        >+</button>
                                    </div>
                                </label>
                                <button
                                    className="add-to-cart"
                                    style={{ marginLeft: "10px" }}
                                    onClick={() =>
                                        handleAdd(
                                            product.productId,
                                            selectedQty[product.productId] || availableQty[0]
                                        )
                                    }
                                >
                                    Add to Cart
                                </button>
                                {(() => {
                                    const qtyStr = selectedQty[product.productId] || availableQty[0];
                                    const key = `${product.productId}|${qtyStr}`;
                                    const item = cart[key];
                                    return item && item.count > 0 ? (
                                        <span style={{
                                            marginLeft: "12px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            fontWeight: "bold",
                                            fontSize: "1rem",
                                            color: "#28a745"
                                        }}>
                                            Added
                                            <span style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                marginLeft: "6px",
                                                width: "18px",
                                                height: "18px",
                                                borderRadius: "50%",
                                                background: "#28a745",
                                                color: "white",
                                                textAlign: "center",
                                                fontWeight: "bold",
                                                fontSize: "0.75rem",
                                                lineHeight: "18px",
                                                verticalAlign: "middle"
                                            }}>
                                                {item.count}
                                            </span>
                                        </span>
                                    ) : null;
                                })()}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}