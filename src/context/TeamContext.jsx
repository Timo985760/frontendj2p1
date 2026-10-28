import { createContext, useContext, useState, useEffect } from 'react';

const TeamContext = createContext();

const DEFAULT_TEAMS = [
  {
    id: 'team-1',
    name: 'Alpha Squad',
    members: [
      { id: 25, name: 'pikachu', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', types: ['electric'] },
      { id: 6, name: 'charizard', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', types: ['fire', 'flying'] },
      { id: 9, name: 'blastoise', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png', types: ['water'] },
      { id: 3, name: 'venusaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png', types: ['grass', 'poison'] }
    ]
  },
  {
    id: 'team-2',
    name: 'Beta Force',
    members: [
      { id: 130, name: 'gyarados', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png', types: ['water', 'flying'] },
      { id: 143, name: 'snorlax', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png', types: ['normal'] }
    ]
  },
  {
    id: 'team-3',
    name: 'Gamma Unit',
    members: [
      { id: 94, name: 'gengar', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png', types: ['ghost', 'poison'] }
    ]
  }
];

export function TeamProvider({ children }) {
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('pokecorp_teams');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading teams from localStorage', e);
      }
    }
    return DEFAULT_TEAMS;
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('pokecorp_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading favorites from localStorage', e);
      }
    }
    return ['pikachu', 'charizard', 'gengar'];
  });

  useEffect(() => {
    localStorage.setItem('pokecorp_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('pokecorp_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addTeam = (name) => {
    if (!name.trim()) return;
    const newTeam = {
      id: `team-${Date.now()}`,
      name: name.trim(),
      members: []
    };
    setTeams((prev) => [...prev, newTeam]);
  };

  const deleteTeam = (teamId) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
  };

  const addPokemonToTeam = (teamId, pokemon) => {
    setTeams((prev) =>
      prev.map((team) => {
        if (team.id !== teamId) return team;
        if (team.members.length >= 6) {
          alert('Een team mag maximaal 6 Pokémon bevatten!');
          return team;
        }
        if (team.members.some((m) => m.name === pokemon.name)) {
          alert(`${pokemon.name} zit al in dit team!`);
          return team;
        }
        return {
          ...team,
          members: [
            ...team.members,
            {
              id: pokemon.id,
              name: pokemon.name,
              image: pokemon.image || pokemon.sprites?.front_default,
              types: pokemon.types ? (typeof pokemon.types[0] === 'string' ? pokemon.types : pokemon.types.map(t => t.type?.name || t)) : []
            }
          ]
        };
      })
    );
  };

  const removePokemonFromTeam = (teamId, pokemonName) => {
    setTeams((prev) =>
      prev.map((team) => {
        if (team.id !== teamId) return team;
        return {
          ...team,
          members: team.members.filter((m) => m.name !== pokemonName)
        };
      })
    );
  };

  const toggleFavorite = (pokemonName) => {
    setFavorites((prev) =>
      prev.includes(pokemonName)
        ? prev.filter((name) => name !== pokemonName)
        : [...prev, pokemonName]
    );
  };

  const isFavorite = (pokemonName) => favorites.includes(pokemonName);

  return (
    <TeamContext.Provider
      value={{
        teams,
        favorites,
        addTeam,
        deleteTeam,
        addPokemonToTeam,
        removePokemonFromTeam,
        toggleFavorite,
        isFavorite
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeams() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeams moet binnen een TeamProvider gebruikt worden');
  }
  return context;
}
