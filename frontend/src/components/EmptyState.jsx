const EmptyState = ({ title = 'Nothing here yet', description }) => (
  <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-200 bg-white py-14 text-center">
    <p className="text-sm font-medium text-gray-600">{title}</p>
    {description && <p className="text-sm text-gray-400 max-w-sm">{description}</p>}
  </div>
);

export default EmptyState;
