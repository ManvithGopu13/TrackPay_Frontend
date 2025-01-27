// src/SMSParserApp.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  Button,
  ScrollView
} from "react-native";
import SmsAndroid from "react-native-get-sms-android";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addBook, addTransaction, getBooks, getTransactions } from "../api/lendingApi";

type Transaction = {
  _id: string;
  amount: number;
  date: number;
  refNo: string;
  type: string;
  description: string;
  user_id: string;
  category_id: string;
  book: string;
  associated_person: string;
  // meta_data?: {
  //   originalMessage: string;
  // };
};


interface Book {
  _id: string;  // or _id: string if it's from MongoDB
  name: string;
  categories: {
    [category: string]: Transaction[];
  };
}


interface SMSMessage {
  _id: string;
  address: string;
  body: string;
  date: number;
  date_sent: number;
}

interface CategorizedMessages {
  [category: string]: SMSMessage[];
}

// Categories for SMS messages
const categories: { [key: string]: string[] } = {
  groceries: ['supermarket', 'grocery', 'store'],
  food: ['restaurant', 'cafe', 'food', 'dining'],
  travel: ['flight', 'train', 'uber', 'taxi', 'travel'],
  lifestyle: ['shopping', 'mall', 'fashion', 'clothing'],
  payments: ['debited', 'credited', 'transaction', 'payment', 'withdrawal'],
  others: [],
};

// Categorize SMS function
const categorizeSMS = (smsBody: string): string => {
  for (const category in categories) {
    for (const keyword of categories[category]) {
      if (smsBody.toLowerCase().includes(keyword)) {
        return category;
      }
    }
  }
  return 'others';
};

// Helper function to group transactions by name
const groupByName = (transactions: Transaction[]) => {
  return transactions.reduce<Record<string, Transaction[]>>((grouped, transaction) => {
    if (!grouped[transaction.associated_person]) {
    grouped[transaction.associated_person] = [];
    }
    grouped[transaction.associated_person].push(transaction);
    return grouped;
  }, {});
};

const generateInitialCollapsedState = (books: Book[]): Record<string, boolean> => {
  const initialState: Record<string, boolean> = {};

  // console.log('Books in generateInitialCollapsedState:', books);

  books.forEach((book, bookIndex) => {
    Object.entries(book.categories).forEach(([category, transactions]) => {
      const groupedByName = groupByName(transactions);
      Object.keys(groupedByName).forEach((name) => {
        const key = `${bookIndex}-${category}-${name}`;
        initialState[key] = true; // Set all sections to collapsed initially
      });
    });
  });
  
  // console.log('Generated initialState:', initialState);
  return initialState;
};



const SMSParserApp: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [newBookName, setNewBookName] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [count, setCount] = useState(false);
  const [isTransactionModalVisible, setIsTransactionModalVisible] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    name: "",
    amount: "",
    category: "",
    bookIndex: 0,
  });

  const [smsMessages, setSmsMessages] = useState<SMSMessage[]>([]);
  const [categorizedMessages, setCategorizedMessages] = useState<CategorizedMessages>({});
  // const [collapsedState, setCollapsedState] = useState<Record<string, boolean>>({});
  // const [collapsedState, setCollapsedState] = useState(() =>
  //   generateInitialCollapsedState(books)
  // );
  const [collapsedState, setCollapsedState] = useState(generateInitialCollapsedState(books));

  const [collapsed, setCollapsed] = useState(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchedTransactions, setTransactions] = useState<Transaction[]>([]);
  const groupedTransactions = fetchedTransactions ? groupByName(fetchedTransactions) : {};
  
  // console.log(`Final Fetched transactions are: ${fetchedTransactions}`)
 // State to manage collapsed/expanded names

     // Helper function to parse payment-related SMS
     const parsePaymentMessage = (smsBody: string) => {
      const parsedMessage: {
        to?: string;
        from?: string;
        amount?: string;
        refNo?: string;
        type?: 'debit' | 'credit';
      } = {};
    
      if (smsBody.toLowerCase().includes('debited by')) {
        parsedMessage.type = 'debit';
    
        // Extract the amount
        const amountMatch = smsBody.match(/debited by\s+([0-9.]+)/i);
        if (amountMatch) {
          parsedMessage.amount = amountMatch[1];
        }
    
        // Extract "TO"
        const toMatch = smsBody.match(/trf to\s+([A-Z\s]+?)(?=\s+Refno|\s*$)/i);
        if (toMatch) {
          parsedMessage.to = toMatch[1].trim();
          // .split(' ').pop()
        }
      } else if (smsBody.toLowerCase().includes('credited by')) {
        parsedMessage.type = 'credit';
    
        // Extract the amount
        const amountMatch = smsBody.match(/credited by\s+([0-9.]+)/i);
        if (amountMatch) {
          parsedMessage.amount = amountMatch[1];
        }
    
        // Extract "FROM"
        const fromMatch = smsBody.match(/from\s+([\w\s]+)/i);
        if (fromMatch) {
          parsedMessage.from = fromMatch[1].trim();
        }
      }
    
      // Extract reference number (Refno)
      const refMatch = smsBody.match(/refno[:\s]+(\w+)/i);
      if (refMatch) {
        parsedMessage.refNo = refMatch[1];
      }
    
      return parsedMessage;
    };


 useEffect(() => {
  const fetchSMSAndInitialize = async () => {
    if (!count){
      setCount(true)
      fetchSMSAndInitialize
    }
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'This app requires access to your SMS messages to track payments.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const filter = {
          box: 'inbox',
          indexFrom: 0,
          maxCount: 100,
        };

        SmsAndroid.list(
          JSON.stringify(filter),
          (fail: string) => {
            console.error('Failed to fetch SMS: ', fail);
            Alert.alert('Error', 'Failed to fetch SMS messages.');
          },
          async (count: number, smsList: string) => {
            const messages: SMSMessage[] = JSON.parse(smsList);
            setSmsMessages(messages)
            // Get user ID
            const user_id = await AsyncStorage.getItem('user_id');
            if (!user_id) {
              console.error('No user ID found in AsyncStorage');
              return;
            }
            
            // Fetch existing books from the backend
            const existingBooks = await getBooks(user_id); // Implement this API call
            // console.log('Response:', existingBooks);
            
            // Find the "All Payments Book" from the existingBooks array
            const allPaymentsBook = existingBooks.find((book: Book) => book.name === 'All Payments Book');
            // console.log(`Found book: ${allPaymentsBook ? JSON.stringify(allPaymentsBook) : 'Not found'}`);

            let book_id;
            if (!allPaymentsBook) {
              // Create "All Payments Book" if it doesn't exist
              const newBook = await addBook({
                name: 'All Payments Book',
                user_id,
              });
              book_id = newBook._id;
              console.log(`new added book id is : ${book_id}`)
              // console.log('Book added to backend:', newBook);
              setBooks((prevBooks) => [...prevBooks,{ ...newBook, categories: {} },])

              // Refresh transactions after adding the book
              // const updatedTransactions = await getTransactions(user_id);
              // setTransactions(updatedTransactions);
            } else {
              // Use the existing book's ID
              book_id = allPaymentsBook._id;
              // console.log('Using existing book:', allPaymentsBook);
            }
            console.log(`Before getTransactions`)
            // Fetch existing transactions for the user
            const existingTransactions = await getTransactions(user_id); // Fetch all transactions for the user
            
            console.log('Existing transactions:', existingTransactions);
            console.log(`After getTransactions`)
            // Process SMS messages and add transactions
            if(!messages){
              console.log(`No messages`)
              return
            }
            for (const message of messages) {
              console.log(`Entered for Loop`)
              const paymentDetails = parsePaymentMessage(message.body);
              console.log(`Parsed payment Message`)
              if (paymentDetails.amount) {
                try {
                  // Normalize the message body for comparison (e.g., remove extra spaces)
                  const normalizedMessage = message.body.trim().toLowerCase();
                  console.log(`paymentDetails refno : ${paymentDetails.refNo}`)
                  // Check if the transaction already exists (by refNo or message body)
                  const isDuplicate = existingTransactions.some(
                    (txn: Transaction) =>
                      txn.refNo === paymentDetails.refNo
                  );
                  console.log(`Is it duplicate : ${isDuplicate}`)
                  if (!isDuplicate) {
                    // Add transaction to the backend
                    const transactionData = {
                      amount: paymentDetails.amount,
                      date: message.date || Date.now(),
                      refNo: paymentDetails.refNo || 'N/A',
                      type: 'Debit', // or determine based on SMS
                      description: 'Payment transaction',
                      user_id,
                      category_id: 'Payments', // Replace with the actual category ID if available
                      book: book_id,
                      associated_person: paymentDetails.to || paymentDetails.from || 'Unknown',
                    };

                    const transactionResponse = await addTransaction(transactionData);
                    // setTransactions((prevTransactions) => [...prevTransactions])
                    setTransactions((prevTransactions) => [...prevTransactions, transactionResponse]);
                    console.log('Transaction added to backend:', transactionResponse);
                  }else if (isDuplicate === true) {
                    return
                  } else {
                    // console.log('Duplicate transaction detected, skipping:', message.body);
                  }
                } catch (error) {
                  // console.error('Error adding transaction:', error);
                  Alert.alert('Error', 'Failed to save the transaction to the backend.');
                }
              }
            }
            // const addedTransactionsatFirst = await getTransactions(user_id); 
            // setTransactions((prevTransactions) => [...prevTransactions, addedTransactionsatFirst])
          }
        );
      } else {
        Alert.alert('Permission Denied', 'SMS permission is required to use this feature.');
      }
    } catch (error) {
      console.error('Error fetching SMS: ', error);
    }
  };

  fetchSMSAndInitialize();
}, []);



  useEffect(() => {
    // Fetch existing books from backend
    const fetchBooks = async () => {
      try {
        const id = await AsyncStorage.getItem('user_id');
        if (!id) {
          console.error("No user ID found in AsyncStorage");
          return; // Handle this case appropriately
        }
        // const user_id = id; // Replace with actual user ID
        const fetchedBooks = await getBooks(id);
        // console.log("Fetched Books:", fetchedBooks);

        // Transform the fetched data to match the Book interface
    const transformedBooks: Book[] = fetchedBooks.map((book: any) => ({
      _id: book._id,
      name: book.name,
      categories: {Payments: [],}, // Assuming an empty object if categories don't exist
    }));
      setBooks(transformedBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
  
    fetchBooks();
    // fetchSMS();
  }, []);

  // Fetch Transactions and Group by Book and Category
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const user_id = await AsyncStorage.getItem("user_id");
        if (!user_id) {
          console.error("No user ID found in AsyncStorage");
          setLoading(false);
          return;
        }

        // Fetch transactions from the backend
        const existingTransactions = await getTransactions(user_id); // Fetch all transactions for the user
        // console.log('Feteched transacions are :', existingTransactions);
        setTransactions(existingTransactions)
        setLoading(false);
        // console.log("Transactions fetched")

      } catch (error) {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);


  if (loading) {
    return <Text>Loading...</Text>;
  }


  // useEffect(() => {
  //   // Dynamically update collapsedState based on the current books
  //   const updatedCollapsedState = generateInitialCollapsedState(books);
  //   setCollapsedState(updatedCollapsedState);
  
  //   // console.log("Updated collapsedState:", updatedCollapsedState);
  // }, [books]);




  const addBooktoBack = async () => {
    if (newBookName.trim()) {
      const user_id = await AsyncStorage.getItem('user_id');
            if (!user_id) {
              console.error('No user ID found in AsyncStorage');
              return;
            }
      // Construct the book data to send to the backend
      const bookData = {
        name: newBookName,
        user_id: user_id, // Replace with the current user's ID
      };
  
      try {
        // Call the API to add the book to the backend
        const newBookFromBackend = await addBook(bookData);
        console.log(`newbook id is: ${newBookFromBackend._id}`)
        // Update the books state with the newly added book
        setBooks((prevBooks) => [
          ...prevBooks,
          { ...newBookFromBackend, categories: {} }, // Add `categories` to match the local structure
        ]);
  
        // Reset the input field and hide the modal
        setNewBookName("");
        setIsModalVisible(false);
      } catch (error) {
        console.error("Error adding book:", error);
        Alert.alert("Error", "There was a problem adding the book. Please try again.");
      }
    } else {
      Alert.alert("Error", "Book name cannot be empty.");
    }
  };
  

  const addTransactiontoBack = async () => {
    const { name, amount, category, bookIndex } = newTransaction;
    console.log(`${bookIndex}`)
    // Validate the required fields
    if (!name.trim() || !amount.trim() || !category.trim()) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    console.log(`Book index : ${books[bookIndex]}`)
    // Retrieve the book_id from the selected book
    const selectedBook = books[bookIndex];
    const book_id = selectedBook?._id ; // Assuming `id` is the field holding the book ID
    console.log(`transaction is added to book with id : ${book_id}`)
    const user_id = await AsyncStorage.getItem('user_id');
            if (!user_id) {
              console.error('No user ID found in AsyncStorage');
              return;
            }
    // Construct the transaction data to send to the backend
    const transactionData = {
      amount: parseFloat(amount),  // Convert amount to a number
      date: Date.now(),
      refNo:'N/A',  // Adjust based on your app's logic
      type: 'Debit',
      description: 'Payment transaction',// You may want to include the transaction name as a description
      user_id: user_id,  // Replace with the current user's ID
      category_id: category,  // Make sure the backend expects the category as category_id
      book: book_id,  // Pass the book_id as part of the books array
      associated_person: name, // If applicable, fill with associated person data
    };
  
    try {
      // Call the API to add the transaction to the backend
      const newTransactionFromBackend = await addTransaction(transactionData);
  
      // After adding the transaction, update the front-end state
      setBooks((prevBooks) => {
        const updatedBooks = [...prevBooks];
        const book = updatedBooks[bookIndex];
  
        if (!book.categories[category]) {
          book.categories[category] = [];
        }
  
        // Assuming the backend returns the new transaction, use that
        book.categories[category].push(newTransactionFromBackend);
        
        return updatedBooks;
      });
  
      // Clear the new transaction state and hide modal
      setNewTransaction({ name: "", amount: "", category: "", bookIndex: 0 });
      setIsTransactionModalVisible(false);
      setTransactions((prevTransactions) => [...prevTransactions, newTransactionFromBackend]);
    } catch (error) {
      console.error("Error adding transaction to the backend:", error);
      Alert.alert("Error", "There was a problem adding the transaction. Please try again.");
    }
  };
  


  
  // const [collapsedState, setCollapsedState] = useState(() =>
  //   generateInitialCollapsedState(books)
  // );
  


  // Toggle collapsed state for a specific name
  const toggleCollapsed = (bookIndex: number, category: string, name: string) => {
    const key = `${bookIndex}-${category}-${name}`;
    setCollapsedState((prevState) => ({
      ...prevState,
      [key]: !prevState[key], // Toggle the current state
    }));
    setCollapsed(collapsed? false : true);
  };


const groupByCategory = (transactions: Transaction[] | undefined) => {
  // console.log(`Entered grouping with : ${transactions}`)
  if (!transactions) {
    console.log('returning as it is null')
    return {}; // Return an empty object if transactions is undefined or null
  }

  return transactions.reduce((acc, transaction) => {
    if (!acc[transaction.category_id]) {
      acc[transaction.category_id] = [];
    }
    acc[transaction.category_id].push(transaction);
    return acc;
  }, {} as { [category_id: string]: Transaction[] });
};


  return (
    <SafeAreaView style={styles.container}>
      {/* <Text style={styles.title}>Payment Messages</Text> */}

<Text style={styles.title}>Expense Books</Text>

<FlatList
  horizontal
  data={books}
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item: book, index: bookIndex }) => {
    // Filter transactions that belong to the current book
    const filteredTransactions = fetchedTransactions.filter(
      (transaction) => transaction.book === book._id
    );    
    
    console.log(`filtered transactions are: ${filteredTransactions}`)
    console.log(`Book id checking is : ${book._id}`)
    // Group filtered transactions by category
    const groupedTransactions = groupByCategory(filteredTransactions);

    return (
      <View style={styles.book_container}>
        {/* Book Title */}
        <Text style={styles.bookTitle}>{book.name}</Text>

        {/* Categories and Transactions */}
        <ScrollView style={styles.book}>
          {Object.entries(groupedTransactions).map(([category_id, transactions]) => {
            // Group transactions by associated person
            const groupedByName = groupByName(transactions);

            return (
              <View key={category_id} style={styles.category}>
                {/* Category Title */}
                <Text style={styles.categoryTitle}>{category_id.toUpperCase()}</Text>

                {/* Transactions grouped by name */}
                {Object.entries(groupedByName).map(([name, groupedTransactions]) => {
                  // Generate a unique key for collapsing
                  const key = `${bookIndex}-${category_id}-${name}`;
                  const isCollapsed = collapsedState[key]; // Use the initialized collapsed state

                  return (
                    <View key={name} style={styles.nameSection}>
                      {/* Name Title with toggle button */}
                      <TouchableOpacity
                        style={styles.nameToggle}
                        onPress={() => toggleCollapsed(bookIndex, category_id, name)} // Toggling collapse state
                      >
                        <Text style={styles.nameTitle}>{name}</Text>
                        <Text style={styles.toggleIcon}>
                          {isCollapsed ? "▼" : "▲"} {/* Collapsed state indicator */}
                        </Text>
                      </TouchableOpacity>

                      {/* Collapsible Transactions */}
                      {!isCollapsed && (
                        <View style={styles.transactionsList}>
                          {groupedTransactions.map((transaction, index) => (
                            <View key={transaction._id} style={styles.transaction}>
                              <Text>Name: {transaction.associated_person}</Text>
                              <Text>Amount: {transaction.amount}</Text>
                              <Text>Date: {new Date(transaction.date).toLocaleDateString()}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>

        {/* Add Transaction Button */}
        <TouchableOpacity
          style={styles.addTransactionButton}
          onPress={() => {
            setNewTransaction({
              ...newTransaction,
              bookIndex,
            });
            setIsTransactionModalVisible(true);
          }}
        >
          <Text style={styles.addTransactionButtonText}>Add Transaction</Text>
        </TouchableOpacity>
      </View>
    );
  }}
/>


      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add Book</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add New Book</Text>
          <TextInput
            style={styles.input}
            placeholder="Book Name"
            value={newBookName}
            onChangeText={setNewBookName}
          />
          <Button title="Add Book" onPress={addBooktoBack} />
        </View>
      </Modal>

      <Modal
        visible={isTransactionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() =>
          setNewTransaction({ name: "", amount: "", category: "", bookIndex: 0 })
        }
      >
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add Transaction</Text>
          <TextInput
            style={styles.input}
            placeholder="Transaction Name"
            value={newTransaction.name}
            onChangeText={(text) =>
              setNewTransaction({ ...newTransaction, name: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={newTransaction.amount}
            keyboardType="numeric"
            onChangeText={(text) =>
              setNewTransaction({ ...newTransaction, amount: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={newTransaction.category}
            onChangeText={(text) =>
              setNewTransaction({ ...newTransaction, category: text })
            }
          />
          <Button title="Add Transaction" onPress={addTransactiontoBack} />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  book_container : {
    // height: 600,
    width: 350,
    marginHorizontal: 8,
    backgroundColor: "#7af",
    borderRadius: 25,
    marginBottom: 10
  },
  book: {
    padding: 10,
    height: 300,
    width: 320,
    marginHorizontal: 12,
    paddingBottom: 20,
    // paddingTop: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  bookTitle: {
    fontSize: 18,
    // flexDirection: "column",
    fontWeight: "bold",
  textAlign: "center", // Align text horizontally at the center
  alignSelf: "center", // Center the element itself
  marginTop: 10, 
  },
  category: {
    marginTop: 10,
    
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  transaction: {
    padding: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: "#1E90FF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  addTransactionButton: {
    backgroundColor: "#02cd09",
    padding: 5,
    borderRadius: 5,
    // marginTop: 10,
    marginBottom: 30,
    marginHorizontal: 20,
    // marginStart: 30
  },
  addTransactionButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  input: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  message: {
        padding: 10,
        width: 300,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 5,
        marginHorizontal: 12
      },
      body: {
        marginBottom: 3,
      },
      date: {
        color: '#888',
      },
      paymentCard: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
      },
      sender: {
        fontWeight: 'bold',
        marginBottom: 5,
      },
      details: {
        marginBottom: 3,
        fontSize: 14,
      },
      nameSection: { marginBottom: 10 },
      nameToggle: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 5,
        backgroundColor: "#e0e0e0",
        paddingHorizontal: 10,
      },
      nameTitle: { fontSize: 14, fontWeight: "bold" },
      toggleIcon: { fontSize: 12, fontWeight: "bold" },
      transactionsList: { marginLeft: 10 },
      bookContainer: {
        marginBottom: 20,
      },
      // bookTitle: {
      //   fontSize: 18,
      //   fontWeight: 'bold',
      // },
      categoryHeader: {
        fontSize: 16,
        marginTop: 10,
        fontWeight: 'bold',
      },
      transactionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
      },
});

export default SMSParserApp;



