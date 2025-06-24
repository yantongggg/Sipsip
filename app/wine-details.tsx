import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

// Fixed image URL function based on your storage structure
const getWineImageUrl = (imageName: string | null, wineType?: string): string | null => {
  if (!imageName) return null;
  
  // If the imageName already includes the folder path, use it directly
  if (imageName.includes('/')) {
    const baseUrl = 'https://gcvtaawcowvtytbsnftq.supabase.co/storage/v1/object/public';
    return `${baseUrl}/wine-images/${imageName}`;
  }
  
  // Otherwise, determine folder based on wine type
  const folder = (wineType === 'white') ? 'whitewine_png' : 'redwine_png';
  const baseUrl = 'https://gcvtaawcowvtytbsnftq.supabase.co/storage/v1/object/public';
  const imageUrl = `${baseUrl}/wine-images/${folder}/${imageName}`;
  
  console.log(`Image URL for ${imageName} (${wineType}):`, imageUrl);
  return imageUrl;
};

interface WineDetails {
  id: string;
  name: string;
  winery: string | null;
  type: string;
  region: string | null;
  year: number | null; // Fixed: use 'year' not 'vintage'
  price: number | null;
  rating: number | null;
  food_pairing: string | null;
  alcohol_percentage: number | null;
  description: string | null;
  wine_image_name: string | null;
  url: string | null;
  [key: string]: any; // Allow other properties
}

export default function WineDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [wine, setWine] = useState<WineDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('=== COMPONENT MOUNTED ===');
    console.log('Wine Details mounted with ID:', id);
    console.log('ID is defined:', !!id);
    console.log('ID value:', id);
    
    if (id) {
      fetchWineDetails();
    } else {
      console.log('=== NO ID PROVIDED ===');
      setLoading(false);
      Alert.alert('Error', 'No wine ID provided');
    }
  }, [id]);

  const fetchWineDetails = async () => {
    console.log('=== STARTING FETCH ===');
    console.log('Fetching wine details for ID:', id);
    console.log('ID type:', typeof id);
    
    try {
      console.log('Making Supabase request...');
      
      const { data, error } = await supabase
        .from('wines')
        .select('*')
        .eq('id', id)
        .single();

      console.log('=== SUPABASE RESPONSE ===');
      console.log('Data:', data);
      console.log('Error:', error);
      console.log('Available columns:', data ? Object.keys(data) : 'No data');

      if (error) {
        console.error('=== ERROR DETAILS ===');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        
        Alert.alert('Error', `Failed to load wine details: ${error.message}`);
        setLoading(false);
        return;
      }

      if (!data) {
        console.log('=== NO DATA RECEIVED ===');
        Alert.alert('Error', 'No wine found with this ID');
        setLoading(false);
        return;
      }

      console.log('=== SUCCESS ===');
      console.log('Setting wine data:', data);
      setWine(data);
      
    } catch (error) {
      console.error('=== CATCH ERROR ===');
      console.error('Catch error:', error);
      Alert.alert('Error', 'Failed to load wine details');
    } finally {
      console.log('=== SETTING LOADING FALSE ===');
      setLoading(false);
    }
  };

  console.log('=== RENDER STATE ===');
  console.log('Loading:', loading);
  console.log('Wine:', wine ? 'Data exists' : 'No data');
  console.log('Wine ID:', wine?.id);
  console.log('Wine name:', wine?.name);

  if (loading) {
    console.log('=== SHOWING LOADING SCREEN ===');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading wine details...</Text>
          <Text style={styles.debugText}>ID: {id}</Text>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => {
              console.log('=== MANUAL RETRY ===');
              if (id) {
                fetchWineDetails();
              }
            }}
          >
            <Text style={styles.debugButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!wine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Wine not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const wineImageUrl = getWineImageUrl(wine.wine_image_name, wine.type);
  const fallbackImage = 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIconButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#722F37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wine Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Wine Image */}
        {wine.wine_image_name && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: wineImageUrl || fallbackImage }}
              style={styles.wineImage}
              resizeMode="cover"
              onError={(error) => {
                console.log('Image failed to load:', wineImageUrl, error.nativeEvent.error);
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', wineImageUrl);
              }}
            />
          </View>
        )}

        <View style={styles.detailsContainer}>
          <Text style={styles.wineName}>
            {wine.name || 'Unknown Wine'}
          </Text>

          {wine.type && (
            <Text style={styles.wineDetail}>
              Type: {wine.type}
            </Text>
          )}

          {wine.winery && (
            <Text style={styles.wineDetail}>
              Winery: {wine.winery}
            </Text>
          )}

          {wine.region && (
            <Text style={styles.wineDetail}>
              Region: {wine.region}
            </Text>
          )}

          {wine.year && (
            <Text style={styles.wineDetail}>
              Year: {String(wine.year)}
            </Text>
          )}

          {wine.alcohol_percentage && (
            <Text style={styles.wineDetail}>
              Alcohol: {String(wine.alcohol_percentage)}% ABV
            </Text>
          )}

          {wine.price && (
            <Text style={styles.wineDetail}>
              Price: ${String(wine.price)}
            </Text>
          )}

          {wine.rating && (
            <Text style={styles.wineDetail}>
              Rating: {String(wine.rating)}/5
            </Text>
          )}

          {wine.food_pairing && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Food Pairing</Text>
              <Text style={styles.sectionText}>{wine.food_pairing}</Text>
            </View>
          )}

          {wine.description && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>About This Wine</Text>
              <Text style={styles.sectionText}>{wine.description}</Text>
            </View>
          )}

          {wine.url && (
            <TouchableOpacity 
              style={styles.urlButton}
              onPress={() => {
                // You can add Linking.openURL(wine.url) here if needed
                console.log('URL clicked:', wine.url);
              }}
            >
              <Text style={styles.urlButtonText}>View More Details</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backIconButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#722F37',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8B5A5F',
    marginBottom: 10,
  },
  debugText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  debugButton: {
    backgroundColor: '#722F37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 20,
    color: '#722F37',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#722F37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: 'white',
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  wineImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 20,
  },
  wineName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#722F37',
    marginBottom: 16,
  },
  wineDetail: {
    fontSize: 16,
    color: '#8B5A5F',
    marginBottom: 8,
  },
  sectionContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#722F37',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  urlButton: {
    backgroundColor: '#722F37',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  urlButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});