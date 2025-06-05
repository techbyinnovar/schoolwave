import * as yup from 'yup'

export const demoSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    schoolname: yup.string().required('Schoolname is required'),
    phone: yup.string().matches(/^[\d\-+\s]+$/, 'Phone number can only contain digits, dashes, spaces, and plus signs')
    .min(11, 'Phone number must be at least 11 characters long').required('Phone number is required'),
})

export const contactSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    schoolname: yup.string().required('Schoolname is required'),
    phone: yup.string().matches(/^[\d\-+\s]+$/, 'Phone number can only contain digits, dashes, spaces, and plus signs')
    .min(11, 'Phone number must be at least 11 characters long').required('Phone number is required'),
    message: yup.string().required('Message is required'),
})