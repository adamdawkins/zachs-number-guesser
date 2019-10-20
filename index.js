import { app } from "hyperapp";
import * as Random from "@hyperapp/random";
import { button, div, h1 } from "@hyperapp/html";

import { range } from "./utilities";

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
  youWin: number === state.chosenNumber
});

// VIEWS
const NumberButton = number =>
  button({ onclick: [GuessNumber, number] }, number);

// THE APP
app({
  init: [
    {
      numbers: NUMBERS,
      youWin: false
    },
    getRandomNumber(NUMBERS, SetChosenNumber)
  ],
  view: state => {
    console.log({ state });
    if (state.youWin) {
      return h1("YOU WIN!!!!");
    }

    return div({}, state.numbers.map(NumberButton));
  },
  node: document.getElementById("app")
});
