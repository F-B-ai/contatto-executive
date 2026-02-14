import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, SIZES, TYPOGRAPHY } from '../../constants/theme';

type AvatarSize = 'small' | 'medium' | 'large';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: AvatarSize;
  backgroundColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'medium',
  backgroundColor = COLORS.primary,
}) => {
  const sizeMap = {
    small: SIZES.avatarSmall,
    medium: SIZES.avatarMedium,
    large: SIZES.avatarLarge,
  };

  const fontSizeMap = {
    small: 12,
    medium: 18,
    large: 24,
  };

  const avatarSize = sizeMap[size];
  const fontSize = fontSizeMap[size];

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>
        {name ? getInitials(name) : '?'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: COLORS.gray200,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
