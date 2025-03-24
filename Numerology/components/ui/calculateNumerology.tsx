export const calculateNumerology = (day, month, year) => {
    const digits = `${day}${month}${year}`.split("").map(Number);
    let total = digits.reduce((acc, curr) => acc + curr, 0);
  
    while (total > 9 && total !== 11 && total !== 22 && total !== 33) {
      total = total.toString().split("").map(Number).reduce((acc, curr) => acc + curr, 0);
    }
    return total > 9 ? 9 : total;
  };
  
  export const generatePyramidData = (baseNumber) => {
    const data = [];
    for (let year = 2020; year <= 2030; year++) {
      const variation = (year % 9) + baseNumber;
      data.push({ year, number: Math.min(calculateNumerology(variation.toString(), "0", "0"), 9) });
    }
    return data;
  };
  