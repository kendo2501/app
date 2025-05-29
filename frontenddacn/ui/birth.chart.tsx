import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const layout = [
  [3, 6, 9],
  [2, 5, 8],
  [1, 4, 7],
];

export default function BirthChartScreen() {
  const [dobMap, setDobMap] = useState<{ [key: number]: string }>({});
  const [birthDate, setBirthDate] = useState<{
    day: number;
    month: number;
    year: number;
  } | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const stored = await AsyncStorage.getItem('userInfo');
      if (stored) {
        const user = JSON.parse(stored);
        const { dd, mm, yyyy } = user;
        setBirthDate({ day: dd, month: mm, year: yyyy });

        const allDigits = `${dd}${mm}${yyyy}`.split('').map(Number);
        const map: { [key: number]: string } = {};
        for (let i = 1; i <= 9; i++) map[i] = '';
        allDigits.forEach(d => {
          if (d !== 0) map[d] += d;
        });
        setDobMap(map);
      }
    };

    fetchUserInfo();
  }, []);

  const renderCell = (num: number) => (
    <View key={num} style={styles.cell}>
      <Text style={styles.cellText}>{dobMap[num]}</Text>
    </View>
  );

  return (
    <ImageBackground
      source={require('./../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>BIỂU ĐỒ NGÀY SINH</Text>
        {birthDate ? (
          <Text style={styles.subtitle}>
            Ngày sinh: {`${birthDate.day.toString().padStart(2, '0')}/${birthDate.month
              .toString()
              .padStart(2, '0')}/${birthDate.year}`}
          </Text>
        ) : (
          <Text style={styles.subtitle}>Đang tải ngày sinh...</Text>
        )}

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
  overlay: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 10,
  },
  chart: {
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  cellText: {
    color: '#FFF',
    fontSize: 16,
  },
});
