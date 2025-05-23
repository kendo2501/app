import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { calculateCombinedMap } from '@/untils/calculatorsumary';
import { ImageBackground } from 'react-native'; // nhớ import nếu chưa có

type ArrowData = {
  arrow: string;       // VD: "3-5-7"
  advantage: string;   // VD: "TÂM LINH"
  defect: string;    // VD: "TÍNH CÁCH" 
};

type Trend = {
  arrow: number[];
  status: 'mũi tên mạnh' | 'mũi tên trống';
};

interface Props {
  fullName: string;
  day: number;
  month: number;
  year: number;
}

export default function TrendScreen({ fullName, day, month, year }: Props) {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const [trendData, setTrendData] = useState<Trend[]>([]);
  const [arrowDescriptions, setArrowDescriptions] = useState<ArrowData[]>([]);
  const [combinedMap, setCombinedMap] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchDescriptions = async () => {
      try {
        const response = await axios.get('http://localhost:3002/api/arrows');
        console.log('API response:', response.data);
        const mergedDescriptions = response.data;
        setArrowDescriptions(mergedDescriptions);
        console.log('Merged descriptions:', mergedDescriptions);
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
    console.log('Trend data:', trends);

    arrows.forEach((arrow) => {
      const hasAll = arrow.every(num => numbers.includes(num));// MŨi tên Mạnh
      const hasNone = arrow.every(num => !numbers.includes(num));// MŨi tên trống
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
    console.log('arrowDescriptions:', arrowDescriptions);
    
    if (!match) {
      return `${arrowStr}: mũi tên không rõ`;
    }
  
    const type = status === 'mũi tên mạnh' ? match.advantage : match.defect;
    
    if (typeof type !== 'string') {
      return `${arrowStr}: mũi tên không rõ`;
    }
    
    return `${arrowStr}: mũi tên ${type.toLowerCase()}`;    
  };
  
  

  useEffect(() => {
    const map = calculateCombinedMap(fullName, day, month, year);
    setCombinedMap(map);

    const numbersPresent = getPresentNumbersFromMap(map);
    const trends = detectTrend(numbersPresent);
    setTrendData(trends);
  }, [fullName, day, month, year]);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require('@/assets/images/background.jpg')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>{'< QUAY LẠI GRID'}</Text>
            </TouchableOpacity>

            <Text style={styles.header}>Mũi Tên Xu Hướng</Text>

            {trendData.length === 0 ? (
              <Text style={styles.description}>Không có dữ liệu mũi tên xu hướng</Text>
            ) : (
              trendData.map((trend, index) => {
                const description = getDescription(trend.arrow, trend.status);
                return (
                  <View key={index} style={{ marginBottom: 15, alignItems: 'center' }}>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 100,
  },
  container: {
    flex: 1, // nếu vẫn dùng container
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 50,
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: 'white', // phải đổi sang trắng hoặc sáng để nổi bật
    textAlign: 'center',
    marginTop: 4,
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
