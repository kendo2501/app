import { calculateCombinedMap } from '@/untils/calculatorsumary';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface Props {
  fullName: string;
  day: number;
  month: number;
  year: number;
}

const layout = [
  [3, 6, 9],
  [2, 5, 8],
  [1, 4, 7],
];


export default function CombinedChartScreen({ fullName, day, month, year }: Props) {
  const [combinedMap, setCombinedMap] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const map = calculateCombinedMap(fullName, day, month, year);
    setCombinedMap(map);
    console.log('Combined Map:', map);
  }, [fullName, day, month, year]);


  function getPresentNumbers(map: { [key: number]: string }) {
    return Object.keys(map)
      .filter(key => map[Number(key)] !== '')
      .map(Number);
  }
  
  useEffect(() => {
    const present = getPresentNumbers(combinedMap);
    console.log('Các số xuất hiện:', present);
  }, [combinedMap]);
  

  
  const renderCell = (num: number) => (
    <View key={num} style={styles.cell}>
      <Text style={styles.cellText}>{combinedMap[num]}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>BIỂU ĐỒ TỔNG HỢP</Text>
      <Text style={styles.subTitle}>Họ tên: {fullName}</Text>
      <Text style={styles.subTitle}>Ngày sinh: {day}/{month}/{year}</Text>

      <View style={styles.chart}>
        {layout.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map(renderCell)}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  chart: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
  },
  cellText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
