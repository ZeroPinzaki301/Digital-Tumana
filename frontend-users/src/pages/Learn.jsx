import heroPageWall from '../assets/LearnPage-Images/learn-heropage.png';
import tesdaLogo from '../assets/LearnPage-Images/tesda-logo.png';
import plantingImage from '../assets/LearnPage-Images/planting.jpg';
import methodsImage from '../assets/LearnPage-Images/planting-methods.jpg';
import collabImage from '../assets/LearnPage-Images/collab-planting.jpg';
import { useNavigate } from 'react-router-dom'
import karitonCar from '../assets/LearnPage-Images/Car.png';
import karitonTricycle from '../assets/LearnPage-Images/tricycle.png';
import karitonMotorcycle from '../assets/LearnPage-Images/motorcycle.png';

// --- Inline SVG icons (no extra deps) ---
const CheckIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M9 12.75l2 2 4-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const IdCardIcon = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
    <rect x="6" y="9" width="6" height="2.5" rx="1" fill="currentColor"/>
    <circle cx="9" cy="14" r="2" fill="currentColor"/>
    <path d="M14 10.5h5M14 14h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CertificateIcon = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M6 3h9l3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M15 3v3h3" stroke="currentColor" strokeWidth="2"/>
    <path d="M7.5 10h8M7.5 13h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 16.5l2 1 2-1v3l-2-1-2 1v-3z" fill="currentColor"/>
  </svg>
);

const Calendar18Icon = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M7 3v4M17 3v4M3 9h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <rect x="8" y="12" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="2"/>
    <text x="12" y="16.5" textAnchor="middle" fontSize="6" fontFamily="ui-sans-serif, system-ui" fill="currentColor">18+</text>
  </svg>
);

// --- Generated SVG background (sample picture) for the Requirements section ---
// A soft green gradient with a subtle leaf pattern overlay
const tesdaBgSvg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#dff9d8'/>
        <stop offset='100%' stop-color='#91CA4C'/>
      </linearGradient>
      <pattern id='leaf' width='80' height='80' patternUnits='userSpaceOnUse' patternTransform='rotate(15)'>
        <path d='M40 8c16 11 16 33 0 44c-16-11-16-33 0-44z' fill='rgba(255,255,255,0.22)'/>
        <circle cx='40' cy='30' r='2' fill='rgba(0,0,0,0.06)'/>
      </pattern>
      <radialGradient id='vignette' cx='50%' cy='50%' r='70%'>
        <stop offset='60%' stop-color='rgba(0,0,0,0)'/>
        <stop offset='100%' stop-color='rgba(0,0,0,0.08)'/>
      </radialGradient>
    </defs>
    <rect width='1600' height='900' fill='url(#g)'/>
    <rect width='1600' height='900' fill='url(#leaf)'/>
    <rect width='1600' height='900' fill='url(#vignette)'/>
  </svg>
`;
const tesdaBgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(tesdaBgSvg)}`;

const Learn = () => {
  const navigate = useNavigate();

  return (
    <div className="text-white">
      {/* HERO */}
      <section
        id="hero"
        className="relative bg-cover bg-center bg-no-repeat h-[580px] md:h-[640px] px-4 md:px-10 py-10 md:py-20"
        style={{ backgroundImage: `url(${heroPageWall})` }}
        aria-label="Learn with TESDA hero section"
      >
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
        <div className="absolute inset-0 mix-blend-overlay bg-[radial-gradient(75%_60%_at_70%_20%,rgba(145,202,76,0.35),transparent)]" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between h-full max-w-7xl mx-auto">
          {/* TESDA Logo */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-start items-center">
            <img
              src={tesdaLogo}
              alt="TESDA logo"
              className="h-[420px] md:h-[500px] object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.7)]"
            />
          </div>

          {/* Headline + CTAs */}
          <div className="w-full md:w-1/2 flex flex-col items-end text-right md:pr-6 mt-8 md:mt-0">
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm md:text-base">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-300 animate-pulse"/> TESDA-accredited learning
            </p>
            <h2 className="mt-4 text-4xl md:text-6xl leading-tight tracking-tight font-extrabold">
              WE OFFER TESDA <br className="hidden md:block" /> COURSES FOR YOU!
            </h2>
            <p className="mt-3 max-w-md text-white/85 text-sm md:text-base">
              Level up your skills in modern, sustainable farming—hands-on, industry-aligned, and beginner‑friendly.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => document.getElementById('requirements')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-xl bg-white/90 text-black font-semibold px-5 py-3 hover:bg-white transition shadow cursor-pointer"
              >
                View Requirements
              </button>
              <button
                onClick={() => navigate('/learn/tesda/enroll')}
                className="rounded-xl bg-[#91CA4C] text-black font-semibold px-5 py-3 hover:bg-lime-600 transition shadow cursor-pointer"
              >
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section id="services" className="w-full bg-white p-4 md:p-10">

        {/* Card 1 */}
        <div className="group w-full h-[500px] flex flex-col md:flex-row-reverse overflow-hidden rounded-lg tracking-wider">
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
      <section id="requirements" className="relative text-black py-16 md:py-20 px-4 overflow-hidden" aria-label="TESDA enrollment requirements">
        {/* Sample background image (generated SVG) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${tesdaBgUrl}')` }}
          aria-hidden
        />
        {/* Soft overlay for contrast */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" aria-hidden/>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900">TESDA Enrollment Requirements</h2>
            <p className="mt-3 text-neutral-700">Bring originals and one (1) photocopy for verification.</p>
          </div>

          {/* Requirements Grid */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Age */}
            <div className="group relative rounded-2xl bg-white/80 border border-lime-200 shadow hover:shadow-md transition p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-lime-100 text-lime-700">
                  <Calendar18Icon />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">At least 18 years old</h3>
                  <p className="text-sm text-neutral-600">Proof of age may be requested during enrollment.</p>
                </div>
              </div>
              <div className="absolute -right-2 -top-2 rounded-full bg-lime-500 text-white text-xs font-bold px-2 py-1 shadow">Required</div>
            </div>

            {/* Valid ID */}
            <div className="group relative rounded-2xl bg-white/80 border border-lime-200 shadow hover:shadow-md transition p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-lime-100 text-lime-700">
                  <IdCardIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Valid ID (any government‑issued)</h3>
                  <p className="text-sm text-neutral-600">e.g., PhilID, Driver’s License, Passport, UMID, etc.</p>
                </div>
              </div>
              <div className="absolute -right-2 -top-2 rounded-full bg-lime-500 text-white text-xs font-bold px-2 py-1 shadow">Required</div>
            </div>

            {/* Birth Certificate */}
            <div className="group relative rounded-2xl bg-white/80 border border-lime-200 shadow hover:shadow-md transition p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-lime-100 text-lime-700">
                  <CertificateIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Birth Certificate (photocopy)</h3>
                  <p className="text-sm text-neutral-600">For identity verification and record matching.</p>
                </div>
              </div>
              <div className="absolute -right-2 -top-2 rounded-full bg-lime-500 text-white text-xs font-bold px-2 py-1 shadow">Required</div>
            </div>
          </div>

          {/* Quick checklist */}
          <div className="mt-8 mx-auto max-w-3xl rounded-2xl bg-white/80 border border-neutral-200 p-5">
            <h4 className="font-semibold text-neutral-900">Quick checklist</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              <li className="flex items-start gap-2"><CheckIcon className="w-5 h-5 text-lime-600"/> Have originals and one photocopy ready</li>
              <li className="flex items-start gap-2"><CheckIcon className="w-5 h-5 text-lime-600"/> Make sure your ID is not expired</li>
              <li className="flex items-start gap-2"><CheckIcon className="w-5 h-5 text-lime-600"/> Use a clear folder/envelope for faster screening</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/learn/tesda/enroll')}
                className="rounded-xl bg-[#91CA4C] text-black font-semibold px-4 py-2 text-sm hover:bg-lime-600 shadow cursor-pointer"
              >
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Kariton Riders Promotion */}
      <section className="relative bg-gradient-to-r from-[#91CA4C] to-[#4B8B3B] text-white py-20 px-4">
        {/* Decorative Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/green-dust-and-scratches.png')] opacity-20"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
          {/* Left Content */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              Become a Kariton Rider
            </h2>
            <p className="text-lg md:text-2xl mb-6 max-w-xl mx-auto md:mx-0">
              Do you have a motorcycle, tricycle, or even a car and want to earn while helping the community? 
              Apply now to become one of our Kariton Riders and start delivering orders today!
            </p>

            {/* Address */}
            <div className="flex items-center justify-center md:justify-start text-lg md:text-xl mb-8">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/684/684908.png" 
                alt="Location Icon" 
                className="w-10 h-10 mr-2"
              />
              <div>
              <p className="block font-medium"><b>Application Site:</b> Angel Tolits Integrated Farm</p>
              <p className='font-medium'><b>Address:</b> #43 Donacion, Angat, Bulacan</p>
              </div>
            </div>
            <div className="flex justify-center md:justify-start">
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex-1 flex justify-center md:justify-end gap-6 flex-wrap">
            <img
              src={karitonMotorcycle}
              alt="Motorcycle Rider"
              className="w-28 h-28 md:w-40 md:h-40 object-contain drop-shadow-xl"
            />
            <img
              src={karitonTricycle}
              alt="Tricycle"
              className="w-28 h-28 md:w-40 md:h-40 object-contain drop-shadow-xl"
            />
            <img
              src={karitonCar}
              alt="Car"
              className="w-28 h-28 md:w-40 md:h-40 object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Learn;