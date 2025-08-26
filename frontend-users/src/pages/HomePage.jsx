import { useNavigate } from "react-router-dom";
import heroPageWall from '../assets/HomePage-Images/heropage-wall.jpg';
import marketImage from '../assets/HomePage-Images/market-image.jpg';
import jobsImage from '../assets/HomePage-Images/jobs-image.jpg';
import learnImage from '../assets/HomePage-Images/learn-image.jpg';
import contactBg from '../assets/HomePage-Images/contact-bg.jpg';
import aboutPageImage from '../assets/HomePage-Images/aboutpage-image.jpg';
import tumanaIcon from '../assets/digital-tumana-icon.png';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="text-white">

      {/* Hero Section */}
      <section
        id="hero"
        className="relative bg-cover bg-center bg-no-repeat h-[350px] md:h-[400px] flex items-center justify-center"
        style={{ backgroundImage: `url(${heroPageWall})` }}
      >
        <div className="absolute inset-0 bg-black opacity-30 z-0" />
        <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-4">
          <h2 className="font-extrabold text-white drop-shadow-lg text-[48px] sm:text-[64px] md:text-[80px] lg:text-[120px] leading-none tracking-widest">
            DIGITAL TUMANA
          </h2>
          <div className="mt-6 space-y-2">
            <p className="font-bold text-white drop-shadow-lg text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center">
              Bridging the gap between agricultural
            </p>
            <p className="font-bold text-white drop-shadow-lg text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center">
              needs with modern solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section id="services" className="w-full bg-white px-4 py-10 md:px-10">
        <h2 className="text-3xl md:text-5xl lg:text-6xl text-black font-semibold text-center mb-10">
          Our Services
        </h2>

        {[
          {
            id: "marketplace",
            title: "Marketplace",
            image: marketImage,
            text: "The Marketplace is your go-to space for buying, selling, or trading farming tools, products, and services within the community. Whether you're a farmer looking for equipment, a seller offering fresh produce, or a buyer in search of affordable goods — this section helps connect you directly with trusted members around you.",
            link: "/marketplace",
            reverse: false,
          },
          {
            id: "services",
            title: "Services",
            image: jobsImage,
            text: "The Services section opens up opportunities for individuals and businesses to post or find available jobs and services related to agriculture and beyond. Whether you're looking for farmhands, offering labor, or seeking part-time or freelance work, this is where skills meet demand.",
            link: "/services",
            reverse: true,
          },
          {
            id: "learn",
            title: "Learn",
            image: learnImage,
            text: "The Learn section provides free access to educational resources, practical guides, and tutorials aimed at helping you improve your skills and knowledge. From modern farming techniques to digital literacy and more — it's your space to grow.",
            link: "/learn",
            reverse: false,
          },
        ].map(({ id, title, image, text, link, reverse }) => (
          <div
            key={id}
            id={id}
            className={`group w-full h-auto flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} overflow-hidden rounded-lg mb-10`}
          >
            <div
              className="relative w-full md:w-[65%] h-[250px] md:h-[500px] bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
            >
              <div className="absolute inset-0 bg-black/50 transition duration-300 group-hover:bg-lime-600/20 z-0" />
              <div className={`absolute top-0 ${reverse ? 'left-0' : 'right-0'} h-full w-1/3 bg-gradient-to-${reverse ? 'l' : 'r'} from-transparent to-gray-50 z-0`} />
              <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6">
                <h2 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 group-hover:scale-110 transition-transform duration-300">
                  {title}
                </h2>
                <button
                  onClick={() => navigate(link)}
                  className="cursor-pointer bg-lime-600 text-white font-medium px-6 py-3 rounded hover:bg-lime-700 transition group-hover:scale-105 lg:text-lg"
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className="w-full md:w-[35%] bg-white flex items-center justify-center px-6 py-6 text-center">
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-black">{text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* About Us */}
      <section className="bg-lime-600 py-10 px-4 md:px-10">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            className="h-60 md:h-96 w-auto rounded-xl border border-black"
            src={aboutPageImage}
            alt="Angel Tolits Integrated Farm"
          />
          <div>
            <h1 className="text-black text-3xl md:text-5xl lg:text-6xl font-semibold mb-4">About Us</h1>
            <p className="text-lg md:text-xl lg:text-2xl text-black leading-relaxed max-w-3xl">
              Angel Tolits Integrated Farm is a Learning Site for Agriculture located in Angat, Bulacan, and accredited by the Agricultural Training Institute. We promote sustainable and innovative farming practices by combining crops, livestock, and eco-friendly methods. Our mission is to guide and inspire farmers, students, and communities to value agriculture as a sustainable way of life, empowering them with knowledge and tools to thrive in a modern world.
            </p>
          </div>
        </div>
      </section>

    {/* Contact + Quick Access */} 
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
        {/* Dark overlay for left side */}
        <div className="absolute inset-0 bg-black opacity-60 z-0" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center py-10 px-5 lg:px-20 gap-10">

          {/* Left Side: Quick Navigation + Contact */}
          <div className="flex flex-col lg:flex-row gap-20">
            
            {/* Quick Navigation Access */}
            <div className="w-full max-w-md">
              <h2 className="text-xl md:text-3xl font-semibold mb-6 border-b-2 border-lime-500 pb-2 w-full">
                Quick Navigation Access
              </h2>
              <div className="space-y-2">
                {[
                  { name: "HOME", link: "/" },
                  { name: "MARKETPLACE", link: "/marketplace" },
                  { name: "SERVICES", link: "/services" },
                  { name: "LEARN", link: "/learn" },
                ].map(({ name, link }, i) => (
                  <a
                    key={i}
                    href={link}
                    className="block text-lg md:text-xl font-medium text-white py-1 hover:scale-105 transition-all duration-300"
                  >
                    {name}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="w-full max-w-md">
              <h1 className="text-xl md:text-3xl font-semibold mb-6 border-b-2 border-lime-500 pb-2 w-full">
                Contact Us
              </h1>
              <ul className="space-y-4 text-base md:text-lg">
                <li>
                  <strong>PHONE NUMBER:</strong><br />
                  09212392342
                </li>
                <li>
                  <strong>EMAIL:</strong><br />
                  digitaltumana@gmail.com <br />
                  digimana.sup.admn@gmail.com
                </li>
                <li>
                  <strong>LOCATION:</strong><br />
                  Angat, Bulacan Philippines
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side: Logo */}
          <div className="flex justify-center items-center flex-1 w-60 h-60 lg:w-72 lg:h-72 rounded-full bg-lime-500/50">
            <img
              src={tumanaIcon}
              alt="Digital Tumana Logo"
              className="relative h-32 lg:h-44 object-contain z-10"
            />
          </div>

        </div>

        <div className="relative z-10 text-center text-sm lg:text-base py-5">
          &copy; 2025 Digital Tumana. All rights reserved.
        </div>
      </section>
    </div>
  );
};

export default HomePage;