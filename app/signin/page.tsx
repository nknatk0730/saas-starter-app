'use client';

import { useSignIn } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClerkAPIError } from '@clerk/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const { isLoaded, signIn, setActive } = useSignIn();
  const [error, setError] = useState<ClerkAPIError[]>();
  const [showPassword, setShowPassword] = useState(Boolean);
  const router = useRouter();
  
  if (!isLoaded) {
    return null;
  }

  const submit = async (e:React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) {
      return null;
    }

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password: password,
      });

      if (result.status === 'complete') {
        await setActive({session: result.createdSessionId});
        router.push('/dashboard');
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        console.error("error", error.errors[0].message);
        setError(error.errors);
      }
    }
  }

  return (
    <div className="">
      <div className="flex items-center justify-center h-dvh bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Sign in for Todo Master
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                Sign in
              </Button>
            </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
    </div>
  );
}
