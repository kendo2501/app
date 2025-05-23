import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function InfoStaticScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{
    fullName: string;
    dd: number;
    mm: number;
    yyyy: number;
  } | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const stored = await AsyncStorage.getItem('userInfo');
      if (stored) {
        setUserInfo(JSON.parse(stored));
      }
    };
    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>⎋</Text>
      </TouchableOpacity>

      <View style={styles.centerContent}>
        <Text style={styles.name}>
          {userInfo?.fullName || 'Đang tải...'}
        </Text>

        <View style={styles.dateContainer}>
          <Text style={styles.datePart}>
            {userInfo?.dd?.toString().padStart(2, '0') || '--'}
          </Text>
          <Text style={styles.separator}>/</Text>
          <Text style={styles.datePart}>
            {userInfo?.mm?.toString().padStart(2, '0') || '--'}
          </Text>
          <Text style={styles.separator}>/</Text>
          <Text style={styles.datePart}>
            {userInfo?.yyyy?.toString() || '----'}
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  logoutText: {
    fontSize: 24,
    color: '#fff',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePart: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  separator: {
    fontSize: 24,
    color: '#fff',
    marginHorizontal: 6,
  },
});
