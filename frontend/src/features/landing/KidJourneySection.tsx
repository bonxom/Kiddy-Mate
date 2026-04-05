const KidJourneySection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 text-center">
          KiddyMate – Đồng hành cùng trẻ trên hành trình phát triển
        </h2>

        <div className="mt-10 bg-linear-to-br from-blue-200 to-purple-200 p-2 rounded-3xl shadow-medium transition-all duration-300 hover:shadow-glow-accent">
          <video
            className="w-full aspect-video rounded-2xl object-cover border border-white/70"
            src="/demo_kid.mp4"
            autoPlay
            loop
            muted
            controls
            playsInline
            preload="metadata"
          />
        </div>
      </div>
    </section>
  );
};

export default KidJourneySection;
