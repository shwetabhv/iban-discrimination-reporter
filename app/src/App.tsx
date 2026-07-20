import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ReportFormPage from "./pages/ReportFormPage";
import LetterPage from "./pages/LetterPage";
import ExplorePage from "./pages/ExplorePage";
import StatsPage from "./pages/StatsPage";

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<ReportFormPage />} />
          <Route path="/letter" element={<LetterPage />} />
          <Route path="/map" element={<ExplorePage defaultView="map" />} />
          <Route path="/wall" element={<ExplorePage defaultView="list" />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
