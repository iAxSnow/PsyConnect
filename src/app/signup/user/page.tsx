// @/app/signup/user/page.tsx
import { SignupForm } from "@/components/auth/signup-form";
import { AuthLayout } from "@/components/auth-layout";

export default function UserSignupPage() {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}
