import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';


// ✅ Firebase initialization

// import { getFirestore } from "firebase/firestore";
// import { getAuth, signInAnonymously } from "firebase/auth";

// Replace with your own Firebase config
// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYtfatpjmmWr4qtPDJVtJpzYAOvzZ9aEo",
  authDomain: "pest-detection-7b2f2.firebaseapp.com",
  projectId: "pest-detection-7b2f2",
  storageBucket: "pest-detection-7b2f2.firebasestorage.app",
  messagingSenderId: "119305175515",
  appId: "1:119305175515:web:cd940429f2c88b8fe6e7fe",
  measurementId: "G-DMZFMKRVGJ"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Optional: Sign in anonymously (for Firestore use without login)
signInAnonymously(auth)
  .then(() => console.log("Signed in anonymously"))
  .catch((error) => console.error("Auth error:", error));


// --- Icon Components (Inline SVG for simplicity) ---
const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9V6h2v7zm0 2H9v-2h2v2z" /></svg>;
const AboutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.342.639l.586 3.469a1 1 0 001.94-.329l-.5-2.93a.999.999 0 01.342-.64l2.766-3.159a1 1 0 00.12-.89l-.5-2.93a1 1 0 00-1.94-.33l.258 1.516-2.47-2.823a1 1 0 00-1.292-.121l-3.35 2.149L10 11.17l8.25-5.333a1 1 0 000-1.84l-7-3a1 1 0 00-.856.08z" /></svg>;
const ContactIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>;
const SpeakerIcon = ({ lang }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <text x="18" y="21" fontFamily="Arial" fontSize="6" fill="currentColor">{lang}</text>
    </svg>
);





// --- MOCKED PEST DATA (Simulating AI Model Backend) ---
const PEST_DATA = {
    'aphid': {
        pest_name: 'Aphid',
        scientific_name: 'Aphidoidea',
        description: 'Aphids are small, sap-sucking insects that are common pests on a wide variety of plants. They reproduce quickly and can cause significant damage by stunting growth and transmitting plant viruses.',
        origin: 'Worldwide, with many species specific to certain regions and host plants.',
        affected_crops: ['Roses', 'Tomatoes', 'Lettuce', 'Broccoli', 'Most garden plants'],
        symptoms: 'Yellowed or distorted leaves, sticky "honeydew" substance on leaves, presence of sooty mold, stunted plant growth.',
        treatment: {
            organic_cure: 'Introduce natural predators like ladybugs or lacewings. Spray plants with a strong jet of water or apply insecticidal soap or neem oil.',
            pesticides: 'Pyrethrin-based insecticides, imidacloprid (use with caution to protect pollinators).',
        },
        preventive_measures: 'Regularly inspect plants, encourage beneficial insects, use reflective mulches, and avoid over-fertilizing with nitrogen.',
        severity: 'Moderate'
    },
    'whitefly': {
        pest_name: 'Whitefly',
        scientific_name: 'Aleyrodidae',
        description: 'Whiteflies are tiny, winged insects that feed on the undersides of plant leaves. They are related to aphids and can cause similar damage by sucking sap and transmitting diseases.',
        origin: 'Typically found in warmer climates but can be a greenhouse pest worldwide.',
        affected_crops: ['Tomatoes', 'Peppers', 'Sweet Potatoes', 'Cotton', 'Citrus'],
        symptoms: 'Yellowing and wilting of leaves, sticky honeydew, sooty mold, and clouds of tiny white insects when the plant is disturbed.',
        treatment: {
            organic_cure: 'Use yellow sticky traps to capture adults. Spray with insecticidal soap or neem oil. Release natural predators like Encarsia formosa.',
            pesticides: 'Imidacloprid, acetamiprid, pyriproxyfen.',
        },
        preventive_measures: 'Inspect new plants before introducing them to your garden. Use row covers on susceptible crops. Remove infested plant material immediately.',
        severity: 'High'
    },
    'caterpillar': {
        pest_name: 'Caterpillar (Cabbage Looper)',
        scientific_name: 'Trichoplusia ni',
        description: 'Caterpillars are the larval stage of moths and butterflies. Many species are voracious eaters of plant leaves, stems, and fruits, causing significant agricultural damage.',
        origin: 'Varies widely by species. Cabbage loopers are found throughout North America.',
        affected_crops: ['Cabbage', 'Kale', 'Broccoli', 'Tomatoes', 'Corn'],
        symptoms: 'Large, irregular holes in leaves. Chewed flowers or fruits. Presence of frass (caterpillar droppings). Visible larvae on plants.',
        treatment: {
            organic_cure: 'Handpick caterpillars off plants. Apply Bacillus thuringiensis (Bt), a natural bacterium that targets caterpillars. Encourage predatory birds and wasps.',
            pesticides: 'Spinosad, permethrin, carbaryl.',
        },
        preventive_measures: 'Use floating row covers to prevent moths from laying eggs. Till the soil in the fall to expose overwintering pupae. Plant companion plants that deter moths.',
        severity: 'High'
    },
    'powdery_mildew': {
        pest_name: 'Powdery Mildew',
        scientific_name: 'Erysiphales',
        description: 'A common fungal disease that appears as white, powdery spots on leaves and stems. It thrives in high humidity and moderate temperatures, weakening the plant by blocking photosynthesis.',
        origin: 'Global. Different species of the fungus affect different plants.',
        affected_crops: ['Squash', 'Cucumbers', 'Roses', 'Grapes', 'Zinnias'],
        symptoms: 'White powdery spots on leaves, stems, and sometimes fruit. Leaves may turn yellow and dry out. Distorted shoot growth.',
        treatment: {
            organic_cure: 'Spray with a solution of baking soda (1 tbsp), horticultural oil (1 tsp), and water (1 gallon). Apply neem oil or a milk spray (1 part milk to 9 parts water).',
            pesticides: 'Fungicides containing potassium bicarbonate, sulfur, or triforine.',
        },
        preventive_measures: 'Ensure good air circulation around plants. Water plants at the base to avoid wet leaves. Choose disease-resistant plant varieties. Remove and destroy infected plant parts.',
        severity: 'Low'
    }
};

const pestKeys = Object.keys(PEST_DATA);

// --- Main App Component ---
export default function App() {
    const [page, setPage] = useState('home');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [userId, setUserId] = useState(null);

    // --- Firebase Auth & Firestore Listener ---
    useEffect(() => {
        const authenticateUser = async () => {
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                 console.error("Authentication failed:", error);
            }
        };
        
        authenticateUser();

        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
        });

        return () => unsubscribeAuth();
    }, []);
    
    useEffect(() => {
        if (!userId) return;

        const historyCollection = collection(db, 'detections', userId, 'records');
        const q = query(historyCollection);
        
        const unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
            const historyData = [];
            querySnapshot.forEach((doc) => {
                historyData.push({ id: doc.id, ...doc.data() });
            });
            // Sort by timestamp, newest first
            historyData.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
            setHistory(historyData);
        }, (error) => {
            console.error("Error fetching history:", error);
        });

        return () => unsubscribeFirestore();

    }, [userId]);


    // --- Handlers ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setResult(null); // Clear previous result
        }
    };

    const handleDetect = async () => {
        if (!selectedImage) return;
        setIsLoading(true);
        setResult(null);

        // Simulate AI model processing
        setTimeout(async () => {
            // In a real app, you would send the image to your backend API here.
            // For this demo, we'll randomly select a pest.
            const randomPestKey = pestKeys[Math.floor(Math.random() * pestKeys.length)];
            const prediction = PEST_DATA[randomPestKey];
            
            // This is a placeholder for the actual image URL you'd get after uploading to a storage service.
            // Since we can't upload in this environment, we'll just use the preview for display.
            const imageUrl = imagePreview; 

            const detectionRecord = {
                pestName: prediction.pest_name,
                severity: prediction.severity,
                imageUrl: imageUrl, // In a real app, this would be a cloud storage URL
                timestamp: new Date(),
                fullData: prediction // Store all data for detailed view
            };
            
            // Save to Firestore
            if(userId) {
                try {
                    const historyCollection = collection(db, 'detections', userId, 'records');
                    await addDoc(historyCollection, detectionRecord);
                } catch(e) {
                    console.error("Error adding document: ", e);
                }
            }


            setResult(detectionRecord);
            setIsLoading(false);
            setPage('result');
        }, 3000); // 3-second delay to simulate processing
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            // Create a synthetic event for handleImageChange
            handleImageChange({ target: { files: [file] } });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    
    const viewHistoryItem = (item) => {
        setResult({
            pestName: item.pestName,
            severity: item.severity,
            imageUrl: item.imageUrl,
            fullData: item.fullData
        });
        setPage('result');
    }

    const resetHome = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setResult(null);
        setPage('home');
    }

    const renderPage = () => {
        switch (page) {
            case 'home':
                return <HomePage onDetect={handleDetect} onImageChange={handleImageChange} imagePreview={imagePreview} isLoading={isLoading} handleDrop={handleDrop} handleDragOver={handleDragOver} />;
            case 'result':
                return <ResultPage result={result} onBack={resetHome} />;
            case 'history':
                return <HistoryPage history={history} onViewItem={viewHistoryItem} />;
            case 'about':
                return <AboutPage />;
            case 'contact':
                return <ContactPage userId={userId} />;
            default:
                return <HomePage onDetect={handleDetect} onImageChange={handleImageChange} imagePreview={imagePreview} isLoading={isLoading} handleDrop={handleDrop} handleDragOver={handleDragOver}/>;
        }
    };

    return (
        <div className="bg-f4f9f4 min-h-screen font-sans text-gray-800">
            <Header setPage={setPage} currentPage={page} />
            <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
                {renderPage()}
            </main>
            <Footer />
        </div>
    );
}

// --- Page Components ---

const Header = ({ setPage, currentPage }) => {
    const navItemClass = (pageName) => 
        `cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            currentPage === pageName 
            ? 'bg-green-700 text-white shadow-md' 
            : 'text-green-800 hover:bg-green-200'
        }`;

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 text-green-700 font-bold text-xl flex items-center">
                           <LeafIcon />
                           <span>AgroDetect</span>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <a onClick={() => setPage('home')} className={navItemClass('home')}>Home</a>
                            <a onClick={() => setPage('history')} className={navItemClass('history')}>History</a>
                            <a onClick={() => setPage('about')} className={navItemClass('about')}>About</a>
                            <a onClick={() => setPage('contact')} className={navItemClass('contact')}>Contact</a>
                        </div>
                    </div>
                     <div className="md:hidden">
                        <select 
                            onChange={(e) => setPage(e.target.value)} 
                            value={currentPage}
                            className="bg-green-600 text-white p-2 rounded-md"
                        >
                            <option value="home">Home</option>
                            <option value="history">History</option>
                            <option value="about">About</option>
                            <option value="contact">Contact</option>
                        </select>
                    </div>
                </div>
            </nav>
        </header>
    );
};


const HomePage = ({ onDetect, onImageChange, imagePreview, isLoading, handleDrop, handleDragOver }) => (
    <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-800 mb-4 animate-fade-in-down">Smart Pest Detection System</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-up">Upload an image of an infected plant leaf to get an instant analysis and solution.</p>

        <div 
            className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto border-2 border-dashed border-gray-300 hover:border-green-500 transition-all duration-300"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {imagePreview ? (
                <div className="mb-4">
                    <img src={imagePreview} alt="Selected plant" className="max-h-80 w-auto mx-auto rounded-xl shadow-md" />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64">
                    <UploadIcon />
                    <p className="mt-4 text-gray-500">Drag & Drop an image here or click below</p>
                </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
                <label htmlFor="file-upload" className="cursor-pointer bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-transform transform hover:scale-105 shadow-md w-full sm:w-auto">
                    Choose Image
                </label>
                <input id="file-upload" type="file" accept="image/*" onChange={onImageChange} className="hidden" />

                <button 
                    onClick={onDetect} 
                    disabled={!imagePreview || isLoading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto"
                >
                    {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing...
                        </>
                    ) : 'Detect Pest'}
                </button>
            </div>
        </div>
    </div>
);

const ResultPage = ({ result, onBack }) => {
    const [activeTab, setActiveTab] = useState('description');
    
    if (!result) return <div className="text-center p-8">No result found. Please go back and upload an image.</div>;

    const { pestName, severity, imageUrl, fullData } = result;
    
    const severityStyles = useMemo(() => {
        switch (severity?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-800 border-red-500';
            case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
            case 'low': return 'bg-green-100 text-green-800 border-green-500';
            default: return 'bg-gray-100 text-gray-800 border-gray-500';
        }
    }, [severity]);

    const speak = (lang) => {
        if ('speechSynthesis' in window) {
            const textToSpeak = `
                Pest Detected: ${pestName}.
                Severity level: ${severity}.
                Description: ${fullData.description}.
                Symptoms: ${fullData.symptoms}.
                Organic Cure: ${fullData.treatment.organic_cure}.
                Pesticides: ${fullData.treatment.pesticides}.
                Prevention: ${fullData.preventive_measures}.
            `;
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = lang;
            window.speechSynthesis.cancel(); // Cancel any previous speech
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Sorry, your browser does not support text-to-speech.');
        }
    };

    return (
        <div className="animate-fade-in bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 md:p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Detection Result</h2>
                <div className="flex justify-between items-start mb-6">
                    <p className="text-gray-600">Here's the analysis of the uploaded image.</p>
                    <div className="flex space-x-2">
                        <button onClick={() => speak('en-US')} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Speak in English">
                           <SpeakerIcon lang="EN"/>
                        </button>
                        <button onClick={() => speak('hi-IN')} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Speak in Hindi">
                           <SpeakerIcon lang="HI"/>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Image & Basic Info */}
                    <div className="flex flex-col items-center">
                        <img src={imageUrl} alt="Uploaded plant" className="w-full h-auto object-cover rounded-xl shadow-lg mb-4" />
                        <h3 className="text-2xl font-bold text-center text-green-800">{pestName}</h3>
                        <p className="text-sm text-gray-500 mb-4">({fullData.scientific_name})</p>
                        <div className={`border-l-4 px-4 py-2 rounded-r-lg ${severityStyles}`}>
                            <span className="font-bold">Severity:</span> {severity}
                        </div>
                    </div>

                    {/* Right Column: Detailed Info Tabs */}
                    <div>
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <a onClick={() => setActiveTab('description')} className={`cursor-pointer shrink-0 border-b-2 py-4 px-1 text-sm font-medium ${activeTab === 'description' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Description</a>
                                <a onClick={() => setActiveTab('treatment')} className={`cursor-pointer shrink-0 border-b-2 py-4 px-1 text-sm font-medium ${activeTab === 'treatment' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Treatment</a>
                                <a onClick={() => setActiveTab('prevention')} className={`cursor-pointer shrink-0 border-b-2 py-4 px-1 text-sm font-medium ${activeTab === 'prevention' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Prevention</a>
                            </nav>
                        </div>
                        
                        <div className="mt-6 text-gray-700 space-y-4 text-justify">
                            {activeTab === 'description' && (
                                <div className="animate-fade-in-fast">
                                    <h4 className="font-bold text-lg mb-2">Description</h4>
                                    <p>{fullData.description}</p>
                                    <h4 className="font-bold text-lg mt-4 mb-2">Symptoms</h4>
                                    <p>{fullData.symptoms}</p>
                                     <h4 className="font-bold text-lg mt-4 mb-2">Affected Crops</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {fullData.affected_crops.map(crop => <span key={crop} className="bg-gray-200 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">{crop}</span>)}
                                    </div>
                                </div>
                            )}
                             {activeTab === 'treatment' && (
                                <div className="animate-fade-in-fast">
                                    <h4 className="font-bold text-lg text-green-700 mb-2">Organic Cures</h4>
                                    <p>{fullData.treatment.organic_cure}</p>
                                    <h4 className="font-bold text-lg text-red-700 mt-4 mb-2">Pesticide Treatments</h4>
                                    <p>{fullData.treatment.pesticides}</p>
                                </div>
                            )}
                             {activeTab === 'prevention' && (
                                <div className="animate-fade-in-fast">
                                    <h4 className="font-bold text-lg mb-2">Preventive Measures</h4>
                                    <p>{fullData.preventive_measures}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button onClick={onBack} className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-transform transform hover:scale-105 shadow-md">
                        Detect Another
                    </button>
                </div>
            </div>
        </div>
    );
};

const HistoryPage = ({ history, onViewItem }) => {
    const pestCounts = useMemo(() => {
        const counts = {};
        history.forEach(item => {
            counts[item.pestName] = (counts[item.pestName] || 0) + 1;
        });
        return counts;
    }, [history]);
    
    const chartData = Object.entries(pestCounts);
    const maxCount = Math.max(...Object.values(pestCounts), 0);

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center"><HistoryIcon />Detection History</h2>
            
            {history.length === 0 ? (
                <div className="text-center bg-white p-12 rounded-xl shadow-md">
                    <p className="text-gray-500">No detections have been recorded yet.</p>
                    <p className="text-gray-500 mt-2">Upload an image on the homepage to start your history.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2">
                        <div className="space-y-4">
                            {history.map(item => (
                                <div key={item.id} className="bg-white p-4 rounded-xl shadow-md flex items-center gap-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                                    <img src={item.imageUrl} alt={item.pestName} className="w-20 h-20 object-cover rounded-lg" />
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-lg text-green-800">{item.pestName}</h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(item.timestamp.seconds * 1000).toLocaleString()}
                                        </p>
                                        <p className={`text-sm font-semibold ${item.severity === 'High' ? 'text-red-600' : item.severity === 'Moderate' ? 'text-yellow-600' : 'text-green-600'}`}>
                                            Severity: {item.severity}
                                        </p>
                                    </div>
                                    <button onClick={() => onViewItem(item)} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                                        View
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="font-bold text-xl mb-4 text-center">Detection Stats</h3>
                        <div className="space-y-4">
                           {chartData.length > 0 ? chartData.map(([pest, count]) => (
                                <div key={pest} className="w-full">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-base font-medium text-gray-700">{pest}</span>
                                        <span className="text-sm font-medium text-gray-700">{count}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div 
                                            className="bg-green-600 h-2.5 rounded-full" 
                                            style={{width: `${(count / maxCount) * 100}%`}}
                                        ></div>
                                    </div>
                                </div>
                           )) : <p className="text-center text-gray-500">No stats yet.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const AboutPage = () => (
    <div className="bg-white p-8 rounded-2xl shadow-xl animate-fade-in text-gray-700 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center"><AboutIcon/>About This Project</h2>
        
        <p className="text-lg">The <strong>Smart IoT-Based Pest Detection System</strong> is a modern solution designed to help farmers and researchers identify plant pests quickly and accurately using the power of Artificial Intelligence and Computer Vision.</p>
        
        <div>
            <h3 className="text-2xl font-semibold text-green-700 mb-3">How It Works</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li><strong>Image Upload:</strong> A user uploads an image of a potentially infected plant leaf through our web interface.</li>
                <li><strong>AI Analysis:</strong> The image is sent to a powerful, pre-trained AI model (like CNN, YOLO, or ResNet) on our backend. The model analyzes the image to identify patterns and characteristics of various pests.</li>
                <li><strong>Instant Results:</strong> The system returns a detailed analysis, including the pest's name, description, severity, and recommended treatments.</li>
                <li><strong>Data Logging:</strong> Every detection is saved to a database, creating a historical log that helps in tracking pest outbreaks over time.</li>
            </ol>
        </div>

        <div>
            <h3 className="text-2xl font-semibold text-green-700 mb-3">IoT Integration for Automated Farming</h3>
            <p>This system is built to integrate seamlessly with Internet of Things (IoT) devices for automated field monitoring. Farmers can deploy low-cost camera modules in their fields to create a smart surveillance network.</p>
            <div className="mt-4 p-6 bg-green-50 rounded-lg border-l-4 border-green-500">
                <p><strong>Example Setup:</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>An <strong>ESP32-CAM</strong> or a <strong>Raspberry Pi with a camera</strong> is installed in the field.</li>
                    <li>The device is programmed to capture images of crops at regular intervals (e.g., every hour).</li>
                    <li>These images are automatically sent to our system's dedicated IoT endpoint: <code>/api/iot-upload</code>.</li>
                    <li>If a pest is detected with high severity, the system can be configured to send an instant alert (SMS or email) to the farmer.</li>
                </ul>
            </div>
        </div>

        <div>
            <h3 className="text-2xl font-semibold text-green-700 mb-3">Benefits for Sustainable Agriculture</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Early Detection:</strong> Identify pest problems before they spread, reducing crop loss.</li>
                <li><strong>Targeted Treatment:</strong> Apply the right treatment for the specific pest, reducing the overuse of broad-spectrum pesticides.</li>
                <li><strong>Reduced Costs:</strong> Save money on pesticides and labor by making informed decisions.</li>
                <li><strong>Environmentally Friendly:</strong> Promotes the use of organic cures and precise pesticide application, protecting the local ecosystem.</li>
            </ul>
        </div>
    </div>
);

const ContactPage = ({ userId }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!name || !email || !message) {
            setError("All fields are required.");
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            const feedbackCollection = collection(db, 'feedback');
            await addDoc(feedbackCollection, {
                name,
                email,
                message,
                userId: userId || 'anonymous',
                timestamp: new Date()
            });
            setSubmitted(true);
        } catch (err) {
            console.error("Error submitting feedback:", err);
            setError("Failed to send feedback. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (submitted) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-xl animate-fade-in text-center max-w-lg mx-auto">
                 <h2 className="text-3xl font-bold text-green-700 mb-4">Thank You!</h2>
                 <p className="text-gray-600">Your feedback has been received. We appreciate you taking the time to contact us.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl animate-fade-in max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center"><ContactIcon/>Contact Us</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" required/>
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" required/>
                </div>
                 <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message or Feedback</label>
                    <textarea id="message" rows="4" value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" required></textarea>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400">
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const Footer = () => (
    <footer className="bg-white mt-12 py-4 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} Smart Pest Detection System. All rights reserved.</p>
        </div>
    </footer>
);

