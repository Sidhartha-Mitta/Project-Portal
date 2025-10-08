import Footer from "../Common/Footer"
import {Outlet} from "react-router-dom"
import Navbar from "../Common/Navbar";
import ParticleBackground from "../Common/ParticleBackground";

const UserLayout = () => {
  return (
    <>
      <ParticleBackground particleCount={30} />
      <Navbar />
      <main className="relative z-10">
        <Outlet/>
      </main>
      <Footer />
    </>
  );
};

export default UserLayout;
