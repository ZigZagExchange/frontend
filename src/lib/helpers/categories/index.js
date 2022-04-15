export const stables = ["USDC", "USDT", "DAI", "FRAX", "UST"];

export function getStables(rows) {
  var found_stables = [];

  rows.forEach((row) => {
    stables.forEach((stable) => {
      //check if this has a stable coin inside of the pair
      if (row.td1.includes(stable.toUpperCase())) {
        //check if already in found results, no need to add it twice.
        if (!found_stables.includes(row.td1)) {
          found_stables.push(row.td1);
        }
      }
    });
  });

  return found_stables;
}
