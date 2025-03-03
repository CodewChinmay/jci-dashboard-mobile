"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import axios from "axios";
import logo from "../assets/bizlogo (1).png";

export default function HelpCenter() {
  const [formData, setFormData] = useState({
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "subject" ? `JCI-Amravati - ${value}` : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("media.bizonance.in/mail/v1/system/helpcenter", formData);
      setIsSubmitted(true);
      setFormData({ email: "", subject: "", message: "" });
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center ">
      <main className="container mx-auto w-full bg-white px-10 ">
        <div className="flex flex-col items-center mb-6 ">
          <img
            src={logo}
            alt="Company Logo"
            className="h-40 w-40 mb-3 animate-fade-in"
          />
         
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Contact Information</h3>
            <ContactDetail icon={<Mail />} title="Email" text="info@bizonance.in" />
            <ContactDetail icon={<Phone />} title="Phone" text="+918956727311" />
            <ContactDetail
              icon={<MapPin />}
              title="Address"
              text={"2nd Floor, Opp. Vyankatesh Lawn\nShilangan Road,\nSaturna, Amaravati, Maharashtra 444607."}
            />
          </div>

          <div>
            <h3 className="text-xl font-medium mb-3">Writre your query to us</h3>
            {isSubmitted && (
              <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Thank you for your message! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <InputField label="Email Address" id="email" type="email" value={formData.email} onChange={handleChange} required />
              <InputField label="Subject" id="subject" value={formData.subject} onChange={handleChange} required />
              <TextAreaField label="Message" id="message" value={formData.message} onChange={handleChange} required />

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-transform transform hover:scale-105 flex items-center justify-center shadow-md"
              >
                <Send className="w-4 h-4 mr-2" /> Send Message
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

function ContactDetail({ icon, title, text }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 bg-blue-100 text-black flex items-center justify-center rounded-full">
        {icon}
      </div>
      <div>
        <h4 className="font-medium text-lg">{title}</h4>
        <p className="text-gray-600 whitespace-pre-line">{text}</p>
      </div>
    </div>
  );
}

function InputField({ label, id, type = "text", value, onChange, required }) {
  return (
    <div>
      <label htmlFor={id} className="block text-gray-700 font-medium mb-1">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        required={required}
      />
    </div>
  );
}

function TextAreaField({ label, id, value, onChange, required }) {
  return (
    <div>
      <label htmlFor={id} className="block text-gray-700 font-medium mb-1">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        required={required}
      ></textarea>
    </div>
  );
}
