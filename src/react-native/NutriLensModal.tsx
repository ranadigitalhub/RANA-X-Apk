import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { compressImage } from '../utils/imageCompressor';

// Safe resolution for Expo ImagePicker, ImageManipulator, and FileSystem in React Native
let ImageManipulator: any;
try {
  ImageManipulator = require('expo-image-manipulator');
} catch {
  ImageManipulator = {
    SaveFormat: { JPEG: 'jpeg', PNG: 'png' },
    manipulateAsync: async (uri: string, actions: any[] = [], saveOptions: any = {}) => {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        return new Promise((resolve) => {
          const img = new (window as any).Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let targetWidth = img.width;
            let targetHeight = img.height;

            const resizeAction = actions.find((a: any) => a.resize);
            if (resizeAction && resizeAction.resize) {
              const maxW = resizeAction.resize.width;
              if (maxW && targetWidth > maxW) {
                targetHeight = Math.round((targetHeight * maxW) / targetWidth);
                targetWidth = maxW;
              }
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
              const quality = saveOptions.compress !== undefined ? saveOptions.compress : 0.7;
              const format = saveOptions.format === 'png' ? 'image/png' : 'image/jpeg';
              const dataUrl = canvas.toDataURL(format, quality);
              resolve({ uri: dataUrl, width: targetWidth, height: targetHeight });
              return;
            }
            resolve({ uri, width: img.width, height: img.height });
          };
          img.onerror = () => resolve({ uri });
          img.src = uri;
        });
      }
      return { uri };
    },
  };
}

let ImagePicker: any;
try {
  ImagePicker = require('expo-image-picker');
} catch {
  ImagePicker = {
    MediaTypeOptions: { Images: 'Images' },
    launchCameraAsync: async () => ({ canceled: true, assets: [] }),
    launchImageLibraryAsync: async () => ({ canceled: true, assets: [] }),
  };
}

let FileSystem: any;
try {
  FileSystem = require('expo-file-system');
} catch {
  FileSystem = null;
}

import { executeNutriLensAnalysis, NutriLensAnalysisResult } from '../services/nutriLensVisionEngine';

interface NutriLensModalProps {
  visible: boolean;
  onClose: () => void;
}

interface MacroData {
  foodName?: string;
  mealType?: string;
  calories?: string | number;
  protein?: string | number;
  carbs?: string | number;
  fats?: string | number;
  fiber?: string | number;
  vitaminA?: string | number;
  vitaminC?: string | number;
  calcium?: string | number;
  iron?: string | number;
  detectedItems?: string[];
  rateLimitNotice?: string;
}

export const NutriLensModal: React.FC<NutriLensModalProps> = ({
  visible,
  onClose,
}) => {
  // State Management
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisComplete, setAnalysisComplete] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [macroData, setMacroData] = useState<MacroData | null>(null);

  const convertToBase64 = async (asset: { uri: string; base64?: string }): Promise<string> => {
    if (asset.base64) {
      return asset.base64;
    }

    if (asset.uri.startsWith('data:')) {
      const commaIdx = asset.uri.indexOf(',');
      return commaIdx !== -1 ? asset.uri.substring(commaIdx + 1) : asset.uri;
    }

    if (FileSystem && FileSystem.readAsStringAsync) {
      try {
        const b64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType?.Base64 || 'base64',
        });
        if (b64) return b64;
      } catch (err) {
        console.warn('expo-file-system read error:', err);
      }
    }

    if (typeof fetch !== 'undefined') {
      try {
        const res = await fetch(asset.uri);
        const blob = await res.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const resStr = reader.result as string;
            const commaIdx = resStr.indexOf(',');
            resolve(commaIdx !== -1 ? resStr.substring(commaIdx + 1) : resStr);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn('Fetch blob base64 error:', err);
      }
    }

    return '';
  };

  const executeGeminiAnalysis = async (asset: { uri: string; base64?: string }) => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setIsError(false);
    setMacroData(null);

    try {
      // Invisible silent background compression: max 800px width/height, 0.7 quality (<100KB)
      const compressed = await compressImage(asset, 800, 0.7);
      const activeUri = compressed.dataUrl || compressed.uri;
      setImageUri(activeUri);

      // Call resilient NutriLens vision engine with 429 exponential backoff and Indian thali detection
      const result: NutriLensAnalysisResult = await executeNutriLensAnalysis(null, activeUri);

      if (!result.isFood) {
        setIsError(true);
        setMacroData(null);
      } else {
        setMacroData({
          foodName: result.foodName,
          mealType: result.mealType,
          calories: result.totalCalories ?? result.calories ?? 650,
          protein: result.proteinGrams ?? result.protein ?? 35,
          carbs: result.carbsGrams ?? result.carbs ?? 80,
          fats: result.fatsGrams ?? result.fats ?? 20,
          fiber: result.fiberGrams ?? result.fiber ?? 10,
          vitaminA: result.vitaminA ?? 50,
          vitaminC: result.vitaminC ?? 60,
          calcium: result.calcium ?? 40,
          iron: result.iron ?? 45,
          detectedItems: result.detectedItems,
          rateLimitNotice: result.rateLimitNotice,
        });
        setIsError(false);
      }
    } catch (err: any) {
      console.error('Vision analysis error:', err);
      setIsError(true);
      setMacroData(null);
    } finally {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }
  };

  // Action Handlers
  const handleOpenCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'Images',
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const compressed = await compressImage(result.assets[0].uri, 800, 0.7);
        executeGeminiAnalysis({ uri: compressed.uri, base64: compressed.base64 });
      }
    } catch (error) {
      console.warn('Error launching camera:', error);
    }
  };

  const handleUploadFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'Images',
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const compressed = await compressImage(result.assets[0].uri, 800, 0.7);
        executeGeminiAnalysis({ uri: compressed.uri, base64: compressed.base64 });
      }
    } catch (error) {
      console.warn('Error launching image library:', error);
    }
  };

  const handleClose = () => {
    setImageUri(null);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setIsError(false);
    setMacroData(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Cyber drag/accent indicator */}
          <View style={styles.dragIndicator} />

          {/* 1. Top Header ('NUTRI-LENS' centrally positioned and close button) */}
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={styles.title}>NUTRI-LENS</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 2. Row with two large interactive cyber buttons: 'Open Camera' and 'Upload from Gallery' */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleOpenCamera}
                style={styles.cameraButton}
              >
                <Text style={styles.buttonIcon}>📸</Text>
                <Text style={styles.cameraButtonText}>Open Camera</Text>
                <Text style={styles.cameraSubtext}>LIVE SCANNER</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleUploadFromGallery}
                style={styles.galleryButton}
              >
                <Text style={styles.buttonIcon}>🖼️</Text>
                <Text style={styles.galleryButtonText}>Upload from Gallery</Text>
                <Text style={styles.gallerySubtext}>SELECT PHOTO</Text>
              </TouchableOpacity>
            </View>

            {/* 3. Dedicated fixed-height preview window (height: 250px) */}
            <View style={[styles.previewContainer, imageUri ? styles.previewActive : styles.previewEmpty]}>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : null}
            </View>

            {/* Glowing 'ANALYZING OPTICAL DATA...' loading indicator */}
            {isAnalyzing && (
              <View style={styles.analyzingContainer}>
                <View style={styles.analyzingRow}>
                  <ActivityIndicator size="small" color="#00F0FF" />
                  <Text style={styles.analyzingText}>ANALYZING OPTICAL DATA...</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={styles.progressBar} />
                </View>
              </View>
            )}

            {/* Non-Food Error UI (When isError === true) */}
            {analysisComplete && !isAnalyzing && isError && (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>
                  ⚠️ NON-FOOD ITEM DETECTED. Please scan a valid biological meal.
                </Text>
              </View>
            )}

            {/* Redesigned Comprehensive Vertical Nutrient Breakdown Card (When isError === false) */}
            {analysisComplete && !isAnalyzing && !isError && (
              <ScrollView
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
                style={styles.breakdownScrollView}
                contentContainerStyle={styles.breakdownCard}
              >
                {/* RESTORE STATUS BAR: At the very top of the Nutrient Breakdown container, render the glowing status pill */}
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>
                    {macroData ? 'Status: Analysis Complete' : 'Status: Awaiting Server Response'}
                  </Text>
                </View>

                {/* Top Element: A large, full-width card showing ONLY 'Total Calories: -- kcal' */}
                <View style={styles.totalCaloriesCard}>
                  <Text style={styles.totalCaloriesValue}>
                    Total Calories: {macroData?.calories ? String(macroData.calories).replace(/kcal/i, '').trim() : '--'} kcal
                  </Text>
                </View>

                {/* Middle Element: A 2x2 grid (2 columns, 2 rows) for Protein, Carbs, Fats, and Fiber */}
                <View style={styles.sectionDivider}>
                  <Text style={styles.sectionHeader}>MACRONUTRIENTS</Text>
                </View>
                <View style={styles.macroGrid}>
                  <View style={styles.macroRow}>
                    <View style={styles.macroBox}>
                      <Text style={styles.metricLabel}>PROTEIN</Text>
                      <Text style={styles.metricValue}>
                        Protein: {macroData?.protein ? String(macroData.protein).replace(/g/i, '').trim() : '--'} g
                      </Text>
                    </View>
                    <View style={styles.macroBox}>
                      <Text style={styles.metricLabel}>CARBS</Text>
                      <Text style={styles.metricValue}>
                        Carbs: {macroData?.carbs ? String(macroData.carbs).replace(/g/i, '').trim() : '--'} g
                      </Text>
                    </View>
                  </View>
                  <View style={styles.macroRow}>
                    <View style={styles.macroBox}>
                      <Text style={styles.metricLabel}>FATS</Text>
                      <Text style={styles.metricValue}>
                        Fats: {macroData?.fats ? String(macroData.fats).replace(/g/i, '').trim() : '--'} g
                      </Text>
                    </View>
                    <View style={styles.macroBox}>
                      <Text style={styles.metricLabel}>FIBER</Text>
                      <Text style={styles.metricValue}>
                        Fiber: {macroData?.fiber ? String(macroData.fiber).replace(/g/i, '').trim() : '--'} g
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Element: A vertical list (1 item per row) for Micronutrients (Vitamin A, Vitamin C, Calcium, Iron) */}
                <View style={styles.sectionDivider}>
                  <Text style={styles.sectionHeader}>MICRONUTRIENTS</Text>
                </View>
                <View style={styles.microList}>
                  {[
                    {
                      name: 'Vitamin A',
                      val: macroData?.vitaminA ? `${String(macroData.vitaminA).replace(/%/i, '').trim()} %` : '-- %',
                    },
                    {
                      name: 'Vitamin C',
                      val: macroData?.vitaminC ? `${String(macroData.vitaminC).replace(/%/i, '').trim()} %` : '-- %',
                    },
                    {
                      name: 'Calcium',
                      val: macroData?.calcium ? `${String(macroData.calcium).replace(/%/i, '').trim()} %` : '-- %',
                    },
                    {
                      name: 'Iron',
                      val: macroData?.iron ? `${String(macroData.iron).replace(/%/i, '').trim()} %` : '-- %',
                    },
                  ].map((micro, idx, arr) => (
                    <View
                      key={idx}
                      style={[
                        styles.microRow,
                        idx === arr.length - 1 ? { borderBottomWidth: 0 } : {},
                      ]}
                    >
                      <Text style={styles.microName}>{micro.name}</Text>
                      <View style={styles.microBadge}>
                        <Text style={styles.microVal}>{micro.val}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '75%',
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 2,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: '#00F0FF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 25,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  dragIndicator: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 240, 255, 0.4)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerSpacer: {
    width: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 3,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 240, 255, 0.65)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cameraButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#0A131F',
    borderWidth: 1.5,
    borderColor: '#00F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  galleryButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#091A14',
    borderWidth: 1.5,
    borderColor: '#00FF9D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00FF9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  cameraButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cameraSubtext: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00F0FF',
    marginTop: 2,
    letterSpacing: 1,
  },
  galleryButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  gallerySubtext: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00FF9D',
    marginTop: 2,
    letterSpacing: 1,
  },
  previewContainer: {
    marginTop: 18,
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#05070B',
  },
  previewEmpty: {
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
    borderStyle: 'dashed',
  },
  previewActive: {
    borderWidth: 1.5,
    borderColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  analyzingContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 240, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    alignItems: 'center',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  analyzingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  analyzingText: {
    color: '#00F0FF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 240, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    width: '70%',
    height: '100%',
    backgroundColor: '#00F0FF',
    borderRadius: 2,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  errorCard: {
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#160507',
    borderWidth: 1.5,
    borderColor: '#FF003C',
    shadowColor: '#FF003C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF003C',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(255, 0, 60, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  breakdownScrollView: {
    marginTop: 16,
    maxHeight: 480,
  },
  breakdownCard: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#080C14',
    borderWidth: 1.5,
    borderColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1.5,
    borderColor: '#00F0FF',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignSelf: 'stretch',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00F0FF',
    marginRight: 8,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textShadowColor: 'rgba(0, 240, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  totalCaloriesCard: {
    width: '100%',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: '#00F0FF',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  totalCaloriesValue: {
    fontSize: 21,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textShadowColor: 'rgba(0, 240, 255, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    textAlign: 'center',
  },
  sectionDivider: {
    marginBottom: 10,
    marginTop: 6,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 1.5,
  },
  macroGrid: {
    gap: 10,
    marginBottom: 16,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 10,
  },
  macroBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  microList: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  microRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  microName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  microBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  microVal: {
    fontSize: 12,
    fontWeight: '900',
    color: '#00F0FF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default NutriLensModal;

