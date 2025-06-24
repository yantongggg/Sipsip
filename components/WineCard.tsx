import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useWine } from '@/contexts/WineContext';

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
  
  return imageUrl;
};

type Wine = {
  id: string;
  name: string;
  type: string;
  winery?: string;
  region?: string;
  year?: number;
  price?: number;
  rating?: number;
  wine_image_name?: string;
};

interface WineCardProps {
  wine: Wine;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 40) / 2;

export default function WineCard({ wine }: WineCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isWineSaved, saveWine, unsaveWine, refreshSavedWines } = useWine();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Check if wine is saved when component mounts or wine changes
  useEffect(() => {
    if (user && wine.id) {
      const savedStatus = isWineSaved(wine.id);
      setIsSaved(savedStatus);
      console.log(`Wine ${wine.name} is saved:`, savedStatus);
    } else {
      setIsSaved(false);
    }
  }, [wine.id, user, isWineSaved]);

  const handlePress = () => {
    console.log('Wine card pressed:', wine.id);
    router.push({
      pathname: '/wine-details',
      params: { id: wine.id }
    });
  };

  const handleSave = async () => {
    console.log('=== SAVE BUTTON PRESSED ===');
    console.log('Wine:', wine.name);
    console.log('User:', user?.id);
    console.log('Currently saved:', isSaved);

    if (!user) {
      console.log('No user logged in, redirecting to auth');
      Alert.alert(
        'Sign In Required',
        'Please sign in to save wines to your library',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth') }
        ]
      );
      return;
    }

    setSaving(true);

    try {
      if (isSaved) {
        // Unsave the wine
        console.log('Unsaving wine...');
        const result = await unsaveWine(wine.id);
        
        if (result.error) {
          console.error('Unsave error:', result.error);
          Alert.alert('Error', 'Failed to remove wine from library');
        } else {
          console.log('Wine unsaved successfully');
          setIsSaved(false);
          await refreshSavedWines(); // Refresh the library
        }
      } else {
        // Save the wine with basic data
        console.log('Saving wine...');
        const saveData = {
          wine_id: wine.id,
          rating: null,
          date_tried: null,
          location: null,
          user_notes: null,
        };

        const result = await saveWine(saveData);
        
        if (result.error) {
          console.error('Save error:', result.error);
          Alert.alert('Error', 'Failed to save wine to library');
        } else {
          console.log('Wine saved successfully');
          setIsSaved(true);
          await refreshSavedWines(); // Refresh the library
        }
      }
    } catch (error) {
      console.error('Save/unsave catch error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const wineImageUrl = getWineImageUrl(wine.wine_image_name, wine.type);
  const fallbackImage = 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg';

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress} style={styles.card}>
        <Image
          source={{ 
            uri: wineImageUrl || fallbackImage
          }}
          style={styles.image}
          resizeMode="cover"
          onError={() => console.log('Image failed to load:', wineImageUrl)}
        />
        
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>
            {wine.name || 'Unknown Wine'}
          </Text>
          
          {wine.winery && (
            <Text style={styles.winery} numberOfLines={1}>
              {wine.winery}
            </Text>
          )}
          
          {wine.region && (
            <Text style={styles.region} numberOfLines={1}>
              {wine.region}
            </Text>
          )}
          
          <View style={styles.bottomRow}>
            <View style={styles.leftInfo}>
              {wine.year && (
                <Text style={styles.year}>{wine.year.toString()}</Text>
              )}
              
              {wine.price && (
                <Text style={styles.price}>
                  ${wine.price.toString()}
                </Text>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                isSaved && styles.saveButtonActive,
                saving && styles.saveButtonSaving
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              <Heart
                size={16}
                color={isSaved ? '#fff' : '#D4AF37'}
                fill={isSaved ? '#fff' : 'none'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginBottom: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#722F37',
    lineHeight: 20,
  },
  winery: {
    fontSize: 14,
    color: '#8B5A5F',
    marginBottom: 2,
    fontStyle: 'italic',
  },
  region: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftInfo: {
    flex: 1,
  },
  year: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  saveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  saveButtonSaving: {
    opacity: 0.6,
  },
});