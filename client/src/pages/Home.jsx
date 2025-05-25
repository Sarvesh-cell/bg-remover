import React from "react";
import Header from "../components/Header";
import Steps from "../components/Steps";
import BgSlide from "../components/BgSlide";
import Testimonials from "../components/Testimonials";
import Upload from "../components/Upload";

const Home = () => {
  return(
    <div>
      <Header />
      <Steps />
      <BgSlide  />
      <Testimonials  />
      <Upload  />
    </div>
  )
}

export default Home