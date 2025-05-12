import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Nhận props từ component cha
interface Props {
  day: number;
  month: number;
  year: number;
}

const layout = [
  [3, 6, 9],
  [2, 5, 8],
  [1, 4, 7],
];

export default function BirthChartScreen({ day, month, year }: Props) {
  const [dobMap, setDobMap] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const allDigits = `${day}${month}${year}`.split('').map(Number);
    const map: { [key: number]: string } = {};

    for (let i = 1; i <= 9; i++) map[i] = '';

    allDigits.forEach(d => {
      if (d !== 0) map[d] += d;
    });

    setDobMap(map);
  }, [day, month, year]);

  const renderCell = (num: number) => (
    <View key={num} style={styles.cell}>
      <Text>{dobMap[num]}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BIỂU ĐỒ NGÀY SINH</Text>
      <Text style={styles.subtitle}>Ngày sinh: {`${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`}</Text>
      <View style={styles.chart}>
        {layout.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map(renderCell)}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  chart: { marginTop: 10 },
  row: { flexDirection: 'row' },
  cell: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  
});
