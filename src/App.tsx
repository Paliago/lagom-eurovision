"use client";

import { Routes, Route, Link } from "react-router";
import LandingPage from "./pages/LandingPage";
import ContestantListPage from "./pages/ContestantListPage";
import ContestantRatingPage from "./pages/ContestantRatingPage";
import OverviewPage from "./pages/OverviewPage";
import Layout from "./components/Layout";

function App() {
  return (
    <div className="App min-h-screen bg-gradient-to-br from-purple-600 to-red-400">
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
            <div>
              Page Not Found <Link to="/">Go Home</Link>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
