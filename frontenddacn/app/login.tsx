import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>(''); // ✅ toast message
  const [toastType, setToastType] = useState<'success' | 'error'>('success'); // Để xác định kiểu thông báo

  const handleLogin = async () => {
    if (!user || !pass) {
      setToastMessage('Vui lòng điền đầy đủ thông tin!');
      setToastType('error'); // Đặt màu đỏ cho thông báo lỗi
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://192.168.2.148:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user, pass }),
      });

      const result = await response.json();
      console.log('Phản hồi server:', result);

      if (result.success) {
        await AsyncStorage.setItem('authToken', result.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(result.data));

        setToastMessage('Đăng nhập thành công!');
        setToastType('success'); // Đặt màu xanh cho thông báo thành công

        setTimeout(() => {
          setToastMessage('');
          router.push('/explore');
        }, 1500);
      } else {
        setToastMessage(result.message || 'Sai tên đăng nhập hoặc mật khẩu');
        setToastType('error'); // Đặt màu đỏ cho thông báo lỗi
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setToastMessage('Không thể kết nối đến server!');
      setToastType('error'); // Đặt màu đỏ cho thông báo lỗi
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Đăng nhập</Text>

      <TextInput
        style={styles.input}
        placeholder="Tên người dùng"
        value={user}
        onChangeText={setUser}
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={pass}
        onChangeText={setPass}
        secureTextEntry
      />

      {toastMessage !== '' && (
        <Text style={[styles.toast, toastType === 'success' ? styles.toastSuccess : styles.toastError]}>
          {toastMessage}
        </Text>
      )}

      <Button
        title={loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        onPress={handleLogin}
        disabled={loading}
      />

      <TouchableOpacity onPress={() => router.push('/register')} style={styles.registerLink}>
        <Text style={styles.registerText}>Chưa có tài khoản? Đăng ký ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 12,
    paddingLeft: 8,
  },
  toast: {
    textAlign: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  toastSuccess: {
    color: 'green',
    backgroundColor: 'rgba(0, 255, 0, 0.1)', // Thêm nền cho toast thành công
  },
  toastError: {
    color: 'red',
    backgroundColor: 'rgba(255, 0, 0, 0.1)', // Thêm nền cho toast lỗi
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#007bff',
    fontSize: 16,
  },
});

export default LoginScreen;
