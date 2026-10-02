const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow">
        <div className="mb-4 text-5xl">🔒</div>

        <h1 className="text-2xl font-bold text-gray-900">
          Access Denied
        </h1>

        <p className="mt-3 text-gray-600">
          You don't have permission to view this page.
        </p>

        <button
          onClick={() => window.history.back()}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;