interface AgentCardProps {
  name: string;
  description: string;
  status: "active" | "inactive" | "training";
  interactions: number;
  satisfaction: number;
}

export default function AgentCard({
  name,
  description,
  status,
  interactions,
  satisfaction,
}: AgentCardProps) {
  const statusColors = {
    active: "bg-green-500",
    inactive: "bg-gray-500",
    training: "bg-yellow-500",
  };

  const statusLabels = {
    active: "Active",
    inactive: "Inactive",
    training: "Training",
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
              {name}
            </h3>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
          <span className="text-sm text-gray-400">{statusLabels[status]}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Interactions</p>
          <p className="text-2xl font-bold text-white">{interactions.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Satisfaction</p>
          <p className="text-2xl font-bold text-white">{satisfaction}%</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
          Configure
        </button>
        <button className="flex-1 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}