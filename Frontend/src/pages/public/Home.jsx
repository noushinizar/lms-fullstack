import CTA from "../../components/landing/CTA";
import FeaturedCourses from "../../components/landing/FeaturedCourses";
import Hero from "../../components/landing/Hero";
import Navbar from "../../components/landing/Navbar";
import Stats from "../../components/landing/stats";
import WhyChooseUs from "../../components/landing/WhyChooseUs";

const Home = () => {
  return (
    <>
    <Hero />
    {/* <Stats/> */}
    <FeaturedCourses />
     <WhyChooseUs />
     <CTA/>
    </>
  );
};

export default Home;