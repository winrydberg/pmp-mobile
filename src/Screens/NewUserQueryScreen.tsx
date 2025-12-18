// src/Screens/NewUserQueryScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { submitUserQuery } from '../services/UserService';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const NewUserQueryScreen = ({ navigation }: any) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [subjectFocused, setSubjectFocused] = useState(false);
  const [messageFocused, setMessageFocused] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please fill in both subject and message fields',
        position: 'bottom',
      });
      return;
    }

    setLoading(true);
    const res = await submitUserQuery({ subject, message });
    setLoading(false);

    if (res.status === 'success') {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: res.message || 'Your query has been submitted successfully',
        position: 'bottom',
      });
      setSubject('');
      setMessage('');
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: res.message || 'Failed to submit query. Please try again.',
        position: 'bottom',
      });
    }
  };

  const characterCount = message.length;
  const maxCharacters = 500;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header Card */}
          <View style={styles.headerCard}>
            <LinearGradient
              colors={['#4A90C4', '#34B87C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerIconContainer}>
                <Feather name="message-circle" size={32} color="white" />
              </View>
              <Text style={styles.headerTitle}>Contact Support</Text>
              <Text style={styles.headerSubtitle}>
                We're here to help! Send us your query and we'll get back to you soon.
              </Text>
            </LinearGradient>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Subject Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject</Text>
              <View style={[
                styles.inputContainer,
                subjectFocused && styles.inputContainerFocused
              ]}>
                <Feather name="edit-3" size={18} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Brief description of your query"
                  placeholderTextColor="#9CA3AF"
                  value={subject}
                  onChangeText={setSubject}
                  onFocus={() => setSubjectFocused(true)}
                  onBlur={() => setSubjectFocused(false)}
                />
              </View>
            </View>

            {/* Message Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Message</Text>
                <Text style={[
                  styles.charCount,
                  characterCount > maxCharacters && styles.charCountError
                ]}>
                  {characterCount}/{maxCharacters}
                </Text>
              </View>
              <View style={[
                styles.textAreaContainer,
                messageFocused && styles.inputContainerFocused
              ]}>
                <Feather
                  name="file-text"
                  size={18}
                  color="#6B7280"
                  style={styles.textAreaIcon}
                />
                <TextInput
                  style={styles.textArea}
                  placeholder="Describe your issue or question in detail..."
                  placeholderTextColor="#9CA3AF"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  maxLength={maxCharacters}
                  onFocus={() => setMessageFocused(true)}
                  onBlur={() => setMessageFocused(false)}
                />
              </View>
              <View style={styles.helperContainer}>
                <Feather name="info" size={14} color="#6B7280" />
                <Text style={styles.helperText}>
                  Be as detailed as possible to help us assist you better
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Feather name="x" size={18} color="#6B7280" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? ['#9CA3AF', '#6B7280'] : ['#4A90C4', '#34B87C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Feather name="send" size={18} color="white" />
                      <Text style={styles.submitButtonText}>Submit Query</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Feather name="clock" size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                Response time: Within 24-48 hours
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Feather name="mail" size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                You'll receive updates via email
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default NewUserQueryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 10,
  },
  headerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 0.5,
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 0.5,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  charCountError: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 50,
  },
  inputContainerFocused: {
    borderColor: '#4A90C4',
    backgroundColor: '#F0F9FF',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingLeft: 8,
    paddingVertical: 0,
  },
  textAreaContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    minHeight: 120,
  },
  textAreaIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 0.5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 0.5,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
});
