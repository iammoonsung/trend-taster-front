# 배포 가이드

이 문서는 프론트엔드(Next.js)와 백엔드(Spring Boot)를 Supabase와 함께 배포하는 방법을 설명합니다.

---

## 🏗️ 아키텍처

### 로컬 개발 환경
```
프론트엔드 (localhost:3000)
  ├─ 백엔드 API: localhost:8080
  ├─ 데이터베이스: 로컬 PostgreSQL (localhost:5432)
  └─ 이미지 저장소: Supabase Storage
```

### 프로덕션 환경
```
프론트엔드 (Vercel/Netlify)
  ├─ 백엔드 API: Railway/Render/AWS
  ├─ 데이터베이스: Supabase PostgreSQL
  └─ 이미지 저장소: Supabase Storage
```

---

## 📦 1. 프론트엔드 배포 (Vercel 추천)

### Vercel 배포 설정

1. **Vercel 프로젝트 생성**
   ```bash
   cd /Users/moonsung/workspace/newProduct
   vercel
   ```

2. **환경 변수 설정**

   Vercel Dashboard → Settings → Environment Variables:

   ```bash
   # Production 환경 변수
   NEXT_PUBLIC_API_URL=https://your-backend-api.railway.app/api
   NEXT_PUBLIC_SUPABASE_URL=https://iwktgwpbmchkxpozshax.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3a3Rnd3BibWNoa3hwb3pzaGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NjMzODAsImV4cCI6MjA3OTAzOTM4MH0.q5p9o8Q7HmqYGi-6Yfq_nj92SMGAMFWUuZADBh9_rn0
   ```

3. **배포**
   ```bash
   vercel --prod
   ```

---

## 🚀 2. 백엔드 배포 (Railway 추천)

### 2.1 Supabase PostgreSQL 연결 정보 확인

1. Supabase Dashboard → Settings → Database
2. Connection String 복사:
   ```
   postgresql://postgres.iwktgwpbmchkxpozshax:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
   ```

### 2.2 Railway 배포

1. **Railway 프로젝트 생성**
   - https://railway.app 접속
   - "New Project" → "Deploy from GitHub repo"
   - `newProductBack` 레포지토리 선택

2. **환경 변수 설정**

   Railway Dashboard → Variables:

   ```bash
   # Database Configuration
   DB_URL=jdbc:postgresql://aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?user=postgres.iwktgwpbmchkxpozshax&password=YOUR_PASSWORD
   DB_USERNAME=postgres.iwktgwpbmchkxpozshax
   DB_PASSWORD=YOUR_SUPABASE_DB_PASSWORD

   # JWT Configuration
   JWT_SECRET=your-production-jwt-secret-min-256-bits
   JWT_EXPIRATION=86400000

   # Spring Profile
   SPRING_PROFILES_ACTIVE=production
   ```

3. **빌드 설정**

   Railway는 자동으로 Gradle을 감지하지만, 필요시 설정:
   ```
   Build Command: ./gradlew clean build -x test
   Start Command: java -jar build/libs/new-product-backend-0.0.1-SNAPSHOT.jar
   ```

---

## 🗄️ 3. Supabase 데이터베이스 마이그레이션

### 로컬 PostgreSQL → Supabase PostgreSQL

#### 방법 1: pg_dump 사용 (추천)

```bash
# 1. 로컬 DB 덤프 생성
pg_dump -U moonsung -d newproduct -f backup.sql

# 2. Supabase에 복원
psql "postgresql://postgres.iwktgwpbmchkxpozshax:YOUR_PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres" < backup.sql
```

#### 방법 2: Supabase SQL Editor 사용

1. Supabase Dashboard → SQL Editor
2. 로컬 DB 스키마 복사
3. Supabase에서 실행

---

## ✅ 4. 배포 체크리스트

### 프론트엔드 (Next.js)
- [ ] `.env.local` 파일이 로컬에만 있는지 확인 (Git에 커밋 X)
- [ ] Vercel 환경 변수 설정 완료
- [ ] `NEXT_PUBLIC_API_URL`이 프로덕션 백엔드 URL로 설정
- [ ] Supabase Storage 키 설정 완료
- [ ] 빌드 테스트: `npm run build`

### 백엔드 (Spring Boot)
- [ ] `application.yml`에 환경 변수 사용 확인
- [ ] Supabase PostgreSQL 연결 정보 설정
- [ ] JWT Secret 프로덕션용으로 변경
- [ ] CORS 설정에 프론트엔드 도메인 추가
- [ ] 빌드 테스트: `./gradlew clean build`

### Supabase
- [ ] Storage Bucket `product-images` 생성 완료
- [ ] Storage Policies 설정 완료 (읽기/쓰기)
- [ ] PostgreSQL 연결 정보 확인
- [ ] 데이터베이스 마이그레이션 완료

---

## 🔒 5. CORS 설정 (백엔드)

프로덕션 배포 시 CORS 설정이 필요합니다.

`SecurityConfig.java` 또는 별도 CORS 설정:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",  // 로컬
                    "https://your-frontend.vercel.app"  // 프로덕션
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

## 🧪 6. 배포 후 테스트

### 프론트엔드 테스트
1. 회원가입/로그인 테스트
2. 제품 제출 (이미지 업로드 포함)
3. 관리자 콘솔 접속
4. 이미지가 Supabase Storage에 저장되는지 확인

### 백엔드 테스트
```bash
# Health check
curl https://your-backend-api.railway.app/actuator/health

# API 테스트
curl https://your-backend-api.railway.app/api/products
```

---

## 📊 7. 모니터링

### Vercel (프론트엔드)
- Dashboard → Analytics
- Deployment Logs
- Real-time logs

### Railway (백엔드)
- Dashboard → Metrics
- Logs 탭
- Database 연결 상태

### Supabase
- Dashboard → Database → Connections
- Storage → Usage
- API → Logs

---

## 🚨 8. 트러블슈팅

### CORS 에러
**문제**: `Access-Control-Allow-Origin` 에러

**해결**:
1. 백엔드 CORS 설정에 프론트엔드 도메인 추가
2. Railway 환경 변수에 `ALLOWED_ORIGINS` 추가

### 이미지 업로드 실패
**문제**: 403 Forbidden

**해결**:
1. Supabase Storage Policy 확인
2. `.env`에 올바른 `SUPABASE_ANON_KEY` 설정
3. 브라우저 콘솔에서 네트워크 탭 확인

### 데이터베이스 연결 실패
**문제**: Connection timeout

**해결**:
1. Supabase DB 비밀번호 확인
2. Connection String 형식 확인
3. Railway에서 Supabase IP 화이트리스트 확인

---

## 📝 9. 환경 변수 요약

### 로컬 개발 (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SUPABASE_URL=https://iwktgwpbmchkxpozshax.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 프로덕션 (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
NEXT_PUBLIC_SUPABASE_URL=https://iwktgwpbmchkxpozshax.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 백엔드 프로덕션 (Railway)
```bash
DB_URL=jdbc:postgresql://aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?user=postgres.iwktgwpbmchkxpozshax&password=YOUR_PASSWORD
DB_USERNAME=postgres.iwktgwpbmchkxpozshax
DB_PASSWORD=YOUR_SUPABASE_DB_PASSWORD
JWT_SECRET=your-production-secret-min-256-bits
```

---

## 🎉 완료!

모든 설정이 완료되면 다음 URL에서 접속 가능합니다:

- **프론트엔드**: https://your-app.vercel.app
- **백엔드 API**: https://your-backend.railway.app/api
- **Swagger UI**: https://your-backend.railway.app/swagger-ui/index.html

---

## 💡 참고 자료

- [Vercel 배포 가이드](https://vercel.com/docs)
- [Railway 배포 가이드](https://docs.railway.app/)
- [Supabase 문서](https://supabase.com/docs)
- [Spring Boot 프로덕션 가이드](https://spring.io/guides/gs/spring-boot/)
