import mongoose from "mongoose";
import { IBlog } from "../interfaces/blog/blog.interface";
import { IBlogManager } from "../interfaces/blog/blog.manager.interface";
import Blog from "../models/blog.model";

export class BlogManager implements IBlogManager {
  private static instance: BlogManager;

  private constructor() {}

  public static getInstance(): BlogManager {
    if (!BlogManager.instance) {
      BlogManager.instance = new BlogManager();
    }

    return BlogManager.instance;
  }

  public async create(blog: IBlog): Promise<IBlog> {
    return await Blog.create(blog);
  }

  public async getAll(): Promise<IBlog[]> {
    return await Blog.find().exec();
  }

  public async getById(id: string): Promise<IBlog> {
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new Error("Cart not found");
    }
    return blog;
  }

  //getby user id
  public async getByUserId(id: string): Promise<IBlog> {
    return (await Blog.findOne({
      user: new mongoose.Types.ObjectId(id),
    })) as IBlog;
  }

  //updateById
  public async updateById(id: string, blog: any): Promise<IBlog> {
    return (await Blog.findByIdAndUpdate(id, blog, { new: true })) as IBlog;
  }

  //getBySlug
  public async getBySlug(slug: string): Promise<IBlog> {
    return (await Blog.findOne({ slug: slug })) as IBlog;
  }

  //getBySource
  public async getBySource(source: string): Promise<IBlog[]> {
    console.log("source", source);
    return await Blog.find({ source: source }).exec();
  }

  // getBlogList page limit search
  public async getBlogList(
    limit: number = 10,
    page: number = 1,
    search: string = '',
    sortField: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ blogs: IBlog[]; pagination: { total: number; pages: number } }> {
    try {
      // Build search conditions
      const searchConditions = search
        ? {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
              { "category.title": { $regex: search, $options: "i" } },
              { source: { $regex: search, $options: "i" } },
            ],
          }
        : {};

      // Get total count for pagination
      const totalCount = await Blog.countDocuments(searchConditions);

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limit);

      // Build sort object
      const sortObj: any = {};
      sortObj[sortField] = sortOrder === 'asc' ? 1 : -1;

      // Get blogs with pagination, sorting, and user lookup
      const blogs = await Blog.aggregate([
        { $match: searchConditions },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            title: 1,
            description: 1,
            source: 1,
            slug: 1,
            thumbnail: 1,
            createdAt: 1,
            category: 1,
            url: 1,
            content: 1,
            date: 1,
            user: {
              _id: 1,
              name: 1,
            }
          }
        },
        { $sort: sortObj },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ]);

      return {
        blogs,
        pagination: {
          total: totalCount,
          pages: totalPages
        }
      };
    } catch (error) {
      console.error('Error in getBlogList:', error);
      throw error;
    }
  }

  //deleteById
  public async deleteById(id: string): Promise<IBlog> {
    return (await Blog.findByIdAndDelete(id)) as IBlog;
  }
}

export default BlogManager.getInstance();
