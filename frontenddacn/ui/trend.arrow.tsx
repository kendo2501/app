import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { calculateCombinedMap } from '@/untils/calculatorsumary';
import { BASE_URL } from '@/untils/url';

type ArrowData = {
  arrow: string;
  advantage: string;
  defect: string;
};

type Trend = {
  arrow: number[];
  status: 'mũi tên mạnh' | 'mũi tên trống';
};

export default function TrendScreen() {
  const navigation = useNavigation();
  const [trendData, setTrendData] = useState<Trend[]>([]);
  const [arrowDescriptions, setArrowDescriptions] = useState<ArrowData[]>([]);
  const [combinedMap, setCombinedMap] = useState<{ [key: number]: string }>({});
  const [userInfo, setUserInfo] = useState<{
    fullName: string;
    dd: number;
    mm: number;
    yyyy: number;
  } | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const stored = await AsyncStorage.getItem('userInfo');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserInfo(parsed);

        const map = calculateCombinedMap(parsed.fullName, parsed.dd, parsed.mm, parsed.yyyy);
        setCombinedMap(map);

        const numbersPresent = getPresentNumbersFromMap(map);
        const trends = detectTrend(numbersPresent);
        setTrendData(trends);
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchDescriptions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/mongo/api/arrows`);
        setArrowDescriptions(response.data);
      } catch (error) {
        console.error('Lỗi khi gọi API:', error);
      }
    };

    fetchDescriptions();
  }, []);

  const getPresentNumbersFromMap = (map: { [key: number]: string }): number[] => {
    return Object.entries(map)
      .filter(([_, value]) => value !== '')
      .map(([key]) => Number(key));
  };

  const detectTrend = (numbers: number[]): Trend[] => {
    const arrows = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
      [1, 5, 9],
      [3, 5, 7],
    ];

    const trends: Trend[] = [];
    arrows.forEach((arrow) => {
      const hasAll = arrow.every(num => numbers.includes(num));
      const hasNone = arrow.every(num => !numbers.includes(num));
      if (hasAll) {
        trends.push({ arrow, status: 'mũi tên mạnh' });
      } else if (hasNone) {
        trends.push({ arrow, status: 'mũi tên trống' });
      }
    });

    return trends;
  };

  const getDescription = (arrow: number[], status: string): string => {
    const arrowStr = arrow.join('-');
    const match = arrowDescriptions.find(desc => desc.arrow === arrowStr);
    if (!match) return `${arrowStr}: mũi tên không rõ`;
    const type = status === 'mũi tên mạnh' ? match.advantage : match.defect;
    return `${arrowStr}: mũi tên ${type.toLowerCase()}`;
  };

  return (
  <View style={styles.flex}>
    <ImageBackground
      source={require('@/assets/images/background.jpg')}
      style={styles.flex}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.header}>Mũi Tên Xu Hướng</Text>

          {trendData.length === 0 ? (
            <Text style={styles.description}>Không có dữ liệu mũi tên xu hướng</Text>
          ) : (
            trendData.map((trend, index) => {
              const description = getDescription(trend.arrow, trend.status);
              return (
                <View key={index} style={styles.trendItem}>
                  <Text style={styles.description}>{description}</Text>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  </View>
);

}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', // căn giữa theo chiều dọc
    alignItems: 'center', // căn giữa theo chiều ngang
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  trendItem: {
    marginBottom: 15,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  backText: {
    fontSize: 13,
    color: 'white',
    fontWeight: 'bold',
  },
});
