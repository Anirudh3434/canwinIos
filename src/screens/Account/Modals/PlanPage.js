import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../theme/color';
import { AppBar } from '@react-native-material/core';
import { useNavigation } from '@react-navigation/native';

const PlanPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('Yearly');

  const navigation = useNavigation();

  const plans = [
    {
      name: 'Yearly Plan',
      price: 60,
      originalPrice: 120,
      desc: 'Unlimited Resume Views',
      save: '50%',
      resumes: 'Unlimited',
      duration: 'Yearly',
    },
    {
      name: '3 Months',
      price: 24,
      originalPrice: 30,
      desc: 'View up to 30 resumes per day',
      save: '20%',
      resumes: '30/day',
      duration: 'Quarter',
    },
    {
      name: '1 Month',
      price: 8.4,
      originalPrice: 10,
      desc: 'View up to 20 resumes per day',
      save: '16%',
      resumes: '20/day',
      duration: 'Monthly',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <AppBar
        elevation={0}
        leading={
          <View style={{ padding: 10, gap: 10 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="black" />
            </TouchableOpacity>
            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 20, marginLeft: 10 }}>
              Choose Your Plan
            </Text>
          </View>
        }
        backgroundColor="white"
      />

      <ScrollView contentContainerStyle={styles.scrollView}>
        {plans.map((plan, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.planCard, selectedPlan === plan.name && styles.selectedPlan]}
            onPress={() => setSelectedPlan(plan.name)}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={selectedPlan === plan.name ? ['#80559A', '#14B6AA'] : ['#F9FFFE', '#F9FFFE']}
              style={styles.gradient}
            >
              <View>
                <View style={styles.planHeader}>
                  <Text
                    style={[
                      styles.planTitle,
                      { color: selectedPlan === plan.name ? '#fff' : '#000' },
                    ]}
                  >
                    {plan.name}
                  </Text>
                  {index == 0 && (
                    <Text
                      style={{
                        backgroundColor: Colors.primary,
                        padding: 5,
                        borderRadius: 20,
                        fontSize: 8,
                        color: 'white',
                      }}
                    >
                      Best Value
                    </Text>
                  )}
                  {index == 1 && (
                    <Text
                      style={{
                        backgroundColor: Colors.primary,
                        padding: 5,
                        borderRadius: 20,
                        fontSize: 8,
                        color: 'white',
                      }}
                    >
                      {' '}
                      Most Popular
                    </Text>
                  )}
                </View>

                <Text
                  style={[styles.planDesc, { color: selectedPlan === plan.name ? '#fff' : '#000' }]}
                >
                  • {plan.desc}
                </Text>
                <Text
                  style={[styles.planDesc, { color: selectedPlan === plan.name ? '#fff' : '#000' }]}
                >
                  • Save {plan.save}
                </Text>
              </View>

              <View style={styles.priceContainer}>
                <Text
                  style={[
                    styles.originalPrice,
                    { color: selectedPlan === plan.name ? '#fff' : '#000' },
                  ]}
                >
                  ${plan.originalPrice}
                </Text>
                <Text
                  style={[
                    styles.discountPrice,
                    { color: selectedPlan === plan.name ? '#fff' : '#000' },
                  ]}
                >
                  ${plan.price}
                </Text>
                <Text
                  style={[styles.duration, { color: selectedPlan === plan.name ? '#fff' : '#000' }]}
                >
                  {plan.duration}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <Text style={styles.infoText}>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </Text>

        <TouchableOpacity style={styles.purchaseButton}>
          <Text style={styles.purchaseText}>Continue to Purchase</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Terms and Conditions</Text>
          <Text style={styles.footerDivider}>/</Text>
          <Text style={styles.footerText}>Privacy Policy</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PlanPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  scrollView: {
    padding: 20,
  },
  planCard: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 4,
  },
  selectedPlan: {},
  gradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  bestValue: {
    backgroundColor: '#14B6AA',
    color: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: 12,
  },
  mostPopular: {
    backgroundColor: '#FF8C00',
    color: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: 12,
  },
  planDesc: {
    fontSize: 14,
    color: '#444',
    marginVertical: 5,
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 10,
  },
  originalPrice: {
    fontSize: 16,
    color: 'black',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#14B6AA',
  },
  duration: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#777',
    marginVertical: 15,
    textAlign: 'center',
  },
  purchaseButton: {
    backgroundColor: '#14B6AA',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  purchaseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },
  footerText: {
    color: '#555',
    fontSize: 14,
  },
  footerDivider: {
    color: '#555',
    marginHorizontal: 8,
    fontSize: 14,
  },
});
