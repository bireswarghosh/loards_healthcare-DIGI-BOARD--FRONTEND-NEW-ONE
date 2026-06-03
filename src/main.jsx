import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerLicense } from '@syncfusion/ej2-base';
import App from './App.jsx';
import './editor.css';
import 'react-toastify/dist/ReactToastify.css';

// Global print hook to inject "Printed By" and "Print Date & Time" on all window.open document writes
const originalOpen = window.open;
window.open = function(url, name, specs) {
  const win = originalOpen.call(window, url, name, specs);
  if (win) {
    try {
      const hookDocumentWrite = (doc) => {
        const originalWrite = doc.write;
        doc.write = function(html) {
          if (typeof html === 'string' && (
            html.includes('</body>') || 
            html.includes('</html>') || 
            html.includes('print') || 
            html.includes('Bill') || 
            html.includes('Report') || 
            html.includes('Receipt') ||
            html.includes('container') ||
            html.includes('table')
          )) {
            if (!html.includes('print-footer-info')) {
              const printedBy = localStorage.getItem("username") || "Admin";
              const printDateTime = new Date().toLocaleString("en-IN", { hour12: true });
              const footerHtml = `
                <div class="print-footer-info" style="margin-top: 25px; font-size: 10px; border-top: 1px dashed #000; padding-top: 5px; display: flex; justify-content: space-between; font-family: Arial, sans-serif; font-weight: bold; width: 100%; box-sizing: border-box;">
                  <div>Print Date & Time: ${printDateTime}</div>
                  <div>Printed By: ${printedBy}</div>
                </div>
              `;
              if (html.includes('</body>')) {
                html = html.replace('</body>', `${footerHtml}</body>`);
              } else if (html.includes('</html>')) {
                html = html.replace('</html>', `${footerHtml}</html>`);
              } else {
                html += footerHtml;
              }
            }
          }
          return originalWrite.call(doc, html);
        };
      };

      hookDocumentWrite(win.document);

      if (win.document.open) {
        const originalDocOpen = win.document.open;
        win.document.open = function() {
          const res = originalDocOpen.apply(win.document, arguments);
          hookDocumentWrite(win.document);
          return res;
        };
      }
    } catch (e) {
      console.error("Error hooking window.write:", e);
    }
  }
  return win;
};

registerLicense('Ngo9BigBOggjHTQxAR8/V1JHaF5cWWdCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdlWXxcd3VXQmJZUkVyX0NWYEo=');
import 'overlayscrollbars/overlayscrollbars.css';
import "react-datepicker/dist/react-datepicker.css";
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css'; 
import 'swiper/swiper.min.css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/scrollbar';
import 'aos/dist/aos.css';
import 'react-tooltip/dist/react-tooltip.css';
import { DigiContextProvider } from './context/DigiContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
      <DigiContextProvider>
        <App />
      </DigiContextProvider>
    </AuthProvider>,
)


