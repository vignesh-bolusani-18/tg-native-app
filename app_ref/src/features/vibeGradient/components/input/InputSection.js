import React from "react";
import LandingInputSection from "./LandingInputSection";
import RunningInputSection from "./RunningInputSection";
import { useVibe } from "../../../../hooks/useVibe";

const InputSection = ({
  onSendMessage,
  onStartChat,
  hasConversation,
  canSendMessage,
  isWaitingForAI,
}) => {
  const { currentConversationId, conversations } = useVibe();
  if (true) {
    return (
      <LandingInputSection
        onSendMessage={onSendMessage}
        onStartChat={onStartChat}
        canSendMessage={canSendMessage}
        isWaitingForAI={isWaitingForAI}
      />
    );
  }

  return (
    <RunningInputSection
      onSendMessage={onSendMessage}
      canSendMessage={canSendMessage}
      isWaitingForAI={isWaitingForAI}
    />
  );
};

export default InputSection;
