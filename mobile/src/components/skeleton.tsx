import { useEffect, useRef } from 'react';
import { Animated, type DimensionValue, StyleSheet, View, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Skeleton({
  height = 16,
  width = '100%',
  style,
}: {
  height?: number;
  width?: DimensionValue;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.85, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { height, width, borderRadius: 8, backgroundColor: theme.backgroundElement, opacity },
        style,
      ]}
    />
  );
}

export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={12} width="40%" />
      <Skeleton height={22} width="80%" />
      <Skeleton height={12} width="100%" />
      <Skeleton height={12} width="55%" />
    </View>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
    backgroundColor: 'rgba(128,128,128,0.06)',
  },
});
