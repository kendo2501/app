import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { Platform, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import eventBus from '../../untils/eventBus';

import { HapticTab } from '../../components/HapticTab';
import { IconSymbol } from '../../components/ui/IconSymbol';
import TabBarBackground from '../../components/ui/TabBarBackground';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Ref để đếm số lần nhấn tab "Home"
  const homeTabPressCountRef = useRef(0);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');
        if (loggedIn === 'true') {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          router.replace('/login');
        }
      } catch (error) {
        console.error('Lỗi kiểm tra đăng nhập:', error);
        setIsLoggedIn(false);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return null; // Không hiển thị gì nếu chưa đăng nhập
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            homeTabPressCountRef.current += 1;

            if (homeTabPressCountRef.current === 2) {
              console.log('[TabLayout] Home tab pressed 2nd time. Emitting reset event.');
              eventBus.emit('resetHomeInternalNavigator');
              homeTabPressCountRef.current = 0;
            } else {
              console.log('[TabLayout] Home tab pressed 1st time.');
            }
          },
        }}
      />

      <Tabs.Screen
        name="user"
        options={{
          title: 'User',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
