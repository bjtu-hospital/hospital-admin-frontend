<template>
  <div class="space-y-4">
    <!-- 顶部操作栏 -->
    <div class="bg-card rounded-lg border border-border p-4">
      <div class="flex items-center gap-4">
        <!-- 左侧：搜索栏（占满空间） -->
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            v-model="searchKeyword"
            @input="handleSearch"
            type="text"
            placeholder="搜索科室名称..."
            class="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        <!-- 右侧：操作按钮 -->
        <div class="flex items-center gap-3">
          <button
            @click="showAddMajorDialog = true"
            class="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors font-medium whitespace-nowrap"
          >
            <Plus class="w-4 h-4" />
            新增大科室
          </button>
          <button
            @click="showAddMinorDialog = true"
            class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium shadow-sm whitespace-nowrap"
          >
            <Plus class="w-4 h-4" />
            新增详细科室
          </button>
        </div>
      </div>
    </div>

    <!-- 大科室导航栏 -->
    <div class="bg-card rounded-lg border border-border p-4">
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        <!-- 编辑大科室按钮 -->
        <button
          @click="showEditMajorDialog = true"
          class="px-4 py-2 rounded-md font-medium whitespace-nowrap transition-all duration-200 bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground flex items-center gap-2"
          title="编辑大科室"
        >
          <Pencil class="w-4 h-4" />
          编辑
        </button>
        <div class="w-px h-6 bg-border"></div>
        <button
          @click="selectedMajorId = null"
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
          @click="selectedMajorId = major.major_dept_id"
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
    </div>

    <!-- 科室列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="dept in paginatedDepartments"
        :key="dept.minor_dept_id"
        @click="viewDepartmentDetail(dept)"
        class="bg-card rounded-lg border border-border p-5 hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Building2 class="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 class="font-semibold text-foreground group-hover:text-primary transition-colors">
                {{ dept.name }}
              </h3>
              <p class="text-xs text-muted-foreground mt-0.5">
                {{ getMajorDeptName(dept.major_dept_id) }}
              </p>
            </div>
          </div>
          <ChevronRight class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <p class="text-sm text-foreground/70 line-clamp-2">
          {{ dept.description || '暂无描述' }}
        </p>
      </div>

      <!-- 空状态 -->
      <div
        v-if="filteredMinorDepartments.length === 0"
        class="col-span-full flex flex-col items-center justify-center py-16 text-center"
      >
        <Building2 class="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 class="text-lg font-semibold text-foreground mb-2">暂无科室数据</h3>
        <p class="text-sm text-muted-foreground mb-6">
          {{ searchKeyword ? '未找到匹配的科室' : '点击上方按钮添加新的科室' }}
        </p>
      </div>
    </div>

    <!-- 分页器和每页显示数量控制 -->
    <div class="bg-card rounded-lg border border-border p-4">
      <div class="flex items-center justify-between">
        <!-- 左侧：统计信息 -->
        <div class="text-sm text-muted-foreground">
          共 <span class="font-semibold text-foreground">{{ filteredMinorDepartments.length }}</span> 个科室
          <template v-if="pageSize !== 'all'">
            ，第 <span class="font-semibold text-foreground">{{ currentPage }}</span> / 
            <span class="font-semibold text-foreground">{{ totalPages }}</span> 页
          </template>
        </div>

        <!-- 中间：分页按钮 -->
        <div
          v-if="totalPages > 1 && pageSize !== 'all'"
          class="flex items-center gap-2"
        >
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

    <!-- 科室详情对话框 -->
    <Teleport to="body">
      <div
        v-if="showDetailDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
      <div class="bg-card rounded-lg border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div class="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <Building2 class="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 class="text-xl font-semibold text-foreground">科室详情</h3>
              <p class="text-sm text-muted-foreground">
                {{ getMajorDeptName(selectedDepartment?.major_dept_id) }}
              </p>
            </div>
          </div>
          <button
            @click="showDetailDialog = false"
            class="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 space-y-6">
          <!-- 编辑模式 -->
          <div v-if="isEditing" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">所属大科室</label>
              <select
                v-model="editForm.major_dept_id"
                class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option v-for="major in majorDepartments" :key="major.major_dept_id" :value="major.major_dept_id">
                  {{ major.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">科室名称</label>
              <input
                v-model="editForm.name"
                type="text"
                class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="请输入科室名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">科室描述</label>
              <textarea
                v-model="editForm.description"
                rows="4"
                class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="请输入科室描述"
              ></textarea>
            </div>
          </div>

          <!-- 查看模式 -->
          <div v-else class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-accent/30 rounded-lg">
                <p class="text-xs text-muted-foreground mb-1">科室ID</p>
                <p class="text-lg font-semibold text-foreground">{{ selectedDepartment?.minor_dept_id }}</p>
              </div>
              <div class="p-4 bg-accent/30 rounded-lg">
                <p class="text-xs text-muted-foreground mb-1">所属大科室</p>
                <p class="text-lg font-semibold text-foreground">
                  {{ getMajorDeptName(selectedDepartment?.major_dept_id) }}
                </p>
              </div>
            </div>
            <div>
              <p class="text-sm text-muted-foreground mb-2">科室名称</p>
              <p class="text-lg font-semibold text-foreground">{{ selectedDepartment?.name }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground mb-2">科室描述</p>
              <p class="text-foreground leading-relaxed">
                {{ selectedDepartment?.description || '暂无描述' }}
              </p>
            </div>
          </div>
        </div>

        <!-- 底部操作按钮 -->
        <div class="sticky bottom-0 bg-card border-t border-border p-6 flex items-center justify-between">
          <button
            v-if="!isEditing"
            @click="confirmDelete"
            class="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors font-medium"
          >
            <Trash2 class="w-4 h-4" />
            删除科室
          </button>
          <div v-else></div>
          
          <div class="flex gap-3">
            <button
              v-if="isEditing"
              @click="cancelEdit"
              class="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors font-medium"
            >
              取消
            </button>
            <button
              v-if="!isEditing"
              @click="startEdit"
              class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              <Pencil class="w-4 h-4" />
              编辑
            </button>
            <button
              v-else
              @click="saveEdit"
              class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              <Save class="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      </div>
      </div>
    </Teleport>

    <!-- 大科室对话框 -->
    <Teleport to="body">
      <div
      v-if="showAddMajorDialog"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-card rounded-lg border border-border shadow-2xl max-w-md w-full m-4">
        <div class="p-6 border-b border-border flex items-center justify-between">
          <h3 class="text-xl font-semibold text-foreground">新增大科室</h3>
          <button
            @click="showAddMajorDialog = false"
            class="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">科室名称 *</label>
            <input
              v-model="majorForm.name"
              type="text"
              class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="请输入大科室名称"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">科室描述</label>
            <textarea
              v-model="majorForm.description"
              rows="3"
              class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="请输入大科室描述"
            ></textarea>
          </div>
        </div>

        <div class="p-6 border-t border-border flex justify-end gap-3">
          <button
            @click="showAddMajorDialog = false"
            class="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors font-medium"
          >
            取消
          </button>
          <button
            @click="handleAddMajor"
            :disabled="!majorForm.name"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认添加
          </button>
        </div>
      </div>
      </div>
    </Teleport>

    <!-- 新增详细科室对话框 -->
    <Teleport to="body">
      <div
        v-if="showAddMinorDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-card rounded-lg border border-border shadow-2xl max-w-md w-full m-4">
        <div class="p-6 border-b border-border flex items-center justify-between">
          <h3 class="text-xl font-semibold text-foreground">新增详细科室</h3>
          <button
            @click="showAddMinorDialog = false"
            class="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">所属大科室 *</label>
            <select
              v-model="minorForm.major_dept_id"
              class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option :value="null" disabled>请选择大科室</option>
              <option v-for="major in majorDepartments" :key="major.major_dept_id" :value="major.major_dept_id">
                {{ major.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">科室名称 *</label>
            <input
              v-model="minorForm.name"
              type="text"
              class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="请输入科室名称"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">科室描述</label>
            <textarea
              v-model="minorForm.description"
              rows="3"
              class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="请输入科室描述"
            ></textarea>
          </div>
        </div>

        <div class="p-6 border-t border-border flex justify-end gap-3">
          <button
            @click="showAddMinorDialog = false"
            class="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors font-medium"
          >
            取消
          </button>
          <button
            @click="handleAddMinor"
            :disabled="!minorForm.name || !minorForm.major_dept_id"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div class="p-6 border-b border-border">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-destructive/10 rounded-lg">
              <AlertCircle class="w-6 h-6 text-destructive" />
            </div>
            <h3 class="text-xl font-semibold text-foreground">确认删除</h3>
          </div>
        </div>

        <div class="p-6">
          <p class="text-foreground">
            确定要删除科室 <span class="font-semibold text-primary">{{ selectedDepartment?.name }}</span> 吗？
          </p>
          <p class="text-sm text-muted-foreground mt-2">此操作无法撤销，请谨慎操作。</p>
        </div>

        <div class="p-6 border-t border-border flex justify-end gap-3">
          <button
            @click="showDeleteDialog = false"
            class="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors font-medium"
          >
            取消
          </button>
          <button
            @click="handleDelete"
            class="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors font-medium"
          >
            确认删除
          </button>
        </div>
      </div>
      </div>
    </Teleport>

    <!-- 编辑大科室对话框 -->
    <Teleport to="body">
      <div
        v-if="showEditMajorDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <!-- 标题栏 -->
          <div class="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 class="text-xl font-semibold text-foreground">管理大科室</h2>
            <button
              @click="showEditMajorDialog = false"
              class="p-1 hover:bg-accent rounded-md transition-colors"
            >
              <X class="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <!-- 内容区 -->
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <div class="space-y-3">
              <div
                v-for="major in majorDepartments"
                :key="major.major_dept_id"
                class="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <!-- 编辑模式 -->
                <div v-if="editingMajor?.major_dept_id === major.major_dept_id" class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-1">大科室名称</label>
                    <input
                      v-model="editMajorForm.name"
                      type="text"
                      class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="请输入大科室名称"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-1">描述</label>
                    <textarea
                      v-model="editMajorForm.description"
                      rows="3"
                      class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      placeholder="请输入描述（可选）"
                    ></textarea>
                  </div>
                  <div class="flex justify-end gap-2">
                    <button
                      @click="editingMajor = null"
                      class="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent transition-colors"
                    >
                      取消
                    </button>
                    <button
                      @click="handleUpdateMajor"
                      class="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      保存
                    </button>
                  </div>
                </div>

                <!-- 查看模式 -->
                <div v-else class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-foreground mb-1">{{ major.name }}</h3>
                    <p class="text-sm text-muted-foreground">{{ major.description || '暂无描述' }}</p>
                    <p class="text-xs text-muted-foreground mt-2">
                      ID: {{ major.major_dept_id }} · 
                      子科室: {{ minorDepartments.filter(d => d.major_dept_id === major.major_dept_id).length }}
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="openEditMajor(major)"
                      class="p-2 hover:bg-accent rounded-md transition-colors"
                      title="编辑"
                    >
                      <Pencil class="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      @click="openDeleteMajor(major)"
                      class="p-2 hover:bg-destructive/10 rounded-md transition-colors"
                      title="删除"
                    >
                      <Trash2 class="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部 -->
          <div class="px-6 py-4 border-t border-border">
            <button
              @click="showEditMajorDialog = false"
              class="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors font-medium"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 删除大科室确认对话框 -->
    <Teleport to="body">
      <div
        v-if="showDeleteMajorDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
          <div class="flex items-start gap-4">
            <div class="p-3 bg-destructive/10 rounded-full">
              <Trash2 class="w-6 h-6 text-destructive" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-foreground mb-2">
                {{ deleteMajorHasChildren ? '无法删除大科室' : '确认删除大科室' }}
              </h3>
              <p class="text-sm text-muted-foreground mb-4">
                <template v-if="deleteMajorHasChildren">
                  大科室 <span class="font-semibold text-foreground">{{ deleteMajorName }}</span> 下还有子科室，无法删除。请先删除所有子科室后再试。
                </template>
                <template v-else>
                  确定要删除大科室 <span class="font-semibold text-foreground">{{ deleteMajorName }}</span> 吗？此操作无法撤销。
                </template>
              </p>
              <div class="flex justify-end gap-3">
                <button
                  @click="showDeleteMajorDialog = false"
                  class="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors font-medium"
                >
                  {{ deleteMajorHasChildren ? '我知道了' : '取消' }}
                </button>
                <button
                  v-if="!deleteMajorHasChildren"
                  @click="handleDeleteMajor"
                  class="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors font-medium"
                >
                  确认删除
                </button>
              </div>
            </div>
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
  Building2,
  ChevronRight,
  X,
  Pencil,
  Trash2,
  Save,
  LayoutGrid,
  AlertCircle
} from 'lucide-vue-next'
import * as departmentApi from '@/api/department'
import { useMockData } from './mockdata'

onMounted(() => {
  loadData()
})
// 数据状态
const majorDepartments = ref([])
const minorDepartments = ref([])
const selectedMajorId = ref(null)
const searchKeyword = ref('')

// 分页状态
const currentPage = ref(1)
const pageSize = ref(12) // 每页显示数量
const pageSizeOptions = [9, 12, 15, 18, 21, 'all']

// 对话框状态
const showDetailDialog = ref(false)
const showAddMajorDialog = ref(false)
const showAddMinorDialog = ref(false)
const showDeleteDialog = ref(false)
const showEditMajorDialog = ref(false)
const showDeleteMajorDialog = ref(false)

// 编辑状态
const isEditing = ref(false)
const selectedDepartment = ref(null)
const editForm = ref({
  major_dept_id: null,
  name: '',
  description: ''
})

// 新增表单
const majorForm = ref({
  name: '',
  description: ''
})

const minorForm = ref({
  major_dept_id: null,
  name: '',
  description: ''
})

// 编辑大科室
const editingMajor = ref(null)
const editMajorForm = ref({ name: '', description: '' })

// 删除大科室
const deleteMajorId = ref(null)
const deleteMajorName = ref('')
const deleteMajorHasChildren = ref(false)

// 计算过滤后的科室列表
const filteredMinorDepartments = computed(() => {
  let result = minorDepartments.value

  // 按大科室筛选
  if (selectedMajorId.value !== null) {
    result = result.filter(dept => dept.major_dept_id === selectedMajorId.value)
  }

  // 按关键词搜索（前端搜索）
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(dept =>
      dept.name.toLowerCase().includes(keyword) ||
      dept.description?.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 计算总页数
const totalPages = computed(() => {
  if (pageSize.value === 'all') return 1
  return Math.ceil(filteredMinorDepartments.value.length / pageSize.value)
})

// 计算当前页显示的科室
const paginatedDepartments = computed(() => {
  if (!filteredMinorDepartments.value || filteredMinorDepartments.value.length === 0) {
    return []
  }
  if (pageSize.value === 'all') {
    return filteredMinorDepartments.value
  }
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredMinorDepartments.value.slice(start, end)
})

// 修改每页显示数量
const changePageSize = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// 计算可见的页码
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []
  
  if (total <= 7) {
    // 总页数小于等于7，显示全部
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 总页数大于7，显示部分
    if (current <= 4) {
      // 当前页靠前
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      // 当前页靠后
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 当前页在中间
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

// 获取大科室名称
const getMajorDeptName = (majorId) => {
  const major = majorDepartments.value.find(m => m.major_dept_id === majorId)
  return major?.name || '未知科室'
}

// 查看科室详情
const viewDepartmentDetail = (dept) => {
  selectedDepartment.value = { ...dept }
  showDetailDialog.value = true
  isEditing.value = false
}

// 开始编辑
const startEdit = () => {
  editForm.value = { ...selectedDepartment.value }
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  editForm.value = {
    major_dept_id: null,
    name: '',
    description: ''
  }
}

// 保存编辑
const saveEdit = () => {
  // TODO: 调用更新接口
  console.log('保存编辑:', editForm.value)
  // departmentApi.updateMinorDepartment(selectedDepartment.value.minor_dept_id, editForm.value)
  //   .then(() => {
  //     // 更新本地数据
  //     const index = minorDepartments.value.findIndex(d => d.minor_dept_id === selectedDepartment.value.minor_dept_id)
  //     if (index !== -1) {
  //       minorDepartments.value[index] = { ...editForm.value }
  //     }
  //     selectedDepartment.value = { ...editForm.value }
  //     isEditing.value = false
  //   })
}

// 确认删除
const confirmDelete = () => {
  showDeleteDialog.value = true
}

// 删除科室
const handleDelete = () => {
  console.log('删除科室:', selectedDepartment.value.minor_dept_id)
  departmentApi.deleteMinorDepartment(selectedDepartment.value.minor_dept_id)
    .then(() => {
      minorDepartments.value = minorDepartments.value.filter(
        d => d.minor_dept_id !== selectedDepartment.value.minor_dept_id
      )
      showDeleteDialog.value = false
      showDetailDialog.value = false
    })
}

// 新增大科室
const handleAddMajor = () => {
  console.log('新增大科室:', majorForm.value)
  departmentApi.createMajorDepartment(majorForm.value)
    .then(response => {
      majorDepartments.value.push(response.data.message)
      showAddMajorDialog.value = false
      majorForm.value = { name: '', description: '' }
    })
}

// 新增详细科室
const handleAddMinor = () => {
  console.log('新增详细科室:', minorForm.value)
  departmentApi.createMinorDepartment(minorForm.value)
    .then(response => {
      minorDepartments.value.push(response.data.message)
      showAddMinorDialog.value = false
      minorForm.value = { major_dept_id: null, name: '', description: '' }
    })
}

// 编辑大科室
const openEditMajor = (major) => {
  editingMajor.value = major
  editMajorForm.value = { name: major.name, description: major.description || '' }
}

const handleUpdateMajor = () => {
  if (!editMajorForm.value.name.trim()) {
    alert('请输入大科室名称')
    return
  }
  console.log('更新大科室:', editingMajor.value.major_dept_id, editMajorForm.value)
  departmentApi.updateMajorDepartment(editingMajor.value.major_dept_id, editMajorForm.value)
    .then(() => {
      const idx = majorDepartments.value.findIndex(m => m.major_dept_id === editingMajor.value.major_dept_id)
      if (idx !== -1) {
        majorDepartments.value[idx] = { 
          ...majorDepartments.value[idx], 
          ...editMajorForm.value 
        }
      }
      editingMajor.value = null
    })
}

// 删除大科室
const openDeleteMajor = (major) => {
  deleteMajorId.value = major.major_dept_id
  deleteMajorName.value = major.name
  // 检查是否有子科室
  const hasChildren = minorDepartments.value.some(d => d.major_dept_id === major.major_dept_id)
  deleteMajorHasChildren.value = hasChildren
  showDeleteMajorDialog.value = true
}

const handleDeleteMajor = () => {
  console.log('删除大科室:', deleteMajorId.value)
  departmentApi.deleteMajorDepartment(deleteMajorId.value)
    .then(() => {
      majorDepartments.value = majorDepartments.value.filter(
        m => m.major_dept_id !== deleteMajorId.value
      )
      showDeleteMajorDialog.value = false
    })
}

// 搜索处理
const handleSearch = () => {
  // 搜索时重置到第一页
  currentPage.value = 1
}

// 监听筛选条件变化，重置页码
watch([selectedMajorId, searchKeyword], () => {
  currentPage.value = 1
})

// 初始化数据
const loadData = () => {
    departmentApi.getMajorDepartments()
    .then(response => {
      majorDepartments.value = response.data.message.departments
    })
  
  departmentApi.getMinorDepartment()
    .then(response => {
      minorDepartments.value = response.data.message.departments
    })
  // 模拟更多数据以测试分页效果
  useMockData(false)
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
