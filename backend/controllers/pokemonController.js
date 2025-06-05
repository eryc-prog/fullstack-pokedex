// controllers/pokemonController.js
const Pokemon = require("../models/Pokemon");
const axios = require("axios");

// Helper function to fetch from PokeAPI
const fetchFromPokeAPI = async (pokemonName) => {
  try {
    console.log(`🔍 Fetching ${pokemonName} from PokeAPI...`);
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
    );
    const data = response.data;

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
        speed: data.stats.find((s) => s.stat.name === "speed")?.base_stat || 0,
      },
      sprite: data.sprites.front_default,
      pokeApiId: data.id,
      category: data.species?.name || "Unknown",
    };
  } catch (error) {
    console.error(`Error fetching ${pokemonName} from PokeAPI:`, error.message);
    return null;
  }
};

// @desc    Get all Pokemon
// @route   GET /api/pokemon
// @access  Public
const getAllPokemon = async (req, res) => {
  try {
    const { search, type, limit = 50, page = 1, sort = "name" } = req.query;
    let query = {};

    // Build search query
    if (search) {
      query = await Pokemon.searchPokemon(search).getQuery();
    }

    // Filter by type
    if (type) {
      query.type = { $regex: type, $options: "i" };
    }

    // Pagination
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sort] = 1;

    // Execute query
    const pokemon = await Pokemon.find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort(sortOptions);

    const total = await Pokemon.countDocuments(query);

    res.status(200).json({
      success: true,
      count: pokemon.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      pokemon,
    });
  } catch (error) {
    console.error("Error in getAllPokemon:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching Pokemon",
    });
  }
};

// @desc    Get single Pokemon by ID
// @route   GET /api/pokemon/:id
// @access  Public
const getPokemonById = async (req, res) => {
  try {
    const pokemon = await Pokemon.findById(req.params.id);

    if (!pokemon) {
      return res.status(404).json({
        success: false,
        error: "Pokemon not found",
      });
    }

    res.status(200).json({
      success: true,
      data: pokemon,
    });
  } catch (error) {
    console.error("Error in getPokemonById:", error);

    // Handle invalid ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid Pokemon ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error while fetching Pokemon",
    });
  }
};

// @desc    Create new Pokemon
// @route   POST /api/pokemon
// @access  Public
const createPokemon = async (req, res) => {
  try {
    let pokemonData = req.body;

    // Check if Pokemon already exists
    const existingPokemon = await Pokemon.findOne({
      name: pokemonData.name.toLowerCase(),
    });

    if (existingPokemon) {
      return res.status(400).json({
        success: false,
        error: "Pokemon already exists in database",
      });
    }

    // Try to fetch additional data from PokeAPI if not provided
    if (pokemonData.name && (!pokemonData.sprite || !pokemonData.pokeApiId)) {
      const pokeApiData = await fetchFromPokeAPI(pokemonData.name);
      if (pokeApiData) {
        // Merge PokeAPI data with provided data (provided data takes priority)
        pokemonData = {
          ...pokeApiData,
          ...pokemonData,
          stats: {
            ...pokeApiData.stats,
            ...pokemonData.stats,
          },
        };
        console.log(`✨ Enhanced ${pokemonData.name} with PokeAPI data`);
      }
    }

    const pokemon = new Pokemon(pokemonData);
    await pokemon.save();

    res.status(201).json({
      success: true,
      message: "Pokemon created successfully",
      data: pokemon,
    });
  } catch (error) {
    console.error("Error in createPokemon:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Pokemon with this name already exists",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        details: messages,
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error while creating Pokemon",
    });
  }
};

// @desc    Update Pokemon
// @route   PUT /api/pokemon/:id
// @access  Public
const updatePokemon = async (req, res) => {
  try {
    const pokemon = await Pokemon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!pokemon) {
      return res.status(404).json({
        success: false,
        error: "Pokemon not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pokemon updated successfully",
      data: pokemon,
    });
  } catch (error) {
    console.error("Error in updatePokemon:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        details: messages,
      });
    }

    // Handle invalid ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid Pokemon ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error while updating Pokemon",
    });
  }
};

// @desc    Delete Pokemon
// @route   DELETE /api/pokemon/:id
// @access  Public
const deletePokemon = async (req, res) => {
  try {
    const pokemon = await Pokemon.findByIdAndDelete(req.params.id);

    if (!pokemon) {
      return res.status(404).json({
        success: false,
        error: "Pokemon not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pokemon deleted successfully",
      data: pokemon,
    });
  } catch (error) {
    console.error("Error in deletePokemon:", error);

    // Handle invalid ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid Pokemon ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error while deleting Pokemon",
    });
  }
};

// @desc    Import Pokemon from PokeAPI
// @route   POST /api/pokemon/import/:name
// @access  Public
const importPokemonFromAPI = async (req, res) => {
  try {
    const pokemonName = req.params.name.toLowerCase();

    // Check if Pokemon already exists
    const existingPokemon = await Pokemon.findOne({ name: pokemonName });
    if (existingPokemon) {
      return res.status(400).json({
        success: false,
        error: "Pokemon already exists in database",
      });
    }

    const pokeApiData = await fetchFromPokeAPI(pokemonName);
    if (!pokeApiData) {
      return res.status(404).json({
        success: false,
        error: "Pokemon not found in PokeAPI",
      });
    }

    const pokemon = new Pokemon(pokeApiData);
    await pokemon.save();

    res.status(201).json({
      success: true,
      message: "Pokemon imported successfully from PokeAPI",
      data: pokemon,
    });
  } catch (error) {
    console.error("Error in importPokemonFromAPI:", error);
    res.status(500).json({
      success: false,
      error: "Server error while importing Pokemon",
    });
  }
};

// @desc    Search Pokemon in PokeAPI
// @route   GET /api/pokemon/search/:name
// @access  Public
const searchPokemonInAPI = async (req, res) => {
  try {
    const pokemonData = await fetchFromPokeAPI(req.params.name);
    if (!pokemonData) {
      return res.status(404).json({
        success: false,
        error: "Pokemon not found in PokeAPI",
      });
    }

    res.status(200).json({
      success: true,
      data: pokemonData,
    });
  } catch (error) {
    console.error("Error in searchPokemonInAPI:", error);
    res.status(500).json({
      success: false,
      error: "Server error while searching Pokemon in API",
    });
  }
};

// @desc    Get all unique Pokemon types
// @route   GET /api/pokemon/types
// @access  Public
const getPokemonTypes = async (req, res) => {
  try {
    const types = await Pokemon.distinct("type");
    const allTypes = new Set();

    types.forEach((typeString) => {
      if (typeString) {
        typeString.split(", ").forEach((type) => {
          allTypes.add(type.trim());
        });
      }
    });

    res.status(200).json({
      success: true,
      count: allTypes.size,
      data: Array.from(allTypes).sort(),
    });
  } catch (error) {
    console.error("Error in getPokemonTypes:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching Pokemon types",
    });
  }
};

// @desc    Get Pokemon statistics
// @route   GET /api/pokemon/stats
// @access  Public
const getPokemonStats = async (req, res) => {
  try {
    const totalPokemon = await Pokemon.countDocuments();
    const types = await Pokemon.distinct("type");
    const uniqueTypes = new Set();

    types.forEach((typeString) => {
      if (typeString) {
        typeString.split(", ").forEach((type) => {
          uniqueTypes.add(type.trim());
        });
      }
    });

    const averageStats = await Pokemon.aggregate([
      {
        $group: {
          _id: null,
          avgHp: { $avg: "$stats.hp" },
          avgAttack: { $avg: "$stats.attack" },
          avgDefense: { $avg: "$stats.defense" },
          avgSpeed: { $avg: "$stats.speed" },
          avgHeight: { $avg: "$height" },
          avgWeight: { $avg: "$weight" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPokemon,
        totalTypes: uniqueTypes.size,
        averageStats: averageStats[0] || {},
      },
    });
  } catch (error) {
    console.error("Error in getPokemonStats:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching Pokemon statistics",
    });
  }
};

module.exports = {
  getAllPokemon,
  getPokemonById,
  createPokemon,
  updatePokemon,
  deletePokemon,
  importPokemonFromAPI,
  searchPokemonInAPI,
  getPokemonTypes,
  getPokemonStats,
};
