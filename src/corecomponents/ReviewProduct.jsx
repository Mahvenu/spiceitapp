import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Simple StarRating component
function StarRating({ value, onChange, label }) {
    return (
        <div style={{ marginBottom: 8 }}>
            <span style={{ minWidth: 110, display: "inline-block" }}>{label}:</span>
            {[1, 2, 3, 4, 5].map(star => (
                <span
                    key={star}
                    style={{
                        cursor: "pointer",
                        color: star <= value ? "#FFD600" : "#ccc",
                        fontSize: "1.5em"
                    }}
                    onClick={() => onChange(star)}
                    data-testid={`star-${label}-${star}`}
                >★</span>
            ))}
        </div>
    );
}

export default function ReviewProduct({ allReviews = [], user }) {
    const [ratings, setRatings] = useState({
        taste: 0,
        packaging: 0,
        delivery: 0,
        price: 0,
        overall: 0,
    });
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [userReviews, setUserReviews] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    // Get order and product from navigation state (clicked item)
    const order = location.state?.order;
    const product = location.state?.product;
console.log("ReviewProduct order:", order);
    console.log("ReviewProduct product:", product);
    // If product or order is missing, show a message and do not render the form
    if (!order || !product) {
        return (
            <div className="container my-5" style={{ maxWidth: 700 }}>
                <h2 className="mb-4"><span>Rate</span> & Review</h2>
                <div className="alert alert-warning">
                    No product or order selected for review. Please go to your order history and click "Rate & Review" for a specific item.
                </div>
            </div>
        );
    }

    useEffect(() => {
        // Filter reviews for this user, order, and product if allReviews and user are provided
        if (allReviews && user) {
            let filtered = allReviews.filter(r => r.userId === user.id);
            if (order) filtered = filtered.filter(r => r.orderId === (order.orderId || order.id));
            if (product) filtered = filtered.filter(r => r.productId === product.productId);
            setUserReviews(filtered);
        }
    }, [allReviews, user, order, product]);

    const handleRatingChange = (field, value) => {
        setRatings(r => ({ ...r, [field]: value }));
    };

    function getDateTimeString() {
        const now = new Date();
        const pad = n => n.toString().padStart(2, "0");
        return (
            pad(now.getDate()) +
            pad(now.getMonth() + 1) +
            now.getFullYear().toString().slice(-2) +
            pad(now.getHours()) +
            pad(now.getMinutes()) +
            pad(now.getSeconds())
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!ratings.taste || !ratings.packaging || !ratings.delivery || !ratings.price || !ratings.overall || !comment.trim()) {
            setError("Please provide ratings and a comment.");
            return;
        }
        setError("");
        setSuccess("");
        try {
            const dtStr = getDateTimeString();
            const reviewId = `reviewId_${product.productId}_${order.phoneNumber}_${dtStr}`;
            const timestamp = `timestamp_${dtStr}`;
            const body = {
                productId: product.productId,
                reviewId,
                userId: order.phoneNumber,
                reviewText: comment,
                rating: {
                    taste: ratings.taste,
                    packaging: ratings.packaging,
                    delivery: ratings.delivery,
                    price: ratings.price,
                    overall: ratings.overall
                },
                orderId: order.orderId || order.id,
                timestamp
            };
            console.log("Review body:", body);
            const res = await fetch("https://f9x0pi0l37.execute-api.ap-south-1.amazonaws.com/dev/saveReview?service=saveReview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            console.log("Review API status:", res.status);
            const resText = await res.text();
            console.log("Review API response:", resText);
            if (!res.ok) throw new Error("Failed to submit review");
            setSuccess("Thank you for your feedback!");
            setTimeout(() => navigate("/userinfo"), 1500);
        } catch (err) {
            setError("Failed to submit review. Please try again.");
            console.error(err);
        }
    };

    return (
        <div className="container my-5" style={{ maxWidth: 700 }}>
            <h2 className="mb-4">
                <span>Rate</span> & Review
            </h2>
            {/* Show only the selected product item details for the order */}
            <div style={{ background: "#f8f9fa", border: "1px solid", borderRadius: 6, padding: 12, marginBottom: 18 }}>
                <div><strong>Order ID:</strong> {order.orderId || order.id}</div>
                <div><strong>Date:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleDateString("en-GB") : "-"}</div>
                <div>
                    <strong>Item:</strong> {product.count} {product.name} ({product.size || product.quantity || product.qty || "-"})
                </div>
                <div><strong>Order Status:</strong> {order.status || "-"}</div>
                <div><strong>Product ID:</strong> {product.productId}</div>
            </div>

            {/* Show previous feedback for this order and product by the signed-in user */}
            {userReviews.length > 0 && (
                <div style={{ background: "#e9f7ef", border: "1px solid #b2dfdb", borderRadius: 6, padding: 12, marginBottom: 18 }}>
                    <strong>Your Previous Feedback:</strong>
                    <div>
                        {userReviews.map((r, i) => (
                            <div key={i} style={{ marginBottom: 4 }}>
                                <span style={{ color: "#ffc107" }}>{"★".repeat(r.rating)}</span>
                                <span style={{ marginLeft: 8 }}>{r.review}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Feedback form */}
            <form onSubmit={handleSubmit} style={{ background: "#f8f9fa", borderRadius: 8, padding: 24, border: "1px solid #eee" }}>
                <div className="mb-3">
                    <StarRating label="Taste" value={ratings.taste} onChange={val => handleRatingChange("taste", val)} />
                    <StarRating label="Packaging" value={ratings.packaging} onChange={val => handleRatingChange("packaging", val)} />
                    <StarRating label="Delivery" value={ratings.delivery} onChange={val => handleRatingChange("delivery", val)} />
                    <StarRating label="Price" value={ratings.price} onChange={val => handleRatingChange("price", val)} />
                    <StarRating label="Overall Exp" value={ratings.overall} onChange={val => handleRatingChange("overall", val)} />
                </div>
                <div className="mb-3">
                    <textarea
                        className="form-control"
                        rows={4}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Share your experience..."
                        required
                    />
                </div>
                {error && <div className="alert alert-danger py-1">{error}</div>}
                {success && <div className="alert alert-success py-1">{success}</div>}
                <div className="d-flex justify-content-between">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate("/userinfo")}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Submit Review
                    </button>
                </div>
            </form>
        </div>
    );
}