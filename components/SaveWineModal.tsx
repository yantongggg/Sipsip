import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { X, Star, Calendar, MapPin, FileText } from 'lucide-react-native';
import { useWine } from '@/contexts/WineContext';
import DatePicker from './DatePicker';

interface Wine {
  id: string;
  name: string;
  type: string;
  region: string | null;
  winery?: string | null;
}

interface SavedWineData {
  rating?: number | null;
  date_tried?: string | null;
  location?: string | null;
  user_notes?: string | null;
}

interface SaveWineModalProps {
  visible: boolean;
  wine: Wine;
  existingData?: SavedWineData | null;
  onClose: () => void;
}

export default function SaveWineModal({ 
  visible, 
  wine, 
  existingData, 
  onClose 
}: SaveWineModalProps) {
  const { saveWine } = useWine();
  const [rating, setRating] = useState<number>(0);
  const [date, setDate] = useState<Date>(new Date());
  const [location, setLocation] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      // Reset or populate form with existing data
      if (existingData) {
        setRating(existingData.rating || 0);
        setDate(existingData.date_tried ? new Date(existingData.date_tried) : new Date());
        setLocation(existingData.location || '');
        setUserNotes(existingData.user_notes || '');
      } else {
        setRating(0);
        setDate(new Date());
        setLocation('');
        setUserNotes('');
      }
    }
  }, [visible, existingData]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await saveWine(wine.id, {
        rating: rating > 0 ? rating : undefined,
        date_tried: date.toISOString().split('T')[0],
        location: location.trim() || undefined,
        user_notes: userNotes.trim() || undefined,
      });

      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert(
          'Success',
          existingData ? 'Wine notes updated successfully!' : 'Wine saved to your library!',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save wine');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star === rating ? 0 : star)}
            style={styles.starButton}
          >
            <Star
              size={32}
              color="#D4AF37"
              fill={star <= rating ? '#D4AF37' : 'none'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const buildWineDetailsText = () => {
    const parts = [wine.type];
    if (wine.region) parts.push(wine.region);
    if (wine.winery) parts.push(wine.winery);
    return parts.join(' • ');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {existingData ? 'Update Wine Notes' : 'Save Wine'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#722F37" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Wine Info */}
            <View style={styles.wineInfo}>
              <Text style={styles.wineName}>{wine.name}</Text>
              {[wine.type, wine.region, wine.winery].filter(Boolean).length > 0 && (
              <Text style={styles.wineDetails}>
                {[wine.type, wine.region, wine.winery].filter(Boolean).join(' • ')}
              </Text>
            )}
            </View>

            {/* Rating */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Star size={20} color="#722F37" />
                <Text style={styles.sectionTitle}>Your Rating</Text>
              </View>
              {renderStars()}
              <Text style={styles.ratingText}>
                {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'No rating'}
              </Text>
            </View>

            {/* Date */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color="#722F37" />
                <Text style={styles.sectionTitle}>Date Tried</Text>
              </View>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MapPin size={20} color="#722F37" />
                <Text style={styles.sectionTitle}>Location</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={location}
                onChangeText={setLocation}
                placeholder="Where did you try this wine?"
                placeholderTextColor="#8B5A5F"
                maxLength={100}
              />
            </View>

            {/* User Notes */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FileText size={20} color="#722F37" />
                <Text style={styles.sectionTitle}>Your Tasting Notes</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={userNotes}
                onChangeText={setUserNotes}
                placeholder="Share your thoughts about this wine..."
                placeholderTextColor="#8B5A5F"
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {userNotes.length}/500
              </Text>
            </View>
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading 
                ? 'Saving...' 
                : (existingData ? 'Update Notes' : 'Save to Library')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <DatePicker
        visible={showDatePicker}
        date={date}
        onDateChange={setDate}
        onClose={() => setShowDatePicker(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 24,
    color: '#722F37',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  wineInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  wineName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 18,
    color: '#722F37',
    marginBottom: 4,
  },
  wineDetails: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 14,
    color: '#8B5A5F',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 16,
    color: '#722F37',
    marginLeft: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  ratingText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 14,
    color: '#8B5A5F',
    textAlign: 'center',
  },
  dateButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  dateButtonText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 16,
    color: '#722F37',
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    marginBottom: 8,
  },
  characterCount: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 12,
    color: '#8B5A5F',
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: '#722F37',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
});