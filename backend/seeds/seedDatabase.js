// seeds/seedDatabase.js
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

// Connect to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/pokedex";
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Pokemon Schema (same as in server.js)
const pokemonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    abilities: {
      type: String,
      required: true,
    },
    stats: {
      hp: { type: Number, default: 0 },
      attack: { type: Number, default: 0 },
      defense: { type: Number, default: 0 },
      speed: { type: Number, default: 0 },
    },
    sprite: {
      type: String,
      default: null,
    },
    pokeApiId: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Pokemon = mongoose.model("Pokemon", pokemonSchema);

// Popular Pokemon to seed the database
const popularPokemon = [
  "pikachu",
  "charizard",
  "blastoise",
  "venusaur",
  "alakazam",
  "machamp",
  "gengar",
  "dragonite",
  "mewtwo",
  "mew",
  "typhlosion",
  "feraligatr",
  "meganium",
  "espeon",
  "umbreon",
  "blaziken",
  "swampert",
  "sceptile",
  "garchomp",
  "lucario",
  "greninja",
  "talonflame",
  "sylveon",
  "decidueye",
  "incineroar",
];

// Function to fetch Pokemon data from PokeAPI
const fetchPokemonData = async (pokemonName) => {
  try {
    console.log(`Fetching data for ${pokemonName}...`);
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
    };
  } catch (error) {
    console.error(`Error fetching ${pokemonName}:`, error.message);
    return null;
  }
};

// Function to seed the database
const seedDatabase = async () => {
  try {
    console.log("Starting database seeding...");

    // Clear existing data
    await Pokemon.deleteMany({});
    console.log("Cleared existing Pokemon data");

    // Fetch and save Pokemon data
    const pokemonData = [];

    for (const pokemonName of popularPokemon) {
      const data = await fetchPokemonData(pokemonName);
      if (data) {
        pokemonData.push(data);
      }
      // Add delay to avoid overwhelming PokeAPI
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Insert all Pokemon at once
    if (pokemonData.length > 0) {
      await Pokemon.insertMany(pokemonData);
      console.log(`Successfully seeded ${pokemonData.length} Pokemon!`);
    } else {
      console.log("No Pokemon data to seed");
    }

    // Display seeded Pokemon
    const seededPokemon = await Pokemon.find({})
      .select("name type")
      .sort({ name: 1 });
    console.log("\nSeeded Pokemon:");
    seededPokemon.forEach((pokemon) => {
      console.log(`- ${pokemon.name} (${pokemon.type})`);
    });
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
};

// Run the seeder
seedDatabase();
