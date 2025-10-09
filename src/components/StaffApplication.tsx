import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface StaffApplicationProps {
  onBack: () => void;
}

export default function StaffApplication({ onBack }: StaffApplicationProps) {
  const [formData, setFormData] = useState({
    discord_username: '',
    discord_id: '',
    age: '',
    timezone: '',
    experience: '',
    why_join: '',
    availability: '',
    additional_info: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { error: submitError } = await supabase
        .from('staff_applications')
        .insert([{
          discord_username: formData.discord_username,
          discord_id: formData.discord_id,
          age: parseInt(formData.age),
          timezone: formData.timezone,
          experience: formData.experience,
          why_join: formData.why_join,
          availability: formData.availability,
          additional_info: formData.additional_info || null
        }]);

      if (submitError) throw submitError;

      setSubmitSuccess(true);
      setFormData({
        discord_username: '',
        discord_id: '',
        age: '',
        timezone: '',
        experience: '',
        why_join: '',
        availability: '',
        additional_info: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-2">Staff Application</h1>
          <p className="text-gray-400 mb-8">Fill out the form below to apply for a staff position on our Discord server.</p>

          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-200">
              Application submitted successfully! We'll review it and get back to you soon.
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="discord_username" className="block text-sm font-medium mb-2">
                Discord Username *
              </label>
              <input
                type="text"
                id="discord_username"
                name="discord_username"
                value={formData.discord_username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="username#1234"
              />
            </div>

            <div>
              <label htmlFor="discord_id" className="block text-sm font-medium mb-2">
                Discord ID *
              </label>
              <input
                type="text"
                id="discord_id"
                name="discord_id"
                value={formData.discord_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="123456789012345678"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium mb-2">
                Age *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="13"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium mb-2">
                Timezone *
              </label>
              <input
                type="text"
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="EST, PST, GMT+1, etc."
              />
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium mb-2">
                Previous Moderation Experience *
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Describe your previous experience with moderation or community management..."
              />
            </div>

            <div>
              <label htmlFor="why_join" className="block text-sm font-medium mb-2">
                Why do you want to join the staff team? *
              </label>
              <textarea
                id="why_join"
                name="why_join"
                value={formData.why_join}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Tell us why you'd be a great addition to our team..."
              />
            </div>

            <div>
              <label htmlFor="availability" className="block text-sm font-medium mb-2">
                Availability *
              </label>
              <textarea
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="When are you typically available? (days, times, hours per week)"
              />
            </div>

            <div>
              <label htmlFor="additional_info" className="block text-sm font-medium mb-2">
                Additional Information
              </label>
              <textarea
                id="additional_info"
                name="additional_info"
                value={formData.additional_info}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Anything else you'd like us to know..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
