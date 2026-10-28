import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Pokedex from './pages/Pokedex';
import Teams from './pages/Teams';
import Favorites from './pages/Favorites';
import PokemonDetail from './pages/PokemonDetail';
import { TeamProvider } from './context/TeamContext';
import './App.css';

function App() {
  return (
    <TeamProvider>
      <div className="app-container">
        <Navigation />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pokedex" element={<Pokedex />} />
            <Route path="/list" element={<Navigate to="/pokedex" replace />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/pokemon/:name" element={<PokemonDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </TeamProvider>
  );
}

export default App;
