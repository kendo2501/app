import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  ImageBackground,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@/untils/url';
const { width } = Dimensions.get('window');
const pyramidWidth = width * 0.9;
const nodeRadius = 20;
const layerHeight = 100;
const pyramidHeight = layerHeight * 4 + 100;

type SubNumberInfo = {
  number: number | string;
  information: string;
};

export default function PyramidConnectScreen() {
  const [dd, setDd] = useState<number | null>(null);
  const [mm, setMm] = useState<number | null>(null);
  const [yyyy, setYyyy] = useState<number | null>(null);
  const [subNumbersInfo, setSubNumbersInfo] = useState<SubNumberInfo[]>([]);

  const reduceNumber = (num: number): number => {
    while (num >= 12) {
      num = num.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    }
    return num;
  };

  const reduceSubNumber = (num: number): number => (num > 11 ? reduceNumber(num) : num);
  const calcSubNumber = (a: number, b: number): number => reduceSubNumber(a + b);

  const calculatePyramid = (dd: number, mm: number, yyyy: number) => {
    const floor1_1 = reduceNumber(Math.floor(mm / 10) + (mm % 10));
    const floor1_2 = reduceNumber(Math.floor(dd / 10) + (dd % 10));
    const floor1_3 = reduceNumber(
      Math.floor(yyyy / 1000) +
        Math.floor((yyyy % 1000) / 100) +
        Math.floor((yyyy % 100) / 10) +
        (yyyy % 10)
    );

    const floor1 = [floor1_1, floor1_2, floor1_3];
    const lifePathSum = floor1.reduce((acc, val) => acc + val, 0);
    const lifePathNumber = reduceNumber(lifePathSum);

    const floor2_1 = 36 - lifePathNumber;
    const floor2_2 = floor2_1 + 9;
    const floor2 = [floor2_1, floor2_2];

    const floor3 = floor2_2 + 9;
    const floor4 = floor3 + 9;

    const subFloor2_1 = calcSubNumber(floor1[0], floor1[1]);
    const subFloor2_2 = calcSubNumber(floor1[1], floor1[2]);
    const subFloor3 = calcSubNumber(subFloor2_1, subFloor2_2);
    const subFloor4 = calcSubNumber(floor1[0], floor1[2]);

    return {
      floor1,
      floor2,
      floor3,
      floor4,
      subNumbers: {
        floor2: [subFloor2_1, subFloor2_2],
        floor3: subFloor3,
        floor4: subFloor4,
      },
      lifePathNumber,
    };
  };

  useEffect(() => {
    async function loadData() {
      try {
        const userInfoString = await AsyncStorage.getItem('userInfo');
        if (!userInfoString) {
          Alert.alert('Lỗi', 'Bạn chưa đăng nhập hoặc chưa lưu ngày sinh');
          return;
        }
        const userInfo = JSON.parse(userInfoString);
        if (userInfo.dd && userInfo.mm && userInfo.yyyy) {
          setDd(Number(userInfo.dd));
          setMm(Number(userInfo.mm));
          setYyyy(Number(userInfo.yyyy));

          const response = await fetch(`${BASE_URL}/sub-numbers-info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dd: userInfo.dd, mm: userInfo.mm, yyyy: userInfo.yyyy }),
          });
          const data = await response.json();
          if (data.success) setSubNumbersInfo(data.subNumbersInfo);
        }
      } catch (e) {
        Alert.alert('Lỗi', 'Không thể lấy dữ liệu ngày sinh');
      }
    }

    loadData();
  }, []);

  if (dd === null || mm === null || yyyy === null) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={{ color: '#fff' }}>Đang tải dữ liệu ngày sinh...</Text>
      </View>
    );
  }

  const pyramid = calculatePyramid(dd, mm, yyyy);

  const cx = pyramidWidth / 2;
  const cy = nodeRadius + 10;
  const floor4Point = { x: cx, y: cy };
  const floor3Point = { x: cx, y: cy + layerHeight };
  const floor2Points = [
    { x: cx - pyramidWidth * 0.15, y: cy + layerHeight * 2 },
    { x: cx + pyramidWidth * 0.15, y: cy + layerHeight * 2 },
  ];
  const floor1Points = [
    { x: cx - pyramidWidth * 0.3, y: cy + layerHeight * 3 },
    { x: cx, y: cy + layerHeight * 3 },
    { x: cx + pyramidWidth * 0.3, y: cy + layerHeight * 3 },
  ];

  const getDesc = (num: number) => {
    const info = subNumbersInfo.find(i => Number(i.number) === num);
    return info ? info.information : null;
  };

  return (
    <ImageBackground
      source={require('../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>🔺 Kim Tự Tháp Ngày Sinh</Text>
          <Text style={styles.subTitle}>📅 Ngày sinh: {dd} / {mm} / {yyyy}</Text>

          <Svg width={pyramidWidth} height={pyramidHeight}>
            {/* Modified Lines */}
            <Line x1={floor3Point.x} y1={floor3Point.y} x2={floor2Points[0].x} y2={floor2Points[0].y} stroke="#fff" strokeWidth={2} />
            <Line x1={floor3Point.x} y1={floor3Point.y} x2={floor2Points[1].x} y2={floor2Points[1].y} stroke="#fff" strokeWidth={2} />
            <Line x1={floor2Points[0].x} y1={floor2Points[0].y} x2={floor1Points[0].x} y2={floor1Points[0].y} stroke="#fff" strokeWidth={2} />
            <Line x1={floor2Points[0].x} y1={floor2Points[0].y} x2={floor1Points[1].x} y2={floor1Points[1].y} stroke="#fff" strokeWidth={2} />
            <Line x1={floor2Points[1].x} y1={floor2Points[1].y} x2={floor1Points[1].x} y2={floor1Points[1].y} stroke="#fff" strokeWidth={2} />
            <Line x1={floor2Points[1].x} y1={floor2Points[1].y} x2={floor1Points[2].x} y2={floor1Points[2].y} stroke="#fff" strokeWidth={2} />
            <Line x1={floor1Points[0].x} y1={floor1Points[0].y} x2={floor4Point.x} y2={floor4Point.y} stroke="#fff" strokeWidth={2} />
            <Line x1={floor1Points[2].x} y1={floor1Points[2].y} x2={floor4Point.x} y2={floor4Point.y} stroke="#fff" strokeWidth={2} />

            {[floor4Point, floor3Point, ...floor2Points, ...floor1Points].map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={nodeRadius} fill="#FFD700" />
            ))}
            <SvgText fill="#000" fontSize="18" fontWeight="bold" x={floor4Point.x} y={floor4Point.y + 6} textAnchor="middle">{pyramid.floor4}</SvgText>
            <SvgText fill="#000" fontSize="18" fontWeight="bold" x={floor3Point.x} y={floor3Point.y + 6} textAnchor="middle">{pyramid.floor3}</SvgText>
            {floor2Points.map((p, i) => (
              <SvgText key={i} fill="#000" fontSize="18" fontWeight="bold" x={p.x} y={p.y + 6} textAnchor="middle">{pyramid.floor2[i]}</SvgText>
            ))}
            {floor1Points.map((p, i) => (
              <SvgText key={i} fill="#000" fontSize="18" fontWeight="bold" x={p.x} y={p.y + 6} textAnchor="middle">{pyramid.floor1[i]}</SvgText>
            ))}
          </Svg>

          <View style={styles.descriptionWrapper}>
            <Text style={styles.lifePathText}>🔢 Số chủ đạo: {pyramid.lifePathNumber}</Text>

            {[...pyramid.floor1, ...pyramid.floor2, pyramid.floor3, pyramid.floor4, ...Object.values(pyramid.subNumbers).flat()]
              .filter((v, i, a) => a.indexOf(v) === i)
              .map(num => {
                const desc = getDesc(num);
                if (!desc) return null;
                return (
                  <View key={num} style={styles.descBox}>
                    <Text style={styles.descText}>Số {num}: {desc}</Text>
                  </View>
                );
              })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  lifePathText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  descriptionWrapper: {
    marginTop: 20,
    width: '100%',
  },
  descBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  descText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
});
