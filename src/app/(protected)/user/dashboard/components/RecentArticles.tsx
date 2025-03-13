interface RecentArticlesProps {
  limit?: number;
}

export default async function RecentArticles({ limit = 5 }: RecentArticlesProps) {
  // This will be implemented later when the Guide content is ready
  return (
    <div className="space-y-4">
      {/* Placeholder for articles list */}
      <p className="text-gray-600">Recent articles will appear here...</p>
    </div>
  );
} 