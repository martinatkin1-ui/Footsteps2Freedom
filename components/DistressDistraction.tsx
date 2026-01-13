
import React from 'react';

// This component is replaced by the separate AcceptsSkill and ImproveSkill components.
// It remains as a shell to prevent import errors during transition if any exist.

const DistressDistraction: React.FC<{ onExit: (rating?: number) => void }> = ({ onExit }) => {
  return (
    <div className="p-10 text-center space-y-4">
      <h2 className="text-2xl font-black">Tool Relocated</h2>
      <p>Distress Tolerance is now divided into specific ACCEPTS and IMPROVE modules for better focus.</p>
      <button onClick={() => onExit()} className="px-6 py-2 bg-teal-600 text-white rounded-xl">Back to Toolkit</button>
    </div>
  );
};

export default DistressDistraction;
