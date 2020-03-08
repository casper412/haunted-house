import React from 'react';
import PropTypes from 'prop-types';
import './board.css';
import './squares.css';

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
  }

  onClickBoard = () => {
    this.props.moves.RollDie();
    // Show the question
    this.questionRef.current.classList.remove("answered");
    this.questionRef.current.classList.add("not-answered");
    this.answerQuestionRef.current.classList.add("hide");
  }

  onClickAnswer = id => {
    this.props.moves.SelectAnswer(id);
    // Hide the question
    if (this.questionRef.current) {
      this.questionRef.current.classList.add("answered");
      this.questionRef.current.classList.remove("not-answered");
    }
    this.answerQuestionRef.current.classList.remove("hide");
  }

  renderSquares() {
    let squares = [];
    for (let i = 0; i < this.props.G.cells.length; i++) {
      const id = i;
      let classes = this.props.G.cells[i].className + ' square';
      let occupied = [];
      for (let j = 0; j < this.props.G.cells[id].occupied.length; j++) {
        occupied.push(
          <div 
            key={'piece' + this.props.G.cells[id].occupied[j]}
            className={'piece piece' + this.props.G.cells[id].occupied[j]}></div>
        );
      }
      squares.push(
        <div
          key={id}
          id={'square' + id}
          className={classes}
        >
          {occupied}
        </div>
      );
    }
    return squares;
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
    let squares = this.renderSquares();
    let winner = this.renderWinner();
    let last_roll = this.renderLastRoll();
    let question = this.renderQuestion();
    let answer_to_question = this.renderAnswerQuestion();
    let who_turn = this.renderWhoTurn();

    return (
      <div>
        {squares}
        <br/>
        <br/>
        {last_roll}
        {winner}
        {question}
        {answer_to_question}
        {who_turn}
      </div>
    );
  }
}
