import { useState, useEffect } from "react";

interface ProcessoState {
  currentStep: number;
  cityData: any;
  selectedSegmentId: string | null;
  completedSteps: number[];
}

const STORAGE_KEY = "processo-avaliacao-state";

export const useProcessoAvaliacao = () => {
  const [state, setState] = useState<ProcessoState>({
    currentStep: 1,
    cityData: null,
    selectedSegmentId: null,
    completedSteps: [],
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState(parsed);
      } catch (error) {
        console.error("Error loading processo state:", error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateCityData = (cityData: any) => {
    setState(prev => ({ ...prev, cityData }));
  };

  const setCurrentStep = (step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const completeStep = (step: number) => {
    setState(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps.filter(s => s !== step), step],
    }));
  };

  const setSelectedSegment = (segmentId: string) => {
    setState(prev => ({ ...prev, selectedSegmentId: segmentId }));
  };

  const resetProcess = () => {
    setState({
      currentStep: 1,
      cityData: null,
      selectedSegmentId: null,
      completedSteps: [],
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  const isStepCompleted = (step: number) => {
    return state.completedSteps.includes(step);
  };

  return {
    ...state,
    updateCityData,
    setCurrentStep,
    completeStep,
    setSelectedSegment,
    resetProcess,
    isStepCompleted,
  };
};