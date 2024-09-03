export default function ArticleTitle({ children }) {
  return (
    <h2 className="text-3xl pt-32 mb-12 font-bold text-center sm:text-center lg:text-left lg:max-w-2xl lg:mx-auto md:leading-none">
      {children}
    </h2>
  )
}
