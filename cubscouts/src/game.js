import { TurnOrder } from 'boardgame.io/core';

function IsVictory(pieces, cells) {
  for (var i = 0; i < pieces.length; i++) {
    if (pieces[i].square >= cells.length - 1) {
      return true;
    }
  }
  return false;
}

function move(G, ctx, dist, playerPiece) {
  let square = G.pieces[ctx.currentPlayer].square;
  // Move forward
  if (square + dist >= G.cells.length) {
    G.pieces[ctx.currentPlayer].square = G.cells.length - 1;
  } else if (square + dist < 0) {
    G.pieces[ctx.currentPlayer].square = 0;
  } else {
    G.pieces[ctx.currentPlayer].square = square + dist;
  }
}

function RollDie(G, ctx, messageRef) {
  // Roll the dice
  var diceRoll = ctx.random.Die(6);
  move(G, ctx, diceRoll);
  // Save the last dice roll
  G.lastRoll = diceRoll;

  // Pick a question at random
  G.question = ctx.random.Die(G.questions.length) - 1;
  G.question_answered = false;
  G.question_answered_correctly = null;

  let square = G.pieces[ctx.currentPlayer].square;
  if (G.cells[square].className === 'go_back') {
    // Enter special stage to handle board dynamics
    ctx.events.setStage({ stage: 'board_stage', moveLimit: 4 });

    messageRef.current.classList.remove("hide");
    messageRef.current.classList.add("show");
  } else {
    ctx.events.setStage({ stage: 'card_stage', moveLimit: 3 });
  }
}

function ClearMessage(G, ctx, messageRef) {
  let square = G.pieces[ctx.currentPlayer].square;
  messageRef.current.classList.add("hide");
  messageRef.current.classList.remove("show");
  if (G.cells[square].className === 'go_back') {
    move(G, ctx, -3);
  }
  ctx.events.setStage('card_stage');
}

function GetCard(G, ctx, questionRef, answerQuestionRef) {
  // Show the question
  questionRef.current.classList.remove("answered");
  questionRef.current.classList.add("not-answered");
  answerQuestionRef.current.classList.add("hide");
  // change the stage
  ctx.events.setStage('question_stage');
}

function SelectAnswer(G, ctx, id, questionRef, answerQuestionRef) {
  // Handle wrong answers
  G.question_answered = true;
  let question_definition = G.questions[G.question];
  if (id === question_definition.correct_answer) {
    G.question_answered_correctly = true;
  } else {
    G.question_answered_correctly = false;
    move(G, ctx, -3);
  }
  // Hide the Question
  // Hide the question
  if (questionRef.current) {
    questionRef.current.classList.add("answered");
    questionRef.current.classList.remove("not-answered");
  }
  answerQuestionRef.current.classList.remove("hide");
  // Change the stage and the turn
  ctx.events.endTurn();
  ctx.events.setActivePlayers({ all: 'move_stage' });
}

export const CubScoutAdventure = {
  name: "cub-scout-adventure",

  setup: (ctx) => {
    ctx.events.setStage('move_stage');
    console.log("Setting up");
    return {
      cells:
        [
          { className: 'start', top: 0, left: 0 }, // 0
          { className: 'rocks', top: 50, left: 0 },
          { className: 'field', top: 100, left: 5 },
          { className: 'field', top: 150, left: 15 },
          { className: 'field', top: 200, left: 25 },
          { className: 'go_back', top: 250, left: 30 },
          { className: 'marsh', top: 300, left: 35 },
          { className: 'sand', top: 350, left: 45 },
          { className: 'marsh', top: 400, left: 50 },
          { className: 'field', top: 450, left: 58 },
          { className: 'rocks', top: 450, left: 108 }, // 10
          { className: 'rocks', top: 400, left: 125 },
          { className: 'marsh', top: 350, left: 130 },
          { className: 'rocks', top: 300, left: 133 },
          { className: 'rocks', top: 250, left: 136 },
          { className: 'field', top: 200, left: 139 },
          { className: 'bridge', top: 150, left: 143 },
          { className: 'sand', top: 100, left: 155 },
          { className: 'rocks', top: 50, left: 164 },
          { className: 'rocks', top: 15, left: 213 },
          { className: 'field', top: 65, left: 226 }, // 20
          { className: 'marsh', top: 115, left: 230 },
          { className: 'field', top: 165, left: 233 },
          { className: 'go_back', top: 215, left: 238 },
          { className: 'marsh', top: 265, left: 243 },
          { className: 'marsh', top: 315, left: 252 },
          { className: 'marsh', top: 365, left: 267 },
          { className: 'marsh', top: 415, left: 272 },
          { className: 'rocks', top: 465, left: 286 },
          { className: 'forest', top: 445, left: 336 },
          { className: 'rocks', top: 395, left: 340 },
          { className: 'rocks', top: 345, left: 350 },
          { className: 'forest', top: 295, left: 355 },
          { className: 'rocks', top: 245, left: 360 },
          { className: 'rocks', top: 195, left: 365 },
          { className: 'forest', top: 145, left: 370 },
          { className: 'rocks', top: 95, left: 375 },
          { className: 'rocks', top: 45, left: 380 },
          { className: 'forest', top: 35, left: 430 },
          { className: 'rocks', top: 85, left: 435 },
          { className: 'rocks', top: 135, left: 440 },
          { className: 'forest', top: 185, left: 445 },
          { className: 'rocks', top: 235, left: 450 },
          { className: 'rocks', top: 285, left: 455 },
          { className: 'forest', top: 335, left: 460 },
          { className: 'rocks', top: 385, left: 465 },
          { className: 'rocks', top: 435, left: 470 },
          { className: 'forest', top: 440, left: 520 },
          { className: 'rocks', top: 390, left: 530 },
          { className: 'finish', top: 340, left: 540 }
        ],
      lastRoll: 0,
      questions: [
        { question_text: 'What is the Cub Scout Motto?', 
          possible_answers: ['Respect Wildlife', 'Be Considerate in the Outdoors', 'Scout’s Honor', 'Do Your Best'], 
          correct_answer: 3 },
        { question_text: 'What does WEBELOS stand for?', 
          possible_answers: ['Wolf Eagle Bear Elk Lion Owl Snake', 'Nothing, it’s just a made up word.', 'We Belong Scouts', 'We’ll Be Loyal Scouts'], 
          correct_answer: 3 },
        { question_text: 'What is the Highest Rank in Cub Scouting?', 
          possible_answers: ['Arrow of Light', 'Webelos', 'Bear', 'Arrowhead'], 
          correct_answer: 0 },
        { question_text: 'What skill do you need to Master to get your Bear Claws?', 
          possible_answers: ['Hunting Skills', 'Knife Skills', 'Crafting', 'Gardening'], 
          correct_answer: 1 },
        { question_text: 'Name the Ranks of Cub Scouts from first to last.', 
          possible_answers: ['Wolf, Tiger, Elk, Webelo', 'Lion, Tiger, Bear, Wolf, Webelo, Arrow of Light', 'Lion, Tiger, Wolf, Bear, Webelo, Arrow of Light', 'Wolf, Bear, Webelo'], 
          correct_answer: 2 },
        { question_text: 'What two uniform color shirts are allowed for Webelos?', 
          possible_answers: ['khaki (tan) and black', 'blue and khaki (tan)', 'blue and black', 'blue and red'], 
          correct_answer: 1 },
        { question_text: 'What year was Cub Scouts founded (started) in?',
          possible_answers: ['1980', '1934', '1950', '1910'], 
          correct_answer: 3 },
        { question_text: 'When is the Cub Scouts\' birthday?', 
          possible_answers: ['February 8', 'January 10', 'March 15', 'April 1'], 
          correct_answer: 0 },
        { question_text: 'Which of these is not part of Scout Law?', 
          possible_answers: ['Prepared', 'Trustworthy', 'Brave', 'Clean'], 
          correct_answer: 0 },
        { question_text: 'Which of these is the Scout Slogan?', 
          possible_answers: ['Do Your Chores', 'Spirit is an Attitude', 'Be Thrifty', 'Do a Good Turn Daily'], 
          correct_answer: 3 },
        { question_text: 'How many fingers are used in the Scout Sign?', 
          possible_answers: ['3', '2', '4', '5'], 
          correct_answer: 0 },
        { question_text: 'Which of these is NOT an adventure required for Webelos?', 
          possible_answers: ['First Responder', 'Game Design', 'Duty to God and You', 'Cast Iron Chef'], 
          correct_answer: 1 },
        { question_text: 'When hiking, do we stay on the trail, or go offroading?', 
          possible_answers: ['Stay on the Trail', 'Go Offroading', 'Cut Switchbacks', 'Kick dirt'],
          correct_answer: 0 },
        { question_text: 'Which of these is in the Scout Basic Essentials for when you go hiking or camping?', 
          possible_answers: ['Toy', 'Filled Water Bottle', 'Arrow', 'Balloon'], 
          correct_answer: 1 },
        { question_text: 'When we go out into nature we should Leave No Trace.', 
          possible_answers: ['True', 'False'], 
          correct_answer: 0 },
        { question_text: 'Leopard is the first Rank of Cub Scouts', 
          possible_answers: ['True', 'False'], 
          correct_answer: 1 },
        { question_text: 'When you fold a flag, you should end with a triangle with stripes facing up.', 
          possible_answers: ['True', 'False'], 
          correct_answer: 1 },
      ],
      question: 0,
      question_answered: true,
      question_answered_correctly: null,
      pieces: [
        { id: 0, square: 0 },
        { id: 1, square: 0 },
      ]
    };
  },

  moves: {
  },

  turn: {
    order: TurnOrder.CONTINUE,
    stages: {
      move_stage: {
        moves: { RollDie },
      },
      board_stage: {
        moves: { ClearMessage },
      },
      card_stage: {
        moves: { GetCard },
      },
      question_stage: {
        moves: { SelectAnswer },
      },
    }
  },

  endIf: (G, ctx) => {
    if (IsVictory(G.pieces, G.cells)) {
      return { winner: ctx.currentPlayer };
    }
  }
};


