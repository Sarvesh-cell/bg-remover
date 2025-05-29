import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
// import Navbar from "./components/Navbar.jsx";

import React, { createContext, useState } from "react";

// 1. Create Context
// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [credit, setCredit] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_UR;

  const { getToken } = useAuth();

  const loadCreditsData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + "/api/user/credits", {
        headers: { token },
      });
      if (data.success) {
        setCredit(data.credits);
        console.log(data.credits);
        console.log("hiss");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      console.log("bye");
    }
  };

  const value = {
    credit,
    setCredit,
    loadCreditsData,
    backendUrl,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
