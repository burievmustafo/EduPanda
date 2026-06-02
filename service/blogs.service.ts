import { IBlog } from '@/types'
import request, { gql } from 'graphql-request'
import { cache } from 'react'

const graphqlAPI = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT!

export const getBlogs = async () => {
	const query = gql`
		query MyQuery {
			blogs {
				title
				createdAt
				author {
					name
					image {
						url
					}
				}
				category {
					name
					slug
				}
				description
				tag {
					name
					slug
				}
				image {
					url
				}
				content {
					html
				}
				slug
			}
		}
	`

	try {
		const { blogs } = await request<{ blogs: IBlog[] }>(graphqlAPI, query)
		return blogs
	} catch (error) {
		// HyGraph'da Blog modeli yo'q bo'lsa, bo'sh array qaytaradi
		console.error('Blog fetch error:', error)
		return []
	}
}

export const getDetailedBlog = cache(async (slug: string) => {
	const query = gql`
		query MyQuery($slug: String!) {
			blog(where: { slug: $slug }) {
				author {
					name
					image {
						url
					}
					bio
					id
				}
				content {
					html
				}
				createdAt
				image {
					url
				}
				slug
				tag {
					name
					slug
				}
				category {
					name
					slug
				}
				title
			}
		}
	`

	try {
		const { blog } = await request<{ blog: IBlog }>(graphqlAPI, query, { slug })
		return blog
	} catch (error) {
		console.error('Blog detail fetch error:', error)
		return null
	}
})
