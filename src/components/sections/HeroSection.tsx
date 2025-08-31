export const HeroSection = ({ coverUrl }) => (
  <>
    <div
      className="bg-cover bg-center bg-no-repeat object-fill h-cover w-full px-10 py-24 text-black"
      style={{
        backgroundImage: `url('${coverUrl}')`,
      }}
    />
    <nav className="bg-gray-400 text-white px-4 py-2">
      <span>Home</span>
    </nav>
  </>
);
