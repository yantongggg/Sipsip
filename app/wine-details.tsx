import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Heart, 
  MapPin, 
  Calendar, 
  Wine, 
  Star,
  Plus,
  DollarSign,
  Utensils,
  ExternalLink,
  Building
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useWine } from '@/contexts/WineContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, getWineImageUrl } from '@/lib/supabase';
import SaveWineModal from '@/components/SaveWineModal';

interface WineDetails {
  id: string;
  name: string;
  winery: string | null;
  type: string;
  region: string | null;
  year: number | null;
  price: number | null;
  rating: number | null;
  food_pairing: string | null;
  alcohol_percentage: number | null;
  description: string | null;
  wine_image_name: string | null;
  url: string | null;
  created_at: string;
}

export default function WineDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { isWineSaved, savedWines } = useWine();
  const [wine, setWine] = useState<WineDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const isSaved = wine ? isWineSaved(wine.id) : false;
  const savedWineData = savedWines.find(sw => sw.wine_id === wine?.id);

  useEffect(() => {
    if (id) {
      fetchWineDetails();
    }
  }, [id]);

  const fetchWineDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('wines')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching wine details:', error);
        Alert.alert('Error', 'Failed to load wine details');
        router.back();
        return;
      }

      setWine(data);
    } catch (error) {
      console.error('Error fetching wine details:', error);
      Alert.alert('Error', 'Failed to load wine details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    setShowSaveModal(true);
  };

  const handleOpenUrl = async () => {
    if (wine?.url) {
      try {
        await Linking.openURL(wine.url);
      } catch (error) {
        Alert.alert('Error', 'Could not open URL');
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'red': return '#722F37';
      case 'white': return '#F5F5DC';
      case 'rosé': return '#FFC0CB';
      case 'sparkling': return '#E6E6FA';
      case 'dessert': return '#D4AF37';
      default: return '#722F37';
    }
  };

  const renderStars = (rating: number | null) => {
    if (typeof rating !== 'number' || isNaN(rating)) return null;

    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color="#D4AF37"
            fill={star <= rating ? '#D4AF37' : 'none'}
          />
        ))}
        <Text style={styles.ratingText}>
          ({rating.toFixed(1)}/5)
        </Text>
      </View>
    );
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading wine details...</Text>
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

  const wineImageUrl = getWineImageUrl(wine.wine_image_name);
  const fallbackImage = 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: wineImageUrl || fallbackImage }}
            style={styles.wineImage}
            resizeMode="cover"
          />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />

          <TouchableOpacity
            style={styles.backIconButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveIconButton}
            onPress={handleSave}
          >
            <Heart
              size={24}
              color={isSaved ? '#D4AF37' : 'white'}
              fill={isSaved ? '#D4AF37' : 'none'}
            />
          </TouchableOpacity>
        </View>

        {/* Wine Details */}
        <View style={styles.detailsContainer}>
          <View
            style={[
              styles.typeTag,
              { backgroundColor: getTypeColor(wine.type) }
            ]}
          >
            <Text style={[
              styles.typeText,
              { color: wine.type === 'white' ? '#722F37' : 'white' }
            ]}>
              {wine.type}
            </Text>
          </View>

          <Text style={styles.wineName}>{wine.name}</Text>

          {wine.winery && (
            <View style={styles.wineryRow}>
              <Building size={16} color="#8B5A5F" />
              <Text style={styles.wineryText}>{wine.winery}</Text>
            </View>
          )}

          <View style={styles.wineMetadata}>
            {wine.region && (
              <View style={styles.metadataRow}>
                <MapPin size={16} color="#8B5A5F" />
                <Text style={styles.metadataText}>{wine.region}</Text>
              </View>
            )}
            
            {wine.year && (
              <View style={styles.metadataRow}>
                <Calendar size={16} color="#8B5A5F" />
                <Text style={styles.metadataText}>{wine.year}</Text>
              </View>
            )}
            
            {wine.alcohol_percentage && (
              <View style={styles.metadataRow}>
                <Wine size={16} color="#8B5A5F" />
                <Text style={styles.metadataText}>{wine.alcohol_percentage}% ABV</Text>
              </View>
            )}

            {wine.price && (
              <View style={styles.metadataRow}>
                <DollarSign size={16} color="#8B5A5F" />
                <Text style={styles.metadataText}>${wine.price}</Text>
              </View>
            )}
          </View>

          {wine.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Overall Rating:</Text>
              {renderStars(wine.rating)}
            </View>
          )}

          {/* Food Pairing */}
          {wine.food_pairing && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Utensils size={20} color="#722F37" />
                <Text style={styles.sectionTitle}>Food Pairing</Text>
              </View>
              <Text style={styles.sectionText}>{wine.food_pairing}</Text>
            </View>
          )}

          {/* Saved Wine Info */}
          {isSaved && savedWineData && (
            <View style={styles.savedInfoContainer}>
              <Text style={styles.savedInfoTitle}>Your Notes</Text>
              
              {savedWineData.rating && (
                <View style={styles.savedInfoRow}>
                  <Text style={styles.savedInfoLabel}>Your Rating:</Text>
                  <View style={styles.userStarsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        color="#D4AF37"
                        fill={star <= savedWineData.rating! ? '#D4AF37' : 'none'}
                      />
                    ))}
                  </View>
                </View>
              )}
              
              {savedWineData.date_tried && (
                <View style={styles.savedInfoRow}>
                  <Text style={styles.savedInfoLabel}>Date Tried:</Text>
                  <Text style={styles.savedInfoValue}>
                    {new Date(savedWineData.date_tried).toLocaleDateString()}
                  </Text>
                </View>
              )}
              
              {savedWineData.location && (
                <View style={styles.savedInfoRow}>
                  <Text style={styles.savedInfoLabel}>Location:</Text>
                  <Text style={styles.savedInfoValue}>{savedWineData.location}</Text>
                </View>
              )}
              
              {savedWineData.user_notes && (
                <View style={styles.savedInfoRow}>
                  <Text style={styles.savedInfoLabel}>Your Notes:</Text>
                  <Text style={styles.savedInfoDescription}>
                    {savedWineData.user_notes}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Description */}
          {wine.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>About This Wine</Text>
              <Text style={styles.descriptionText}>{wine.description}</Text>
            </View>
          )}

          {/* External URL */}
          {wine.url && (
            <TouchableOpacity style={styles.urlButton} onPress={handleOpenUrl}>
              <ExternalLink size={20} color="#722F37" />
              <Text style={styles.urlButtonText}>View More Details</Text>
            </TouchableOpacity>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              isSaved ? styles.updateButton : styles.saveButton
            ]}
            onPress={handleSave}
          >
            {isSaved ? (
              <>
                <Star size={20} color="white" />
                <Text style={styles.actionButtonText}>Update Notes</Text>
              </>
            ) : (
              <>
                <Plus size={20} color="white" />
                <Text style={styles.actionButtonText}>Save to Library</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {wine && (
        <SaveWineModal
          visible={showSaveModal}
          wine={wine}
          existingData={savedWineData}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
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
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 16,
    color: '#8B5A5F',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontFamily: 'PlayfairDisplay-Bold',
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
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 16,
    color: 'white',
  },
  imageContainer: {
    position: 'relative',
    height: 400,
  },
  wineImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backIconButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  saveIconButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#F5F5DC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  typeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  typeText: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  wineName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 28,
    color: '#722F37',
    marginBottom: 8,
    lineHeight: 36,
  },
  wineryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  wineryText: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontSize: 18,
    color: '#8B5A5F',
    marginLeft: 8,
  },
  wineMetadata: {
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metadataText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 16,
    color: '#8B5A5F',
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingLabel: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 16,
    color: '#722F37',
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 14,
    color: '#8B5A5F',
    marginLeft: 8,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 18,
    color: '#722F37',
    marginLeft: 8,
  },
  sectionText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  savedInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  savedInfoTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 18,
    color: '#722F37',
    marginBottom: 12,
  },
  savedInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  savedInfoLabel: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 14,
    color: '#722F37',
    marginRight: 8,
    minWidth: 80,
  },
  savedInfoValue: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 14,
    color: '#8B5A5F',
    flex: 1,
  },
  savedInfoDescription: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  userStarsContainer: {
    flexDirection: 'row',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 20,
    color: '#722F37',
    marginBottom: 12,
  },
  descriptionText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  urlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#722F37',
  },
  urlButtonText: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 16,
    color: '#722F37',
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButton: {
    backgroundColor: '#722F37',
  },
  updateButton: {
    backgroundColor: '#D4AF37',
  },
  actionButtonText: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 18,
    color: 'white',
    marginLeft: 8,
  },
});