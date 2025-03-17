// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Coins from "./pages/Coins";
import CoinDetails from "./pages/CoinDetails";
import Leaderboard from "./pages/Leaderboard";
import CreateCoin from "./pages/CreateCoin";
import useAuthStore from "./store/authStore";
import { useEffect } from "react";
import useAuthCheck from "./hooks/useAuthCheck";
import Layout from "./components/Layout";
import DexScreener from "./pages/DexScreener";
import About from "./pages/About";

const App = () => {
  const { isAuthenticated } = useAuthCheck();

  useEffect(() => {
    // console.log("IsAuthenticated: ", isAuthenticated)
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />

          {/* Other Pages */}
          <Route path="/coins" element={<Coins />} />
          <Route path="/coins/:id" element={<CoinDetails />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/create-coin" element={<CreateCoin />} />
          <Route path="/dexscreener" element={<DexScreener />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;