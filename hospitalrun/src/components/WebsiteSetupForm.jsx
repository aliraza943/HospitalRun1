import { useEffect, useState } from 'react';

export default function SocialLinksForm() {
  const [formData, setFormData] = useState({
    siteName: '',
    siteUrl: '',
    facebook: '',
    instagram: '',
    twitter: ''
  });
  const [existingWebsite, setExistingWebsite] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchWebsiteData = async () => {
      try {
        const response = await fetch(
          'http://localhost:8080/api/website/get-website',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        const result = await response.json();

        if (response.ok && result.website) {
          setExistingWebsite(result.website);
          setFormData({
            siteName: result.website.siteName || '',
            // ← use the slug directly; no split needed
            siteUrl: result.website.url || '',
            facebook: result.website.socialLinks?.facebook || '',
            instagram: result.website.socialLinks?.instagram || '',
            twitter: result.website.socialLinks?.twitter || ''
          });
        } else {
          console.warn('No website data found');
        }
      } catch (error) {
        console.error('Error fetching website data:', error);
      }
    };
    fetchWebsiteData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    console.log('Submitting:', formData);

    try {
      const response = await fetch(
        'http://localhost:8080/api/website/save-social-links',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(formData)
        }
      );
      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage(result.message || 'Info saved successfully!');
        setExistingWebsite({ ...existingWebsite, ...formData });
      } else {
        setErrorMessage(result.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setErrorMessage('A network error occurred.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-4">
        Site Info &amp; Social Links
      </h2>

      {errorMessage && (
        <div className="mb-4 p-3 text-red-700 bg-red-100 rounded-md">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 text-green-700 bg-green-100 rounded-md">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Site Name */}
        <div>
          <label htmlFor="siteName" className="block text-sm font-medium">
            Site Name
          </label>
          <input
            type="text"
            id="siteName"
            name="siteName"
            value={formData.siteName}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            placeholder="My Awesome Site"
          />
        </div>

        {/* Site URL slug */}
        <div>
          <label htmlFor="siteUrl" className="block text-sm font-medium">
            Site URL
          </label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-600">
              http://localhost:5173/
            </span>
            <input
              type="text"
              id="siteUrl"
              name="siteUrl"
              value={formData.siteUrl}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 rounded-md"
              placeholder="your-site-url"
            />
          </div>
        </div>

        {/* Facebook */}
        <div>
          <label htmlFor="facebook" className="block text-sm font-medium">
            Facebook
          </label>
          <input
            type="url"
            id="facebook"
            name="facebook"
            value={formData.facebook}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            placeholder="https://facebook.com/yourprofile"
          />
        </div>

        {/* Instagram */}
        <div>
          <label htmlFor="instagram" className="block text-sm font-medium">
            Instagram
          </label>
          <input
            type="url"
            id="instagram"
            name="instagram"
            value={formData.instagram}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            placeholder="https://instagram.com/yourprofile"
          />
        </div>

        {/* Twitter */}
        <div>
          <label htmlFor="twitter" className="block text-sm font-medium">
            Twitter
          </label>
          <input
            type="url"
            id="twitter"
            name="twitter"
            value={formData.twitter}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            placeholder="https://twitter.com/yourprofile"
          />
        </div>

        {/* Preview full URL as a link */}
        {formData.siteUrl && (
          <div className="text-sm text-gray-500 mt-2">
            Preview:{' '}
            <a
              href={`http://localhost:5173/${formData.siteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:underline"
            >
              http://localhost:5173/{formData.siteUrl}
            </a>
          </div>
        )}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md mt-4"
        >
          Save Info
        </button>
      </form>
    </div>
  );
}
