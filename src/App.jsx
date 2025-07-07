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
import ReviewProduct from './corecomponents/ReviewProduct';
import OrderManagement from './corecomponents/OrderManagement';
import OrderHistory from './corecomponents/OrderHistory';
import { FaShoppingCart } from "react-icons/fa";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';


// Move all logic that uses useNavigate into this inner component
function AppContent() {
  const [firstName, setFirstName] = useState(() => {
    const fullName = localStorage.getItem("welcomeName") || "";
    return fullName ? fullName.split(" ")[0] : "Login";
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartSummary, setCartSummary] = useState("");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = sessionStorage.getItem("cart");
    return saved ? JSON.parse(saved) : {};
  });
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

  useEffect(() => {
    // Replace with your actual API endpoint if needed
    fetch("https://gdhfo6zldj.execute-api.ap-south-1.amazonaws.com/dev/getInventory?service=getInventory")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    sessionStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const handleSignOut = () => {
    localStorage.removeItem("welcomeName");
    sessionStorage.clear();
    setFirstName("Login");
    setShowDropdown(false);
    window.location.href = "/signin";
  };

  const handleAddToCart = (productId, qtyStr, count = 1) => {
    const key = `${productId}|${qtyStr}`;
    setCart(prevCart => {
      const prevItem = prevCart[key] || { count: 0, qtyStr };
      return {
        ...prevCart,
        [key]: {
          count: prevItem.count + count,
          qtyStr: qtyStr
        }
      };
    });
  };

  const handleRemoveFromCart = (key) => {
    setCart(prevCart => {
      const item = prevCart[key];
      if (!item) return prevCart;
      if (item.count > 1) {
        return {
          ...prevCart,
          [key]: { ...item, count: item.count - 1 }
        };
      } else {
        const updatedCart = { ...prevCart };
        delete updatedCart[key];
        return updatedCart;
      }
    });
  };

  // Calculate cart count (sum of all item counts)
  const totalCartCount = Object.values(cart).reduce((sum, item) => sum + (item.count || 0), 0);

  // Tooltip content for cart icon: show product name, qty, and count
  const cartTooltip = totalCartCount > 0
    ? Object.entries(cart)
        .map(([key, item]) => {
          const [productId, qtyStr] = key.split('|');
          const product = products.find(p => p.productId === productId);
          const name = product?.inventory?.Name || productId;
          return `${name} (${qtyStr}): ${item.count}`;
        })
        .join('\n')
    : "Cart is empty";

  return (
    <div className='background'>
      {/* Logo above Navigation */}
      <div className="app-logo-bar" style={{ width: "100%", padding: "12px 0 0 24px", background: "#fff" }}>
        <img
          src="images/logo.jpg"
          alt="Logo"
          className="app-logo-img"
          style={{
            height: "64px",
            width: "auto",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            background: "#fff",
            padding: 4
          }}
        />
      </div>

      {/* Navigation Bar */}
      <nav>
        <ul className="spice-horizontal-nav">
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/productinventory">Product Inventory</Link></li>
          <li><Link to="/aboutus">About Us</Link></li>
          <li><Link to="/contactus">Contact Us</Link></li>
          <li><Link to="/customermanagement">Customer Management</Link></li>
          <li><Link to="/OrderManagement">Order Management</Link></li>
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
                    <div
                      style={{ padding: "10px 16px", color: "#333", fontWeight: 500, cursor: "pointer" }}
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/OrderHistory");
                      }}
                    >
                      My Orders
                    </div>
                    <div style={{ borderTop: "1px solid #eee" }} />
                    <button
                      onClick={handleSignOut}
                      style={{
                        width: "100%",
                        padding: "10px 0",
                        background: "none",
                        border: "none",
                        color: "#333",
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
          <li className="spice-horizontal-nav-right">
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="cart-tooltip" style={{ whiteSpace: "pre-line" }}>
                  {cartTooltip}
                </Tooltip>
              }
            >
              <button
                className="btn btn-outline-primary"
                style={{ position: "relative" }}
                onClick={() => navigate("/shoppingcart")}
              >
                <FaShoppingCart size={24} />
                {totalCartCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "12px"
                  }}>
                    {totalCartCount}
                  </span>
                )}
              </button>
            </OverlayTrigger>
          </li>
        </ul>
      </nav>

      {/* Banner below Navigation */}
      <div className="app-banner-container">
        <img
          src="images/banner.jpg"
          alt="Banner"
          className="app-banner-img"
        />
      </div>

      {/* Main Content */}
      <Routes>
        <Route path="/" element={
          <Home
            cart={cart}
            products={products}
            handleAddToCart={handleAddToCart}
            handleRemoveFromCart={handleRemoveFromCart}
          />
        } />
        <Route path="/home" element={
          <Home
            cart={cart}
            products={products}
            handleAddToCart={handleAddToCart}
            handleRemoveFromCart={handleRemoveFromCart}
          />
        } />
        <Route path="/productinventory" element={<ProductInventory />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/shoppingcart" element={
          <ShoppingCart
            cart={cart}
            products={products}
            handleRemoveFromCart={handleRemoveFromCart}
          />
        } />
        <Route path="/orderplacement" element={
          <OrderPlacement setCart={setCart} />
        } />
        <Route path="/ordersuccess" element={<OrderSuccess />} />
        <Route path="/customermanagement" element={<CustomerManagement />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/userinfo" element={<UserInfo />} />
        <Route path="/ReviewProduct" element={<ReviewProduct />} />
        <Route path="/OrderHistory" element={<OrderHistory />} />
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
