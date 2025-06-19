import digitalTumanaIcon from "../assets/digital-tumana-icon.png";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-100 px-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-lime-700 md:text-4xl">
          Welcome to
        </h1>
        <img
          src={digitalTumanaIcon}
          alt="Digital Tumana Icon"
          className="mx-auto mt-2 w-20 h-20 md:w-32 md:h-32"
        />
        <h1 className="font-sans text-2xl font-bold text-lime-700 md:text-2xl">
          Digital Tumana
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          This is the homepage—at least for now!
        </p>
      </div>
    </div>
  );
};

export default HomePage;