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

    // Add to cart for a specific product
    const handleAddToCart = (productId, qty) => {
        const count = Number(itemCount[productId]) || 1;
        setCart((prevCart) => ({
            ...prevCart,
            [productId]: (prevCart[productId] || 0) + count
        }));
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
     
    const cartSummary = Object.entries(cart)
    .map(([productId, count]) => {
        const product = products.find(p => p.productId === productId);
        const name = product?.inventory?.Name || productId;
        return `${name}: ${count}`;
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
                        {Object.values(cart).reduce((a, b) => a + Number(b), 0) > 0 && (
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
                                {Object.values(cart).reduce((a, b) => a + Number(b), 0)}
                            </span>
                        )}
                    </button>
                </OverlayTrigger>
            </div>
            {showCart ? (
                <CartDetails cart={cart} products={products} onBack={() => setShowCart(false)} />
            ) : (
                <div className="card-container">
                    {products.map((product) => {
                        const inventory = product.inventory || {};
                        const name = inventory.Name || product.productId;
                        const qty = inventory.QtyInStock !== undefined ? `Qty: ${inventory.QtyInStock}` : '';
                        const price = inventory.UnitPrice || 'N/A';
                        const imageName = name.replace(/\s+/g, '') || product.productId;
                        const availableQty = inventory.availableQty
                            ? inventory.availableQty.split(',').map(q => q.trim())
                            : ['50g', '100g', '250g', '500g', '1kg'];
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
                                                        [product.productId]: Math.max(1, (Number(itemCount[product.productId]) || 1) - 1)
                                                    })
                                                }
                                                disabled={(Number(itemCount[product.productId]) || 1) <= 1}
                                            >-</button>
                                            <span style={{ margin: "0 10px", minWidth: 20, textAlign: "center" }}>
                                                {itemCount[product.productId] || 1}
                                            </span>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                style={{ minWidth: 32 }}
                                                onClick={() =>
                                                    setItemCount({
                                                        ...itemCount,
                                                        [product.productId]: (Number(itemCount[product.productId]) || 1) + 1
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
                                    {cart[product.productId] > 0 && (
                                        <span className="cart-count">In Cart: {cart[product.productId]}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}