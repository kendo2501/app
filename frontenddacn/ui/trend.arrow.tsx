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

  // Danh sách cách khắc phục khi thiếu số
  const deficiencyFixes: { [key: number]: string } = {
    1: 'Hãy viết nhật ký, học cách bộc lộ quan điểm, chính kiến, biết đặt mục tiêu rõ ràng.',
    2: 'Hãy lắng nghe, cảm nhận suy nghĩ của người khác. Tập thiền hoặc yoga để rèn luyện khả năng tĩnh tâm.',
    3: 'Hãy tập kể chuyện cười, tham gia hoạt động vui vẻ sôi nổi để cải thiện giao tiếp.',
    4: 'Hãy làm việc thực tế và cẩn thận hơn.',
    5: 'Hãy mở rộng bản thân, kết giao bạn mới, du lịch khám phá điều mới.',
    6: 'Hãy yêu thương, chăm sóc người khác, đặc biệt là cha mẹ, người thân.',
    7: 'Hãy thử sức với cái mới, dấn thân vào trải nghiệm mới để tăng sự hiểu biết bản thân.',
    8: 'Hãy học kinh doanh, đọc sách logic để nâng cao tư duy.',
    9: 'Hãy cho đi, giúp đỡ người khác, theo đuổi mục tiêu đến cùng.',
  };

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

  const getMissingNumbers = (map: { [key: number]: string }): number[] => {
    return Object.entries(map)
      .filter(([_, value]) => value === '')
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

            {combinedMap && (
              <>
                <Text style={styles.header}>Cách khắc phục</Text>
                {getMissingNumbers(combinedMap).map((num, idx) => (
                  <View key={idx} style={styles.trendItem}>
                    <Text style={styles.description}>
                      Thiếu số {num}: {deficiencyFixes[num]}
                    </Text>
                  </View>
                ))}
              </>
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
    justifyContent: 'center',
    alignItems: 'center',
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
});
