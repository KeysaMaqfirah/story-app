import CONFIG from '../config';

const ENDPOINTS = {
  LOGIN: `${CONFIG.BASE_URL}/login`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
};

const AUTH_KEY = 'storyapp-token';
const USER_KEY = 'storyapp-user';

const getToken = () => {
  return localStorage.getItem(AUTH_KEY);
};

const setToken = (token) => {
  localStorage.setItem(AUTH_KEY, token);
};

const setUserData = (userData) => {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

export const getUserData = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

const clearAuthData = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isLoggedIn = () => {
  return !!getToken();
};

export async function login(email, password) {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const responseJson = await response.json();
    
    if (responseJson.error) {
      return { error: true, message: responseJson.message || 'Login failed' };
    }
    
    setToken(responseJson.loginResult.token);
    setUserData({
      id: responseJson.loginResult.userId,
      name: responseJson.loginResult.name,
      email: email
    });
    
    return { 
      error: false, 
      data: responseJson.loginResult,
      message: 'Login successful' 
    };
  } catch (error) {
    return { error: true, message: error.message || 'Network error occurred' };
  }
}

export async function register(name, email, password) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    
    const responseJson = await response.json();
    
    if (responseJson.error) {
      return { error: true, message: responseJson.message || 'Registration failed' };
    }
    
    return { 
      error: false, 
      message: responseJson.message || 'Registration successful' 
    };
  } catch (error) {
    return { error: true, message: error.message || 'Network error occurred' };
  }
}

export function logout() {
  clearAuthData();
  return { error: false, message: 'Logout successful' };
}

export async function getStories() {
  try {
    if (!isLoggedIn()) {
      
    }
    
    const response = await fetch(`${ENDPOINTS.STORIES}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    const responseJson = await response.json();
    
    if (responseJson.error) {
      return { error: true, message: responseJson.message || 'Failed to fetch stories' };
    }
    
    return { error: false, data: responseJson.listStory || [] };
  } catch (error) {
    return { error: true, message: error.message || 'Network error occurred' };
  }
}

export async function getStoryDetail(id) {
  try {
    if (!isLoggedIn()) {
      
    }
    
    const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    const responseJson = await response.json();
    
    if (responseJson.error) {
      return { error: true, message: responseJson.message || 'Failed to fetch story details' };
    }
    
    return { error: false, data: responseJson.story };
  } catch (error) {
    return { error: true, message: error.message || 'Network error occurred' };
  }
}

export async function addStory({ name, description, photo, lat, lon }) {
  try {
    if (!isLoggedIn()) {
      
    }
    
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    
    if (lat !== undefined && lon !== undefined) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }
    
    const response = await fetch(ENDPOINTS.ADD_STORY, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData,
    });
    
    const responseJson = await response.json();
    
    if (responseJson.error) {
      return { error: true, message: responseJson.message || 'Failed to add story' };
    }
    
    return { error: false, message: responseJson.message || 'Story added successfully' };
  } catch (error) {
    return { error: true, message: error.message || 'Network error occurred' };
  }
}