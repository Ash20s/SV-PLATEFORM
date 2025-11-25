import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Login';
import Teams from './pages/Teams';
import TeamDetails from './pages/TeamDetails';
import Scrims from './pages/Scrims';
import Tournaments from './pages/Tournaments';
import TournamentDetails from './pages/TournamentDetails';
import TournamentGroups from './pages/TournamentGroups';
import Stats from './pages/Stats';
import Calendar from './pages/Calendar';
import Leaderboard from './pages/Leaderboard';
import Mercato from './pages/Mercato';
import Profile from './pages/Profile';
import ProfilePage from './pages/ProfilePage';
import TeamManagementPage from './pages/TeamManagementPage';
import SettingsPage from './pages/Settings';
import CommunityPage from './pages/CommunityPage';
import Organizer from './pages/Organizer';
import Admin from './pages/Admin';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:id" element={<TeamDetails />} />
            <Route path="/scrims" element={<Scrims />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/:id" element={
              <ErrorBoundary>
                <TournamentDetails />
              </ErrorBoundary>
            } />
            <Route path="/tournaments/:id/groups" element={<TournamentGroups />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/mercato" element={<Mercato />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/my-team" element={<TeamManagementPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/organizer" element={<Organizer />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
}

export default App;
