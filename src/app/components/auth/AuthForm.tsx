// AuthForms.tsx
import React, { useState } from 'react';
import { z } from 'zod';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import SubmitButton from '../Button';
import { FcGoogle } from "react-icons/fc";

// ============= Zod Schemas =============
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

  const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

  const signupSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  });

  const forgotPasswordSchema = z.object({
    email: emailSchema,
  });

  type InputFieldProps= {
    id: string;
    name: string;
    type: string;
    label: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    error?: string;
    icon: React.ReactNode;
    autoComplete?: string;

  }


type FormProps = {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
};


type SignupFormData = z.infer<typeof signupSchema>;
type LoginFormData = z.infer<typeof loginSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const InputField : React.FC<InputFieldProps> = ({id, name, type, label, placeholder, value, onChange, onBlur, error, icon, autoComplete}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  return (
    <div className="mb-4">
      <div className='flex justify-between'>
    <label htmlFor={id} className="block text-black text-sm font-medium mb-1">
      {label}
    </label>
    {name === 'password' && (
    <a href="/forgot-password" className="text-sm text-blue-500 hover:underline text-[12px]">
      Forgot Password?
    </a>
  )} 
  </div>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ">
        {icon}
      </div>
      <input 
        id={id}
        name={name}
        type={inputType}
        className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 text-black ${
          error ? ' focus:ring-black-200' : 'border-[#4B5768]'
        }`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
      />
      {isPassword && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center "
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FiEyeOff color='black'/> : <FiEye color='black'/>}
        </button>
      )}
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
  );

};

export const SignupForm: React.FC<FormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof SignupFormData, boolean>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate field if it's been touched
    if (touched[name as keyof SignupFormData]) {
      validateField(name as keyof SignupFormData);
    }
  };

  const handleBlur = (field: keyof SignupFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: keyof SignupFormData) => {
    try {
      if (field === 'name') {
        nameSchema.parse(formData.name);
      } else if (field === 'email') {
        emailSchema.parse(formData.email);
      } else if (field === 'password') {
        passwordSchema.parse(formData.password);
      } else if (field === 'confirmPassword') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords don't match");
        }
      }
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.errors[0].message }));
      } else if (error instanceof Error) {
        setErrors((prev) => ({ ...prev, [field]: error.message }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      return { ...acc, [key]: true };
    }, {}) as Record<keyof SignupFormData, boolean>;
    
    setTouched(allTouched);
    
    // Validate all fields
    try {
      const validData = signupSchema.parse(formData);
      onSubmit(validData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof SignupFormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof SignupFormData;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6">Create an Account</h2>
      
      <InputField
        id="name"
        name="name"
        type="text"
        label="Full Name"
        placeholder="Enter your full name"
        value={formData.name}
        onChange={handleChange}
        onBlur={() => handleBlur('name')}
        error={errors.name}
        icon={<FiUser className="text-gray-400" />}
        autoComplete="name"
      />
      
      <InputField
        id="email"
        name="email"
        type="email"
        label="Email Address"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange}
        onBlur={() => handleBlur('email')}
        error={errors.email}  
        icon={<FiMail className="text-gray-400" />}
        autoComplete="email"
      />
      
      <InputField
        id="password"
        name="password"
        type="password"
        label="Password"
        placeholder="Create a password"
        value={formData.password}
        onChange={handleChange}
        onBlur={() => handleBlur('password')}
        error={errors.password}
        icon={<FiLock className="text-gray-400" />}
        autoComplete="new-password"
      />
      
      <InputField
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Confirm Password"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChange={handleChange}
        onBlur={() => handleBlur('confirmPassword')}
        error={errors.confirmPassword}
        icon={<FiLock className="text-gray-400" />}
        autoComplete="new-password"
      />
      
      <div className="mt-6">
        <SubmitButton text="Sign Up" isLoading={isLoading} className="w-full py-2 px-4 bg-[#299D91] hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition duration-200" />
      </div>
    </form>
  );
};

export const LoginForm: React.FC<FormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LoginFormData, boolean>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate field if it's been touched
    if (touched[name as keyof LoginFormData]) {
      validateField(name as keyof LoginFormData);
    }
  };

  const handleBlur = (field: keyof LoginFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: keyof LoginFormData) => {
    try {
      if (field === 'email') {
        emailSchema.parse(formData.email);  
      } else if (field === 'password') {
        loginSchema.shape.password.parse(formData.password);
      }
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.errors[0].message }));
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      return { ...acc, [key]: true };
    }, {}) as Record<keyof LoginFormData, boolean>;
    
    setTouched(allTouched);
    
    // Validate all fields
    try {
      const validData = loginSchema.parse(formData);
      onSubmit(validData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof LoginFormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof LoginFormData;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-[#299D91] text-center">FINEbank.IO</h2>
      
      <InputField
        id="email"
        name="email"
        type="email"
        label="Email Address"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange}
        onBlur={() => handleBlur('email')}
        error={errors.email}
        icon={<FiMail className="text-gray-400" />}
        autoComplete="email"
      />
      
      <InputField
        id="password"
        name="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange}
        onBlur={() => handleBlur('password')}
        error={errors.password}
        icon={<FiLock className="text-gray-400" />}
        autoComplete="current-password"
      />
      
      {/* <div className="flex justify-end mb-4">
        <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
          Forgot Password?
        </a>
      </div> */}
      
      <div className="mt-6  "> 
        <SubmitButton text="Login" isLoading={isLoading} className='w-full py-2 px-4 bg-[#299D91] hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition duration-200'/>
        <div className='mt-4 w-[100%]  items-center justify-center grid grid-cols-3 gap-4'>
          <hr/>
          <p className='text-[#999DA3]'>or sign in with</p>
          <hr />
        </div>
        <div className=' relative items-center'>
          <SubmitButton text="Continue with Google" isLoading={isLoading} className='w-full mt-4 py-2 px-4 bg-[#E4E7EB] hover:bg-blue-700 text-[#4B5768] text-sm  font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition duration-200'
          />
          <FcGoogle  className='  absolute top-[62%] ml-[80px]   transform -translate-y-1/2 w-[24px] h-[24px]'/>
        </div>
       
      </div>
    </form>
  );
};

// ============= Forgot Password Form =============
export const ForgotPasswordForm: React.FC<FormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ForgotPasswordFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ForgotPasswordFormData, boolean>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate field if it's been touched
    if (touched[name as keyof ForgotPasswordFormData]) {
      validateField(name as keyof ForgotPasswordFormData);
    }
  };

  const handleBlur = (field: keyof ForgotPasswordFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: keyof ForgotPasswordFormData) => {
    try {
      if (field === 'email') {
        emailSchema.parse(formData.email);
      }
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.errors[0].message }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ email: true });
    
    // Validate all fields
    try {
      const validData = forgotPasswordSchema.parse(formData);
      onSubmit(validData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ForgotPasswordFormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof ForgotPasswordFormData;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
      <p className="mb-4 text-gray-600">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      <InputField
        id="email"
        name="email"
        type="email"
        label="Email Address"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange}
        onBlur={() => handleBlur('email')}
        error={errors.email}
        icon={<FiMail className="text-gray-400" />}
        autoComplete="email"
      />
      
      <div className="mt-6">
        <SubmitButton text="Send Reset Link" isLoading={isLoading} className='w-full py-2 px-4 bg-[#299D91] hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition duration-200'/>
      </div>
      
      <div className="mt-4 text-center">
        <a href="/login" className="text-sm text-blue-600 hover:text-blue-800">
          Back to Login
        </a>
      </div>
    </form>
  );
};