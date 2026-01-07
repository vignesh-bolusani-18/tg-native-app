import { Box } from "@mui/system";
import { DotLottiePlayer } from "@dotlottie/react-player";
import chatbotAnimation from "../../assets/animations/chatbot.lottie";
import { useState, useEffect } from "react";
const Nudge = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPlaying(false); 
    }, 120000); 

    return () => clearTimeout(timer); 
  }, []);
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: "80px",
        right: "24px",
        width: 100,
        height: 100,
        cursor: "pointer",
        zIndex: 1500,
      }}
    >
      <DotLottiePlayer
        autoplay={isPlaying}
        loop={isPlaying}
        src={chatbotAnimation}
        style={{
          width: "85%",
          height: "85%",
        }}
      />
    </Box>
  );
};

export default Nudge;
