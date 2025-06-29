import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { account } from "@/appwrite/client"

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    account.get()
      .then(() => setLoading(false))
      .catch(() => navigate("/login"))
  }, [navigate])

  if (loading) return <div>Loading...</div>
  return children

}
