import React, { useState } from "react";
import { Drawer, Box, Stack, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatContainer from "./ChatContainer";
import { useVibe } from "../../../../hooks/useVibe";
import useModule from "../../../../hooks/useModule";
import useExperiment from "../../../../hooks/useExperiment";
import { oldFlowModules } from "../../../../utils/oldFlowModules";
import TGLogo from "../../../../assets/Images/tg_logo6.svg";

/**
 * Reusable right-side chat layover that hosts the Vibe ChatContainer.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - title?: string (optional header title)
 */
const ChatDrawer = ({
  open,
  onClose,
  title = "Assistant",
  systemPrompt,
  dataPathDict,
}) => {
  const {
    langgraphState,
    clearError,
    setHasConversation,
    createNewChat,
    clearConversations,
    currentConversationId,
    conversations,
    currentConversation,
    setIsWaitingForAI,
    isStreaming,
    currentProgress,
  } = useVibe();

  const { discardExperiment: discardExperimentModule } = useModule();
  const { discardExperiment: discardExperimentExperiment } = useExperiment();

  const [isInitializing, setIsInitializing] = useState(false);

  const handleDiscardExperiment = () => {
    if (oldFlowModules.includes(langgraphState?.determined_module)) {
      discardExperimentExperiment();
    } else {
      discardExperimentModule();
    }
  };

  const ensureConversation = async () => {
    const hasMessages =
      currentConversationId &&
      conversations?.[currentConversationId]?.messages?.length > 0;

    if (hasMessages || isInitializing) {
      return;
    }

    setIsInitializing(true);

    try {
      // Clear any existing error immediately
      clearError();

      // Reset conversations and start a fresh one
      await clearConversations();
      createNewChat("master_workflow", "New Chat");

      setHasConversation(true);
      handleDiscardExperiment();

      setTimeout(() => {
        console.log("ChatDrawer: New chat initialized");
      }, 100);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleOpen = async () => {
    if (open) {
      await ensureConversation();
    }
  };

  // React.useEffect(() => {
  //   if (open) {
  //     handleOpen();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [open]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      hideBackdrop
      transitionDuration={{ enter: 400, exit: 300 }}
      SlideProps={{
        easing: {
          enter: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          exit: "cubic-bezier(0.55, 0.06, 0.68, 0.19)",
        },
      }}
      ModalProps={{
        // Allow the background (page behind the drawer) to remain scrollable
        disableScrollLock: true,
        // Let pointer events pass through the modal root so background stays clickable.
        // The drawer paper itself will still be interactive.
        sx: { pointerEvents: "none" },
      }}
      PaperProps={{
        sx: {
          pointerEvents: "auto",
          width: { xs: "100%", sm: 420, md: "50%" },
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 0,
          transition: "transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          px: 2,
          py: 1.5,
          borderBottom: "1px solid #EAECF0",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              backgroundColor: "#0F766E0D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <img
              src={TGLogo}
              alt="TrueGradient"
              style={{
                width: 20,
                height: 20,
              }}
            />
          </Box>
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 600,
              color: "#101828",
            }}
          >
            {title}
          </Typography>
        </Stack>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            borderRadius: "50%",
            padding: 0.5,
            "&:hover": { backgroundColor: "#F9FAFB" },
          }}
        >
          <CloseIcon sx={{ fontSize: 18, color: "#6B7280" }} />
        </IconButton>
      </Box>

      {/* Chat Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            paddingTop: "8px",
            paddingX: "8px",
            paddingBottom: "8px",
          }}
        >
          <ChatContainer
            messages={currentConversation?.messages || []}
            isWaitingForAI={currentConversation?.isWaitingForAI}
            setIsWaitingForAI={setIsWaitingForAI}
            isStreaming={isStreaming}
            currentProgress={currentProgress}
            messagesEndRef={null}
            processingStepText={currentConversation?.processingStepText}
            isDrawer={true}
            systemPrompt={systemPrompt}
            dataPathDict={dataPathDict}
          />
        </Box>
      </Box>
    </Drawer>
  );
};

export default ChatDrawer;
