import React from "react";
import { useNavigate } from "react-router-dom";
import ball from "/src/assets/ball.jpg";

function LandingPage() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/pokedex"); // Navigate to the dashboard
  };

  return (
    <div
      className="h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${ball})` }}
    >
      <div className="flex flex-col items-center justify-center h-screen p-auto m-auto text-center">
        <div className="mb-80">
          <h1 className="font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl">
            Pokedex
          </h1>
          <p className="mb-6 text-white text-x1 sm:text-x-1 md:text-x-1 lg:text-x1">
            Discover and explore the world of Pokémon with our interactive
            Pokedex!
            <br />
            Click the button below to start your journey.
          </p>
        </div>
        <div className="mt-0">
          <button
            onClick={handleNavigate}
            className="px-6 py-3 bg-amber-400 text-white rounded-lg hover:bg-amber-500 font-semibold shadow-md"
          >
            Let's Catch Them All!
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
