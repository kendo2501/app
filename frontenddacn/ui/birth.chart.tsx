import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@/untils/url';


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
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);

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

  const fetchDescriptionFromAPI = async (number: number) => {
    try {
      const response = await fetch(`${BASE_URL}/mongo/birthDescription/search?number=${number}`);
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setSelectedDescription(data[0].description || 'Không có mô tả.');
      } else {
        setSelectedDescription('Không tìm thấy dữ liệu.');
      }
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
      setSelectedDescription('Lỗi khi tải dữ liệu từ server.');
    }
  };

  const renderCell = (num: number) => (
    <Pressable
      key={num}
      style={styles.cellWrapper}
      onPress={() => {
        setSelectedNumber(num);
        fetchDescriptionFromAPI(num);
      }}
    >
      <Text style={styles.cellText}>{dobMap[num]}</Text>
    </Pressable>
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

        {selectedNumber && selectedDescription && (
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionTitle}>Số {selectedNumber}</Text>
            <Text style={styles.descriptionText}>{selectedDescription}</Text>
          </View>
        )}
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
    marginBottom: 10,
    color: '#fff',
  },
  subtitle: {
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
  cellWrapper: {
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
  descriptionBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
