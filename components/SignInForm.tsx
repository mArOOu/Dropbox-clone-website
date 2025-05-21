"use client";

// Import necessary dependencies
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { signInSchema } from "@/schemas/signInSchema";

// SignInForm component handles user authentication using Clerk
export default function SignInForm() {
  // Next.js router for navigation
  const router = useRouter();
  // Clerk authentication hooks
  const { signIn, isLoaded, setActive } = useSignIn();
  // State for managing form submission and UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form with Zod schema validation
  // useForm hook manages form state and validation using the signInSchema
  // z.infer<typeof signInSchema> ensures TypeScript type safety based on the Zod schema
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema), // Connects Zod schema to form validation
    defaultValues: {
      identifier: "", // Initial empty email/identifier
      password: "", // Initial empty password
    },
  });

  // Handle form submission and authentication process
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    // Safety check: prevent submission if Clerk authentication is not ready
    if (!isLoaded) return;

    // Update UI state to show loading and clear any previous errors
    setIsSubmitting(true);
    setAuthError(null);

    try {
      // Attempt to create a new sign-in session with Clerk
      // data.identifier contains the user's email
      // data.password contains the user's password
      const result = await signIn.create({
        identifier: data.identifier,
        password: data.password,
      });

      // Check if authentication was successful
      if (result.status === "complete") {
        // Set the newly created session as active
        await setActive({ session: result.createdSessionId });
        // Redirect user to dashboard upon successful authentication
        router.push("/dashboard");
      } else {
        // Handle incomplete authentication (rare case)
        console.error("Sign-in incomplete:", result);
        setAuthError("Sign-in could not be completed. Please try again.");
      }
    } catch (error: any) {
      // Handle authentication errors
      console.error("Sign-in error:", error);
      // Display either the specific error from Clerk or a generic error message
      setAuthError(
        error.errors?.[0]?.message ||
          "An error occurred during sign-in. Please try again."
      );
    } finally {
      // Reset submission state regardless of success/failure
      setIsSubmitting(false);
    }
  };

  // Render the sign-in form interface
  return (
    <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
      <CardHeader className="flex flex-col gap-1 items-center pb-2">
        <h1 className="text-2xl font-bold text-default-900">Welcome Back</h1>
        <p className="text-default-500 text-center">
          Sign in to access your secure cloud storage
        </p>
      </CardHeader>

      <Divider />

      <CardBody className="py-6">
        {authError && (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="identifier"
              className="text-sm font-medium text-default-900">
              Email
            </label>
            <Input
              id="identifier"
              type="email"
              placeholder="your.email@example.com"
              startContent={<Mail className="h-4 w-4 text-default-500" />}
              isInvalid={!!errors.identifier}
              errorMessage={errors.identifier?.message}
              {...register("identifier")}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="text-sm font-medium text-default-900">
                Password
              </label>
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              startContent={<Lock className="h-4 w-4 text-default-500" />}
              endContent={
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button">
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-default-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-default-500" />
                  )}
                </Button>
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              {...register("password")}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardBody>

      <Divider />

      <CardFooter className="flex justify-center py-4">
        <p className="text-sm text-default-600">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
