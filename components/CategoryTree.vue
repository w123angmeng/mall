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
          <!-- 二级分类图片（36*25） -->
          <img 
            v-if="level2.image" 
            :src="level2.image" 
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
              <!-- 三级分类图片（36*25） -->
              <img 
                v-if="level3.image" 
                :src="level3.image" 
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
import { ref } from 'vue';

// 一级分类数据（模拟多数据，触发滚动）
const level1Data = ref([
  { id: 1, name: "无纺布针刺毯" },
  { id: 2, name: "机织过滤布" },
  { id: 3, name: "过滤网带/干网" },
  { id: 4, name: "压榨、污泥脱水类" },
  { id: 5, name: "真空干燥类" },
  { id: 6, name: "物料输送类" },
  { id: 7, name: "脱硫类" },
  { id: 8, name: "透气层布" },
  { id: 9, name: "化纤" },
  { id: 10, name: "分类十型" },
  { id: 11, name: "分类十一型" },
  { id: 12, name: "分类十二型" }
]);

// 三级分类数据：一级→二级→三级（新增图片字段）
const categoryData = ref({
  1: [ // 无纺布针刺毯的二级/三级（带图片）
    {
      id: 11,
      name: "除尘袋",
      image: "/images/level.png", // 图片放public/images目录
      children: [
        { id: 111, name: "MX芳纶系列滤袋", image: "/images/level.png" },
        { id: 112, name: "MX涤纶系列滤袋", image: "/images/level.png" },
        { id: 113, name: "MX丙纶系列滤袋", image: "/images/level.png" },
        { id: 114, name: "MX玻纤系列滤袋", image: "/images/level.png" }
      ]
    },
    {
      id: 12,
      name: "过滤毡",
      image: "/images/level.png",
      children: [
        { id: 121, name: "高温过滤毡", image: "/images/level.png" },
        { id: 122, name: "耐酸碱过滤毡", image: "/images/level.png" }
      ]
    },
    {
      id: 13,
      name: "过滤棉",
      image: "/images/level.png",
      children: [
        { id: 131, name: "初效过滤棉", image: "/images/level.png" },
        { id: 132, name: "中效过滤棉", image: "/images/level.png" },
        { id: 133, name: "高效过滤棉", image: "/images/level.png" }
      ]
    }
  ],
  2: [ // 机织过滤布的二级/三级
    {
      id: 21,
      name: "工业滤布",
      image: "/images/level.png",
      children: [
        { id: 211, name: "高温机织滤布", image: "/images/level3-10.png" },
        { id: 212, name: "耐酸碱机织滤布", image: "/images/level3-11.png" }
      ]
    },
    {
      id: 22,
      name: "食品级滤布",
      image: "/images/level.png",
      children: [
        { id: 221, name: "淀粉过滤布", image: "/images/level.png" },
        { id: 222, name: "果汁过滤布", image: "/images/level.png" },
        { id: 223, name: "食用油过滤布", image: "/images/level.png" }
      ]
    }
  ]
});

// 激活的一级/二级分类ID
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

// 获取二级数据
const getLevel2Data = (level1Id) => {
  return categoryData.value[level1Id] || [];
};

// 获取三级数据
const getLevel3Data = (level2Id) => {
  const targetLevel1 = Object.keys(categoryData.value).find(key => {
    return categoryData.value[key].some(item => item.id === level2Id);
  });
  if (!targetLevel1) return [];
  return categoryData.value[targetLevel1].find(item => item.id === level2Id)?.children || [];
};

// 查看全部按钮点击事件（可扩展跳转逻辑）
const handleViewAll = (type, id) => {
  console.log(`查看全部-${type}`, id);
  // 实际项目可跳转：navigateTo(`/category/${type}/${id}`);
};

// 🔥 修复bug：鼠标离开分类树区域时，清空激活状态，关闭所有面板
const handleSidebarLeave = () => {
  activeLevel1Id.value = null;
  activeLevel2Id.value = null;
};
</script>

<style lang="scss" scoped>
.category-sidebar {
  width: 180px;
  position: relative;
  background-color: #fff;
  height: 400px;
  padding: 12px 0;
  box-sizing: border-box;
  // 🔥 核心1：整体添加轻微好看的阴影（四周柔和阴影）
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border-radius: 4px; // 轻微圆角，搭配阴影更美观
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  overflow: visible; // 确保阴影和二级面板不被截断

  // 1. 一级分类滚动条隐藏但可滚动
  .level1-list {
    list-style: none;
    padding: 0;
    margin: 0;
    height: calc(400px - 24px); // 减去上下padding:12px*2
    max-height: calc(400px - 24px);
    overflow-y: auto;

    // 隐藏滚动条但保留滚动功能
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

  // 2. 二级面板布局（水平展开）
  .level2-panel {
    position: absolute;
    left: 180px; // 与一级面板宽度对齐
    top: 0px; // 匹配一级面板的top padding，视觉对齐
    width: 800px;
    background: #fff;
    // 🔥 核心2：去掉左侧边框，保留其他边框，与一级面板无缝衔接
    // border: 1px solid #eee;
    border-left: none;
    // 🔥 阴影继承整体，无需单独加阴影
    padding: 12px;
    z-index: 90;
    display: flex;
    gap: 20px;
    height: calc(400px); // 与一级列表高度一致，底部对齐
    border-top-right-radius: 4px; // 与整体圆角匹配
    border-bottom-right-radius: 4px;

    // 二级分类列表（最多两行）
    .level2-list {
      width: 200px;
      display: grid;
      grid-template-rows: repeat(auto-fit, minmax(40px, 1fr));
      gap: 8px;
      max-height: 88px; // 两行：40*2 + 8gap = 88
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

        // 二级分类图片（36*25）
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

        // 二级箭头样式
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

    // 3. 三级面板布局
    .level3-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .level3-list-wrap {
        max-height: 88px; // 两行：40*2 + 8gap
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

            // 三级分类图片（36*25）
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

      // 4. 查看全部按钮（严格匹配要求样式）
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

        // 二级查看全部按钮位置调整
        &.level2-view-all {
          margin-top: 10px;
          align-self: flex-start;
        }
      }
    }
  }
}
</style>