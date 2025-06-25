import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
    const [signin, setSignin] = useState({ phone: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const googleBtn = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (window.google && googleBtn.current) {
            window.google.accounts.id.initialize({
                client_id: "YOUR_GOOGLE_CLIENT_ID",
                callback: handleGoogleResponse
            });
            window.google.accounts.id.renderButton(googleBtn.current, {
                theme: "outline",
                size: "large"
            });
        }
    }, []);

    function handleGoogleResponse(response) {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const profile = JSON.parse(jsonPayload);
        setSignin(s => ({
            ...s,
            firstName: profile.given_name || "",
            lastName: profile.family_name || "",
            email: profile.email || ""
        }));
        localStorage.setItem("welcomeName", `${profile.given_name || ""} ${profile.family_name || ""}`);
        setSuccess("Google sign-in successful! Redirecting...");
        setTimeout(() => {
            navigate("/home");
        }, 1200);
    }

    const handleSigninChange = e => {
        setSignin({ ...signin, [e.target.name]: e.target.value });
    };

    const handleSignin = async e => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!signin.phone) {
            setError("Phone is required.");
            return;
        }
        try {
            const res = await fetch(
                `https://d9umq22y9f.execute-api.ap-south-1.amazonaws.com/dev/checkSignin?service=getCustomerByPhone&phone=${encodeURIComponent(signin.phone)}`
            );
            if (!res.ok) {
                setError("Sign in failed. Please try again.");
                return;
            }
            const data = await res.json();
            let customer = null;
            if (Array.isArray(data) && data.length > 0) {
                customer = data[0];
            } else if (data && typeof data === "object") {
                customer = data;
            }
            if (customer) {
                localStorage.setItem("welcomeName", `${customer.firstName || ""} ${customer.lastName || ""}`);
                localStorage.setItem("welcomePhone", signin.phone);
                localStorage.setItem("welcomeAddress", customer.address || ""); // <-- Add this line
                sessionStorage.setItem("welcomePhone", customer.phone); // <-- Add this line
                window.dispatchEvent(new Event("storage"));
                setSuccess("Sign in successful! Redirecting...");
                setTimeout(() => {
                    navigate("/home");
                }, 1200);
            } else {
                setError("No matching customer found. Please check your details or sign up.");
            }
        } catch {
            setError("Sign in failed. Please try again.");
        }
    };

    return (
        <div className="container my-4" style={{ maxWidth: 600 }}>
            <h2 className="mb-3">Sign In to Paaka Butti</h2>
            <form className="row g-3 mb-3" onSubmit={handleSignin}>
                <div className="col-md-12">
                    <input
                        type="text"
                        className="form-control"
                        name="phone"
                        placeholder="Phone or Email"
                        value={signin.phone}
                        onChange={handleSigninChange}
                    />
                </div>
                <div className="col-12 d-flex flex-column align-items-center" style={{ marginTop: "18px" }}>
                    <button type="submit" className="btn btn-primary mb-2" style={{ minWidth: 120 }}>Sign In</button>
                    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <span style={{
                            margin: "8px 0",
                            fontWeight: "bold",
                            color: "#000",
                            fontSize: ".75rem",
                            textAlign: "center"
                        }}>
                            OR
                        </span>
                    </div>
                    <div ref={googleBtn}></div>
                </div>
                {error && (
                    <div className="col-12">
                        <div className="alert alert-danger py-1 my-1">{error}</div>
                    </div>
                )}
                {success && (
                    <div className="col-12">
                        <div className="alert alert-success py-1 my-1">{success}</div>
                    </div>
                )}
            </form>
            <div style={{ textAlign: "center", marginTop: "32px" }}>
                <span style={{ color: "#555", fontSize: "1rem" }}>
                    New to Paaka Butti?{" "}
                    <a href="/signup" style={{ color: "#007bff", textDecoration: "underline", fontWeight: 500 }}>
                        Create an account
                    </a>
                </span>
            </div>
        </div>
    );
}