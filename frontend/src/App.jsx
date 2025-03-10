import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Coins from "./pages/Coins";
import CoinDetails from "./pages/CoinDetails";
import Leaderboard from "./pages/Leaderboard";
import CreateCoin from "./pages/CreateCoin";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />

          {/* Other Pages */}
          <Route path="/coins" element={<Coins />} />
          <Route path="/coins/:id" element={<CoinDetails />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/create-coin" element={<CreateCoin />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;