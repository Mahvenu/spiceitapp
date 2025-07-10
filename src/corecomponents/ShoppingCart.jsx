import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa'; // Add this import

export default function ShoppingCart({ cart, products, onBack, handleRemoveFromCart }) {
  const navigate = useNavigate();

  // Prepare cart items with product details
  const cartItems = Object.entries(cart).map(([key, { qtyStr, count }]) => {
    const [productId, qty] = key.split('|');
    const product = products.find(p => p.productId === productId);
    if (!product) return null;
    const inventory = product.inventory || {};
    const name = inventory.Name || productId;
    const pricePerKg = Number(inventory.UnitPrice) || 0;

    // Calculate price for selected qty
    let grams = 0;
    if (qty && qty.toLowerCase().includes('kg')) {
      grams = parseFloat(qty) * 1000;
    } else if (qty && qty.toLowerCase().includes('g')) {
      grams = parseFloat(qty);
    }
    const priceForSelectedQty = grams && pricePerKg
      ? Math.round((pricePerKg / 1000) * grams)
      : pricePerKg;
    const total = priceForSelectedQty * count;

    return {
      key,
      name,
      qtyStr,
      count,
      priceForSelectedQty,
      total,
    };
  }).filter(Boolean);

  const grandTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

  if (cartItems.length === 0) {
    return <div style={{ padding: 20 }}><h3>Your cart is empty.</h3></div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Shopping Cart</h2>
      <button className="btn btn-light btn-sm" onClick={onBack}>
                        &larr; Back to Products
                    </button>
      <table border="0" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Pack Size</th>
            <th>Quantity</th>
            <th>Unit Price (₹)</th>
            <th>Total (₹)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map(item => (
            <tr key={item.key}>
              <td>{item.name}</td>
              <td>{item.qtyStr}</td>
              <td>{item.count}</td>
              <td>₹{item.priceForSelectedQty}</td>
              <td>₹{item.total}</td>
              <td>
                <button
                  onClick={() => handleRemoveFromCart(item.key)}
                  style={{ color: 'red', cursor: 'pointer', background: 'none', border: 'none' }}
                  title="Remove one"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold' }}>Grand Total</td>
            <td colSpan={2} style={{ fontWeight: 'bold' }}>₹{grandTotal}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <button
          className="btn btn-success"
          onClick={() => navigate('/orderplacement')}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}