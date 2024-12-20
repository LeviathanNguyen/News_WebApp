import "dotenv/config";
import axios from "axios";
import { sequelize } from "../config/database.js";
import { User, Category, Tag, Article } from "../models/index.js";

export default {
    async up() {
        const categoriesData = [
            { name: "Technology", slug: "technology" },
            { name: "Business", slug: "business" },
            { name: "Entertainment", slug: "entertainment" },
            { name: "Health", slug: "health" },
            { name: "Science", slug: "science" },
        ];
        const categories = await Category.bulkCreate(categoriesData);

        const tagsData = [
            { name: 'AI', slug: 'ai' },
            { name: 'Startup', slug: 'startup' },
            { name: 'Hollywood', slug: 'hollywood' },
            { name: 'COVID-19', slug: 'covid-19' },
            { name: 'Space', slug: 'space' },
        ];
        const tags = await Tag.bulkCreate(tagsData);

        const usersData = [
            {
                username: 'johndoe',
                email: 'johndoe@example.com',
                password: 'password123',
                full_name: 'John Doe',
                role: 'writer',
            },
            {
                username: 'janefoster',
                email: 'janedoe@example.com',
                password: 'password123',
                full_name: 'Jane Foster',
                role: 'editor',
            },
        ];
        const users = await User.bulkCreate(usersData);

        const fetchArticles = async (category) => {
            const apiKey = process.env.NEWS_API_KEY;
            const url = `https://newsapi.org/v2/top-headlines?category=${category}&pageSize=5&apiKey=${apiKey}`;
            const response = await axios.get(url);
            return response.data.articles;
        };

        for (const category of categories) {
            const articles = await fetchArticles(cate.slug);
            for (const article of articles) {
                await Article.create({
                    title: article.title,
                    slug: article.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-'),
                    abstract: article.description || 'No description available.',
                    content: article.content || 'No content available.',
                    thumbnail: article.urlToImage,
                    status: 'published',
                    is_premium: false,
                    publish_date: new Date(article.publishedAt),
                    view_count: Math.floor(Math.random() * 5000) + 100,
                    author_id: users[Math.floor(Math.random() * users.length)].id,
                    category_id: category.id,
                });
            }
        }
    },

    async down() {
        await sequelize.transaction(async (transaction) => {
            await Article.destroy({ where: {}, transaction });
            await Category.destroy({ where: {}, transaction });
            await User.destroy({ where: {}, transaction });
        });
    },
};