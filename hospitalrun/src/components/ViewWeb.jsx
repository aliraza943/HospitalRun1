import { useState,useEffect } from 'react';
import DemoHeader from './DemoHeader';
import HeaderSettings from './HeaderSettings';
import HeroImage from './DemoHeroImage';
import ImageUploader from './ImageUploader';
import TextWithImageSection from './TextWithImageSecttion';
import TextSectionEditor from './TextSectionEditor';
import { useNavigate } from 'react-router-dom';
export default function App() {
  const [textSectionData, setTextSectionData] = useState({
    heading: 'About Us',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    imageSrc:
      'https://www.bwillcreative.com/wp-content/uploads/2020/08/BrendanWilliams-Portfolio-65-1024x683.jpg',
    mapCoords: '37.785834,-122.406417',
    mapLabel: "McDonald's – at 441 Sutter St, San Francisco, CA",
  });
  const [imageFile, setImageFile] = useState(null);

  const handleImageSelect = (file) => {
    setImageFile(file);
    setSectionImageFile(file); // <-- this is missing!
  };
  
  const navigate = useNavigate();
  const [originalImages, setOriginalImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [sectionImageFile, setSectionImageFile] = useState(null);

  useEffect(() => {
    const fetchWebsiteData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/website/get-website', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        const data = await response.json();
        console.log("THIS THE DATA RETURNED BY SERVER", data);
  
        if (data && data.website) {
          const {
            headerSettings,
            logoFileName,
            galleryImages,
            overlayTexts,
            textSection,
            textImageFileName,
          } = data.website;
  
          console.log("this is the image",data)
          setHeaderSettings((prev) => ({
            ...prev,
            ...headerSettings,
            logoPreview: logoFileName
              ? `http://localhost:8080/uploads/${logoFileName}`
              : prev.logoPreview,
          }));
  
          // Update gallery
          setOriginalImages(galleryImages);
          setHeroIconSettings({
            galleryImages: galleryImages.map((img) => `http://localhost:8080/uploads/${img.fileName}`),
            overlayTexts: overlayTexts || [],
          });
  
          // ✅ Update text section data if exists
          if (textSection) {
            setTextSectionData((prev) => ({
              ...prev,
              ...textSection,
              imageSrc: textSection.image
                ? `http://localhost:8080/uploads/${textSection.image}`
                : prev.imageSrc,
            }));
          }
          
        }
      } catch (error) {
        console.error('Error fetching website data:', error);
      }
    };
  
    fetchWebsiteData();
  }, []);
  
  const handleUploadLogo = () => {
    const { overlayTexts } = heroIconSettings;
    const formData = new FormData();
  
    // 1. Append logo only if it exists
    if (headerSettings.logoFile) {
      formData.append('logo', headerSettings.logoFile);
      console.log("logo appended");
    }
  
    // 2. Append new gallery images
    galleryFiles.forEach((file) => {
      formData.append('gallery[]', file);
    });
  
    const currentImageNames = galleryFiles.map((file) => file.name); // files user is uploading now
    const originalImageNames = originalImages.map((img) => img.fileName); // what was originally there
  
    const removedImages = originalImageNames.filter(
      (fileName) => !currentImageNames.includes(fileName)
    );
  
    // Append removed image names to be deleted on server
    formData.append('removedImages', JSON.stringify(deletedImages));
  
    // 4. Append Overlay Texts
    formData.append('overlayTexts', JSON.stringify(overlayTexts));
  
    // 5. Append Header Settings (excluding logoFile)
    const { logoFile, ...restHeaderSettings } = headerSettings;
    formData.append('headerSettings', JSON.stringify(restHeaderSettings));
  
    formData.append('textSection', JSON.stringify({
      heading: textSectionData.heading,
      text: textSectionData.text,
      mapCoords: textSectionData.mapCoords,
      mapLabel: textSectionData.mapLabel,
    }));
    
    if (sectionImageFile) {
      formData.append('textImage', sectionImageFile);
    }else{
      console.log("no textImageFile selected")
    }
    
    // 8. Send request
    fetch('http://localhost:8080/api/website/upload-logo', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Upload success:', data);
        alert('Files and settings uploaded successfully!');
        navigate('/sitesetup');
      })
      .catch((err) => {
        console.error('Upload error:', err);
        alert('Failed to upload data.');
      });
  };
  
    
  const defaultLogo =
    'https://image.similarpng.com/file/similarpng/very-thumbnail/2021/05/Logo-design-illustration-on-transparent-background-PNG.png';

  // Current page: 'header', 'hero', or 'heroIcons'
  const [currentPage, setCurrentPage] = useState('header');

  // Header settings state object.
  const [headerSettings, setHeaderSettings] = useState({
    logo: '',
    headerBgColor: '#ffffff',
    headerTextColor: '#000000',
    fontClass: 'font-sans',
  });

  // Hero (gallery) settings.
  const [heroIconSettings, setHeroIconSettings] = useState({
    galleryImages: [
      "https://phlow.github.io/feeling-responsive/images/gallery-example-7.jpg",
      "https://phlow.github.io/feeling-responsive/images/gallery-example-8.jpg",
      "https://phlow.github.io/feeling-responsive/images/gallery-example-5.jpg",
    ],
    overlayTexts: [
      'Welcome to Our Site',
      'Discover Our Services',
      'Get in Touch Today',
    ],
  });

  // Renders the main page content based on currentPage.
  const renderPage = () => {
    switch (currentPage) {
      case 'header':
        return (
          <>
            <HeaderSettings
              headerSettings={headerSettings}
              setHeaderSettings={setHeaderSettings}
            />
            <div className="text-center mt-6">
              <button
                onClick={() => setCurrentPage('hero')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </>
        );

      case 'hero':
        return (
          <>
            <HeroImage
              images={heroIconSettings.galleryImages}
              overlayTexts={heroIconSettings.overlayTexts}
            />
            <ImageUploader
              images={heroIconSettings.galleryImages}
              setImages={(images) =>
                setHeroIconSettings((prev) => ({
                  ...prev,
                  galleryImages: images,
                }))
              }
              overlayTexts={heroIconSettings.overlayTexts}
              setOverlayTexts={(overlayTexts) =>
                setHeroIconSettings((prev) => ({ ...prev, overlayTexts }))
              }
              galleryFiles={galleryFiles}
              setGalleryFiles={setGalleryFiles}
              deletedImages={deletedImages}  // Pass the state to ImageUploader if needed
              setDeletedImages={setDeletedImages}  
            />
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentPage('header')}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage('heroIcons')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </>
        );

      case 'heroIcons':
        return (
          <>
            <div className="text-center mt-6">
              <HeroImage
                images={heroIconSettings.galleryImages}
                overlayTexts={heroIconSettings.overlayTexts}
              />
            </div>
            <div className="mt-10">
            <TextWithImageSection
  heading={textSectionData.heading}
  text={textSectionData.text}
  imageSrc={textSectionData.imageSrc}
  mapCoords={textSectionData.mapCoords}
  mapLabel={textSectionData.mapLabel}
/>

            <TextSectionEditor
  sectionData={textSectionData}
  setSectionData={setTextSectionData}
  onImageSelect={handleImageSelect}

/>

            </div>
            <div className="text-center mt-6">
  <button
    onClick={() => setCurrentPage('hero')}
    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-4"
  >
    Previous
  </button>
  <button
    onClick={handleUploadLogo}
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
  >
    Confirm & Upload Logo
  </button>
</div>


       
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mt-6 mb-4">
        {currentPage === 'header' && 'Set Your Header'}
        {currentPage === 'hero' && 'Add Your Image Gallery'}
        {currentPage === 'heroIcons' && 'Hero Icons Settings'}
      </h2>
      <DemoHeader
        logoSrc={headerSettings.logoPreview || defaultLogo}
        logoAlt="Logo"
        navLinks={[
          { href: '/', text: 'Home' },
          { href: '/services', text: 'Services' },
          { href: '/blog', text: 'Blog' },
          { href: '/contact', text: 'Contact' },
        ]}
        socialLinks={{
          facebook: 'https://facebook.com',
          instagram: 'https://instagram.com',
          twitter: 'https://twitter.com',
        }}
        fontClass={headerSettings.fontClass}
        customBgColor={headerSettings.headerBgColor}
        customTextColor={headerSettings.headerTextColor}
      />

      {renderPage()}
    </div>
  );
}
