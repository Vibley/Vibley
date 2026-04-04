"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    setLoading(true);

    const res = await fetch("/api/waitlist", {
      method: "POST",
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        zip: formData.get("zip"),
        age: formData.get("age"),
        interest: formData.get("interest"),
      }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      form.reset();
    } else {
      alert("Something went wrong");
    }
  }

  if (success) {
    return <p className="text-green-400 font-semibold">✅ You're in.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <input name="name" placeholder="Name" required className="input" />
      <input name="email" type="email" placeholder="Email" required className="input" />

      <div className="grid md:grid-cols-2 gap-4">
        <input name="zip" placeholder="Zip Code" className="input" />

        <select name="age" required className="input">
          <option value="">Age</option>
          <option>18–24</option>
          <option>25–34</option>
          <option>35–44</option>
          <option>45–54</option>
          <option>55+</option>
        </select>
      </div>

      <select name="interest" required className="input">
        <option value="">What are you looking for?</option>
        <option>Friends</option>
        <option>Networking</option>
        <option>Activities</option>
      </select>

      <button
        disabled={loading}
        className="bg-gradient-to-r from-purple-600 to-cyan-400 py-3 rounded-lg font-semibold"
      >
        {loading ? "Joining..." : "Get Early Access"}
      </button>
    </form>
  );
}