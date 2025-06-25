import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import './App.css';
import './customstyles/spicenav.css';
import Home from './corecomponents/Home';
import ContactUs from './corecomponents/ContactUs';
import AboutUs from './corecomponents/AboutUs';
import ProductInventory from './corecomponents/ProductInventory';
import ShoppingCart from './corecomponents/ShoppingCart';
import OrderPlacement from './corecomponents/OrderPlacement';
import OrderSuccess from './corecomponents/OrderSuccess';
import CustomerManagement from './corecomponents/CustomerManagement';
import SignUp from './corecomponents/Signup';
import SignIn from './corecomponents/Signin';
import UserInfo from './corecomponents/UserInfo';

// Move all logic that uses useNavigate into this inner component
function AppContent() {
  const [firstName, setFirstName] = useState(() => {
    const fullName = localStorage.getItem("welcomeName") || "";
    return fullName ? fullName.split(" ")[0] : "Login";
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateFirstName = () => {
      const fullName = localStorage.getItem("welcomeName") || "";
      setFirstName(fullName ? fullName.split(" ")[0] : "Login");
    };
    updateFirstName();
    window.addEventListener("storage", updateFirstName);
    window.addEventListener("popstate", updateFirstName);
    return () => {
      window.removeEventListener("storage", updateFirstName);
      window.removeEventListener("popstate", updateFirstName);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("welcomeName");
    sessionStorage.clear();
    setFirstName("Login");
    setShowDropdown(false);
    window.location.href = "/signin";
  };

  return (
    <div className='background'>
      <nav>
        <ul className="spice-horizontal-nav">
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/productinventory">Product Inventory</Link></li>
          <li><Link to="/aboutus">About Us</Link></li>
          <li><Link to="/contactus">Contact Us</Link></li>
          <li><Link to="/customermanagement">Customer Management</Link></li>
          <li className="spice-horizontal-nav-right">
            <input
              type="text"
              placeholder="Search..."
              style={{ padding: "5px", borderRadius: "5px" }}
            />
          </li>
          <li
            className="spice-horizontal-nav-right"
            style={{ position: "relative" }}
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <span
              style={{
                cursor: "pointer",
                padding: "8px 16px",
                display: "inline-block",
                color: "#212529",
                fontWeight: 500,
                fontSize: ".95rem"
              }}
            >
              {firstName}
              {firstName !== "Login" && (
                <span style={{ marginLeft: 6, fontSize: "1.1em" }}></span>
              )}
            </span>
            {showDropdown && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  zIndex: 1000,
                  minWidth: "140px"
                }}
              >
                {firstName !== "Login" ? (
                  <>
                    <div
                      style={{ padding: "10px 16px", color: "#333", fontWeight: 500, cursor: "pointer" }}
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/userinfo");
                      }}
                    >
                      User Info
                    </div>
                    <div style={{ borderTop: "1px solid #eee" }} />
                    <button
                      onClick={handleSignOut}
                      style={{
                        width: "100%",
                        padding: "10px 0",
                        background: "none",
                        border: "none",
                        color: "#007bff",
                        cursor: "pointer",
                        fontSize: "1rem"
                      }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/signin"
                    style={{
                      display: "block",
                      padding: "10px 16px",
                      color: "#007bff",
                      fontWeight: 500,
                      fontSize: "1rem",
                      textDecoration: "none"
                    }}
                    onClick={() => setShowDropdown(false)}
                  >
                    User Login
                  </Link>
                )}
              </div>
            )}
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/productinventory" element={<ProductInventory />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/shoppingcart" element={<ShoppingCart />} />
        <Route path="/orderplacement" element={<OrderPlacement />} />
        <Route path="/ordersuccess" element={<OrderSuccess />} />
        <Route path="/customermanagement" element={<CustomerManagement />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/userinfo" element={<UserInfo />} />
      </Routes>
      <footer>
        <p>
          © Product Of VJkamps!
        </p>
      </footer>
    </div>
  );
}

// Only wrap AppContent in Router here
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
