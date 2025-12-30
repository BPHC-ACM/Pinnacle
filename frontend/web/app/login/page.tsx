'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
// import { useAuth } from "@/hooks/useAuth";

/* Validating email and password */
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;


export default function LoginPage() {
  // const { login, isAuthenticated } = useAuth(); 
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      // await login(data.email, data.password);
      
      /*Redirecting to dashboard if correct, else shows error */
      router.push('/dashboard');
    } catch (error) {
      alert('Login failed. Please check your credentials.');
      console.error(error);
    }
  };

  // if (isAuthenticated) {
  //   router.push('/dashboard');
  //   return null;
  // }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#686279]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-8 border rounded-lg w-96 space-y-4 bg-[#2C2638] shadow-xl/100"
      >
        <h1 className="text-2xl font-bold text-center text-white">Login</h1>

        <div>
          <input 
            {...register('email')} 
            placeholder="Email" 
            className="w-full p-2 border rounded text-white outline-none focus:ring-2 focus:ring-blue-500" 
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <input
            {...register('password')}
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <Button variant={'outline'} type="submit"  disabled={isSubmitting}
          className="w-full bg-[#6D54B4] text-white p-2 rounded border-black hover:cursor-pointer disabled:bg-gray-400 transition-colors">{isSubmitting ? 'Authenticating...' : 'Log In'}</Button>

      </form>
    </div>
  );
}