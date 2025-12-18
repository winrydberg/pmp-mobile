import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface UserAvatarProps {
  firstName: string;
  lastName: string;
  size?: number;
  style?: ViewStyle;
}

// Function to generate a consistent color from a string
const generateColorFromName = (name: string): string => {
  // Create a hash from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Define a set of vibrant, professional colors
  const colors = [
    '#4A90C4', // Blue
    '#34B87C', // Green
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#6366F1', // Indigo
    '#F97316', // Orange
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#A855F7', // Purple
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#F43F5E', // Rose
    '#84CC16', // Lime
  ];

  // Use hash to pick a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Function to get initials from first and last name
const getInitials = (firstName: string, lastName: string): string => {
  const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
  const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
  return `${firstInitial}${lastInitial}`;
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  firstName,
  lastName,
  size = 50,
  style,
}) => {
  const initials = getInitials(firstName, lastName);
  const backgroundColor = generateColorFromName(`${firstName} ${lastName}`);
  const fontSize = size * 0.4; // Font size is 40% of avatar size

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default UserAvatar;

