'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod/v4'
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import Link from 'next/link'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const registerFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long")

}).refine((value) => value.password === value.confirmPassword, { message: "Passwords do not match", path: ['confirmPassword'] })
type RegisterFormValues = z.infer<typeof registerFormSchema>

const Page = () => {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const router = useRouter()
    const method = useForm<RegisterFormValues>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    })
    const handleSubmit = async (data: RegisterFormValues) => {
        setLoading(true)
        try {
            await authApi.register({ name: data.name, email: data.email, password: data.password });
            toast.success("Account created! Please sign in.");
            router.push('/sign-in')
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Registration failed");
            method.reset()
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className='h-screen w-screen flex items-center justify-center'
        >
            <Card className='p-4 bg-transparent '>
                <CardContent className='p-4 bg-transparent min-w-100'>
                    <div >
                        <div className="flex-1 flex items-center justify-center ">
                            <div className="w-full max-w-sm animate-fade-up">
                                <div className='flex items-center gap-2 mb-10 lg:hidden'>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(28 95% 58%)" }}>
                                        <Zap className="w-4 h-4 text-black" />
                                    </div>
                                    <span className="font-bold text-lg" style={{ fontFamily: "Syne, sans-serif" }}>TaskFlow</span>
                                </div>
                                <h1 className='text-3xl font-bold text-left'>Create an Account</h1>
                                <p className='text-muted-foreground text-left mt-2'>Enter your details below to create an account</p>


                                <form onSubmit={method.handleSubmit(handleSubmit)}>
                                    <div className='flex flex-col gap-2 mt-5'>
                                        <FieldGroup>
                                            <Controller
                                                control={method.control}
                                                name='name'
                                                render={({ field, fieldState }) => {
                                                    return <Field>
                                                        <FieldLabel>
                                                            Name
                                                        </FieldLabel>
                                                        <Input placeholder='name' {...field} />
                                                        <FieldError errors={[fieldState.error]} />
                                                    </Field>
                                                }}
                                            />
                                        </FieldGroup>

                                        <FieldGroup>
                                            <Controller
                                                control={method.control}
                                                name="email"
                                                render={({ field, fieldState }) => {
                                                    return (
                                                        <Field>
                                                            <FieldLabel>
                                                                Email
                                                            </FieldLabel>
                                                            <Input placeholder='email' {...field} />
                                                            <FieldError errors={[fieldState.error]} />
                                                        </Field>
                                                    )
                                                }}
                                            />
                                        </FieldGroup>
                                        <FieldGroup>
                                            <Controller
                                                control={method.control}
                                                name='password'
                                                render={({ field, fieldState }) => {
                                                    return <Field>
                                                        <FieldLabel>
                                                            Password
                                                        </FieldLabel>
                                                        <div className='relative'>
                                                            <Input
                                                                type={showPassword ? 'text' : 'password'}
                                                                placeholder='Password'
                                                                className='w-full'
                                                                {...field}
                                                            />
                                                            <Button variant={'ghost'} type='button' className='absolute right-0' onClick={() => setShowPassword(prev => !prev)} size={'sm'}>

                                                                {showPassword ? <EyeOff /> : <Eye />}
                                                            </Button>
                                                        </div>
                                                        <FieldError errors={[fieldState.error]} />
                                                    </Field>
                                                }}
                                            />
                                        </FieldGroup>
                                        <FieldGroup>
                                            <Controller
                                                control={method.control}
                                                name='confirmPassword'
                                                render={({ field, fieldState }) => {
                                                    return <Field>
                                                        <FieldLabel>
                                                            Confirm password
                                                        </FieldLabel>
                                                        <div className='relative'>
                                                            <Input
                                                                type={showConfirmPassword ? 'text' : 'password'}
                                                                placeholder='Password'
                                                                className='w-full'
                                                                {...field}
                                                            />
                                                            <Button variant={'ghost'} type='button' className='absolute right-0' onClick={() => setShowConfirmPassword(prev => !prev)} size={'sm'}>

                                                                {showConfirmPassword ? <EyeOff /> : <Eye />}
                                                            </Button>
                                                        </div>
                                                        <FieldError errors={[fieldState.error]} />
                                                    </Field>
                                                }}
                                            />
                                        </FieldGroup>
                                    </div>
                                    <div className='mt-5'>
                                        <Button
                                            type='submit'
                                            disabled={loading}
                                            className="w-full h-11 font-semibold"
                                            style={{ background: "hsl(28 95% 58%)", color: "hsl(20 14% 4%)" }}
                                        >
                                            Create Account
                                        </Button>
                                    </div>
                                    <p className="text-sm text-center mt-6" style={{ color: "hsl(40 10% 55%)" }}>
                                        Already have an account?{" "}
                                        <Link href="/sign-in" className="font-medium hover:underline" style={{ color: "hsl(28 95% 58%)" }}>
                                            Sign In
                                        </Link>
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default Page