import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
import '../customstyles/spiceprod.css';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import CartDetails from "./CartDetails";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { FaShoppingCart } from "react-icons/fa";

export default function Home() {
    const [products, setProducts] = useState([]); // State to store product data
    const [loading, setLoading] = useState(true); // State for loading status
    const [error, setError] = useState(null); // State for errors
    const imageBasePath = 'images/';
    const getImagePath = (product) => `${imageBasePath}${product.productName}.jpg`;
    const [selected, setSelected] = useState("");
    
    const handleChange = (event) => {
          setSelected(event.target.value);
          console.log("Selected:", event.target.value);
        };

    // Cart state: maps productId to quantity
    const [cart, setCart] = useState({});
    const [selectedQty, setSelectedQty] = useState({}); // Track selected qty per product
    const [itemCount, setItemCount] = useState({}); // New state for number of items
    const [showCart, setShowCart] = useState(false);

    // Add to cart for a specific product and quantity
    const handleAddToCart = (productId, qtyStr) => {
        const key = `${productId}|${qtyStr}`;
        const count = Number(itemCount[key]) || 1;
        setCart(prevCart => {
            const prevItem = prevCart[key] || { count: 0, qtyStr };
            return {
                ...prevCart,
                [key]: {
                    count: prevItem.count + count,
                    qtyStr: qtyStr
                }
            };
        });
    };

    // Remove/reduce from cart
    const handleRemoveFromCart = (key) => {
        setCart(prevCart => {
            const item = prevCart[key];
            if (!item) return prevCart;
            if (item.count > 1) {
                return {
                    ...prevCart,
                    [key]: { ...item, count: item.count - 1 }
                };
            } else {
                const updatedCart = { ...prevCart };
                delete updatedCart[key];
                return updatedCart;
            }
        });
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                //const prodInfoResp = await axios.get("https://r46jrehpue.execute-api.ap-south-1.amazonaws.com/spicedev?service=productService");
                const prodInfoResp = await axios.get("https://gdhfo6zldj.execute-api.ap-south-1.amazonaws.com/dev/getInventory?service=getInventory");
                console.log("product response is ", JSON.stringify(prodInfoResp.data, null, 2));
                setProducts(prodInfoResp.data)
                setLoading(false);
            } catch (err) {
                console.error('Error occurred:', err); // Logs the error object
                console.error('Stack Trace:', err.stack);
                setError(err.message); // Set error state if the request fails
                setLoading(false); // Set loading to false on error
            }
        };
        fetchProducts();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }
     
    // Cart badge: sum all counts
    const cartCount = Object.values(cart).reduce((a, b) => a + (b.count || 0), 0);

    // Cart summary for tooltip
    const cartSummary = Object.entries(cart)
        .map(([key, item]) => {
            const [productId, qtyStr] = key.split('|');
            const product = products.find(p => p.productId === productId);
            const name = product?.inventory?.Name || productId;
            return `${name} (${qtyStr}): ${item.count}`;
        })
        .join('\n');

    return (
        <div className="container">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h1 className="my-4">Paaka Butti</h1>
                <OverlayTrigger
                    placement="bottom"
                    overlay={
                        <Tooltip id="cart-tooltip">
                            {cartSummary || "Cart is empty"}
                        </Tooltip>
                    }
                >
                    <button
                        className="btn btn-outline-primary"
                        style={{ position: "relative" }}
                        onClick={() => setShowCart(true)}
                    >
                        <FaShoppingCart size={24} />
                        {cartCount > 0 && (
                            <span style={{
                                position: "absolute",
                                top: "-8px",
                                right: "-8px",
                                background: "red",
                                color: "white",
                                borderRadius: "50%",
                                padding: "2px 6px",
                                fontSize: "12px"
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </button>
                </OverlayTrigger>
            </div>
            {showCart ? (
                <CartDetails
                    cart={cart}
                    products={products}
                    onBack={() => setShowCart(false)}
                    handleRemoveFromCart={handleRemoveFromCart}
                />
            ) : (
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
                                    <p className="price">₹{price}</p>
                                    <label>
                                        <select
                                            value={selectedQty[product.productId] || availableQty[0]}
                                            onChange={e =>
                                                setSelectedQty({
                                                    ...selectedQty,
                                                    [product.productId]: e.target.value
                                                })
                                            }
                                        >
                                            {availableQty.map(q => (
                                                <option key={q} value={q}>{q}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label style={{ marginLeft: "10px" }}>
                                        <div style={{ display: "flex", alignItems: "center" }}>
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
                                            handleAddToCart(
                                                product.productId,
                                                selectedQty[product.productId] || availableQty[0]
                                            )
                                        }
                                    >
                                        Add to Cart
                                    </button>
                                    {/* Show all cart entries for this product */}
                                    {Object.entries(cart)
                                        .filter(([key]) => key.startsWith(product.productId + "|"))
                                        .map(([key, item]) => {
                                            const [, qtyStr] = key.split('|');
                                            return (
                                                <span key={key} className="cart-count" style={{ display: "block" }}>
                                                    In Cart: {qtyStr} × {item.count}
                                                </span>
                                            );
                                        })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}