'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react'; // Or any Google icon
import Image from 'next/image';

export default function LoginPage() {
  const { login, isLoading, isAuthenticated } = useAuth();

  // If already logged in, the context handles the redirect or you can do it here
  if (isAuthenticated) return null;

  return (
    // 1. OUTER WRAPPER: Centers the box and provides the page background
    <div className="flex items-center justify-center min-h-screen bg-[#001220] p-6">
      {/* 2. THE MAIN BOX: Fixed max-width, border, and overflow-hidden */}
      <div className="flex w-full max-w-250 h-150 bg-[#1A1625] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* LEFT SIDE: Image/Branding (Hidden on mobile) */}
        <div className="relative hidden lg:flex w-1/2 flex-col justify-between p-12">
          <div className="absolute inset-0 z-0">
            <Image
              src="/Pinnacle.png"
              alt="Website logo"
              fill
              className="object-cover opacity-50"
              priority
            />
            <div className="absolute" />
          </div>
        </div>

        {/* RIGHT SIDE: Login Section */}
        <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-16 bg-[#001F38]">
          <div className="w-full space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold text-white tracking-tight">Welcome!</h1>
              <p className="text-gray-400 text-sm">Please login to your account</p>
            </div>
            <div className="space-y-6">
              <Button
                onClick={() => login()}
                disabled={isLoading}
                className="group flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#200E00] text-white transition-all hover:bg-[#5a4399] active:scale-[0.95] hover:cursor-pointer"
              >
                <Chrome className="h-5 w-5" />
                {isLoading ? 'Connecting...' : 'Continue with Google'}
              </Button>

              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800"></div>
                </div>
                <span className="relative bg-[#1A1625] px-4 text-[10px] uppercase text-gray-500 tracking-widest font-bold">
                  Secure OAuth
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500">
              By clicking continue, you agree to our <br />
              <span className="text-gray-300 underline cursor-pointer">Terms</span> and{' '}
              <span className="text-gray-300 underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
