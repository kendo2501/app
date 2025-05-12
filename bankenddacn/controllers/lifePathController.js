exports.getLifePathNumber = (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'Thiếu userId.' });
  }

  // Dữ liệu tĩnh để test
  const staticUsers = {
    1: { dd: 9, mm: 12, yyyy: 2001 },
    2: { dd: 23, mm: 4, yyyy: 1998 },
    3: { dd: 1, mm: 1, yyyy: 1990 },
  };

  const user = staticUsers[userId];

  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
  }

  const lifePathNumber = calculateLifePathNumber(user.dd, user.mm, user.yyyy);

  return res.json({ success: true, lifePathNumber });
};

const calculateLifePathNumber = (dd, mm, yyyy) => {
  const dateStr = `${dd}${mm}${yyyy}`; //date  
  let sum = 0;
  for (let i = 0; i < dateStr.length; i++) {
    sum += parseInt(dateStr[i], 10);
  }

  while (![11, 22, 33].includes(sum) && sum > 9) {
    sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }

  return sum;
};
