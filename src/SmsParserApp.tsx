import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, PermissionsAndroid, Alert, ScrollView,SafeAreaView } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';

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
  const [smsMessages, setSmsMessages] = useState<SMSMessage[]>([]);
  const [categorizedMessages, setCategorizedMessages] = useState<CategorizedMessages>({});

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
            maxCount: 50, // Maximum number of SMS to fetch
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

  

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
  data={['payments']} // Only show the 'payments' category
  keyExtractor={(item, index) => index.toString()}
  showsVerticalScrollIndicator={false}
  renderItem={({ item: category }) => (
    <View style={styles.category}>
      <Text style={styles.categoryTitle}>{category.toUpperCase()}</Text>
      <FlatList
        data={categorizedMessages[category]}
        keyExtractor={(message, index) => index.toString()}
        nestedScrollEnabled={true} // Enable nested scrolling for inner FlatList
        renderItem={({ item: message }) => {
          const paymentDetails = parsePaymentMessage(message.body);

          return (
            <View style={styles.message}>
              <Text style={styles.sender}>Sender: {message.address}</Text>
              
              {paymentDetails && (
                <>
                  {paymentDetails.type === 'debit' && (
                    <>
                      <Text style={styles.details}>To: {paymentDetails.to}</Text>
                      <Text style={styles.details}>Amount: {paymentDetails.amount}</Text>
                      <Text style={styles.details}>Ref. No: {paymentDetails.refNo}</Text>
                    </>
                  )}
                  {paymentDetails.type === 'credit' && (
                    <>
                      <Text style={styles.details}>From: {paymentDetails.from}</Text>
                      <Text style={styles.details}>Amount: {paymentDetails.amount}</Text>
                      <Text style={styles.details}>Ref. No: {paymentDetails.refNo}</Text>
                    </>
                  )}
                </>
              )}

              <Text style={styles.body}>Message: {message.body}</Text>
              <Text style={styles.date}>
                Date: {new Date(message.date).toLocaleString()}
              </Text>
            </View>
          );
        }}
      />
    </View>
  )}
/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  category: {
    marginBottom: 20,
    paddingVertical: 2
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1E90FF',
  },
  message: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 5,
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
});

export default SMSParserApp;