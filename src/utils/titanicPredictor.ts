
import { pipeline } from '@huggingface/transformers';

// Convert our form data to features the model can understand
const preprocessData = (data: {
  age: number;
  sex: string;
  passengerClass: string;
  siblings: number;
  parents: number;
}) => {
  // Normalize age (0-100 scale)
  const normalizedAge = data.age / 100;
  
  // Convert sex to binary (0 for female, 1 for male)
  const sexEncoded = data.sex === 'male' ? 1 : 0;
  
  // Convert class to numeric
  const classEncoded = parseInt(data.passengerClass);
  
  // Normalize siblings and parents counts (0-10 scale)
  const normalizedSiblings = data.siblings / 10;
  const normalizedParents = data.parents / 10;
  
  return [
    normalizedAge,
    sexEncoded,
    classEncoded,
    normalizedSiblings,
    normalizedParents
  ];
};

// Create and cache the classifier
let classifierPromise: any = null;

const getClassifier = async () => {
  if (!classifierPromise) {
    classifierPromise = pipeline(
      'text-classification',
      'Xenova/titanic-survival-prediction'
    );
  }
  return classifierPromise;
};

export const predictSurvival = async (formData: {
  age: number;
  sex: string;
  passengerClass: string;
  siblings: number;
  parents: number;
}) => {
  try {
    const features = preprocessData(formData);
    const classifier = await getClassifier();
    
    // Convert features to a format the model expects
    const input = features.join(' ');
    const result = await classifier(input);
    
    return {
      prediction: result[0].label === 'SURVIVED' ? 'Survived' : 'Did Not Survive',
      probability: result[0].score
    };
  } catch (error) {
    console.error('Prediction error:', error);
    return {
      prediction: 'Unable to make prediction',
      probability: 0
    };
  }
};
