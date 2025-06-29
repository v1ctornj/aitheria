import { Client, Account, Databases, Storage, ID } from 'appwrite';

const client = new Client();
// The API Keys are exposed here for demonstration purposes only.
// In a real-world application, you should never expose your API keys in the frontend.
// Always use environment variables and server-side functions to handle sensitive operations securely.

client
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // Appwrite Cloud endpoint
  .setProject('685118fa000082dca941');              // Replace with your project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID}