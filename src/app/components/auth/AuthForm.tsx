// AuthForms.tsx
import React, { useState } from 'react';
import { z } from 'zod';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import SubmitButton from '../Button';
import { FcGoogle } from "react-icons/fc";
import { apiRequest } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from "react-hot-toast";

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
    <a href="/forgot-password" className="text-sm text-[#299D91] font-semibold text-[12px]">
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
        className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 text-black placeholder:text-[12px]  ${
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
    setIsSubmitting(true);
    setErrors({});

    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      return { ...acc, [key]: true };
    }, {}) as Record<keyof SignupFormData, boolean>;
    
    setTouched(allTouched);
    
    // Validate all fields
    try {
      const validData = signupSchema.parse(formData);
      // onSubmit(validData);
        // Call API to authenticate user
        const response = await apiRequest('signup', 'POST', validData);
        // Store token and redirect
        localStorage.setItem('token', response.token)
         // Show success toast before redirecting
        toast.success("Account created successfully! Redirecting...");

      setTimeout(() => {
        router.push("/login");
      }, 2000); // Delay to show toast
       
    } catch (error:any) {
      if (error instanceof z.ZodError) {
        toast.error(error.message);
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
         <h2 className="text-2xl font-bold mb-6 text-[#299D91] text-center">FINEbank.IO</h2>
      <h2 className="text-lg text-center   font-bold mb-6">Create an account</h2>
      
      <InputField
        id="name"
        name="name"
        type="text"
        label="Name"
        placeholder="Enter name"
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
      <p className='text-[12px] text-[#999DA3] text-center'>By Continuing, you agree to our <a className='text-[#299D91]'>terms of service</a></p>
      <div className="mt-6">
        <SubmitButton text={isSubmitting ? "Signing up" : "Sign up"} isLoading={isLoading} className="w-full py-2 px-4  bg-[#299D91] hover:bg-blue-700 text-white font-semibold rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200 transition duration-200" />
      </div>
      <div className='mt-4 w-[100%]  items-center justify-center grid grid-cols-3  gap-4'>
          <hr/>
          <p className='text-[#999DA3] lg:text-[16px] text-[12px]'>or sign up with</p>
          <hr />
        </div>
        <div className=' relative items-center'>
          <SubmitButton text="Continue with Google" isLoading={isLoading} className='w-full mt-4 py-2 px-4 bg-[#E4E7EB] hover:bg-blue-700 hover:text-white text-[#4B5768] text-sm  font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition duration-200'
          />
          <FcGoogle  className='  absolute top-[62%] ml-10 md:ml-[80px]    transform -translate-y-1/2 w-[24px] h-[24px] '/>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
    setIsSubmitting(true);
    setErrors({});

    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      return { ...acc, [key]: true };
    }, {}) as Record<keyof LoginFormData, boolean>;
    
    setTouched(allTouched);  
    
    // Validate all fields
    try {
      const validData = loginSchema.parse(formData);
      // onSubmit(validData);
      // Call API to authenticate user
      const response = await apiRequest('login', 'POST', validData);
      // Store token and redirect
      localStorage.setItem('token', response.token)
       // Show success toast before redirecting
      toast.success("Login successful! Redirecting...");

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000); // Delay to show toast
    } catch (error:any) {
      toast.error(error.message);
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof LoginFormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof LoginFormData;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }else{
        setErrors({password: error.message})
      }
    }finally{
      setIsSubmitting(false);
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
      
      
      
      <div className="mt-6  "> 
        <SubmitButton text="Login" isLoading={isLoading} className='w-full py-2 px-4 bg-[#299D91] hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition duration-200'/>
        <div className='mt-4 w-[100%]  items-center justify-center grid grid-cols-3  gap-4'>
          <hr/>
          <p className='text-[#999DA3] lg:text-[16px] text-[12px]'>or sign in with</p>
          <hr />
        </div>
        <div className=' relative items-center'>
          <SubmitButton text="Continue with Google" isLoading={isLoading} className='w-full mt-4 py-2 px-4 bg-[#E4E7EB] hover:bg-blue-700 hover:text-white text-[#4B5768] text-sm  font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition duration-200'
          />
          <FcGoogle  className='  absolute top-[62%] ml-10 md:ml-[80px]    transform -translate-y-1/2 w-[24px] h-[24px] '/>
        </div>
        <div className='mt-10 text-center'>
        <a href='/signup' className='mt-10 text-center text-[12px] text-[#299D91] font-semibold'>Create an account</a>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
    setIsSubmitting(true);
    setErrors({});
    
    // Mark all fields as touched
    setTouched({ email: true });
    
    // Validate all fields
    try {
      const validData = forgotPasswordSchema.parse(formData);
      // onSubmit(validData);
       // Call API to authenticate user
       const response = await apiRequest('forgot-password', 'POST', validData);
       // Store token and redirect
       localStorage.setItem('token', response.token)
       toast.success("Password reset link sent to your email!");

    } catch (error:any) {
      toast.error(error.message);
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
        <h2 className="text-2xl font-bold mb-4 text-[#299D91] text-center">FINEbank.IO</h2>
      <h2 className="text-[16px] font-bold mb-2 text-center">Forgot Password ?</h2>
      <p className="mb-4 text-gray-600 text-sm text-center max-w-[80%] mx-auto">
        Enter your email address to get the password reset link.
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
        <SubmitButton text={isSubmitting ? "Sending...":"Password Resrt"} isLoading={isLoading} className='w-full py-2 px-4 bg-[#299D91] hover:bg-blue-700 text-white font-medium rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200 transition duration-200'/>
      </div>
      
      <div className="mt-4 text-center">
        <a href="/login" className="text-sm text-[#999DA3] font-semibold hover:text-blue-800">
          Back to Login
        </a>
      </div>
    </form>
  );
};