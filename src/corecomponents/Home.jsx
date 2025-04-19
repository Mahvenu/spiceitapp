import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
import '../customstyles/spiceprod.css';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

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
    // State to manage the count of items in the cart
      const [cartCount, setCartCount] = useState(0);
    
      // Function to handle adding an item to the cart
      const handleAddToCart = () => {
        setCartCount(cartCount + 1); // Increment the cart count by 1
      };
    
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const prodInfoResp = await axios.get("https://r46jrehpue.execute-api.ap-south-1.amazonaws.com/spicedev?service=productService");
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
     

    return (
        <div className="container">

            <h1 className="my-4">Paaka Butti</h1>
            <div className="card-container">
                {products.map((product) => (
                    <div key={product.productName} className="card">
                        <img src={getImagePath(product)} alt={product.productName} className="card-image" />

                        <div className="card-body">
                            <h3>{product.productName}</h3>
                            <p>{product.qty}</p>
                            <select value={selected} onChange={handleChange}>
        <option value="">-- Choose --</option>
        <option value="100gm">100 g</option>
        <option value="250gm">250 g</option>
        <option value="500gm">500 g</option>
        <option value="1Kg">1 Kg</option>
      </select>
                            <p className="price">₹{product.price}</p>
                            <button className="add-to-cart" onClick={handleAddToCart}>Add to Cart</button>
                            {/* Display cart count only if it's greater than 0 */}
        <span>
        {cartCount > 0 }{cartCount } 
        </span>
                        </div>
                    </div>
                ))}

                {/* <h2>Cart ({cart.length} items)</h2>
      <ul>
        {cart.map((product, index) => (
          <li key={index}>{product.productName} - ${product.price}</li>
        ))}
      </ul> */}

            </div>

        </div>
    );
};