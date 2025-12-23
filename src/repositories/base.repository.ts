import { Model, Document, PopulateOptions, FilterQuery, QueryOptions } from 'mongoose';
import { ApiError } from '../utils/error.util.js';
import { HTTP_STATUS } from '../constants/http.constant.js';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  select?: string;
}

export interface FindAllOptions {
  filter?: FilterQuery<any>;
  pagination?: PaginationOptions;
  populate?: PopulateOptions | PopulateOptions[];
}

export abstract class BaseRepository<T extends Document> {
  constructor(protected model: Model<T>) {}

  /**
   * Create a new document
   */
  async create(data: Partial<T>): Promise<T> {
    const document = await this.model.create(data);
    return this.formatDocument(document);
  }

  /**
   * Find document by ID
   */
  async findById(id: string, populate?: PopulateOptions | PopulateOptions[]): Promise<T | null> {
    let query = this.model.findById(id);

    if (populate) {
      query = query.populate(populate);
    }

    const document = await query.lean();
    if (!document) return null;

    return this.formatDocument(document);
  }

  /**
   * Find one document by query
   */
  async findOne(
    filter: FilterQuery<T>,
    populate?: PopulateOptions | PopulateOptions[]
  ): Promise<T | null> {
    let query = this.model.findOne(filter);

    if (populate) {
      query = query.populate(populate);
    }

    const document = await query.lean();
    if (!document) return null;

    return this.formatDocument(document);
  }

  /**
   * Find all documents with pagination and filtering
   */
  async findAll(options: FindAllOptions = {}): Promise<T[]> {
    const { filter = {}, pagination = {}, populate } = options;
    const { page = 1, limit = 10, sort = '-createdAt', select } = pagination;

    const skip = (page - 1) * limit;

    let query = this.model.find(filter).skip(skip).limit(limit).sort(sort);

    if (select) {
      query = query.select(select);
    }

    if (populate) {
      query = query.populate(populate);
    }

    const documents = await query.lean();
    return documents.map((doc) => this.formatDocument(doc));
  }

  /**
   * Update document by ID
   */
  async updateById(id: string, data: Partial<T>): Promise<T> {
    const document = await this.model
      .findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      })
      .lean();

    if (!document) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Document not found');
    }

    return this.formatDocument(document);
  }

  /**
   * Update one document by query
   */
  async updateOne(filter: FilterQuery<T>, data: Partial<T>): Promise<T> {
    const document = await this.model
      .findOneAndUpdate(filter, data, {
        new: true,
        runValidators: true,
      })
      .lean();

    if (!document) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Document not found');
    }

    return this.formatDocument(document);
  }

  /**
   * Delete document by ID
   */
  async deleteById(id: string): Promise<T> {
    const document = await this.model.findByIdAndDelete(id).lean();

    if (!document) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Document not found');
    }

    return this.formatDocument(document);
  }

  /**
   * Delete one document by query
   */
  async deleteOne(filter: FilterQuery<T>): Promise<T> {
    const document = await this.model.findOneAndDelete(filter).lean();

    if (!document) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Document not found');
    }

    return this.formatDocument(document);
  }

  /**
   * Count documents matching filter
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter);
  }

  /**
   * Check if document exists
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter);
    return count > 0;
  }

  /**
   * Format document before returning
   * Override this method in child repositories for custom formatting
   */
  protected formatDocument(document: any): T {
    if (!document) return document;

    // Remove __v field
    if (document.__v !== undefined) {
      delete (document as any).__v;
    }

    return document as T;
  }
}
