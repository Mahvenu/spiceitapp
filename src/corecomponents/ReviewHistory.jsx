import React, { useEffect, useState } from "react";

export default function ReviewHistory() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const phone = sessionStorage.getItem("welcomePhone");
        if (!phone) {
            setError("No user phone number found.");
            setLoading(false);
            return;
        }
        fetch(`https://f9x0pi0l37.execute-api.ap-south-1.amazonaws.com/dev/getReviewsByPhoneNumber?service=getReviewsByPhoneNumber&phoneNumber=${phone}`)
            .then(res => res.json())
            .then(data => {
                let parsed = [];
                // If the API returns an array directly
                if (Array.isArray(data)) {
                    parsed = data;
                }
                // If the API returns { body: [...] }
                else if (data && Array.isArray(data.body)) {
                    parsed = data.body;
                }
                // If the API returns { body: "[...]" }
                else if (data && typeof data.body === "string" && data.body.trim() && data.body.trim() !== "[]") {
                    try {
                        parsed = JSON.parse(data.body);
                        if (!Array.isArray(parsed)) parsed = [];
                    } catch (e) {
                        parsed = [];
                    }
                }
                setReviews(parsed);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to fetch reviews.");
                setLoading(false);
            });
    }, []);

    return (
        <div className="container my-5" style={{ maxWidth: 700 }}>
            <h2 className="mb-4"><span>Review History</span></h2>
            {loading ? (
                <div>Loading reviews...</div>
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : reviews.length > 0 ? (
                <div style={{ background: "#e9f7ef", border: "1px solid #b2dfdb", borderRadius: 6, padding: 12 }}>
                    <strong>Your Previous Feedback:</strong>
                    <div>
                        {reviews.map((r, i) => (
                            <div key={i} style={{ marginBottom: 12, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
                                <div>
                                    <strong>Product:</strong> {r.ProductID || r.productId}
                                    <span style={{ color: "#ffc107", marginLeft: 12 }}>
                                        {"★".repeat(r.rating?.overall || 0)}
                                    </span>
                                </div>
                                <div><strong>Order ID:</strong> {r.orderId}</div>
                                <div><strong>Review:</strong> {r.reviewText}</div>
                                <div><strong>Date:</strong> {r.timestamp?.replace("timestamp_", "")}</div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="alert alert-warning">
                    No reviews found for your account.
                </div>
            )}
        </div>
    );
}