import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { useState } from 'react'
import Pagination from '@/components/Pagination'
import formatDate from '@/lib/utils/formatDate'
import { motion } from 'framer-motion'

export default function ListLayout({ posts, title, initialDisplayPosts = [], pagination }) {
  const [searchValue, setSearchValue] = useState('')
  const filteredBlogPosts = posts.filter((frontMatter) => {
    const searchContent = frontMatter.title + frontMatter.summary + frontMatter.tags.join(' ')
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })

  // If initialDisplayPosts exist, display it if no searchValue is specified
  const displayPosts =
    initialDisplayPosts.length > 0 && !searchValue ? initialDisplayPosts : filteredBlogPosts

  return (
    <>
      <div className="divide-y divide-gray-700">
        <div className="space-y-2 pb-8 md:space-y-5">
          <h1 className="tracking-tighttext-gray-100 text-3xl font-extrabold leading-9 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {title}
          </h1>
          <div className="relative max-w-lg">
            <input
              aria-label="Search articles"
              type="text"
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search articles"
              className="block w-full rounded-md border border-gray-900 bg-gray-800 px-4 py-2 text-gray-100 focus:border-primary-500 focus:ring-primary-500"
            />
            <svg
              className="absolute right-3 top-3 h-5 w-5 text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <motion.ul>
          <div className="grid grid-cols-1 gap-8 pt-10 md:grid-cols-2 xl:grid-cols-3">
            {!filteredBlogPosts.length && 'No posts found.'}
            {displayPosts.map((frontMatter) => {
              const { slug, date, title, summary, tags, images } = frontMatter
              const firstTwoTags = tags.slice(0, 1)

              return (
                <div
                  key={slug}
                  className="bg-day group relative h-full transform rounded-lg transition duration-500 hover:scale-105"
                >
                  <div className="animate-tilt absolute -inset-0.5 rounded-lg bg-gradient-to-r  opacity-0 blur transition duration-1000 group-hover:opacity-20 group-hover:duration-200"></div>
                  <a className="c-card bg-cardBg relative block h-full overflow-hidden rounded-lg shadow-none">
                    <div className="group relative max-h-4 overflow-hidden rounded-lg pb-60">
                      <Link href={`/blog/${slug}`}>
                        <span>
                          <img
                            alt={title}
                            src={images}
                            className="absolute inset-0 h-full w-full  object-cover shadow-none "
                          />
                        </span>
                      </Link>
                    </div>
                    <div className="h-full py-4 px-2">
                      <span className="inline-flex w-full items-center justify-between">
                        <span className="inline-block rounded-full border border-green-700 py-1 px-2 text-xs font-medium">
                          {firstTwoTags.map((tag) => (
                            <Tag key={tag} text={tag} />
                          ))}
                        </span>
                        <time dateTime={date}>{formatDate(date)}</time>
                      </span>
                      <h2 className="mt-2 mb-2 font-bold md:text-xl">
                        <Link href={`/blog/${slug}`} className="text-white-100">
                          {title}
                        </Link>
                      </h2>
                      <p className="h-auto text-sm tracking-wider">{summary}</p>
                    </div>
                  </a>
                </div>
              )
            })}
          </div>
        </motion.ul>
      </div>
      {pagination && pagination.totalPages > 1 && !searchValue && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )}
    </>
  )
}
