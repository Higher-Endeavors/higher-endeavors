import DateFormatter from '(protected)/guide/components/date-formatter'
import ArticleTitle from '(protected)/guide/components/article-title'

export default function ArticleHeader({ title, date, category, tag, exerpt }) {
  return (
    <>
      <ArticleTitle>{title}</ArticleTitle>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-lg">
          <DateFormatter dateString={date} />
        </div>
        <div className="mb-6 text-lg">
          {category}
        </div>
        <div className="mb-6 text-lg">
          {tag}
        </div>
        <div className="mb-6 text-lg">
          {exerpt}
        </div>
      </div>
    </>
  )
}
