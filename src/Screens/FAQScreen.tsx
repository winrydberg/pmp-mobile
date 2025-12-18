import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const FAQScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleLoadEnd = () => {
    setLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const retry = () => {
    setError(false);
    setLoading(true);
  };

  const renderHeader = () => (
    <View style={styles.headerCard}>
      <LinearGradient
        colors={['#4A90C4', '#34B87C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerIconContainer}>
          <Feather name="help-circle" size={24} color="white" />
        </View>
        <Text style={styles.headerTitle}>FAQ</Text>
        <Text style={styles.headerSubtitle}>
          Frequently Asked Questions
        </Text>
      </LinearGradient>
    </View>
  );

  if (error) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Feather name="wifi-off" size={64} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorSubtitle}>
            Unable to load the FAQ page.{'\n'}
            Please check your internet connection.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <LinearGradient
              colors={['#4A90C4', '#34B87C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.retryButtonGradient}
            >
              <Feather name="refresh-cw" size={18} color="white" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.webViewContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90C4" />
            <Text style={styles.loadingText}>Loading FAQ...</Text>
          </View>
        )}
        <Animated.View style={[styles.webView, { opacity: fadeAnim }]}>
          <WebView
            source={{ uri: 'https://buypowergh.com/frequently-asked-questions/' }}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={true}
            style={styles.webView}
          />
        </Animated.View>
      </View>
    </View>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerCard: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    zIndex: 10,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: 'white',
    // margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 0,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});
