import { useEffect, useState } from "react";
import "./App.css";
import ExitIcon from "./assets/download.png"

export default function App() {
  const [query, setQuery] = useState("");
  const [pokemon, setPokemon] = useState(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Enter" && query.trim() !== "") {
        getPokemon(query.toLowerCase());
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [query]);

  async function getPokemon(query) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
      if (!res.ok) throw new Error("Pokémon not found");

      const data = await res.json();
      const speciesRes = await fetch(data.species.url);
      const speciesData = await speciesRes.json();

      const flavorTextEntry = speciesData.flavor_text_entries.find(
        (entry) => entry.language.name === "en"
      );

      const parsedData = {
        name: data.name,
        id: data.id,
        image: data.sprites.other["official-artwork"].front_default,
        types: data.types.map((t) => t.type.name),
        description: flavorTextEntry
          ? flavorTextEntry.flavor_text.replace(/\f/g, " ")
          : "No description available.",
        abilities: data.abilities,
      };
      setPokemon(parsedData);
    } catch (err) {
      setPokemon(null);
      console.error(err);
    }
  }

  return (
    <div className="pokedex">
      <Header />
      <Search query={query} setQuery={setQuery} getPokemon={getPokemon} />
      <PokeMainCard pokemon={pokemon} />
    </div>
  );
}

function Header() {
  return (
    <div className="header">
      <div className="info">Info</div>
      <h2 className="title">POKEDEX</h2>
      <div className="exit">⨉</div>
    </div>
  );
}

function PokeMainCard({ pokemon }) {
  return (
    <div className="main-card">
      <PokeImage pokemon={pokemon} />
      <PokeDescription pokemon={pokemon} />
    </div>
  );
}

function Search({ query, setQuery, getPokemon }) {
  const handleClick = () => {
    if (query.trim() !== "") {
      getPokemon(query.toLowerCase());
    }
  }

  return (
    <div className="search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleClick}>
        search
      </button>
    </div>
  );
}

function PokeImage({ pokemon }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(!!pokemon);
  }, [pokemon?.image]);

  function handleImageLoad() {
    setLoading(false);
  }

  return (
    <div className="image">
      {pokemon ? (
        <>
          {loading && <div className="loader"></div>}
          <img
            key={pokemon.image}
            src={pokemon.image}
            alt={pokemon.name}
            style={{ display: loading ? "none" : "block" }}
            onLoad={handleImageLoad}
          />
        </>
      ) : (
        <p>No pokemon to display!</p>
      )}
    </div>
  );
}

function PokeDescription({ pokemon }) {
  return (
    <div className="description">
      {pokemon ? (
        <>
          <h5 className="poke-no">PokeNo: #{pokemon.id}</h5>
          <h2 className="poke-name">
            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </h2>
          <p className="section-title show-types">Type:</p>
          {pokemon.types.map((type) => (
            <span key={type} className={`types-${type}`}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          ))}
          <p className="section-title">Abilities:</p>
          <PokeAbilities abilities={pokemon.abilities} />
          <p className="poke-info">{pokemon.description}</p>
        </>
      ) : (
        <p>Search a pokemon to read info!</p>
      )}
    </div>
  );
}

function PokeAbilities({ abilities }) {
  return (
    <div>
      {abilities.map((a) => (
        <ul key={a.ability.name}>
          <li className="ability-item">{a.ability.name}</li>
        </ul>
      ))}
    </div>
  );
}
