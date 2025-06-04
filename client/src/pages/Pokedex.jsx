import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Search, Plus, Edit, Trash2, Heart, Star, Zap } from "lucide-react";

const API_BASE_URL = "https://backend-pokedex-zc3q.onrender.com/api";

const Pokedex = () => {
  const [pokemon, setPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    height: "",
    weight: "",
    abilities: "",
    stats: {
      hp: "",
      attack: "",
      defense: "",
      speed: "",
    },
  });

  useEffect(() => {
    fetchPokemon();
  }, []);

  const fetchPokemon = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pokemon`);
      const data = await response.json();
      // Handle the new API response structure
      setPokemon(data.success ? data.pokemon : []);
    } catch (error) {
      console.error("Error fetching Pokemon:", error);
      setPokemon([]);
    }
    setLoading(false);
  };

  const fetchFromPokeAPI = async (pokemonName) => {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
      );
      const data = await response.json();

      return {
        name: data.name,
        type: data.types.map((t) => t.type.name).join(", "),
        height: data.height,
        weight: data.weight,
        abilities: data.abilities.map((a) => a.ability.name).join(", "),
        stats: {
          hp: data.stats.find((s) => s.stat.name === "hp")?.base_stat || 0,
          attack:
            data.stats.find((s) => s.stat.name === "attack")?.base_stat || 0,
          defense:
            data.stats.find((s) => s.stat.name === "defense")?.base_stat || 0,
          speed:
            data.stats.find((s) => s.stat.name === "speed")?.base_stat || 0,
        },
        sprite: data.sprites.front_default,
      };
    } catch (error) {
      console.error("Error fetching from PokeAPI:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let pokemonData = { ...formData };

      // If adding new Pokemon, try to fetch from PokeAPI first
      if (modalMode === "add" && formData.name) {
        const pokeApiData = await fetchFromPokeAPI(formData.name);
        if (pokeApiData) {
          pokemonData = { ...pokemonData, ...pokeApiData };
        }
      }

      const url =
        modalMode === "add"
          ? `${API_BASE_URL}/pokemon`
          : `${API_BASE_URL}/pokemon/${selectedPokemon._id}`;

      const method = modalMode === "add" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pokemonData),
      });

      const result = await response.json();

      if (result.success) {
        fetchPokemon();
        closeModal();
      } else {
        console.error("Error saving Pokemon:", result.error);
        alert(result.error || "Failed to save Pokemon");
      }
    } catch (error) {
      console.error("Error saving Pokemon:", error);
    }
    setLoading(false);
  };

  const deletePokemon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Pokemon?"))
      return;

    try {
      const response = await fetch(`${API_BASE_URL}/pokemon/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        fetchPokemon();
        closeModal();
      } else {
        console.error("Error deleting Pokemon:", result.error);
        alert(result.error || "Failed to delete Pokemon");
      }
    } catch (error) {
      console.error("Error deleting Pokemon:", error);
    }
  };

  const openModal = (mode, pokemonData = null) => {
    setModalMode(mode);
    setSelectedPokemon(pokemonData);

    if (mode === "add") {
      setFormData({
        name: "",
        type: "",
        height: "",
        weight: "",
        abilities: "",
        stats: { hp: "", attack: "", defense: "", speed: "" },
      });
    } else if (pokemonData) {
      setFormData({
        name: pokemonData.name || "",
        type: pokemonData.type || "",
        height: pokemonData.height || "",
        weight: pokemonData.weight || "",
        abilities: pokemonData.abilities || "",
        stats: {
          hp: pokemonData.stats?.hp || "",
          attack: pokemonData.stats?.attack || "",
          defense: pokemonData.stats?.defense || "",
          speed: pokemonData.stats?.speed || "",
        },
      });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPokemon(null);
    setModalMode("view");
  };

  const getTypeColor = (type) => {
    const colors = {
      fire: "bg-red-500",
      water: "bg-blue-500",
      grass: "bg-green-500",
      electric: "bg-yellow-500",
      psychic: "bg-pink-500",
      ice: "bg-cyan-500",
      dragon: "bg-purple-500",
      fairy: "bg-pink-300",
      normal: "bg-gray-400",
      fighting: "bg-red-700",
      poison: "bg-purple-600",
      ground: "bg-yellow-600",
      flying: "bg-indigo-400",
      bug: "bg-green-400",
      rock: "bg-yellow-800",
      ghost: "bg-purple-700",
      steel: "bg-gray-500",
      dark: "bg-gray-800",
    };
    return colors[type?.toLowerCase()] || "bg-gray-400";
  };

  const filteredPokemon = pokemon.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-200 to-pink-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <NavLink to={"/"}>
            <span className="text-5xl font-bold text-gray-700 mb-4 drop-shadow-lg">
              Pokédex
            </span>
          </NavLink>
          <p className="text-xl text-gray-700">Gotta Catch 'Em All!</p>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search Pokemon by name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border-0 shadow-lg focus:ring-4 focus:ring-blue-300 transition-all"
            />
          </div>
          <button
            onClick={() => openModal("add")}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Pokemon
          </button>
        </div>

        {/* Pokemon Grid */}
        {loading ? (
          <div className="text-center text-white text-xl">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPokemon.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-xl shadow-xl overflow-hidden transform hover:scale-105 transition-all cursor-pointer"
                onClick={() => openModal("view", p)}
              >
                <div className="p-6">
                  {p.sprite && (
                    <img
                      src={p.sprite}
                      alt={p.name}
                      className="w-24 h-24 mx-auto mb-4"
                    />
                  )}
                  <h3 className="text-xl font-bold text-center mb-2 capitalize">
                    {p.name}
                  </h3>
                  <div className="flex flex-wrap gap-1 justify-center mb-4">
                    {p.type?.split(", ").map((type, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getTypeColor(
                          type
                        )}`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>Height: {p.height}</div>
                    <div>Weight: {p.weight}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {modalMode === "add"
                      ? "Add Pokemon"
                      : modalMode === "edit"
                      ? "Edit Pokemon"
                      : "Pokemon Details"}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {modalMode === "view" && selectedPokemon ? (
                  <div className="space-y-4">
                    {selectedPokemon.sprite && (
                      <img
                        src={selectedPokemon.sprite}
                        alt={selectedPokemon.name}
                        className="w-32 h-32 mx-auto"
                      />
                    )}
                    <h3 className="text-3xl font-bold text-center capitalize">
                      {selectedPokemon.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {selectedPokemon.type?.split(", ").map((type, idx) => (
                        <span
                          key={idx}
                          className={`px-4 py-2 rounded-full text-white font-semibold ${getTypeColor(
                            type
                          )}`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="text-2xl font-bold">
                          {selectedPokemon.height}
                        </div>
                        <div className="text-gray-600">Height</div>
                      </div>
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="text-2xl font-bold">
                          {selectedPokemon.weight}
                        </div>
                        <div className="text-gray-600">Weight</div>
                      </div>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Abilities</h4>
                      <p>{selectedPokemon.abilities}</p>
                    </div>

                    {selectedPokemon.stats && (
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Zap size={20} />
                          Base Stats
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(selectedPokemon.stats).map(
                            ([stat, value]) => (
                              <div
                                key={stat}
                                className="flex items-center gap-3"
                              >
                                <div className="w-16 text-sm font-medium capitalize">
                                  {stat}
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{
                                      width: `${Math.min(value / 2, 100)}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="w-8 text-sm font-bold">
                                  {value}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => openModal("edit", selectedPokemon)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => deletePokemon(selectedPokemon._id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Type
                      </label>
                      <input
                        type="text"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., fire, water"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Height
                        </label>
                        <input
                          type="number"
                          value={formData.height}
                          onChange={(e) =>
                            setFormData({ ...formData, height: e.target.value })
                          }
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Weight
                        </label>
                        <input
                          type="number"
                          value={formData.weight}
                          onChange={(e) =>
                            setFormData({ ...formData, weight: e.target.value })
                          }
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Abilities
                      </label>
                      <input
                        type="text"
                        value={formData.abilities}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            abilities: e.target.value,
                          })
                        }
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., blaze, solar-power"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Base Stats
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(formData.stats).map(([stat, value]) => (
                          <div key={stat}>
                            <label className="block text-xs text-gray-600 mb-1 capitalize">
                              {stat}
                            </label>
                            <input
                              type="number"
                              value={value}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  stats: {
                                    ...formData.stats,
                                    [stat]: e.target.value,
                                  },
                                })
                              }
                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                              min="0"
                              max="255"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
                      >
                        {loading
                          ? "Saving..."
                          : modalMode === "add"
                          ? "Add Pokemon"
                          : "Update Pokemon"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pokedex;
