import axios from 'axios';

const whatsappAxios = axios.create({
  baseURL: 'http://crm.aisupportagentpro.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default whatsappAxios;
