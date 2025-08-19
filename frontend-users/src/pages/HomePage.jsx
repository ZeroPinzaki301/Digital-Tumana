import { useNavigate } from "react-router-dom";
import heroPageWall from '../assets/HomePage-Images/heropage-wall.jpg';
import marketImage from '../assets/HomePage-Images/market-image.jpg';
import jobsImage from '../assets/HomePage-Images/jobs-image.jpg';
import learnImage from '../assets/HomePage-Images/learn-image.jpg';
import contactBg from '../assets/HomePage-Images/contact-bg.jpg';
import aboutPageImage from '../assets/HomePage-Images/aboutpage-image.jpg';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="text-white">

      {/* Hero Section */}
      <section
        id="hero"
        className="relative bg-cover bg-center bg-no-repeat bg-lime-600 h-[600px] text-left px-4 md:px-10 py-10 md:py-20"
        style={{ backgroundImage: `url(${heroPageWall})` }}
      >
        {/* Black overlay */}
        <div className="absolute inset-0 bg-black opacity-30 z-0"></div>
        {/* Content */}
        <div className="relative z-10 max-w-2xl mt-10 md:mt-20 ml-0 md:ml-30 text-white">
          <h2 className="text-4xl md:text-7xl font-extrabold leading-tight">
            DIGITAL TUMANA
          </h2>
          <p className="mt-5 text-xl md:text-3xl">
            Bridging the gap between agricultural needs with modern solution.
          </p>
          {/* 
          <button
            onClick={handleGetStarted}
            className="mt-5 px-8 py-4 bg-lime-600 text-white cursor-pointer rounded transition duration-200 hover:bg-lime-700"
          >
            Get Started
          </button>
          */}
        </div>
      </section>

      {/* Our Services */}
      <section id="services" className="w-full bg-white p-4 md:p-10">
        <h2 className="text-3xl md:text-5xl text-black font-semibold text-center mb-10">
          Our Services
        </h2>

        {/* Marketplace */}
        <div
          id="marketplace"
          className="group w-full h-[500px] flex flex-col md:flex-row overflow-hidden rounded-lg"
        >
          <div
            className="relative w-full md:w-[65%] h-[250px] md:h-auto bg-cover bg-center"
            style={{ backgroundImage: `url(${marketImage})` }}
          >
            <div className="absolute inset-0 bg-black/50 transition duration-300 group-hover:bg-lime-600/20 z-0" />
            <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-r from-transparent to-gray-50 z-0" />
            <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6">
              <h2 className="text-white text-4xl md:text-5xl font-semibold mb-6 group-hover:scale-110 transition-transform duration-300">
                Marketplace
              </h2>
              <button
                onClick={() => navigate("/marketplace")}
                className="bg-lime-600 text-white font-medium cursor-pointer px-6 py-3 rounded hover:bg-lime-700 transition group-hover:scale-105"
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="w-full md:w-[35%] bg-white flex items-center justify-center px-6 text-center">
            <p className="text-lg md:text-2xl text-black">
              The Marketplace is your go-to space for buying, selling, or trading farming tools, products, and services within the community. Whether you're a farmer looking for equipment, a seller offering fresh produce, or a buyer in search of affordable goods — this section helps connect you directly with trusted members around you.
            </p>
          </div>
        </div>

        {/* Services */}
        <div className="group w-full h-[500px] flex flex-col md:flex-row-reverse overflow-hidden rounded-lg">
          <div
            className="relative w-full md:w-[65%] h-[250px] md:h-auto bg-cover bg-center"
            style={{ backgroundImage: `url(${jobsImage})` }}
          >
            <div className="absolute inset-0 bg-black/50 transition duration-300 group-hover:bg-lime-600/20 z-0" />
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-l from-transparent to-gray-50 z-0" />
            <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6">
              <h2 className="text-white text-4xl md:text-5xl font-semibold mb-6 group-hover:scale-110 transition-transform duration-300">
                Services
              </h2>
              <button
                onClick={() => navigate("/jobs")}
                className="bg-lime-600 text-white font-medium cursor-pointer px-6 py-3 rounded hover:bg-lime-700 transition group-hover:scale-105"
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="w-full md:w-[35%] bg-white flex items-center justify-center px-6 text-center">
            <p className="text-lg md:text-2xl text-black">
              The Jobs section opens up opportunities for individuals and businesses to post or find available jobs and services related to agriculture and beyond. Whether you're looking for farmhands, offering labor, or seeking part-time or freelance work, this is where skills meet demand.
            </p>
          </div>
        </div>

        {/* Learn */}
        <div
          id="learn"
          className="group w-full h-[500px] flex flex-col md:flex-row overflow-hidden rounded-lg"
        >
          <div
            className="relative w-full md:w-[65%] h-[250px] md:h-auto bg-cover bg-center"
            style={{ backgroundImage: `url(${learnImage})` }}
          >
            <div className="absolute inset-0 bg-black/50 transition duration-300 group-hover:bg-lime-600/20 z-0" />
            <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-r from-transparent to-gray-50 z-0" />
            <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6">
              <h2 className="text-white text-4xl md:text-5xl font-semibold mb-6 group-hover:scale-110 transition-transform duration-300">
                Learn
              </h2>
              <button
                onClick={() => navigate("/learn")}
                className="bg-lime-600 text-white font-medium cursor-pointer px-6 py-3 rounded hover:bg-lime-700 transition group-hover:scale-105"
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="w-full md:w-[35%] bg-white flex items-center justify-center px-6 text-center">
            <p className="text-lg md:text-2xl text-black">
              The Learn section provides free access to educational resources, practical guides, and tutorials aimed at helping you improve your skills and knowledge. From modern farming techniques to digital literacy and more — it's your space to grow.
            </p>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="bg-lime-600 h-auto md:h-140 mt-10">
        <div className="flex flex-col md:flex-row items-center">
          <img
            className="h-60 md:h-120 w-auto rounded-xl inline-block ml-0 md:ml-10 mt-8 md:mt-10 border-1 border-black"
            src={aboutPageImage}
            alt="Angel Tolits Integrated Farm Picture"
          />
          <div>
            <h1 className="text-black text-3xl md:text-5xl font-semibold ml-0 md:ml-20 mt-8">
              About Us
            </h1>
            <p className="text-2xl md:text-3xl mt-5 max-w-full ml-0 md:ml-20 md:max-w-3xl font-normal leading-10 text-black px-4 md:px-0">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam ratione aliquid facere, cumque consectetur a temporibus illum harum quis quos deserunt officiis impedit explicabo fugiat voluptate, aspernatur accusantium reprehenderit nam.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact-section"
        className="relative mt-10 text-white"
        style={{
          backgroundImage: `url(${contactBg})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        {/* Black overlay */}
        <div className="absolute inset-0 bg-black opacity-60 z-0"></div>

        <div className="relative z-10 flex flex-col lg:flex-row py-10 px-5 lg:px-20 gap-10">
          {/* Contact Form */}
          <div className="w-full lg:w-2/3 space-y-5">
            <h2 className="text-2xl md:text-3xl font-semibold">Contact Us to Learn More</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                className="bg-white w-full md:w-1/3 py-4 px-5 text-black rounded-sm"
                type="text"
                placeholder="Your Name"
              />
              <input
                className="bg-white w-full md:w-1/3 py-4 px-5 text-black rounded-sm"
                type="email"
                placeholder="Your Email"
              />
            </div>
            <textarea
              className="bg-white w-full md:w-219 rounded-sm resize-none h-32 md:h-40 text-black py-4 px-5"
              placeholder="Your Message"
            ></textarea>
            <button className="bg-lime-600 w-full md:w-219 rounded-sm py-4 text-white font-medium hover:bg-lime-700 transition">
              Submit
            </button>
          </div>

          {/* Contact Info */}
          <div className="w-full lg:w-1/3 mt-15 space-y-5">
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">CONTACT US</h1>
            <ul className="space-y-4 text-lg md:text-xl">
              <li>
                <strong>PHONE NUMBER:</strong><br />
                09212392342
              </li>
              <li>
                <strong>EMAIL:</strong><br />
                digitaltumana01@gmail.com
              </li>
              <li>
                <strong>LOCATION:</strong><br />
                Angat, Bulacan Philippines
              </li>
            </ul>
          </div>
        </div>

        <div className="relative z-10 text-center text-sm py-5">
          &copy; 2025 Digital Tumana. All rights reserved.
        </div>
      </section>
    </div>
  );
};

export default HomePage;