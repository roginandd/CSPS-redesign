import Layout from "../../components/Layout";

const MaintenancePage = () => {
  return (
    <Layout withFooter={false}>
      <section className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <p className="mb-4 rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
          CSPS  Update
        </p>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          We are under maintenance
        </h1>

        <p className="text-gray-400 mb-6 max-w-2xl">
          Sorry, the platform is currently unavailable while we apply important
          updates. Please check back shortly.
        </p>

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">status</p>
          <p className="mt-1 text-sm font-semibold text-white">
            Scheduled service maintenance in progress
          </p>
        </div>

        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold opacity-90 cursor-not-allowed"
        >
          <span className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
          Please wait
        </button>
      </section>
    </Layout>
  );
};

export default MaintenancePage;
