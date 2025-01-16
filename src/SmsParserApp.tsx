// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, StyleSheet, PermissionsAndroid, Alert, ScrollView,SafeAreaView } from 'react-native';
// import SmsAndroid from 'react-native-get-sms-android';

// interface SMSMessage {
//   _id: string;
//   address: string;
//   body: string;
//   date: number;
//   date_sent: number;
// }

// interface CategorizedMessages {
//   [category: string]: SMSMessage[];
// }

// // Categories for SMS messages
// const categories: { [key: string]: string[] } = {
//   groceries: ['supermarket', 'grocery', 'store'],
//   food: ['restaurant', 'cafe', 'food', 'dining'],
//   travel: ['flight', 'train', 'uber', 'taxi', 'travel'],
//   lifestyle: ['shopping', 'mall', 'fashion', 'clothing'],
//   payments: ['debited', 'credited', 'transaction', 'payment', 'withdrawal'],
//   others: [],
// };

// // Categorize SMS function
// const categorizeSMS = (smsBody: string): string => {
//   for (const category in categories) {
//     for (const keyword of categories[category]) {
//       if (smsBody.toLowerCase().includes(keyword)) {
//         return category;
//       }
//     }
//   }
//   return 'others';
// };

// const SMSParserApp: React.FC = () => {
//   const [smsMessages, setSmsMessages] = useState<SMSMessage[]>([]);
//   const [categorizedMessages, setCategorizedMessages] = useState<CategorizedMessages>({});

//   useEffect(() => {
//     const fetchSMS = async () => {
//       try {
//         // Request SMS permissions at runtime
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.READ_SMS,
//           {
//             title: 'SMS Permission',
//             message: 'This app requires access to your SMS messages to track payments.',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           }
//         );

//         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//           const filter = {
//             box: 'inbox', // Fetch messages from the inbox
//             indexFrom: 0, // Start index
//             maxCount: 50, // Maximum number of SMS to fetch
//           };

//           SmsAndroid.list(
//             JSON.stringify(filter),
//             (fail: string) => {
//               console.error('Failed to fetch SMS: ', fail);
//               Alert.alert('Error', 'Failed to fetch SMS messages.');
//             },
//             (count: number, smsList: string) => {
//               const messages: SMSMessage[] = JSON.parse(smsList);
//               const categorized: CategorizedMessages = {};

//               messages.forEach((message: SMSMessage) => {
//                 const category = categorizeSMS(message.body);
//                 if (!categorized[category]) {
//                   categorized[category] = [];
//                 }
//                 categorized[category].push(message);
//               });

//               setSmsMessages(messages);
//               setCategorizedMessages(categorized);
//             }
//           );
//         } else {
//           Alert.alert('Permission Denied', 'SMS permission is required to use this feature.');
//         }
//       } catch (error) {
//         console.error('Error fetching SMS: ', error);
//       }
//     };

//     fetchSMS();
//   }, []);

//   // Helper function to parse payment-related SMS
//     const parsePaymentMessage = (smsBody: string) => {
//     const parsedMessage: {
//       to?: string;
//       from?: string;
//       amount?: string;
//       refNo?: string;
//       type?: 'debit' | 'credit';
//     } = {};
  
//     if (smsBody.toLowerCase().includes('debited by')) {
//       parsedMessage.type = 'debit';
  
//       // Extract the amount
//       const amountMatch = smsBody.match(/debited by\s+([0-9.]+)/i);
//       if (amountMatch) {
//         parsedMessage.amount = amountMatch[1];
//       }
  
//       // Extract "TO"
//       const toMatch = smsBody.match(/trf to\s+([A-Z\s]+?)(?=\s+Refno|\s*$)/i);
//       if (toMatch) {
//         parsedMessage.to = toMatch[1].trim();
//         // .split(' ').pop()
//       }
//     } else if (smsBody.toLowerCase().includes('credited by')) {
//       parsedMessage.type = 'credit';
  
//       // Extract the amount
//       const amountMatch = smsBody.match(/credited by\s+([0-9.]+)/i);
//       if (amountMatch) {
//         parsedMessage.amount = amountMatch[1];
//       }
  
//       // Extract "FROM"
//       const fromMatch = smsBody.match(/from\s+([\w\s]+)/i);
//       if (fromMatch) {
//         parsedMessage.from = fromMatch[1].trim();
//       }
//     }
  
//     // Extract reference number (Refno)
//     const refMatch = smsBody.match(/refno[:\s]+(\w+)/i);
//     if (refMatch) {
//       parsedMessage.refNo = refMatch[1];
//     }
  
//     return parsedMessage;
//   };

  

//   return (
//     <SafeAreaView style={styles.container}>
//       <FlatList
//   data={['payments']} // Only show the 'payments' category
//   keyExtractor={(item, index) => index.toString()}
//   showsVerticalScrollIndicator={false}
//   renderItem={({ item: category }) => (
//     <View style={styles.category}>
//       <Text style={styles.categoryTitle}>{category.toUpperCase()}</Text>
//       <FlatList
//         data={categorizedMessages[category]}
//         keyExtractor={(message, index) => index.toString()}
//         nestedScrollEnabled={true} // Enable nested scrolling for inner FlatList
//         renderItem={({ item: message }) => {
//           const paymentDetails = parsePaymentMessage(message.body);

//           return (
//             <View style={styles.message}>
//               <Text style={styles.sender}>Sender: {message.address}</Text>
              
//               {paymentDetails && (
//                 <>
//                   {paymentDetails.type === 'debit' && (
//                     <>
//                       <Text style={styles.details}>To: {paymentDetails.to}</Text>
//                       <Text style={styles.details}>Amount: {paymentDetails.amount}</Text>
//                       <Text style={styles.details}>Ref. No: {paymentDetails.refNo}</Text>
//                     </>
//                   )}
//                   {paymentDetails.type === 'credit' && (
//                     <>
//                       <Text style={styles.details}>From: {paymentDetails.from}</Text>
//                       <Text style={styles.details}>Amount: {paymentDetails.amount}</Text>
//                       <Text style={styles.details}>Ref. No: {paymentDetails.refNo}</Text>
//                     </>
//                   )}
//                 </>
//               )}

//               <Text style={styles.body}>Message: {message.body}</Text>
//               <Text style={styles.date}>
//                 Date: {new Date(message.date).toLocaleString()}
//               </Text>
//             </View>
//           );
//         }}
//       />
//     </View>
//   )}
// />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 10,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   category: {
//     marginBottom: 20,
//     paddingVertical: 2
//   },
//   categoryTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 5,
//     color: '#1E90FF',
//   },
//   message: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     marginBottom: 5,
//   },
//   body: {
//     marginBottom: 3,
//   },
//   date: {
//     color: '#888',
//   },
//   paymentCard: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     marginBottom: 10,
//     backgroundColor: '#f9f9f9',
//   },
//   sender: {
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   details: {
//     marginBottom: 3,
//     fontSize: 14,
//   },
// });

// export default SMSParserApp;

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

interface Transaction {
  name: string;
  amount: string;
  date: string;
}

interface Book {
  name: string;
  categories: {
    [category: string]: Transaction[];
  };
}

interface Payment {
  name: string;
  amount: string;
  date: string;
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



const SMSParserApp: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [newBookName, setNewBookName] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTransactionModalVisible, setIsTransactionModalVisible] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    name: "",
    amount: "",
    category: "",
    bookIndex: 0,
  });

  const [smsMessages, setSmsMessages] = useState<SMSMessage[]>([]);
  const [categorizedMessages, setCategorizedMessages] = useState<CategorizedMessages>({});
  const [collapsedState, setCollapsedState] = useState<Record<string, boolean>>({});
  // const [collapsedState, setCollapsedState] = useState(() =>
  //   generateInitialCollapsedState(books)
  // );
  const [collapsed, setCollapsed] = useState(true);
  

 // State to manage collapsed/expanded names

    useEffect(() => {
    const fetchSMS = async () => {
      try {
        // Request SMS permissions at runtime
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
            box: 'inbox', // Fetch messages from the inbox
            indexFrom: 0, // Start index
            maxCount: 100, // Maximum number of SMS to fetch
          };

          SmsAndroid.list(
            JSON.stringify(filter),
            (fail: string) => {
              console.error('Failed to fetch SMS: ', fail);
              Alert.alert('Error', 'Failed to fetch SMS messages.');
            },
            (count: number, smsList: string) => {
              const messages: SMSMessage[] = JSON.parse(smsList);
              const categorized: CategorizedMessages = {};

              messages.forEach((message: SMSMessage) => {
                const category = categorizeSMS(message.body);
                if (!categorized[category]) {
                  categorized[category] = [];
                }
                categorized[category].push(message);
              });

              setSmsMessages(messages);
              setCategorizedMessages(categorized);

              // Automatically add payment messages to the first book
              if (books.length === 0) {
                // No books exist, create the first book
                const newBook: Book = {
                  name: "All Payments Book", // Default book name
                  categories: {
                    Payments: [], // Initialize the Payments category
                  },
                };
              
                // Process messages and add them to the Payments category
                messages.forEach((message) => {
                  const paymentDetails = parsePaymentMessage(message.body);
                  if (paymentDetails.amount) {
                    newBook.categories.Payments.push({
                      name: paymentDetails.to || paymentDetails.from || "Unknown",
                      amount: paymentDetails.amount,
                      date: new Date(message.date).toLocaleString(),
                    });
                  }
                });
              
                // Set the new book in the state
                setBooks([...books, newBook]);
              } else {
                // // If books exist, update the first book
                // const updatedBooks = [...books];
                // const firstBook = updatedBooks[0];
              
                // if (!firstBook.categories["Payments"]) {
                //   firstBook.categories["Payments"] = [];
                // }
              
                // messages.forEach((message) => {
                //   const paymentDetails = parsePaymentMessage(message.body);
                //   if (paymentDetails.amount) {
                //     firstBook.categories["Payments"].push({
                //       name: paymentDetails.to || paymentDetails.from || "Unknown",
                //       amount: paymentDetails.amount,
                //       date: new Date(message.date).toLocaleString(),
                //     });
                //   }
                // });
              
                // setBooks(updatedBooks);
              }
              
            }
          );
        } else {
          Alert.alert('Permission Denied', 'SMS permission is required to use this feature.');
        }
      } catch (error) {
        console.error('Error fetching SMS: ', error);
      }
    };

    fetchSMS();
  }, []);

  useEffect(() => {
    // Dynamically update collapsedState based on the current books
    const updatedCollapsedState = generateInitialCollapsedState(books);
    setCollapsedState(updatedCollapsedState);
  
    // console.log("Updated collapsedState:", updatedCollapsedState);
  }, [books]);


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



  const addBook = () => {
    if (newBookName.trim()) {
      setBooks((prevBooks) => [
        ...prevBooks,
        { name: newBookName, categories: {} },
      ]);
      setNewBookName("");
      setIsModalVisible(false);
    } else {
      Alert.alert("Error", "Book name cannot be empty.");
    }
  };

  const addTransaction = () => {
    const { name, amount, category, bookIndex } = newTransaction;

    if (!name.trim() || !amount.trim() || !category.trim()) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    const updatedBooks = [...books];
    const book = updatedBooks[bookIndex];

    if (!book.categories[category]) {
      book.categories[category] = [];
    }

    book.categories[category].push({
      name,
      amount,
      date: new Date().toLocaleString(),
    });

    setBooks((prevBooks) => [...prevBooks]); // trigger state update
    setNewTransaction({ name: "", amount: "", category: "", bookIndex: 0 });
    setIsTransactionModalVisible(false);
  };

  // Helper function to group transactions by name
  const groupByName = (transactions: Transaction[]) => {
    return transactions.reduce<Record<string, Transaction[]>>((grouped, transaction) => {
      if (!grouped[transaction.name]) {
      grouped[transaction.name] = [];
      }
      grouped[transaction.name].push(transaction);
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
  
 

  return (
    <SafeAreaView style={styles.container}>
      {/* <Text style={styles.title}>Payment Messages</Text> */}

<Text style={styles.title}>Expense Books</Text>


<FlatList
  horizontal
  data={books}
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item: book, index: bookIndex }) => (
    <View style={styles.book_container}>
      {/* Book Title */}
      <Text style={styles.bookTitle}>{book.name}</Text>

      {/* Categories and Transactions */}
      <ScrollView style={styles.book}>
        {Object.entries(book.categories).map(([category, transactions]) => {
          // Group transactions by name
          const groupedByName = groupByName(transactions);

          return (
            <View key={category} style={styles.category}>
              {/* Category Title */}
              <Text style={styles.categoryTitle}>{category.toUpperCase()}</Text>

              {/* Transactions grouped by name */}
              {Object.entries(groupedByName).map(([name, groupedTransactions]) => {
                // Generate a unique key for collapsing
                const key = `${bookIndex}-${category}-${name}`;
                const isCollapsed = collapsedState[key]; // Use the initialized collapsed state
                // console.log('Initial collapsedState:', collapsedState);
                return (
                  <View key={name} style={styles.nameSection}>
                    {/* Name Title with toggle button */}
                    <TouchableOpacity
                      style={styles.nameToggle}
                      onPress={() => toggleCollapsed(bookIndex, category, name)} // Toggling collapse state
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
                          <View key={index} style={styles.transaction}>
                            <Text>Name: {transaction.name}</Text>
                            <Text>Amount: {transaction.amount}</Text>
                            <Text>Date: {transaction.date}</Text>
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
  )}
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
          <Button title="Add Book" onPress={addBook} />
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
          <Button title="Add Transaction" onPress={addTransaction} />
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
  
});

export default SMSParserApp;





{/* <FlatList
horizontal
data={books}
keyExtractor={(item, index) => index.toString()}
renderItem={({ item: book, index: bookIndex }) => (
  <View style={styles.book_container}>
    {/* Book Title */}
//     <Text style={styles.bookTitle}>{book.name}</Text>

//     {/* Categories and Transactions */}
//     <ScrollView style={styles.book}>
//       {Object.entries(book.categories).map(([category, transactions]) => {
//         // Group transactions by name
//         const groupedByName = groupByName(transactions);

//         return (
//           <View key={category} style={styles.category}>
//             {/* Category Title */}
//             <Text style={styles.categoryTitle}>{category.toUpperCase()}</Text>

//             {/* Transactions grouped by name */}
//             {Object.entries(groupedByName).map(([name, groupedTransactions]) => {
//               // Generate a unique key for collapsing
//               const key = `${bookIndex}-${category}-${name}`;
//               const isCollapsed = collapsedState[key];
//               // const isCollapsed = collapsed;
//               return (
//                 <View key={name} style={styles.nameSection}>
//                   {/* Name Title with toggle button */}
//                   <TouchableOpacity
//                     style={styles.nameToggle}
//                     onPress={() => toggleCollapsed(bookIndex, category, name)}
//                   >
//                     <Text style={styles.nameTitle}>{name}</Text>
//                     <Text style={styles.toggleIcon}>
//                       {isCollapsed ? "▼" : "▲"}
//                     </Text>
//                   </TouchableOpacity>

//                   {/* Collapsible Transactions */}
//                   {!isCollapsed && (
//                     <View style={styles.transactionsList}>
//                       {groupedTransactions.map((transaction, index) => (
//                         <View key={index} style={styles.transaction}>
//                           <Text>Name: {transaction.name}</Text>
//                           <Text>Amount: {transaction.amount}</Text>
//                           <Text>Date: {transaction.date}</Text>
//                         </View>
//                       ))}
//                     </View>
//                   )}
//                 </View>
//               );
//             })}
//           </View>
//         );
//       })}
//     </ScrollView>

//     {/* Add Transaction Button */}
//     <TouchableOpacity
//       style={styles.addTransactionButton}
//       onPress={() => {
//         setNewTransaction({
//           ...newTransaction,
//           bookIndex,
//         });
//         setIsTransactionModalVisible(true);
//       }}
//     >
//       <Text style={styles.addTransactionButtonText}>Add Transaction</Text>
//     </TouchableOpacity>
//   </View>
// )}
// /> */}

