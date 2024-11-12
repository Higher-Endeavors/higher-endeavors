export default function ArticleTitle({ children }) {
  return (
    <div className="">
      <h1 className="text-4xl font-bold mb-6 underline">
        {children}
      </h1>
    </div>
  )
}