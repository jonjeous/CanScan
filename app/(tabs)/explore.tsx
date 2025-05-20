import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

const getWasteGuidelines = (wasteClass) => {
  const normalizedClass = wasteClass.toLowerCase();

  const guidelines = {
    biodegradable: {
      disposal: [
        '• Use compost bins for food scraps, leaves, and garden waste',
        '• Keep separate from plastics, glass, and other non-organics',
      ],
      impact: 'If not composted, biodegradable waste ends up in landfills where it breaks down without oxygen, producing methane — a greenhouse gas over 20 times more harmful than carbon dioxide..',
      biodegradability: 'High',
    },
    cardboard: {
      disposal: [
        '• Remove all tape or plastic before flattening and recycling',
        '• Keep dry — wet cardboard is often unrecyclablel',
      ],
      impact: 'When discarded improperly, cardboard contributes to deforestation, wasted energy, and landfill overflow, especially when contaminated with food or liquids.',
      biodegradability: 'Medium',
    },
    cloth: {
      disposal: [
        '• Donate clean clothing to charities or secondhand centers',
        '• Recycle torn or worn textiles through fabric recycling programs',
      ],
      impact: 'Clothing waste, especially synthetic fabrics, builds up in landfills and leaches microplastics and chemicals into the soil and waterways.',
      biodegradability: 'Low',
    },
    glass: {
      disposal: [
        '• Clean before placing in recycling bins',
        '• Handle carefully to avoid breakage, which can cause injuries and recycling contamination',
      ],
      impact: 'Glass that isn’t recycled stays in the environment permanently, where it can injure wildlife, damage ecosystems, and clutter landfills without ever breaking down.',
      biodegradability: 'Not biodegradable',
    },
    metal: {
      disposal: [
        '• Rinse food and residue from cans, trays, or foil',
        '• Place metals in appropriate recycling bins, sorted if required by local programs',
      ],
      impact: 'If not recycled, metals contribute to landfill buildup and require energy-intensive mining, which depletes natural resources and pollutes ecosystems.',
      biodegradability: 'Not biodegradable',
    },
    paper: {
      disposal: [
        '• Keep paper clean and dry before placing it in recycling bins',
        '• Avoid recycling paper contaminated with food, oil, or liquids',
      ],
      impact: 'Throwing away recyclable paper increases landfill mass and results in unnecessary tree harvesting and water pollution',
      biodegradability: 'High',
    },
    plastic: {
      disposal: [
        '• Rinse thoroughly and sort by number or type if required',
        '• Never mix with organic waste or non-recyclables',
      ],
      impact: 'Plastics pollute oceans, clog drainage systems, and kill marine animals that ingest them. Over time, they break into microplastics, which enter the food chain and threaten human health.',
      biodegradability: 'Low',
    },
  };

  return guidelines[normalizedClass] || {
    disposal: ['• Use appropriate disposal methods'],
    impact: 'Improper disposal can lead to pollution and harm wildlife.',
    biodegradability: 'Unknown',
  };
};

const getBriefInfo = (wasteClass) => {
  const briefInfo = {
    biodegradable: 'Includes organic waste like food scraps, garden clippings, and natural fibers. These materials decompose naturally and can be turned into nutrient-rich compost when managed properly.',
    cardboard: 'A thick, paper-based material commonly used in packaging. Cardboard is widely recyclable and reprocessing it saves trees, energy, and landfill space.',
    cloth: 'Refers to used textiles and clothing made from natural or synthetic fibers. Clothing waste is a growing concern due to fast fashion and synthetic fabrics that don’t break down easily.',
    glass: 'A durable material made from sand and other minerals, typically used in bottles and jars. Glass is 100% recyclable and can be reused endlessly without losing quality.',
    metal: 'Covers items like aluminum cans, steel containers, and foil. Metals are highly recyclable and valuable, but improper disposal leads to environmental damage from mining and processing.',
    paper: 'Derived from wood pulp, paper is widely used in printing, packaging, and hygiene products. It’s recyclable, though contamination with food or liquids can prevent successful recycling.',
    plastic: 'synthetic material made from petroleum. Found in packaging, containers, and products, plastic takes hundreds of years to degrade and poses severe risks to wildlife and ecosystems',
  };

  return briefInfo[wasteClass] || 'General waste that should be assessed for safe disposal or recycling based on local guidelines';
};

const ExploreScreen = () => {
  const route = useRoute();
  const { imageUri } = route.params || {};

  const [classificationResult, setClassificationResult] = useState(null);
  const [topClass, setTopClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (imageUri) {
      fetchClassificationResult();
    }
  }, [imageUri]);

  const fetchClassificationResult = async () => {
    setLoading(true);
    setError(null);
    try {
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const imageData = `data:image/jpeg;base64,${base64Image}`;

      const response = await axios({
        method: 'POST',
        url: 'https://serverless.roboflow.com/garbage-classification-3/2',
        params: { api_key: 'h5X4WlHDyJ4jOVamcMf1' },
        data: imageData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const preds = response.data?.predictions || [];
      if (preds.length > 0) {
        setTopClass(preds[0].class);
      }

      setClassificationResult(response.data);
    } catch (err) {
      setError('Failed to fetch classification result.');
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const predictions = classificationResult?.predictions || [];
  const guidelines = topClass ? getWasteGuidelines(topClass) : null;

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFF" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.reportTitle}>Report</Text>
        </View>

        {!imageUri ? (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>Please upload an image first.</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.classifiedLabel}>
                <Text style={styles.boldText}>Detected Object: </Text>
                {loading
                  ? 'Loading...'
                  : predictions.length > 0
                  ? predictions.map(p => p.class).join(', ')
                  : 'None'}
              </Text>
              <Text style={styles.subLabel}>
                {loading
                  ? 'Fetching data...'
                  : predictions.length > 0
                  ? `Confidence: ${Math.round(predictions[0].confidence * 100)}%`
                  : 'Confidence: N/A'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.classifiedLabel}>
                <Text style={styles.boldText}>Biodegradability: </Text>
                {guidelines ? guidelines.biodegradability : 'Unknown'}
              </Text>
            </View>

            <View
              style={styles.imageContainer}
              onLayout={e => {
                const { width, height } = e.nativeEvent.layout;
                setImageLayout({ width, height });
              }}
            >
              <Image source={{ uri: imageUri }} style={styles.image} />
              {imageLayout.width > 0 && imageLayout.height > 0 && (
                <Svg
                  width={imageLayout.width}
                  height={imageLayout.height}
                  viewBox={`0 0 ${classificationResult?.image?.width || imageLayout.width} ${classificationResult?.image?.height || imageLayout.height}`}
                  style={StyleSheet.absoluteFill}
                >
                  {predictions.map((pred, idx) => (
                    <React.Fragment key={idx}>
                      <Rect
                        x={pred.x - pred.width / 2}
                        y={pred.y - pred.height / 2}
                        width={pred.width}
                        height={pred.height}
                        fill="none"
                        stroke="lime"
                        strokeWidth="2"
                      />
                      <SvgText
                        x={pred.x - pred.width / 2}
                        y={pred.y - pred.height / 2 - 4}
                        fill="lime"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {pred.class}
                      </SvgText>
                    </React.Fragment>
                  ))}
                </Svg>
              )}
            </View>

            <View style={styles.divider} />

            <Text style={styles.descriptionText}>
              {loading
                ? 'Please wait...'
                : predictions.length > 0
                ? (() => {
                    const uniqueClasses = new Set();
                    const uniquePredictions = [];
                    for (const p of predictions) {
                      const wasteClass = p.class.toLowerCase();
                      if (!uniqueClasses.has(wasteClass)) {
                        uniqueClasses.add(wasteClass);
                        uniquePredictions.push(p);
                      }
                    }
                    return uniquePredictions.map((p, idx) => {
                      const wasteClass = p.class.toLowerCase();
                      const briefInfo = getBriefInfo(wasteClass);
                      return (
                        <Text key={idx} style={styles.wasteInfo}>
                          <Text style={styles.boldText}>{p.class}:</Text> {briefInfo}
                        </Text>
                      );
                    });
                  })()
                : 'No objects detected.'}
            </Text>


            <View style={styles.divider} />

            {!loading && topClass && guidelines && (
              <>
                <Text style={styles.sectionTitle}>Disposal Methods for {topClass}:</Text>
                {guidelines.disposal.map((item, idx) => (
                  <Text style={styles.bullet} key={idx}>{item}</Text>
                ))}

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Environmental Impact:</Text>
                <Text style={styles.descriptionText}>{guidelines.impact}</Text>
              </>
            )}
          </>
        )}

        {loading && <ActivityIndicator size="large" color="#3399FF" style={{ marginTop: 16 }} />}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  safeAreaContainer: { flex: 1, backgroundColor: '#F2E9D8' },
  container: { padding: 20, backgroundColor: '#F2E9D8' },
  header: {
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: STATUSBAR_HEIGHT,
  },
  reportTitle: {
    width: '100%',
    fontSize: 20,
    fontWeight: '600',
    backgroundColor: '#7B8D42',
    color: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#3399FF',
    textAlign: 'center', 
    borderRadius: 10
  },
  section: {
    marginBottom: 16,
  },
  classifiedLabel: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  subLabel: {
    fontSize: 14,
    color: '#777',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    marginTop: 12,
    marginBottom: 16,
    backgroundColor: '#F2E9D8',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  bullet: {
    fontSize: 14,
    marginBottom: 6,
    paddingLeft: 10,
    color: '#333',
  },
  wasteInfo: {
    marginBottom: 10,
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  noImageText: {
    fontSize: 16,
    color: '#999',
  },
  errorText: {
    marginTop: 10,
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
});