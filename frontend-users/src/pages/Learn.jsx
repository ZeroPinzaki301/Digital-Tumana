import heroPageWall from '../assets/LearnPage-Images/learn-heropage.png';
import tesdaLogo from '../assets/LearnPage-Images/tesda-logo.png';
import plantingImage from '../assets/LearnPage-Images/planting.jpg';
import methodsImage from '../assets/LearnPage-Images/planting-methods.jpg';
import collabImage from '../assets/LearnPage-Images/collab-planting.jpg';
import { useNavigate } from 'react-router-dom'

const Learn = () => {

  const navigate = useNavigate();
  return (
    <div className="font-sans text-white">
      {/* HERO PAGE*/}
      <section
        id="hero"
        className="relative bg-cover bg-center bg-no-repeat bg-lime-600 h-[600px] px-4 md:px-10 py-10 md:py-20"
        style={{ backgroundImage: `url(${heroPageWall})` }}
      >
        {/* Black Overlay */}
        <div className="absolute inset-0 bg-black opacity-30 z-0"></div>
        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between h-full max-w-7xl mx-auto">
          {/* TESDA Logo with Bigger Size & White Glow */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-start items-center">
            <img
              src={tesdaLogo}
              alt="TESDA Logo"
              className="h-[550px] object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
            />
          </div>
          {/* Right: 2-line Heading */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end items-center text-white md:pr-10 mt-8 md:mt-0 text-right">
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              WE OFFER TESDA <br className="hidden md:block" />
              COURSE FOR YOU!
            </h2>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section id="services" className="w-full bg-white p-4 md:p-10">

        {/* Card 1 */}
        <div className="group w-full h-[500px] flex flex-col md:flex-row-reverse overflow-hidden rounded-lg">
          <div
            className="relative w-full md:w-[65%] h-[250px] md:h-auto bg-cover bg-center"
            style={{ backgroundImage: `url(${plantingImage})` }}
          >
            <div className="absolute inset-0 bg-black/50 transition duration-300 group-hover:bg-lime-600/20 z-0" />
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-l from-transparent to-gray-50 z-0" />
          </div>
          <div className="w-full md:w-[35%] bg-white flex items-center justify-center px-6 text-center">
            <p className="text-lg md:text-5xl font-semibold text-black">
              TURN YOUR PLANTING HOBBIES TO THE NEXT LEVEL
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group w-full h-[500px] flex flex-col md:flex-row overflow-hidden rounded-lg">
          <div
            className="relative w-full md:w-[65%] h-[250px] md:h-auto bg-cover bg-center"
            style={{ backgroundImage: `url(${methodsImage})` }}
          >
            <div className="absolute inset-0 bg-black/50 transition duration-300 group-hover:bg-lime-600/20 z-0" />
            <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-r from-transparent to-gray-50 z-0" />
          </div>
          <div className="w-full md:w-[35%] bg-white flex items-center justify-center px-6 text-center">
            <p className="text-lg md:text-5xl font-semibold text-black">
              GET TO LEARN NEW METHODS AND TECHNIQUES
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="group w-full h-[500px] flex flex-col md:flex-row-reverse overflow-hidden rounded-lg">
          <div
            className="relative w-full md:w-[65%] h-[250px] md:h-auto bg-cover bg-center"
            style={{ backgroundImage: `url(${collabImage})` }}
          >
            <div className="absolute inset-0 bg-black/50 transition duration-300 group-hover:bg-lime-600/20 z-0" />
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-l from-transparent to-gray-50 z-0" />
          </div>
          <div className="w-full md:w-[35%] bg-white flex items-center justify-center px-6 text-center">
            <p className="text-lg md:text-5xl font-semibold text-black">
              AND COLLABORATE WITH FELLOW KA-TUMANA!
            </p>
          </div>
        </div>
      </section>

      {/* TESDA Requirements */}
      <section className="bg-[#91CA4C] text-black py-17 px-4">
        <h2 className="text-4xl font-bold text-center mb-10">Get these things ready</h2>
        <div className="text-2xl md:text-4xl flex flex-col items-center space-y-4 font-medium">
          <p>&#10003; At least 18 Years Old</p>
          <p>&#10003; Valid ID</p>
          <p>&#10003; Photocopy of Birth Certificate</p>
        </div>
      </section>

      {/* Enroll Now Button */}
      <div className="bg-white py-10 flex justify-center">
        <button
          onClick={() => navigate("/learn/tesda/enroll")} // ⬅️ Navigate on click
          className="bg-[#91CA4C] text-black text-xl font-semibold px-10 py-4 rounded-lg hover:bg-lime-700 transition"
        >
          Enroll Now
        </button>
      </div>
    </div>
  );
};

export default Learn;
