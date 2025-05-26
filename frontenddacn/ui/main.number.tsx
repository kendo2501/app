import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageBackground,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@/untils/url';

export default function LifePathScreen() {
  const [dd, setDd] = useState('');
  const [mm, setMm] = useState('');
  const [yyyy, setYyyy] = useState('');
  const [result, setResult] = useState<{ number: string; information: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLifePath = async (d: string, m: string, y: string) => {
    if (!d || !m || !y) {
      Alert.alert('Lỗi', 'Ngày sinh không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/life-path`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dd: d, mm: m, yyyy: y }),
      });

      const data = await response.json();
      if (data.success) {
        setResult({ number: data.number, information: data.information });
      } else {
        Alert.alert('Lỗi', data.message || 'Lỗi khi tính số chủ đạo');
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
            fetchLifePath(userInfo.dd.toString(), userInfo.mm.toString(), userInfo.yyyy.toString());
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
      source={require('../assets/images/background.jpg')} // sửa đường dẫn nếu cần
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Tính Số Chủ Đạo</Text>

          <View style={styles.birthDateContainer}>
          <Text style={{ color: '#FFFFFF' }}>Ngày sinh: {dd} / {mm} / {yyyy}</Text>
          </View>

          <Button title="Tính lại" onPress={() => fetchLifePath(dd, mm, yyyy)} disabled={loading} />

          {loading && <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />}

          {result && !loading && (
            <View style={styles.resultContainer}>
              <Text style={styles.result}>Số chủ đạo: {result.number}</Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#FFFFFF', // Màu trắng để nổi trên nền
  },
  birthDateContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  resultContainer: {
    marginTop: 20,
  },
  result: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  description: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
