import { createContext, useContext, useReducer } from 'react';

const PlannerContext = createContext(null);

export const initialPlannerState = {
  currentStep: 1,
  // Step 1
  origin: '',
  destination: '',
  distance: '',
  travelDate: '',
  returnDate: '',
  travelers: 1,
  // Step 2
  transport: '',
  vehicleDetails: { mileage: '', fuelPrice: '96', tollCharges: '0', fuelType: 'Petrol' },
  publicTransport: { provider: '', fareClass: '', farePerPerson: '' },
  additionalCost: '0',
  // Step 3 (computed)
  costBreakdown: null,
  // Meta
  tripId: null,
  saved: false,
};

function plannerReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP': return { ...state, currentStep: action.payload };
    case 'UPDATE_FIELD': return { ...state, [action.field]: action.value };
    case 'UPDATE_VEHICLE': return { ...state, vehicleDetails: { ...state.vehicleDetails, ...action.payload } };
    case 'UPDATE_PUBLIC': return { ...state, publicTransport: { ...state.publicTransport, ...action.payload } };
    case 'SET_COSTS': return { ...state, costBreakdown: action.payload };
    case 'SET_TRIP_ID': return { ...state, tripId: action.payload, saved: true };
    case 'RESET': return { ...initialPlannerState };
    default: return state;
  }
}

export function PlannerProvider({ children }) {
  const [state, dispatch] = useReducer(plannerReducer, initialPlannerState);

  const setStep = (step) => dispatch({ type: 'SET_STEP', payload: step });
  const updateField = (field, value) => dispatch({ type: 'UPDATE_FIELD', field, value });
  const updateVehicle = (payload) => dispatch({ type: 'UPDATE_VEHICLE', payload });
  const updatePublic = (payload) => dispatch({ type: 'UPDATE_PUBLIC', payload });
  const setCosts = (costs) => dispatch({ type: 'SET_COSTS', payload: costs });
  const setTripId = (id) => dispatch({ type: 'SET_TRIP_ID', payload: id });
  const reset = () => dispatch({ type: 'RESET' });

  const nextStep = () => setStep(Math.min(state.currentStep + 1, 5));
  const prevStep = () => setStep(Math.max(state.currentStep - 1, 1));

  return (
    <PlannerContext.Provider value={{
      ...state,
      setStep, nextStep, prevStep,
      updateField, updateVehicle, updatePublic,
      setCosts, setTripId, reset,
    }}>
      {children}
    </PlannerContext.Provider>
  );
}

export const usePlanner = () => {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be inside PlannerProvider');
  return ctx;
};
