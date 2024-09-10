import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Edit2, Check, Save } from 'lucide-react';
import './App.css';

const App = () => {
  const [input, setInput] = useState('Create a thin shell plate (20ft x 8ft), fix the left and right edges and bottom. Apply surface pressure for eq (200 psf) and active (100 psf) in Z direction, set up load combinations per USACE EM2100 / 2104');
  const [steps, setSteps] = useState([]);
  const [output, setOutput] = useState([]);
  const [progress, setProgress] = useState(0);
  const [editingStep, setEditingStep] = useState(null);
  const [taskComplete, setTaskComplete] = useState(false);
  const outputRef = useRef(null);

  const handleStartThinking = () => {
    const initialSteps = [
      { content: "Set coordinates for plate (20ft x 8ft)", status: 'pending', progress: 0 },
      { content: "Define material properties (Concrete, f'c = 4000 psi)", status: 'pending', progress: 0 },
      { content: "Create area element", status: 'pending', progress: 0 },
      { content: "Assign material to area element", status: 'pending', progress: 0 },
      { content: "Divide areas with max size of 1 ft", status: 'pending', progress: 0 },
      { content: "Set boundary conditions (fix left, right, and bottom edges)", status: 'pending', progress: 0 },
      { content: "Create joint patterns for load application", status: 'pending', progress: 0 },
      { content: "Apply surface pressure for earthquake load (200 psf in Z direction)", status: 'pending', progress: 0 },
      { content: "Apply surface pressure for active load (100 psf in Z direction)", status: 'pending', progress: 0 },
      { content: "Define load combinations per USACE EM2100 / 2104", status: 'pending', progress: 0 },
      { content: "Set up analysis parameters (Linear Static Analysis)", status: 'pending', progress: 0 },
      { content: "Run analysis", status: 'pending', progress: 0 },
      { content: "Extract results (max moment, max shear, max displacement)", status: 'pending', progress: 0 },
      { content: "Generate report", status: 'pending', progress: 0 }
    ];
    setSteps(initialSteps);
    setProgress(0);
    setOutput([]);
    setTaskComplete(false);
  };

  const runStep = (index) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps[index].status = 'running';
      return newSteps;
    });
    
    // Simulate API call and detailed steps
    const detailedSteps = getDetailedSteps(index);
    
    // Add this check
    if (detailedSteps.length === 0) {
      console.warn(`No detailed steps available for step ${index + 1}`);
      return;
    }
    
    let stepProgress = 0;
    
    const intervalId = setInterval(() => {
      if (stepProgress < detailedSteps.length) {
        setSteps(prevSteps => {
          const newSteps = [...prevSteps];
          newSteps[index].progress = ((stepProgress + 1) / detailedSteps.length) * 100;
          return newSteps;
        });
        const stepDetail = detailedSteps[stepProgress];
        if (stepDetail) {
          setOutput(prevOutput => [...prevOutput, `Step ${index + 1}: ${stepDetail}`]);
        }
        stepProgress++;
      } else {
        clearInterval(intervalId);
        setSteps(prevSteps => {
          const newSteps = [...prevSteps];
          newSteps[index].status = 'complete';
          newSteps[index].progress = 100;
          return newSteps;
        });
        const newProgress = Math.round(((index + 1) / steps.length) * 100);
        setProgress(newProgress);
        if (newProgress === 100) {
          setTaskComplete(true);
        }
      }
    }, 200);
  };

  const runAll = () => {
    steps.forEach((_, index) => {
      setTimeout(() => runStep(index), index * 1000);
    });
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleStartThinking();
    }
  };

  const handleStepEdit = (index) => {
    setEditingStep(index);
  };

  const handleStepSave = (index, newContent) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps[index].content = newContent;
      return newSteps;
    });
    setEditingStep(null);
  };

  const saveWorkflow = () => {
    const workflow = steps.map(step => step.content);
    const workflowJSON = JSON.stringify(workflow);
    const blob = new Blob([workflowJSON], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'sap2000_workflow.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDetailedSteps = (stepIndex) => {
    const detailedStepsLibrary = [
      ["Initializing coordinate system", "Defining corner coordinates (0,0), (20,0), (20,8), (0,8)", "Verifying coordinate inputs", "Coordinates set successfully"],
      ["Calling SAP2000 API: SapModel.PropMaterial.SetMaterial()", "Defining Concrete material with f'c = 4000 psi", "Setting elastic modulus and Poisson's ratio", "Material properties verified"],
      ["Calling SAP2000 API: SapModel.AreaObj.AddByCoord()", "Creating area element with defined coordinates", "Verifying area element creation", "Area element created successfully"],
      ["Calling SAP2000 API: SapModel.AreaObj.SetProperty()", "Selecting area element", "Assigning Concrete material to selection", "Material assignment verified"],
      ["Calling SAP2000 API: SapModel.AreaObj.DivideArea()", "Setting maximum mesh size to 1 ft", "Dividing area into smaller elements", "Area division completed"],
      ["Calling SAP2000 API: SapModel.PointObj.SetRestraint()", "Applying fixed condition to left edge nodes", "Applying fixed condition to right edge nodes", "Applying fixed condition to bottom edge nodes", "Boundary conditions verified"],
      ["Calling SAP2000 API: SapModel.LoadPatterns.Add()", "Creating joint pattern for earthquake load", "Creating joint pattern for active load", "Joint patterns created successfully"],
      ["Calculating earthquake pressure distribution", "Calling SAP2000 API: SapModel.AreaObj.SetLoadUniform()", "Applying 200 psf earthquake pressure in Z direction", "Load application verified"],
      ["Calculating active pressure distribution", "Calling SAP2000 API: SapModel.AreaObj.SetLoadUniform()", "Applying 100 psf active pressure in Z direction", "Load application verified"],
      ["Calling SAP2000 API: SapModel.RespCombo.Add()", "Defining load combination: 1.4D", "Defining load combination: 1.2D + 1.6L + 0.5Lr", "Defining load combination: 1.2D + 1.6Lr + L", "Defining load combination: 1.2D + 1.0E + L", "Load combinations verified"],
      ["Calling SAP2000 API: SapModel.Analyze.SetRunCaseFlag()", "Setting analysis type to Linear Static", "Configuring solver parameters", "Analysis settings verified"],
      ["Calling SAP2000 API: SapModel.Analyze.RunAnalysis()", "Running analysis for all load combinations", "Analysis completion verified"],
      ["Calling SAP2000 API: SapModel.Results.AreaForceShell()", "Extracting maximum moment: 15.3 kip-ft/ft", "Extracting maximum shear: 2.8 kip/ft", "Calling SAP2000 API: SapModel.Results.JointDispl()", "Calculating maximum displacement: 0.5 inches", "Results extraction complete"],
      ["Initializing report generator", "Adding analysis summary to report", "Including graphical results in report", "Calling SAP2000 API: SapModel.Results.Setup.DesignOutput()", "Generating PDF report"]
    ];
    
    return detailedStepsLibrary[stepIndex] || [];
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="app">
      <header className="header">
        <h1>SAP 2000 Automation Tool</h1>
      </header>
      
      <div className="main-content">
        <div className="input-area">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="search-input"
            />
          </div>
          <button onClick={handleStartThinking} className="start-button">Start Thinking</button>
        </div>

        <div className="progress-indicator">
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          {!taskComplete ? (
            <span className="progress-text">{progress}% Complete</span>
          ) : (
            <span className="task-complete">Complete!</span>
          )}
        </div>

        <div className="content-container">
          <div className="steps-container">
            <div className="steps-header">
              <h2>Steps</h2>
              <div className="steps-buttons">
                <button onClick={runAll} className="run-all-button">Run All</button>
                <button onClick={saveWorkflow} className="save-workflow-button"><Save size={16} /> Save Workflow</button>
              </div>
            </div>
            {steps.map((step, index) => (
              <div key={index} className={`step ${step.status}`} onDoubleClick={() => handleStepEdit(index)}>
                {editingStep === index ? (
                  <div className="step-edit">
                    <input
                      type="text"
                      value={step.content}
                      onChange={(e) => handleStepSave(index, e.target.value)}
                      onBlur={() => setEditingStep(null)}
                      autoFocus
                    />
                    <button onClick={() => handleStepSave(index, step.content)}><Check size={16} /></button>
                  </div>
                ) : (
                  <div className="step-header">
                    <span className="step-content">{step.content}</span>
                    <button onClick={() => runStep(index)} className="run-step-button"><Play size={16} /></button>
                  </div>
                )}
                <div className={`step-progress ${step.status === 'complete' ? 'complete' : ''}`}>
                  <div className="step-progress-bar" style={{ width: `${step.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="output-container">
            <h2>Output</h2>
            <div className="output-log" ref={outputRef}>
              {output.map((log, index) => (
                <p key={index}>{log}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;