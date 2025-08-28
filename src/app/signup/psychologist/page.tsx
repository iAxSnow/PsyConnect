// @/app/signup/psychologist/page.tsx
import { PsychologistSignupForm } from "@/components/auth/psychologist-signup-form";
import { AuthLayout } from "@/components/auth-layout";

export default function PsychologistSignupPage() {
  return (
    <AuthLayout>
        <PsychologistSignupForm />
    </AuthLayout>
  );
}
