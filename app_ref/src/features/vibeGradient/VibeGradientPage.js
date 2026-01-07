import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { VibeGradientLayout } from "./layout";
import { ChatPage } from "./pages";
import { useVibe } from "../../hooks/useVibe";

const VibeGradientPage = () => {
  console.log("VibeGradientPage Rendered");
  const { currentConversationId } = useVibe();

  return (
    <Routes>
      <Route path="/" element={<VibeGradientLayout />}>
        <Route
          index
          element={<Navigate to={currentConversationId || "chat"} replace />}
        />
        <Route path="chat" element={<ChatPage />} />
        <Route path=":conversationId" element={<ChatPage />} />
        <Route
          path="*"
          element={<Navigate to={currentConversationId || "chat"} replace />}
        />
      </Route>
    </Routes>
  );
};

export default VibeGradientPage;
