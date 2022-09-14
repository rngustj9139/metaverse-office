import { useState } from 'react';
import './App.css';
import LoginView from './views/LoginView';
import PlayView from './views/PlayView';

function App() {
  const [step, setStep] = useState(0);

  return (
    <div className='App'>
      {step === 0 && <LoginView setStep={setStep} />} 
      {step === 1 && <PlayView setStep={setStep} />}
    </div>
  );
}

export default App;
