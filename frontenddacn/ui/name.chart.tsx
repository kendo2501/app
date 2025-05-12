import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
    const nameUpper = fullName.toUpperCase().replace(/[^A-Z]/g, ''); // chỉ giữ chữ cái A-Z
    const numbers: number[] = [];

    for (const char of nameUpper) {
      const num = letterToNumberMap[char];
      if (num) numbers.push(num);
    }

    // Tạo map từ số 1-9
    const map: { [key: number]: string } = {};
    for (let i = 1; i <= 9; i++) map[i] = '';

    numbers.forEach(num => {
      map[num] += num;
    });

    setChartMap(map);
  }, [fullName]);

  return (
    

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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subTitle: { fontSize: 14, marginBottom: 5 },
  chart: { marginTop: 20 },
  row: { flexDirection: 'row' },
  cell: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  cellText: { fontSize: 18, fontWeight: 'bold' },
});
