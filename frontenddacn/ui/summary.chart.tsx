import { calculateCombinedMap } from '@/untils/calculatorsumary';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const layout = [
  [3, 6, 9],
  [2, 5, 8],
  [1, 4, 7],
];

export default function CombinedChartScreen() {
  const [userInfo, setUserInfo] = useState<{
    fullName: string;
    dd: number;
    mm: number;
    yyyy: number;
  } | null>(null);

  const [combinedMap, setCombinedMap] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchUserInfoAndCalculate = async () => {
      const stored = await AsyncStorage.getItem('userInfo');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserInfo(parsed);
        const map = calculateCombinedMap(parsed.fullName, parsed.dd, parsed.mm, parsed.yyyy);
        setCombinedMap(map);
        console.log('Combined Map:', map);
      }
    };

    fetchUserInfoAndCalculate();
  }, []);

  const renderCell = (num: number) => (
    <View key={num} style={styles.cell}>
      <Text style={styles.cellText}>{combinedMap[num]}</Text>
    </View>
  );

  if (!userInfo) {
    return (
      <ImageBackground
        source={require('./../assets/images/background.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.title}>Đang tải dữ liệu...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('./../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>BIỂU ĐỒ TỔNG HỢP</Text>
        <Text style={styles.subTitle}>Họ tên: {userInfo.fullName}</Text>
        <Text style={styles.subTitle}>
          Ngày sinh: {userInfo.dd}/{userInfo.mm}/{userInfo.yyyy}
        </Text>

        <View style={styles.chart}>
          {layout.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map(renderCell)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  subTitle: {
    fontSize: 14,
    marginBottom: 4,
    color: '#fff',
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
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cellText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
