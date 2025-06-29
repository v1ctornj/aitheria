import React, { useState, useEffect } from 'react';
import { account } from '../appwrite/client';
import { ID } from 'appwrite';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate, Link as RouterLink } from "react-router-dom"
import logo from '/logo.png';
import useStore from "@/store";

export default function Signup({ className, ...props }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    account.get()
      .then(() => navigate("/dashboard"))
      .catch(() => {}); // Not logged in, stay on signup page
  }, [navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await account.create(ID.unique(), email, password, name);
      // After signup, log in and set userId in Zustand
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      useStore.getState().setUserId(user.$id);
      alert('Account created! You can now log in.');
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert('Signup failed: ' + err.message);
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center justify-center bg-background", className)} {...props}>
      <form className="w-full max-w-md space-y-8" onSubmit={handleSignup}>
        <div className="flex flex-col items-center gap-2">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex h-12 w-12 items-center justify-center rounded-md overflow-hidden">
              <img src={logo} alt="aitheria" className="h-12 w-12 object-contain" />
            </div>
            <span className="sr-only">Aitheria</span>
          </a>
          <h1 className="text-xl font-bold">Create your account</h1>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline underline-offset-4">
              Login
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              required
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full hover:cursor-pointer ">
            Sign Up
          </Button>
        </div>
      </form>
      <div className="mt-6 text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By signing up, you agree to our{" "}
        <RouterLink to="/terms">Terms of Service</RouterLink> and{" "}
        <RouterLink to="/terms">Privacy Policy</RouterLink>.
      </div>
    </div>
  );
}
