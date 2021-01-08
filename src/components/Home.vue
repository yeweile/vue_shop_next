<template>
  <el-container class="home_container">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/1.jpg" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="primary" @click="logout">退出</el-button>
    </el-header>
      <el-container>
        <!-- 侧边 -->
        <el-aside :width="isCollapse?'64px':'200px'">
          <!-- 折叠按钮 -->
          <div class="toggle_button" @click="toggleCollapse">|||</div>
          <!-- 菜单 -->
          <el-menu
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
           >
          <!-- 一级菜单 -->
            <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
              <template slot="title">
               <i :class="iconsObj[item.id]"></i>
               <span>{{item.authName}}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
                <template slot="title">
               <i class="el-icon-menu"></i>
               <span>{{subItem.authName}}</span>
              </template>
              </el-menu-item>
            </el-submenu>
        </el-menu>
      </el-aside>
        <!-- 主体 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
  </el-container>
</template>
<script>
export default {
  data(){
    return{
      // 左侧菜单数据
      menuList:[],
      // 一级菜单图标
      iconsObj:{
        '125':'iconfont icon-user',
        '103':'iconfont icon-showpassword',
        '101':'iconfont icon-shangpin',
        '102':'iconfont icon-danju',
        '145':'iconfont icon-baobiao',
      },
      // 激活的链接
      isCollapse:false,
      // 保存链接的状态
      activePath:''
    }
  },
  created(){
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods:{
    logout(){
      // 清除token
      window.sessionStorage.clear()
      // 编程时导航会登录页面
      this.$router.push('/login')
    },
    // 获取所有的菜单导航数据
    async getMenuList(){
    const {data:res} =  await this.$http.get('menus')
    this.menuList = res.data
    console.log(res)
    
    },
    // 折叠菜单
    toggleCollapse(){
      this.isCollapse = !this.isCollapse;
    },
    // 保存链接的激活状态
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    }
  }
}
</script>
<style lang="less" scoped>
.home_container{
  height: 100%;
}
.el-header{
  background-color:#81C4EF ;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  color: #fff;
  font-size: 20px;
  >div{
    display: flex;
    align-items: center;
    span{
      margin-left: 15px;
    }
    img{
    width: 60px;
    height: 60px;
    border-radius: 50%;
  }
  }
}
.el-aside{
  background-color:#81C4EF ;
  .el-menu{
    border-right: none;
  }
}
.el-main{
  background-color: #FAFA98;
}
.toggle_button{
  background-color: #409EFF;
  text-align: center;
  line-height: 24px;
  color: #fff;
  cursor: pointer;
  letter-spacing: 0.3em;
}
</style>