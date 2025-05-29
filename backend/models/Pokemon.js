// models/Pokemon.js
const mongoose = require("mongoose");

const pokemonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Pokemon name is required"],
      // unique: true,
      lowercase: true,
      trim: true,
      minlength: [1, "Name must be at least 1 character long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    type: {
      type: String,
      required: [true, "Pokemon type is required"],
      trim: true,
    },
    height: {
      type: Number,
      required: [true, "Pokemon height is required"],
      min: [0, "Height must be a positive number"],
    },
    weight: {
      type: Number,
      required: [true, "Pokemon weight is required"],
      min: [0, "Weight must be a positive number"],
    },
    abilities: {
      type: String,
      required: [true, "Pokemon abilities are required"],
      trim: true,
    },
    stats: {
      hp: {
        type: Number,
        default: 0,
        min: [0, "HP must be a positive number"],
        max: [255, "HP cannot exceed 255"],
      },
      attack: {
        type: Number,
        default: 0,
        min: [0, "Attack must be a positive number"],
        max: [255, "Attack cannot exceed 255"],
      },
      defense: {
        type: Number,
        default: 0,
        min: [0, "Defense must be a positive number"],
        max: [255, "Defense cannot exceed 255"],
      },
      speed: {
        type: Number,
        default: 0,
        min: [0, "Speed must be a positive number"],
        max: [255, "Speed cannot exceed 255"],
      },
    },
    sprite: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          // If sprite is provided, it should be a valid URL
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Sprite must be a valid URL",
      },
    },
    pokeApiId: {
      type: Number,
      default: null,
      min: [1, "PokeAPI ID must be a positive number"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, "Category cannot exceed 50 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
pokemonSchema.index({ name: 1 });
pokemonSchema.index({ type: 1 });
pokemonSchema.index({ pokeApiId: 1 });
pokemonSchema.index({ name: "text", type: "text" }); // Text search index

// Virtual for total base stats
pokemonSchema.virtual("totalStats").get(function () {
  return (
    this.stats.hp + this.stats.attack + this.stats.defense + this.stats.speed
  );
});

// Virtual for capitalized name
pokemonSchema.virtual("displayName").get(function () {
  return this.name.charAt(0).toUpperCase() + this.name.slice(1);
});

// Instance method to get primary type
pokemonSchema.methods.getPrimaryType = function () {
  return this.type.split(", ")[0];
};

// Instance method to get all types as array
pokemonSchema.methods.getTypesArray = function () {
  return this.type.split(", ").map((type) => type.trim());
};

// Static method to find by type
pokemonSchema.statics.findByType = function (type) {
  return this.find({ type: { $regex: type, $options: "i" } });
};

// Static method to search pokemon
pokemonSchema.statics.searchPokemon = function (searchTerm) {
  return this.find({
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { type: { $regex: searchTerm, $options: "i" } },
      { abilities: { $regex: searchTerm, $options: "i" } },
    ],
  });
};

// Pre-save middleware to ensure name is lowercase
pokemonSchema.pre("save", function (next) {
  if (this.name) {
    this.name = this.name.toLowerCase().trim();
  }
  next();
});

// Post-save middleware for logging
pokemonSchema.post("save", function (doc) {
  console.log(`✅ Pokemon saved: ${doc.displayName} (${doc.type})`);
});

// Pre-remove middleware for logging
pokemonSchema.pre("remove", function (next) {
  console.log(`🗑️  Removing Pokemon: ${this.displayName}`);
  next();
});

const Pokemon = mongoose.model("Pokemon", pokemonSchema);

module.exports = Pokemon;
