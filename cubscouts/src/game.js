function IsVictory(cells) {
  return cells[cells.length - 1].occupied.length > 0;
}

function move(G, ctx, dist) {
  let loc = null;
  // Figure out where the player
  for (let i = 0; i < G.cells.length; i++) {
    if (G.cells[i].occupied.indexOf(ctx.currentPlayer) > -1) {
      loc = i;
      break;
    }
  }  
  // Move forward
  G.cells[loc].occupied.splice(G.cells[loc].occupied.indexOf(ctx.currentPlayer), 1);
  if (loc + dist >= G.cells.length) {
    G.cells[G.cells.length - 1].occupied.push(ctx.currentPlayer);
  } else if (loc + dist < 0) {
    G.cells[0].occupied.push(ctx.currentPlayer);
  } else {
    G.cells[loc + dist].occupied.push(ctx.currentPlayer);
  }
}

function RollDie(G, ctx) {
  // Roll the dice
  var diceRoll = ctx.random.Die(6);
  move(G, ctx, diceRoll);
  // Save the last dice roll
  G.lastRoll = diceRoll;

  // Pick a question at random
  G.question = ctx.random.Die(G.questions.length) - 1;
  ctx.events.setStage('question_stage');
}

function SelectAnswer(G, ctx, id) {
  let question_definition = G.questions[G.question];
  if (id == question_definition.correct_answer) {

  } else {
    move(G, ctx, -3);
  }
  ctx.events.setActivePlayers({ all: 'move_stage'});
  ctx.events.endTurn();
}

export const CubScoutAdventure = {
  name: "cub-scout-adventure",

  setup: (ctx) => {
    ctx.events.setStage('move_stage');
    console.log("Setting up");
    return {
      cells: 
        [
          { occupied: ["0","1"], className: 'start'
          }, 
          { occupied: [], className: 'rocks' }, { occupied: [], className: 'field'  }, { occupied: [], className: 'field' },
          { occupied: [], className: 'field' }, { occupied: [], className: 'field'  }, { occupied: [], className: 'marsh' },
          { occupied: [], className: 'sand'  }, { occupied: [], className: 'marsh'  }, { occupied: [], className: 'field' },
          { occupied: [], className: 'rocks' }, { occupied: [], className: 'rocks'  }, { occupied: [], className: 'marsh' },
          { occupied: [], className: 'rocks' }, { occupied: [], className: 'rocks'  }, { occupied: [], className: 'field' },
          { occupied: [], className: 'field' }, { occupied: [], className: 'sand'   }, { occupied: [], className: 'rocks' },
          { occupied: [], className: 'rocks' }, { occupied: [], className: 'field'  }, { occupied: [], className: 'marsh' },
          { occupied: [], className: 'field' }, { occupied: [], className: 'marsh'  }, { occupied: [], className: 'marsh' },
          { occupied: [], className: 'marsh' }, { occupied: [], className: 'marsh'  }, { occupied: [], className: 'marsh' },
          { occupied: [], className: 'rocks' }, { occupied: [], className: 'forest' }, { occupied: [], className: 'rocks' },
          { occupied: [], className: 'finish' }
        ],
        lastRoll: 0,
        questions: [
          { question_text: 'What color is the sky?',
            possible_answers: ['green','white','blue','orange'], correct_answer: 2 },
          { question_text: 'What color is the sun?',
            possible_answers: ['green','white','blue','orange'], correct_answer: 3},
        ],
        question: 0
    };
  },

  moves: {
  },

  turn: { 
    stages: {
      move_stage: {
        moves: { RollDie },
      },
      question_stage: {
        moves: { SelectAnswer },
      },
    },
    moveLimit: 2
  },

  endIf: (G, ctx) => {
    if (IsVictory(G.cells)) {
      return { winner: ctx.currentPlayer };
    }
  }
};


