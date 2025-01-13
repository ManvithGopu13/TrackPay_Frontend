// Lending Screen Component
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker
import { fetchLends, addLend, updateLend, deleteLend } from '../api/lendingApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Lend = {
  _id: string;
  amount: number;
  interestRate: number;
  interestType: string; // "simple" or "compound"
  period: number; // Duration in days, months, or years
  status: string; // "active" or "inactive"
  description?: string;
  user: string; // User ID
};

type nextLend = {
  amount: number;
  interestRate: number;
  interestType: string; // "simple" or "compound"
  period: number; // Duration in days, months, or years
  status: string; // "active" or "inactive"
  description?: string;
  user?: string; // User ID
};

const checkAuthentication = async () => {
  try {
    const user_id = await AsyncStorage.getItem('user_id'); // Check if token exists in AsyncStorage
    return user_id;
  } catch (error) {
    console.error('Error fetching user_id:', error);
    return ''
  } 
};

const LendingScreen: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  // const id = checkAuthentication
  const [lends, setLends] = useState<Lend[]>([]);
  const [newLend, setNewLend] = useState<Lend>({
    _id: '',
    amount: 0,
    interestRate: 0,
    interestType: 'simple',
    period: 0,
    status: 'active',
    description: '',
    user: '', // Assign user dynamically
  });
  const [editingLend, setEditingLend] = useState<Lend | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const interestTypes = ['simple', 'compound'];
  const statusOptions = ['active', 'inactive'];

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('user_id');
        if (!id) {
          console.error("No user ID found in AsyncStorage");
          return; // Handle this case appropriately
        }
        const fetchedLends = await fetchLends(id);
        setLends(fetchedLends);
        console.log(`${id}`)
        if (id) {
          setUserId(id); // Set the user ID once fetched
        }
      } catch (error) {
        console.error('Error fetching user_id:', error);
      }
    };

    fetchUserId();
  }, []); // Empty dependency array means this effect runs only once on mount

  // useEffect(() => {
  //   console.log(`${userId}`)
  //   const loadLends = async () => {
  //     try {
  //       const fetchedLends = await fetchLends(userId);
  //       setLends(fetchedLends);
  //     } catch (error) {
  //       console.error('Failed to fetch lends:', error);
  //     }
  //   };
  //   loadLends();
  // }, []);

  useEffect(() => {
    // Update the newLend user when userId changes
    setNewLend((prevState) => ({
      ...prevState,
      user: userId || '', // Assign the user ID dynamically
    }));
  }, [userId]);
  

  

  


  const handleAddLend = async () => {
    if (!newLend.amount || !newLend.interestRate || !newLend.period) {
      Alert.alert('Please fill in all required fields!');
      return;
    }

    try {
      const user = await AsyncStorage.getItem('user_id');
      if(user){
        newLend.user = user
      }
      console.log(`${newLend._id},${newLend.user},${newLend.amount},${newLend.interestRate},${newLend.interestType},${newLend.period}`)
      const addedLend = await addLend(newLend);
      setLends([...lends, addedLend]);
      resetForm();
      setModalVisible(false);
    } catch (error) {
      console.error('Failed to add lend:', error);
    }
  };

  const handleEditLend = async () => {
    if (!editingLend) return;

    try {
      const updatedLend = await updateLend(editingLend._id, newLend);
      const updatedLends = lends.map((lend) =>
        lend._id === editingLend._id ? updatedLend : lend
      );
      setLends(updatedLends);
      resetForm();
      setModalVisible(false);
    } catch (error) {
      console.error('Failed to update lend:', error);
    }
  };

  const handleDeleteLend = async (id: string) => {
    try {
      await deleteLend(id);
      const updatedLends = lends.filter((lend) => lend._id !== id);
      setLends(updatedLends);
    } catch (error) {
      console.error('Failed to delete lend:', error);
    }
  };

  const resetForm = () => {
    setEditingLend(null);
    setNewLend({
      _id: '',
      amount: 0,
      interestRate: 0,
      interestType: 'simple',
      period: 0,
      status: 'active',
      description: '',
      user: '', // Reset user
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Your Lendings</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Lending</Text>
      </TouchableOpacity>

      <FlatList
        data={lends}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.lendCard}>
            <Text style={styles.lendText}>Amount: ₹{item.amount}</Text>
            <Text style={styles.lendText}>
              Interest Rate: {item.interestRate}% ({item.interestType})
            </Text>
            <Text style={styles.lendText}>Period: {item.period} days</Text>
            <Text style={styles.lendText}>Status: {item.status}</Text>
            {item.description && <Text style={styles.lendText}>Description: {item.description}</Text>}

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setEditingLend(item);
                  setNewLend(item);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteLend(item._id)}
              >
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>{editingLend ? 'Edit Lending' : 'Add Lending'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={newLend.amount.toString()}
            onChangeText={(text) => setNewLend({ ...newLend, amount: parseFloat(text) })}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter interest rate"
            keyboardType="numeric"
            value={newLend.interestRate.toString()}
            onChangeText={(text) => setNewLend({ ...newLend, interestRate: parseFloat(text) })}
          />
          <TextInput
            style={styles.input}
            placeholder="Period (in days)"
            keyboardType="numeric"
            value={newLend.period.toString()}
            onChangeText={(text) => setNewLend({ ...newLend, period: parseInt(text) })}
          />
          {/* <Text>Interest Type:</Text>
          <Picker
            selectedValue={newLend.interestType}
            onValueChange={(value) => setNewLend({ ...newLend, interestType: value })}
          >
            {interestTypes.map((type) => (
              <Picker.Item key={type} label={type} value={type} />
            ))}
          </Picker> */}

          <Text>Status:</Text>
          <Picker
            selectedValue={newLend.status}
            onValueChange={(value) => setNewLend({ ...newLend, status: value })}
          >
            {statusOptions.map((status) => (
              <Picker.Item key={status} label={status} value={status} />
            ))}
          </Picker>

          <TextInput
            style={styles.input}
            placeholder="Enter description (optional)"
            value={newLend.description}
            onChangeText={(text) => setNewLend({ ...newLend, description: text })}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={editingLend ? handleEditLend : handleAddLend}
            >
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                resetForm();
                setModalVisible(false);
              }}
            >
              <Text style={styles.actionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lendCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 3,
  },
  lendText: {
    fontSize: 16,
    marginBottom: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  editButton: {
    backgroundColor: '#2196f3',
    padding: 8,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 4,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  modalButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 10 },
});

export default LendingScreen;
