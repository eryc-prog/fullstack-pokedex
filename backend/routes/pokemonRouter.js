// routes/pokemonRoutes.js
const express = require("express");
const {
  getAllPokemon,
  getPokemonById,
  createPokemon,
  updatePokemon,
  deletePokemon,
  importPokemonFromAPI,
  searchPokemonInAPI,
  getPokemonTypes,
  getPokemonStats,
} = require("../controllers/pokemonController");

const router = express.Router();

// @route   GET /api/pokemon/types
// @desc    Get all unique Pokemon types
// @access  Public
router.get("/types", getPokemonTypes);

// @route   GET /api/pokemon/stats
// @desc    Get Pokemon database statistics
// @access  Public
router.get("/stats", getPokemonStats);

// @route   GET /api/pokemon/search/:name
// @desc    Search Pokemon in PokeAPI (doesn't save to database)
// @access  Public
router.get("/search/:name", searchPokemonInAPI);

// @route   POST /api/pokemon/import/:name
// @desc    Import Pokemon from PokeAPI and save to database
// @access  Public
router.post("/import/:name", importPokemonFromAPI);

// @route   GET /api/pokemon
// @desc    Get all Pokemon with optional filtering
// @access  Public
router.get("/", getAllPokemon);

// @route   GET /api/pokemon/:id
// @desc    Get single Pokemon by ID
// @access  Public
router.get("/:id", getPokemonById);

// @route   POST /api/pokemon
// @desc    Create new Pokemon
// @access  Public
router.post("/", createPokemon);

// @route   PUT /api/pokemon/:id
// @desc    Update Pokemon by ID
// @access  Public
router.put("/:id", updatePokemon);

// @route   DELETE /api/pokemon/:id
// @desc    Delete Pokemon by ID
// @access  Public
router.delete("/:id", deletePokemon);

module.exports = router;
