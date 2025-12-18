import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Animated,
  RefreshControl
} from 'react-native';
import { getUserQueries, UserQuery } from '../services/UserService';
import { SecondaryBtn } from '../components/SecondaryBtn.tsx';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const HelpScreen = ({ navigation }: any) => {
  const [queries, setQueries] = useState<UserQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const fetchQueries = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const res = await getUserQueries();

    if (isRefresh) {
      setRefreshing(false);
    } else {
      setLoading(false);
    }

    if (res.status === 'success') {
      setQueries(res.data);
    } else {
      Alert.alert('Error', res.message);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => fetchQueries());

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

    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    fetchQueries(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#F59E0B';
      case 'resolved':
      case 'completed':
        return '#34B87C';
      case 'in progress':
      case 'processing':
        return '#4A90C4';
      case 'closed':
        return '#6B7280';
      default:
        return '#9CA3AF';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'clock';
      case 'resolved':
      case 'completed':
        return 'check-circle';
      case 'in progress':
      case 'processing':
        return 'refresh-cw';
      case 'closed':
        return 'x-circle';
      default:
        return 'help-circle';
    }
  };

  const renderItem = ({ item }: { item: UserQuery }) => (
    <View style={styles.queryCard}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Feather name="file-text" size={20} color="#4A90C4" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.ticketNo}>#{item.ticketNo}</Text>
            <Text style={styles.date}>
              {item.created_at
                ? new Date(item.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
                : 'No date'}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.Status) + '20' },
          ]}
        >
          <Feather
            name={getStatusIcon(item.Status)}
            size={14}
            color={getStatusColor(item.Status)}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.Status) },
            ]}
          >
            {item.Status}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.subject} numberOfLines={2}>
          {item.Title}
        </Text>
        <Text style={styles.message} numberOfLines={3}>
          {item.Message}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.phoneContainer}>
          <Feather name="phone" size={14} color="#6B7280" />
          <Text style={styles.phone}>{item.PhoneNumber}</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.emptyIconContainer}>
        <Feather name="inbox" size={64} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>No Queries Yet</Text>
      <Text style={styles.emptySubtitle}>
        You haven't submitted any support queries.{'\n'}
        Tap the button below to get started.
      </Text>
    </Animated.View>
  );

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.headerCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <LinearGradient
        colors={['#4A90C4', '#34B87C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerIconContainer}>
          <Feather name="headphones" size={24} color="white" />
        </View>
        <Text style={styles.headerTitle}>Support Center</Text>
        <Text style={styles.headerSubtitle}>
          Track your queries and get help
        </Text>
      </LinearGradient>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4A90C4" />
          <Text style={styles.loadingText}>Loading your queries...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={queries}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A90C4']}
            tintColor="#4A90C4"
          />
        }
      />

      <View style={styles.fixedButton}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('NewUserQueryScreen')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4A90C4', '#34B87C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <Feather name="plus-circle" size={20} color="white" />
            <Text style={styles.addButtonText}>Submit New Query</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HelpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerCard: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 1,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
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
  },
  queryCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 0.5,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90C4',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  ticketNo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 12,
  },
  subject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phone: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  fixedButton: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});
