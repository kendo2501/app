import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateCombinedMap } from '@/untils/calculatorsumary';
import { BASE_URL } from '@/untils/url';

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
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);

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
  const hasValue = combinedMap[num] && combinedMap[num].length > 0;

  return (
    <Pressable
      key={num}
      style={styles.cell}
      onPress={() => {
        if (hasValue) {
          setSelectedNumber(num);
          fetchDescriptionFromAPI(num);
        } else {
          // Nếu không có số, xóa trạng thái mô tả
          setSelectedNumber(null);
          setSelectedDescription(null);
        }
      }}
    >
      <Text style={styles.cellText}>{combinedMap[num]}</Text>
    </Pressable>
  );
};

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
              {row.map(handlePressNumber)}
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
