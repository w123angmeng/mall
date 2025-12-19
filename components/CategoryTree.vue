<template>
  <!-- 🔥 新增容器包裹，统一监听鼠标离开事件 -->
  <aside 
    class="category-sidebar"
    @mouseleave="handleSidebarLeave"
  >
    <!-- 一级分类（滚动条隐藏但可滚动 + 新增padding） -->
    <ul class="level1-list">
      <li 
        v-for="level1 in level1Data" 
        :key="level1.id"
        class="level1-item"
        :class="{ active: activeLevel1Id === level1.id }"
        @mouseenter="openLevel2Panel(level1.id)"
        @click.stop="activeLevel1Id = level1.id"
      >
        {{ level1.name }}
        <span class="arrow-icon">›</span>
      </li>
    </ul>

    <!-- 二级分类面板（水平展开） -->
    <div class="level2-panel" v-if="activeLevel1Id">
      <!-- 二级分类列表（最多两行） -->
      <div class="level2-list">
        <div 
          v-for="level2 in getLevel2Data(activeLevel1Id)" 
          :key="level2.id"
          class="level2-item"
          :class="{ active: activeLevel2Id === level2.id }"
          @mouseenter="openLevel3Panel(level2.id)"
          @click.stop="activeLevel2Id = level2.id"
        >
          <!-- 二级分类图片（36*25）：接口中是icon字段 -->
          <img 
            v-if="level2.icon" 
            :src="level2.icon" 
            alt="二级分类图标" 
            class="category-img level2-img"
          />
          <span class="level2-name">{{ level2.name }}</span>
          <!-- 二级右箭头（原生Unicode） -->
          <span class="level2-arrow">›</span>
        </div>
      </div>

      <!-- 三级分类面板（二级hover时展开） -->
      <div class="level3-panel" v-if="activeLevel2Id">
        <!-- 三级分类列表（最多两行） -->
        <div class="level3-list-wrap">
          <ul class="level3-list">
            <li 
              v-for="(level3, idx) in getLevel3Data(activeLevel2Id).slice(0, 2)" 
              :key="level3.id"
              class="level3-item"
            >
              <!-- 三级分类图片（36*25）：接口中是icon字段 -->
              <img 
                v-if="level3.icon" 
                :src="level3.icon" 
                alt="三级分类图标" 
                class="category-img level3-img"
              />
              <span class="level3-name">{{ level3.name }}</span>
            </li>
          </ul>

          <!-- 三级查看全部按钮（有更多数据时显示） -->
          <button 
            v-if="getLevel3Data(activeLevel2Id).length > 2"
            class="view-all-btn"
            @click="handleViewAll('level3', activeLevel2Id)"
          >
            查看全部
          </button>
        </div>

        <!-- 二级查看全部按钮 -->
        <button 
          class="view-all-btn level2-view-all"
          @click="handleViewAll('level2', activeLevel1Id)"
        >
          查看全部
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAsyncData } from '#imports';
import { getHomeCategoryList } from '@/apis/home';

// ===================== 1. 模拟数据（适配接口嵌套结构：childList） =====================
// 一级分类模拟数据（和接口结构一致）
const defaultLevel1Data = [
  {
    id: "1991424976001814529",
    name: "无纺布针刺毯",
    level: 1,
    childList: [ // 二级分类
      {
        id: "1993502427078336513",
        name: "除尘袋",
        level: 2,
        icon: "/images/level.png",
        childList: [ // 三级分类
          { id: "1993502427078336514", name: "MX芳纶系列滤袋", level: 3, icon: "/images/level.png" },
          { id: "1993502427078336515", name: "MX涤纶系列滤袋", level: 3, icon: "/images/level.png" },
          { id: "1993502427078336516", name: "MX丙纶系列滤袋", level: 3, icon: "/images/level.png" }
        ]
      },
      {
        id: "1993502427078336517",
        name: "过滤毡",
        level: 2,
        icon: "/images/level.png",
        childList: [
          { id: "1993502427078336518", name: "高温过滤毡", level: 3, icon: "/images/level.png" },
          { id: "1993502427078336519", name: "耐酸碱过滤毡", level: 3, icon: "/images/level.png" }
        ]
      }
    ]
  },
  {
    id: "1991424976001814530",
    name: "机织过滤布",
    level: 1,
    childList: [
      {
        id: "1993502427078336520",
        name: "工业滤布",
        level: 2,
        icon: "/images/level.png",
        childList: [
          { id: "1993502427078336521", name: "高温机织滤布", level: 3, icon: "/images/level3-10.png" },
          { id: "1993502427078336522", name: "耐酸碱机织滤布", level: 3, icon: "/images/level3-11.png" }
        ]
      }
    ]
  },
  { id: "1991424976001814531", name: "过滤网带/干网", level: 1, childList: [] },
  { id: "1991424976001814532", name: "压榨、污泥脱水类", level: 1, childList: [] },
  { id: "1991424976001814533", name: "真空干燥类", level: 1, childList: [] },
  { id: "1991424976001814534", name: "物料输送类", level: 1, childList: [] },
  { id: "1991424976001814535", name: "脱硫类", level: 1, childList: [] },
  { id: "1991424976001814536", name: "透气层布", level: 1, childList: [] },
  { id: "1991424976001814537", name: "化纤", level: 1, childList: [] },
  { id: "1991424976001814538", name: "分类十型", level: 1, childList: [] },
  { id: "1991424976001814539", name: "分类十一型", level: 1, childList: [] },
  { id: "1991424976001814540", name: "分类十二型", level: 1, childList: [] }
];

// ===================== 2. 调用接口获取分类数据（适配新结构） =====================
const { data: categoryRes } = useAsyncData('homeCategory', () => getHomeCategoryList(), {
  transform: (res) => {
    console.log('------分类接口返回：', res);
    // 接口数据校验：code=200 且 data是数组且有数据
    if (res?.code === 200 && Array.isArray(res.data) && res.data.length) {
      // 直接返回接口的一级分类数组（自带childList嵌套）
      return res.data;
    }
    // 接口无有效数据，返回模拟数据
    return defaultLevel1Data;
  },
  server: false // 调试阶段强制客户端请求，生产可改回true
});

// ===================== 3. 响应式数据处理 =====================
// 一级分类数据（优先接口，兜底模拟）
const level1Data = computed(() => {
  return categoryRes.value || defaultLevel1Data;
});

// ===================== 4. 重构二级/三级数据获取逻辑（从childList查找） =====================
// 激活的一级/二级分类ID（注意接口中id是字符串，需保持类型一致）
const activeLevel1Id = ref(null);
const activeLevel2Id = ref(null);

// 打开二级面板
const openLevel2Panel = (id) => {
  activeLevel1Id.value = id;
  activeLevel2Id.value = null; // 重置二级激活状态
};

// 打开三级面板（二级hover时）
const openLevel3Panel = (id) => {
  activeLevel2Id.value = id;
};

// 获取二级数据：根据一级ID查找对应的childList
const getLevel2Data = (level1Id) => {
  // 找到当前一级分类
  const currentLevel1 = level1Data.value.find(item => item.id === level1Id);
  // 返回二级分类数组（兜底空数组）
  return currentLevel1?.childList || [];
};

// 获取三级数据：先找一级→再找二级→返回二级的childList
const getLevel3Data = (level2Id) => {
  // 遍历所有一级分类，找到包含当前二级ID的一级分类
  let targetLevel2 = null;
  for (const level1 of level1Data) {
    targetLevel2 = level1.childList.find(item => item.id === level2Id);
    if (targetLevel2) break;
  }
  // 返回三级分类数组（兜底空数组）
  return targetLevel2?.childList || [];
};

// ===================== 5. 原有交互逻辑（保留） =====================
// 查看全部按钮点击事件（可扩展跳转逻辑）
const handleViewAll = (type, id) => {
  console.log(`查看全部-${type}`, id);
  // 实际项目可跳转：navigateTo(`/category/${type}/${id}`);
};

// 鼠标离开分类树区域时，清空激活状态
const handleSidebarLeave = () => {
  activeLevel1Id.value = null;
  activeLevel2Id.value = null;
};
</script>

<style lang="scss" scoped>
/* 样式部分完全不变，复用原有样式 */
.category-sidebar {
  width: 180px;
  position: relative;
  background-color: #fff;
  height: 400px;
  padding: 12px 0;
  box-sizing: border-box;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  overflow: visible;

  .level1-list {
    list-style: none;
    padding: 0;
    margin: 0;
    height: calc(400px - 24px);
    max-height: calc(400px - 24px);
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;

    .level1-item {
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
      font-size: 14px;
      color: #666;
      cursor: pointer;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .arrow-icon {
        color: #999;
        font-size: 16px;
        font-weight: bold;
        transition: color 0.2s;
      }

      &:hover, &.active {
        background: #f8f9fa;
        color: #3799AE;
        .arrow-icon {
          color: #3799AE;
        }
      }
    }
  }

  .level2-panel {
    position: absolute;
    left: 180px;
    top: 0px;
    width: 800px;
    background: #fff;
    border-left: none;
    padding: 12px;
    z-index: 90;
    display: flex;
    gap: 20px;
    height: calc(400px);
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;

    .level2-list {
      width: 200px;
      display: grid;
      grid-template-rows: repeat(auto-fit, minmax(40px, 1fr));
      gap: 8px;
      max-height: 88px;
      overflow: hidden;

      .level2-item {
        height: 40px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 10px;
        border-radius: 4px;
        cursor: pointer;
        position: relative;

        .level2-img {
          width: 36px;
          height: 25px;
          object-fit: contain;
        }

        .level2-name {
          font-size: 14px;
          color: #666;
          flex: 1;
        }

        .level2-arrow {
          font-size: 14px;
          font-weight: bold;
          color: #999;
          transition: color 0.2s;
        }

        &:hover, &.active {
          background: #f8f9fa;
          .level2-name {
            color: #3799AE;
          }
          .level2-arrow {
            color: #3799AE;
          }
        }
      }
    }

    .level3-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .level3-list-wrap {
        max-height: 88px;
        overflow: hidden;

        .level3-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-rows: repeat(auto-fit, minmax(40px, 1fr));
          gap: 8px;

          .level3-item {
            height: 40px;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0 10px;
            cursor: pointer;

            .level3-img {
              width: 36px;
              height: 25px;
              object-fit: contain;
            }

            .level3-name {
              font-size: 12px;
              color: #666;
            }

            &:hover {
              .level3-name {
                color: #3799AE;
              }
            }
          }
        }
      }

      .view-all-btn {
        width: 151px;
        height: 42px;
        border-radius: 4px;
        opacity: 1;
        box-sizing: border-box;
        border: 1px solid #E1F5F9;
        background: #fff;
        color: #3799AE;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #E1F5F9;
          color: #2d8094;
        }

        &.level2-view-all {
          margin-top: 10px;
          align-self: flex-start;
        }
      }
    }
  }
}
</style>