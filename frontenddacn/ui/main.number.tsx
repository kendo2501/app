import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageBackground,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@/untils/url';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

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
      source={require('../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>
              <FontAwesome5 name="hat-wizard" size={24} color="#FFD700" /> Tính Số Chủ Đạo
            </Text>

            <Text style={styles.birthText}>
              <MaterialIcons name="calendar-today" size={18} color="#FFDD99" /> Ngày sinh: {dd} / {mm} / {yyyy}
            </Text>

            {/* <TouchableOpacity
              style={[styles.button, loading && { backgroundColor: '#aaa' }]}
              onPress={() => fetchLifePath(dd, mm, yyyy)}
              disabled={loading}
            >
              {/* <Text style={styles.buttonText}>Tính lại</Text> */}
            {/* </TouchableOpacity> */} 

            {loading && <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 20 }} />}

            {result && !loading && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultNumber}>
                  <MaterialIcons name="looks" size={22} color="#FFD700" /> Số chủ đạo: {result.number}
                </Text>
                <Text style={styles.description}>{result.information}</Text>
              </View>
            )}
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
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
  },
  birthText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 25,
  },
  resultNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 22,
    textAlign: 'center',
  },
});
