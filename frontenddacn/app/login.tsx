import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleLogin = async () => {
    if (!user || !pass) {
      setToastMessage('Vui lòng điền đầy đủ thông tin!');
      setToastType('error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://192.168.10.7:3001/api/login', {
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
    await AsyncStorage.removeItem('authToken'); // hoặc bỏ dòng này nếu không cần xóa
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
          router.replace('/'); // ✅ Về TabLayout
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
    <View style={styles.container}>
      <Text style={styles.header}>Đăng nhập</Text>

      <TextInput
        style={styles.input}
        placeholder="Tên người dùng"
        value={user}
        onChangeText={setUser}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={pass}
        onChangeText={setPass}
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
          <ActivityIndicator size="small" color="#007bff" />
        ) : (
          <Button title="Đăng nhập" onPress={handleLogin} />
        )}
      </View>

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
    height: 44,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  toast: {
    textAlign: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  toastSuccess: {
    color: 'green',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  toastError: {
    color: 'red',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  buttonWrapper: {
    marginVertical: 10,
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
