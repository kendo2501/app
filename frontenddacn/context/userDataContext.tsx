import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  fullName: string | null;
  day: string | null;
  month: string | null;
  year: string | null;
}

interface UserDataContextProps extends UserData {
  isLoading: boolean;
  saveUserData: (data: Omit<UserData, 'isLoading'>) => Promise<void>;
  clearUserData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextProps | undefined>(undefined);

const USER_DATA_KEY = '@userData'; // Khóa để lưu trong AsyncStorage

export const UserDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>({
    fullName: null,
    day: null,
    month: null,
    year: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load data khi provider được mount lần đầu
    const loadData = async () => {
      try {
        setIsLoading(true);
        const storedData = await AsyncStorage.getItem(USER_DATA_KEY);
        if (storedData) {
          setUserData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error("Failed to load user data from storage", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const saveUserData = async (data: Omit<UserData, 'isLoading'>) => {
    try {
      // Lưu vào state
      const newData = {
          fullName: data.fullName?.toUpperCase() || null, // Luôn lưu chữ hoa
          day: data.day || null,
          month: data.month || null,
          year: data.year || null
      };
      setUserData(newData);
      // Lưu vào AsyncStorage
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(newData));
      console.log("User data saved:", newData);
    } catch (error) {
      console.error("Failed to save user data", error);
    }
  };

  const clearUserData = async () => {
       try {
           const clearedData = { fullName: null, day: null, month: null, year: null };
           setUserData(clearedData);
           await AsyncStorage.removeItem(USER_DATA_KEY);
           console.log("User data cleared");
       } catch (error) {
           console.error("Failed to clear user data", error);
       }
   };


  return (
    <UserDataContext.Provider value={{ ...userData, isLoading, saveUserData, clearUserData }}>
      {children}
    </UserDataContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng context dễ dàng hơn
export const useUserData = (): UserDataContextProps => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};