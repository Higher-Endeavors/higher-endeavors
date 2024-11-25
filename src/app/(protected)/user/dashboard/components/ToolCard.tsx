interface ToolCardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function ToolCard({ title, description, children }: ToolCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="tool-content">
        {children}
      </div>
    </div>
  );
} 