import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        pincode: ""
    });
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
        setForm(f => ({
            ...f,
            firstName: profile.given_name || "",
            lastName: profile.family_name || "",
            email: profile.email || ""
        }));
        localStorage.setItem("welcomeName", `${profile.given_name || ""} ${profile.family_name || ""}`);
        setSuccess("Google sign-in successful! Please complete the rest of the form and submit.");
    }

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.address || !form.pincode) {
            setError("All fields are required.");
            return;
        }
        try {
            const res = await fetch("https://d9umq22y9f.execute-api.ap-south-1.amazonaws.com/dev/saveCustomerDetails?service=saveCustomer", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setSuccess("Signup successful! Redirecting to Login...");
                localStorage.setItem("welcomeName", `${form.firstName} ${form.lastName}`);
                setTimeout(() => {
                    navigate("/Signin");
                }, 1200);
            } else {
                setError("Signup failed. Please try again.");
            }
        } catch {
            setError("Signup failed. Please try again.");
        }
    };

    return (
        <div className="container my-4" style={{ maxWidth: 600 }}>
            <h2 className="mb-3">Welcome to Paaka Butti</h2>
            <form className="row g-3 mb-3" onSubmit={handleSubmit}>
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        placeholder="First Name"
                        value={form.firstName}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        placeholder="Last Name"
                        value={form.lastName}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-6">
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        name="phone"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-8">
                    <input
                        type="text"
                        className="form-control"
                        name="address"
                        placeholder="Address"
                        value={form.address}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        name="pincode"
                        placeholder="Pincode"
                        value={form.pincode}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-12 d-flex align-items-center" style={{ marginTop: "24px" }}>
                    <button type="submit" className="btn btn-primary me-3">Sign Up</button>
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
        </div>
    );
}