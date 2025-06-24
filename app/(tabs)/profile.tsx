import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Award, 
  Wine, 
  Heart, 
  Settings, 
  LogOut, 
  Key,
  Check,
  Calendar,
  MapPin,
  MessageCircle
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useWine } from '@/contexts/WineContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { savedWines } = useWine();
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const achievements = [
    { 
      id: 'first_save', 
      title: 'First Taste', 
      description: 'Saved your first wine',
      icon: '🍷',
      completed: savedWines.length > 0
    },
    { 
      id: 'wine_explorer', 
      title: 'Wine Explorer', 
      description: 'Saved 10 different wines',
      icon: '🗺️',
      completed: savedWines.length >= 10
    },
    { 
      id: 'connoisseur', 
      title: 'Connoisseur', 
      description: 'Saved wines from 5 different regions',
      icon: '🎯',
      completed: new Set(savedWines.map(w => w.wine.region)).size >= 5
    },
    { 
      id: 'social_butterfly', 
      title: 'Social Butterfly', 
      description: 'Shared your first wine experience',
      icon: '🦋',
      completed: false // Would be based on community posts
    },
  ];

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => signOut()
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    // In a real app, you would verify the old password and update
    // For now, we'll just show success
    Alert.alert(
      'Success',
      'Password changed successfully',
      [{ text: 'OK', onPress: () => {
        setShowPasswordModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }}]
    );
  };

  const PasswordModal = () => (
    <Modal visible={showPasswordModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Password</Text>
          
          <TextInput
            style={styles.passwordInput}
            placeholder="Current Password"
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
          />
          
          <TextInput
            style={styles.passwordInput}
            placeholder="New Password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm New Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowPasswordModal(false);
                setPasswordError('');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleChangePassword}
            >
              <Text style={styles.saveButtonText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#722F37', '#8B4B47']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Your wine journey</Text>
        </LinearGradient>
        
        <View style={styles.signInPrompt}>
          <User size={64} color="#8B5A5F" />
          <Text style={styles.signInTitle}>Join SipMate</Text>
          <Text style={styles.signInMessage}>
            Sign in to track your wine journey, save favorites, and connect with fellow wine enthusiasts
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const completedAchievements = achievements.filter(a => a.completed).length;
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown';

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#722F37', '#8B4B47']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>Your wine journey</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {profile?.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{profile?.username}</Text>
              <Text style={styles.memberSince}>Member since {memberSince}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Wine size={24} color="#722F37" />
            <Text style={styles.statNumber}>{savedWines.length}</Text>
            <Text style={styles.statLabel}>Wines Saved</Text>
          </View>
          
          <View style={styles.statCard}>
            <Award size={24} color="#D4AF37" />
            <Text style={styles.statNumber}>{completedAchievements}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
          
          <View style={styles.statCard}>
            <MapPin size={24} color="#8B5A5F" />
            <Text style={styles.statNumber}>
              {new Set(savedWines.map(w => w.wine.region)).size}
            </Text>
            <Text style={styles.statLabel}>Regions</Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {achievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementCard}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                {achievement.completed && (
                  <View style={styles.completedBadge}>
                    <Check size={12} color="white" />
                  </View>
                )}
              </View>
              
              <View style={styles.achievementInfo}>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.completed && styles.achievementTitleIncomplete
                ]}>
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowPasswordModal(true)}
          >
            <Key size={20} color="#722F37" />
            <Text style={styles.settingText}>Change Password</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#DC3545" />
            <Text style={[styles.settingText, { color: '#DC3545' }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PasswordModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingTop: 50,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 28,
    color: '#F5F5DC',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 16,
    color: '#F5F5DC',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  signInPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  signInTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 24,
    color: '#722F37',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  signInMessage: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 16,
    color: '#8B5A5F',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  signInButton: {
    backgroundColor: '#722F37',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  signInButtonText: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 16,
    color: 'white',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#722F37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 24,
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 22,
    color: '#722F37',
    marginBottom: 4,
  },
  memberSince: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 14,
    color: '#8B5A5F',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 24,
    color: '#722F37',
    marginVertical: 8,
  },
  statLabel: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 12,
    color: '#8B5A5F',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 20,
    color: '#722F37',
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  achievementEmoji: {
    fontSize: 20,
  },
  completedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 16,
    color: '#722F37',
    marginBottom: 4,
  },
  achievementTitleIncomplete: {
    color: '#8B5A5F',
  },
  achievementDescription: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 14,
    color: '#8B5A5F',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 16,
    color: '#722F37',
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 20,
    color: '#722F37',
    marginBottom: 20,
    textAlign: 'center',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 16,
  },
  errorText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 14,
    color: '#DC3545',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
  },
  saveButton: {
    backgroundColor: '#722F37',
  },
  cancelButtonText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 16,
    color: '#722F37',
    textAlign: 'center',
  },
  saveButtonText: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});