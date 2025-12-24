import swaggerJsdoc from 'swagger-jsdoc';
import { envConfig } from './env.config.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EduFlow Hub API',
      version: '1.0.0',
      description: 'API documentation for EduFlow Hub - AI-powered interactive learning platform',
      contact: {
        name: 'API Support',
        email: 'support@eduflow-hub.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: envConfig.serverUrl,
        description: envConfig.isDevelopment ? 'Development server' : 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errorCode: {
              type: 'string',
              example: 'ERROR_CODE',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['student', 'teacher', 'admin'],
              example: 'student',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              example: 'active',
            },
            avatar: {
              type: 'string',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Profile',
        description: 'Current user profile and personal resources',
      },
      {
        name: 'Users',
        description: 'User management endpoints (Admin only)',
      },
      {
        name: 'Lessons',
        description: 'Lesson management and AI generation endpoints',
      },
      {
        name: 'Classrooms',
        description: 'Classroom management endpoints',
      },
      {
        name: 'Quizzes',
        description: 'Quiz management endpoints',
      },
      {
        name: 'Resources',
        description: 'File upload and resource management endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to API docs
};

export const swaggerSpec = swaggerJsdoc(options);
