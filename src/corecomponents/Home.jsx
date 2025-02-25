import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
export default function Home () {
    const [product, setProduct] = useState(null); // State to store product data
    const [loading, setLoading] = useState(true); // State for loading status
    const [error, setError] = useState(null); // State for errors
    
    useEffect(() => {
        const fetchProductInformation = async () => {
            try {
                const prodInfoResp = await axios.get("https://r46jrehpue.execute-api.ap-south-1.amazonaws.com/spicedev");
                setProduct(prodInfoResp.data);
                setLoading(false);
            } catch (err) {
                setError(err.message); // Set error state if the request fails
                setLoading(false); // Set loading to false on error
            }
        };
        fetchProductInformation();
    },[]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return(
        <div className="product-info-page">
            <h1>{product.name}</h1>
           
            <p>{product.qty}</p>
            <p><strong>Price:</strong> ${product.price}</p>
            
        </div>
    )
} 