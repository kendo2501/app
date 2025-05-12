import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IndexScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          // Nếu có token, điều hướng đến trang Explore hoặc trang khác sau khi đăng nhập
          router.replace('/explore');
        } else {
          // Nếu không có token, điều hướng đến trang đăng nhập
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        router.replace('/login');
      } finally {
        setLoading(false); // Ẩn loading sau khi kiểm tra
      }
    };

    checkLoginStatus();
  }, [router]);

  if (loading) {
    // Hiển thị màn hình loading khi đang kiểm tra trạng thái đăng nhập
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return null; // Không hiển thị gì nếu đã kiểm tra xong
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default IndexScreen;
