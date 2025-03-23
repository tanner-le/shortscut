import AuthForm from '@/components/auth/AuthForm';
import AuthHeader from '@/components/auth/AuthHeader';

export const metadata = {
  title: 'Login | Shortscut',
  description: 'Login to your Shortscut account',
};

export default function LoginPage() {
  return (
    <>
      <AuthHeader />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-16">
        <AuthForm mode="login" />
      </div>
    </>
  );
} 