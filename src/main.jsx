import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerLicense } from '@syncfusion/ej2-base';
import App from './App.jsx';
import 'react-toastify/dist/ReactToastify.css';

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


