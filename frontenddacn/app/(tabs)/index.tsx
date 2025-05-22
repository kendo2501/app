import React, { useState } from 'react';
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
  Platform, // Platform was imported but not used in the original snippet.
} from 'react-native';

// --- IMPORT MÀN HÌNH ---
// Note: These files (main.number, birth.chart, etc.) are not defined in this snippet.
// They are expected to be present in the '../../ui/' directory.
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

// --- APP ---
export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');

  const navigateTo = (screen: ActiveScreen) => setActiveScreen(screen);
  const goBack = () => setActiveScreen('home'); // This is the goBack function

  const renderScreen = () => {
    if (activeScreen === 'home') {
      return <HomeScreen navigateTo={navigateTo} />;
    }

    const screensMap: Record<ActiveScreen, React.ComponentType<any>> = {
      home: () => null, // Should not be reached if activeScreen === 'home' is handled above
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
      // Each screen component receives 'goBack' as a prop
      return <ScreenComponent goBack={goBack} />;
    }

    // Fallback if a screen component is missing
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải màn hình: {activeScreen}</Text>
        <Text style={styles.loadingInfo}>Chưa có component cho màn hình này</Text>
        <ActivityIndicator size="large" color="#FFF" />
        <View style={{ marginTop: 20 }}>
          {/* Button to go back to home if a screen fails to load */}
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
// This component is part of App.js for simplicity in this example
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
      source={require('../../assets/images/background.jpg')} // Ensure this path is correct
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
                onPress={() => navigateTo(btn.screen)}
              >
                <Text style={styles.buttonText}>{btn.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            {buttons.slice(3, 6).map((btn, idx) => (
              <TouchableOpacity
                key={idx + 3} // Ensure unique keys
                style={styles.button}
                onPress={() => navigateTo(btn.screen)}
              >
                <Text style={styles.buttonText}>{btn.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.row, { justifyContent: 'center' }]}>
            {buttons.slice(6, 8).map((btn, idx) => ( // Slices up to (but not including) index 8
              <TouchableOpacity
                key={idx + 6} // Ensure unique keys
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

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000', // Or your app's default background
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
    paddingVertical: 24, // Added some vertical padding
  },
  gridContainer: {
    width: '100%',
    maxWidth: 400, // Max width for the grid on larger screens
    gap: 12, // Spacing between rows
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distributes space for buttons in a row
    alignItems: 'center', // Align items centrally in the row
    flexWrap: 'wrap', // Allow wrapping if buttons don't fit
    gap: 12, // Spacing between buttons in a row
  },
  button: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 10, // Adjusted for better text fit
    borderRadius: 12,
    width: 100, // Fixed width
    height: 100, // Fixed height
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    // marginBottom: 12, // If not using gap in row
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    fontSize: 14, // Keep small if titles are long
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2c3e50', // A dark slate blue
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
    color: '#bdc3c7', // A light grey
    textAlign: 'center',
    marginBottom: 20,
  },
});