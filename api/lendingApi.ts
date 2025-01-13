import axios from 'axios';

// Base URL for the backend
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
    throw error.response?.data || { message: 'Error logging in' };
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
