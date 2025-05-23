// components/InternalAppNavigator.tsx
import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Button,
} from 'react-native';

// Đường dẫn đến eventBus - Đảm bảo đường dẫn này đúng, có thể là '../utils/eventBus'
import eventBus from '../untils/eventBus'; // Sửa lại 'untils' thành 'utils' nếu đúng

// Các import màn hình con (MainNumberScreen, MandalaScreen, ...) của bạn
import MainNumberScreen from '../ui/main.number';
import BirthChartScreen from '../ui/birth.chart';
import NameChartScreen from '../ui/name.chart';
import SummaryChartScreen from '../ui/summary.chart';
import TrendArrowScreen from '../ui/trend.arrow';
import PyramidNailScreen from '../ui/pyramid.nail';
import PersonalYearScreen from '../ui/personal.year';
import MandalaScreen from '../ui/mandala';


export type ActiveScreen =
  | 'home' | 'mainNumber' | 'birthChart' | 'nameChart' | 'summaryChart'
  | 'trendArrow' | 'pyramidNail' | 'personalYear' | 'mandala';

// HomeScreen component - ĐÃ KHÔI PHỤC ĐẦY ĐỦ CÁC NÚT
function HomeScreen({ navigateTo }: { navigateTo: (screen: ActiveScreen) => void }) {
  const buttons = [
    { title: 'SỐ CHỦ ĐẠO', screen: 'mainNumber' as ActiveScreen },
    { title: 'BIỂU ĐỒ NGÀY SINH', screen: 'birthChart' as ActiveScreen },
    { title: 'BIỂU ĐỒ TÊN', screen: 'nameChart' as ActiveScreen },
    { title: 'BIỂU ĐỒ TỔNG HỢP', screen: 'summaryChart' as ActiveScreen },
    { title: 'MŨI TÊN XU HƯỚNG', screen: 'trendArrow' as ActiveScreen },
    { title: 'CÁC ĐỈNH KIM TỰ', screen: 'pyramidNail' as ActiveScreen },
    { title: 'PERSONAL YEAR', screen: 'personalYear' as ActiveScreen },
    { title: 'MANDALA', screen: 'mandala' as ActiveScreen },
  ];

  return (
    <ImageBackground
        source={require('../assets/images/background.jpg')} // Đảm bảo đường dẫn này đúng
        style={styles.background}
        resizeMode="cover"
    >
      <View style={styles.wrapper}>
        <View style={styles.gridContainer}>
          {/* Hàng 1 */}
          <View style={styles.row}>
            {buttons.slice(0, 3).map((btn, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.button}
                onPress={() => navigateTo(btn.screen)}
              >
                <Text style={styles.buttonText}>{btn.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hàng 2 */}
          <View style={styles.row}>
            {buttons.slice(3, 6).map((btn, idx) => (
              <TouchableOpacity
                key={idx + 3} // Key cần phải là duy nhất
                style={styles.button}
                onPress={() => navigateTo(btn.screen)}
              >
                <Text style={styles.buttonText}>{btn.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hàng 3 - căn giữa 2 nút còn lại */}
          <View style={[styles.row, { justifyContent: 'center' }]}>
            {buttons.slice(6, 8).map((btn, idx) => (
              <TouchableOpacity
                key={idx + 6} // Key cần phải là duy nhất
                style={styles.button}
                onPress={() => navigateTo(btn.screen)}
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


const InternalAppNavigator = forwardRef((props, ref) => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');

  const navigateTo = (screen: ActiveScreen) => setActiveScreen(screen);
 

  const resetSelfToHome = () => {
    console.log('[InternalAppNavigator] Resetting to home screen due to event or direct call.');
    setActiveScreen('home');
  };

  useEffect(() => {
    const handler = () => {
      resetSelfToHome();
    };
    console.log('[InternalAppNavigator] Subscribing to resetHomeInternalNavigator event.');
    eventBus.on('resetHomeInternalNavigator', handler);

    return () => {
      console.log('[InternalAppNavigator] Unsubscribing from resetHomeInternalNavigator event.');
      eventBus.off('resetHomeInternalNavigator', handler);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    resetToHomeScreen: resetSelfToHome,
  }));

  const renderScreen = () => {
    if (activeScreen === 'home') {
      return <HomeScreen navigateTo={navigateTo} />;
    }
    const screensMap: Record<ActiveScreen, React.ComponentType<any>> = {
      home: () => null, // Sẽ không đến đây nếu activeScreen === 'home' đã được xử lý
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
      // return <ScreenComponent goBack={goBack} />; // <--- PROP goBack ĐÃ BỊ XÓA KHỎI ĐÂY
      return <ScreenComponent />; // Child screens no longer receive goBack prop
    }
    return (
        <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Không tìm thấy màn hình: {activeScreen}</Text>
            <ActivityIndicator size="large" color="#FFF" />
            <View style={{ marginTop: 20 }}>
                <Button title="Quay lại Home" onPress={resetSelfToHome} />
            </View>
        </View>
    );
  };

  return (
    <View style={styles.flexContainer}>{renderScreen()}</View>
  );
});

// --- STYLES --- (giữ nguyên như bạn cung cấp)
const styles = StyleSheet.create({
  flexContainer: { flex: 1 },
  background: { flex: 1, width: '100%', height: '100%' },
  wrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 24 },
  gridContainer: { width: '100%', maxWidth: 400, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-around', // space-around để 3 nút cách đều
        alignItems: 'center', flexWrap: 'wrap', gap: 12 }, // gap là khoảng cách giữa các nút trong hàng
  button: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    width: 100, // Kích thước cố định cho nút
    height: 100, // Kích thước cố định cho nút
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
    fontSize: 14,
  },
  // Thêm style cho loadingContainer nếu bạn dùng fallback ở renderScreen
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
});

export default InternalAppNavigator;