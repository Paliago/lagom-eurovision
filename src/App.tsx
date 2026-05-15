"use client";

import { Routes, Route, Link } from "react-router";
import LandingPage from "./pages/LandingPage";
import ContestantListPage from "./pages/ContestantListPage";
import ContestantRatingPage from "./pages/ContestantRatingPage";
import OverviewPage from "./pages/OverviewPage";
import Layout from "./components/Layout";

function App() {
  return (
    <div className="App min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/room/:roomName/contestants"
          element={
            <Layout>
              <ContestantListPage />
            </Layout>
          }
        />
        <Route
          path="/:year/room/:roomName/contestants"
          element={
            <Layout>
              <ContestantListPage />
            </Layout>
          }
        />
        <Route
          path="/room/:roomName/contestant/:contestantId"
          element={
            <Layout>
              <ContestantRatingPage />
            </Layout>
          }
        />
        <Route
          path="/:year/room/:roomName/contestant/:contestantId"
          element={
            <Layout>
              <ContestantRatingPage />
            </Layout>
          }
        />
        <Route
          path="/room/:roomName/overview"
          element={
            <Layout>
              <OverviewPage />
            </Layout>
          }
        />
        <Route
          path="/:year/room/:roomName/overview"
          element={
            <Layout>
              <OverviewPage />
            </Layout>
          }
        />

        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-[#f0f0f5]">
              <h1 className="text-3xl font-extrabold">Page Not Found</h1>
              <Link
                to="/"
                className="text-[#f5b800] font-semibold hover:underline"
              >
                Go Home
              </Link>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
