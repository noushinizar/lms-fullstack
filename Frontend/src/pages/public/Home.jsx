import CTA from "../../components/landing/CTA";
import FeaturedCourses from "../../components/landing/FeaturedCourses";
import Hero from "../../components/landing/Hero";
import WhyChooseUs from "../../components/landing/WhyChooseUs";

const Home = () => {
  return (
    <>
    <Hero /> 
    <FeaturedCourses />
     <WhyChooseUs />
     <CTA/>
    </>
  );
};

export default Home;