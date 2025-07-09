import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SvgIcon } from './SvgIcon';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  image?: any;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to BRN',
    subtitle: 'The Burning Social Network',
    description: 'Join the community where content burns bright and tokens fuel your journey.',
    icon: 'home',
  },
  {
    id: 'earn',
    title: 'Earn BRN Tokens',
    subtitle: 'Engage & Get Rewarded',
    description: 'Like, comment, and share to earn BRN tokens. Complete quests for bonus rewards.',
    icon: 'wallet',
  },
  {
    id: 'scan',
    title: 'Scan & Discover',
    subtitle: 'QR Codes Everywhere',
    description: 'Scan QR codes on products and locations to earn tokens and unlock exclusive content.',
    icon: 'scan',
  },
  {
    id: 'connect',
    title: 'Connect with Friends',
    subtitle: 'Verified Connections',
    description: 'Cross-share QR codes with friends to build your verified network.',
    icon: 'profile',
  },
  {
    id: 'marketplace',
    title: 'Trade & Collect',
    subtitle: 'BRN Marketplace',
    description: 'Use your tokens to buy NFTs, rewards, and exclusive items in the marketplace.',
    icon: 'marketplace',
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip }) => {
  const { theme, themeMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({
        x: (currentStep + 1) * screenWidth,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({
        x: (currentStep - 1) * screenWidth,
        animated: true,
      });
    }
  };

  const renderStep = (step: OnboardingStep, index: number) => (
    <View key={step.id} style={[styles.stepContainer, { width: screenWidth }]}>
      <View style={styles.stepContent}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: theme.surfaceVariant }]}>
          <SvgIcon 
            name={step.icon} 
            size={80} 
            color={theme.primary}
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.text }]}>
          {step.title}
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: theme.primary }]}>
          {step.subtitle}
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {step.description}
        </Text>

        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          {onboardingSteps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor: i === index ? theme.primary : theme.divider,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: theme.textSecondary }]}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setCurrentStep(newIndex);
        }}
        style={styles.scrollView}
      >
        {onboardingSteps.map((step, index) => renderStep(step, index))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {currentStep > 0 && (
            <TouchableOpacity
              onPress={prevStep}
              style={[styles.navButton, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.navButtonText, { color: theme.text }]}>
                Previous
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={nextStep}
            style={[styles.nextButton, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.nextButtonText, { color: theme.onPrimary }]}>
              {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Step Counter */}
        <Text style={[styles.stepCounter, { color: theme.textSecondary }]}>
          {currentStep + 1} of {onboardingSteps.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  stepContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepCounter: {
    textAlign: 'center',
    fontSize: 14,
  },
}); 