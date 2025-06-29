import { Link } from "react-router-dom";

export default function TermsPrivacy() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12 font-[Montserrat]">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-10 border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-6">Terms of Service & Privacy Policy</h1>
        
        {/* Terms of Service */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Terms of Service</h2>
          <ol className="list-decimal ml-6 space-y-2 text-gray-700 text-base">
            <li>
              <strong>Acceptance:</strong> By using Aitheria, you agree to these Terms of Service and all applicable laws and regulations.
            </li>
            <li>
              <strong>Account:</strong> You are responsible for maintaining the confidentiality of your account and password.
            </li>
            <li>
              <strong>Usage:</strong> You agree not to misuse the service or attempt to access it using a method other than the interface and instructions provided.
            </li>
            <li>
              <strong>Content:</strong> You retain ownership of your data. You are responsible for the content you upload and share.
            </li>
            <li>
              <strong>Termination:</strong> We reserve the right to suspend or terminate your access if you violate these terms.
            </li>
            <li>
              <strong>Changes:</strong> We may update these terms from time to time. Continued use of the service means you accept the new terms.
            </li>
          </ol>
        </section>

        {/* Privacy Policy */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Privacy Policy</h2>
          <ol className="list-decimal ml-6 space-y-2 text-gray-700 text-base">
            <li>
              <strong>Data Collection:</strong> We collect only the information necessary to provide and improve our services.
            </li>
            <li>
              <strong>Data Usage:</strong> Your data is used solely for providing the Aitheria service and is not shared with third parties except as required by law.
            </li>
            <li>
              <strong>Security:</strong> We use industry-standard measures to protect your data.
            </li>
            <li>
              <strong>Cookies:</strong> We may use cookies to enhance your experience.
            </li>
            <li>
              <strong>Access & Deletion:</strong> You may request access to or deletion of your data at any time.
            </li>
           
          </ol>
        </section>

        <div className="text-center text-sm text-gray-500 mt-8">
          <Link to="/login" className="underline underline-offset-4 hover:text-pastel-pink">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}