import { Link } from "react-router-dom";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const CTA = () => {
  return (
    <section id="contact" className="py-20 bg-amber-500">
      <div className="max-w-4xl mx-auto px-6 text-center">

        <h2 className="text-4xl font-bold text-white">
          Ready to Start Your Learning Journey?
        </h2>

        <p className="mt-5 text-lg text-amber-100">
          Join our LMS today and gain practical skills with expert guidance,
          hands-on projects, and industry-focused courses.
        </p>


        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">

          <Link
            to="/register"
            className="bg-white text-amber-500 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition shadow-md"
          >
            Get Started 
          </Link>


          {/* <Link
            to="/courses"
            className="border border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white hover:text-amber-500 transition"
          >
            Browse Courses
          </Link> */}

        </div>


        {/* Contact Info */}
        <div className="mt-12 bg-amber-200 backdrop-blur-sm rounded-2xl p-6 max-w-lvw mx-auto">

          <h3 className="text-xl font-semibold text-black mb-5">
            Need Help? Contact Us
          </h3>


          <div className="flex flex-col sm:flex-row justify-center gap-6 text-white">

            <div className="flex items-center justify-center gap-3 text-amber-800">
              <FaPhoneAlt className=" text-lg" />

              <span>
                +91 12345678
              </span>
            </div>


            <div className="flex items-center justify-center gap-3 text-amber-800 ">

              <FaEnvelope className=" text-lg" />

              <span>
                astrobyte@gmail.com
              </span>

            </div>


          </div>

        </div>


      </div>
    </section>
  );
};

export default CTA;