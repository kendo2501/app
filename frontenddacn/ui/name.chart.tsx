import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';

interface Props {
  fullName: string;
}

const layout = [
  [3, 6, 9],
  [2, 5, 8],
  [1, 4, 7]
];

// Bảng chữ cái → số
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

export default function NameChartScreen({ fullName }: Props) {
  const [chartMap, setChartMap] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const nameUpper = fullName.toUpperCase().replace(/[^A-Z]/g, '');
    const numbers: number[] = [];

    for (const char of nameUpper) {
      const num = letterToNumberMap[char];
      if (num) numbers.push(num);
    }

    const map: { [key: number]: string } = {};
    for (let i = 1; i <= 9; i++) map[i] = '';

    numbers.forEach(num => {
      map[num] += num;
    });

    setChartMap(map);
  }, [fullName]);

  return (
    <ImageBackground
      source={require('./../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>BIỂU ĐỒ TÊN</Text>
        <Text style={styles.subTitle}>Họ tên: {fullName}</Text>

        <View style={styles.chart}>
          {layout.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((num) => (
                <View key={num} style={styles.cell}>
                  <Text style={styles.cellText}>{chartMap[num]}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'transparent', // Cho phép hiển thị ảnh nền
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff', // Cho dễ đọc trên nền
  },
  subTitle: {
    fontSize: 14,
    marginBottom: 5,
    color: '#fff', // Cho dễ đọc
  },
  chart: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    backgroundColor: 'rgba(255,255,255,0.1)', // Nền ô mờ để vẫn thấy background
  },
  cellText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
