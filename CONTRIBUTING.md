# Contributing to EduFlow Hub

Cảm ơn bạn đã quan tâm đến việc đóng góp cho EduFlow Hub!

## Quy Trình Đóng Góp

### 1. Fork và Clone

```bash
# Fork repository trên GitHub
# Sau đó clone về máy
git clone https://github.com/your-username/eduflow-hub-be.git
cd eduflow-hub-be
```

### 2. Tạo Branch Mới

```bash
# Tạo branch từ main
git checkout -b feature/amazing-feature

# Hoặc cho bug fix
git checkout -b fix/bug-name
```

**Quy tắc đặt tên branch:**
- `feature/` - Tính năng mới
- `fix/` - Sửa bug
- `refactor/` - Refactor code
- `docs/` - Cập nhật documentation
- `test/` - Thêm tests

### 3. Development

#### Cài đặt dependencies

```bash
npm install
```

or you can use `bun`, `yarn`



#### Chạy development server

```bash
npm run dev
```

#### Code Style

Project sử dụng ESLint và Prettier:

```bash
# Kiểm tra linting
npm run lint

# Fix linting errors
npm run lint:fix

# Format code
npm run format
```

#### Type Checking

```bash
npm run type-check
```

### 4. Testing

Viết tests cho code mới:

```bash
# Chạy tests
npm test

# Chạy tests với watch mode
npm run test:watch

# Generate coverage
npm run test:coverage
```

**Yêu cầu:**
- Unit tests cho services

### 5. Commit

Project sử dụng conventional commits:

```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve memory leak in socket handler"
git commit -m "docs: update API documentation"
```

**Format:**
```
<type>: <description>
```

**Types:**
- `feat`: Tính năng mới
- `fix`: Sửa bug
- `docs`: Documentation
- `style`: Formatting, semicolons, etc.
- `refactor`: Code refactoring
- `test`: Thêm tests
- `chore`: Maintenance tasks

**Ví dụ:**

```
feat: implement JWT authentication

- Add JWT middleware
- Add auth routes and controllers
- Add refresh token rotation
- Update Swagger documentation

Closes #123
```

### 6. Push và Pull Request

```bash
# Push branch
git push origin feature/amazing-feature
```

Tạo Pull Request trên GitHub với:
- Tiêu đề rõ ràng
- Mô tả chi tiết những gì đã thay đổi
- Screenshots (nếu có thay đổi UI)
- Link đến issue liên quan (nếu có)

## Code Standards

### TypeScript

- Luôn define types/interfaces rõ ràng
- Hạn chế sử dụng `any` (trừ khi thực sự cần thiết)
- Sử dụng type inference khi có thể

```typescript
// ❌ Bad
function createUser(data: any) {
  // ...
}

// ✅ Good
interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

function createUser(data: CreateUserDTO): Promise<IUser> {
  // ...
}
```

### Error Handling

Sử dụng custom error classes:

```typescript
import { NotFoundError, BadRequestError } from '@/utils/error.util.js';

if (!user) {
  throw new NotFoundError('User not found');
}
```

### Async/Await

Luôn wrap async controllers:

```typescript
import { asyncHandler } from '@/utils/async-handler.util.js';

export const controller = {
  method: asyncHandler(async (req, res) => {
    // ...
  }),
};
```

### Logging

Sử dụng logger thay vì console:

```typescript
import logger from '@/configs/logger.config.js';

logger.info('User created', { userId });
logger.error('Failed to create user', error);
```

### Validation

Sử dụng Zod schemas:

```typescript
import { z } from 'zod';

export const validator = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});
```

## Project Structure

Tuân theo layered architecture:

```
routes → controllers → services → models
```

- **Routes**: Define endpoints và middlewares
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic
- **Models**: Database schemas

Xem chi tiết trong `HUONG_DAN_CAU_TRUC_DU_AN.md`

## Documentation

### Code Comments

Chỉ comment khi logic phức tạp:

```typescript
// ❌ Bad
// Get user by ID
const user = await User.findById(id);

// ✅ Good
// Calculate score with weighted average based on question difficulty
const score = questions.reduce((total, q) => {
  return total + (q.points * q.difficultyMultiplier);
}, 0);
```

### Swagger

Update Swagger documentation cho API mới:

```typescript
/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDTO'
 *     responses:
 *       201:
 *         description: User created successfully
 */
```

## Testing Guidelines

### Unit Tests

Test services và utilities:

```typescript
describe('UserService', () => {
  describe('create', () => {
    it('should create user with hashed password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const user = await userService.create(userData);

      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password);
    });
  });
});
```

### Integration Tests

Test API endpoints:

```typescript
describe('POST /api/v1/auth/register', () => {
  it('should register new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
  });
});
```

## Pull Request Checklist

Trước khi tạo PR, đảm bảo:

- [ ] Code passes linting (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] All tests pass (`npm test`)
- [ ] New features have tests
- [ ] Documentation updated
- [ ] Swagger updated (if API changed)
- [ ] Commit messages follow conventional commits
- [ ] Branch is up to date with main

## Review Process

1. Team sẽ review PR của bạn
2. Có thể có yêu cầu thay đổi
3. Update PR theo feedback
4. Khi được approve, PR sẽ được merge

## Questions?

Nếu có câu hỏi:
- Mở issue trên GitHub
- Liên hệ team (nguyenhaiquan.data@gmail.com)
- Đọc documentation trong `HUONG_DAN_CAU_TRUC_DU_AN.md`

---

Cảm ơn bạn đã đóng góp! 🎉
