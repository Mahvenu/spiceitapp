import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
import '../customstyles/spiceprod.css';

import { Container, Row, Col, Card, Button } from 'react-bootstrap';

export default function Home() {
    const [products, setProducts] = useState([]); // State to store product data
    const [loading, setLoading] = useState(true); // State for loading status
    const [error, setError] = useState(null); // State for errors
    const imageBasePath = 'src/images/';
    const getImagePath = (product) => `${imageBasePath}${product.productName}.jpg`;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const prodInfoResp = await axios.get("https://r46jrehpue.execute-api.ap-south-1.amazonaws.com/spicedev?productName=chillipowder");
                console.log("product response is ", prodInfoResp.data);
                const jsonResp = JSON.parse(prodInfoResp.data)
                setProducts(jsonResp);
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
                            <p className="price">₹{product.price}</p>
                            <button className="add-to-cart">Add to Cart</button>
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