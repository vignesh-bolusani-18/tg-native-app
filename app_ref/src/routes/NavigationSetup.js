// src/components/NavigationSetup.js

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setNavigate } from "../utils/navigate";

const NavigationSetup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return null; // This component does not render anything
};

export default NavigationSetup;
