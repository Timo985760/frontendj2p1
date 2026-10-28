import { createContext, useContext, useState, useEffect } from 'react';

const TeamContext = createContext();

const INITIAL_TEAM_CONFIG = [
  { id: 'team-1', name: 'Alpha Squad', pokemonNames: ['pikachu', 'charizard', 'blastoise', 'venusaur'] },
  { id: 'team-2', name: 'Beta Force', pokemonNames: ['gyarados', 'snorlax'] },
  { id: 'team-3', name: 'Gamma Unit', pokemonNames: ['gengar'] }
];

export function TeamProvider({ children }) {
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('pokemon_teams_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error loading teams from localStorage', e);
      }
    }
    return [];
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('pokemon_favorites_v2');
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
    if (teams.length > 0) return;
    let isMounted = true;

    async function fetchInitialTeams() {
      try {
        const loadedTeams = await Promise.all(
          INITIAL_TEAM_CONFIG.map(async (teamCfg) => {
            const members = await Promise.all(
              teamCfg.pokemonNames.map(async (pokeName) => {
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeName}`);
                const data = await res.json();
                return {
                  id: data.id,
                  name: data.name,
                  nickname: '',
                  image: data.sprites?.front_default,
                  types: data.types.map((t) => t.type.name)
                };
              })
            );
            return {
              id: teamCfg.id,
              name: teamCfg.name,
              members
            };
          })
        );
        if (isMounted) {
          setTeams(loadedTeams);
          localStorage.setItem('pokemon_teams_v2', JSON.stringify(loadedTeams));
        }
      } catch (err) {
        console.error('Error fetching initial teams from API:', err);
      }
    }

    fetchInitialTeams();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (teams.length > 0) {
      localStorage.setItem('pokemon_teams_v2', JSON.stringify(teams));
    }
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('pokemon_favorites_v2', JSON.stringify(favorites));
  }, [favorites]);

  const updateTeamsAndSave = (updater) => {
    setTeams((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('pokemon_teams_v2', JSON.stringify(next));
      } catch (e) {
        console.error('Error saving teams to localStorage', e);
      }
      return next;
    });
  };

  const addTeam = (name) => {
    if (!name.trim()) return;
    const newTeam = {
      id: `team-${Date.now()}`,
      name: name.trim(),
      members: []
    };
    updateTeamsAndSave((prev) => [...prev, newTeam]);
  };

  const deleteTeam = (teamId) => {
    updateTeamsAndSave((prev) => prev.filter((t) => t.id !== teamId));
  };

  const addPokemonToTeam = (teamId, pokemon) => {
    updateTeamsAndSave((prev) =>
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
              nickname: pokemon.nickname || '',
              image: pokemon.image || pokemon.sprites?.front_default,
              types: pokemon.types ? (typeof pokemon.types[0] === 'string' ? pokemon.types : pokemon.types.map(t => t.type?.name || t)) : []
            }
          ]
        };
      })
    );
  };

  const renamePokemonInTeam = (teamId, pokemonName, nickname, slotIndex = null) => {
    updateTeamsAndSave((prev) =>
      prev.map((team) => {
        if (team.id !== teamId) return team;
        return {
          ...team,
          members: team.members.map((m, idx) => {
            if (slotIndex !== null ? idx === slotIndex : m.name === pokemonName) {
              return { ...m, nickname: nickname.trim() };
            }
            return m;
          })
        };
      })
    );
  };

  const getPokemonNickname = (pokemonName) => {
    if (!pokemonName) return '';
    for (const team of teams) {
      const found = team.members.find(
        (m) => m.name.toLowerCase() === pokemonName.toLowerCase() && m.nickname
      );
      if (found) return found.nickname;
    }
    return '';
  };

  const removePokemonFromTeam = (teamId, pokemonName) => {
    updateTeamsAndSave((prev) =>
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
        renamePokemonInTeam,
        getPokemonNickname,
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
