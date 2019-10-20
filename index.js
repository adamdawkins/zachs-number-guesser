import { app } from "hyperapp";
import * as Random from "@hyperapp/random";
import { button, div, h1 } from "@hyperapp/html";

import { contains, range } from "./utilities";

const NUMBERS = range(1, 10);
const MAX_LIVES = 3;

// HELPERS

// EFFECTS

// ACTIONS
const getRandomNumber = (numbers, action) =>
  Random.generate(
    action,
    Random.number(rand => numbers[Math.floor(rand * numbers.length)])
  );

const SetChosenNumber = (state, chosenNumber) => ({
  ...state,
  chosenNumber
});

const GuessNumber = (state, number) => {
  const youWin = number === state.chosenNumber;
  if (youWin) {
    return { ...state, youWin };
  }
  if (state.lives === 1) {
    return { ...state, gameOver: true };
  }

  return {
    ...state,
    guessedNumbers: state.guessedNumbers.concat([number]),
    lives: state.lives - 1
  };
};

// VIEWS
const Lives = ({ lives }) =>
  div({}, range(1, lives).map(() => div({ class: "life" }, "❤")));

const NumberButton = (state, number) =>
  button(
    {
      disabled: contains(state.guessedNumbers, number),
      onclick: [GuessNumber, number]
    },
    number
  );

// THE APP
app({
  init: [
    {
      numbers: NUMBERS,
      guessedNumbers: [],
      youWin: false,
      gameOver: false,
      lives: MAX_LIVES
    },
    getRandomNumber(NUMBERS, SetChosenNumber)
  ],
  view: state => {
    console.log({ state });
    if (state.gameOver) {
      return h1("GAME OVER !!!");
    }

    if (state.youWin) {
      return h1("YOU WIN!!!!");
    }

    return div({}, [
      Lives(state),
      state.numbers.map(n => NumberButton(state, n))
    ]);
  },
  node: document.getElementById("app")
});
