import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export interface FloatingToastProps {
  visible: boolean;
  title?: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose?: () => void;
}

export default function FloatingToast({
  visible,
  title,
  message,
  type = 'info',
  onClose,
}: FloatingToastProps) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 50,
          useNativeDriver: true,
          friction: 6,
          tension: 40,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  if (!visible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return { bg: '#064E3B', border: '#10B981', icon: '✅' };
      case 'warning':
        return { bg: '#78350F', border: '#F59E0B', icon: '⚠️' };
      case 'error':
        return { bg: '#7F1D1D', border: '#EF4444', icon: '🚨' };
      default:
        return { bg: '#1E1B4B', border: '#6366F1', icon: '🔔' };
    }
  };

  const styleConfig = getTypeStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: styleConfig.bg,
          borderColor: styleConfig.border,
        },
      ]}
    >
      <Text style={styles.icon}>{styleConfig.icon}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title || 'Notifikasi Mengambang'}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    width: width - 40,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 2,
  },
  message: {
    color: '#E0E7FF',
    fontSize: 13,
  },
  closeButton: {
    padding: 6,
    marginLeft: 8,
  },
  closeText: {
    color: '#A5B4FC',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
