'use client'

import React, { useState } from 'react';
import { ForgotPasswordForm } from '../components/auth/AuthForm';

const SignupPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async (data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Example API call - replace with your actual signup implementation
      // await api.signup(data);
      console.log('Signup successful with data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      // Redirect or show success message
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow">
        {success ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Account Created!</h2>
            <p className="mb-4">Your account has been successfully created.</p>
            <a 
              href="/login" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Login
            </a>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            <ForgotPasswordForm onSubmit={handleForgotPassword} isLoading={isLoading} />
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-blue-600 hover:text-blue-800">
                  Log In
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignupPage;