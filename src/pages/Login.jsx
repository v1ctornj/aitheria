// src/pages/Login.jsx
import React, { useState, useEffect } from 'react'
import { account } from '../appwrite/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from "@/lib/utils"
import { Link, useNavigate, Link as RouterLink } from "react-router-dom"
import logo from '/logo.png';
import useStore from "@/store";

export default function Login({ className, ...props }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  // --- Add this useEffect to redirect if already logged in ---
  useEffect(() => {
    account.get()
      .then(() => navigate("/dashboard"))
      .catch(() => {}); // Not logged in, stay on login page
  }, [navigate]);
  // ----------------------------------------------------------

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await account.createEmailPasswordSession(email, password)
      // Fetch user info and set userId in Zustand
      const user = await account.get();
      useStore.getState().setUserId(user.$id);
      navigate("/dashboard")
    } catch (err) {
      alert('Login failed: ' + err.message)
    }
  }

  return (
    <div className={cn("min-h-screen flex flex-col items-center justify-center bg-background", className)} {...props}>
      <form className="w-full max-w-md space-y-8" onSubmit={handleLogin}>
        <div className="flex flex-col items-center gap-2">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex h-12 w-12 items-center justify-center rounded-md overflow-hidden">
              <img src={logo} alt="aitheria" className="h-12 w-12 object-contain" />
            </div>
            <span className="sr-only">Aitheria</span>
          </a>
          <h1 className="text-xl font-bold">Welcome to Aitheria</h1>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full hover:cursor-pointer" >
            Login
          </Button>
        </div>
      </form>
      <div className="mt-6 text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our{" "}
        <RouterLink to="/terms">Terms of Service</RouterLink> and{" "}
        <RouterLink to="/terms">Privacy Policy</RouterLink>.
      </div>
    </div>
  )
}
