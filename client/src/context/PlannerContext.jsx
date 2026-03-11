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
  travelers: '',
  // Step 2 — transport
  transport: '',
  vehicleDetails: {
    mileage: '',
    fuelPrice: '',
    tollCharges: '',
    fuelType: '',
  },
  publicTransport: {
    provider: '',
    fareClass: '',
    farePerPerson: '',
  },
  additionalCost: '',
  // Step 2 — food
  foodPreferences: [],
  foodBudget: {},
  // Step 3 (computed)
  costBreakdown: null,
  // Meta
  tripId: null,
  saved: false,
};

function plannerReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':        return { ...state, currentStep: action.payload };
    case 'UPDATE_FIELD':    return { ...state, [action.field]: action.value };
    case 'UPDATE_VEHICLE':  return { ...state, vehicleDetails: { ...state.vehicleDetails, ...action.payload } };
    case 'UPDATE_PUBLIC':   return { ...state, publicTransport: { ...state.publicTransport, ...action.payload } };
    case 'SET_FOOD_PREFS':  return { ...state, foodPreferences: action.payload };
    case 'SET_FOOD_BUDGET': return { ...state, foodBudget: { ...state.foodBudget, ...action.payload } };
    case 'SET_COSTS':       return { ...state, costBreakdown: action.payload };
    case 'SET_TRIP_ID':     return { ...state, tripId: action.payload, saved: true };
    case 'RESET':           return { ...initialPlannerState };
    default:                return state;
  }
}

export function PlannerProvider({ children }) {
  const [state, dispatch] = useReducer(plannerReducer, initialPlannerState);

  const setStep       = (step) => dispatch({ type: 'SET_STEP', payload: step });
  const updateField   = (f, v) => dispatch({ type: 'UPDATE_FIELD', field: f, value: v });
  const updateVehicle = (p)    => dispatch({ type: 'UPDATE_VEHICLE', payload: p });
  const updatePublic  = (p)    => dispatch({ type: 'UPDATE_PUBLIC', payload: p });
  const setFoodPrefs  = (p)    => dispatch({ type: 'SET_FOOD_PREFS', payload: p });
  const setFoodBudget = (p)    => dispatch({ type: 'SET_FOOD_BUDGET', payload: p });
  const setCosts      = (c)    => dispatch({ type: 'SET_COSTS', payload: c });
  const setTripId     = (id)   => dispatch({ type: 'SET_TRIP_ID', payload: id });
  const reset         = ()     => dispatch({ type: 'RESET' });

  const nextStep = () => setStep(Math.min(state.currentStep + 1, 5));
  const prevStep = () => setStep(Math.max(state.currentStep - 1, 1));

  return (
    <PlannerContext.Provider value={{
      ...state,
      setStep, nextStep, prevStep,
      updateField, updateVehicle, updatePublic,
      setFoodPrefs, setFoodBudget,
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