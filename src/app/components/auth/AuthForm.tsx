import {useState} from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useForm , SubmitHandler} from 'react-hook-form';
import { FiAlertCircle, FiLock, FiMail, FiUser, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';

type InputConfig = {
    label : string;
    type : string;
    placeholder : string;
    name : string;
    required : boolean;
    validation? : (value : string) => string | null;
}

type AuthFormProps = {
    inputs : InputConfig[];
    title : string;
    schema: z.ZodObject<any>;
    onSubmit: SubmitHandler<any>;
    additionalLinks?: React.ReactNode;
    showOAuth?: boolean;
}

const PasswordStrength = ({password} : {password : string}) => {
    
}

const AuthForm = ({inputs , title , onSubmit , additionalLinks}:AuthFormProps) => {
    const [FormData , setFormData] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

}

export default AuthForm;