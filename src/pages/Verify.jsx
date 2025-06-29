import { useEffect, useState } from "react";
import { account } from "../appwrite/client";
import { useSearchParams } from "react-router-dom";

export default function Verify() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");
    if (userId && secret) {
      account.updateVerification(userId, secret)
        .then(() => setStatus("Your email has been verified! You can now log in."))
        .catch(() => setStatus("Verification failed or link expired."));
    } else {
      setStatus("Invalid verification link.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-xl font-bold mb-4">Email Verification</h1>
        <p>{status}</p>
      </div>
    </div>
  );
}