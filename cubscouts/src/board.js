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

  onClickBoard = id => {
    this.props.moves.RollDie();
  };

  onClickAnswer = id => {
    this.props.moves.SelectAnswer(id);
  };

  render() {
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
          onClick={() => this.onClickBoard(id)}
        >
          {occupied}
        </div>
      );
    }

    // Render winner
    let winner = null;
    if (this.props.ctx.gameover) {
      winner =
        this.props.ctx.gameover.winner !== undefined ? (
          <div id="winner">Winner: Player {Number(this.props.ctx.gameover.winner) + 1}</div>
        ) : (
            <div id="winner">Draw!</div>
          );
    }
    // Render the last roll
    let last_roll = 
      <div className="roll" id={"roll" + this.props.G.lastRoll}> 
      </div>
    // Render the question
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
      <div key="question" className="question" id="question">
          {question_definition.question_text}
          {answers}
      </div>

    return (
      <div>
        {squares}
        <br/>
        <br/>
        {last_roll}
        {winner}
        {question}
      </div>
    );
  }
}
