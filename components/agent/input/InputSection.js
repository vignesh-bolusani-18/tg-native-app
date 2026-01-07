// D:\TG_REACT_NATIVE_MOBILE_APP\components\agent\input\InputSection.js
import React from "react";
import LandingInputSection from "./LandingInputSection";
// import RunningInputSection from "./RunningInputSection"; // Unused
// import { useVibe } from "../../../hooks/useVibe"; // Unused

const InputSection = ({
  onSendMessage,
  onStartChat,
  hasConversation,
  canSendMessage,
  isWaitingForAI,
  hideExperimentDatasetIcons = false,
}) => {
  // Logic from original: Always show LandingInputSection for now 
  // (Original had `if (true)` which forces LandingInputSection)
  return (
    <LandingInputSection
      onSendMessage={onSendMessage}
      onStartChat={onStartChat}
      canSendMessage={canSendMessage}
      isWaitingForAI={isWaitingForAI}
      hideExperimentDatasetIcons={hideExperimentDatasetIcons}
    />
  );
};

export default InputSection;