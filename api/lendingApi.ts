import axios from 'axios';

// Base URL for the backend
// const BASE_URL = 'http://172.20.10.3:10000/api'; // Replace with your backend URL
const BASE_URL = 'https://trackpay-backend-try-2.onrender.com/api'; // Replace with your backend URL

// Function to register a new user
export const registerUser = async (user: { name: string; email: string; password: string }) => {
  try {
    console.log(`Details for registering : ${user.name}, ${user.email}, ${user.password}`)
    const response = await axios.post(`${BASE_URL}/authentication/register`, user);
    console.log(`${response}`)
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Error registering user' };
  }
};

// Function to login a user
export const loginUser = async (user: { email: string; password: string }) => {
  try {
    const response = await axios.post(`${BASE_URL}/authentication/login`, user);
    console.log(`${response}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Error logging in from the frontend-side' };
  }
};
  
// Function to fetch all lends
export const fetchLends = async ( user_id : any) => {
  try {
    const response = await axios.get(`${BASE_URL}/lending/getLends`,{
      params: { user: user_id }, // Pass as query parameter
    });
    return response.data;
  } catch (error) { 
    console.error('Error fetching lends:', error);
    throw error;
  }
};

// Function to add a new lend
export const addLend = async (lend: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/lending/addLend`, lend);
    return response.data;
  } catch (error) {
    console.error('Error adding lend:', error);
    throw error;
  }
};

// Function to update an existing lend
export const updateLend = async (id: string, lend: any) => {
  try {
    const response = await axios.put(`${BASE_URL}/lending/lends/${id}`, lend);
    return response.data;
  } catch (error) {
    console.error('Error updating lend:', error);
    throw error;
  }
};

// Function to delete a lend
export const deleteLend = async (id: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/lending/lends/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting lend:', error);
    throw error;
  }
};

// Function to get all transactions for a user
export const getTransactions = async (user_id: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/transaction/getTransactions`, {
      params: { user_id }, // Pass user_id as a query parameter
    });
    // console.log(` IN the getTransactrions call : ${response.data}`)
    return response.data; // Return the list of transactions
  } catch (error) {
    console.error("Error fetching transactions from the fronted side:", error);
    throw error; // Rethrow to handle it in the frontend
  }
};

// Function to add a new transaction
export const addTransaction = async (transactionData: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/transaction/addTransaction`, transactionData);
    return response.data; // Return the newly created transaction
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error; // Rethrow to handle it in the frontend
  }
};

// Function to update a transaction
export const updateTransaction = async (id: string, user_id: string, updatedData: any) => {
  try {
    const response = await axios.put(`${BASE_URL}/transaction/updateTransaction/${id}`, {
      user_id, // Include user_id in the body
      ...updatedData,
    });
    return response.data; // Return the updated transaction
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error; // Rethrow to handle it in the frontend
  }
};

// Function to delete a transaction
export const deleteTransaction = async (id: string, user_id: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/transaction/deleteTransaction/${id}`, {
      data: { user_id }, // Include user_id in the request body
    });
    return response.data; // Return success message
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error; // Rethrow to handle it in the frontend
  }
};

// Function to fetch all books
export const getBooks = async (user_id: string) => {
  try {
    // console.log(`Entered fetching books`)
    const response = await axios.get(`${BASE_URL}/transaction/getBooks`, {
      params: { user_id }, // Pass user_id as a query parameter
    });
    return response.data; // Return the list of books
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error; // Rethrow to handle it in the frontend
  }
};

// Function to add a new book
export const addBook = async (bookData: any) => {
  try {
    // console.log(`${bookData.name}, ${bookData.user_id}`)
    const response = await axios.post(`${BASE_URL}/transaction/addBook`, bookData);
    return response.data; // Return the newly created book
  } catch (error) {
    console.error("Error adding book:", error);
    throw error; // Rethrow to handle it in the frontend
  }
};