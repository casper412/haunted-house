import React from 'react';
import PropTypes from 'prop-types';
import './board.css';

export class CubScoutAdventureBoard extends React.Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
    isMultiplayer: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.questionRef = React.createRef();
    this.answerQuestionRef = React.createRef();

    this.playerRefs = [React.createRef(), React.createRef()];
  }

  onClickBoard = () => {
    this.props.moves.RollDie();
  }

  onClickCard = id => {
    this.props.moves.GetCard(this.questionRef, this.answerQuestionRef);
  }

  onClickAnswer = id => {
    this.props.moves.SelectAnswer(id,this.questionRef, this.answerQuestionRef);
  }

  renderInstructions() {
    let instructions = <div id="instructions">
      <span class='title'>Instructions:</span>
      <span>Each player takes turns, click the roll button to move.</span>
      <span>Your piece will move, then click the card deck to get a card.</span>
      <span>Answer the question, but watch out, a wrong answer will move you back 3.</span>
    </div>;
    return instructions
  }

  renderSquares() {
    let squares = [];
    for (let i = 0; i < this.props.G.cells.length; i++) {
      const id = i;
      let classes = this.props.G.cells[i].className + ' square';
      let style   = {'top': this.props.G.cells[i].top + 'px', 'left': this.props.G.cells[i].left + 'px'};
      squares.push(
        <div
          key={id}
          id={'square' + id}
          className={classes}
          style={style}
        >
        </div>
      );
    }
    return squares;
  }

  renderPieces() {
    let pieces = [];
    for (let i = 0; i < this.props.G.pieces.length; i++) {
      let piece = this.props.G.pieces[i];
      let square = piece.square;
      let style = {'top': this.props.G.cells[square].top + 'px', 'left': this.props.G.cells[square].left + 'px'};
      pieces.push(
        <div 
          key={'piece' + i}
          className={'piece piece' + i}
          style={style}
          ref={this.playerRefs[i]}
        ></div>
      );
    }
    return pieces;
  }

  renderWinner() {
    let winner = null;
    if (this.props.ctx.gameover) {
      winner =
        this.props.ctx.gameover.winner !== undefined ? (
          <div id="winner">Winner: Player {Number(this.props.ctx.gameover.winner) + 1}</div>
        ) : (
            <div id="winner">Draw!</div>
          );
    }
    return winner;
  }

  renderLastRoll() {
    let last_roll = 
      <div 
        className="roll"
        id={"roll" + this.props.G.lastRoll}
        onClick={() => this.onClickBoard()}
        hint="Click to roll!"
      > 
      </div>
    return last_roll;
  }

  renderGetCard() {
    let card_deck = 
      <div 
        className="card_deck"
        id={"card_deck"}
        onClick={() => this.onClickCard()}
        hint="Click to get a question card!"
      > 
      </div>
    return card_deck;
  }

  renderQuestion() {
    let question_definition = this.props.G.questions[this.props.G.question];
    let answers = [];
    for (let j = 0; j < question_definition.possible_answers.length; j++) {
      let id = j;
      answers.push(
        <div
          key={'answer' + id}
          id={'answer' + id}
          className='answer'
          onClick={() => this.onClickAnswer(id)}
        >
          {question_definition.possible_answers[j]}
        </div>
      );
    }

    let question =
      <div key="question"
            ref={this.questionRef}
            className="question"
            id="question">
          {question_definition.question_text}
          {answers}
      </div>
    return question;
  }

  renderAnswerQuestion() {
    let answerClass = "hide";
    if (this.props.G.question_answered_correctly !== null) {
      answerClass = this.props.G.question_answered_correctly ? "correct" : "incorrect";
    }

    let answer_to_question = 
      <div key="answer_to_question"
        ref={this.answerQuestionRef}
        className={answerClass}
        id="answer_to_question">
        
      </div>
    return answer_to_question;
  }

  renderWhoTurn() {
    let who =
      <div key="who"
        className={"player" + (Number(this.props.ctx.currentPlayer) + 1)}
        id="who">
        It's {this.props.ctx.currentPlayer === "0" ? "Red" : "Yellow"}'s Turn!
    </div>
    return who;
  }

  render() {
    let instructions = this.renderInstructions();
    let squares = this.renderSquares();
    let pieces = this.renderPieces();
    let winner = this.renderWinner();
    let last_roll = this.renderLastRoll();
    let card_deck = this.renderGetCard();
    let question_parts = [];
    if (!this.props.ctx.gameover) {
      question_parts.push(this.renderQuestion());
      question_parts.push(this.renderAnswerQuestion());
    }
    let who_turn = this.renderWhoTurn();

    return (
      <div>
        <div>
          {instructions}
        </div>
        <div>
          {squares}
          {pieces}
          <br/>
          <br/>
          {last_roll}
          {card_deck}
          {winner}
          {question_parts}
          {who_turn}
        </div>
      </div>
    );
  }
}
