# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with ES Modules
- TypeScript configuration with strict mode
- Express.js server with middleware stack
- MongoDB integration with Mongoose
- Redis integration with ioredis
- Socket.io for real-time features
- BullMQ for background job processing
- Swagger UI for API documentation
- Winston logger configuration
- Error handling utilities and middleware
- Zod validation middleware
- JWT authentication utilities
- Docker Compose setup for MongoDB and Redis
- Layered architecture (Routes → Controllers → Services → Models)
- User, Lesson, Classroom, and Quiz models
- Environment configuration with validation
- ESLint and Prettier setup
- Jest testing framework
- Git hooks with Husky
- Comprehensive documentation

### Project Structure
- `/src/configs` - Configuration files
- `/src/constants` - Application constants
- `/src/enums` - TypeScript enums
- `/src/utils` - Utility functions
- `/src/middlewares` - Express middlewares
- `/src/validators` - Zod validation schemas
- `/src/models` - Mongoose models
- `/src/services` - Business logic
- `/src/controllers` - Request handlers
- `/src/routes` - API routes
- `/src/jobs` - Background jobs (BullMQ)
- `/src/sockets` - Socket.io handlers
- `/src/database` - Seeders and migrations
- `/src/__tests__` - Test files

## [1.0.0] - 2025-12-23

### Initial Release

- Project initialization
- Core infrastructure setup
- Development environment configured
- Documentation created

---

## Version Format

**MAJOR.MINOR.PATCH**

- **MAJOR**: Incompatible API changes
- **MINOR**: New features (backwards-compatible)
- **PATCH**: Bug fixes (backwards-compatible)

## Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
