import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Instagram, Facebook } from 'lucide-react';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import logoImage from 'figma:asset/7d080da03162ad20f64b524a10976385d4aa17dc.png';

interface FormData {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  typePersonne: string;
  classe: string;
  source: string;
}

interface Step {
  id: string;
  question: string;
  type: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

const typePersonneOptions = [
  { value: 'collegien', label: 'Collégien' },
  { value: 'lyceen', label: 'Lycéen' },
  { value: 'parent', label: 'Parent' },
  { value: 'professeur', label: 'Professeur' },
];

const classeOptions = [
  { value: '6eme', label: '6ème' },
  { value: '5eme', label: '5ème' },
  { value: '4eme', label: '4ème' },
  { value: '3eme', label: '3ème' },
  { value: '2nd', label: '2nd' },
  { value: '1re', label: '1ère' },
  { value: 'terminale', label: 'Terminale' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    typePersonne: '',
    classe: '',
    source: '',
  });
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Capturer la source depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source') || urlParams.get('utm_source') || 'direct';
    setFormData(prev => ({ ...prev, source }));
  }, []);

  useEffect(() => {
    // Écran de chargement de 2.5 secondes
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Définir les étapes de base
  const baseSteps: Step[] = [
    {
      id: 'nom',
      question: 'Quel est votre nom ?',
      type: 'text',
      placeholder: 'Nom',
    },
    {
      id: 'prenom',
      question: 'Quel est votre prénom ?',
      type: 'text',
      placeholder: 'Prénom',
    },
    {
      id: 'telephone',
      question: 'Quel est votre numéro de téléphone ?',
      type: 'tel',
      placeholder: '06 12 34 56 78',
    },
    {
      id: 'email',
      question: 'Quelle est votre adresse mail ?',
      type: 'email',
      placeholder: 'votre@email.fr',
    },
    {
      id: 'typePersonne',
      question: 'Vous êtes :',
      type: 'select',
      options: typePersonneOptions,
    },
  ];

  // Ajouter dynamiquement l'étape classe si nécessaire
  const getSteps = (): Step[] => {
    const steps = [...baseSteps];
    if (['collegien', 'lyceen'].includes(formData.typePersonne)) {
      steps.push({
        id: 'classe',
        question: 'Quelle est votre classe actuelle ?',
        type: 'select',
        options: classeOptions,
      });
    } else if (formData.typePersonne === 'parent') {
      steps.push({
        id: 'classe',
        question: 'Dans quelle(s) classe(s) se trouve(nt) votre/vos enfant(s) ?',
        type: 'text',
        placeholder: 'Ex: 6ème, 3ème',
      });
    }
    return steps;
  };

  const allSteps = getSteps();
  const currentStepData = allSteps[currentStep];
  const isLastStep = currentStep === allSteps.length - 1;
  const isRecapStep = currentStep === allSteps.length;

  const handleInputChange = (value: string) => {
    if (!currentStepData) return;
    //console.log(currentStepData.id);
    let tmp = formData;
    switch (currentStepData.id) {
      case "nom":
        tmp.nom = value;
        break;
      case "prenom":
        tmp.prenom = value;
        break;
      case "telephone":
        tmp.telephone = value;
        break;
      case "email":
        tmp.email = value;
        break;  
      case "type":
        tmp.type = value;
        break; 
      case "classe":
        tmp.classe = value;
        break;   
      case "source":
        tmp.source = value;
        break;  
      default:
        break;
    }
    //console.log(tmp);
    setFormData(prev => ({
      ...prev,
      [currentStepData.id]: value,
    }));
  };

  const handleNext = () => {
    if (!currentStepData || !formData[currentStepData.id as keyof FormData]) return;
    
    if (isLastStep) {
      // Passer à la page récapitulatif
      setDirection(1);
      setCurrentStep(prev => prev + 1);
      return;
    }

    setDirection(1);
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = () => {
    //console.log('Formulaire soumis:', formData);
  
    const url = "https://script.google.com/macros/s/AKfycbwgvY3xyLEZvl2Xku2nc7d3LgbA4tcy3m-aT0ttVdXlacdFJIJMP3CcZ6rHmh9a6F3pCw/exec"; // ton URL Web App
  
    const data = new FormData();
    data.append("nom", formData.nom);
    data.append("prenom", formData.prenom);
    data.append("telephone", formData.telephone);
    data.append("email", formData.email);
    data.append("typePersonne", formData.typePersonne);
    data.append("classe", formData.classe);
    data.append("source", formData.source);
  
    fetch(url, {
      method: "POST",
      body: data,
      mode: "no-cors",   // important pour éviter CORS
    })
      .then(() => {
        alert('Merci ! Votre formulaire a été envoyé avec succès.');
      })
      .catch((err) => {
        console.error("Erreur d'envoi :", err);
        alert("Une erreur est survenue lors de l'envoi.");
      });
  };

  const handleBack = () => {
    if (currentStep === 0) return;
    setDirection(-1);
    setCurrentStep(prev => prev - 1);
  };

  const handleEditStep = (stepIndex: number) => {
    setDirection(stepIndex > currentStep ? 1 : -1);
    setCurrentStep(stepIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  const getStepLabel = (step: Step): string => {
    if (step.type === 'select' && step.id === 'typePersonne') {
      const option = typePersonneOptions.find(opt => opt.value === formData.typePersonne);
      return option?.label || '';
    }
    if (step.type === 'select' && step.id === 'classe') {
      const option = classeOptions.find(opt => opt.value === formData.classe);
      return option?.label || '';
    }
    return formData[step.id as keyof FormData];
  };

  if (!currentStepData && !isRecapStep) return null;

  // Écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <ImageWithFallback
              src={logoImage}
              alt="NODUS Logo"
              className="w-32 h-32 mx-auto object-contain"
            />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-white mb-4"
          >
            NODUS
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex gap-2 justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0 }}
              className="w-3 h-3 bg-white rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
              className="w-3 h-3 bg-white rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
              className="w-3 h-3 bg-white rounded-full"
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      {/* Logo en haut à gauche */}
      <div className="fixed top-6 left-6 z-10">
        <div className="flex items-center gap-3">
          <ImageWithFallback
            src={logoImage}
            alt="NODUS Logo"
            className="w-12 h-12 object-contain"
          />
          <span className="text-indigo-900">NODUS</span>
        </div>
      </div>

      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-600"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentStep + 1) / allSteps.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 min-h-[400px] flex flex-col relative">
          {/* Back button */}
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="absolute top-6 left-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}

          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                initial={{
                  x: direction > 0 ? 300 : -300,
                  opacity: 0,
                }}
                animate={{
                  x: 0,
                  opacity: 1,
                }}
                exit={{
                  x: direction > 0 ? -300 : 300,
                  opacity: 0,
                }}
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
              >
                {isRecapStep ? (
                  // Page récapitulatif
                  <div>
                    <h2 className="mb-8 text-gray-800">
                      Récapitulatif de vos informations
                    </h2>
                    <div className="space-y-4 mb-8">
                      {allSteps.map((step, index) => (
                        <div
                          key={step.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="text-sm text-gray-600 mb-1">
                              {step.question}
                            </div>
                            <div className="text-gray-900">
                              {getStepLabel(step)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditStep(index)}
                            className="ml-4 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            Modifier
                          </button>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={handleSubmit}
                      className="w-full px-8 py-6 bg-indigo-600 hover:bg-indigo-700"
                      size="lg"
                    >
                      Envoyer le formulaire
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="mb-8 text-gray-800">
                      {currentStepData.question}
                    </h2>

                    {currentStepData.type === 'select' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentStepData.options?.map(option => (
                          <button
                            key={option.value}
                            onClick={() => {
                              handleInputChange(option.value);
                              setTimeout(handleNext, 300);
                            }}
                            className={`p-6 rounded-xl border-2 transition-all hover:border-indigo-400 hover:bg-indigo-50 ${
                              formData[currentStepData.id as keyof FormData] === option.value
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <span className="text-gray-800">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <Input
                          type={currentStepData.type}
                          placeholder={currentStepData.placeholder}
                          value={formData[currentStepData.id as keyof FormData]}
                          onChange={e => handleInputChange(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="text-lg p-6 border-2 border-gray-200 focus:border-indigo-400"
                          autoFocus
                        />
                        <Button
                          onClick={handleNext}
                          disabled={!formData[currentStepData.id as keyof FormData]}
                          className="w-full md:w-auto px-8 py-6 bg-indigo-600 hover:bg-indigo-700"
                          size="lg"
                        >
                          {isLastStep ? 'Continuer' : 'Continuer'}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Step indicator */}
          <div className="mt-8 text-center text-gray-500">
            {isRecapStep ? 'Récapitulatif' : `Étape ${currentStep + 1} sur ${allSteps.length}`}
          </div>
        </div>

        {/* Social media links */}
        <div className="mt-8 flex justify-center gap-6">
          <a
            href="https://www.tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow hover:scale-110 transform transition-transform"
            aria-label="TikTok"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/nodus.reseau/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow hover:scale-110 transform transition-transform"
            aria-label="Instagram"
          >
            <Instagram className="w-6 h-6 text-pink-600" />
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow hover:scale-110 transform transition-transform"
            aria-label="Facebook"
          >
            <Facebook className="w-6 h-6 text-blue-600" />
          </a>
        </div>

        {/* Source indicator (for debugging) */}
        {formData.source !== 'direct' && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Source: {formData.source}
          </div>
        )}
      </div>
    </div>
  );
}


