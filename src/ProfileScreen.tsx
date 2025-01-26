// import React from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigationState } from '@react-navigation/native';

// interface ProfileScreenProps {
//   navigation: any;
// }



// const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {

//   const state = useNavigationState(state => state);

//   // console.log('Current Navigation State:', state);

//   const handleLogout = async () => {
//     await AsyncStorage.removeItem('token'); // Remove token
//     await AsyncStorage.removeItem('user_id'); // Remove token
//     // navigation.reset({
//     //   index: 0,
//     //   routes: [{ name: 'Login' }], // Set Login as the initial screen
//     // });
//     navigation.navigate('Login');
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Profile</Text>
//       <Button title="Logout" onPress={handleLogout} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
// });

// export default ProfileScreen;

import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigationState } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';

const ProfileScreen: React.FC<{ navigation: any; setIsAuthenticated: (value: boolean) => void }> = ({
  navigation,
  setIsAuthenticated,
})=> {
  const [selectedExpenseFilter, setSelectedExpenseFilter] = useState<string>('10days');
  const [selectedLendingFilter, setSelectedLendingFilter] = useState<string>('10days');
  const chartWidth = Dimensions.get('window').width - 32;

  // Dummy data based on filters
  const getExpenseData = () => {
    switch (selectedExpenseFilter) {
      case '10days':
        return [100, 150, 120, 200, 300, 100, 180, 200, 220, 170];
      case 'month':
        return [1200, 1500, 1000, 800, 1200, 1400, 2000];
      case 'year':
        return [12000, 11000, 12500, 13500, 14500, 15000, 15500, 16000, 17000, 18000, 19000, 20000];
      default:
        return [];
    }
  };

  const getLendingData = () => {
    switch (selectedLendingFilter) {
      case '10days':
        return [80, 120, 140, 100, 200, 180, 130, 150, 170, 200];
      case 'month':
        return [1000, 1200, 1400, 1100, 1500, 1300, 1600];
      case 'year':
        return [10000, 12000, 11000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 21000];
      default:
        return [];
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token'); // Remove token
    await AsyncStorage.removeItem('user_id'); // Remove user_id
    setIsAuthenticated(false); // Update authentication state
  };

  const renderFilterButtons = (type: string, selectedFilter: string, setFilter: (filter: string) => void) => {
    return (
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === '10days' && styles.selectedFilter]}
          onPress={() => setFilter('10days')}
        >
          <Text style={styles.filterText}>Last 10 Days</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'month' && styles.selectedFilter]}
          onPress={() => setFilter('month')}
        >
          <Text style={styles.filterText}>Last Month</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'year' && styles.selectedFilter]}
          onPress={() => setFilter('year')}
        >
          <Text style={styles.filterText}>Last Year</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Button title="Logout" onPress={handleLogout} />

      {/* Expenses Analysis Section */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Expenses Analysis</Text>
        {renderFilterButtons('expenses', selectedExpenseFilter, setSelectedExpenseFilter)}
        <LineChart
          data={{
            labels: selectedExpenseFilter === '10days' ? ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7', 'Day8', 'Day9', 'Day10'] :
              selectedExpenseFilter === 'month' ? ['Week1', 'Week2', 'Week3', 'Week4'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{ data: getExpenseData() }],
          }}
          width={chartWidth}
          height={220}
          yAxisLabel="$"
          yAxisSuffix=""
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#f2f2f2',
            color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          style={styles.chart}
        />
      </View>

      {/* Lending Analysis Section */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Lending Analysis</Text>
        {renderFilterButtons('lending', selectedLendingFilter, setSelectedLendingFilter)}
        <LineChart
          data={{
            labels: selectedLendingFilter === '10days' ? ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7', 'Day8', 'Day9', 'Day10'] :
              selectedLendingFilter === 'month' ? ['Week1', 'Week2', 'Week3', 'Week4'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{ data: getLendingData() }],
          }}
          width={chartWidth}
          height={220}
          yAxisLabel="$"
          yAxisSuffix=""
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#f2f2f2',
            color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  chartSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  filterButton: {
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
  selectedFilter: {
    backgroundColor: '#4CAF50',
  },
  filterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
