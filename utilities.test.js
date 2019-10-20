const { range } = require("./utilities");

test("returns an array of numbers from the first number to the last number", () => {
  expect(range(1, 5)).toEqual([1, 2, 3, 4, 5]);
});
