import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import texture from '../../assets/images/beige-paper.png';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

const ImagePickerComponent = () => {
  const navigation = useNavigation();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (!hasLaunched) {
        setShowWelcomeModal(true);
      }
    };
    checkFirstLaunch();
  }, []);

  const handleAcceptTerms = async () => {
    await AsyncStorage.setItem('hasLaunched', 'true');
    setShowWelcomeModal(false);
  };

  const handleCancelTerms = () => {
    Alert.alert(
      'Notice',
      'You need to accept the Terms of Service and Privacy Policy to use CanScan.',
      [{ text: 'OK' }]
    );
  };

  const requestPermissions = async () => {
    const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    return galleryPermission.granted && cameraPermission.granted;
  };

  const handleImageResult = (result) => {
    if (!result.canceled && result.assets?.length > 0) {
      const imageUri = result.assets[0].uri;
      navigation.navigate('explore', { imageUri });
    }
  };

  const openGallery = async () => {
    const granted = await requestPermissions();
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    handleImageResult(result);
  };

  const openCamera = async () => {
    const granted = await requestPermissions();
    if (!granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    handleImageResult(result);
  };

  return (
    <ImageBackground source={texture} style={styles.background} resizeMode="cover">
      <View style={styles.greenOverlay} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFF" />
        <View style={styles.card}>
          <Text style={styles.title}>CanScan</Text>
          <Image
            source={require('../../assets/images/logo1.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeBold}>Welcome!</Text>
          <Text style={styles.welcomeText}>
            Lets scan your waste{'\n'}and{'\n'}determine proper disposal
          </Text>

          <TouchableOpacity style={styles.uploadButton} onPress={openGallery}>
            <Text style={styles.uploadButtonText}>Upload Picture</Text>
          </TouchableOpacity>
          
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
            <Text style={styles.cameraButtonText}>Capture From Camera</Text>
          </TouchableOpacity>

        </View>

        <View style={styles.bottomCard} />
      </SafeAreaView>

      <Modal visible={showWelcomeModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Welcome to CanScan!</Text>
            <Text style={styles.modalText}>
              By clicking continue, you agree to our{' '}
              <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={handleCancelTerms}
              >
                <Text style={[styles.modalButtonText, { color: '#333' }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#7B8D42' }]}
                onPress={handleAcceptTerms}
              >
                <Text style={styles.modalButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
};

export default ImagePickerComponent;


const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingTop: STATUSBAR_HEIGHT,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#F2E9D8',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0.5,
    marginBottom: 20,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#2E4E1E',
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  welcomeBold: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E4E1E',
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#2E4E1E',
  },
  uploadButton: {
    backgroundColor: '#7B8D42',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#B8B8B8',
  },
  orText: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#2E4E1E',
  },
  cameraButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E4E1E',
  },
  cameraButtonText: {
    color: '#2E4E1E',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#2E4E1E',
    fontWeight: '600',
  },
  bottomCard: {
    height: 120,
    backgroundColor: '#F2E9D8',
    borderRadius: 20,
    marginHorizontal: 12,
  },
  greenOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(110, 134, 66, 0.6)',
  zIndex: 0,
},
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2E4E1E',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});