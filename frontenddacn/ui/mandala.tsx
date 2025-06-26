import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- IMPORT COMPONENTS CHI TIẾT ---
import H1 from '../ui/C_F_ofMandala/H1';
import H2 from '../ui/C_F_ofMandala/H2';
import H3 from '../ui/C_F_ofMandala/H3';
import H4 from '../ui/C_F_ofMandala/H4';
import H5 from '../ui/C_F_ofMandala/H5';
import H6 from '../ui/C_F_ofMandala/H6';
import H7 from '../ui/C_F_ofMandala/H7';
import H8 from '../ui/C_F_ofMandala/H8';
import H9 from '../ui/C_F_ofMandala/H9';
import H10 from '../ui/C_F_ofMandala/H10';
import H11 from '../ui/C_F_ofMandala/H11';
import H12 from '../ui/C_F_ofMandala/H12';
import H13 from '../ui/C_F_ofMandala/H13';

import {
    getFinalH1Value, getFinalH2Value, getFinalH3Value, getFinalH4Value,
    getFinalH5Value, getFinalH6Value, getFinalH7Value, getFinalH8Value,
    getFinalH9Value, getFinalH10Value, getFinalH11Value,
    getFinalH12Value, getFinalH13Value,
} from '../untils/mandalaCalculations';

interface MandalaScreenProps {
    goBack: () => void;
}

const MandalaScreen: React.FC<MandalaScreenProps> = ({ goBack }) => {
    const [selectedMandalaId, setSelectedMandalaId] = useState<string | null>(null);
    const [mandalaValues, setMandalaValues] = useState<{ [key: string]: number | null }>({});

    useEffect(() => {
        const loadAllMandalaValues = async () => {
            try {
                const storedUserInfo = await AsyncStorage.getItem('userInfo');
                if (!storedUserInfo) return;

                const { dd, mm, yyyy } = JSON.parse(storedUserInfo);
                const results = {
                    H1: getFinalH1Value(dd),
                    H2: getFinalH2Value(mm),
                    H3: getFinalH3Value(yyyy),
                    H4: getFinalH4Value(dd, mm, yyyy),
                    H5: getFinalH5Value(dd, mm, yyyy),
                    H6: getFinalH6Value(dd, mm),
                    H7: getFinalH7Value(mm, yyyy),
                    H8: getFinalH8Value(dd, yyyy),
                    H9: getFinalH9Value(dd, mm, yyyy),
                    H10: getFinalH10Value(dd, mm, yyyy),
                    H11: getFinalH11Value(dd, mm, yyyy),
                    H12: getFinalH12Value(dd, mm, yyyy),
                    H13: getFinalH13Value(dd, mm, yyyy),
                };
                setMandalaValues(results);
            } catch (e) {
                console.error('Error loading mandala values:', e);
            }
        };

        loadAllMandalaValues();
    }, []);

    const handleButtonPress = (mandalaId: string) => {
        setSelectedMandalaId(mandalaId);
    };

    const handleBackToGridPress = () => {
        setSelectedMandalaId(null);
    };

    const renderButton = (id: string, specificStyle: object) => (
        <TouchableOpacity
            style={[styles.buttonBase, specificStyle]}
            onPress={() => handleButtonPress(id)}
            activeOpacity={0.7}
        >
            <Text style={styles.buttonText}>
                {mandalaValues[id] !== undefined && mandalaValues[id] !== null
                    ? mandalaValues[id]
                    : id}
            </Text>
        </TouchableOpacity>
    );

    const renderPlaceholder = () => <View style={styles.placeholder} />;

    const renderGridView = () => (
        <View style={styles.gridContainer}>
            <View style={styles.row}>{renderPlaceholder()}{renderButton('H12', styles.buttonYellow)}{renderPlaceholder()}</View>
            <View style={styles.row}>{renderButton('H6', styles.buttonYellow)}{renderButton('H1', styles.buttonGreen)}{renderButton('H8', styles.buttonYellow)}</View>
            <View style={styles.rowWide}>{renderButton('H9', styles.buttonYellow)}{renderButton('H2', styles.buttonGreen)}{renderButton('H5', styles.buttonBlue)}{renderButton('H4', styles.buttonGreen)}{renderButton('H13', styles.buttonYellow)}</View>
            <View style={styles.row}>{renderButton('H7', styles.buttonYellow)}{renderButton('H3', styles.buttonGreen)}{renderButton('H10', styles.buttonYellow)}</View>
            <View style={styles.row}>{renderPlaceholder()}{renderButton('H11', styles.buttonYellow)}{renderPlaceholder()}</View>
        </View>
    );

    const renderDetailContent = () => {
        if (!selectedMandalaId) return null;
        const components: { [key: string]: React.ComponentType<any> } = {
            H1, H2, H3, H4, H5, H6, H7, H8, H9, H10, H11, H12, H13,
        };
        const DetailComponent = components[selectedMandalaId];
        return DetailComponent ? <DetailComponent onBack={handleBackToGridPress} /> : null;
    };

    return (
        <ImageBackground source={require('../assets/images/background.jpg')} style={styles.background} resizeMode="cover">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    {selectedMandalaId === null ? renderGridView() : renderDetailContent()}
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: { flex: 1 },
    safeArea: { flex: 1 },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    gridContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        width: '70%',
    },
    rowWide: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
    },
    buttonBase: {
        width: 65,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    buttonYellow: { backgroundColor: '#FDE047' },
    buttonGreen: { backgroundColor: '#4ADE80' },
    buttonBlue: { backgroundColor: '#60A5FA' },
    placeholder: {
        width: 65,
        height: 50,
        marginHorizontal: 5,
    },
});

export default MandalaScreen;
