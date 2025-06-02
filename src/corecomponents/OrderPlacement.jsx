import React, { useEffect, useState } from "react";
import axios from "axios";
import '../customstyles/spiceprod.css';

export default function OrderPlacement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const prodInfoResp = await axios.get("https://gdhfo6zldj.execute-api.ap-south-1.amazonaws.com/dev/getInventory?service=getInventory");
                setProducts(prodInfoResp.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleQtyChange = (productId, maxQty, e) => {
        const value = Math.max(0, Math.min(Number(e.target.value), maxQty || 99));
        setOrder({ ...order, [productId]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    if (submitted) {
        const orderedItems = products.filter(p => order[p.productId] > 0);
        return (
            <div className="container">
                <h2>Order Summary</h2>
                {orderedItems.length === 0 ? (
                    <p>No items ordered.</p>
                ) : (
                    <ul>
                        {orderedItems.map(product => {
                            const inventory = product.inventory || {};
                            const name = inventory.Name || product.productId;
                            const price = Number(inventory.UnitPrice) || 0;
                            const qty = order[product.productId];
                            return (
                                <li key={product.productId}>
                                    {name} - Qty: {qty} - Total: ₹{price * qty}
                                </li>
                            );
                        })}
                    </ul>
                )}
                <button onClick={() => setSubmitted(false)}>Place Another Order</button>
            </div>
        );
    }

    return (
        <div className="container">
            <h2>Place Your Order</h2>
            <form onSubmit={handleSubmit}>
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Available</th>
                            <th>Price (₹)</th>
                            <th>Order Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => {
                            const inventory = product.inventory || {};
                            const name = inventory.Name || product.productId;
                            const qtyInStock = Number(inventory.QtyInStock) || 0;
                            const price = inventory.UnitPrice || 'N/A';
                            return (
                                <tr key={product.productId}>
                                    <td>{name}</td>
                                    <td>{qtyInStock > 0 ? qtyInStock : '-'}</td>
                                    <td>{price}</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            max={qtyInStock || 99}
                                            value={order[product.productId] || ""}
                                            onChange={e => handleQtyChange(product.productId, qtyInStock, e)}
                                            disabled={qtyInStock === 0}
                                            style={{ width: "60px" }}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <button type="submit" className="btn btn-primary mt-3">Submit Order</button>
            </form>
        </div>
    );
}