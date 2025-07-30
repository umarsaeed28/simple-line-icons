import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

const { width, height } = Dimensions.get('window');

type UploadScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Upload'>;

export default function UploadScreen() {
  const navigation = useNavigation<UploadScreenNavigationProp>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to make this work!'
      );
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to make this work!'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleContinue = () => {
    if (selectedImage) {
      navigation.navigate('StylePicker', { roomImage: selectedImage });
    } else {
      Alert.alert('No Image Selected', 'Please select or take a photo of your room first.');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Room Photo</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Ionicons name="camera" size={48} color="#3B82F6" />
          <Text style={styles.instructionsTitle}>Capture Your Room</Text>
          <Text style={styles.instructionsText}>
            Take a photo or upload an image of the room you want to redesign. 
            Make sure the room is well-lit and shows the full space.
          </Text>
        </View>

        {/* Image Preview */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close-circle" size={32} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}

        {/* Upload Options */}
        <View style={styles.uploadOptions}>
          <TouchableOpacity style={styles.uploadOption} onPress={takePhoto}>
            <View style={[styles.uploadIcon, { backgroundColor: '#3B82F6' }]}>
              <Ionicons name="camera" size={32} color="white" />
            </View>
            <Text style={styles.uploadTitle}>Take Photo</Text>
            <Text style={styles.uploadSubtitle}>Use camera to capture</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadOption} onPress={pickImage}>
            <View style={[styles.uploadIcon, { backgroundColor: '#10B981' }]}>
              <Ionicons name="images" size={32} color="white" />
            </View>
            <Text style={styles.uploadTitle}>Choose from Gallery</Text>
            <Text style={styles.uploadSubtitle}>Select existing photo</Text>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tips for best results:</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipText}>• Ensure good lighting</Text>
            <Text style={styles.tipText}>• Capture the entire room</Text>
            <Text style={styles.tipText}>• Keep the camera level</Text>
            <Text style={styles.tipText}>• Avoid shadows and glare</Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedImage ? styles.continueButtonActive : styles.continueButtonInactive
          ]}
          onPress={handleContinue}
          disabled={!selectedImage}
        >
          <Text style={styles.continueButtonText}>
            {selectedImage ? 'Continue to Style Selection' : 'Select a Photo First'}
          </Text>
          {selectedImage && (
            <Ionicons name="arrow-forward" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  uploadOption: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  tipsList: {
    gap: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#92400E',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  continueButtonActive: {
    backgroundColor: '#3B82F6',
  },
  continueButtonInactive: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
});