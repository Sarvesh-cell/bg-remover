import React, { useEffect, useContext } from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const { openSignIn } = useClerk();
  const { isSignedIn, user } = useUser();
  const { credit, loadCreditsData } = useContext(AppContext);

  useEffect(() => {
    if (isSignedIn) {
      loadCreditsData();
    }
  }, [isSignedIn, loadCreditsData]);

  return (
    <div className="flex items-center justify-between mx-4 py-3 lg:mx-44">
      <Link to="/">
        <img className="w-32 sm:w-44" src={assets.logo} alt="" />
      </Link>
      {isSignedIn ? (
        <div>
          <button>
            <img src={assets.credit_icon} alt="" />
            <p>{credit}</p>
          </button>
          <UserButton />
        </div>
      ) : (
        <button
          onClick={() => openSignIn({})}
          className="bg-zinc-800 text-white flex items-center gap-4 px-4 py-4 sm:px-8 sm:py-3 text-sm rounded-full"
        >
          Get started <img className="w-3 sm:w-4" src={assets.arrow_icon}></img>
        </button>
      )}
    </div>
  );
};

export default Navbar;
