// src/utils/getAndUpdateCredits.js
import axios from "axios";
import { getAuthToken } from "../redux/actions/authActions";
import { signToken } from "./jwtUtils";

// src/utils/getAndUpdateCredits.js
const BASE = process.env.REACT_APP_API_BASE_URL;

/** GET /credits */
export const getCreditScore = async () => {
  const Token = await getAuthToken();
  if (!Token) throw new Error("Missing auth token");

  const res = await axios.get(`${BASE}/credits?t=${Date.now()}`, {
    headers: {
       "x-api-key": process.env.REACT_APP_API_KEY,
        "Content-Type": "application/json",
      Authorization: `Bearer ${Token}`,
    },
  });

  return res.data.credits;
};

/** POST /credits */ 
export const updateCredits = async (action,value) => {
  const Token = await getAuthToken();
  const payload = { action, value };
  const updateCreditsToken = signToken(payload,Token);
  if (!Token) throw new Error("Missing auth token");

  const res = await axios.post(
    `${BASE}/credits?t=${Date.now()}`,
    { updateCreditsToken },
    {
      headers: {
        "x-api-key": process.env.REACT_APP_API_KEY,
        "Content-Type": "application/json",
        Authorization: `Bearer ${Token}`,
      },
    }
  );

  return res.data;
};
