// Get the API base URL dynamically
import { supabase } from "../utils/supabase1";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';


// export const getCurrentUser = async () => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/auth/user`, {
//       method: 'GET',
//       credentials: 'include',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.error);
//     }

//     const { user } = await response.json();
//     return user;
//   } catch (error) {
//     console.error('Error getting current user:', error);
//     throw error;
//   }
// };

export const initiateSignUp = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup/initiate`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  } catch (error) {
    console.error('Error initiating signup:', error);
    throw new Error('Failed to send verification email. Please try again.');
  }
};

export const completeSignUp = async (email, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup/complete`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const data = await response.json();
    
    // Store the token if it's included in the response
    if (data.session?.access_token) {
      localStorage.setItem('authToken', data.session.access_token);
    }

    return data;
  } catch (error) {
    console.error('Error completing signup:', error);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const data = await response.json();
    
    // Store the token if it's included in the response
    if (data.session?.access_token) {
      localStorage.setItem('authToken', data.session.access_token);
    }

    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

const handleApiResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'An unexpected error occurred');
  }
  return data;
};

export const initiatePasswordReset = async (email) => {
  try {
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${FRONTEND_URL}/authorisation`
});

    
    if (error) throw error;
    return { message: 'Password reset email sent successfully' };
  } catch (error) {
    console.error('Error initiating password reset:', error);
    throw new Error('Failed to send password reset email. Please try again.');
  }
};

export const completePasswordReset = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    return { message: 'Password reset successful' };
  } catch (error) {
    console.error('Error completing password reset:', error);
    throw error;
  }
};
export const signOut = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    // Clear the token from localStorage
    localStorage.removeItem('authToken');
    
    return await response.json();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};