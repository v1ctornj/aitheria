import { useState } from "react"
import { databases, ID } from "@/appwrite/client"

function NewProjectForm({ onCreated }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const doc = await databases.createDocument(
        "YOUR_DATABASE_ID",
        "YOUR_PROJECTS_COLLECTION_ID",
        ID.unique(),
        {
          title,
          description,
          tags: tags.split(",").map(t => t.trim()),
          userId: "CURRENT_USER_ID", // get from session
        }
      )
      onCreated(doc)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md w-full">
      <input className="input" placeholder="Project Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <textarea className="input" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <input className="input" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Project"}
      </button>
    </form>
  )
}

export default NewProjectForm