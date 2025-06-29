// src/hooks/useProjects.js
import { useEffect, useState } from "react"
import { databases } from "@/appwrite/client"

export function useProjects(userId) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    databases
      .listDocuments("685121b70037b398f4a7", "Y6851221a003005960079", [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
      ])
      .then(res => setProjects(res.documents))
      .finally(() => setLoading(false))
  }, [userId])

  return { projects, loading }
}