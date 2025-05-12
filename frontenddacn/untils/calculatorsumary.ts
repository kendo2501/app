const letterToNumberMap: { [key: string]: number } = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

export function calculateCombinedMap(
  fullName: string,
  day: number,
  month: number,
  year: number
): { [key: number]: string } {
  // Xử lý tên
  const nameUpper = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  const nameNumbers: number[] = [];

  for (const char of nameUpper) {
    const num = letterToNumberMap[char];
    if (num) nameNumbers.push(num);
  }

  // Xử lý ngày sinh
  const dobDigits = `${day}${month}${year}`
    .split('')
    .map(Number)
    .filter(d => d !== 0);

  // Tổng hợp tất cả số
  const allNumbers = [...dobDigits, ...nameNumbers];

  // Khởi tạo map
  const map: { [key: number]: string } = {};
  for (let i = 1; i <= 9; i++) map[i] = '';

  // Đếm số lần xuất hiện
  allNumbers.forEach(num => {
    if (map[num] !== undefined) {
      map[num] += num.toString();
    }
  });

  return map;
}
