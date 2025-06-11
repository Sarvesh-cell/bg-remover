import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
// import Navbar from "./components/Navbar.jsx";

import React, { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

// 1. Create Context
// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [credit, setCredit] = useState(false);
  const [image, setImage] = useState(false);
  const [resultImage, setResultImage] = useState(false);

  const backendUrl = "http://localhost:4000";

  // const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const loadCreditsData = async () => {
    try {
      const token = await getToken();
      // console.log("Token from Clerk:", token);

      if (!token) {
        toast.error("User not authenticated. No token received.");
        return;
      }

      const { data } = await axios.get(
        "http://localhost:4000" + "/api/user/credits",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("data:", data);

      if (data.success) {
        setCredit(data.credits);
        // console.log(data.credits);
      } else {
        console.log("error!!");
        // console.log(data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      // console.log("bye");
    }
  };

  const removeBg = async (image) => {
    try {
      if (!isSignedIn) {
        return openSignIn();
      }

      setImage(image);
      setResultImage(false);

      navigate("/result");

      const token = await getToken();

      const formData = new FormData();
      image && formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/image/remove-bg",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        // { headers: { token } }
      );

      if (data.success) {
        console.log("Token:", token);
        setResultImage(data.resultImage);
        data.creditBalance && setCredit(data.creditBalance);
      } else {
        toast.error(data.message);
        data.creditBalance && setCredit(data.creditBalance);
        if (data.creditBalance === 0) {
          navigate("/buy");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const value = {
    credit,
    setCredit,
    loadCreditsData,
    backendUrl,
    image,
    setImage,
    removeBg,
    resultImage,
    setResultImage,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
