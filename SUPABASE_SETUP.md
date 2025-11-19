# Supabase Storage 설정 가이드

이 가이드는 이미지 업로드를 위한 Supabase Storage 설정 방법을 설명합니다.

## 1. Supabase 프로젝트 생성

1. https://supabase.com 접속 후 로그인
2. **"New Project"** 클릭
3. 프로젝트 정보 입력:
   - **Name**: `newproduct` (원하는 이름)
   - **Database Password**: 강력한 비밀번호 설정 (저장 필수!)
   - **Region**: `Northeast Asia (Seoul)` 선택
   - **Pricing Plan**: Free 선택
4. **"Create new project"** 클릭
5. ⏰ 프로젝트 생성 대기 (2-3분)

---

## 2. Storage Bucket 생성

프로젝트 생성 완료 후:

1. 왼쪽 사이드바에서 **📦 Storage** 클릭
2. **"Create a new bucket"** 버튼 클릭
3. Bucket 설정:
   ```
   Name: product-images
   Public bucket: ✅ ON (토글 활성화)
   File size limit: 10MB (선택사항)
   Allowed MIME types: image/jpeg, image/png, image/webp (선택사항)
   ```
4. **"Create bucket"** 클릭

---

## 3. Storage Policy 설정

`product-images` 버킷 클릭 후:

### Policy 1: Public Read Access

1. **"Policies"** 탭 클릭
2. **"New Policy"** 버튼 클릭
3. 다음 SQL 실행:

```sql
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
```

또는 UI에서:
- Template: **"Allow public read access"** 선택
- **"Review"** → **"Save policy"**

### Policy 2: Authenticated Upload

1. **"New Policy"** 다시 클릭
2. 다음 SQL 실행:

```sql
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');
```

또는 UI에서:
- Template: **"Allow authenticated uploads"** 선택
- **"Review"** → **"Save policy"**

---

## 4. API 키 확인

1. 왼쪽 사이드바 하단 **⚙️ Settings** 클릭
2. **API** 메뉴 클릭
3. 다음 정보 복사:

### Project URL
```
https://xxxxxxxxxxxxx.supabase.co
```

### anon public (공개 키 - 프론트엔드용)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

### service_role (비밀 키 - 백엔드용, 선택사항)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

---

## 5. 프론트엔드 환경 변수 설정

1. `/newProduct/.env.local` 파일 생성 (또는 `.env`)
2. 다음 내용 추가:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. `xxxxxxxxxxxxx`와 `eyJhbG...`를 실제 값으로 교체

---

## 6. 개발 서버 재시작

환경 변수 적용을 위해 서버 재시작:

```bash
cd /Users/moonsung/workspace/newProduct
npm run dev
```

---

## 7. 테스트

1. 브라우저에서 `http://localhost:3000/submit` 접속
2. 로그인 후 제품 이미지 업로드 테스트
3. 콘솔에서 압축 로그 확인:
   ```
   Original size: 5.23 MB
   Compressed size: 1.84 MB
   Reduction: 64.8%
   Image uploaded to: https://xxx.supabase.co/storage/v1/object/public/product-images/...
   ```

---

## 트러블슈팅

### 업로드 실패: "유효하지 않은 이미지 URL입니다"

**원인**: Supabase URL 패턴이 맞지 않음

**해결**:
1. 업로드된 URL 형식 확인
2. `UploadController.java`의 `SUPABASE_URL_PATTERN` 수정

### 업로드 실패: "403 Forbidden"

**원인**: Storage Policy 설정 오류

**해결**:
1. Supabase Dashboard → Storage → product-images → Policies 확인
2. "Authenticated Upload" Policy가 활성화되어 있는지 확인
3. 로그인 상태 확인

### 이미지가 표시되지 않음

**원인**: Public bucket이 아니거나 "Public Read Access" Policy 누락

**해결**:
1. Bucket 설정에서 "Public bucket" 활성화
2. "Public Read Access" Policy 추가

---

## 무료 Tier 제한

- **저장 공간**: 1GB
- **대역폭**: 2GB/월
- **파일 크기**: 최대 50MB (우리는 10MB로 제한)

압축 기능으로 대부분 2MB 이하로 저장되므로 **약 500개 이미지** 저장 가능.

---

## 보안 기능

### Level 2 보안 (현재 구현됨)

1. **프론트엔드**:
   - 파일 타입 검증 (JPG, PNG, WEBP만)
   - 파일 크기 검증 (10MB 이하)
   - 자동 압축 (2MB 목표)

2. **백엔드**:
   - 업로드 토큰 발급 (10분 만료)
   - URL 패턴 검증 (Supabase Storage만)
   - 사용자 권한 확인
   - 토큰 재사용 방지

3. **Supabase**:
   - 인증된 사용자만 업로드 가능
   - Public bucket (누구나 읽기 가능)

---

## 참고 자료

- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [Supabase RLS 정책](https://supabase.com/docs/guides/storage/security/access-control)
- [브라우저 이미지 압축 라이브러리](https://github.com/Donaldcwl/browser-image-compression)
