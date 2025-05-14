import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground, // Giữ lại theo code bạn gửi
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import hàm gọi API từ file service

import { searchMandalaInfoByNumber } from '../../api/apiMandala'; // Đảm bảo đường dẫn đúng

// --- Cấu hình ---
const USER_ID_TO_FETCH = 1; // ID của user bạn muốn lấy dữ liệu
const BACKGROUND_IMAGE = require('../../assets/images/background.jpg'); // Đường dẫn tới ảnh nền

// Hàm tính toán con số chủ đạo
const calculateDayNumber = (day: number | null | undefined): number | null => {
    if (day === null || day === undefined || day <= 0) {
        return null;
    }
    if (day <= 22) {
        return day;
    } else {
        // Tính tổng các chữ số
        const sum = String(day)
            .split('')
            .reduce((s, digit) => s + parseInt(digit, 10), 0);
        // Chỉ trả về tổng, không đệ quy trong ví dụ này
        return sum;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#2c3e50', // Commented out as ImageBackground is used
    },
    absoluteFill: { // Utility style for background image covering the screen
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: undefined,
        height: undefined,
        resizeMode: 'cover',
    },
    centerContent: { // Utility style for centering content
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: { // Style for the ImageBackground component
        flex: 1,
    },
    safeArea: { // Ensures content is within safe screen boundaries
        flex: 1,
    },
    header: { // Style for the top header section
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 15, // Adjust if using react-native-safe-area-context
        paddingBottom: 10,
        width: '100%',
    },
    backButton: { // Style for the back button touchable area
        padding: 5,
    },
    backButtonPlaceholder: { // Invisible view to balance the header title
        width: 38, // Should match the effective width of the back button icon + padding
        height: 38,
    },
    titleContainer: { // White background container for the title
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 30,
        borderRadius: 5,
    },
    title: { // Style for the title text "H1"
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    content: { // Style for the main content area below the header
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    circle: { // Style for the circle displaying the day number
        width: 180,
        height: 180,
        borderRadius: 90, // Half of width/height to make it a circle
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40, // Space below the circle
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        // Elevation for Android
        elevation: 5,
    },
    number: { // Style for the day number text inside the circle
        fontSize: 80,
        fontWeight: 'bold',
        color: '#E6007E', // Pink/purple color
    },
    textBox: { // Style for the box containing the description text
        backgroundColor: 'rgba(211, 211, 211, 0.85)', // Semi-transparent light gray
        padding: 25,
        borderRadius: 10,
        width: '90%', // Takes 90% of the container width
        alignItems: 'center', // Centers the text horizontally
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        // Elevation for Android
        elevation: 2,
        minHeight: 100, // Ensures minimum height for content or loading text
        justifyContent: 'center', // Centers the text vertically if content is short
    },
    descriptionText: { // Style for the description text itself
        fontSize: 16,
        color: '#333', // Dark gray color for readability
        textAlign: 'center', // Centers the text lines
        lineHeight: 24, // Provides spacing between lines
    },
});
// --- End of Styles Definition ---

// --- React Component Definition ---
export default function App() {
    // State variables
    const [dayNumber, setDayNumber] = useState<number | null>(null);
    const [userData, setUserData] = useState<any>(null); // Use 'any' or define a specific user type/interface
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Explicitly boolean
    const [error, setError] = useState<string | null>(null);

    // Effect Hook to load data when the component mounts
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            // Reset previous data
            setUserData(null);
            setDayNumber(null);
            setMandalaDescription(null);

            try {
                // --- Step 1: Fetch User Data ---
                console.log(`[App] Fetching user data for ID: ${USER_ID_TO_FETCH}`);
                const fetchedUserData = await getUserById(USER_ID_TO_FETCH);
                setUserData(fetchedUserData);
                console.log("[App] User data received:", fetchedUserData);

                // --- Step 2: Calculate Day Number ---
                // Use optional chaining (?.) in case fetchedUserData or fetchedUserData.dd is null/undefined
                const calculatedNumber = calculateDayNumber(fetchedUserData?.dd);
                console.log(`[App] Calculated day number: ${calculatedNumber}`);
                setDayNumber(calculatedNumber);

                // --- Step 3: Fetch Mandala Description (if dayNumber is valid) ---
                if (calculatedNumber !== null) {
                    console.log(`[App] Fetching Mandala description for number: ${calculatedNumber}`);
                    const description = await searchMandalaInfoByNumber(calculatedNumber);
                    console.log(`[App] Mandala description received: "${description}"`); // Log the description

                    // Check if the received description is a valid, non-empty string
                    if (typeof description === 'string' && description.trim().length > 0) {
                        setMandalaDescription(description);
                    } else {
                        // Handle cases where API returns null, undefined, empty string, or non-string
                        setMandalaDescription(`Không tìm thấy mô tả cho số ${calculatedNumber}.`);
                        console.warn(`[App] No valid description found for number: ${calculatedNumber}. API returned:`, description);
                    }
                } else {
                    // Handle case where day number couldn't be calculated
                    console.warn("[App] Cannot fetch Mandala description because dayNumber is null.");
                    setMandalaDescription("Không thể tính số chủ đạo để lấy mô tả.");
                }

            } catch (err: any) { // Catch errors from either API call or calculation
                console.error("Error in App component loadData:", err);
                const errorMessage = err?.message || "Đã xảy ra lỗi không xác định."; // Get error message safely
                setError(errorMessage);
                // Provide feedback in the description box as well
                setMandalaDescription("Lỗi khi tải dữ liệu mô tả.");
                // Show alert to the user
                Alert.alert("Lỗi Tải Dữ Liệu", errorMessage);
            } finally {
                // Ensure loading is set to false regardless of success or error
                setLoading(false);
                console.log("[App] Loading finished.");
            }
        };

        loadData(); // Execute the data loading function
    }, []); // Empty dependency array ensures this runs only once on mount

    // --- Navigation Handler ---
    const handleGoBack = () => {
        console.log('Go back pressed');
        // Add navigation logic here if this screen is part of a stack
        // e.g., navigation.goBack();
    };

    // --- Render Logic ---

    // Display full-screen loading indicator only on initial load
    if (loading && !userData) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                {/* Optional: Background image during loading */}
                <ImageBackground source={BACKGROUND_IMAGE} style={StyleSheet.absoluteFill} />
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={{ color: 'white', marginTop: 10 }}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    // Main component render output
    return (
        <ImageBackground source={BACKGROUND_IMAGE} style={styles.background}>
            <SafeAreaView style={styles.safeArea}>
                {/* Configure status bar style */}
                <StatusBar barStyle="light-content" />

                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>H1</Text>
                    </View>
                    <View style={styles.backButtonPlaceholder} />
                </View>

                {/* Main Content Section */}
                <View style={styles.content}>
                    {/* Circle for Day Number */}
                    <View style={styles.circle}>
                        {/* Show small loading indicator if still loading but user data is present */}
                        {(loading && dayNumber === null) ? (
                            <ActivityIndicator size="small" color="#E6007E" />
                        ) : dayNumber !== null ? (
                            // Display the calculated day number
                            <Text style={styles.number}>{dayNumber}</Text>
                        ) : (
                            // Display a placeholder if number calculation failed or resulted in null
                            <Text style={styles.number}>-</Text>
                        )}
                    </View>

                    {/* Text Box for Mandala Description */}
                    <View style={styles.textBox}>
                        <Text style={styles.descriptionText}>
                            {/* Conditional rendering for the description text */}
                            {loading ? // Check if still loading (might be description loading)
                                "Đang tải mô tả..." :
                                mandalaDescription ? // If description is loaded and exists
                                mandalaDescription :
                                error ? // If there was an overall error and no description loaded
                                "Lỗi khi tải mô tả." :
                                "Không có mô tả." // Default if no description and no error message
                            }
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}
// --- End of Component Definition ---