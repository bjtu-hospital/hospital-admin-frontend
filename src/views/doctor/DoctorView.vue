<template>
  <div class="space-y-4">
    <!-- 顶部操作栏 -->
    <div class="bg-card rounded-lg border border-border p-4 shadow-sm">
      <div class="flex items-center gap-4">
        <!-- 左侧：搜索栏 -->
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            v-model="searchKeyword"
            @input="handleSearch"
            type="text"
            placeholder="搜索医生姓名、职称、专长..."
            class="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        <!-- 右侧：新增医生按钮 -->
        <button
          @click="showAddDoctorDialog = true"
          class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium shadow-sm whitespace-nowrap"
        >
          <Plus class="w-4 h-4" />
          新增医生
        </button>
      </div>
    </div>

    <!-- 科室筛选导航栏 -->
    <div class="bg-card rounded-lg border border-border p-4 shadow-sm">
      <div class="space-y-3">
        <!-- 大科室筛选 -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2">
          <span class="text-sm font-medium text-muted-foreground whitespace-nowrap">大科室：</span>
          <button
            @click="selectMajorDept(null)"
            :class="[
              'px-4 py-2 rounded-md font-medium whitespace-nowrap transition-all duration-200',
              selectedMajorId === null
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-accent/50 text-foreground/70 hover:bg-accent hover:text-foreground'
            ]"
          >
            <div class="flex items-center gap-2">
              <LayoutGrid class="w-4 h-4" />
              查看全部
            </div>
          </button>
          <div class="w-px h-6 bg-border"></div>
          <button
            v-for="major in majorDepartments"
            :key="major.major_dept_id"
            @click="selectMajorDept(major.major_dept_id)"
            :class="[
              'px-4 py-2 rounded-md font-medium whitespace-nowrap transition-all duration-200',
              selectedMajorId === major.major_dept_id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-accent/50 text-foreground/70 hover:bg-accent hover:text-foreground'
            ]"
          >
            {{ major.name }}
          </button>
        </div>

        <!-- 小科室筛选（当选择了大科室时显示） -->
        <div v-if="selectedMajorId !== null" class="flex items-center gap-2 overflow-x-auto pb-2">
          <span class="text-sm font-medium text-muted-foreground whitespace-nowrap">详细科室：</span>
          <button
            @click="selectedMinorId = null"
            :class="[
              'px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200',
              selectedMinorId === null
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-accent/50 text-foreground/70 hover:bg-accent hover:text-foreground'
            ]"
          >
            全部
          </button>
          <button
            v-for="minor in filteredMinorDepartments"
            :key="minor.minor_dept_id"
            @click="selectedMinorId = minor.minor_dept_id"
            :class="[
              'px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200',
              selectedMinorId === minor.minor_dept_id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-accent/50 text-foreground/70 hover:bg-accent hover:text-foreground'
            ]"
          >
            {{ minor.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- 医生列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="doctor in paginatedDoctors"
        :key="doctor.doctor_id"
        @click="viewDoctorDetail(doctor)"
        class="bg-card rounded-lg border border-border p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer group"
      >
        <div class="flex items-start gap-4 mb-3">
          <!-- 医生照片 -->
          <div class="flex-shrink-0">
            <div v-if="getDoctorPhotoUrl(doctor)" class="w-16 h-16 rounded-full overflow-hidden bg-accent">
              <img 
                :src="getDoctorPhotoUrl(doctor)" 
                :alt="doctor.name" 
                class="w-full h-full object-cover"
                @error="handlePhotoError($event, doctor)"
              />
            </div>
            <div v-else class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle class="w-10 h-10 text-primary" />
            </div>
          </div>

          <!-- 医生信息 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-semibold text-foreground group-hover:text-primary transition-colors">
                {{ doctor.name }}
              </h3>
              <ChevronRight class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </div>
            <p class="text-sm text-primary font-medium mb-1">{{ doctor.title }}</p>
            <p class="text-xs text-muted-foreground mb-2">
              {{ getMinorDeptName(doctor.dept_id) }}
            </p>
            <p class="text-xs text-foreground/70 line-clamp-1">
              专长：{{ doctor.specialty || '暂无' }}
            </p>
          </div>
        </div>

        <!-- 账号状态标签 -->
        <div class="flex items-center gap-2">
          <span
            :class="[
              'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
              doctor.is_registered
                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
            ]"
          >
            <div class="w-1.5 h-1.5 rounded-full" :class="doctor.is_registered ? 'bg-green-500' : 'bg-orange-500'"></div>
            {{ doctor.is_registered ? '已注册账号' : '未注册账号' }}
          </span>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="doctors.length === 0"
        class="col-span-full flex flex-col items-center justify-center py-16 text-center"
      >
        <Stethoscope class="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 class="text-lg font-semibold text-foreground mb-2">暂无医生数据</h3>
        <p class="text-sm text-muted-foreground mb-6">
          {{ searchKeyword ? '未找到匹配的医生' : '点击上方按钮添加新的医生' }}
        </p>
      </div>
    </div>

    <!-- 分页器和每页显示数量控制 -->
    <div class="bg-card rounded-lg border border-border p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <!-- 左侧：统计信息 -->
        <div class="text-sm text-muted-foreground">
          共 <span class="font-semibold text-foreground">{{ totalDoctors }}</span> 位医生
          <template v-if="pageSize !== 'all'">
            ，第 <span class="font-semibold text-foreground">{{ currentPage }}</span> / 
            <span class="font-semibold text-foreground">{{ totalPages }}</span> 页
          </template>
        </div>

        <!-- 中间：分页按钮 -->
        <div v-if="totalPages > 1 && pageSize !== 'all'" class="flex items-center gap-2">
          <button
            @click="currentPage = 1"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 rounded-md border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            首页
          </button>
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 rounded-md border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            上一页
          </button>
          <div class="flex items-center gap-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="currentPage = page"
              :class="[
                'px-3 py-1.5 rounded-md font-medium transition-all text-sm',
                currentPage === page
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border text-foreground hover:bg-accent'
              ]"
            >
              {{ page }}
            </button>
          </div>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 rounded-md border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            下一页
          </button>
          <button
            @click="currentPage = totalPages"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 rounded-md border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            末页
          </button>
        </div>
        <div v-else></div>

        <!-- 右侧：每页显示数量选择器 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground whitespace-nowrap">每页显示</span>
          <select
            v-model="pageSize"
            @change="changePageSize(pageSize)"
            class="px-3 py-1.5 bg-background border border-input rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
          >
            <option v-for="size in pageSizeOptions" :key="size" :value="size">
              {{ size === 'all' ? '全部' : size }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 医生详情对话框 -->
    <Teleport to="body">
      <div
        v-if="showDetailDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-card rounded-lg border border-border shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4">
          <!-- 标题栏 -->
          <div class="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-primary/10 rounded-lg">
                <Stethoscope class="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-foreground">医生详情</h3>
                <p class="text-sm text-muted-foreground">
                  {{ getMinorDeptName(selectedDoctor?.dept_id) }}
                </p>
              </div>
            </div>
            <button
              @click="closeDetailDialog"
              class="p-2 hover:bg-accent rounded-md transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- 内容区 -->
          <div class="p-6 space-y-6">
            <!-- 医生照片区域 -->
            <div class="flex items-center gap-4 p-4 bg-accent/30 rounded-lg">
              <div class="flex-shrink-0">
                <div v-if="getDoctorPhotoUrl(selectedDoctor)" class="relative group">
                  <img
                    :src="getDoctorPhotoUrl(selectedDoctor)"
                    :alt="selectedDoctor.name"
                    class="w-24 h-24 rounded-full object-cover"
                    @error="handlePhotoError($event, selectedDoctor)"
                  />
                  <div v-if="!isEditing" class="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      @click="triggerPhotoUpload"
                      class="p-2 bg-primary rounded-full hover:bg-primary/90 transition-colors"
                      title="更换照片"
                    >
                      <Upload class="w-4 h-4 text-white" />
                    </button>
                    <button
                      @click="confirmDeletePhoto"
                      class="p-2 bg-destructive rounded-full hover:bg-destructive/90 transition-colors"
                      title="删除照片"
                    >
                      <Trash2 class="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <div v-else class="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center relative group">
                  <UserCircle class="w-16 h-16 text-primary" />
                  <div v-if="!isEditing" class="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      @click="triggerPhotoUpload"
                      class="p-2 bg-primary rounded-full hover:bg-primary/90 transition-colors"
                      title="上传照片"
                    >
                      <Upload class="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <input
                  ref="photoInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handlePhotoUpload"
                />
              </div>
              <div class="flex-1">
                <p class="text-sm text-muted-foreground mb-1">医生照片</p>
                <p class="text-xs text-muted-foreground">
                  {{ selectedDoctor?.original_photo_url ? '点击照片可更换或删除' : '点击图标上传照片' }}
                </p>
              </div>
            </div>

            <!-- 编辑模式 -->
            <div v-if="isEditing" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">所属科室 *</label>
                <select
                  v-model="editForm.dept_id"
                  class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option v-for="minor in minorDepartments" :key="minor.minor_dept_id" :value="minor.minor_dept_id">
                    {{ minor.name }} - {{ getMajorDeptName(minor.major_dept_id) }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">姓名 *</label>
                <input
                  v-model="editForm.name"
                  type="text"
                  class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="请输入医生姓名"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">职称 *</label>
                <input
                  v-model="editForm.title"
                  type="text"
                  class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="例如：主治医师、副主任医师"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">专长</label>
                <input
                  v-model="editForm.specialty"
                  type="text"
                  class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="例如：心血管疾病、高血压"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">个人简介</label>
                <textarea
                  v-model="editForm.introduction"
                  rows="4"
                  class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="请输入医生简介"
                ></textarea>
              </div>
            </div>

            <!-- 查看模式 -->
            <div v-else class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-accent/30 rounded-lg">
                  <p class="text-xs text-muted-foreground mb-1">医生ID</p>
                  <p class="text-lg font-semibold text-foreground">{{ selectedDoctor?.doctor_id }}</p>
                </div>
                <div class="p-4 bg-accent/30 rounded-lg">
                  <p class="text-xs text-muted-foreground mb-1">用户ID</p>
                  <p class="text-lg font-semibold text-foreground">{{ selectedDoctor?.user_id || '未绑定' }}</p>
                </div>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-2">姓名</p>
                <p class="text-lg font-semibold text-foreground">{{ selectedDoctor?.name }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-2">职称</p>
                <p class="text-lg font-semibold text-primary">{{ selectedDoctor?.title }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-2">所属科室</p>
                <p class="text-foreground">{{ getMinorDeptName(selectedDoctor?.dept_id) }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-2">专长</p>
                <p class="text-foreground">{{ selectedDoctor?.specialty || '暂无' }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-2">个人简介</p>
                <p class="text-foreground leading-relaxed whitespace-pre-wrap">
                  {{ selectedDoctor?.introduction || '暂无简介' }}
                </p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-2">账号状态</p>
                <span
                  :class="[
                    'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium',
                    selectedDoctor?.is_registered
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  ]"
                >
                  <div class="w-2 h-2 rounded-full" :class="selectedDoctor?.is_registered ? 'bg-green-500' : 'bg-orange-500'"></div>
                  {{ selectedDoctor?.is_registered ? '已注册账号' : '未注册账号' }}
                </span>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-2">创建时间</p>
                <p class="text-foreground">{{ formatDateTime(selectedDoctor?.create_time) }}</p>
              </div>
            </div>
          </div>

          <!-- 底部操作按钮 -->
          <div class="sticky bottom-0 bg-card border-t border-border p-6 shadow-sm z-10">
            <div v-if="!isEditing" class="flex flex-wrap items-center gap-3">
              <button
                @click="confirmDelete"
                class="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors font-medium"
              >
                <Trash2 class="w-4 h-4" />
                删除医生
              </button>
              <button
                @click="showTransferDialog = true"
                class="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-500/20 transition-colors font-medium"
              >
                <ArrowRightLeft class="w-4 h-4" />
                调整科室
              </button>
              <button
                v-if="selectedDoctor?.is_registered"
                @click="showAccountDialog = true"
                class="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-md hover:bg-purple-500/20 transition-colors font-medium"
              >
                <Key class="w-4 h-4" />
                修改账号密码
              </button>
              <button
                v-else
                @click="showAccountDialog = true"
                class="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md hover:bg-green-500/20 transition-colors font-medium"
              >
                <UserPlus class="w-4 h-4" />
                注册账号
              </button>
              <div class="flex-1"></div>
              <button
                @click="startEdit"
                class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                <Pencil class="w-4 h-4" />
                编辑信息
              </button>
            </div>
            <div v-else class="flex justify-end gap-3">
              <button
                @click="cancelEdit"
                class="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors font-medium"
              >
                取消
              </button>
              <button
                @click="saveEdit"
                :disabled="!editForm.name || !editForm.title || !editForm.dept_id"
                class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save class="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 新增医生对话框 -->
    <Teleport to="body">
      <div
        v-if="showAddDoctorDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-card rounded-lg border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
          <div class="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10 bg-muted/30">
            <h3 class="text-xl font-semibold text-foreground">新增医生</h3>
            <button
              @click="closeAddDoctorDialog"
              class="p-2 hover:bg-accent rounded-md transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- 基本信息 -->
            <div class="space-y-4">
              <h4 class="font-semibold text-foreground flex items-center gap-2">
                <User class="w-4 h-4" />
                基本信息
              </h4>
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">所属科室 *</label>
                <select
                  v-model="addForm.dept_id"
                  class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option :value="null" disabled>请选择科室</option>
                  <option v-for="minor in minorDepartments" :key="minor.minor_dept_id" :value="minor.minor_dept_id">
                    {{ minor.name }} - {{ getMajorDeptName(minor.major_dept_id) }}
                  </option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">姓名 *</label>
                  <input
                    v-model="addForm.name"
                    type="text"
                    class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="请输入医生姓名"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">职称 *</label>
                  <input
                    v-model="addForm.title"
                    type="text"
                    class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="例如：主治医师"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">专长</label>
                <input
                  v-model="addForm.specialty"
                  type="text"
                  class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="例如：心血管疾病、高血压"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">个人简介</label>
                <textarea
                  v-model="addForm.introduction"
                  rows="3"
                  class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="请输入医生简介"
                ></textarea>
              </div>
            </div>

            <!-- 账号信息（可选） -->
            <div class="space-y-4 pt-4 border-t border-border">
              <div class="flex items-center justify-between">
                <h4 class="font-semibold text-foreground flex items-center gap-2">
                  <Key class="w-4 h-4" />
                  账号信息（可选）
                </h4>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="createAccount"
                    type="checkbox"
                    class="w-4 h-4 rounded border-input text-primary focus:ring-0 focus:outline-none accent-primary cursor-pointer"
                  />
                  <span class="text-sm text-foreground">同时创建登录账号</span>
                </label>
              </div>
              <div v-if="createAccount" class="space-y-4 pl-6 border-l-2 border-primary/20">
                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">工号（登录用户名）*</label>
                  <input
                    v-model="addForm.identifier"
                    type="text"
                    class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="请输入工号"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">密码 *</label>
                  <input
                    v-model="addForm.password"
                    type="password"
                    class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="请输入密码"
                  />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">邮箱</label>
                    <input
                      v-model="addForm.email"
                      type="email"
                      class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="example@hospital.com"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">手机号</label>
                    <input
                      v-model="addForm.phonenumber"
                      type="tel"
                      class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="13800000000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="sticky bottom-0 bg-card border-t border-border p-6 flex justify-end gap-3 bg-muted/20">
            <button
              @click="closeAddDoctorDialog"
              class="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors font-medium shadow-sm"
            >
              取消
            </button>
            <button
              @click="handleAddDoctor"
              :disabled="!isAddFormValid"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              确认添加
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 删除确认对话框 -->
    <Teleport to="body">
      <div
        v-if="showDeleteDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-card rounded-lg border border-border shadow-2xl max-w-md w-full m-4">
          <div class="p-6 border-b border-border bg-muted/30">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-destructive/10 rounded-lg">
                <AlertCircle class="w-6 h-6 text-destructive" />
              </div>
              <h3 class="text-xl font-semibold text-foreground">确认删除</h3>
            </div>
          </div>

          <div class="p-6">
            <p class="text-foreground">
              确定要删除医生 <span class="font-semibold text-primary">{{ selectedDoctor?.name }}</span> 吗？
            </p>
            <p class="text-sm text-destructive/80 mt-2">
              此操作将会删除医生信息，如果该医生有关联的用户账号，账号也将被停用并标记为已删除。
            </p>
            <p class="text-sm text-muted-foreground mt-2">此操作无法撤销，请谨慎操作。</p>
          </div>

          <div class="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
            <button
              @click="showDeleteDialog = false"
              class="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors font-medium shadow-sm"
            >
              取消
            </button>
            <button
              @click="handleDelete"
              class="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors font-medium shadow-sm"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 调整科室对话框 -->
    <Teleport to="body">
      <div
        v-if="showTransferDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-card rounded-lg border border-border shadow-2xl max-w-md w-full m-4">
          <div class="p-6 border-b border-border flex items-center justify-between bg-muted/30">
            <h3 class="text-xl font-semibold text-foreground">调整科室</h3>
            <button
              @click="showTransferDialog = false"
              class="p-2 hover:bg-accent rounded-md transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <p class="text-sm text-muted-foreground mb-2">当前科室</p>
              <p class="text-lg font-semibold text-foreground">
                {{ getMinorDeptName(selectedDoctor?.dept_id) }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">目标科室 *</label>
              <select
                v-model="transferForm.new_dept_id"
                class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option :value="null" disabled>请选择目标科室</option>
                <option
                  v-for="minor in minorDepartments"
                  :key="minor.minor_dept_id"
                  :value="minor.minor_dept_id"
                  :disabled="minor.minor_dept_id === selectedDoctor?.dept_id"
                >
                  {{ minor.name }} - {{ getMajorDeptName(minor.major_dept_id) }}
                </option>
              </select>
            </div>
          </div>

          <div class="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
            <button
              @click="showTransferDialog = false"
              class="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors font-medium shadow-sm"
            >
              取消
            </button>
            <button
              @click="handleTransfer"
              :disabled="!transferForm.new_dept_id || transferForm.new_dept_id === selectedDoctor?.dept_id"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              确认调整
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 账号管理对话框 -->
    <Teleport to="body">
      <div
        v-if="showAccountDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-card rounded-lg border border-border shadow-2xl max-w-md w-full m-4">
          <div class="p-6 border-b border-border flex items-center justify-between bg-muted/30">
            <h3 class="text-xl font-semibold text-foreground">
              {{ selectedDoctor?.is_registered ? '修改账号密码' : '注册账号' }}
            </h3>
            <button
              @click="showAccountDialog = false"
              class="p-2 hover:bg-accent rounded-md transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">工号（登录用户名）*</label>
              <input
                v-model="accountForm.identifier"
                type="text"
                class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="请输入工号"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">密码 *</label>
              <input
                v-model="accountForm.password"
                type="password"
                class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="请输入密码"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">邮箱</label>
              <input
                v-model="accountForm.email"
                type="email"
                class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="example@hospital.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">手机号</label>
              <input
                v-model="accountForm.phonenumber"
                type="tel"
                class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="13800000000"
              />
            </div>
          </div>

          <div class="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
            <button
              @click="showAccountDialog = false"
              class="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors font-medium shadow-sm"
            >
              取消
            </button>
            <button
              @click="handleAccountOperation"
              :disabled="!accountForm.identifier || !accountForm.password"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  Plus,
  Search,
  ChevronRight,
  X,
  Pencil,
  Trash2,
  Save,
  LayoutGrid,
  AlertCircle,
  Stethoscope,
  UserCircle,
  Upload,
  User,
  Key,
  UserPlus,
  ArrowRightLeft
} from 'lucide-vue-next'
import * as doctorApi from '@/api/doctor'
import * as departmentApi from '@/api/department'
import { useToast } from '@/utils/toast'

const toast = useToast()

// 提取错误信息的辅助函数
const getErrorMessage = (error, defaultMsg = '操作失败') => {
  // 如果有响应数据
  if (error.response?.data) {
    const data = error.response.data
    // 检查是否有 message.msg 字符串
    console.log(data.message?.msg)
    if (data.message?.msg) {

      return data.message.msg
    }
    // 检查是否有 message 字符串
    if (typeof data.message === 'string') {
      return data.message
    }
  }
  return defaultMsg
}

onMounted(() => {
  loadData()
})

// 获取医生照片URL - 优先使用API接口
const getDoctorPhotoUrl = (doctor) => {
  if (!doctor) return null
  
  // 如果已标记照片加载失败，返回 null 显示默认头像
  if (doctor._photoError) return null
  
  // 如果已经有缓存的 blob URL，直接返回
  if (doctor._photoBlobUrl) return doctor._photoBlobUrl
  
  // 如果有 doctor_id，通过 axios 获取图片（会自动添加 token）
  if (doctor.doctor_id && !doctor._photoLoading) {
    doctor._photoLoading = true
    fetchDoctorPhoto(doctor)
    // 暂时返回 null，显示默认头像，等待图片加载完成
    return null
  }
  
  // 否则使用备用的绝对URL（外部URL不需要token）
  return doctor.original_photo_url || null
}

// 通过 axios 获取医生照片并转换为 blob URL
const fetchDoctorPhoto = async (doctor) => {
  try {
    const response = await doctorApi.getDoctorPhoto(doctor.doctor_id)
    
    // 创建 blob URL
    const blob = new Blob([response.data], { type: response.headers['content-type'] || 'image/jpeg' })
    const blobUrl = URL.createObjectURL(blob)
    
    // 缓存 blob URL
    doctor._photoBlobUrl = blobUrl
    doctor._photoLoading = false
    
    // 更新列表中的医生
    const index = doctors.value.findIndex(d => d.doctor_id === doctor.doctor_id)
    if (index !== -1) {
      doctors.value[index]._photoBlobUrl = blobUrl
      doctors.value[index]._photoLoading = false
    }
    
    // 如果是当前选中的医生，触发更新
    if (selectedDoctor.value?.doctor_id === doctor.doctor_id) {
      selectedDoctor.value = { ...selectedDoctor.value, _photoBlobUrl: blobUrl, _photoLoading: false }
    }
  } catch (error) {
    console.error('获取医生照片失败:', error)
    doctor._photoLoading = false
    
    // 如果有备用URL，标记使用备用
    if (doctor.original_photo_url) {
      // 不标记错误，让它尝试使用备用URL
      doctor._photoBlobUrl = doctor.original_photo_url
      
      const index = doctors.value.findIndex(d => d.doctor_id === doctor.doctor_id)
      if (index !== -1) {
        doctors.value[index]._photoBlobUrl = doctor.original_photo_url
      }
      
      if (selectedDoctor.value?.doctor_id === doctor.doctor_id) {
        selectedDoctor.value = { ...selectedDoctor.value, _photoBlobUrl: doctor.original_photo_url }
      }
    } else {
      // 没有备用URL，标记加载失败
      doctor._photoError = true
      
      const index = doctors.value.findIndex(d => d.doctor_id === doctor.doctor_id)
      if (index !== -1) {
        doctors.value[index]._photoError = true
      }
      
      if (selectedDoctor.value?.doctor_id === doctor.doctor_id) {
        selectedDoctor.value = { ...selectedDoctor.value, _photoError: true }
      }
    }
  }
}

// 处理照片加载错误 - 切换到备用URL或显示默认头像
const handlePhotoError = (event, doctor) => {
  const img = event.target
  
  // 如果当前使用的是blob URL或API URL，尝试切换到备用URL
  if (doctor.original_photo_url && img.src !== doctor.original_photo_url) {
    img.src = doctor.original_photo_url
  } else {
    // 如果备用URL也失败或没有备用URL，标记为失败并显示默认头像
    doctor._photoError = true
    // 触发重新渲染
    if (selectedDoctor.value?.doctor_id === doctor.doctor_id) {
      selectedDoctor.value = { ...selectedDoctor.value, _photoError: true }
    }
  }
}

// 清除医生照片缓存，触发重新加载
const refreshDoctorPhoto = (doctorId) => {
  // 查找医生列表中的医生
  const index = doctors.value.findIndex(d => d.doctor_id === doctorId)
  if (index !== -1) {
    const doctor = doctors.value[index]
    
    // 清理旧的 blob URL（避免内存泄漏）
    if (doctor._photoBlobUrl && doctor._photoBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(doctor._photoBlobUrl)
    }
    
    // 清除缓存标记
    delete doctor._photoBlobUrl
    delete doctor._photoLoading
    delete doctor._photoError
    
    // 强制更新列表
    doctors.value[index] = { ...doctor }
  }
  
  // 如果是当前选中的医生，也清除它的缓存
  if (selectedDoctor.value?.doctor_id === doctorId) {
    if (selectedDoctor.value._photoBlobUrl && selectedDoctor.value._photoBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(selectedDoctor.value._photoBlobUrl)
    }
    
    selectedDoctor.value = {
      ...selectedDoctor.value,
      _photoBlobUrl: undefined,
      _photoLoading: undefined,
      _photoError: undefined
    }
  }
}

// 数据状态
const doctors = ref([])
const totalDoctors = ref(0)
const majorDepartments = ref([])
const minorDepartments = ref([])
const selectedMajorId = ref(null)
const selectedMinorId = ref(null)
const searchKeyword = ref('')

// 分页状态
const currentPage = ref(1)
const pageSize = ref(12)
const pageSizeOptions = [9, 12, 15, 18, 21, 'all']

// 对话框状态
const showDetailDialog = ref(false)
const showAddDoctorDialog = ref(false)
const showDeleteDialog = ref(false)
const showTransferDialog = ref(false)
const showAccountDialog = ref(false)

// 编辑状态
const isEditing = ref(false)
const selectedDoctor = ref(null)
const editForm = ref({
  dept_id: null,
  name: '',
  title: '',
  specialty: '',
  introduction: ''
})

// 新增医生表单
const createAccount = ref(false)
const addForm = ref({
  dept_id: null,
  name: '',
  title: '',
  specialty: '',
  introduction: '',
  identifier: '',
  password: '',
  email: '',
  phonenumber: ''
})

// 调整科室表单
const transferForm = ref({
  new_dept_id: null
})

// 账号管理表单
const accountForm = ref({
  identifier: '',
  password: '',
  email: '',
  phonenumber: ''
})

// 照片上传
const photoInput = ref(null)

// 计算属性：过滤后的小科室列表（根据选中的大科室）
const filteredMinorDepartments = computed(() => {
  if (!minorDepartments.value || !Array.isArray(minorDepartments.value)) {
    return []
  }
  if (selectedMajorId.value === null) {
    return []
  }
  return minorDepartments.value.filter(dept => dept.major_dept_id === selectedMajorId.value)
})

// 计算总页数
const totalPages = computed(() => {
  if (pageSize.value === 'all') return 1
  return Math.ceil(totalDoctors.value / pageSize.value)
})

// 计算当前页显示的医生
const paginatedDoctors = computed(() => {
  return doctors.value
})

// 计算可见的页码
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages.filter(p => p !== '...')
})

// 新增表单验证
const isAddFormValid = computed(() => {
  const basicValid = addForm.value.dept_id && addForm.value.name && addForm.value.title
  if (!createAccount.value) {
    return basicValid
  }
  return basicValid && addForm.value.identifier && addForm.value.password
})

// 获取大科室名称
const getMajorDeptName = (majorId) => {
  const major = majorDepartments.value.find(m => m.major_dept_id === majorId)
  return major?.name || '未知科室'
}

// 获取小科室名称
const getMinorDeptName = (minorId) => {
  const minor = minorDepartments.value.find(m => m.minor_dept_id === minorId)
  return minor?.name || '未知科室'
}

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return '未知'
  const date = new Date(datetime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 选择大科室
const selectMajorDept = (majorId) => {
  selectedMajorId.value = majorId
  selectedMinorId.value = null
  currentPage.value = 1
}

// 修改每页显示数量
const changePageSize = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
}

// 查看医生详情
const viewDoctorDetail = (doctor) => {
  selectedDoctor.value = { ...doctor }
  showDetailDialog.value = true
  isEditing.value = false
}

// 关闭详情对话框
const closeDetailDialog = () => {
  showDetailDialog.value = false
  isEditing.value = false
  selectedDoctor.value = null
}

// 开始编辑
const startEdit = () => {
  editForm.value = {
    dept_id: selectedDoctor.value.dept_id,
    name: selectedDoctor.value.name,
    title: selectedDoctor.value.title,
    specialty: selectedDoctor.value.specialty || '',
    introduction: selectedDoctor.value.introduction || ''
  }
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  editForm.value = {
    dept_id: null,
    name: '',
    title: '',
    specialty: '',
    introduction: ''
  }
}

// 保存编辑
const saveEdit = () => {
  console.log('保存编辑:', editForm.value)
  doctorApi.updateDoctor(selectedDoctor.value.doctor_id, editForm.value)
    .then(response => {
      if (response.data.code !== 0) {
        toast.error(response.data.message?.detail || response.data.message || '更新失败')
        return
      }
      const index = doctors.value.findIndex(d => d.doctor_id === selectedDoctor.value.doctor_id)
      if (index !== -1) {
        doctors.value[index] = { ...doctors.value[index], ...editForm.value }
      }
      selectedDoctor.value = { ...selectedDoctor.value, ...editForm.value }
      isEditing.value = false
      toast.success('医生信息更新成功')
    })
    .catch(error => {
      console.error('更新医生信息失败:', error)
      toast.error(getErrorMessage(error, '更新失败，请重试'))
    })
}

// 确认删除
const confirmDelete = () => {
  showDeleteDialog.value = true
}

// 删除医生
const handleDelete = () => {
  console.log('删除医生:', selectedDoctor.value.doctor_id)
  doctorApi.deleteDoctor(selectedDoctor.value.doctor_id)
    .then(response => {
      if (response.data.code !== 0) {
        toast.error(response.data.message?.detail || response.data.message || '删除失败')
        return
      }
      loadDoctors()
      showDeleteDialog.value = false
      showDetailDialog.value = false
      toast.success('医生删除成功')
    })
    .catch(error => {
      console.error('删除医生失败:', error)
      toast.error(getErrorMessage(error, '删除失败，请重试'))
    })
}

// 新增医生
const handleAddDoctor = () => {
  console.log('新增医生:', addForm.value)
  const submitData = {
    dept_id: addForm.value.dept_id,
    name: addForm.value.name,
    title: addForm.value.title,
    specialty: addForm.value.specialty,
    introduction: addForm.value.introduction
  }

  if (createAccount.value) {
    submitData.identifier = addForm.value.identifier
    submitData.password = addForm.value.password
    // 只在有值的情况下添加 email 和 phonenumber
    if (addForm.value.email && addForm.value.email.trim()) {
      submitData.email = addForm.value.email.trim()
    }
    if (addForm.value.phonenumber && addForm.value.phonenumber.trim()) {
      submitData.phonenumber = addForm.value.phonenumber.trim()
    }
  }

  doctorApi.createDoctor(submitData)
    .then(response => {
      if (response.data.code !== 0) {
        toast.error(response.data.message?.detail || response.data.message || '创建失败')
        return
      }
      loadDoctors()
      closeAddDoctorDialog()
      toast.success(createAccount.value ? '医生信息和账号创建成功' : '医生信息创建成功')
    })
    .catch(error => {
      console.error('创建医生失败:', error)
      toast.error(getErrorMessage(error, '创建失败，请重试'))
    })
}

// 关闭新增医生对话框
const closeAddDoctorDialog = () => {
  showAddDoctorDialog.value = false
  createAccount.value = false
  addForm.value = {
    dept_id: null,
    name: '',
    title: '',
    specialty: '',
    introduction: '',
    identifier: '',
    password: '',
    email: '',
    phonenumber: ''
  }
}

// 调整科室
const handleTransfer = () => {
  console.log('调整科室:', transferForm.value.new_dept_id)
  doctorApi.transferDoctor(selectedDoctor.value.doctor_id, transferForm.value.new_dept_id)
    .then(response => {
      if (response.data.code !== 0) {
        toast.error(response.data.message?.detail || response.data.message || '调整失败')
        return
      }
      const index = doctors.value.findIndex(d => d.doctor_id === selectedDoctor.value.doctor_id)
      if (index !== -1) {
        doctors.value[index].dept_id = transferForm.value.new_dept_id
      }
      selectedDoctor.value.dept_id = transferForm.value.new_dept_id
      showTransferDialog.value = false
      transferForm.value.new_dept_id = null
      toast.success('科室调整成功')
    })
    .catch(error => {
      console.error('调整科室失败:', error)
      toast.error(getErrorMessage(error, '调整失败，请重试'))
    })
}

// 账号操作（创建或修改）- 使用统一的接口
const handleAccountOperation = () => {
  const isUpdate = selectedDoctor.value.is_registered
  const operationName = isUpdate ? '更新账号' : '创建账号'
  
  console.log(`${operationName}:`, accountForm.value)
  
  const submitData = {
    identifier: accountForm.value.identifier,
    password: accountForm.value.password
  }
  
  // 只在有值的情况下添加 email 和 phonenumber
  if (accountForm.value.email && accountForm.value.email.trim()) {
    submitData.email = accountForm.value.email.trim()
  }
  if (accountForm.value.phonenumber && accountForm.value.phonenumber.trim()) {
    submitData.phonenumber = accountForm.value.phonenumber.trim()
  }
  
  doctorApi.createDoctorAccount(selectedDoctor.value.doctor_id, submitData)
    .then(response => {
      if (response.data.code !== 0) {
        toast.error(response.data.message?.detail || response.data.message || `${operationName}失败`)
        return
      }
      
      // 更新医生信息
      selectedDoctor.value.is_registered = true
      if (response.data.message.user_id) {
        selectedDoctor.value.user_id = response.data.message.user_id
      }
      
      // 更新列表中的医生信息
      const index = doctors.value.findIndex(d => d.doctor_id === selectedDoctor.value.doctor_id)
      if (index !== -1) {
        doctors.value[index].is_registered = true
        if (response.data.message.user_id) {
          doctors.value[index].user_id = response.data.message.user_id
        }
      }
      
      showAccountDialog.value = false
      accountForm.value = {
        identifier: '',
        password: '',
        email: '',
        phonenumber: ''
      }
      toast.success(`${operationName}成功`)
    })
    .catch(error => {
      console.error(`${operationName}失败:`, error)
      toast.error(getErrorMessage(error, `${operationName}失败，请重试`))
    })
}

// 触发照片上传
const triggerPhotoUpload = () => {
  photoInput.value?.click()
}

// 处理照片上传
const handlePhotoUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('photo', file)

  console.log('上传照片:', file.name)
  doctorApi.uploadDoctorPhoto(selectedDoctor.value.doctor_id, formData)
    .then(response => {
      if (response.data.code !== 0) {
        toast.error(response.data.message?.detail || response.data.message || '上传失败')
        return
      }
      const photoUrl = response.data.message.photo_url
      
      // 更新 original_photo_url
      selectedDoctor.value.original_photo_url = photoUrl
      const index = doctors.value.findIndex(d => d.doctor_id === selectedDoctor.value.doctor_id)
      if (index !== -1) {
        doctors.value[index].original_photo_url = photoUrl
      }
      
      // 清除缓存并重新加载照片
      refreshDoctorPhoto(selectedDoctor.value.doctor_id)
      
      toast.success('照片上传成功')
    })
    .catch(error => {
      console.error('上传照片失败:', error)
      toast.error(getErrorMessage(error, '上传失败，请重试'))
    })
    .finally(() => {
      event.target.value = ''
    })
}

// 确认删除照片
const confirmDeletePhoto = () => {
  if (!confirm('确定要删除医生照片吗？')) return

  console.log('删除照片')
  doctorApi.deleteDoctorPhoto(selectedDoctor.value.doctor_id)
    .then(response => {
      if (response.data.code !== 0) {
        toast.error(response.data.message?.detail || response.data.message || '删除失败')
        return
      }
      
      // 清除 original_photo_url
      selectedDoctor.value.original_photo_url = null
      const index = doctors.value.findIndex(d => d.doctor_id === selectedDoctor.value.doctor_id)
      if (index !== -1) {
        doctors.value[index].original_photo_url = null
      }
      
      // 清除缓存并重新加载（会显示默认头像）
      refreshDoctorPhoto(selectedDoctor.value.doctor_id)
      
      toast.success('照片删除成功')
    })
    .catch(error => {
      console.error('删除照片失败:', error)
      toast.error(getErrorMessage(error, '删除失败，请重试'))
    })
}

// 监听筛选条件变化，重置页码
watch([selectedMajorId, selectedMinorId, searchKeyword], () => {
  if (currentPage.value === 1) {
    loadDoctors()
  } else {
    currentPage.value = 1
  }
})

// 监听分页变化
watch([currentPage, pageSize], () => {
  loadDoctors()
})

// 加载医生数据
const loadDoctors = () => {
  const params = {
    page: currentPage.value,
    page_size: pageSize.value === 'all' ? 10000 : pageSize.value,
    name: searchKeyword.value || undefined
  }
  
  if (selectedMinorId.value) {
    params.dept_id = selectedMinorId.value
  }

  doctorApi.getDoctors(params)
    .then(response => {
      if (response.data.code !== 0) {
        toast.error(response.data.message?.detail || response.data.message || '加载医生列表失败')
        return
      }
      
      const data = response.data.message
      doctors.value = data.doctors.map(doctor => ({
        ...doctor,
        is_registered: doctor.is_registered ?? false
      }))
      totalDoctors.value = data.total

      // Check if current page is out of bounds
      if (pageSize.value !== 'all') {
        const maxPage = Math.ceil(data.total / pageSize.value) || 1
        if (currentPage.value > maxPage) {
          currentPage.value = maxPage
        }
      }
    })
    .catch(error => {
      console.error('加载医生列表失败:', error)
      toast.error(getErrorMessage(error, '加载医生列表失败'))
    })
}

// 初始化数据
const loadData = () => {
  // 加载大科室
  departmentApi.getMajorDepartments()
    .then(response => {
      if (response.data.code !== 0) {
        toast.error(response.data.message?.detail || response.data.message || '加载大科室失败')
        return
      }
      majorDepartments.value = response.data.message.departments
    })
    .catch(error => {
      console.error('加载大科室失败:', error)
      toast.error(getErrorMessage(error, '加载大科室失败'))
    })

  // 加载小科室
  departmentApi.getMinorDepartment()
    .then(response => {
      if (response.data.code !== 0) {
        toast.error(response.data.message?.detail || response.data.message || '加载小科室失败')
        return
      }
      minorDepartments.value = response.data.message.departments
    })
    .catch(error => {
      console.error('加载小科室失败:', error)
      toast.error(getErrorMessage(error, '加载小科室失败'))
    })

  // 加载医生列表
  loadDoctors()
}
</script>

<style scoped>
/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.3);
}

/* 横向滚动条 */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.3);
}

/* 文本截断 */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
