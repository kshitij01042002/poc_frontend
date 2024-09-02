import AssistantSpeechIndicator from "./call/AssistantSpeechIndicator";
import Button from "./base/Button";
import VolumeLevel from "./call/VolumeLevel";

const ActiveCallDetail = ({ volumeLevel }) => {
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        <VolumeLevel volume={volumeLevel} />
      </div>
    </div>
  );
};

export default ActiveCallDetail;
