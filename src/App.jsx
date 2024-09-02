import React, { useState, useEffect } from 'react';
import './App.css';
import Vapi from '@vapi-ai/web'
import ActiveCallDetail from "./components/ActiveCallDetail";
import Button from "./components/base/Button";

function App() {
  const vapi = new Vapi("");
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  console.log(isLoading)
  console.log(userInfo)

  vapi.on("speech-start", () => {
  console.log("Assistant speech has started.");
});

  useEffect(() => {
    vapi.on("volume-level", (level) => {
      setVolumeLevel(level);
    });

    vapi.on("speech-start", () => {
      setAssistantIsSpeaking(true);
    });
  })

  const startFilling = async () => {
    setIsLoading(true);
    vapi.start("");
    const eventSource = new EventSource('http://localhost:5000/stream');
    console.log(vapi)
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      setUserInfo(data);
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
      setIsLoading(false);
    };

    return () => {
      eventSource.close();
    };
  };

  
  // if (isLoading && !userInfo) {
  //   return (
  //     <div className="App loading">
  //       <div className="loader"></div>
  //       <p>Fetching user information...</p>
  //     </div>
  //   );
  // }

  if (!isLoading && !userInfo) {
    return (
        <div className="App"
        style={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          label="Start Filling Your Auto Insurance Application"
          onClick={startFilling}
        />
      </div>
    );
  }


  return (
    <div className="App">
      <header>
        <h1>Auto Insurance Application</h1>
      </header>
      {!assistantIsSpeaking ? (
          <div className="App loading">
          <div className="loader"></div>
          <p>Connecting you to Regi...</p>
        </div>
      ) :
       <div><ActiveCallDetail
          volumeLevel={volumeLevel}
        />
        <div className="info-container">
          <section>
            <h2>Personal Information</h2>
            {userInfo?.name && <p><strong>Name:</strong> {userInfo?.name}</p>}
            {userInfo?.mobileNumber && <p><strong>Mobile:</strong> {userInfo?.mobileNumber}</p>}
            {userInfo?.emailAddress && <p><strong>Email:</strong> {userInfo?.emailAddress}</p>}
            {userInfo?.dateOfBirth && <p><strong>DOB:</strong> {userInfo?.dateOfBirth}</p>}
          </section>

          <section>
            <h2>Vehicle Information</h2>
            {userInfo?.vehicleType && <p><strong>Type:</strong> {userInfo?.vehicleType}</p>}
            {userInfo?.vehicleRegistrationNumber && <p><strong>Reg. Number:</strong> {userInfo?.vehicleRegistrationNumber}</p>}
            {userInfo?.carDetails && (
              <div>
                {userInfo?.carDetails.make && <p><strong>Make:</strong> {userInfo?.carDetails.make}</p>}
                {userInfo?.carDetails.model && <p><strong>Model:</strong> {userInfo?.carDetails.model}</p>}
                {userInfo?.carDetails.fuelType && <p><strong>Fuel Type:</strong> {userInfo?.carDetails.fuelType}</p>}
                {userInfo?.carDetails.registrationDate && <p><strong>Reg. Date:</strong> {userInfo?.carDetails.registrationDate}</p>}
              </div>
            )}
          </section>

          <section>
            <h2>Insurance Details</h2>
            {userInfo?.claimHistory && <p><strong>Claim History:</strong> {userInfo?.claimHistory ? 'Claimed' : 'Not Claimed'}</p>}
            {userInfo?.noClaimBonus && <p><strong>No Claim Bonus:</strong> {userInfo?.noClaimBonus}</p>}
            {userInfo?.idv && <p><strong>IDV:</strong> ₹{userInfo?.idv}</p>}
            {userInfo?.annualPremium && <p><strong>Annual Premium:</strong> ₹{userInfo?.annualPremium}</p>}
          </section>

          <section className="two-column">
            <div>
              <h2>Add-Ons</h2>
              {userInfo?.addOns && (
                <ul>
                  <li><strong>Nil Depreciation:</strong> {userInfo?.addOns.nilDepreciation ? 'Yes' : 'No'}</li>
                  <li><strong>Engine Protector:</strong> {userInfo?.addOns.engineProtector ? 'Yes' : 'No'}</li>
                  <li><strong>Secure Plus:</strong> {userInfo?.addOns.securePlus ? 'Yes' : 'No'}</li>
                </ul>
              )}
            </div>
            <div>
              <h2>Discounts</h2>
              {userInfo?.discounts && (
                <ul>
                  <li><strong>Anti-Theft Device:</strong> {userInfo?.discounts.antiTheftDevice ? 'Yes' : 'No'}</li>
                  <li><strong>Automobile Association:</strong> {userInfo?.discounts.automobileAssociation ? 'Yes' : 'No'}</li>
                </ul>
              )}
            </div>
          </section>

          <section>
            <h2>Application Status</h2>
            {userInfo?.kycDocuments !== undefined && <p><strong>KYC Documents:</strong> {userInfo?.kycDocuments ? 'Uploaded' : 'Pending'}</p>}
            {/* {userInfo?.isProcessing !== undefined && <p><strong>Processing:</strong> {userInfo?.isProcessing ? 'In Progress' : 'Not Started'}</p>} */}
            {userInfo?.isSubmitting !== undefined && <p><strong>Submission:</strong> {userInfo?.isSubmitting ? 'In Progress' : 'Not Started'}</p>}
          </section>
        </div></div>
      }
    </div>
  );
}

export default App;