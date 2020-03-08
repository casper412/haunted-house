import React from "react";
import { render } from "react-dom";
import { Client } from "boardgame.io/react";
//import { Local } from "boardgame.io/multiplayer";

// Load the Game
import { CubScoutAdventure } from "./game";
// Load the Board (the drawing of the game)
import { CubScoutAdventureBoard } from "./board";

const CubScoutAdventureClient = Client({
  game: CubScoutAdventure,
  board: CubScoutAdventureBoard,
  //multiplayer: Local(),
  debug: false
});

/* Create the main interface to the game */
const App = () => (
  <div>
    <CubScoutAdventureClient />
  </div>
);

render(<App />, document.getElementById("root"));

