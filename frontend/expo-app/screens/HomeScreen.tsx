import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

const mockInspirations = [
  {
    id: '1',
    title: 'Modern Living Room',
    image: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Modern+Living',
    style: 'Modern',
    roomType: 'Living Room',
  },
  {
    id: '2',
    title: 'Cozy Bedroom',
    image: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Cozy+Bedroom',
    style: 'Scandinavian',
    roomType: 'Bedroom',
  },
  {
    id: '3',
    title: 'Industrial Kitchen',
    image: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Industrial+Kitchen',
    style: 'Industrial',
    roomType: 'Kitchen',
  },
];

const quickActions = [
  {
    id: '1',
    title: 'Design My Room',
    subtitle: 'Upload a photo and get started',
    icon: 'camera',
    color: '#3B82F6',
    route: 'Upload' as const,
  },
  {
    id: '2',
    title: 'Browse Styles',
    subtitle: 'Explore design inspirations',
    icon: 'color-palette',
    color: '#10B981',
    route: 'StylePicker' as const,
  },
  {
    id: '3',
    title: 'My Designs',
    subtitle: 'View your saved designs',
    icon: 'heart',
    color: '#F59E0B',
    route: 'Results' as const,
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleQuickAction = (route: string) => {
    if (route === 'Upload') {
      navigation.navigate('Upload');
    } else if (route === 'StylePicker') {
      navigation.navigate('StylePicker', { roomImage: '' });
    } else if (route === 'Results') {
      navigation.navigate('Results', { designId: 'mock-id' });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.title}>Room-in-a-Box</Text>
            <Text style={styles.subtitle}>Transform your space with AI-powered design</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="home" size={40} color="white" />
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={() => handleQuickAction(action.route)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon as any} size={24} color="white" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Design Inspirations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Design Inspirations</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {mockInspirations.map((inspiration) => (
            <TouchableOpacity key={inspiration.id} style={styles.inspirationCard}>
              <Image source={{ uri: inspiration.image }} style={styles.inspirationImage} />
              <View style={styles.inspirationContent}>
                <Text style={styles.inspirationTitle}>{inspiration.title}</Text>
                <View style={styles.inspirationTags}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{inspiration.style}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{inspiration.roomType}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Activity</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="brush" size={24} color="#3B82F6" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Designs Created</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="heart" size={24} color="#10B981" />
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="share" size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Shared</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
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
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  inspirationCard: {
    width: width * 0.7,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inspirationImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  inspirationContent: {
    padding: 16,
  },
  inspirationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inspirationTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
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
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
});