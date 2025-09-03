# Workflow Tasks Backend Requirements

## المشكلة الحالية
الـ Frontend جاهز لإدارة مهام الـ Workflows، لكن الـ Backend لا يحتوي على الـ API endpoints المطلوبة.

## الخطأ الحالي
```
"The route admin/service-workflows/7/tasks could not be found."
```

## الـ API Endpoints المطلوبة في الـ Backend

### 1. جلب مهام الـ Workflow
```
GET /api/v1/admin/service-workflows/{workflow_id}/tasks
```

**Parameters:**
- `q` (optional): Search query
- `task_type` (optional): Filter by task type
- `required` (optional): Filter by required status (true/false)
- `ordered` (optional): Order by sequence (1)
- `per_page` (optional): Items per page (default: 15)
- `page` (optional): Page number

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 18,
        "workflow_id": 7,
        "name": "Task 1",
        "description": null,
        "task_type": "editing",
        "estimated_duration_hours": 4,
        "order_sequence": 1,
        "is_required": true,
        "dependencies": null,
        "required_skills": null,
        "notes": null,
        "created_at": "2025-09-03T21:51:20.000000Z",
        "updated_at": "2025-09-03T21:51:20.000000Z"
      }
    ]
  },
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 1,
    "last_page": 1
  }
}
```

### 2. جلب مهمة واحدة
```
GET /api/v1/admin/service-workflows/{workflow_id}/tasks/{task_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 18,
    "workflow_id": 7,
    "name": "Task 1",
    "description": null,
    "task_type": "editing",
    "estimated_duration_hours": 4,
    "order_sequence": 1,
    "is_required": true,
    "dependencies": null,
    "required_skills": null,
    "notes": null,
    "created_at": "2025-09-03T21:51:20.000000Z",
    "updated_at": "2025-09-03T21:51:20.000000Z"
  }
}
```

### 3. إنشاء مهمة جديدة
```
POST /api/v1/admin/service-workflows/{workflow_id}/tasks
```

**Request Body:**
```json
{
  "name": "Task Name",
  "description": "Task Description",
  "task_type": "editing",
  "estimated_duration_hours": 4,
  "order_sequence": 1,
  "is_required": true,
  "dependencies": null,
  "required_skills": "Required Skills",
  "notes": "Additional Notes"
}
```

### 4. تحديث مهمة
```
PUT /api/v1/admin/service-workflows/{workflow_id}/tasks/{task_id}
```

**Request Body:** (same as create)

### 5. حذف مهمة
```
DELETE /api/v1/admin/service-workflows/{workflow_id}/tasks/{task_id}
```

### 6. تبديل حالة المهمة
```
PATCH /api/v1/admin/service-workflows/{workflow_id}/tasks/{task_id}/toggle-status
```

### 7. Lookup APIs

#### أنواع المهام
```
GET /api/v1/admin/service-workflows/{workflow_id}/tasks/lookup/types
```

**Response:**
```json
{
  "success": true,
  "data": {
    "options": [
      {
        "value": "script_writing",
        "label": "script_writing"
      },
      {
        "value": "filming",
        "label": "filming"
      },
      {
        "value": "editing",
        "label": "editing"
      },
      {
        "value": "design",
        "label": "design"
      },
      {
        "value": "voice_over",
        "label": "voice_over"
      },
      {
        "value": "animation",
        "label": "animation"
      },
      {
        "value": "sound_design",
        "label": "sound_design"
      },
      {
        "value": "review",
        "label": "review"
      }
    ]
  },
  "meta": {}
}
```

#### تبعيات المهام
```
GET /api/v1/admin/service-workflows/{workflow_id}/tasks/lookup/dependencies
```

**Response:**
```json
{
  "success": true,
  "data": {
    "options": [
      {
        "value": 18,
        "label": "Task 1"
      }
    ]
  },
  "meta": {}
}
```

## الجدول المطلوب في قاعدة البيانات

```sql
CREATE TABLE workflow_tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    workflow_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    task_type VARCHAR(50) NOT NULL,
    estimated_duration_hours INT NOT NULL,
    order_sequence INT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    dependencies BIGINT NULL,
    required_skills TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workflow_id) REFERENCES service_workflows(id) ON DELETE CASCADE,
    FOREIGN KEY (dependencies) REFERENCES workflow_tasks(id) ON DELETE SET NULL,
    
    INDEX idx_workflow_id (workflow_id),
    INDEX idx_task_type (task_type),
    INDEX idx_order_sequence (order_sequence)
);
```

## الحالة الحالية
- ✅ Frontend جاهز بالكامل
- ✅ جميع الصفحات والمكونات تم إنشاؤها
- ✅ API Client و React Query hooks جاهزة
- ❌ Backend API endpoints غير موجودة
- ❌ جدول قاعدة البيانات غير موجود

## الخطوات التالية
1. إنشاء جدول `workflow_tasks` في قاعدة البيانات
2. إنشاء Model `WorkflowTask` في Laravel
3. إنشاء Controller `WorkflowTaskController`
4. إضافة Routes في `api.php`
5. إضافة Validation Rules
6. اختبار الـ API endpoints

## ملاحظة
تم إخفاء زر "View Tasks" مؤقتاً من صفحة Workflows حتى يتم إنشاء الـ Backend APIs.
