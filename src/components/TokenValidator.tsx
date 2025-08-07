import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { validateToken } from '../api/request.api';
import Loader from './Loader';

const TokenValidator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateTokenFromURL = async () => {
      const token = searchParams.get('token');
      
      console.log('TokenValidator: Starting validation with token:', token);
      
      if (!token) {
        setError('Token topilmadi');
        setIsValidating(false);
        return;
      }

      try {
        console.log('TokenValidator: Making API call to validate token');
        const response = await validateToken(token);
        console.log('TokenValidator: API response:', response);
        
        // Check if response has required fields (name, group_name, subject_name)
        if (response && response.name && response.group_name && response.subject_name) {
          console.log('TokenValidator: Token valid, navigating to form');
          // Token valid, redirect to form page with token
          navigate('/form', { state: { token, testDetail: response } });
        } else {
          console.log('TokenValidator: Token invalid - missing required fields');
          setError('Token yaroqsiz yoki test mavjud emas');
        }
      } catch (err: any) {
        console.error('TokenValidator: API error:', err);
        
        // More specific error messages
        if (err.code === 'ECONNABORTED') {
          setError('Server javob bermayapti. Iltimos, keyinroq urinib ko\'ring.');
        } else if (err.response?.status === 404) {
          setError('Test topilmadi. Token noto\'g\'ri bo\'lishi mumkin.');
        } else if (err.response?.status === 500) {
          setError('Server xatoligi. Iltimos, keyinroq urinib ko\'ring.');
        } else if (err.message?.includes('Network Error')) {
          setError('Tarmoq xatoligi. Internet aloqasini tekshiring.');
        } else {
          setError('Token tekshirishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
        }
      } finally {
        setIsValidating(false);
      }
    };

    validateTokenFromURL();
  }, [searchParams, navigate]);

  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-lg">Token tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4">Xatolik</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TokenValidator; 