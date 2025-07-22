import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const layout = [
  [3, 6, 9],
  [2, 5, 8],
  [1, 4, 7],
];

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

import { BASE_URL } from '@/untils/url';

export default function NameChartScreen() {
  const [chartMap, setChartMap] = useState<{ [key: number]: string }>({});
  const [fullName, setFullName] = useState<string>('Đang tải...');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const stored = await AsyncStorage.getItem('userInfo');
      if (stored) {
        const user = JSON.parse(stored);
        setFullName(user.fullName || 'Không rõ');
        generateChart(user.fullName || '');
      }
    };

    const generateChart = (name: string) => {
      const nameUpper = name.toUpperCase().replace(/[^A-Z]/g, '');
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

const handlePressNumber = (num: number) => {
  const hasValue = chartMap[num] && chartMap[num].length > 0;

  if (hasValue) {
    setSelectedNumber(num);
    fetchDescriptionFromAPI(num); // hoặc lấy description nội bộ nếu có
  } else {
    // Không hiển thị nếu ô không có số
    setSelectedNumber(null);
    setSelectedDescription(null);
  }
};

  return (
    <ImageBackground
      source={require('./../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>BIỂU ĐỒ TÊN</Text>
        <Text style={styles.subTitle}>Họ tên: {fullName}</Text>

        <View style={styles.chart}>
          {layout.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.cell}
                  onPress={() => handlePressNumber(num)}
                >
                  <Text style={styles.cellText}>{chartMap[num]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {selectedNumber && selectedDescription && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionNumber}>Số {selectedNumber}</Text>
            <Text style={styles.descriptionMeaning}>{selectedDescription}</Text>
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
  descriptionContainer: {
    marginTop: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  descriptionNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  descriptionMeaning: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
});
