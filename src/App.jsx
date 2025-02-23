import { useState } from 'react';
import './App.css';
import './customstyles/spicenav.css';
import Home from './corecomponents/Home';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Router>
      <div>
        <nav>
          <ul className="spice-horizontal-nav">
            <li>
              <Link  to="/">Home</Link>
            </li>
            <li>
              Contact Us
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          
        </Routes>
        
        <p>
          Product Of VJkamps!
        </p>
      </div>
      </Router>
      
    </>
  );
}

export default App
