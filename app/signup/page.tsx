'use client';

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignUp } from "@clerk/nextjs"
import { Eye, EyeOff } from "lucide-react";
import { ClerkAPIError } from '@clerk/types'
import { isClerkAPIResponseError } from '@clerk/nextjs/errors'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<ClerkAPIError[]>();
  const [showPassword, setShowPassword] = useState(Boolean);

  const router = useRouter();

  if (!isLoaded) {
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code"
      });
      setPendingVerification(true);
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        console.log(JSON.stringify(err.errors[0].message))
        setError(err.errors);
      }
    }
  }

  const onPressVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) {
      return
    }

    try {
      const completeSignup = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignup.status !== 'complete') {
        console.log(JSON.stringify(completeSignup, null, 2));
      }
      
      if (completeSignup.status === 'complete') {
        await setActive({ session: completeSignup.createdSessionId });
        router.push('/dashboard');
      }
    } catch (error) {
        if (isClerkAPIResponseError(error)) {
          console.log(JSON.stringify(error, null, 2));
          setError(error.errors); 
        }
      }
  }

  return (
    <div className="flex items-center justify-center h-dvh bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Sign up for Todo Master
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!pendingVerification ? (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((showPassword) => !showPassword)
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error.map((error) => (
                    <div key={error.code}>
                      {error.message}
                    </div>
                  ))}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                Sign up
              </Button>
            </form>
          ) : (
            <form onSubmit={onPressVerify} className="space-y-4">
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter verification code"
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error.map((error) => (
                    <div key={error.code}>
                      {error.message}
                    </div>
                  ))}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                verify Email
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-primary hover:underline"
            >Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
