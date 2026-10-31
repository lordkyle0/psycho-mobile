import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { radii } from '@/theme';

type Props = {
  label: string;
  focused?: boolean;
  color?: string;
  activeBackground?: string;
};

export function TabIcon({
  label,
  focused = false,
  color,
  activeBackground = '#EBF0FF',
}: Props) {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      damping: 14,
      stiffness: 190,
      mass: 0.7,
      useNativeDriver: false,
    }).start();
  }, [focused, progress]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          backgroundColor: progress.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(0,0,0,0)', activeBackground],
          }),
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.92, 1.12],
              }),
            },
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -3],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={[styles.label, color ? { color } : undefined]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 18 },
});
