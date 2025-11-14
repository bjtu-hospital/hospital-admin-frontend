<template>
  <div class="space-y-4">
    <!-- 顶部操作栏 -->
    <div class="bg-card rounded-lg border border-border p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <!-- 用户类型切换 -->
          <div class="flex items-center gap-2">
            <button
              @click="userType = 'high_risk'"
              :class="[
                'px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2',
                userType === 'high_risk'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-accent/50 text-foreground/70 hover:bg-accent hover:text-foreground'
              ]"
            >
              <AlertTriangle class="w-4 h-4" />
              高风险用户
              <span v-if="userType === 'high_risk'" class="px-2 py-0.5 bg-white/20 rounded text-xs">
                {{ pagination.total }}
              </span>
            </button>
            <button
              @click="userType = 'normal'"
              :class="[
                'px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2',
                userType === 'normal'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-accent/50 text-foreground/70 hover:bg-accent hover:text-foreground'
              ]"
            >
              <User class="w-4 h-4" />
              正常用户
              <span v-if="userType === 'normal'" class="px-2 py-0.5 bg-white/20 rounded text-xs">
                {{ pagination.total }}
              </span>
            </button>
            <button
              @click="userType = 'banned'"
              :class="[
                'px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2',
                userType === 'banned'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-accent/50 text-foreground/70 hover:bg-accent hover:text-foreground'
              ]"
            >
              <Lock class="w-4 h-4" />
              已封禁用户
              <span v-if="userType === 'banned'" class="px-2 py-0.5 bg-white/20 rounded text-xs">
                {{ pagination.total }}
              </span>
            </button>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="flex items-center gap-6 text-sm text-muted-foreground">
          <div class="flex items-center gap-2">
            <Shield class="w-4 h-4" />
            <span>总用户数：<strong class="text-foreground">{{ pagination.total }}</strong></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted/50 border-b border-border">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                用户信息
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                风险等级
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                风险评分
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                封禁状态
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                封禁到期
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border bg-card">
            <tr v-if="isLoading">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="flex items-center justify-center gap-2 text-muted-foreground">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span>加载中...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-muted-foreground">
                暂无用户数据
              </td>
            </tr>
            <tr 
              v-else
              v-for="user in users" 
              :key="user.user_id"
              @click="openDetailDialog(user)"
              class="hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <!-- 用户信息 -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User class="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div class="font-medium text-foreground">{{ user.name }}</div>
                    <div class="text-xs text-muted-foreground">{{ user.phone }}</div>
                    <div class="text-xs text-muted-foreground">ID: {{ user.user_id }}</div>
                  </div>
                </div>
              </td>

              <!-- 风险等级 -->
              <td class="px-6 py-4">
                <div 
                  :class="[
                    'inline-block px-3 py-1 rounded-md text-xs font-medium',
                    user.risk_level === '高危' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    user.risk_level === '中危' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  ]"
                >
                  {{ user.risk_level }}
                </div>
              </td>

              <!-- 风险评分 -->
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-foreground">
                  <span v-if="user.risk_score !== null && user.risk_score !== undefined">
                    {{ user.risk_score }}
                  </span>
                  <span v-else class="text-muted-foreground">-</span>
                </div>
              </td>

              <!-- 封禁状态 -->
              <td class="px-6 py-4">
                <div class="space-y-1">
                  <div 
                    :class="[
                      'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
                      user.ban_status === '未封禁' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      user.ban_status === '禁止挂号' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      user.ban_status === '禁止登录' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    ]"
                  >
                    <Lock v-if="user.ban_status !== '未封禁'" class="w-3 h-3" />
                    {{ user.ban_status }}
                  </div>
                </div>
              </td>

              <!-- 封禁到期 -->
              <td class="px-6 py-4">
                <div class="text-sm text-muted-foreground">
                  {{ user.ban_status === '未封禁' ? '-' : (user.ban_end_time ? formatDate(user.ban_end_time) : '永久') }}
                </div>
              </td>

              <!-- 操作 -->
              <td class="px-6 py-4" @click.stop>
                <button
                  @click="openBanDialog(user)"
                  class="px-4 py-2 text-xs font-medium rounded-md shadow-sm transition-colors"
                  :class="user.ban_status === '未封禁' 
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'"
                >
                  {{ user.ban_status === '未封禁' ? '封禁用户' : '解除封禁' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="px-6 py-4 border-t border-border bg-muted/30">
        <div class="flex items-center justify-between">
          <div class="text-sm text-muted-foreground">
            显示第 {{ (pagination.page - 1) * pagination.pageSize + 1 }} 到 
            {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} 条，
            共 {{ pagination.total }} 条
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>
            <div class="flex items-center gap-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="changePage(page)"
                :class="[
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  page === pagination.page
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-accent border border-border'
                ]"
              >
                {{ page }}
              </button>
            </div>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page === pagination.totalPages"
              class="px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户详情对话框 -->
    <Teleport to="body">
      <div
        v-if="showDetailDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-card rounded-lg border border-border shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
          <!-- 标题栏 -->
          <div class="bg-card border-b border-border p-6 flex items-center justify-between flex-shrink-0">
            <h3 class="text-xl font-semibold text-foreground">用户详情</h3>
            <button
              @click="closeDetailDialog"
              class="p-2 hover:bg-accent rounded-md transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- 内容 - 可滚动 -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- 用户基本信息 -->
            <div class="p-4 bg-muted/50 rounded-md">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User class="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div class="text-lg font-medium text-foreground">{{ selectedDetailUser?.name }}</div>
                  <div class="text-sm text-muted-foreground">{{ selectedDetailUser?.phone }}</div>
                  <div class="text-xs text-muted-foreground">用户ID: {{ selectedDetailUser?.user_id }}</div>
                </div>
              </div>
            </div>

            <!-- 风险等级 -->
            <div>
              <h4 class="text-sm font-medium text-foreground mb-2">风险等级</h4>
              <div class="flex items-center gap-3">
                <div 
                  :class="[
                    'px-4 py-2 rounded-md text-sm font-medium',
                    selectedDetailUser?.risk_level === '高危' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    selectedDetailUser?.risk_level === '中危' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  ]"
                >
                  {{ selectedDetailUser?.risk_level }}
                </div>
              </div>
            </div>

            <!-- 风险评分 -->
            <div>
              <h4 class="text-sm font-medium text-foreground mb-2">风险评分</h4>
              <div class="text-lg font-semibold text-foreground">
                <span v-if="selectedDetailUser?.risk_score !== null && selectedDetailUser?.risk_score !== undefined">
                  {{ selectedDetailUser?.risk_score }} 分
                </span>
                <span v-else class="text-muted-foreground text-sm font-normal">暂无评分</span>
              </div>
            </div>

            <!-- 封禁状态 -->
            <div>
              <h4 class="text-sm font-medium text-foreground mb-2">封禁状态</h4>
              <div class="space-y-2">
                <div 
                  :class="[
                    'inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium',
                    selectedDetailUser?.ban_status === '未封禁' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    selectedDetailUser?.ban_status === '禁止挂号' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    selectedDetailUser?.ban_status === '禁止登录' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  ]"
                >
                  <Lock v-if="selectedDetailUser?.ban_status !== '未封禁'" class="w-4 h-4" />
                  {{ selectedDetailUser?.ban_status }}
                </div>
              </div>
            </div>

            <!-- 封禁时间 -->
            <div v-if="selectedDetailUser?.ban_end_time">
              <h4 class="text-sm font-medium text-foreground mb-2">封禁时间</h4>
              <div class="text-sm text-muted-foreground">
                {{ formatDate(selectedDetailUser?.ban_end_time) }}
              </div>
            </div>
            <div v-else>
              <h4 class="text-sm font-medium text-foreground mb-2">封禁时间</h4>
              <div class="text-sm text-muted-foreground">-</div>
            </div>

            <!-- 封禁天数 -->
            <div v-if="selectedDetailUser?.ban_status !== '未封禁'">
              <h4 class="text-sm font-medium text-foreground mb-2">封禁天数</h4>
              <div class="text-sm text-muted-foreground">
                {{ getBanDaysText(selectedDetailUser) }}
              </div>
            </div>

            <!-- 行为统计 -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-medium text-foreground">行为统计</h4>
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-muted-foreground">时段:</span>
                  <select
                    v-model="statsRange"
                    class="px-2 py-1 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="7">近7天</option>
                    <option value="30">近30天</option>
                    <option value="90">近90天</option>
                    <option value="180">近180天</option>
                    <option value="all">全部</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="p-3 bg-background border border-border rounded-md">
                  <div class="flex items-center gap-2 mb-1">
                    <Calendar class="w-4 h-4 text-primary" />
                    <span class="text-xs text-muted-foreground">挂号次数</span>
                  </div>
                  <div class="text-2xl font-semibold text-foreground">{{ stats.register_count }}</div>
                </div>
                <div class="p-3 bg-background border border-border rounded-md">
                  <div class="flex items-center gap-2 mb-1">
                    <XCircle class="w-4 h-4 text-orange-500" />
                    <span class="text-xs text-muted-foreground">取消次数</span>
                  </div>
                  <div class="text-2xl font-semibold text-foreground">{{ stats.cancel_count }}</div>
                </div>
              </div>
            </div>

            <!-- 最后活跃时间 -->
            <div>
              <h4 class="text-sm font-medium text-foreground mb-2">最后活跃时间</h4>
              <div class="text-sm text-muted-foreground">
                {{ formatDate(selectedDetailUser?.last_active) }}
                <span class="text-xs ml-2">({{ formatRelativeTime(selectedDetailUser?.last_active) }})</span>
              </div>
            </div>

            <!-- 备注信息 -->
            <div>
              <h4 class="text-sm font-medium text-foreground mb-2">备注信息</h4>
              <div class="p-3 bg-background border border-border rounded-md text-sm text-muted-foreground">
                {{ selectedDetailUser?.risk_reason || '暂无备注' }}
              </div>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="border-t border-border p-6 flex justify-end gap-3 flex-shrink-0">
            <button
              @click="closeDetailDialog"
              class="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors font-medium"
            >
              关闭
            </button>
            <button
              @click="openBanDialogFromDetail"
              class="px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
              :class="selectedDetailUser?.ban_status === '未封禁'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'"
            >
              {{ selectedDetailUser?.ban_status === '未封禁' ? '封禁用户' : '解除封禁' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 封禁对话框 -->
    <Teleport to="body">
      <div
        v-if="showBanDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-card rounded-lg border border-border shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
          <!-- 标题栏 -->
          <div class="bg-card border-b border-border p-6 flex items-center justify-between flex-shrink-0">
            <h3 class="text-xl font-semibold text-foreground">
              {{ selectedUser?.ban_status === '未封禁' ? '封禁用户' : '解除封禁' }}
            </h3>
            <button
              @click="closeBanDialog"
              class="p-2 hover:bg-accent rounded-md transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- 内容 - 可滚动 -->
          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            <!-- 用户信息 -->
            <div class="p-4 bg-muted/50 rounded-md">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div class="font-medium text-foreground">{{ selectedUser?.name }}</div>
                  <div class="text-sm text-muted-foreground">{{ selectedUser?.phone }}</div>
                </div>
              </div>
            </div>

            <!-- 解除封禁 -->
            <div v-if="selectedUser?.ban_status !== '未封禁'" class="text-center py-4">
              <p class="text-muted-foreground">确认要解除该用户的封禁状态吗？</p>
            </div>

            <!-- 封禁设置 -->
            <div v-else class="space-y-4">
              <!-- 封禁类型 -->
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">封禁类型 *</label>
                <div class="space-y-2">
                  <label class="flex items-center gap-2 p-3 border border-border rounded-md cursor-pointer hover:bg-accent/50 transition-colors">
                    <input
                      v-model="banForm.ban_type"
                      type="radio"
                      value="register"
                      class="w-4 h-4 text-primary focus:ring-0 focus:outline-none accent-primary"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-foreground">禁止挂号</div>
                      <div class="text-xs text-muted-foreground">用户无法进行挂号操作</div>
                    </div>
                  </label>
                  <label class="flex items-center gap-2 p-3 border border-border rounded-md cursor-pointer hover:bg-accent/50 transition-colors">
                    <input
                      v-model="banForm.ban_type"
                      type="radio"
                      value="login"
                      class="w-4 h-4 text-primary focus:ring-0 focus:outline-none accent-primary"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-foreground">禁止登录</div>
                      <div class="text-xs text-muted-foreground">用户无法登录系统</div>
                    </div>
                  </label>
                  <label class="flex items-center gap-2 p-3 border border-border rounded-md cursor-pointer hover:bg-accent/50 transition-colors">
                    <input
                      v-model="banForm.ban_type"
                      type="radio"
                      value="all"
                      class="w-4 h-4 text-primary focus:ring-0 focus:outline-none accent-primary"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-foreground">完全封禁</div>
                      <div class="text-xs text-muted-foreground">禁止登录和挂号</div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- 封禁时长 -->
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">封禁时长 *</label>
                <select
                  v-model="banForm.duration_days"
                  class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option :value="1">1天</option>
                  <option :value="3">3天</option>
                  <option :value="7">7天</option>
                  <option :value="15">15天</option>
                  <option :value="30">30天</option>
                  <option :value="90">90天</option>
                  <option :value="0">永久</option>
                </select>
              </div>

              <!-- 封禁原因 -->
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">
                  封禁原因 *
                  <span class="text-xs text-muted-foreground ml-2">
                    (至少 10 个字符，当前 {{ banForm.reason.length }} 个)
                  </span>
                </label>
                <textarea
                  v-model="banForm.reason"
                  rows="3"
                  placeholder="请输入封禁原因（至少10个字符）"
                  class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  :class="banForm.reason.length > 0 && banForm.reason.length < 10 ? 'border-red-500' : ''"
                ></textarea>
                <p v-if="banForm.reason.length > 0 && banForm.reason.length < 10" class="text-xs text-red-500 mt-1">
                  封禁原因至少需要 10 个字符
                </p>
              </div>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="border-t border-border p-6 flex justify-end gap-3 flex-shrink-0">
            <button
              @click="closeBanDialog"
              class="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors font-medium"
            >
              取消
            </button>
            <button
              @click="handleBanAction"
              :disabled="isSubmitting || (selectedUser?.ban_status === '未封禁' && banForm.reason.length < 10)"
              :class="[
                'px-4 py-2 rounded-md font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
                selectedUser?.ban_status === '未封禁'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              ]"
            >
              {{ isSubmitting ? '处理中...' : selectedUser?.ban_status === '未封禁' ? '确认封禁' : '确认解除' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { User, Shield, AlertTriangle, Lock, Calendar, XCircle, X } from 'lucide-vue-next'
import { getUsers, banUser, unbanUser, getUserStats } from '@/api/antiBot'
import { useToast } from '@/utils/toast'

const { success, error } = useToast()

// 用户类型
const userType = ref('high_risk') // 'high_risk' | 'normal' | 'banned'

// 用户列表
const users = ref([])
const isLoading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})

// 详情对话框
const showDetailDialog = ref(false)
const selectedDetailUser = ref(null)
const statsRange = ref('30') // 7 | 30 | 90 | 180 | all
const stats = reactive({ register_count: 0, cancel_count: 0 })

// 封禁对话框
const showBanDialog = ref(false)
const selectedUser = ref(null)
const isSubmitting = ref(false)
const banForm = reactive({
  ban_type: 'register',
  duration_days: 7,
  reason: ''
})

// 将后端的 risk_level 转换为中文
const formatRiskLevel = (level) => {
  if (!level) return '暂无评级'
  const upperLevel = level.toUpperCase()
  const map = { 'HIGH': '高危', 'MEDIUM': '中危', 'LOW': '低危' }
  return map[upperLevel] || '暂无评级'
}

// 将后端的 banned 和 ban_type 转换为 ban_status
const formatBanStatus = (banned, ban_type) => {
  if (!banned || !ban_type) return '未封禁'
  const map = { 'register': '禁止挂号', 'login': '禁止登录', 'all': '完全封禁' }
  return map[ban_type] || '未封禁'
}

// 加载用户列表
const loadUsers = async () => {
  isLoading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.pageSize
    }
    
    // 根据用户类型设置筛选条件
    if (userType.value === 'high_risk') {
      params.user_type = 'high'
    } else if (userType.value === 'normal') {
      params.user_type = 'normal'
    } else if (userType.value === 'banned') {
      params.user_type = 'banned'
    }
    
    console.log('[AntiBot] 请求参数:', params)
    const response = await getUsers(params)
    console.log('[AntiBot] 原始响应:', response)
    console.log('[AntiBot] 响应 code:', response.code)
    console.log('[AntiBot] 响应 message:', response.message)

    if (response.code === 0) {
      // 转换后端数据格式为前端需要的格式
      const rawUsers = response.message.users || []
      console.log('[AntiBot] 原始用户数据:', rawUsers)
      users.value = rawUsers.map(user => ({
        user_id: user.user_id,
        name: user.username, // 使用 username 作为 name
        phone: user.username, // 暂时使用 username，后端可能需要提供真实的 phone
        risk_level: formatRiskLevel(user.risk_level),
        risk_score: user.risk_score, // 保留风险评分
        ban_status: formatBanStatus(user.banned, user.ban_type),
        ban_end_time: user.ban_until,
        last_active: new Date().toISOString(), // 后端未提供，使用当前时间
        risk_reason: '系统检测', // 后端未提供
        // 保留原始数据
        _raw: user
      }))
      console.log('[AntiBot] 转换后的用户数据:', users.value)
      pagination.total = response.message.total || 0
      pagination.totalPages = response.message.page_size ? Math.ceil(response.message.total / response.message.page_size) : 0
      console.log('[AntiBot] 分页信息:', { total: pagination.total, totalPages: pagination.totalPages })
      console.log('[AntiBot] ✅ 用户列表加载成功')
    } else {
      console.error('[AntiBot] ❌ 响应 code 不为 0:', response.code, response.message)
      error('加载用户列表失败')
    }
  } catch (err) {
    console.error('[AntiBot] ❌ 加载用户列表异常:', err)
    console.error('[AntiBot] 错误堆栈:', err.stack)
    error('加载用户列表失败')
  } finally {
    isLoading.value = false
  }
}

// 切换页码
const changePage = (page) => {
  if (page < 1 || page > pagination.totalPages) return
  pagination.page = page
  loadUsers()
}

// 可见页码
const visiblePages = computed(() => {
  const pages = []
  const total = pagination.totalPages
  const current = pagination.page
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages.filter(p => p !== '...')
})

// 打开详情对话框
const openDetailDialog = (user) => {
  selectedDetailUser.value = user
  showDetailDialog.value = true
  // 初次加载统计
  loadUserStats()
}

// 关闭详情对话框
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedDetailUser.value = null
  stats.register_count = 0
  stats.cancel_count = 0
}

// 从详情对话框打开封禁对话框
const openBanDialogFromDetail = () => {
  selectedUser.value = selectedDetailUser.value
  banForm.ban_type = 'register'
  banForm.duration_days = 7
  banForm.reason = ''
  closeDetailDialog()
  showBanDialog.value = true
}

// 打开封禁对话框
const openBanDialog = (user) => {
  selectedUser.value = user
  banForm.ban_type = 'register'
  banForm.duration_days = 7
  banForm.reason = ''
  showBanDialog.value = true
}

// 关闭封禁对话框
const closeBanDialog = () => {
  showBanDialog.value = false
  selectedUser.value = null
}

// 处理封禁/解封操作
const handleBanAction = async () => {
  if (!selectedUser.value) return

  // 封禁时验证原因长度
  if (selectedUser.value.ban_status === '未封禁') {
    if (!banForm.reason || banForm.reason.trim().length < 10) {
      error('封禁原因至少需要 10 个字符')
      return
    }
  }

  isSubmitting.value = true
  try {
    if (selectedUser.value.ban_status === '未封禁') {
      // 执行封禁
      const response = await banUser(selectedUser.value.user_id, {
        ban_type: banForm.ban_type,
        duration_days: banForm.duration_days,
        reason: banForm.reason
      })

      if (response.code === 0) {
        success('封禁成功')
        closeBanDialog()
        loadUsers()
      } else {
        error(response.message || '封禁失败')
      }
    } else {
      // 执行解封
      const response = await unbanUser(selectedUser.value.user_id, {
        reason: '管理员解封'
      })

      if (response.code === 0) {
        success('解除封禁成功')
        closeBanDialog()
        loadUsers()
      } else {
        error(response.message || '解除封禁失败')
      }
    }
  } catch (err) {
    console.error('Ban action error:', err)
    error('操作失败')
  } finally {
    isSubmitting.value = false
  }
}

// 加载用户某时段统计
const loadUserStats = async () => {
  if (!selectedDetailUser.value) return
  const daysMap = { '7': 7, '30': 30, '90': 90, '180': 180 }
  let start_date = undefined
  let end_date = new Date().toISOString()
  if (statsRange.value !== 'all') {
    const days = daysMap[statsRange.value] ?? 30
    const start = new Date()
    start.setDate(start.getDate() - days)
    start_date = start.toISOString()
  }
  try {
    const res = await getUserStats({ user_id: selectedDetailUser.value.user_id, start_date, end_date })
    if (res.code === 0) {
      stats.register_count = res.message.register_count
      stats.cancel_count = res.message.cancel_count
    }
  } catch (_) {}
}

watch(statsRange, () => {
  loadUserStats()
})

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化相对时间
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

// 计算封禁天数（剩余天数或永久）
const getBanDaysText = (user) => {
  if (!user || user.ban_status === '未封禁') return '-'
  if (!user.ban_end_time) return '永久'
  const end = new Date(user.ban_end_time).getTime()
  const now = Date.now()
  const diff = Math.max(0, end - now)
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return `${days}天`
}

// 监听用户类型变化
watch(userType, () => {
  pagination.page = 1
  loadUsers()
})

// 初始加载
loadUsers()
</script>
