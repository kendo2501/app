const Pyramid = require('../models/PyramidModel');

function reduceNumber(num) {
  while (num >= 12) {
    num = num
      .toString()
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  return num;
}

function reduceSubNumber(num) {
  return num > 11 ? reduceNumber(num) : num;
}

function calcSubNumber(a, b) {
  const sum = a + b;
  return reduceSubNumber(sum);
}

function calculatePyramid(dd, mm, yyyy) {
  const floor1_1 = Math.floor(mm / 10) + (mm % 10);
  const floor1_2 = Math.floor(dd / 10) + (dd % 10);
  const floor1_3 = reduceNumber(
    Math.floor(yyyy / 1000) +
      Math.floor((yyyy % 1000) / 100) +
      Math.floor((yyyy % 100) / 10) +
      (yyyy % 10)
  );

  const floor1 = [floor1_1, floor1_2, floor1_3];

  const lifePathSum = floor1.reduce((acc, val) => acc + val, 0);
  const lifePathNumber = reduceNumber(lifePathSum);

  const floor2_1 = 36 - lifePathNumber;
  const floor2_2 = floor2_1 + 9;
  const floor2 = [floor2_1, floor2_2];

  const floor3 = floor2_2 + 9;
  const floor4 = floor3 + 9;

  const subFloor2_1 = calcSubNumber(floor1[0], floor1[1]);
  const subFloor2_2 = calcSubNumber(floor1[1], floor1[2]);
  const subFloor3 = calcSubNumber(subFloor2_1, subFloor2_2);
  const subFloor4 = calcSubNumber(floor1[0], floor1[2]);

  return {
    floor1,
    floor2,
    floor3,
    floor4,
    subNumbers: {
      floor2: [subFloor2_1, subFloor2_2],
      floor3: subFloor3,
      floor4: subFloor4,
    },
    lifePathNumber,
  };
}

exports.getSubNumbersInfo = async (req, res) => {
  const { dd, mm, yyyy } = req.body;

  if (!dd || !mm || !yyyy) {
    return res.status(400).json({ success: false, message: 'Thiếu ngày, tháng hoặc năm sinh.' });
  }

  try {
    const pyramid = calculatePyramid(Number(dd), Number(mm), Number(yyyy));
    const subNumbers = [
      pyramid.subNumbers.floor2[0],
      pyramid.subNumbers.floor2[1],
      pyramid.subNumbers.floor3,
      pyramid.subNumbers.floor4,
    ];

    const subNumbersInfo = await Pyramid.find({
      number: { $in: subNumbers.map(num => num.toString()) },
    });

    res.json({
      success: true,
      subNumbers: pyramid.subNumbers,
      subNumbersInfo,
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin số phụ:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};