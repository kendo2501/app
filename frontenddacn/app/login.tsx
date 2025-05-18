import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@/untils/url';

const LoginScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    handleLogin();
  };

  const handleLogin = async () => {
    if (!user || !pass) {
      setToastMessage('Vui lòng điền đầy đủ thông tin!');
      setToastType('error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/login`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user, pass }),
      });

      const result = await response.json();
      console.log('Phản hồi server:', result);

      if (result.success) {
        if (result.token !== undefined && result.token !== null) {
          await AsyncStorage.setItem('authToken', result.token);
        } else {
          await AsyncStorage.removeItem('authToken');
          console.warn('Không có token để lưu.');
        }

        if (result.data) {
          await AsyncStorage.setItem('userInfo', JSON.stringify(result.data));
        }

        await AsyncStorage.setItem('isLoggedIn', 'true');

        setToastMessage('Đăng nhập thành công!');
        setToastType('success');

        setTimeout(() => {
          setToastMessage('');
          router.replace('/');
        }, 1500);
      } else {
        setToastMessage(result.message || 'Sai tên đăng nhập hoặc mật khẩu');
        setToastType('error');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setToastMessage('Không thể kết nối đến server!');
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/backgound(login).jpg')} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.header}>Đăng Nhập</Text>

        <TextInput
          style={styles.input}
          placeholder="Tên người dùng"
          value={user}
          onChangeText={setUser}
          placeholderTextColor="#c9bba8"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={pass}
          onChangeText={setPass}
          placeholderTextColor="#c9bba8"
          secureTextEntry
        />

        {toastMessage !== '' && (
          <Text
            style={[
              styles.toast,
              toastType === 'success' ? styles.toastSuccess : styles.toastError,
            ]}
          >
            {toastMessage}
          </Text>
        )}

        <View style={styles.buttonWrapper}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <TouchableWithoutFeedback
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Animated.View
                style={[styles.loginButton, { transform: [{ scale: scaleAnim }] }]}
              >
                <Text style={styles.loginButtonText}>ĐĂNG NHẬP</Text>
              </Animated.View>
            </TouchableWithoutFeedback>
          )}
        </View>

        <Text
          onPress={() => router.push('/register')}
          style={styles.registerText}
        >
          Chưa có tài khoản? Đăng ký ngay
        </Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e6d5b8',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d4c2a8',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#fff',
    marginBottom: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  toast: {
    textAlign: 'center',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  toastSuccess: {
    color: 'lightgreen',
    backgroundColor: 'rgba(0,255,0,0.1)',
  },
  toastError: {
    color: '#ffaaaa',
    backgroundColor: 'rgba(255,0,0,0.1)',
  },
  buttonWrapper: {
    marginVertical: 20,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#2d2b4e',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  loginButtonText: {
    color: '#e6d5b8',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerText: {
    color: '#e6d5b8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
