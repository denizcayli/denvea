import axios from 'axios';
import initialDb from '../../db.json';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

function initDb() {
  if (!localStorage.getItem('denvea_db')) {
    localStorage.setItem('denvea_db', JSON.stringify(initialDb));
  }
}

function getDb() {
  initDb();
  return JSON.parse(localStorage.getItem('denvea_db'));
}

function saveDb(db) {
  localStorage.setItem('denvea_db', JSON.stringify(db));
}

if (!isLocalhost) {
  axiosInstance.interceptors.request.use((config) => {
    const url = config.url;
    const method = config.method.toUpperCase();
    const data = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : null;
    const db = getDb();
    
    let responseData = null;
    let status = 200;
    
    if (url === '/brands' && method === 'GET') {
      responseData = db.brands;
    } else if (url === '/forms' && method === 'GET') {
      responseData = db.forms;
    } else if (url === '/submissions' && method === 'GET') {
      responseData = db.submissions;
    } else if (url === '/users' && method === 'GET') {
      responseData = db.users;
    } else if (url === '/forms' && method === 'POST') {
      const newForm = { ...data, id: data.id || `form_${Date.now()}` };
      db.forms.push(newForm);
      saveDb(db);
      responseData = newForm;
      status = 201;
    } else if (url.startsWith('/forms/') && method === 'PUT') {
      const id = url.split('/').pop();
      const index = db.forms.findIndex(f => f.id === id);
      if (index !== -1) {
        db.forms[index] = data;
        saveDb(db);
        responseData = data;
      } else {
        status = 404;
      }
    } else if (url.startsWith('/forms/') && method === 'DELETE') {
      const id = url.split('/').pop();
      db.forms = db.forms.filter(f => f.id !== id);
      saveDb(db);
      responseData = { success: true };
    } else if (url === '/submissions' && method === 'POST') {
      const newSub = { ...data, id: data.id || String(Date.now()) };
      db.submissions.push(newSub);
      saveDb(db);
      responseData = newSub;
      status = 201;
    } else if (url === '/users' && method === 'POST') {
      const newUser = { ...data, id: data.id || String(Date.now()) };
      db.users.push(newUser);
      saveDb(db);
      responseData = newUser;
      status = 201;
    } else if (url.startsWith('/users/') && method === 'PUT') {
      const id = url.split('/').pop();
      const index = db.users.findIndex(u => u.id === id || String(u.id) === id);
      if (index !== -1) {
        db.users[index] = data;
        saveDb(db);
        responseData = data;
      } else {
        status = 404;
      }
    } else if (url.startsWith('/users/') && method === 'DELETE') {
      const id = url.split('/').pop();
      db.users = db.users.filter(u => u.id !== id && String(u.id) !== id);
      saveDb(db);
      responseData = { success: true };
    } else {
      status = 404;
    }
    
    config.adapter = () => {
      return Promise.resolve({
        data: responseData,
        status: status,
        statusText: status === 200 || status === 201 ? 'OK' : 'Not Found',
        headers: config.headers,
        config: config,
      });
    };
    
    return config;
  });
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
