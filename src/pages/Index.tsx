
import React from 'react';
import { TitanicPredictionForm } from '@/components/TitanicPredictionForm';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-purple">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-dark-purple">
          Titanic Survival Predictor
        </h1>
        <TitanicPredictionForm />
      </div>
    </div>
  );
};

export default Index;
