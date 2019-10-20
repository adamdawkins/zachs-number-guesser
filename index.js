import { app } from "hyperapp";
import * as Random from "@hyperapp/random";
import { button, div, h1 } from "@hyperapp/html";

import { contains, range } from "./utilities";

const NUMBERS = range(1, 10);

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

const GuessNumber = (state, number) => ({
  ...state,
  guessedNumbers: state.guessedNumbers.concat([number]),
  youWin: number === state.chosenNumber
});

// VIEWS
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
      youWin: false
    },
    getRandomNumber(NUMBERS, SetChosenNumber)
  ],
  view: state => {
    console.log({ state });
    if (state.youWin) {
      return h1("YOU WIN!!!!");
    }

    return div({}, state.numbers.map(n => NumberButton(state, n)));
  },
  node: document.getElementById("app")
});
