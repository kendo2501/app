// app/register.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const RegisterScreen = () => {
  const router = useRouter();

  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [fullName, setFullName] = useState('');
  const [dd, setDd] = useState('');
  const [mm, setMm] = useState('');
  const [yyyy, setYyyy] = useState('');

  const handleRegister = async () => {
    if (!user || !pass || !fullName || !dd || !mm || !yyyy) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      const response = await fetch('http://192.168.2.148:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user, pass, fullName, dd, mm, yyyy }),
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert('Thành công', 'Đăng ký thành công!', [
          { text: 'Đăng nhập', onPress: () => router.replace('/login') }
        ]);
      } else {
        Alert.alert('Thất bại', result.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Đăng ký</Text>

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
      <TextInput
        style={styles.input}
        placeholder="Họ và tên"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Ngày sinh (dd)"
        value={dd}
        onChangeText={setDd}
        keyboardType="numeric"
        maxLength={2}
      />
      <TextInput
        style={styles.input}
        placeholder="Tháng sinh (mm)"
        value={mm}
        onChangeText={setMm}
        keyboardType="numeric"
        maxLength={2}
      />
      <TextInput
        style={styles.input}
        placeholder="Năm sinh (yyyy)"
        value={yyyy}
        onChangeText={setYyyy}
        keyboardType="numeric"
        maxLength={4}
      />

      <Button title="Đăng ký" onPress={handleRegister} />
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
});

export default RegisterScreen;
