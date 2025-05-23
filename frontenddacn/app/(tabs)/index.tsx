import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- IMPORT MÀN HÌNH ---
import MainNumberScreen from '../../ui/main.number';
import BirthChartScreen from '../../ui/birth.chart';
import NameChartScreen from '../../ui/name.chart';
import SummaryChartScreen from '../../ui/summary.chart';
import TrendArrowScreen from '../../ui/trend.arrow';
import PyramidNailScreen from '../../ui/pyramid.nail';
import PersonalYearScreen from '../../ui/personal.year';
import MandalaScreen from '../../ui/mandala';

// --- KIỂU DỮ LIỆU ---
export type ActiveScreen =
  | 'home'
  | 'mainNumber'
  | 'birthChart'
  | 'nameChart'
  | 'summaryChart'
  | 'trendArrow'
  | 'pyramidNail'
  | 'personalYear'
  | 'mandala';

type UserInfo = {
  dd: number;
  mm: number;
  yyyy: number;
  fullName: string;
};

// --- APP ---
export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const navigateTo = (screen: ActiveScreen) => setActiveScreen(screen);
  const goBack = () => setActiveScreen('home');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const stored = await AsyncStorage.getItem('userInfo');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUserInfo(parsed);
        }
      } catch (error) {
        console.error('Lỗi khi đọc userInfo:', error);
      }
    };
    fetchUserInfo();
  }, []);

  const renderScreen = () => {
    if (activeScreen === 'home') {
      return <HomeScreen navigateTo={navigateTo} />;
    }

    // TRUYỀN DỮ LIỆU userInfo CHO MÀN HÌNH CẦN
    if (userInfo) {
      const commonProps = {
        day: userInfo.dd,
        month: userInfo.mm,
        year: userInfo.yyyy,
        fullName: userInfo.fullName,
        goBack,
      };

      switch (activeScreen) {
        case 'birthChart':
          return <BirthChartScreen {...commonProps} />;
        case 'nameChart':
          return <NameChartScreen {...commonProps} />;
        case 'summaryChart':
          return <SummaryChartScreen {...commonProps} />;
        case 'trendArrow':
          return <TrendArrowScreen {...commonProps} />;
        // Thêm các màn khác nếu cần truyền ngày sinh
      }
    }

    // CÁC MÀN KHÔNG CẦN TRUYỀN NGÀY SINH
    const screensMap: Record<ActiveScreen, React.ComponentType<any>> = {
      home: () => null,
      mainNumber: MainNumberScreen,
      birthChart: BirthChartScreen,
      nameChart: NameChartScreen,
      summaryChart: SummaryChartScreen,
      trendArrow: TrendArrowScreen,
      pyramidNail: PyramidNailScreen,
      personalYear: PersonalYearScreen,
      mandala: MandalaScreen,
    };

    const ScreenComponent = screensMap[activeScreen];
    if (ScreenComponent) {
      return <ScreenComponent goBack={goBack} />;
    }

    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải màn hình: {activeScreen}</Text>
        <Text style={styles.loadingInfo}>Chưa có component cho màn hình này</Text>
        <ActivityIndicator size="large" color="#FFF" />
        <View style={{ marginTop: 20 }}>
          <Button title="Quay lại Home" onPress={goBack} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.flexContainer}>{renderScreen()}</View>
    </SafeAreaView>
  );
}

// --- HOME SCREEN ---
function HomeScreen({ navigateTo }: { navigateTo: (screen: ActiveScreen) => void }) {
  const buttons = [
    { title: 'SỐ CHỦ ĐẠO', screen: 'mainNumber' },
    { title: 'BIỂU ĐỒ NGÀY SINH', screen: 'birthChart' },
    { title: 'BIỂU ĐỒ TÊN', screen: 'nameChart' },
    { title: 'BIỂU ĐỒ TỔNG HỢP', screen: 'summaryChart' },
    { title: 'MŨI TÊN XU HƯỚNG', screen: 'trendArrow' },
    { title: 'CÁC ĐỈNH KIM TỰ', screen: 'pyramidNail' },
    { title: 'PERSONAL YEAR', screen: 'personalYear' },
    { title: 'MANDALA', screen: 'mandala' },
  ];

  return (
    <ImageBackground
      source={require('../../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.wrapper}>
        <View style={styles.gridContainer}>
          <View style={styles.row}>
            {buttons.slice(0, 3).map((btn, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.button}
                onPress={() => navigateTo(btn.screen as ActiveScreen)}
              >
                <Text style={styles.buttonText}>{btn.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            {buttons.slice(3, 6).map((btn, idx) => (
              <TouchableOpacity
                key={idx + 3}
                style={styles.button}
                onPress={() => navigateTo(btn.screen as ActiveScreen)}
              >
                <Text style={styles.buttonText}>{btn.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.row, { justifyContent: 'center' }]}>
            {buttons.slice(6, 8).map((btn, idx) => (
              <TouchableOpacity
                key={idx + 6}
                style={styles.button}
                onPress={() => navigateTo(btn.screen as ActiveScreen)}
              >
                <Text style={styles.buttonText}>{btn.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  flexContainer: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  gridContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2c3e50',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingInfo: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
    marginBottom: 20,
  },
});
