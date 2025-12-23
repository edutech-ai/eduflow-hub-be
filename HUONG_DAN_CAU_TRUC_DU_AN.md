# Hướng Dẫn Cấu Trúc Dự Án EduFlow Hub Backend

## Tổng Quan Kiến Trúc

EduFlow Hub được xây dựng theo mô hình **Layered Architecture** (Kiến trúc phân lớp) với các lớp rõ ràng, dễ bảo trì và mở rộng.

### Sơ Đồ Kiến Trúc

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Frontend)                    │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                    API LAYER (Routes)                   │
│  - Routes: Định nghĩa endpoints                         │
│  - Middlewares: Validation (Individual Schemas), Auth   │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│              CONTROLLER LAYER (Controllers)             │
│  - Request handling                                     │
│  - Response formatting                                  │
│  - Call services                                        │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│               SERVICE LAYER (Services)                  │
│  - Business logic                                       │
│  - Validation logic                                     │
│  - Call repositories                                    │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│            REPOSITORY LAYER (Repositories)              │
│  - Data access abstraction                              │
│  - CRUD operations                                      │
│  - Query building                                       │
│  - Document formatting                                  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│              DATA LAYER (Mongoose Models)               │
│  - Schema definitions                                   │
│  - Indexes & hooks                                      │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                     DATABASE (MongoDB)                  │
└─────────────────────────────────────────────────────────┘

         PARALLEL SERVICES:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Socket.io  │  │     n8n      │  │    Redis     │
│  (Real-time) │  │  (Workflows) │  │   (Cache)    │
│              │  │ AI Generation│  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Cấu Trúc Thư Mục Chi Tiết

```
EduFlow-Hub/
│
├── src/                              # Mã nguồn chính
│   │
│   ├── configs/                      # Các file cấu hình
│   │   ├── env.config.ts            # Quản lý biến môi trường
│   │   ├── database.config.ts       # Kết nối MongoDB
│   │   ├── redis.config.ts          # Kết nối Redis
│   │   ├── logger.config.ts         # Cấu hình Winston logger
│   │   ├── socket.config.ts         # Cấu hình Socket.io
│   │   ├── bullmq.config.ts         # Cấu hình BullMQ
│   │   └── swagger.config.ts        # Cấu hình Swagger UI
│   │
│   ├── constants/                    # Hằng số ứng dụng
│   │   └── http.constant.ts         # HTTP status codes & messages
│   │
│   ├── enums/                        # TypeScript enums
│   │   ├── user.enum.ts             # UserRole, UserStatus
│   │   ├── lesson.enum.ts           # LessonStatus, LessonGrade
│   │   └── classroom.enum.ts        # ClassroomStatus, QuizStatus, QuizType
│   │
│   ├── types/                        # TypeScript type definitions
│   │   └── (các file .d.ts)
│   │
│   ├── utils/                        # Utility functions
│   │   ├── error.util.ts            # Custom error classes
│   │   └── async-handler.util.ts    # Async error wrapper
│   │
│   ├── middlewares/                  # Express middlewares
│   │   ├── error.middleware.ts      # Global error handler
│   │   ├── validate.middleware.ts   # Request validation với Zod
│   │   ├── auth.middleware.ts       # JWT authentication (TODO)
│   │   └── rate-limit.middleware.ts # Rate limiting (TODO)
│   │
│   ├── validators/                   # Zod validation schemas (Individual Exports ✅)
│   │   ├── auth.validator.ts        # registerSchema, loginSchema, etc. ✅
│   │   ├── user.validator.ts        # createUserSchema, updateUserSchema, etc. ✅
│   │   ├── lesson.validator.ts      # createLessonSchema, etc. ✅
│   │   ├── classroom.validator.ts   # createClassroomSchema, etc. ✅
│   │   └── quiz.validator.ts        # createQuizSchema, submitAnswerSchema, etc. ✅
│   │
│   ├── models/                       # Mongoose models (Schema + Types)
│   │   ├── user.model.ts            # User schema & interface ✅
│   │   ├── lesson.model.ts          # Lesson schema & interface ✅
│   │   ├── classroom.model.ts       # Classroom schema & interface ✅
│   │   └── quiz.model.ts            # Quiz schema & interface ✅
│   │
│   ├── repositories/                 # Data Access Layer 
│   │   ├── base.repository.ts       # Generic CRUD operations ✅
│   │   ├── user.repository.ts       # User-specific queries ✅
│   │   ├── lesson.repository.ts     # Lesson queries ✅
│   │   ├── classroom.repository.ts  # Classroom queries ✅
│   │   └── quiz.repository.ts       # Quiz queries ✅
│   │
│   ├── dtos/                         # Data Transfer Objects
│   │   └── (response/request DTOs)
│   │
│   ├── services/                     # Business logic layer
│   │   ├── auth.service.ts          # Authentication logic ✅
│   │   ├── user.service.ts          # User management ✅
│   │   ├── lesson.service.ts        # Lesson CRUD ✅
│   │   ├── classroom.service.ts     # Classroom management ✅
│   │   ├── quiz.service.ts          # Quiz logic ✅
│   │   ├── ai.service.ts            # AI integration (Gemini/OpenAI) (TODO)
│   │   └── storage.service.ts       # Cloudflare R2 integration (TODO)
│   │
│   ├── controllers/                  # Request handlers
│   │   ├── auth.controller.ts       # Auth endpoints (TODO)
│   │   ├── user.controller.ts       # User endpoints (TODO)
│   │   ├── lesson.controller.ts     # Lesson endpoints (TODO)
│   │   ├── classroom.controller.ts  # Classroom endpoints (TODO)
│   │   └── quiz.controller.ts       # Quiz endpoints (TODO)
│   │
│   ├── routes/                       # API routes
│   │   ├── index.ts                 # Route aggregator
│   │   ├── auth.routes.ts           # /api/v1/auth/* (TODO)
│   │   ├── user.routes.ts           # /api/v1/users/* (TODO)
│   │   ├── lesson.routes.ts         # /api/v1/lessons/* (TODO)
│   │   ├── classroom.routes.ts      # /api/v1/classrooms/* (TODO)
│   │   └── quiz.routes.ts           # /api/v1/quizzes/* (TODO)
│   │
│   ├── jobs/                         # Background jobs 
│   │   ├── queues/                  # Queue managers
│   │   │   └── queue-manager.ts    # Centralized queue management
│   │   │
│   │   └── workers/                 # Job processors
│   │       ├── base.worker.ts      # Base worker class
│   │       ├── ai-generation.worker.ts  # AI lesson generation
│   │       ├── pdf-generation.worker.ts # PDF export (TODO)
│   │       └── email.worker.ts     # Email notifications (TODO)
│   │
│   ├── sockets/                      # Socket.io real-time features
│   │   ├── events/                  # Event definitions
│   │   │   └── classroom.events.ts # Classroom event constants
│   │   │
│   │   └── handlers/                # Socket event handlers
│   │       └── classroom.handler.ts # Classroom socket logic
│   │
│   ├── database/                     # Database utilities
│   │   ├── seeders/                 # Data seeders
│   │   │   └── index.ts            # Seed runner (TODO)
│   │   │
│   │   └── migrations/              # Database migrations (nếu cần)
│   │
│   ├── templates/                    # Email & PDF templates
│   │   ├── emails/                  # EJS email templates
│   │   └── pdfs/                    # PDF templates
│   │
│   ├── __tests__/                    # Test files
│   │   ├── unit/                    # Unit tests
│   │   ├── integration/             # Integration tests
│   │   └── e2e/                     # End-to-end tests
│   │
│   ├── app.ts                        # Express app initialization
│   └── server.ts                     # Server entry point
│
├── public/                           # Static files
│   ├── uploads/                     # User uploaded files
│   └── temp/                        # Temporary files
│
├── logs/                             # Application logs
│   ├── error.log                    # Error logs
│   └── combined.log                 # All logs
│
├── dist/                             # Compiled JavaScript (generated)
│
├── node_modules/                     # Dependencies (generated)
│
├── .env                              # Environment variables (DO NOT COMMIT)
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── .prettierrc                       # Prettier config
├── .editorconfig                     # Editor config
├── eslint.config.js                  # ESLint config
├── tsconfig.json                     # TypeScript config
├── tsconfig-paths.json               # Path aliases for production
├── .tscaliasrc.json                  # TSC alias config
├── package.json                      # Project metadata
├── docker-compose.yml                # Docker services
├── Dockerfile                        # Production Docker image
├── README.md                         # Project documentation
└── HUONG_DAN_CAU_TRUC_DU_AN.md      # This file
```

## Chi Tiết Từng Layer

### 1. Routes Layer (API Endpoints)

**Vai trò**: Định nghĩa các endpoint và áp dụng middleware.

**Pattern** (với Individual Validator Exports):
```typescript
// src/routes/example.routes.ts
import { Router } from 'express';
import { exampleController } from '@/controllers/example.controller.js';
import { validate } from '@/middlewares/validate.middleware.js';
import { createExampleSchema } from '@/validators/example.validator.js'; // Individual export ✅
import { authenticate } from '@/middlewares/auth.middleware.js';

const router = Router();

router.post(
  '/',
  authenticate,                    // 1. Authentication
  validate(createExampleSchema),   // 2. Validation (Individual schema)
  exampleController.create         // 3. Handler
);

export default router;
```

### 2. Controllers Layer (Request/Response)

**Vai trò**: Xử lý HTTP request, gọi service, format response.

**Pattern**:
```typescript
// src/controllers/example.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/async-handler.util.js';
import { exampleService } from '@/services/example.service.js';
import { HTTP_STATUS } from '@/constants/http.constant.js';

export const exampleController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const result = await exampleService.create(data);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Created successfully',
      data: result,
    });
  }),
};
```

### 3. Services Layer (Business Logic)

**Vai trò**: Chứa logic nghiệp vụ, gọi repositories thay vì models trực tiếp.

**Pattern** (với Repository):
```typescript
// src/services/example.service.ts
import { exampleRepository } from '@/repositories/example.repository.js'; // Use repository ✅
import { ApiError } from '@/utils/error.util.js';
import { HTTP_STATUS } from '@/constants/http.constant.js';

export class ExampleService {
  async create(data: any) {
    // Business logic validation
    if (!data.name) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Name is required');
    }

    // Call repository instead of model directly
    const example = await exampleRepository.create(data);
    return example;
  }

  async findById(id: string) {
    const example = await exampleRepository.findById(id);
    if (!example) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Example not found');
    }
    return example;
  }
}

// Export singleton
export const exampleService = new ExampleService();
```

### 4. Repositories Layer (Data Access) ⭐ NEW

**Vai trò**: Abstraction layer giữa Service và Model, cung cấp CRUD operations và query methods.

**BaseRepository Pattern**:
```typescript
// src/repositories/base.repository.ts
export abstract class BaseRepository<T extends Document> {
  constructor(protected model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> { ... }
  async findById(id: string, populate?: PopulateOptions): Promise<T | null> { ... }
  async findOne(filter: FilterQuery<T>): Promise<T | null> { ... }
  async findAll(options: FindAllOptions): Promise<T[]> { ... }
  async updateById(id: string, data: Partial<T>): Promise<T> { ... }
  async deleteById(id: string): Promise<T> { ... }
  async count(filter: FilterQuery<T>): Promise<number> { ... }

  // Override in child class để format response
  protected formatDocument(document: any): T { ... }
}
```

**Child Repository Pattern**:
```typescript
// src/repositories/example.repository.ts
import { BaseRepository } from './base.repository.js';
import { Example, IExample } from '@/models/example.model.js';

export class ExampleRepository extends BaseRepository<IExample> {
  constructor() {
    super(Example);
  }

  // Custom query methods
  async findByName(name: string): Promise<IExample | null> {
    return await this.findOne({ name });
  }

  async findActive(): Promise<IExample[]> {
    return await this.findAll({
      filter: { status: 'active' }
    });
  }

  // Override để remove sensitive fields
  protected formatDocument(document: any): IExample {
    delete document.secretField;
    return super.formatDocument(document);
  }
}

// Export singleton
export const exampleRepository = new ExampleRepository();
```

### 5. Models Layer (Database Schema)

**Vai trò**: Định nghĩa schema, validation, indexes cho MongoDB.

**Pattern**:
```typescript
// src/models/example.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IExample extends Document {
  name: string;
  status: string;
}

const exampleSchema = new Schema<IExample>({
  name: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'] },
}, { timestamps: true });

exampleSchema.index({ name: 1 });

export const Example = mongoose.model<IExample>('Example', exampleSchema);
```

## Luồng Xử Lý Request (Request Flow)

```
1. CLIENT gửi request
   ↓
2. ROUTES nhận request
   ↓
3. MIDDLEWARES xử lý (Auth, Validation với Individual Schemas)
   ↓
4. CONTROLLER nhận validated data
   ↓
5. SERVICE thực hiện business logic
   ↓
6. REPOSITORY thực hiện data access operations ⭐
   ↓
7. MODEL tương tác với MongoDB
   ↓
8. REPOSITORY format document & trả về
   ↓
9. SERVICE xử lý thêm (nếu cần) & trả về CONTROLLER
   ↓
10. CONTROLLER format response
   ↓
11. Response trả về CLIENT
```

**Ví dụ flow cụ thể:**
```typescript
Client → Route (validate with createUserSchema)
       → Controller (call userService.create)
       → Service (business logic + call userRepository.create)
       → Repository (call User model + formatDocument)
       → Model (save to MongoDB)
       → Repository (return formatted user)
       → Service (return to controller)
       → Controller (format response)
       → Client (receive JSON response)
```

## Xử Lý Background Jobs (BullMQ)

### Luồng AI Generation

```
1. User yêu cầu tạo giáo án (POST /api/v1/lessons/generate)
   ↓
2. Controller tạo Lesson với status="generating"
   ↓
3. Service đẩy job vào AI Queue (BullMQ)
   ↓
4. Controller trả response 202 Accepted
   ↓
5. Worker lấy job từ queue
   ↓
6. Worker gọi Gemini/OpenAI API
   ↓
7. Worker cập nhật Lesson status="completed"
   ↓
8. Worker emit Socket.io event "lesson_ready"
   ↓
9. Frontend nhận event và hiển thị giáo án
```

### Ví Dụ Code

```typescript
// Controller
import { queueManager } from '@/jobs/queues/queue-manager.js';
import { QUEUE_NAMES } from '@/configs/bullmq.config.js';

const lesson = await Lesson.create({
  title,
  status: LessonStatus.GENERATING,
  author: req.user.id,
});

await queueManager.addJob(QUEUE_NAMES.AI_GENERATION, 'generate-lesson', {
  lessonId: lesson._id.toString(),
  prompt: data.prompt,
});

res.status(202).json({ message: 'Generating...', lessonId: lesson._id });
```

```typescript
// Worker
protected async process(job: Job<AIGenerationJobData>): Promise<void> {
  const { lessonId, prompt } = job.data;

  // Call AI API
  const content = await aiService.generateLesson(prompt);

  // Update database
  await Lesson.findByIdAndUpdate(lessonId, {
    content,
    status: LessonStatus.COMPLETED,
  });

  // Emit Socket.io event
  socketServer.emitToUser(userId, CLASSROOM_EVENTS.LESSON_READY, {
    lessonId,
  });
}
```

## Xử Lý Real-time (Socket.io)

### Luồng Quiz Real-time

```
1. Teacher tạo quiz và start (POST /api/v1/quizzes/:id/start)
   ↓
2. Server emit "new_quiz" event tới room "classroom:XXX"
   ↓
3. Students nhận event và hiển thị quiz
   ↓
4. Teacher emit "new_question" khi chuyển câu
   ↓
5. Students trả lời, emit "submit_answer"
   ↓
6. Server tính điểm, update Redis Sorted Set
   ↓
7. Server emit "update_leaderboard" tới toàn bộ room
   ↓
8. Clients cập nhật bảng xếp hạng real-time
```

### Ví Dụ Socket Handler

```typescript
// Join classroom
socket.on(CLASSROOM_EVENTS.JOIN_CLASS, async ({ classroomId, userId }) => {
  await socket.join(`classroom:${classroomId}`);
  socket.to(`classroom:${classroomId}`).emit(CLASSROOM_EVENTS.USER_JOINED, {
    userId,
  });
});

// Submit answer
socket.on(CLASSROOM_EVENTS.SUBMIT_ANSWER, async (data) => {
  // Process answer
  const score = await quizService.submitAnswer(data);

  // Update leaderboard in Redis
  await redis.zadd(`leaderboard:${data.quizId}`, score, data.userId);

  // Broadcast to classroom
  socket.to(`classroom:${data.classroomId}`).emit(
    CLASSROOM_EVENTS.UPDATE_LEADERBOARD,
    await getLeaderboard(data.quizId)
  );
});
```

## Best Practices

### 1. Error Handling

**Luôn sử dụng custom error classes**:
```typescript
import { NotFoundError, BadRequestError } from '@/utils/error.util.js';

if (!user) {
  throw new NotFoundError('User not found');
}

if (password.length < 8) {
  throw new BadRequestError('Password too short');
}
```

### 2. Async Operations

**Luôn wrap async controllers bằng asyncHandler**:
```typescript
export const myController = {
  getData: asyncHandler(async (req, res) => {
    // Errors sẽ tự động được catch và forward tới error middleware
    const data = await service.getData();
    res.json(data);
  }),
};
```

### 3. Validation

**Sử dụng Zod với Individual Exports** ✅:
```typescript
import { z } from 'zod';

// ❌ Old way (grouped exports)
export const userValidator = {
  create: z.object({ ... }),
  update: z.object({ ... })
};

// ✅ New way (individual exports)
export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    email: z.string().email().optional(),
  }),
});

// Usage in routes
import { createUserSchema } from '@/validators/user.validator.js';
validate(createUserSchema) // Chỉ import những gì cần
```

**Lợi ích:**
- ✅ Tree-shaking tốt hơn (reduce bundle size)
- ✅ Rõ ràng hơn khi đọc code
- ✅ Better TypeScript inference
- ✅ Dễ maintain

### 4. TypeScript

**Luôn define types/interfaces rõ ràng**:
```typescript
interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

async create(data: CreateUserDTO): Promise<IUser> {
  // Implementation
}
```

### 5. Logging

**Sử dụng logger thay vì console.log**:
```typescript
import logger from '@/configs/logger.config.js';

logger.info('User created', { userId });
logger.error('Failed to create user', error);
logger.debug('Processing data', { data });
```

## Path Aliases

Project sử dụng path aliases để import dễ dàng:

```typescript
// ❌ Không nên
import { User } from '../../../models/user.model.js';

// ✅ Nên
import { User } from '@/models/user.model.js';
```

**Available aliases**:
- `@/*` → `src/*`
- `@configs/*` → `src/configs/*`
- `@controllers/*` → `src/controllers/*`
- `@services/*` → `src/services/*`
- `@models/*` → `src/models/*`
- `@routes/*` → `src/routes/*`
- `@middlewares/*` → `src/middlewares/*`
- `@utils/*` → `src/utils/*`
- `@validators/*` → `src/validators/*`
- `@types/*` → `src/types/*`

## Testing Strategy

### Unit Tests
Test các functions, services độc lập:
```typescript
describe('UserService', () => {
  it('should create user', async () => {
    const user = await userService.create(mockData);
    expect(user).toBeDefined();
  });
});
```

### Integration Tests
Test API endpoints:
```typescript
describe('POST /api/v1/users', () => {
  it('should create user', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send(userData)
      .expect(201);
  });
});
```

## Deployment Checklist

- [ ] Set all environment variables
- [ ] Build project: `npm run build`
- [ ] Test production build: `npm start`
- [ ] Configure MongoDB connection string
- [ ] Configure Redis connection
- [ ] Set up Cloudflare R2 bucket
- [ ] Configure AI API keys (Gemini/OpenAI)
- [ ] Set up domain and SSL certificate
- [ ] Configure CORS origins
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy

## Next Steps (TODO)

1. **Authentication System**
   - [ ] Implement JWT auth middleware
   - [ ] Create auth routes & controllers
   - [ ] Add refresh token rotation
   - [ ] Password reset flow

2. **API Implementation**
   - [ ] User CRUD endpoints
   - [ ] Lesson CRUD + AI generation
   - [ ] Classroom management
   - [ ] Quiz system
   - [ ] File upload to Cloudflare R2

3. **Real-time Features**
   - [ ] Complete Socket.io handlers
   - [ ] Redis leaderboard integration
   - [ ] Real-time notifications

4. **Background Jobs**
   - [ ] PDF generation worker
   - [ ] Email notification worker
   - [ ] Analytics worker

5. **Testing**
   - [ ] Unit tests for services
   - [ ] Integration tests for APIs
   - [ ] E2E tests for critical flows

6. **DevOps**
   - [ ] CI/CD pipeline
   - [ ] Monitoring & alerting
   - [ ] Database backups
   - [ ] Performance optimization

## Tài Liệu Tham Khảo

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [Socket.io Docs](https://socket.io/)
- [BullMQ Docs](https://docs.bullmq.io/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Zod Docs](https://zod.dev/)

---

## ⭐ Cải Tiến Mới (Architecture Updates)

### 1. Repository Pattern
- ✅ **Đã thêm**: Lớp Repository giữa Service và Model
- **Lợi ích**: Abstraction, dễ test, dễ thay đổi DB sau này
- **Files**: `src/repositories/*.ts`
- **Xem thêm**: [ARCHITECTURE.md](./ARCHITECTURE.md)

### 2. Individual Validator Exports
- ✅ **Đã chuyển**: Từ grouped exports sang individual exports
- **Lợi ích**: Tree-shaking, rõ ràng, TypeScript inference tốt hơn
- **Pattern**: `export const createUserSchema = z.object({...})`
- **Files**: `src/validators/*.ts`

### 3. n8n Integration (Planned)
- 🔄 **Sẽ thêm**: n8n cho AI workflow automation
- **Use case**: AI lesson generation, email notifications, scheduled tasks
- **Benefits**: Visual workflows, auto retry, monitoring
- **Setup**: Docker container + webhook integration

### So Sánh Kiến Trúc

**Trước:**
```
Route → Controller → Service → Model → DB
```

**Sau:**
```
Route → Controller → Service → Repository → Model → DB
        (Individual                ↑
         Schemas)            formatDocument()
```

**Tại sao tốt hơn?**
- Service không phụ thuộc trực tiếp vào Mongoose
- Dễ mock repository khi test
- Consistent data formatting
- Reusable CRUD operations (BaseRepository)
- Scalable cho dự án lớn

---

**Lưu ý**: Đây là hướng dẫn chi tiết về cấu trúc dự án. Khi implement các tính năng mới, hãy tuân theo pattern và conventions đã được định nghĩa để đảm bảo tính nhất quán của codebase.

**Tài liệu bổ sung:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Chi tiết về Repository pattern và validators
- [DATABASE.md](./DATABASE.md) - Hướng dẫn seed data và backup
- [README.md](./README.md) - Quick start và overview
