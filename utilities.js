//    range :: (Int, Int) -> [Int]
const range = (from, to) => {
  const result = [];
  let n = from;

  while (n <= to) {
    result.push(n);
    n++;
  }

  return result;
};

export { range };
