import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MapPin, Calendar, Star, DollarSign } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWine } from '@/contexts/WineContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Database, getWineImageUrl } from '@/lib/supabase';

type Wine = Database['public']['Tables']['wines']['Row'];

interface WineCardProps {
  wine: Wine;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 40) / 2;

export default function WineCard({ wine }: WineCardProps) {
  const router = useRouter();
  const { isWineSaved } = useWine();
  const { requireAuth } = useAuthGuard();
  const isSaved = isWineSaved(wine.id);

  const handlePress = () => {
    router.push({
      pathname: '/wine-details',
      params: { id: wine.id }
    });
  };

  const handleSave = () => {
    requireAuth(() => {
      // This will be handled by SaveWineModal
      console.log('Save wine:', wine.id);
    });
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
            size={10}
            color="#D4AF37"
            fill={star <= rating ? '#D4AF37' : 'none'}
          />
        ))}
        <Text style={{ marginLeft: 4, fontSize: 12 }}>
          ({Number(rating).toFixed(1)}/5)
        </Text>
      </View>
    );
  };



  const wineImageUrl = getWineImageUrl(wine.wine_image_name);
  const fallbackImage = 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg';

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{ uri: wineImageUrl || fallbackImage }}
          style={styles.image}
          resizeMode="cover"
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />

        <TouchableOpacity
          style={styles.heartButton}
          onPress={handleSave}
        >
          <Heart
            size={18}
            color={isSaved ? '#D4AF37' : 'white'}
            fill={isSaved ? '#D4AF37' : 'none'}
          />
        </TouchableOpacity>

        <View style={styles.content}>
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

          <Text style={styles.name} numberOfLines={2}>
            {wine.name}
          </Text>
          
          {wine.winery && (
            <Text style={styles.winery} numberOfLines={1}>
              {wine.winery}
            </Text>
          )}
          
          {wine.region && (
            <View style={styles.locationRow}>
              <MapPin size={10} color="#F5F5DC" />
              <Text style={styles.region} numberOfLines={1}>
                {wine.region}
              </Text>
            </View>
          )}
          
          <View style={styles.bottomRow}>
            {wine.year && (
              <View style={styles.yearRow}>
                <Calendar size={10} color="#F5F5DC" />
                <Text style={styles.year}>{wine.year}</Text>
              </View>
            )}
            
            {wine.price && (
              <View style={styles.priceRow}>
                <DollarSign size={10} color="#D4AF37" />
                <Text style={styles.price}>${wine.price}</Text>
              </View>
            )}
          </View>

          {wine.rating && renderStars(wine.rating)}
        </View>
      </View>
    </TouchableOpacity>
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
    height: 200,
  },
  gradient: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    height: 80,
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  typeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  typeText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  name: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 13,
    color: 'white',
    marginBottom: 2,
    lineHeight: 16,
  },
  winery: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontSize: 11,
    color: '#F5F5DC',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  region: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 10,
    color: '#F5F5DC',
    marginLeft: 4,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  year: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 10,
    color: '#F5F5DC',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 10,
    color: '#D4AF37',
    marginLeft: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});