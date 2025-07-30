import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

const { width } = Dimensions.get('window');

type ResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>;
type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

const mockProducts = [
  {
    id: '1',
    name: 'Modern L-Shaped Sectional Sofa',
    price: 1299.99,
    image: 'https://via.placeholder.com/100x100/3B82F6/FFFFFF?text=Sofa',
    store: 'Amazon',
    position: { x: 10, y: 15 },
    dimensions: { width: 84, depth: 35, height: 32 },
  },
  {
    id: '2',
    name: 'Glass Coffee Table',
    price: 299.99,
    image: 'https://via.placeholder.com/100x100/10B981/FFFFFF?text=Table',
    store: 'Wayfair',
    position: { x: 45, y: 25 },
    dimensions: { width: 48, depth: 24, height: 18 },
  },
  {
    id: '3',
    name: 'Floor Lamp with Marble Base',
    price: 189.99,
    image: 'https://via.placeholder.com/100x100/F59E0B/FFFFFF?text=Lamp',
    store: 'Target',
    position: { x: 75, y: 10 },
    dimensions: { width: 12, depth: 12, height: 65 },
  },
  {
    id: '4',
    name: 'Area Rug - Geometric Pattern',
    price: 249.99,
    image: 'https://via.placeholder.com/100x100/8B5CF6/FFFFFF?text=Rug',
    store: 'Home Depot',
    position: { x: 20, y: 20 },
    dimensions: { width: 96, depth: 60, height: 0.5 },
  },
];

const mockRoomPlan = 'https://via.placeholder.com/400x300/1F2937/FFFFFF?text=Room+Plan';

export default function ResultsScreen() {
  const navigation = useNavigation<ResultsScreenNavigationProp>();
  const route = useRoute<ResultsScreenRouteProp>();
  const { designId } = route.params;

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'plan'>('overview');
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);

  const totalCost = mockProducts.reduce((sum, product) => sum + product.price, 0);

  const toggleFavorite = (productId: string) => {
    setFavoriteProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleShare = () => {
    Alert.alert('Share Design', 'Sharing functionality would be implemented here.');
  };

  const handleSave = () => {
    Alert.alert('Save Design', 'Design saved to your favorites!');
  };

  const handleBack = () => {
    navigation.navigate('MainTabs');
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.overviewCard}>
        <Image source={{ uri: mockRoomPlan }} style={styles.roomPlanImage} />
        <View style={styles.overviewStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockProducts.length}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>${totalCost.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Cost</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Stores</Text>
          </View>
        </View>
      </View>

      <View style={styles.featuredProducts}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {mockProducts.slice(0, 3).map((product) => (
            <TouchableOpacity key={product.id} style={styles.featuredProduct}>
              <Image source={{ uri: product.image }} style={styles.featuredProductImage} />
              <Text style={styles.featuredProductName}>{product.name}</Text>
              <Text style={styles.featuredProductPrice}>${product.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderProducts = () => (
    <View style={styles.tabContent}>
      {mockProducts.map((product) => (
        <View key={product.id} style={styles.productCard}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productStore}>{product.store}</Text>
            <Text style={styles.productDimensions}>
              {product.dimensions.width}" × {product.dimensions.depth}" × {product.dimensions.height}"
            </Text>
            <Text style={styles.productPrice}>${product.price}</Text>
          </View>
          <View style={styles.productActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleFavorite(product.id)}
            >
              <Ionicons
                name={favoriteProducts.includes(product.id) ? 'heart' : 'heart-outline'}
                size={20}
                color={favoriteProducts.includes(product.id) ? '#EF4444' : '#6B7280'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyButton}>
              <Text style={styles.buyButtonText}>Buy</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderPlan = () => (
    <View style={styles.tabContent}>
      <View style={styles.planContainer}>
        <Image source={{ uri: mockRoomPlan }} style={styles.planImage} />
        <View style={styles.planOverlay}>
          {mockProducts.map((product) => (
            <View
              key={product.id}
              style={[
                styles.productMarker,
                {
                  left: `${product.position.x}%`,
                  top: `${product.position.y}%`,
                },
              ]}
            >
              <View style={styles.markerDot} />
              <View style={styles.markerLabel}>
                <Text style={styles.markerText}>{product.name.split(' ')[0]}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.planLegend}>
        <Text style={styles.legendTitle}>Product Locations</Text>
        {mockProducts.map((product) => (
          <View key={product.id} style={styles.legendItem}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>{product.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Your Design</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleSave} style={styles.headerAction}>
              <Ionicons name="bookmark-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.headerAction}>
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
            Products ({mockProducts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'plan' && styles.activeTab]}
          onPress={() => setActiveTab('plan')}
        >
          <Text style={[styles.tabText, activeTab === 'plan' && styles.activeTabText]}>
            Room Plan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'plan' && renderPlan()}
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  overviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  roomPlanImage: {
    width: '100%',
    height: 200,
  },
  overviewStats: {
    flexDirection: 'row',
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  featuredProducts: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  featuredProduct: {
    width: 120,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
  },
  featuredProductImage: {
    width: '100%',
    height: 80,
    borderRadius: 4,
    marginBottom: 8,
  },
  featuredProductName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  featuredProductPrice: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productStore: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  productDimensions: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  productActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  planContainer: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  planImage: {
    width: '100%',
    height: 300,
  },
  planOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  productMarker: {
    position: 'absolute',
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerLabel: {
    position: 'absolute',
    top: 16,
    left: -20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  markerText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  planLegend: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#6B7280',
  },
});