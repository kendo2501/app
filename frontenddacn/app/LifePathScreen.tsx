import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LifePathScreen = () => {
  const [lifePathNumber, setLifePathNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Hàm lấy số chủ đạo từ server
  const fetchLifePathNumber = async () => {
    setLoading(true);

    try {
      // Lấy thông tin người dùng từ AsyncStorage
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (!userInfo) {
        setLoading(false);
        Alert.alert('Thông báo', 'Không tìm thấy thông tin người dùng.');
        return;
      }

      const { userId } = JSON.parse(userInfo);
      if (!userId) {
        setLoading(false);
        Alert.alert('Thông báo', 'Không tìm thấy userId.');
        return;
      }

      // Gửi yêu cầu đến server để lấy số chủ đạo
      const response = await fetch(`http://192.168.2.148:3000/api/life-path/${userId}`);
      const result = await response.json();

      if (result.success) {
        setLifePathNumber(result.lifePathNumber);
      } else {
        Alert.alert('Thông báo', result.message || 'Không thể lấy số chủ đạo.');
      }
    } catch (error) {
      console.error('Lỗi khi lấy số chủ đạo:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi lấy số chủ đạo.');
    } finally {
      setLoading(false);
    }
  };

  // Tự động gọi hàm khi màn hình được tải
  useEffect(() => {
    fetchLifePathNumber();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Số Chủ Đạo</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : lifePathNumber !== null ? (
        <Text style={styles.result}>Số Chủ Đạo của bạn là: {lifePathNumber}</Text>
      ) : (
        <Text>Số chủ đạo chưa được tính toán.</Text>
      )}

      <Button title="Tính lại số chủ đạo" onPress={fetchLifePathNumber} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  result: {
    fontSize: 20,
    marginTop: 20,
    color: 'green',
  },
});

export default LifePathScreen;
