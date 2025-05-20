"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";

import { signUpSchema } from "@/schemas/signUpSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { set } from "zod/v4";

export default function SignUpForm() {
  const [verifying, setVerifying] = useState(false); // the state of the form verifying
  const [isSubmitting, setIsSubmitting] = useState(false); // the state of the form submitting
  const [authError, setAuthError] = useState<string | null>(null); // it can be null or string
  const { signUp, isLoaded, setActive } = useSignUp(); // the signUp function from Clerk

  // Kind of easy
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return;
    setIsSubmitting(true); // set the state of the form to submitting if it is loaded
    setAuthError(null); // set the state of the form to null if it is loading

    try {
      await signUp.create({
        emailAddress: data.email, // the email address from the form
        password: data.password, // the password from the form
      });
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true); // set the state of the form to verifying because the email is sent
    } catch (error: any) {
      console.error("SignUp Error:", error);
      setAuthError(
        error.errors?.[0]?.message ||
          "An error occured during the signup. Please try again"
      ); // set the state of the form to the error message
    } finally {
      setIsSubmitting(false); // set the state of the form to not submitting because it already submitted
    }
  };

  const handleVerificationSubmit = async () => {};

  if (verifying) {
    return <h1>This is OTP entering field</h1>;
  }

  return <h1>The form with email and other fields</h1>;
}
