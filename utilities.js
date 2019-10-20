//    contains :: ([a], a) -> Boolean
const contains = (list, item) => list.indexOf(item) > -1;

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

export { contains, range };
