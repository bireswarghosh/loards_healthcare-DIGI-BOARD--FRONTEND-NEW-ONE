import axios from "axios";

const BASE_URL = import.meta.env.VITE_WHATSAPP_API_BASE_URL;
const VENDOR_UID = import.meta.env.VITE_WHATSAPP_VENDOR_UID;
const TOKEN = import.meta.env.VITE_WHATSAPP_API_TOKEN;

const waApi = axios.create({
  baseURL: `${BASE_URL}/${VENDOR_UID}`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  },
});

// Send a text message
export const sendWhatsAppMessage = async (phoneNumber, messageBody, contactInfo = {}) => {
  const res = await waApi.post("/contact/send-message", {
    phone_number: phoneNumber,
    message_body: messageBody,
    contact: contactInfo.first_name ? contactInfo : undefined,
  });
  return res.data;
};

// Send a media (PDF/image/video) message
export const sendWhatsAppMedia = async (phoneNumber, mediaUrl, type = "document", caption = "") => {
  const res = await waApi.post("/contact/send-media-message", {
    phone_number: phoneNumber,
    media_url: mediaUrl,
    media_type: type,
    caption,
  });
  return res.data;
};

// Send a template message
export const sendWhatsAppTemplate = async (phoneNumber, templateName, templateLanguage = "en", fields = {}) => {
  const res = await waApi.post("/contact/send-template-message", {
    phone_number: phoneNumber,
    template_name: templateName,
    template_language: templateLanguage,
    ...fields,
  });
  return res.data;
};

export default waApi;
