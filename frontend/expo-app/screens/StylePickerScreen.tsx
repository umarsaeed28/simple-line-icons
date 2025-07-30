import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

const { width } = Dimensions.get('window');

type StylePickerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StylePicker'>;
type StylePickerScreenRouteProp = RouteProp<RootStackParamList, 'StylePicker'>;

const styleOptions = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean lines, minimal decor, neutral colors',
    image: 'https://via.placeholder.com/200x150/3B82F6/FFFFFF?text=Modern',
    color: '#3B82F6',
  },
  {
    id: 'traditional',
    name: 'Traditional',
    description: 'Classic elegance with rich textures',
    image: 'https://via.placeholder.com/200x150/8B5CF6/FFFFFF?text=Traditional',
    color: '#8B5CF6',
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Light, airy spaces with natural materials',
    image: 'https://via.placeholder.com/200x150/10B981/FFFFFF?text=Scandinavian',
    color: '#10B981',
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Raw materials, exposed elements, urban feel',
    image: 'https://via.placeholder.com/200x150/F59E0B/FFFFFF?text=Industrial',
    color: '#F59E0B',
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    description: 'Eclectic mix of patterns and textures',
    image: 'https://via.placeholder.com/200x150/EC4899/FFFFFF?text=Bohemian',
    color: '#EC4899',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Less is more, focus on essentials',
    image: 'https://via.placeholder.com/200x150/6B7280/FFFFFF?text=Minimalist',
    color: '#6B7280',
  },
  {
    id: 'coastal',
    name: 'Coastal',
    description: 'Beach-inspired, light and breezy',
    image: 'https://via.placeholder.com/200x150/06B6D4/FFFFFF?text=Coastal',
    color: '#06B6D4',
  },
  {
    id: 'rustic',
    name: 'Rustic',
    description: 'Warm, natural, country-inspired',
    image: 'https://via.placeholder.com/200x150/A0522D/FFFFFF?text=Rustic',
    color: '#A0522D',
  },
];

const roomTypes = [
  { id: 'living_room', name: 'Living Room', icon: 'sofa' },
  { id: 'bedroom', name: 'Bedroom', icon: 'bed' },
  { id: 'kitchen', name: 'Kitchen', icon: 'restaurant' },
  { id: 'dining_room', name: 'Dining Room', icon: 'restaurant' },
  { id: 'office', name: 'Office', icon: 'briefcase' },
  { id: 'bathroom', name: 'Bathroom', icon: 'water' },
];

export default function StylePickerScreen() {
  const navigation = useNavigation<StylePickerScreenNavigationProp>();
  const route = useRoute<StylePickerScreenRouteProp>();
  const { roomImage } = route.params;

  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('living_room');
  const [budget, setBudget] = useState<number>(5000);

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev =>
      prev.includes(styleId)
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const handleContinue = () => {
    if (selectedStyles.length === 0) {
      alert('Please select at least one style preference.');
      return;
    }
    
    // Navigate to results with mock data for now
    navigation.navigate('Results', { designId: 'mock-design-id' });
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
          <Text style={styles.headerTitle}>Choose Your Style</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Room Image Preview */}
        {roomImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: roomImage }} style={styles.roomImage} />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>Your Room</Text>
            </View>
          </View>
        )}

        {/* Room Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Room Type</Text>
          <View style={styles.roomTypeGrid}>
            {roomTypes.map((roomType) => (
              <TouchableOpacity
                key={roomType.id}
                style={[
                  styles.roomTypeCard,
                  selectedRoomType === roomType.id && styles.roomTypeCardSelected
                ]}
                onPress={() => setSelectedRoomType(roomType.id)}
              >
                <Ionicons
                  name={roomType.icon as any}
                  size={24}
                  color={selectedRoomType === roomType.id ? '#3B82F6' : '#6B7280'}
                />
                <Text style={[
                  styles.roomTypeText,
                  selectedRoomType === roomType.id && styles.roomTypeTextSelected
                ]}>
                  {roomType.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Style Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Design Styles</Text>
          <Text style={styles.sectionSubtitle}>
            Select one or more styles that inspire you
          </Text>
          <View style={styles.styleGrid}>
            {styleOptions.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleCard,
                  selectedStyles.includes(style.id) && styles.styleCardSelected
                ]}
                onPress={() => toggleStyle(style.id)}
              >
                <Image source={{ uri: style.image }} style={styles.styleImage} />
                <View style={styles.styleContent}>
                  <Text style={[
                    styles.styleName,
                    selectedStyles.includes(style.id) && styles.styleNameSelected
                  ]}>
                    {style.name}
                  </Text>
                  <Text style={styles.styleDescription}>
                    {style.description}
                  </Text>
                </View>
                {selectedStyles.includes(style.id) && (
                  <View style={[styles.checkmark, { backgroundColor: style.color }]}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Budget Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Range</Text>
          <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>${budget.toLocaleString()}</Text>
            <View style={styles.budgetSlider}>
              <View style={[styles.budgetFill, { width: `${(budget / 10000) * 100}%` }]} />
            </View>
            <View style={styles.budgetRange}>
              <Text style={styles.budgetMin}>$1,000</Text>
              <Text style={styles.budgetMax}>$10,000</Text>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedStyles.length > 0 ? styles.continueButtonActive : styles.continueButtonInactive
          ]}
          onPress={handleContinue}
          disabled={selectedStyles.length === 0}
        >
          <Text style={styles.continueButtonText}>
            Generate Design ({selectedStyles.length} styles selected)
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </ScrollView>
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
  },
  imagePreviewContainer: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: 150,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  imageOverlayText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  roomTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roomTypeCard: {
    flex: 1,
    minWidth: width * 0.4,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  roomTypeCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  roomTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
  },
  roomTypeTextSelected: {
    color: '#3B82F6',
  },
  styleGrid: {
    gap: 16,
  },
  styleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  styleCardSelected: {
    borderColor: '#3B82F6',
  },
  styleImage: {
    width: '100%',
    height: 120,
  },
  styleContent: {
    padding: 16,
  },
  styleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  styleNameSelected: {
    color: '#3B82F6',
  },
  styleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  budgetLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  budgetSlider: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  budgetFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  budgetRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetMin: {
    fontSize: 14,
    color: '#6B7280',
  },
  budgetMax: {
    fontSize: 14,
    color: '#6B7280',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
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