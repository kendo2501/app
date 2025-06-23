import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@/untils/url';

export default function PersonalYearScreen() {
  const [dd, setDd] = useState('');
  const [mm, setMm] = useState('');
  const [yyyy, setYyyy] = useState('');
  const [result, setResult] = useState<{ number: string; information: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPersonalYear = async (d: string, m: string, y: string) => {
    if (!d || !m || !y) {
      Alert.alert('Lỗi', 'Ngày sinh không hợp lệ');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/personal-year`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dd: d, mm: m, yyyy: y }),
      });
      const data = await response.json();
      if (data.success) {
        setResult({ number: data.number, information: data.information });
      } else {
        Alert.alert('Lỗi', data.message || 'Lỗi khi tính năm cá nhân');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadBirthDate = async () => {
      try {
        const userInfoString = await AsyncStorage.getItem('userInfo');
        if (userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          if (userInfo.dd && userInfo.mm && userInfo.yyyy) {
            setDd(userInfo.dd.toString());
            setMm(userInfo.mm.toString());
            setYyyy(userInfo.yyyy.toString());
            fetchPersonalYear(userInfo.dd.toString(), userInfo.mm.toString(), userInfo.yyyy.toString());
          } else {
            Alert.alert('Lỗi', 'Không tìm thấy ngày sinh trong thông tin người dùng');
          }
        } else {
          Alert.alert('Lỗi', 'Bạn chưa đăng nhập hoặc chưa lưu ngày sinh');
        }
      } catch (error) {
        console.error('Lỗi lấy dữ liệu ngày sinh:', error);
      }
    };
    loadBirthDate();
  }, []);

  return (
    <ImageBackground
      source={require('../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>🔮 Tính Năm Cá Nhân</Text>

          <View style={styles.birthDateContainer}>
            <Text style={styles.subtitle}>📅 Ngày sinh: {dd} / {mm} / {yyyy}</Text>
          </View>

          {/* <TouchableOpacity
            style={[styles.button, loading && { backgroundColor: '#888' }]}
            onPress={() => fetchPersonalYear(dd, mm, yyyy)}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🔁 Tính lại</Text>
          </TouchableOpacity> */}

          {loading && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />}

          {result && !loading && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>🔢 Năm cá nhân: {result.number}</Text>
              <Text style={styles.description}>{result.information}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  birthDateContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 16,
    width: '100%',
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#eee',
    lineHeight: 22,
    textAlign: 'left',
  },
});
