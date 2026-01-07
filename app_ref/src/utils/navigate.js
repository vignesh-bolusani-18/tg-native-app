// src/utils/navigation.js

import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

let navigate = null;

export const setNavigate = (nav) => {
  navigate = nav;
};


export const navigateTo = (path) => {
  if (navigate && path) {
    navigate(path);
  } else {
    console.error("Navigate function or path is undefined");
  }
};
